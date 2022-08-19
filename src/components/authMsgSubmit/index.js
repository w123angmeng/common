import AuthMsgSubmitDialog from "@/components/page/Common_WEB/authMsgSubmit/index.vue";
export const mixinAuthMsgSubmit = {
    data () {
        return {
            toxiList: [],
            authMsgList: [],
            authMsgListFlag: false,
            checkDoctorAuthObj: {}, //医生开药权限
            isInpMsg: true,        //默认住院校验规则
            
        }
    },
    computed: {
        routeQuery(){
            return this.$route.query
        },
        toxiListObj(){
            let obj = {}
            this.toxiList.forEach(item=>{
                obj[item.dataCode] = item
            })
            return obj
        },
    },
    components: {
        AuthMsgSubmitDialog,
    },
    methods: {

        authMsgHandler() {
            this.authMsgListFlag = false;
        },

         
        // 查看医生开药权限
        checkDoctorAuth(isInpMsg) {
            this.isInpMsg = isInpMsg;
            let ajaxUrl = "/org/emp/property/findReEmpAnti";
            return this.$axios.post(ajaxUrl, {
                    idEmp: this.getUserStorage().idEmp,
                }).then((res) => {
                    if(res.success) {
                        this.checkDoctorAuthObj = res.data;
                        return true
                    } else {
                        this.$message.warning(res.message);
                        return false
                    }
                })
        },

        getToxiList() {
            this.findSdData('SD_TOXI_TYPE').then(data=>{
                this.toxiList = data.SD_TOXI_TYPE
            })
        },
        
        //校验提示    门诊只校验高价药
        checkDrugsAuth(row){
            let currDrugsDetails = row.currDrugsDetails || row
            let errorMsg = ''

            //住院提示
            if(this.isInpMsg) {
                if((this.checkDoctorAuthObj.gcpIdentification == '0' || !this.checkDoctorAuthObj.gcpIdentification) && (currDrugsDetails.gcpIdentification == '1')){
                    errorMsg = `无GCP权限`;
                }
            }
           
            // 仅药品校验下面权限
            if(row.sdClinicType !== this.CONSTANT.DRUG_TYPE){
                row.errorMsg = errorMsg
                return row;
            }
            // 高价药权限
            if(currDrugsDetails.highPriceFlag){
                if(this.checkDoctorAuthObj.highPricePerm !== '1'){
                    errorMsg = `无高价药权限`;
                }
            }

            //住院提示
            if(this.isInpMsg) {

                // 没有维护药品权限
                if (this.checkDoctorAuthObj && !this.checkDoctorAuthObj.antiIdentification) {
                    errorMsg = `医生没有维护处方和抗生素权限，请先去维护`;
                }
                // 不具有该等级的开药权限
                if(currDrugsDetails.sdAnti&&this.checkDoctorAuthObj.antiIdentification && this.checkDoctorAuthObj.antiIdentification.indexOf(currDrugsDetails.sdAnti) === -1){
                    // errorMsg = `无【${currDrugsDetails.sdAnti}等级】药品使用权限`;
                    errorMsg = `您不符合药品【${currDrugsDetails.clinicItemName}】的管控等级，无法开出此药品！`
                }
                // 处方药权限
                if(row.dischargeMedicationIndicator == 1){
                    if(currDrugsDetails.sdToxiType){
                        let drugFlag = String(this.checkDoctorAuthObj.orderIndicatorDetail).toUpperCase().indexOf(currDrugsDetails.sdToxiType) === -1
                        if(drugFlag){
                            errorMsg = `您不具备【${this.toxiListObj[currDrugsDetails.sdToxiType].description}】药品的开立权限！`;
                        }
                    }
                    if(this.checkDoctorAuthObj.orderIndicator ==='0'){
                        errorMsg = `无处方权限`
                    }
                }
            }
          
            row.errorMsg = errorMsg
            return row;
        },
       
        /** 提交前判断高价药 阻止 */
        findUnHighSubmitOrder(){
            let url = this.isInpMsg ? '/doctws/order/findUnHighSubmitOrder' : '/outpdr/order/findUnHighSubmitOrder'
            return this.$axios.get(url, {
                sdClinicType: this.CONSTANT.DRUG_TYPE,
                idVisit: this.routeQuery.idVisit
            }).then(res => {
                if(res.success){
                    let data = res.data;
                    data.forEach((item)=>{
                        this.checkDrugsAuth(item);
                    })
                    this.authMsgList = data.filter(item=>{
                        return item.errorMsg
                    })
                    // 如果权限不通过，不再往下继续
                    if(this.authMsgList.length){
                        this.authMsgListFlag = true
                        return false
                    }
                    return true
                }else{
                    return true
                }
               
            })
        },
       
    }
}