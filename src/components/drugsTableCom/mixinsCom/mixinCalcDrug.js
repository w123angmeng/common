export const mixinCalcDrug = {
    data(){
        return {
            pharmacyList: [],  //药房列表
            idStorage: '',    //药房id
            immediatelyId: [],
           
            passFlag: 0,

            checkDrugParams: {
                insuranceFlag: "",
                icno: "",
                idOrdersTemplate: "",
                idPat: "",
                idVisit: "",
                sdScene: "",
            },
            toSelfPayIdList: [],     //需要转自费的数据
            toImmediatelyIdList: [], //需要转小剂量的数据
           
        }   
    },
    computed: {
        idStorageParmas() {
            let params = {
                // sdStorageType: "", //库房类型
                sdStorageType: this.CONSTANT.DRUG_STORAGE_TYPE, //库房类型 原来 ‘’
                idDept: this.userParmas.idDept,
                visitOpIndicator: 1, //1门诊
                visitIpIndicator: '', //1住院
            };
            if(!this.isFromOutp) {
                params.idDept = this.docPatientParams.idDeptAdmit;
                params.visitOpIndicator = ''; //1门诊
                params.visitIpIndicator = 1;  //1住院
            }
            return params;
        },
        isHighDrugType() {
            return 'H'
        },
        isHighDrugTips() {
            let tips;
            let filterHighs = this.tableData.filter( item => item.currDrugsDetails.sdToxiType === this.isHighDrugType)
            tips = filterHighs.map( v => v.clinicItemName).join('、');
            return tips
        },
    },
    methods: {
        //是否即刻
        chargeFreq(list) {
            this.immediatelyId = list || [];
        },
        //单次用量最大
        maxDoseRow(row) {
             //出院带药不超过10000， 其余不超过5位数
            // if(row.dischargeMedicationIndicator == 1) return 9999
            return 99999
        },

        //用法
        async initUsageOptions() {
            let arr = await this.selectRoute();
            let obj = {};
            arr.forEach((item) => {
                obj[item.idRoute] = item;
            });
            this.routeNameObj = obj;
        },

         //查药房列表
        listReStorageSelect() {
            let ajaxUrl = "hispres/restorage/listReStorageSelectForIndicator";
            return this.$axios.get(ajaxUrl, this.idStorageParmas).then(resData=>{
                if (resData.success) {
                    this.pharmacyList = resData.data;
                    if (resData.data.length > 0 )  this.idStorage = resData.data[0].idStorage
                } else {
                    this.$message({
                        type: "warning",
                        message: resData.message,
                    });
                }
            })
        },
        //校验医嘱费别价格
        async checkChargeTypeAsync() {
            let priceArr = {};
            let committable = this.copyObject(this.tableData);
            if(!committable.length)  return false
            
            committable.map( (row, i) => {
                row.isChargeTypePriceDesc = 1;
                //造影剂项目id 是 idClinicItemSon
                let idClinicItem = row.idClinicItem || row.idClinicItemSon;
                if(idClinicItem){
                    priceArr[idClinicItem] = this.chargeTypeCode
                }
            })
            if(!Object.keys(priceArr).length) return false;

            let res = await this.$axios._post("/dict/clinicItem/listPricesByIdClinicItems", priceArr);
            if (res.success) {
                return res.data;
            } else {
                this.$message.warning(res.message);
                return false
            }
        },

         //校验医嘱费别价格
        async getCheckChargeTypePrice() {

            let resData = await this.checkChargeTypeAsync();
            if(!resData) return false
            this.$forceUpdate();
            if(Object.keys(resData).length) {
                for( let k in resData ){
                    this.tableData.map( row => {
                        if(row.idClinicItem === k) {
                            //如果每一条医嘱的价格 为0 默认不选中  价格为空或null默认选中
                            let isChargeTypePriceDesc = resData[k] === null ||  resData[k] === '' ? 1 :  Number(resData[k]);
                            this.$set(row, "isChargeTypePriceDesc", isChargeTypePriceDesc);
                            // this.$refs.tableData.toggleRowSelection(v,!!Number(resData[k]));
                        }
                    })
                }
                
            }
        },

        //库存校验 、医保校验
        async isCheckAllOrders(index, row) {
            // await this.getDrugsDetails(index, row)
                        
            this.checkDrugStock(index, row);

            // 门诊高警示药品提示
            if(index === this.tableData.length -1) {
                this.showHighWarning();
            }
        },

        //门诊高警示药品提示
        showHighWarning() {
            //阿特蒙门诊 --造影剂 校验高警示药品
            if(this.isFromOutp && this.isAtmeng && this.isFromAgent && this.isHighDrugTips) {
                this.$alert(`【${this.isHighDrugTips}】属于高警示药品！`, {
                    confirmButtonText: '确定',
                    callback: action => {}
                });
            }
        },

        //校验库存
        checkDrugStock(index, row, totalChange) {
            if (!this.isDrugType(row)) return false
            let stockParam;
            //当前是中药 && 数量发生变化时候要反算一个整方的库存
            if(this.isHerBalDrug(row) && totalChange) {
               this.checkHerBalAllDrugs(index, row);
            } else {
                 //药品库存校验参数
                stockParam = {
                    insuranceIndicator: "",
                    totalAmount: row.totalAmount || row.amount,
                    totalAmountUnit: row.sdUnitStr,
                    ...row
                }
                this.showTipMessages(stockParam);
            }
            
            //门诊医保需要校验 药品医保天数校验
            if(this.isFromOutp && this.isInsurePat && this.isWestDrug(row)) {
                this.getCheckDrugDaysValid(row)
            }
        },
        // 中药整方库存校验
        checkHerBalAllDrugs(index, row) {
            let someHerbal = this.tableData.filter( v => v.orderGroupCode === row.orderGroupCode)
            someHerbal.map( v => {
                let itmObj = {
                    insuranceIndicator: "",
                    totalAmount: v.totalAmount || v.amount,
                    totalAmountUnit: v.sdUnitStr,
                    ...v
                }
                this.showTipMessages(itmObj);
            })
        },

        //单次用量
        doseChange(val, index, row) {
            row.dose = val;
            this.totalAmountChange(row.totalAmount, index, row, true);
        },
        //计算天数 or 数量 参数
        drugTotalChangeParmas(row, isCalcTotal) {
            let parmas = {
                total: row.totalAmount, //总量
                once: row.dose, //用量
                sellUnitOp: row.sdUnit || row.sdUnitStr, //门诊销售单位
                idClinicItem: row.idClinicItem,
                days: row.planDays, //开立天数
                freqCounter: eval(row.curFreqObj.freqCounter), //转换系数
                factorUnits: eval(row.curFreqObj.factorUnits), //频次次数
                freqInterval: eval(row.curFreqObj.freqInterval), // 频次间隔 
                factorDoseDrugForm: eval(row.currDrugsDetails.factorDoseDrugForm),   //换算系数剂量剂型 - 盒
                factorDrugFormStock: eval(row.currDrugsDetails.factorDrugFormStock), //换算系数剂型包装 , -片
                stockUnit: row.currDrugsDetails.stockUnit,  //药品库存单位
                sdDrugFormUnit: row.currDrugsDetails.drugFormUnit, //剂型单位
                sdDrugForm: row.currDrugsDetails.sdDrugForm, //剂型
                doseDefault: row.currDrugsDetails.doseDefault,//默认剂量
                unitState: row.sdUnit == row.currDrugsDetails.stockUnit ? false : true
            }
            if(this.isFromCopy) {
                parmas.sellUnitOp = row.totalAmountUnit || row.sdUnit || row.sdUnitStr;
                parmas.unitState = row.sdUnit == row.currDrugsDetails.stockUnit
            }
            //如果要计算总量  删除参数总量   ----   如果要计算天数  删除参数天数
            isCalcTotal ? delete parmas.total : delete parmas.days;
            console.log(parmas);
            return parmas
        },

         //计算数量/天数
        async totalChangeFn(row, isCalcTotal) {
            if(!row.currDrugsDetails.idClinicItem) {
                console.log("获取药品信息失败-----");
                return
            }
            // 成组频次修改时，批量计算总量
            if(isCalcTotal && row.orderGroupCode){
                this.orderGroupCodeObj[row.orderGroupCode].forEach((v,i)=>{
                   return this.handlerCalculation(v, isCalcTotal);
                })
                return;
            }
            return this.handlerCalculation(row,isCalcTotal);
        },
        // 计算总量，天数
        async handlerCalculation(currRow,isCalcTotal){
            let parmas = this.drugTotalChangeParmas(currRow, isCalcTotal);  //计算天数//数量参数
            let res = await this.calculationTotal2(parmas);
            if(isCalcTotal){
                if (currRow.totalAmount || currRow.totalAmount === 0) currRow.totalAmount = res;
                if (currRow.amount || currRow.amount === 0) currRow.amount = res;
                 //药品库存校验参数
                this.checkDrugStock(null, currRow)
            }else{
                //数量 反算 天数
                //计算天数
                res = res || 1;
                currRow.planDays = res;
                // 查询成组药品 ---   非即刻重新计算天数 （成组其他药品）
                if (currRow.orderGroupCode && !this.immediatelyId.includes(currRow.idFreq)) {
                    this.orderGroupCodeObj[currRow.orderGroupCode].forEach((v,i)=>{
                        if(v.idClinicItem !== currRow.idClinicItem) {
                            v.planDays = res
                            //当成组天数发生变化，重新反算数量
                            this.handlerCalculation(v, true);
                        }
                    })
                }
            }
        },
        //编辑数量计算天数
        async totalAmountChange(val, index, row, doseFlag = false) {
            let curr = row;
             //中药数量批量修改  整方校验库存
            if(this.isHerBalDrug(row)) {
                this.tableData.filter( v => v.orderGroupCode === row.orderGroupCode).map( item => item.totalAmount = val);
            }

            if(row.totalAmount)  row.totalAmount = val;
            //非药品 兼容处理历史的 quantity 字段
            if(!this.isDrugType(row)) {
                row.quantity = val;
                //同步成组的 quantity 
                this.applyGroupKeys(row, ['quantity']);
            }
            //材料
            if(row.amount) {
                row.amount = val;
                return;
            }

            this.immediatelyId.forEach((it) => {
                if (it == curr.idFreq) {
                    curr.planDays = eval(freqData.freqCounter);
                    curr.isImmediate = true;
                }
            });

            //如果不是药品，不查库存
            if (!this.isDrugType(row))  return;
            //计算天数/数量 （西药）
            if(this.isWestDrug(row)) await this.totalChangeFn(row, doseFlag);

            //校验库存
            let totalChange = !doseFlag;   //总量发生变化
            this.checkDrugStock(index, row, totalChange)
        },
    }
}    