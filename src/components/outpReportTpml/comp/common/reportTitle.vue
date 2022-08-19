<template>
    <div class="myReportTitle">
        <div class="reportTitle flexRow">
            <div class="check-report"><span>{{currentReport}}报告单 ({{row.itemName}})</span> <span class="reportItem" :class="{live:row.sdVisitType=='2'}">{{row.sdVisitType|sdVisitTypeFilter}}</span>
            <div class="applyTime flexRow">
                <span style="margin-right: 12px;">申请时间:<span>{{row.applyDate || row.visitDate}} </span></span>
                <span>报告时间:<span>{{row.reportDateTime||'无'}} </span></span>
            </div>
            </div>
            <div class="flexRow">
                <!-- 阿特蒙： 检查： pdf报告（除心电图） 心电图不展示pdf报告；-->
                <el-tooltip popper-class="tooltips" effect="dark" content="无PDF报告信息" placement="top" v-if="isInspect"
                    :disabled="isShowPdfUrl"
                    >
                    <el-button type="text" :class="[{'disabledClass': !isShowPdfUrl},'originalReport']" @click="lookOriginalReport($event,'pdf')">PDF报告</el-button>
                </el-tooltip>
                <el-tooltip popper-class="tooltips" effect="dark" :content="tips" placement="top"
                    :disabled="isLookOriginalReportBtn"
                    v-if="showReport && (isLookOriginalReportBtn || isInspect)"
                    >
                    <el-button type="text" :class="[{'disabledClass': !isLookOriginalReportBtn},'originalReport']" @click="lookOriginalReport">{{lookOriginalReportBtnText}}</el-button>
                </el-tooltip>
            </div>
        </div>
        <el-divider></el-divider>
        <slot name="nodata"></slot>    
    </div>
    
</template>

<script>
export default {
    name:'reportTitle',
    props:{
        row:{
            type:Object,
            default(){
                return {}
            }
        },
        typeMap:{
            type:Map,
            default(){
                return new Map()
            }
        },
        showBtn: {
            type: Boolean|Number,
            default: false
        },
        isShowPdfUrl: {
            type: Boolean,
            default: false
        },
        isInPatient: { //住院
            type: Boolean,
            default: false
        },
    },
    data(){
        return {
            electrocardiogram: Object.freeze('心电图'),
            tips: this.isElectroCard ? '无PDF报告信息' : '无原始影像信息'
        }
    },
    computed:{
        showReport(){
            return !this.row.hideBtn; // 来源于护士站
        },
        currentReport(){
            if(this.typeMap.get(this.row.sdClinicType)){
                return this.typeMap.get(this.row.sdClinicType).label
            }
            return ''
        },
        isTest() {
            //目前阿特蒙没有特检
            let type = [this.CONSTANT.TEST_TYPE]
            return type.includes(this.row.sdClinicType)
        },
        isAtmeng(){
            return this.$limits.isFun(this)
        },
        isLookOriginalReportBtn() {
            // if(this.isTest || this.showBtn) return true
            return !!this.showBtn
        },
        lookOriginalReportBtnText() {
            // 住院，使用按钮名称--检查-查阅影像；检验-原始报告；病理-原始报告
            if(this.isInPatient){
                let btnText = '';
                switch(this.row.sdClinicType){
                    case this.CONSTANT.INSPECT_TYPE:
                        // if(this.isElectroCard) btnText="PDF报告"; // 检查-> 心电图： pdf报告
                        // else btnText="原始影像"; break; // 检查-》原始影像
                        btnText="原始影像"; break; // 检查-》原始影像
                    case this.CONSTANT.TEST_TYPE:
                    case this.CONSTANT.PATHOL0GY_TYPE: btnText="原始报告"; break;
                    default: btnText="查看原始报告"; break;
                }
                return btnText;
            }else{ // 门诊显示
                if(this.isInspect) return '原始影像';
                else  return '查看原始报告';
            }
        },
        isElectroCard(){ // 是否是心电图
            return this.row.examClass == this.electrocardiogram
        },
        isInspect(){ // 阿特蒙检查类型处理
            // return this.isAtmeng && (this.row.sdClinicType == this.CONSTANT.INSPECT_TYPE)
            return this.row.sdClinicType == this.CONSTANT.INSPECT_TYPE;
        }
    },
    filters:{
        sdVisitTypeFilter(val){
            let map = new Map().set('1','门诊').set('2','住院').set('3','护士站')
            return map.get(val)
        }
    },
    methods: {
        //查看原始报告
        lookOriginalReport(e,params='') {
            this.$emit('lookTestOriginalReport',params)
        },
    },
    created(){
    }
}
</script>

<style lang="scss">
.reportTitle{
    width: 100%;
    font-size: 16px;
    box-sizing: border-box;
    align-items: center;
    position: relative;
}
.reportTitle .el-divider--horizontal{
    margin:16px 0;
}
.reportTitle .applyTime{
    min-width: 220px;
    color: #8C8C8C;
    font-size: 12px;
    line-height: 24px;
    display: inline-block;
}
 .check-report {
    font-weight: bold;
    flex: 1;
}
 .check-report .reportItem{
    font-style: normal;
    box-sizing: border-box;
    background: rgba(238, 249, 232, 1);
    border: 1px solid #CBEDBA;
    color: rgba(82, 196, 26, 1);
    border-radius: 4px;
    font-size: 14px;
    padding: 2px 3px;
    margin-left: 10px;
    margin-right: 24px;
    
}
 .check-report .reportItem.live{
    background: rgba(238, 249, 232, 1);
}
.myReportTitle .originalReport {
    font-size: 14px;
    &.disabledClass{
        color: #c0c4cc;
    }
}
// 自定义修改tooltip
.tooltips{
    &.el-tooltip__popper{
        background: #262626!important;
        color: #fff!important;
        &[x-placement^=top] .popper__arrow::after {
            border-top-color:#262626 !important;
        }
    }
}
</style>