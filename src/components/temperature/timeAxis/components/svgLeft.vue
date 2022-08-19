<template>
    <div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;">
        <!-- 标尺 -->
        <svg id="svgLeft" style="height:100%" v-if="!isPainCurve">
            <template v-for="(pitem,i) in leftScaleArr">
                <template  v-for="(item,ii) in pitem">
                    <line v-if="doCheckLabelLine(item.label,item.value)" :key="item.key+item.y1+ii+i" :max="item.max" :min="item.min" :type="item.type"
                        :x1="item.x1" :y1="item.y1" :x2="item.x2" :y2="item.y2" :style="item.style"/>
                    <text v-if="doCheckLabelText(item,item.value)" :key="item.key+item.y" :type="item.type"
                        :x="item.x" :y="item.y" :style="item.style" :value="item.value" :fill="item.fill">
                        {{item.value}}
                    </text>
                </template>
            </template>
        </svg>
        <svg v-else style="width:100%;height: 100%; position:absolute; top: 0; left: 0;">
            <!-- 疼痛曲线标尺 -->
            <template  v-for="(item,ii) in painScale">
                <line v-if="doCheckLabelLine(item.label,item.value)" :key="item.key+item.y1+ii" :max="item.max" :min="item.min" :type="item.type"
                    :x1="item.x1" :y1="item.y1" :x2="item.x2" :y2="item.y2" :style="item.style" :id="item.id+item.key"/>
                <text v-if="doCheckLabelText(item,item.value)" :key="item.key+item.y" :type="item.type"
                    :x="item.x" :y="item.y" :style="item.style" :value="item.value" :fill="item.fill">
                    {{item.value}}
                </text>
            </template>
        </svg>
    </div>
</template>
<script>
  import {mapMutations,mapGetters} from 'vuex'
    export default {
        name:"svgLeft",
        props:["isPainCurve"],
        data(){
            return{
                leftScaleArr:[],//用于循环渲染标尺
                svgLeftWidth: '',
                tempTrHeight: '',
                painScale: [], // 疼痛曲线标尺
            }
        },
        created(){
        },
        computed: {
            ...mapGetters([
                'KDobj'
            ]),
            tempTrCurHeight() {
                return this.KDobj.trHeight
            }
        },
        watch: {
            tempTrCurHeight: {
                handler: function (val, oldval) {
                    this.drawCalibrationline();
                },
                deep: true
            }
        },
        mounted() {
            this.evtListenrTempWidth();
            let that = this;
            this.$nextTick(() => {
                window.addEventListener("resize", function () {
                    that.evtListenrTempWidth();
                });
            });
            this.drawCalibrationline();
        },
        methods:{
            /* 温度 刻度线 */
            drawCalibrationline(){
                this.leftScaleArr = [];
                let wdStartValue = Number(this.KDobj.wdStartValue);
                let wdEndValue   = Number(this.KDobj.wdEndValue);
                let disKDWD      = Number(this.KDobj.disKDWD);
                let trLittleCounts = Number(this.KDobj.trLittleCounts);
                let lastTr = Number(this.KDobj.lastTr);
                let mbStartValue = Number(this.KDobj.mbStartValue);
                let mbEndValue = Number(this.KDobj.mbEndValue);
                let disKDMB = Number(this.KDobj.disKDMB);
                let hxStartValue = Number(this.KDobj.hxStartValue);
                let hxEndValue = Number(this.KDobj.hxEndValue);
              
                let disKDHX = Number(this.KDobj.disKDHX);
                let trRowBeginHX = Number(this.KDobj.trRowBeginHX);
                let trRowEndHX = Number(this.KDobj.trRowEndHX);
                //获取标尺禁用与启用
                let showScaleTW = this.KDobj.scaleDisplayObj.showScaleTW;
                let showScaleMB = this.KDobj.scaleDisplayObj.showScaleMB;
                let showScaleHX = this.KDobj.scaleDisplayObj.showScaleHX;
                // 温度
                let tempIsShow = false;
                let mbIsShow = true;
                let hxIsShow = true;
                if (showScaleTW && !showScaleMB && !showScaleHX) {
                    tempIsShow = true;
                }
                if (!showScaleTW && showScaleMB && !showScaleHX) {
                    mbIsShow = true;
                }
                if (!showScaleTW && !showScaleMB && showScaleHX) {
                    hxIsShow = true;
                }
                let showScaleTWInfo = {
                    markName:'wd',
                    beginKD:wdStartValue,
                    endKD:wdEndValue,
                    disKD:disKDWD,
                    trRowBegin:trLittleCounts,
                    trRowEnd:lastTr,
                    isShowdemarcate:tempIsShow
                }
                // 脉搏
                let showScaleMBInfo = {
                    markName:'mb',
                    beginKD:mbStartValue,
                    endKD:mbEndValue,
                    disKD:disKDMB,
                    trRowBegin:trLittleCounts,
                    trRowEnd:lastTr,
                    isShowdemarcate:mbIsShow
                }
                //呼吸
                let showScaleHXInfo = {
                    markName:'hx',
                    beginKD:hxStartValue,
                    endKD:hxEndValue,
                    disKD:disKDHX,
                    trRowBegin:trLittleCounts,
                    trRowEnd:lastTr,
                    isShowdemarcate:hxIsShow
                }
                // ....
                let scaleInfoArr = [];//刻度尺数据配置 ******注意这里根据标尺位置反序排列 温度除外
                if(showScaleTW){
                    scaleInfoArr.push(showScaleTWInfo)
                }
                if(showScaleMB){
                    scaleInfoArr.push(showScaleMBInfo)
                }
                if(showScaleHX){
                    scaleInfoArr.push(showScaleHXInfo)
                }
                let len = scaleInfoArr.length;
                scaleInfoArr.map((item,i) => {
                    let x = this.handleX(len,i);//根据标尺数量，计算偏移量
                    this.leftScaleArr.push(this.drawSvgScale({
                        markName: item.markName,
                        x: x,
                        stepSide: true,
                        valueShow: true,
                        beginKD: item.beginKD,
                        endKD: item.endKD,
                        width: 10,
                        disKD: item.disKD,
                        trRowBegin: item.trRowBegin,
                        trRowEnd: item.trRowEnd,
                        isShowdemarcate: item.isShowdemarcate,
                    }).scaleArray)
                })
                this.painTick();
            },
            // 疼痛刻度线
            painTick() {
                //疼痛
                let ttStartValue = Number(this.KDobj.ttStartValue);
                let ttEndValue = Number(this.KDobj.ttEndValue);
                let disKDTT = Number(this.KDobj.disKDTT);
                let painX = this.handleX(2,0);//根据标尺数量，计算偏移量
                this.painScale = this.drawSvgScale({
                    markName:'tt',
                    x: painX,
                    stepSide: true,
                    valueShow: true,
                    beginKD:ttStartValue,
                    endKD:ttEndValue,
                    disKD:disKDTT,
                    width: 8,
                    trRowBegin:0,
                    trRowEnd:5,
                    demarcateId: 'pain_',
                    isShowdemarcate:false,
                }).scaleArray;
            },
            handleX(len,i){
                let svgW = this.svgLeftWidth ? this.svgLeftWidth : '120'
                let x = ''
                if (len == 3){
                    if(i==0) {
                        let first = Number(svgW) / 100;
                        x = first.toString();
                    } else if (i == 1){
                        let spaceW = (Number(svgW) / 100 / 3) * 2;
                        x = spaceW.toString() // String(i*0.35)
                    } else {
                        let spaceW = (Number(svgW) / 100 / 3) * 1;
                        x = spaceW.toString() // String(i*0.35)
                    }
                } else if(len == 2){
                    if(i==0) {
                        // x = '1.05'
                        let first = Number(svgW) / 100;
                        x = first.toString();
                    } else{
                        // x = '0.5'
                        let spaceW = (Number(svgW) / 100 / 2) * i;
                        x = spaceW.toString() // String(i*0.35)
                    }
                } else {
                    let onlyOne = Number(svgW) / 100 / 2
                    x = onlyOne.toString();
                }
                
                return x;
            },
            doCheckLabelLine(label,val){
                if (label == 'line') {
                    return true
                }else{
                    return false
                }
            },
            doCheckLabelText(item,val){
                let wdEndValue = Number(this.KDobj.wdEndValue);
                let mbEndValue = Number(this.KDobj.mbEndValue);
                let hxEndValue = Number(this.KDobj.hxEndValue);
                let ttEndValue = Number(this.KDobj.ttEndValue);
                let ttStartValue = Number(this.KDobj.ttStartValue);
                let trLittleCounts = Number(this.KDobj.trLittleCounts);
                if( trLittleCounts == 0){
                    if(item.label == 'text' ){
                        switch (item.type) {
                            case "tt_line":
                                if (val!==ttEndValue && val !== ttStartValue) {
                                    return true;
                                }
                                break;
                            case "mb_line":
                                if (val!== mbEndValue) {
                                    return true;
                                }
                                break;
                            case "wd_line":
                                if (val!== wdEndValue) {
                                    return true;
                                }
                                break;
                            case "hx_line":
                                if (val!== hxEndValue) {
                                    return true;
                                }
                                break;
                            default:
                                break;
                        }
                    }else{
                        return false
                    }
                }else if(item.label == 'text'){
                    return true
                }
            },
            evtListenrTempWidth() {
                if (!document.querySelector('.temperature-chart')) return;
                let tempWidth = document.querySelector('.temperature-chart').clientWidth;
                // let svgWidth = document.querySelector('#msvg').clientWidth;
                if (!document.querySelector('#msvg')) return;
                let svgWidth = document.querySelector('#msvg').width.animVal.value;
                // 需要减去padding左右两边值 + 1px
                let widToFixed = (tempWidth - svgWidth - 42).toFixed(2);
                this.svgLeftWidth = Number(widToFixed);
                this.drawCalibrationline();
            }
        },
        destroyed() {
            window.removeEventListener("resize", this.evtListenrTempWidth);
        },
    }
</script>
<style lang="scss" scoped>
  /* @import '../assets/styles/app.scss'; */
</style>

