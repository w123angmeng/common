<template>
    <div class="inspectContent flexRow">
        <inspectLeft 
            :isFromInpDoctor="isFromInpDoctor"
            @resetInspectAdd="resetInspectAdd">
        </inspectLeft>
        <inspectCon 
            ref="inspectCon"
            :inspectData="sourceParmasObj">
        </inspectCon>
        <inspectRight 
            ref="inspectRight"
            :isFromInpDoctor="isFromInpDoctor" 
            :tabCommonParmas="tabCommonParmas"
            :inspectData="sourceParmasObj" 
            @resetInspectAdd="resetInspectAdd">
        </inspectRight>
    </div>
</template>
<script>
import { mapMutations, mapGetters } from "vuex";
import inspectLeft from './inspectLeft/inspectLeft';
import inspectCon from './inspectCon/inspectCon';
import inspectRight from './inspectRight/inspectRight';
export default {
    props:{
        inspectData:{
            type: Object,
            default: ()=>({})
        },
        sourceFLag: {
            type: String,
            default: () => {
                return ''
            }
        },
        tabCommonParmas: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    computed: {
        ...mapGetters(["docPatientParams"]),
        isFromInpDoctor() {
            let inp = this.sourceFLag === '住院医生'
            if(inp)  this.SET_DOCCLOSEVISITSTATUS(false);
            
            return inp
        },
        sourceParmasObj() {
            return this.isFromInpDoctor ? this.docPatientParams : this.inspectData
        },
    },
    components:{
        inspectLeft,
        inspectCon,
        inspectRight
    },
    methods: {
        ...mapMutations(["SET_DOCCLOSEVISITSTATUS"]),
        // 重置页面状态为新增
        resetInspectAdd(isSee) {
            this.$refs.inspectCon.resetPageState(); //重置中间树的状态
            this.$refs.inspectRight.resetOutpDocAdvice(isSee); //重置右侧表单
        },

        //离开页面前，判断是否需要保存
        getSaveStatus() {
            return this.$refs.inspectRight.isSaveStatus;
        },

        //新增检查单-提交--返回值Promise
        handleSubmitCommon() {
            return this.$refs.inspectRight.saveDocAdvice();
        }
    }
}
</script>
<style scoped lang="scss">
    .inspectContent{
        height: 100%;
        overflow: hidden;
    }
</style>
