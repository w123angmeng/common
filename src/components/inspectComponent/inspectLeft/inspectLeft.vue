<template>
    <div class='inspectLeft flexColumn'>
        <div class="inspectTitle flexRow">
            <p>检查申请单列表</p>
            <el-button
                v-if="!docCloseVisitState"
                type="text"
                @click="handleAdd"
                class="addBtn">
                <img src="@/assets/images/outpDoctor/outp_add.svg" alt="" style="width:16px;"/>
            </el-button>
        </div>
        <ul class="inspectList" v-if="applyList.length">
            <li :class="currentIndex == index ? 'active': ''" v-for="(item,index) in applyList" :key="index" @click="changeCurrentIndex(item, index)">
                <div>
                    <span class="cgray">日期: {{item.dtApplyExam}}</span>
                    <el-divider direction="vertical"></el-divider>
                </div>
                <el-tooltip class="item" effect="dark"
                    :content="item.itemNames" 
                    :disabled="showTitle(item, true)"
                    placement="right-end">
                    <p class="line_clamp">项目: {{item.itemNames}}</p>
                </el-tooltip>
                <p>科室: {{item.deptName}}</p>
                <span class="status" :class="getColor(item)">{{item.sdSuExamStr}}</span>
            </li>
        </ul>
        <div v-else class="nodata el-table__empty-text">
            <img
                class="simpleImgSvg"
                src="@/assets/images/iconSmall/simple.svg"
                style="width:64px;"
                alt="">
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import bus from "@/components/common/bus.js";

const primaryStatus = ['已申请'];
const reportStatus = ['初步报告', '确认报告'];
const backStatus = ['已取消', '已驳回'];
const chargeStatus = ['已预约', '已登记'];

export default {
    props:{
        isFromInpDoctor: {
            type: Boolean,
            default: () => {
                return false
            }
        },
    },
    data(){
        return{
            applyList: [],
            currentIndex: -1
        }
    },
    computed:{
        ...mapGetters(['docCloseVisitState']),
        applyListUrl() {
            let url = this.isFromInpDoctor ? '/doctws/ciApplyExam/findAllExamByIdVisit' : '/outpdr/ciApplyExam/findAllExamByIdVisit';
            return url
        },
    },
    created () {
        bus.$off('refreshInspectLeftList');
        bus.$on('refreshInspectLeftList', (item)=> { //刷新申请单列表
            this.getApplyList();
        });
    },
    mounted () {
        this.getApplyList().then(()=>{
            if(this.applyList[0]){
                this.changeCurrentIndex(this.applyList[0], 0); //默认选中第一个检查单
            }
        })
    },
    methods: {
        //获取状态颜色
        getColor(item) {
            return {
                'c189': primaryStatus.includes(item.sdSuExamStr),
                'cOrange': chargeStatus.includes(item.sdSuExamStr),
                'cgray': backStatus.includes(item.sdSuExamStr),
                'cgreen': reportStatus.includes(item.sdSuExamStr),
            }
        },

        showTitle(item, flag) {
            let name = item.itemNames || '';
            
            if(flag ) {
                return name.length < 12 ? true : false
            } else {
                return name
            }
        },

        //新增
        handleAdd() {
            this.currentIndex = -1;
            // 重置树的选中、重置表单
            this.$emit('resetInspectAdd')
        },

        //获取检查申请单列表
        getApplyList() {
            this.currentIndex = -1;
            return this.$axios.post(this.applyListUrl, {
                idVisit: this.$route.query.idVisit
            }).then(res => {
                if (res.success) {
                    let resData = ( res.data || []).map(item=>{
                        //处理6个字的状态
                        item.sdSuExamStr = item.sdSuExamStr === '医技科室驳回' ? '已驳回' : item.sdSuExamStr;
                        let str = item.itemList.map( v =>{
                            return v.itemName
                        }).join('、');
                        item.itemNames = str;
                        return item;
                    })
                    this.applyList = resData;
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },

        //切换选中的申请单
        changeCurrentIndex(item, index) {
            this.currentIndex = index;
            bus.$emit('inspectRightSeeInfo', item); //更新右侧已选项目
        },
    }
}
</script>
<style src='./inspectLeft.scss' lang="scss" scoped>
</style>
