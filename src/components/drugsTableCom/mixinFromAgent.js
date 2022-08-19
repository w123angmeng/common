
export const mixinFromAgent = {
    data(){
        return {
           
        }   
    },
    computed: {
        idDeptCreate() {
            if(this.isFromOutp) {
                return this.userParmas.idDept
            }
            return this.docPatientParams.idDeptAdmit
        },
        createDeptName() {
            if(this.isFromOutp) {
                return this.userParmas.deptName
            }
            return this.docPatientParams.idDeptAdmitName
        },
    },
    methods: {
        
        //获取造影剂接口
        async getAgentListAsync() {
            let resData = await this.$axios.post(this.from.axiosUrl, this.from.parmas);
            if(resData.success) {
                return resData.data.records
            }
            this.$message.warning(resData.message);
            return false
        },
        
        //删除造影剂
        handleDeleteAgent(row, index) {
            this.tableData.splice(index, 1)
        },

        commitSaveAgentParmas(paramsData) {
            let ciOrders = {
                transfuseSpeed: "",//滴速
                groupCode: "", //执行时段
                idDept: "", //药房
                sdClinicType: "", //服务类型
                sdSubClinicType: "", //服务子类型
                repeatIndicator: 0, // 默认临时
                idOrders: "",
                drugCode: "",  //药品代码
                ordersName: "", //药品名字
                idClinicItem: "", //项目id
                dose: 0,  //用量
                doseUnits: "",  //用量单位
                doseDefault: 0, //默认剂量
                idFreq: "",  //频次
                skinTestIndicator: 0, //皮试
                idRoute: "", //用法
                planDays: 1, //用药天数
                totalAmount: 1, //总量
                totalAmountUnit: "", //总量单位
                description: "",
                remark: "",       //备注
                dtOrderStart: "", //医嘱开始时间
                dtOrderEnd: "",   //医嘱结束时间
                providedIndicator: "0", // 自备药标识, 
                specialDrugIndicator: 2, // 医保-贯标特殊用药字段    ????
                dischargeMedicationIndicator: 0, // 出院带药标识 
                idDeptCreate: this.idDeptCreate, //创建科室id
                createDeptName: this.createDeptName, //创建科室名字
                idPat: this.sourcePatInfo.idPat,  //患者id
                idVisit: this.sourcePatInfo.idVisit, // 就诊id
                subOrderGroupCode: '',
                idClinicItemParent: '',  //增强检查主键
                gcpIdentification: '', //gcp
            };
            let obj = {
                idVisit: this.sourcePatInfo.idVisit, // 就诊id
                idClinicItemDrug: "",
                orderGroupCode: "", //组号
                // group: 1, // 成组标识,  1-单  2-组
                narcotics: "",//毒麻
                price: 0, //单价
                pharmacy: "", //药房id
                itemSpec: "", //规格
                pharmacyType: this.isFromOutp ? '0' : 1,  // 0门诊药房  1 住院药房
                self: false, //自费
                special: false, // 特病标识
               
            };

            let inpDiffObj = {
                fillFlag: "0",    //补录标识
                antibacterialsReason: "", //抗菌药用药原因
                antibacterialsPurpose: "", //用药目的
                hour: "",
                minute: "",
                idWard: this.isFromOutp ? '' : this.docPatientParams.idDeptAdmit, //病区
                doseDefault: 0,  //默认剂量
                factorDoseDrugForm: 0, //换算系数默认剂量
                drugFormUnit: "", //剂量单位
                source: 0,  //摆药标识 默认不摆药
                sdAnti: "", //处方级别
                drugPackageSpecUnit: '', //库存单位   ???? 正确应该是 包装单位
                drugSpecPackage: '', //规格   包装规格
                drugSpecification: '', //规格  小规格
                drugSpecificationUnit: '', //剂型单位
                rescriptionFlag: false,  //毒麻
            }

            if(!this.isFromOutp) {
                obj = Object.assign(obj, inpDiffObj)
            }

            for (let k of Object.keys(ciOrders) ) {

                //药品信息
                if(!!paramsData.currDrugsDetails[k] || paramsData.currDrugsDetails[k] === 0) {
                    ciOrders[k] = paramsData.currDrugsDetails[k];
                }
                //当前行信息
                if(!!paramsData[k] || paramsData[k] === 0) {
                    ciOrders[k] = paramsData[k];
                }
            }
            for (let k of Object.keys(obj)) {
                  //药品信息
                if (!!paramsData.currDrugsDetails[k] || paramsData.currDrugsDetails[k] === 0) {
                    obj[k] = paramsData.currDrugsDetails[k];
                }
                 //当前行信息
                if (!!paramsData[k] || paramsData[k] === 0) {
                    obj[k] = paramsData[k];
                }   
            }
            ciOrders.ordersName = paramsData.clinicItemName;  //药品名字
            obj.itemSpec = paramsData.drugSpecification; //规格
            obj.price = paramsData.currDrugsDetails.priceStd; //单价
            obj.narcotics = paramsData.currDrugsDetails.sdToxiType; //毒麻
            obj.drugPackageSpecUnit = paramsData.currDrugsDetails.stockUnit; //库存单位   ???? 正确应该是 包装单位
            obj.drugSpecificationUnit = paramsData.currDrugsDetails.stockFUnit; //剂型单位
            //毒麻标记
            obj.rescriptionFlag = this.specialList.includes(paramsData.currDrugsDetails.sdToxiType);
            //临时执行时段置空
            if(!ciOrders.repeatIndicator) ciOrders.groupCode = '';   
          
            let reqData = {
                ...obj,
                ciOrders,
            };
            return reqData;
        },
        //
        async commitSaveAgentInfo(isReimPass) {
            console.log("保存");
              //校验多报销比例
            if(!isReimPass) {
                let isvalidateRem = await this.validateReimburInfo();
                if(isvalidateRem) return this.$emit('upDataSaveLoading', false);
            }
            this.from.commitDrug = [];
            this.multipleSelection.map( v => {
                let info =  this.commitSaveAgentParmas(v);
                this.from.commitDrug.push(info)
                console.log(info);
            })
             // 对接cdc禁忌药提示
            let cdcDrugsFlag = await this.handlerCdcDrugs();
            if(cdcDrugsFlag) return this.$emit('upDataSaveLoading', false);

            this.$emit('commitSingleAgent')
           
        },
    }
}    