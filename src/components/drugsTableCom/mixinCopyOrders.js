
export const mixinCopyOrders = {
    data(){
        return {
            cdcDrugsInfo:{ // cdc禁忌药信息
                dialogVisible: false,
            }
        }   
    },
    computed: {
  
    },
    created(){
    },
    methods:{
        //获取复制医嘱列表数据
        getCopyListAsync(){
            return this.$axios.get(this.from.axiosUrl, this.from.parmas).then(resData=>{
                if(resData.success) {
                    return resData.data
                }else{
                    this.$message.warning(resData.message);
                    return false
                }
            })
        },
        //删除复制医嘱的某一项
        handleDeleteCopy(row, index) {
            if(this.isFromTemporaryStorage){
                this.handleDeleteStroage(row, index);
            }else{
                this.tableData.splice(index, 1)
            }
        },
        //删除暂存区 医嘱
        handleDeleteStroage(row, index) {
            this.$axios.post('/doctws/ciOrdersTempSave/delete',{
                idOrdersTempSave: row.idOrdersTempSave,
                sdClinicType: row.sdClinicType
            }).then(res =>{
                if(res.success){
                    this.tableData.splice(index, 1);
                    this.$root.Bus.$emit('refreshTempCount')
                }else{
                    this.$message.warning(res.message);
                }
            })
        },

        totalAmountUnitList(row){
            // stockPUnit 库房大单位     stockFUnit 库存小单位
            let arr = [row.currDrugsDetails.stockPUnit, row.currDrugsDetails.stockFUnit]
            let obj = {}
            return arr.filter(item=>{
                if(!obj[item]){
                    obj[item] = item
                    return !!item
                }
                return false
            })
        },
        //单次用量单位展示
        doseUnitsList(row){
            let arr =  [
                {
                    dataName: row.currDrugsDetails.doseUnit,   //小单位  -- 剂量单位
                    dataCode: row.currDrugsDetails.doseUnit,   //小单位
                },
                {
                    dataName: row.currDrugsDetails.drugFormUnit,  //大单位 -- 剂型单位
                    dataCode: row.currDrugsDetails.drugFormUnit,  //大单位
                    calc:true
                },
            ];
            let obj = {}
            // 如果2个单位一致  只展示一个
            let brr = arr.filter(item=>{
                if(!obj[item.dataName]){
                    obj[item.dataName] = item
                    return !!item.dataName
                }
                return false
            })
            return brr
        },
        //单次用量单位切换  
        doseUnitsChange(row){
            // 小单位  切换成大单位   单次剂量清空
            if(this.currDoseUnitsObj(row).calc){
                this.$set(row,'calcDose',void 0)
            }
        },
        doseUnitsListObj(row){
            let obj = {}
            this.doseUnitsList(row).forEach(item=>{
                obj[item.dataCode] = item
            })
            return obj
        },
        currDoseUnitsObj(row){
            return this.doseUnitsListObj(row)[row.doseUnits] || {}
        },
       
        calcDoseChange(row,index){
            let diffDose = this.diffDefalutDose(row);
            row.dose = parseFloat((row.calcDose * diffDose).toFixed(5)) 
            this.totalAmountChange(row.totalAmount, index, row, true);
        },
        //总量单位发生变化   天数不变  反算总量
        totalAmountUnitChange(row,index){
            this.totalAmountChange(row.totalAmount, index, row, true);
        },
        //处理复制医嘱 保存数据
        commitSaveCopyData(params) {
            let obj = {
                chargeTypeCode: '',
                idForm: '',
                idOrders: '',
                idStorage: '',
                idVisit: '',
                idWard: '',
                insuranceIndicator: 0,
                sdClinicType: '',
            }

            let itemOedrs = {
                dose: '',        //用量
                doseUnits: '',   //用量单位 （小单位）
                dtOrderStart: '',//开始时间
                groupCode: '',   //执行时段
                idClinicItem: '', //项目id
                idFreq: '',       //频次id
                idOrders: '',    //医嘱id
                insuranceIndicator: 0, //自费标识
                planDays: '',    //医保天数
                remark: '',      //备注
                repeatIndicator: 0,//长临属性
                specialDrugIndicator: 0,//特殊用药标识
                totalAmount: 0,  //总量
                totalAmountUnit: '',  //总量单位
                idDept: '',   //执行科室
            }
            if(params == 'temp'){
                obj.idEmp= this.checkDoctorAuthObj.idEmp;
                obj.idPat= '';
                obj.list = [];
                itemOedrs.idOrdersTempSave = '';
            }else{
                obj.beanList = [];
            }
            let commitOrders = [];
            this.multipleSelection.map( row => {
                let copyItem = this.copyObject(itemOedrs);
                for (let k of Object.keys(obj)) {
                    //外层信息
                    if (!!row[k] || row[k] === 0) {
                        obj[k] = row[k];
                        obj.idStorage = row.idDept;  //药房
                    } 
                }
                for (let k of Object.keys(copyItem)) {
                    //当前行信息
                    if (!!row[k] || row[k] === 0) {
                        copyItem[k] = row[k];
                        copyItem.doseUnits = row.doseUnitSave || row.currDrugsDetails.doseUnit; //取小单位  剂型单位， 页面的单位只是显示 
                        copyItem.insuranceIndicator = this.isInsurePat && !row.self ? 1 : 0;
                    }   
                }
                commitOrders.push(copyItem)
            })

            if(params == 'temp'){
                obj.list = commitOrders;
            }else{
                obj.beanList = commitOrders;
            }
            obj.chargeTypeCode = this.sourcePatInfo.chargeTypeCode;  //费别
            obj.idWard = this.docPatientParams.idDeptAdmit;
            obj.insuranceIndicator = this.isInsurePat ? 1 : 0;
            
            return  obj
        },
        //校验是否引用了 gcp药房
        validateGcpStorgeCode() {
            let hasGcp = this.multipleSelection.filter(item => item.idDept && this.GCPDrugStorgeCodes.includes(item.idDept));
            if(!this.isFromOutp && !this.isGcpPat && hasGcp.length) {
                this.$message.warning('GCP药房药品，不允许引用')
                return false
            }
            return true
        },

        //校验多报销比例
        async handerQuoteSaveCopyOrders(isReimPass) {
            let hasgcp = this.validateGcpStorgeCode();
            if(!hasgcp) return this.$emit('upDataSaveLoading', false);

            //校验多报销比例
            if(!isReimPass) {
                let isvalidateRem = await this.validateReimburInfo();
                if(isvalidateRem) return this.$emit('upDataSaveLoading', false);
            }

            // 校验出院时间
            this.ValidateLeaveHosTime();
            if(this.valiDateList.length){
                this.valiDateFlag = true;
                return this.$emit('upDataSaveLoading', false);
            }
            // 对接cdc禁忌药提示
            let cdcDrugsFlag = await this.handlerCdcDrugs();
            if(cdcDrugsFlag) return this.$emit('upDataSaveLoading', false);

            this.saveAllFn();
        },
        saveAllFn(){
            if(this.isFromTemporaryStorage){ // 暂存
                let copyObjs = this.commitSaveCopyData('temp');
                this.temporaryStorageSave(copyObjs);
                return;
            }
            let copyObj = this.commitSaveCopyData();
            console.log("保存", copyObj);
            this.quoteSaveCopy(copyObj);
        },
        //引用到医嘱
        quoteSaveCopy(Obj) {
            this.$axios._post("/doctws/copy/save", Obj).then(res => {
                if (res.success) {
                    let obj = {
                        list: this.multipleSelection,
                        ordersList: res.data,
                        type: 'copyOrders'
                    }
                    this.$emit('copyGetNewOrdersList', obj)
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
                this.$emit('upDataSaveLoading', false);
            });
        },  
        // 暂存保存
        temporaryStorageSave(obj){
            this.$axios._post("/doctws/ciOrdersTempSave/saveToCiorders", obj).then(res => {
                if (res.success) {
                    let obj = {
                        list: this.multipleSelection
                    }
                    this.$emit('tempStorageSave', obj)  // 刷新医嘱列表
                    return res.data;
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
                this.$emit('upDataSaveLoading', false);
            }).then(res=>{
                if(res){
                    this.deleteSelect();
                }
            })
        },
        deleteSelect(){
            let list  = this.multipleSelection.reduce((arr,v)=>{
                let {idForm,idOrdersTempSave,sdClinicType} = v;
                arr.push({idForm,idOrdersTempSave,sdClinicType});
                return arr;
            },[])
            this.$axios._post("/doctws/ciOrdersTempSave/deleteByIdOrdersTempSaveList", list).then(res => {
                if (res.success) {
                    this.$root.Bus.$emit('refreshTempCount')
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },
        // 校验出院通知时间
        ValidateLeaveHosTime(){
            this.valiDateList = [];
            this.multipleSelection.map( row => {
                this.ValidateLeaveHosMsg(row) && this.valiDateList.push(this.ValidateLeaveHosMsg(row));
            })
        }, 
        ValidateLeaveHosMsg(row){
            let {dtOrderStart:leaveHosDateTimer,outIdentification} = this.leaveOrdersStartObj;
            let leaveHosDate = leaveHosDateTimer? +new Date(leaveHosDateTimer) : ''
            let start = +new Date(row.dtOrderStart) 
            let obj = {};
            if(leaveHosDate && leaveHosDate<start){
                obj.name = row.sdClinicType == this.CONSTANT.DRUG_TYPE? row.ordNames[0]: this.handlerContent(row);
                obj.message = `医嘱开始时间【${row.dtOrderStart}】已经大于${outIdentification == '2'? '死亡时间':'出院时间'}【${leaveHosDateTimer}】,请调整医嘱`
                return obj;
            }   
        },
        cancleCdcMsg(){
            this.$emit('upDataSaveLoading', true)
            if(this.isFromAgent){ // 造影剂
                this.$emit('commitSingleAgent')
            }else{// 复制暂存
                this.saveAllFn();
            }
        },
        // cdc禁忌药提示
        async handlerCdcDrugs(){
            let drugCodeList = this.multipleSelection.filter(item=>{
                if(this.isWestDrug(item)){
                    return item.drugCode
                }
            }).map(v=> v.drugCode);
            drugCodeList = [...new Set(drugCodeList)];
            if(!drugCodeList.length) return false;
            let obj = {
                idVisit: this.sourcePatInfo.idVisit,
                idPat: this.sourcePatInfo.idPat,
                drugsIdList: drugCodeList
            }
            let cdcResult = await this.getQueryTabooDrug(obj);
            if(cdcResult){
                this.cdcDrugsInfo.result = cdcResult;
                this.cdcDrugsInfo.dialogVisible = true;
                return true;
            }else{
                return false;
            }
        }
    }
}    