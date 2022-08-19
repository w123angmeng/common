<template>
    <div class="temperature-chart" id="temperature-chart" ref="temperatureChart">
        <div class="tempShow" id="tempShow" ref="tempShow">
            <PatientInfo :hospital="hospital" :patientList="patientList" @getHeaderH="getHeaderH" />
            <div class="tempCartSvg" ref="tempCartSvg">
                <!-- 病人信息组件  -->
                <!-- <div class="fixed_div"> -->
                <!-- <PatientInfo :hospital="hospital" :patientList="patientList"/> -->
                <!-- </div> -->
                <div class="flow_div">
                    <!-- 日期 住院天数展示  -->
                    <table
                        class="showInfo"
                        style="
                            border-collapse: collapse;
                            width: 100%;
                            table-layout: fixed;
                            border-bottom: none;
                        "
                        border="solid 1px #3C3C3C"
                        cellpadding="0"
                        cellspacing="0"
                    >
                        <Colgroup />
                        <TableInfo
                            :beginDate="beginDate"
                            :titleBarMap="titleBarMap"
                            :dayOps="dayOps"
                            :dayList="dayList"
                        />
                    </table>
                    <!-- 中间主内容区域 -->
                    <div class="svgCenter" style="position: absolute; width: 100%; z-index: 98">
                        <SvgCenter
                            ref="svgCenter"
                            :beginDate="beginDate"
                            :pointTime="pointTime"
                            :curDate="beginDate"
                            :completeData="params.completeData"
                        />
                    </div>
                    <!-- 背景区域  -->
                    <table
                        class="tableSvg"
                        style="
                            width: 100%;
                            border-collapse: collapse;
                            table-layout: fixed;
                            border-bottom: none;
                        "
                        border="solid 1px #3C3C3C"
                        cellpadding="0"
                        cellspacing="0"
                    >
                        <Colgroup />
                        <GridTable
                            :tempTrH="tempTrH"
                            :tempStrucItem="tempStrucItem"
                            :beginDate="beginDate"
                            :breathingList="breathingList"
                            :signConfigData="signConfigData"
                            :dayMap="dayMap"
                            :pointTime='pointTime'
                            :isPrint="isPrint"
                        />
                    </table>
                </div>
            </div>
            <div class="pageFooter" ref="pageFooter">
                <span class="printHide">{{ params.pageNum }} / {{ params.pageTotal }}</span>
                <span class="printSow">第 {{ params.pageNum }} 页</span>
            </div>
            <!-- 体温单图形标识 如果tempChartData的长度为0则不显示 -->
            <div class="tempChartLogo" v-if="tempChartData.length>0">
                <TempChartLogo :tempChartData="tempChartData"></TempChartLogo>
            </div>
        </div>
    </div>
</template>

<script>
// import html2canvas from 'html2canvas';
import bus from "@/components/common/bus.js";
import GridTable from "./gridTable";
import Colgroup from "./colgroup";
import PatientInfo from "./patientInfo";
import TableInfo from "./tableInfo";
import SvgCenter from "./svgCenter";
import TempChartLogo from "./tempChartLogo";

export default {
    name: "temperatureChart",
    props: ["params", "tempChartLogoData", "isPrint"],
    data() {
        return {
            beginDate: this.params.beginDate, //开始时间
            hospital: this.params.hospital, //医院
            patientList: this.params.patientList, //患者信息
            dayOps: this.params.dayOps, //术后/产后天数
            breathingList: this.params.breathingList, //呼吸次数
            dayList: this.params.dayList, //住院天数
            dayMap: this.params.dayMap, //每日录入信息
            pointTime: this.params.pointTime, // 时间段录入信息
            signConfigData: this.params.signConfigData,
            titleBarMap: this.params.titleBarMap,
            tempStrucItem: this.params.tempStrucData, // 体温单模板
            tempTrH: this.params.tempTrHeight,
            tempTrW: this.params.tempTrWidth,
            temShow: false,
            headerH: 0,
            conH: 0,
            footerH: 0,
            addRows: 0,
            msg: "this is temperatureChart.vue",
        };
    },
    components: {
        GridTable,
        Colgroup,
        PatientInfo,
        TableInfo,
        SvgCenter,
        TempChartLogo
    },
    created() {},
    computed: {
        tempChartData() {
            if (this.tempChartLogoData.length) {
                return this.showPointTuglie(this.tempChartLogoData);
            } else {
                return [];
            }
            
        },
    },
    mounted() {
        setTimeout(() => {
            if(!this.$refs.tempCartSvg) return;
            this.conH = this.$refs.tempCartSvg.offsetHeight;
            this.footerH = this.$refs.pageFooter.offsetHeight;
            // console.log(this.headerH, this.conH, this.footerH);
            // console.log(this.$refs)
            this.calcH();
        }, 0);
    },
    methods: {
        getHeaderH(h) {
            this.headerH = h;
        },
        calcH() {
            // [最外层总的高度-头部高度-中间内容高度-页脚高度-（头部padding+页脚padding）]/格子的高度
            let n = Math.floor(
                (1122 - this.headerH - this.conH - this.footerH - 100) / 15
            );
            // console.log(n);
            // this.addRows = n;
            bus.$emit("getAddRows",n);
        }
    },
    watch: {
        params: {
            handler(newV, oldV) {
                // console.log('参数更改---')
                this.beginDate = newV.beginDate;
                this.dayList = this.params.dayList;
                this.dayOps = this.params.dayOps;
                this.patientList = this.params.patientList; //患者信息
                this.breathingList = this.params.breathingList;
                this.dayMap = this.params.dayMap;
                this.tempTrH = this.params.tempTrHeight;
                this.pointTime = this.params.pointTime;
                this.tempStrucItem = this.params.tempStrucData;
                this.titleBarMap = this.params.titleBarMap;
                this.tempTrW = this.params.tempTrWidth;
                setTimeout(() => {
                    this.calcH();
                    // 数据变化重新计算要绘制的空格子树
                }, 0);
                
            },
            deep: true,
            
        },
    },
};
</script>

<style lang="scss">
/* @import '../assets/styles/app.scss'; */
</style>
