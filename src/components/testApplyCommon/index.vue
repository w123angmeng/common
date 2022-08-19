<template>
    <div class='testApplyCommon'>
        <TestLeft
            :isFromInpDoctor="isFromInpDoctor" 
            @addTestApply="addTestApply"
            @editTestApplyData="editTestApplyData"
            @changeCurApplyItem="changeCurApplyItem"
            ref="TestLeft">
        </TestLeft>
        <TestMiddle 
            :isFromInpDoctor="isFromInpDoctor"
            :tabCommonParmas="tabCommonParmas"
            :inspectData="sourceParmasObj" 
            :isEdit="isEdit"
            @getTestApplyList="getTestApplyList"
            ref="TestMiddle">
        </TestMiddle>
    </div>
</template>

<script>
    import { mapMutations, mapGetters } from "vuex";
    import TestLeft from './common/testLeft.vue';
    import TestMiddle from './common/testMiddle.vue';
    export default {
        props: {
            inspectData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            tabCommonParmas: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            sourceFLag: {
                type: String,
                default: () => {
                    return ''
                }
            },
        },
        data() {
            return {
                isEdit: false,
            };
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
        components: {
            TestLeft, 
            TestMiddle, 
        },
        methods: {
            ...mapMutations(["SET_DOCCLOSEVISITSTATUS"]),

            getSaveStatus() {
                return this.$refs.TestMiddle.isSaveStatus;
            },
            //获取列表
            getTestApplyList() {
                this.$refs.TestLeft.getData();
                this.addTestApply();
            },

            //切换项目
            changeCurApplyItem(item) {
                this.$nextTick(()=> {
                    this.$refs.TestMiddle.alreadyAddItems = [];
                })
            },

            //编辑数据
            editTestApplyData(data, Obj) {
                this.isEdit = true;
                this.handleReset();
                this.$refs.TestMiddle.handlerMiddleEdit(data, Obj);
            },

            //新增
            addTestApply() {
                this.isEdit = false;
                this.handleReset();
            },

            //清空
            handleReset() {
                this.$refs.TestMiddle.handleReset(); 
            },

            //提交
            handleSubmitCommon() {
                return this.$refs.TestMiddle.handleSubmit(); 
            },

        },
    };

</script>

<style lang="scss" src="./index.scss"></style>
