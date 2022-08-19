<template>
    <div class='agentDrugdialog_wrap'>
        <el-dialog 
            title="组套项目" 
            :visible.sync="agentDrugForm.visible" 
            :close-on-click-modal="false" 
            :close-on-press-escape="false" 
            width="1110px" 
            :show-close="false">
            <DrugsTableCom 
                ref="DrugsTableCom" 
                v-if="agentDrugForm.visible" 
                :from="agentDrugForm"
                @upDataSaveLoading="upDataSaveLoading"
                @commitSingleAgent="commitSingleAgent"
                @tableCheckedRows="tableCheckedRows">
            </DrugsTableCom>
            <span slot="footer" class="dialog-footer">
                <el-button class="agentDrugBtn" @click="cancel()">关闭</el-button>
                <el-button class="agentDrugBtn" :disabled="isShowDis()" :loading="saveloading" type="primary" @click="submitDrugs">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

import DrugsTableCom from '@/components/page/Common_WEB/drugsTableCom/index.vue'
import { mixinSaveLoading } from "@/components/page/Common_WEB/mixins/mixinSaveLoading";

    export default {
        props: {
            agentDrugForm: {
                type: Object,
                default: () => {}
            }
        },
        mixins:[mixinSaveLoading],
        data() {
            return {
               multipleSelection: [],
            };
        },
        components: {
            DrugsTableCom,
        },
        computed: {
            isDisabled() {
                if(this.$refs.DrugsTableCom) {
                    return this.$refs.DrugsTableCom.finalyBtnStatus
                }
                return !this.multipleSelection.length
            },
        },
        methods: {
            isShowDis() {
                if(this.$refs.DrugsTableCom) {
                    let st =  this.$refs.DrugsTableCom.finalyBtnStatus;
                    if(!st) {
                        return !this.multipleSelection.length
                    }
                    return this.$refs.DrugsTableCom.finalyBtnStatus
                }
                return !this.multipleSelection.length
            },
            //复选框变化
            tableCheckedRows(val) {
                this.multipleSelection = val;
            },
            //关闭
            cancel() {
                this.agentDrugForm.visible = false;
            },
            upDataSaveLoading(isLoading) {
                this.saveloading = isLoading;
            },
            //保存
            submitDrugs() {
                this.saveloading = true;
                this.$refs.DrugsTableCom.commitSaveAgentInfo();
            },
            //暂存每条增强检查的造影剂
            commitSingleAgent(vals) {
                
                this.$emit('commitSingleAgent')

                this.agentDrugForm.visible = false;
            }
        },
    };

</script>

<style lang="scss">
.agentDrugdialog_wrap {
    .el-dialog{
        margin-top: 0 !important;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .el-dialog__header {
        padding: 16px 24px;
        border-bottom: 1px solid #E8E8E8;
    }

    .el-dialog__body {
        height: 200px;
        padding: 16px 24px !important;
    }
    .dialog-footer {
        .el-button {
            width: 65px !important;
            height: 34px !important;
        }
    }
}
</style>
        