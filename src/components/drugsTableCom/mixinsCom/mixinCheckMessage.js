
export const mixinCheckMessage = {
    data(){
        return {
            checkDoctorAuthObj: {},   //校验药品权限
            toxiList: [],             //毒理分类列表
            clinicItemEnabledList: [],
            csClinicItemDrugVo: [],
        }   
    },
    computed: {
        toxiListObj(){
            let obj = {}
            this.toxiList.forEach(item=>{
                obj[item.dataCode] = item
            })
            return obj
        },
        drugDaysMessageObj() {
            let obj = {
                30: '最大开药天数超限',
                40: '药品天数超限',
            }
            return obj
        },
        getIdClinicArr(){
            return this.tableData.reduce((arr,item) =>{
                let obj = {};
                obj.idClinicItem = item.idClinicItem;
                obj.sdClinicType = item.sdClinicType;
                item.idClinicItem && arr.push(obj);
                return arr;
            },[])
        },
        getEnabledClinic(){
            return this.clinicItemEnabledList.map(item =>item.idClinicItem);
        },
        filterRepeatDrugObj() {
            let newSort = this.repeatArrayElements(this.allDrugIdClinicItemList, 'idClinicItem');
            let paramsArr = [];
            paramsArr = newSort.map( v => {
                return {
                    chargeTypeCode: this.sourcePatInfo.chargeTypeCode,
                    idClinicItem: v.idClinicItem,
                    idStorage: v.idDept, //药房
                    visitType: this.sdVisitType, //就诊类型 01-门诊 02-急诊 03-住院 04-体检
                    sellUnit: "", //销售单位
                }
            })
            return paramsArr
        },
        getCsClinicItemDrugVoList(){
            let map = new Map();
            this.csClinicItemDrugVo.map(item =>{
                map.set(item.idClinicItem, item.csClinicItemDrugVo)
            })
            return map
        },
        inpAttr() {
            let flag = false

            if(this.isFromCopy || this.isFromTemporaryStorage || this.isFromDoctwsTmpl) flag = true
            if(!this.isFromOutp && this.isFromAgent) flag = true
           
            return flag
        },
    },
    methods: {

        //药品-毒理分类
        async getToxiList() {
            let data = await this.findSdData('SD_TOXI_TYPE');
            this.toxiList = data.SD_TOXI_TYPE || [];
        },

        // 查看医生开药权限
        checkDoctorAuth() {
            let ajaxUrl = "/org/emp/property/findReEmpAnti";
            return this.$axios.post(ajaxUrl, {  idEmp: this.idEmp}).then((res) => {
                if (res.success) {

                    return this.checkDoctorAuthObj = res.data;
                }else {
                    this.$message.warning(res.message);
                    return false
                }
            })
        },

         //获取每一个药的药品信息
        async getAllDrugsDetails() {
            let ajaxUrl = "/dict/clinicDrug/findCsClinicItemDrugByIds";
            let res = await this.$axios._post(ajaxUrl, this.filterRepeatDrugObj);
            if (res.success) {
                this.csClinicItemDrugVo = res.data;
                this.tableData.map( row => {
                    let cur = this.getCsClinicItemDrugVoList.get(row.idClinicItem);
                    if(!cur) return
                    this.$set(row, "currDrugsDetails", cur);   //药品信息
                })
                return true;
            } else {
                this.$message.warning(res.message);
                return false
            }
        },

        //检验校验无标本提示
        checkTestMessage(row){
            if(!row.idSpecimen){
                this.$nextTick(()=>{
                    let msg = '项目没有维护标本'
                    this.$set(row, "checkMessage", msg);
                    this.$nextTick(()=>{
                        this.$refs.tableData.toggleRowSelection(row,false);
                    })
                })
            }
        },
        //毒麻 处方、高价药校验
        checkDrugsAuth(row){
            let currDrugsDetails = row.currDrugsDetails
            let msg = ''
            // 高价药权限
            if(currDrugsDetails.highPriceFlag){
                if(this.checkDoctorAuthObj.highPricePerm !== '1'){
                    msg = `药品【${currDrugsDetails.clinicItemName}】为高价药，您不具备高价药的开立权限！`;
                }
            }
            // 没有维护药品权限
            if (this.checkDoctorAuthObj && !this.checkDoctorAuthObj.antiIdentification) {
                msg = `医生没有维护处方和抗生素权限，请先去维护`;
            }
            // 不具有该等级的开药权限
            if(currDrugsDetails.sdAnti&&this.checkDoctorAuthObj.antiIdentification && this.checkDoctorAuthObj.antiIdentification.indexOf(currDrugsDetails.sdAnti) === -1){
                // msg = `药品【${currDrugsDetails.clinicItemName}】为【${currDrugsDetails.sdAnti}等级】药品，您不具备使用权限！`;
                msg = `您不符合药品【${currDrugsDetails.clinicItemName}】的管控等级，无法开出此药品！`
            }
            // 处方药权限
            if(row.dischargeMedicationIndicator == 1){
                if(currDrugsDetails.sdToxiType){
                    let drugFlag = String(this.checkDoctorAuthObj.orderIndicatorDetail).toUpperCase().indexOf(currDrugsDetails.sdToxiType) === -1
                    if(drugFlag){
                        msg = `您不具备【${this.toxiListObj[currDrugsDetails.sdToxiType].description}】药品的开立权限！`;
                    }
                }

                if(this.checkDoctorAuthObj.orderIndicator ==='0'){
                    msg = `您不具备处方药品的开立权限！`
                }
                
            }

            //中药不提示西药提示
            if(this.isHerBalDrug(row)) msg = '';

            return msg;
        },

        //医保天数提示
        checkDrugsDaysMessage(row) {
            let curr = row.currentPassTypeObj;
            let msg = '';
            
            if(this.drugDaysMessageObj[curr.noPassType]) {
                msg = this.drugDaysMessageObj[curr.noPassType]
            }
           
            return msg
        },

        // 是否是毒麻精放
        isSpecialDrugs(row){
            return this.specialList.includes(row.sdToxiType)
        },

        showProdict(row){
            return this.isSpecialDrugs(row) || this.isOutHospotal(row)
        },
        //拆零标记
        isOutHospotal(row){
            return row.dischargeMedicationIndicator === 1
        },

        //超过限制天数提示
        checkLimitDaysMessage(row) {
            let msg = '';
            // 超出限制天数
            if(this.showProdict(row)){
                if(row.totalAmount > 1 && row.planDays > this.outpLimitDays){
                    msg = `超过限制天数${this.outpLimitDays}`
                }
            }

            return msg
        },

        //计算中药库存
        calcHerbalCount(row) {
            let tol = row.currDrugsDetails.stockFUnitCount;

            let rowtol = row.totalAmount * row.dose
                
            return Number(rowtol) > Number(tol)
        },

         //校验是否引用了gcp药房的药品
         validateGcpStorgeCodeMsg(row) {
            let msg = '';
            let hasGcp = row.idDept && this.GCPDrugStorgeCodes.includes(row.idDept);
            if(!this.isFromOutp && !this.isGcpPat && !!hasGcp) {
                msg = 'GCP药房药品'
            }
            return msg
        },
        
         //住院 如果库房小单位和大单位一致 暂时由实际库存库存 --> 可用库存数量  , 物资上线后废弃  false取实际库存 true取可用库存
        isAvailableCountInpAttr(row) {
            let stockFUnit = row.currDrugsDetails.stockFUnit;
            let stockPUnit = row.currDrugsDetails.stockPUnit;
            if(this.inpAttr) {
                if(stockFUnit && stockPUnit && stockFUnit !== stockPUnit) {
                    return false
                }
                return true
            } 
           
            return false
        },

        //住院医嘱引用、复制、暂存、造影剂  自备药和不摆药，不走库存校验  true 不走库存校验  false走库存校验
        unStockByProvidedIndicator(row) {
            if((row.providedIndicator == '1' || (row.drugPrepareType == 2 && row.dischargeMedicationIndicator != 1)) && this.inpAttr) {
                return true
            }
            return false
        },

         //是否大单位
         isBigUnit(row){
            return row.totalAmountUnit == row.currDrugsDetails.stockPUnit
        },
        
         // 默认剂量处理
        diffDefalutDose(row) {
            if(this.isAtmeng) {
                return row.currDrugsDetails.factorDoseDrugForm
            }
            return row.currDrugsDetails.doseDefault
        },

        //校验提示
        showTipMessages(row, isDays){
            let flag = false
            if(!row.currDrugsDetails.idClinicItem){
                return false
            }
            let isAvaCount = this.isAvailableCountInpAttr(row);
            let avaCount  = row.currDrugsDetails.availableCount || 0;
        
            if(this.isInterim(row)){ // 临时
                //中药
                if(this.isHerBalDrug(row)) {
                    flag = this.calcHerbalCount(row)
                } else {
                    //西药
                    //库房小单位   stockFUnitCount 小单位库存 实际库存 -->   availableCount可用库存
                    if(row.totalAmountUnit == row.currDrugsDetails.stockFUnit) {

                        // let count =  isAvaCount ? avaCount : row.currDrugsDetails.stockFUnitCount;
                        let count =  row.currDrugsDetails.stockFUnitCount;

                        if(row.totalAmount > count) {
                            flag = true; //校验未通过的显示提示信息
                        }
                    } else if(row.totalAmountUnit == row.currDrugsDetails.stockPUnit) {
                         //库房大单位  原库房大单位 stockPUnitCount 实际库存  -->   availableCount可用库存

                        // let count =  isAvaCount ? avaCount : row.currDrugsDetails.stockPUnitCount;
                        let count = row.currDrugsDetails.stockPUnitCount;

                        if(row.totalAmount > count) {
                            flag = true; //校验未通过的显示提示信息
                        }
                    } else {
                        flag = true; //校验未通过的显示提示信息
                    }
                }
            }else{ // 长期
                let diffDose = this.diffDefalutDose(row);
                if(row.dose && diffDose){
                    let totalCounts = Math.ceil(row.dose/diffDose) ;

                    // let count =  isAvaCount ? avaCount : row.currDrugsDetails.stockFUnitCount;
                    let count =  row.currDrugsDetails.stockFUnitCount;
                    let isBigUnit = this.isBigUnit(row);
                    //如果是大单位 取大单位库存校验
                    if(isBigUnit) {
                        count = row.currDrugsDetails.stockPUnitCount
                    }

                    if(totalCounts > count || count === null){
                        flag = true
                    }
                }
            }
            //自备药、不摆药 不走库存校验
            if(this.unStockByProvidedIndicator(row)) flag = false;
            // 长期校验库存
            let tipMessage = ''
            if(flag){
                tipMessage = '暂无库存'
            }else{
                // 权限校验
                tipMessage = !this.isFromOutp && this.checkDrugsAuth(row) // 门诊不校验处方高价药毒麻
            }
            //超过限制天数提示
            if(!tipMessage)  tipMessage = this.checkLimitDaysMessage(row)

            //医保天数提示 前提是 库存和医生权限校验都通过（ 防止医保天数提示文案覆盖之前）
            if(isDays && !tipMessage) tipMessage = this.checkDrugsDaysMessage(row);

            //gcp药房提示
            if(!tipMessage)  tipMessage = this.validateGcpStorgeCodeMsg(row);

            this.checkGroupMessage(row,tipMessage);
            return flag
        },
        checkGroupMessage(row,tipMessage){
            let current = this.tableData.filter(item=>{
                return item.rowKey === row.rowKey
            })[0]
            if(current.checkMessage == '已失效！') return; // 如果已经存在验证信息，则不执行，避免查询诊疗项目失效时，同药品校验有库存后被覆盖
            this.$set(current, "checkMessage", tipMessage);
            let groupArr = this.orderGroupCodeObj[row.orderGroupCode] || this.idFormObj[row.idForm];
            if(groupArr){
                let curr = groupArr.filter(item=>{
                    return item.rowKey === row.rowKey
                })[0]
                this.$set(curr, "checkMessage", tipMessage);
                let flags = groupArr.some(item=>{
                    return item.checkMessage
                })

                let noPriceFlags = groupArr.some(item=>{
                    return item.isChargeTypePriceDesc === 0
                })
                //优先校验价格
                if(noPriceFlags){
                    this.$nextTick(()=>{
                        this.$refs.tableData.toggleRowSelection(groupArr[0],false);
                    })
                }else{
                    //其次 验证文案
                    if(flags){
                        this.$nextTick(()=>{
                            this.$refs.tableData.toggleRowSelection(groupArr[0],false);
                        })
                    }else{
                        this.$nextTick(()=>{
                            this.$refs.tableData.toggleRowSelection(groupArr[0],true);
                        })
                    }
                }
            }else{
                setTimeout(()=>{
                    //优先校验价格，其次药品校验
                    let isCheck = current.isChargeTypePriceDesc === 0 ? false : !tipMessage
                    this.$refs.tableData.toggleRowSelection(current, isCheck);
                },100)
            }
        },
         // 查询诊疗项目enable 可用的
        listClinicItemForEnable(){
            if(!this.getIdClinicArr.length) return;
            return this.$axios._post('/dict/clinicItem/listClinicItemForEnable',this.getIdClinicArr).then(res =>{
                if(res.success){
                    console.log(res);
                    this.clinicItemEnabledList = res.data;
                }else{
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
            }).then(res=>{
                this.checkEnabledClinic();
            })
        },
        // 诊疗项目失效后不可引用
        checkEnabledClinic(){
            this.tableData.map(row =>{
                if(row.idClinicItem && !this.getEnabledClinic.includes(row.idClinicItem)){
                    this.checkGroupMessage(row, '已失效！');
                }
            })
        },
    }
}    