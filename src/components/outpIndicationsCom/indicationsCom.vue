<template>
    <div class='indicationsCom'>
         <el-row class="IndicationInfo" :class="{isFromBar: isFromBar}">
            <el-col :span="24">  
                <div v-for='(item, index) in IndicationsForm.IndicationInfoList' :key="index">
                    <div v-if="!index && showTemplate(item)">
                        <span class="prPriceItemVsInsuranceVOList ellipsis" :style="fromWidth ? 'width: ' + fromWidth + 'px' : ''">
                            <span> 项目信息：</span>
                            <template v-if="!isFromBar">
                                 <span  v-show="getDescObj(item).priceItemName">【{{getDescObj(item).priceItemName}}】</span>&nbsp;
                                <span >{{getDescObj(item).sdConstrainedLevelDataName ? getDescObj(item).sdConstrainedLevelDataName : ''}}</span>&nbsp;
                            </template>
                            <span>【适】</span>
                            <span>{{getDescObj(item).description ? getDescObj(item).description : '无'}}</span>&nbsp;
                        </span>
                        <span 
                            class="nameInfodetailed" 
                            v-show='showDetailed(item, getDescObj(item))'>
                            【<b class="detailed" @click="IndicationsForm.IndicationsVisible = true">详细</b>】
                        </span>
                    </div>
                </div>
            </el-col>
        </el-row>
        <div v-if="IndicationsForm.IndicationsVisible" class="isModal"></div>
        <el-dialog
            class="IndicationsComDiaglog"
            title="医保项目目录说明"
            :visible.sync="IndicationsForm.IndicationsVisible"
            width="665px"
            :modal="false"
            :close-on-press-escape="false"  
            :close-on-click-modal="false">
            <div>
                <div v-for='(item, index) in IndicationsForm.IndicationInfoList' :key="index">
                    <div v-for='(pr, prIndex) in item.prPriceItemVsInsuranceVOList' style="margin-bottom: 7px;" :key="prIndex">
                        <span class="" v-show="pr.priceItemName">【{{pr.priceItemName}}】</span>&nbsp;
                        <span class="">{{pr.sdConstrainedLevelDataName ? pr.sdConstrainedLevelDataName : ''}}</span>&nbsp;
                        <span class="">【适】</span>
                        <span class="">{{pr.description ? pr.description : '无'}}</span>&nbsp;
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" class="IndicationsBtns" @click="IndicationsForm.IndicationsVisible = false">取 消</el-button>
            </span>
        </el-dialog>    
    </div>
</template>

<script>
    export default {
        name: '',
        props: ["IndicationsForm", "fromWidth", 'fromType'],
 
        computed: {
            isMaxLength( ) {
                if(this.isFromBar) return 15
                if(this.fromWidth) return 6
                return 20
            },
            isFromBar() {
                return this.fromType === 'mBar'
            },
            getDescObj(){
                return (item)=>{
                    return item.prPriceItemVsInsuranceVOList.find(v=> v.description) || item.prPriceItemVsInsuranceVOList[0]
                }
            }
        },
        methods: {
            //显示适应症 --  详细
            showDetailed(item, pr) {
                let description = pr.description || '';
                if(pr.priceItemName && description.length + pr.priceItemName.length > this.isMaxLength) {
                    return true
                } else if(item.prPriceItemVsInsuranceVOList.length > 1) {
                    return true
                } else if( this.IndicationsForm.IndicationInfoList.length > 1) {
                    let num = 0;
                    this.IndicationsForm.IndicationInfoList.map( v => {
                        if(v.prPriceItemVsInsuranceVOList.length > 0) num++
                    })
                    if(num > 1)  return true
                } else {
                    return false
                }
            },
            showTemplate(item){
                return item.prPriceItemVsInsuranceVOList && item.prPriceItemVsInsuranceVOList.length 
            },
        },

    };

</script>

<style lang="scss" src="./indicationsCom.scss">

</style>