<template>
    <div class='testLeftCommon'>
       <div class="testTitle">
           检验申请单列表
            <el-button 
                type="text" 
                v-if="!docCloseVisitState"
                @click="handleAdd"
                class="testAddBtn">
                <img src="@/assets/images/outpDoctor/outp_add.svg" alt="" style="width:16px;" >
            </el-button>
       </div>
       <div class="testSroll_wrap">
           <template v-if="testApplyList.length">
               <div 
                    v-for="(item, index) in testApplyList" 
                    :key="index" 
                    class="itemTestApply" 
                    :class="{curApply: curApply.idApplyLab === item.idApplyLab}"
                    @click="changeCurApply(item, index)">
                    <div class="fRow f1">
                        <span>日期: {{item.dtApply}}</span>
                        <el-divider direction="vertical"></el-divider>
                    </div>
                    <el-tooltip  effect="dark" 
                        :content="item.itemNames"
                        :disabled='showTitle(item, true)'
                        placement="right-end">
                        <div class="fRow fRow1 ellipsis"> 项目: {{item.itemNames}}</div>
                    </el-tooltip>
                    <div class="fRow"> 标本: {{item.specimenName}} </div>
                    <div> 科室: {{item.deptName}}</div>
                    <div class="st" :class="showColor(item)">{{item.sdLabStatusStr}}</div>
                </div>
           </template>
           <template v-else>
                <!-- v-if="searchStatus" -->
                <img 
                    class="simpleImgSvg" 
                    src="@/assets/images/iconSmall/simple.svg"
                    alt="">
           </template>
           
       </div>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
 
    export default {
        props: {
            inspectData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            isFromInpDoctor: {
                type: Boolean,
                default: () => {
                    return false
                }
            },
        },
        data() {
         
            return {
                curApply: {},
                testApplyList: []
            };
        },
        computed: {
            ...mapGetters(["docCloseVisitState"]),
            applyListUrl() {
                let url = this.isFromInpDoctor ? '/doctws/inspect/listAllInspect' : '/outpdr/inspect/listAllInspect';
                return url
            },
            editApplyUrl() {
                let url = this.isFromInpDoctor ? '/doctws/inspect/findInspectInfo' : '/outpdr/inspect/findInspectInfo';
                return url
            },
        },
        created() {
            this.getData(true);
        },
        methods: {
            getData(flag) {
                this.$axios.post( this.applyListUrl, {
                    idVisit: this.$route.query.idVisit,
                }).then(res => {
                    if (res.success) {
                        this.testApplyList = res.data;
                        this.testApplyList.map( item => {
                            let str = item.itemList.map( v =>{
                                return v.itemName
                            }).join('、');
                            item.itemNames = str
                        })
                        if(flag && this.testApplyList.length) this.changeCurApply(this.testApplyList[0]);
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },
            //新增
            handleAdd() {
                this.curApply = {};
                this.$emit('addTestApply')
            },
            //切换项目
            changeCurApply(item, index) {
                this.curApply = item;
                this.$emit('changeCurApplyItem', item)
                this.handlerEdit(item);
            },

            handlerEdit(item) {
                this.$axios.post(this.editApplyUrl, {
                    idVisit: this.$route.query.idVisit,
                    applyLabCode: item.applyLabCode
                }).then(res => {
                    if (res.success) {

                        this.$emit('editTestApplyData',res.data, item)
                        
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            showTitle(item, flag) {
                let name = item.itemNames || '';
               
                if(flag ) {
                    return name.length < 12 ? true : false
                } else {
                    return name
                }
            },

            showColor(item) {
                let obj = {
                    '已申请': 'c189',
                    '已收费': 'cOrange',
                    '已登记': 'cOrange',
                    '已采集': 'cpink',
                    '初步报告': 'cgreen',
                    '确认报告': 'cgreen',
                }
                if( !obj[item.sdLabStatusStr]) return ''
                return obj[item.sdLabStatusStr]
            },

        },
        watch: {
            
        }
    };

</script>

<style lang="scss" src="../index.scss"></style>
