<template>
    <div class="historyVisitDia_Js">
        <el-dialog 
            title="病历浏览" 
            :visible.sync="historyVisitForm.dialogVisible"
            width="1000px" 
            top="20vh"
            class="historyVisitJsDialog"
            :close-on-press-escape="false" 
            :close-on-click-modal="false">
            <HisTCom></HisTCom>
            <div class="hisJsBtns">
                <el-button @click="handleCancel">关闭</el-button>
            </div>
        </el-dialog>   
    </div>
</template>
<script>
import HisTCom from "../common/index.vue";

export default {
    props: {
        historyVisitForm: {
            type: Object,
            default: () => {
                return {}
            },
        },
    }, 
    components: {
        HisTCom
    },
    data() {
        return {

        };
    },
    methods: {
         /**取消  */
        handleCancel() {
            this.handleClose();
        },

        /**关闭弹窗  */
        handleClose() {
            this.historyVisitForm.dialogVisible = false;
        },
    }
  };

</script>

<style lang="scss" src="./index.scss">
</style>