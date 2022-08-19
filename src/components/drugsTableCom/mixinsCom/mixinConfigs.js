
export const mixinConfigs = {
    data(){
        return {
            drugDaysLimitOneDay: [], //用药天数固定为1天的频次
            outpLimitDays: 0,        //出院带药最大天数
            specialList: [],         //毒麻药品列表
            inspectTreeList: [],     //检查类型、部位的树形数据
            examDeptUseLocalArr: [], //检查分类下属于本科室
            GCPDrugStorgeCodes: [],   //gcp药房编码
            batchForDeValueList: [],
        }   
    },
    computed: {
        defaultValueDatas () {
             return function() {
                let arr = [
                    {
                        systemId: this.CONSTANT.INP_SYSTEM_FLAG,   //住院
                        paramTypeCode: 'Drug_For_Outp_Limit_Days', //获取出院带药最大天数
                        dvFun: this.getOutpLimitDays(this.getBatchForDvObj.get('Drug_For_Outp_Limit_Days')), //方法
                    },
                    {
                        systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                        paramTypeCode: 'DrugDays_Limit_OneDay',   //用药天数固定为1天的频次
                        dvFun: this.getDrugDaysLimitOneDay(this.getBatchForDvObj.get('DrugDays_Limit_OneDay')),//方法
                    },
                    {
                        systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                        paramTypeCode: 'Single_Order_Freq',       //获取临时医嘱配置的剂型的频次  注射类
                        dvFun: this.getTempFreqList(this.getBatchForDvObj.get('Single_Order_Freq')), //方法
                    },
                    {
                        systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                        paramTypeCode: 'Repeat_Order_Freq',       //获取长时医嘱频次
                        dvFun: this.getLongFreqList(this.getBatchForDvObj.get('Repeat_Order_Freq')),//方法
                    },
                    {
                        systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                        paramTypeCode: 'Single_Order_Freq_Dose',  //获取临时医嘱配置的剂型  注射类 
                        dvFun: this.getDoseFormList(this.getBatchForDvObj.get('Single_Order_Freq_Dose')),
                    },
                    {
                        systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                        paramTypeCode: 'Auto_Create_Orders_Drug_Type', //获取特殊药品列表
                        dvFun: this.getSpecialList(this.getBatchForDvObj.get('Auto_Create_Orders_Drug_Type')),
                    },
                    {
                        systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                        paramTypeCode: 'Exam_Dept_Use_Local', //获取哪些分类下属于本科室
                        dvFun: this.getExamDeptUseLocal(this.getBatchForDvObj.get('Exam_Dept_Use_Local')),
                    },
                    {
                        systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                        paramTypeCode: 'GCP_Drug_Storage',  //获取GCP药房
                        dvFun: this.getGCPDrugStorge(this.getBatchForDvObj.get('GCP_Drug_Storage')),
                    },
                    // {
                    //     systemId: this.CONSTANT.OUTP_SYSTEM_FLAG,  //门诊
                    //     paramTypeCode: 'Freq_Immediately',  //是否即刻
                    //     dvFun: this.chargeFreq(this.getBatchForDvObj.get('Freq_Immediately')),
                    // },
                ]
                return arr
             }
        },
        defaultValueParmas() {
            let data = this.defaultValueDatas();
            let arr = data.map( item => {
               return {
                    systemId: item.systemId,
                    paramTypeCode: item.paramTypeCode,
               }
           })
           return arr
        },
        getBatchForDvObj() {
            let map = new Map();
            this.batchForDeValueList.map( item => {
                map.set(item.paramTypeCode, item.retList)
            })
            return map
        },
    },
    methods: {
        
         /**批量获取系统参数配置 */
        getBatchListForDefaultValue() {

            return this.batchListForDefaultValue(this.defaultValueParmas).then( data => {
                this.batchForDeValueList = data || [];
                this.defaultValueDatas();
                console.log('批量获取系统参数配置-----', data);
            })
        },

         /** 获取出院带药最大天数 */
        getOutpLimitDays(list){
            let arr = list || [];
            this.outpLimitDays = parseInt(arr[0]) || 0
        },
        
        /** 用药天数固定为1天的频次 */
        getDrugDaysLimitOneDay(list){
            this.drugDaysLimitOneDay = list || [];
        },

        /** 获取临时医嘱配置的剂型的频次  注射类 */
        getTempFreqList(list){
            this.tempFreqList = list || [];
        },
        /** 获取长时医嘱频次 */
        getLongFreqList(list){
            this.longFreqList = list || [];
        },

        /** 获取临时医嘱配置的剂型  注射类 */
        getDoseFormList(list){
            this.doseFormList = list || [];
        },

        /**  获取特殊药品列表  */
        getSpecialList(list) {
            this.specialList = list || []; //毒麻
        },

         /** 获取检查类型、部位的树形数据 */
         remoteClinicTypeTree() {
            return this.$axios.get("dict/data/listParentAndChildData", {
                dataClassCode: "SD_CLINIC_TYPE",
                dataCode: this.CONSTANT.INSPECT_TYPE, //检查
            }).then(res => {
                if (res.success) {
                    this.inspectTreeList = res.data || [];
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },
        /** 获取哪些分类下属于本科室 */
        getExamDeptUseLocal(list) {
            this.examDeptUseLocalArr = list || [];
        },

        /** 获取GCP药房 */
        getGCPDrugStorge(list){
            this.GCPDrugStorgeCodes = list || [];
        },
       
    }
}    