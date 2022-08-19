<template>
    <div class='outp_tmpl flexColumn'>
        <div class="flex1 tmpl_content">
            <DrugsTableCom 
                ref="DrugsTableCom"
                v-if="tmplObj.visible" 
                :from="tmplObj"
                @upDataSaveLoading="upDataSaveLoading"
                @tableCheckedRows="tableCheckedRows"
                @cancelTmp="cancel"
                >
            </DrugsTableCom>
        </div>
        <div class="footer">
            <el-button @click="cancel">取消</el-button>
            <el-button class="quoteBtn" type="primary" :disabled="isShowDis()" :loading="saveloading" @click="quoteToOrders">确定</el-button>
        </div>
    </div>
</template>

<script>

import DrugsTableCom from '@/components/page/Common_WEB/drugsTableCom/index.vue'
import { mixinSaveLoading } from "@/components/page/Common_WEB/mixins/mixinSaveLoading";
    export default {
        props: {
            inspectData: {
                default() {
                    return {};
                },
            },
            from: {
                default() {
                    return {};
                },
            },
        },
        data() {
            return {
                idOrdersTemplate: [], //医嘱模板主键
                tmplObj: {
                    visible:false,
                    sdVisitType: this.CONSTANT.OUTP_VISIT_TYPE, //就诊类型
                    source: 'outp',       //来源住院
                    ModelSource: 'doctwsTmpl',  //功能来源 -- 门诊模版引用
                    params: {
                        pageIndex: 1,
                        pageSize: 999,
                        isShowChargeItem: "1",
                    },
                    axiosUrl: "/tpl/ciOrdersTemplate/pageCiOrdersTemplateItem",
                    diagnosisMsg: {}, // 诊断信息
                },
               multipleSelection: [],

            };
        },
        mixins:[ mixinSaveLoading],
        components: {
            DrugsTableCom,
        },
        computed: {
            
        },
        created(){
            this.init();
        },
        methods: {
            init(){
                this.$root.Bus.$off("treeData");
                this.$root.Bus.$on("treeData", async (msg) => {
                    console.log(msg,'msg');
                    this.tmplObj.diagnosisMsg = {}
                    this.tmplObj.visible = false;
                    this.multipleSelection = []; // 已勾选列表清空
                    if (typeof msg === "object") {
                        this.tmplObj.diagnosisMsg = msg;
                        this.idOrdersTemplate = msg.idOrdersTemplate;
                        this.tmplObj.params.idOrdersTemplate = this.idOrdersTemplate;
                        this.$nextTick(()=>{
                            this.tmplObj.visible = true;
                        })
                    }
                });
            },
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
            upDataSaveLoading(isLoading) {
                this.saveloading = isLoading;
            },
            //引用到医嘱
            quoteToOrders() {
                this.saveloading = true;
                this.$refs.DrugsTableCom.handerTmplSaveOrders();
            },
            //关闭
            cancel() {
                this.$emit("cancle");
            },
        },
    };

</script>

<style lang="scss" scoped>
    .outp_tmpl{
        height: 100%;
        .tmpl_content{
            overflow: hidden;
            padding: 15px 15px 0;
        }
        .footer{
            padding: 16px;
            text-align: right;
        }
    }
</style>
        