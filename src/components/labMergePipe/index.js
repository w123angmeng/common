import LabMergePipe from "@/components/page/Common_WEB/labMergePipe/index.vue"; //检验合管弹窗
import { mapGetters } from "vuex";
export const mixinAuthLabMergePipe = {
    data () {
        return {
            isLabMerge: false, //需要合单的科室
            isMergeFromApply: false,

            //检验合管弹窗数据
            mergePipeForm: {
                visible: false
            },
            
        }
    },
    computed: {
        ...mapGetters(['docPatientParams',]),
    },
    components: {
        LabMergePipe,
    },
    methods: {
         /** 获取需要合单的科室 */
         async getLabMergeDept(){
            let obj ={
                systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                paramTypeCode: 'Lab_Merge_Dept'
            }
            return this.listBySystemIdAndParamTypeCodeForDefaultValue(obj).then(res=>{
                let arr = res.data || [];
                this.isLabMerge = arr.includes(this.docPatientParams.idDeptAdmit);
            })
        },

        //查询 需要合单的数据
        async getGroupLabOrder(list) {
            let params = {
                idVisit: this.docPatientParams.idVisit,
                idPat: this.docPatientParams.idPat,  
            }

            if(list && list.length) params.ciApplyLabDoctwsList = list
            this.mergePipeForm.applyCommitList = [];

            let res = await this.$axios._post("/doctws/inspect/findGroupLabOrder", params);
            if(res.success) {
                let arr = Object.keys(res.data);
                this.mergePipeForm.mergeObj = res.data;
                
                if(this.isMergeFromApply && list) this.mergePipeForm.applyCommitList = this.copyObject(list)

                if(!arr.length) return false

                return true
            }
            this.$message.warning(res.message)
            if(this.isMergeFromApply)  this.saveloading = false;
            return false
        },

        async isMergeTestApply(from = 'orders', list = []) {
            this.isMergeFromApply = from === 'apply' ? true : false
            //根据参数配置哪些科室可操作 合单 功能
            await this.getLabMergeDept();
            if(this.isLabMerge) {
                //先查询是否有要合管的检验项目
                let isHasMerge = await this.getGroupLabOrder(list);
                if(isHasMerge) {
                    this.mergePipeForm.visible = true;
                    this.mergePipeForm.isFromApply = this.isMergeFromApply;
                    return true
                }  
                return false
            } 
            return false
        }
   
    }
}