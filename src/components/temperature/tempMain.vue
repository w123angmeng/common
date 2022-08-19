<template>
    <!-- 引入体温单 -->
    <div class="main" v-loading="allLoading" :element-loading-text="allLoadingText">
        <div class="title" id="temperatureTitlePrint">
            <div class="dateBox">
                <el-date-picker 
                    v-model="inpTemDate" 
                    @change="dateChange" 
                    type="date" 
                    align="right" 
                    :default-value="curDate"
                    value-format="yyyy-MM-dd" 
                    placeholder="选择日期" 
                    class="tempDateSty"
                    popper-class="tempDateSty"
                    :clearable="false"
                    :editable="false"
                    :picker-options="pickerOptions">
                </el-date-picker>
                <el-button type="text" @click="lastWeekBtn" :disabled="lastBtnDis" :loading="lastBtnDialog">上一周</el-button>
                <el-button type="text" @click="nextWeekBtn" :disabled="nextBtnDis" :loading="nextBtnDialog">下一周</el-button>
               
            </div>
            <div class="zoomOutOrIn">
                <el-button class=" btnW " :class="perCurType == '-1' ? 'perCurBg' : ''" type="text" @click="zoomScale(-1)">
                    <span class="zoomIn"><img src="./tempImg/zoomIn.png" alt=""></span>
                </el-button>
                <el-button class="perFz12 cl8c8c8c btnW " type="text">{{temPercentage}}%</el-button>
                <el-button class=" btnW " :class="perCurType == '+1' ? 'perCurBg' : ''" type="text" @click="zoomScale(+1)">
                    <span class="zoomOut"><img src="./tempImg/zoomOut.png" alt=""></span>
                </el-button>
                <p class="perOrigin" :class="perCurType == '0' ? 'perCurBg' : ''" @click="zoomScale(0)">
                    <span class=" origin" ><img src="./tempImg/origin.png" alt=""></span>
                </p>
            </div>
            <div class="btnBox">
                <el-button type="primary" v-show="!onlyReadEMR && !onlyRead && scalableTemParam.showTempInp" :disabled="onlyRead" @click="confirmOpen">体温单录入</el-button>
                <!-- <el-button @click="doShowSet">体温单设置</el-button> -->
                <el-button @click="print" :disabled="canPrint">打印</el-button>
                <el-button @click="printAll">全部打印</el-button>
                <!-- <el-button v-show="showBtnMore" @click="lineChart">更多</el-button> -->
            </div>
        </div>
        <div class="iframeBox" id="iframeBoxPrint" :style="{height:tmpBoxHeight}">
            <TempAxis ref="tempAxis" :isPrint="isPrint" :allLoading="allLoading" :painTbTrH="painTbTrH"  @pageNumHandle="pageNumHandle" :tempTrWidth="tempTrWidth" :tempTrHeight="tempTrHeight" :inpTemDate="inpTemDate" :temParams="temParams" :temPatInfo="temPatInfo" v-if="isShowTempAxis"></TempAxis>
        </div>
        <!-- 体温单弹窗组件 测试数据设置 -->
        <TempInput ref="tempInput" v-if="tempInputShow" @closedown="closedown" :curDate="defaultCurDate" :inpTemDate="inpTemDate" :temParams="temParams" :tempInputShow="tempInputShow"></TempInput>
        <!-- 体征曲线 -->
        <el-dialog
            title="护理体征"
            v-if="lineChartShow"
            :visible.sync="lineChartShow"
            :close-on-click-modal="false"
            width="80%"
            @close="closeChart"
            v-dialogDrag
            append-to-body
        >
            <TempLineChart :onlyRead="onlyRead" :curDate="defaultCurDate" :temParams="temParams"></TempLineChart>
        </el-dialog>
        <!-- 体温单弹窗组件 测试数据设置 -->
        <!-- <TempSet v-if="TempSetShow" @closedown="closedown" :TempSetShow="TempSetShow"></TempSet> -->
        <iframe id="printContainer" class="printContainer" frameborder="0"></iframe>
        <div id="printAll" class="printAll">
            <div class="iframeBox" v-for="list in dateList" :key="list">
                <TempAxis ref="tempAxis" :isPrint="isPrint" :painTbTrH="painTbTrH" :tempTrHeight="tempTrHeight" :tempTrWidth="tempTrWidth" :inpTemDate="list" :temParams="temParams" :temPatInfo="temPatInfo"></TempAxis>
            </div>
        </div>
        <!-- 表格 -->
        <table class="getTableTrHeight">
            <tr>
                <td></td>
            </tr>
            <tr class="painTrtd">
                <td></td>
            </tr>
        </table>

        <!-- 签名确认 -->
        <HeadNurse
            v-if="showSignName"
            :userInfo="userInfo"
            @hasPower="hasPower"
            :onlyHeadNurse="true"
        ></HeadNurse>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import bus from "@/components/common/bus.js";
// import TempInput from "./tempInput/tempInput";
// import TempSet from "./tempSet/tempSet";
// import TempAxis from "./timeAxis/components/temperature";
// import TempLineChart from "./tempLineChart/tempLineChart";
const getPrintAllDate =
    window.globalUrl.tempUrl +
    "/timeaxis/tpnew/getVisitTemperaturePrintAllDateList";
const getUniqueViVisit =
    window.globalUrl.tempUrl + "/timeaxis/tpnew/getUniqueViVisit"; // 根据患者就诊ID获取患者入院信息
const hlwsSerUrl = window.globalUrl.hlwsServiceUrl;
export default {
    // props: ["temParams"],
    props: {
        temParams: {
            type: Object,
            default() {
                return {};
            }
        },
        onlyReadEMR: { // EMR体温单不可录入体征数据
            type: Boolean,
            default() {
                return false;
            }
        },
        showBtnMore: { // 更多按钮展示
            type: Boolean,
            default() {
                return true;
            }
        },
        scalableTemParam: {
            type: Object,
            default() {
                return {
                    showTempInp: true,
                }
            }
        }
    },
    data() {
        return {
            canPrint: true,
            allLoading: false,
            allLoadingText: "",
            date: "",
            dateList: [], // 全部打印日期数组
            loadNum: 0, // 全部打印体温单加载完成的数量
            inpTemDate: "",
            isShowTempAxis: false,
            tempInputShow: false,
            TempSetShow: false,
            temPatInfo: {}, // 患者信息
            curDate: '', // 当前日期
            defaultCurDate: '',
            // 时间校验
            pickerOptions: {
                disabledDate: (time) => {
                    var dateTimebegin = new Date(this.temPatInfo.admissionDateTime);
                    if (this.temPatInfo.dischargeDatetime) {
                        var endTime = new Date(this.temPatInfo.dischargeDatetime)
                        return time.getTime() < dateTimebegin.getTime()- 8.64e7 || time.getTime() > endTime.getTime();
                    } else {
                        return time.getTime() < dateTimebegin.getTime()- 8.64e7;
                    }
                    
                },
                shortcuts: [
                    {
                        text: "今天",
                        onClick(picker) {
                            picker.$emit("pick", new Date());
                        },
                    },
                    {
                        text: "昨天",
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24);
                            picker.$emit("pick", date);
                        },
                    },
                    {
                        text: "一周前",
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit("pick", date);
                        },
                    },
                ],
            },
            pageData: {},
            lastBtnDis: false,
            nextBtnDis: false,
            tmpBoxHeight: null,
            tempTrHeight: null,
            tempTrWidth: null,
            lineChartShow: false, // 折线图
            lastBtnDialog: false, // 上一周等待
            nextBtnDialog: false, // 下一周等待
            firstLoad: true,
            painTbTrH: null, // 疼痛表格高度
            temPercentage: 100, // 体温单放大缩小百分比 
            perCurType: 0,
            zoom: 0.1,
            exponent: 1,
            imgHeight: null,
            imgWidth: null,
            userInfo: {},
            showSignName: false, // 授权弹窗
            temperatureForChiefnurse: '0',
            systemOrgName: "上海阿特蒙医院",
            nurseManage: 0,
            canvasImgEle: ".temperature-chart",
            onlyRead: true, // 体温单录入是否是只读 true为只读，false为可编辑
            isPrint: false,
        };
    },
    created() {
        sessionStorage.setItem("addRows", "");
        this.getServerNowTime();
        // this.findUniqueViVisit();
        this.findPatInfoByIdVisit();
        this.userInfo = this.getUserStorage();
        // 获取是否是护士长
        this.getConfigData()
    },
    computed: {
        idVisit() {
            return this.temPatInfo.idVisit;
        }
    },
    watch: {
        // date: {
        //     handler(newName, oldName) {
        //        if(newName != new Date()){

        //        }
        //     },
        //     deep: true,
        // },
        idVisit:{
            handler: function(newVal, oldVal) {
                sessionStorage.setItem('tempDate', '')
            },
            deep:true
        },
        loadNum(newVal) {
            this.canPrint = false;
            let len = this.dateList.length;
            if (newVal == len && newVal != 0) {
                console.log("22222全部打印");
                this.printAllPreview();
            }
        },
        pageData(newVal, oldVal) {
            this.nextBtnDialog = false;
            this.lastBtnDialog = false;
            if(newVal.pageNum == 1 && this.pageData.pageTotal == 1) {
                this.lastBtnDis = true;
                this.nextBtnDis = true;
                return;
            }
            if (newVal.pageNum <= 1) {
                this.lastBtnDis = true;
                this.nextBtnDis = false;
            } else if (this.pageData.pageNum >= this.pageData.pageTotal) {
                this.nextBtnDis = true;
                this.lastBtnDis = false;
            } else if(newVal.pageNum == 1 && this.pageData.pageTotal == 1) {
                this.nextBtnDis = true;
                this.lastBtnDis = true;
            } else {
                this.nextBtnDis = false;
                this.lastBtnDis = false;
            }
        },
    },
    components: {
        // TempInput,
        TempInput: () => import("./tempInput/tempInput"),
        // TempSet,
        TempSet: () => import("./tempSet/tempSet"),
        // TempAxis,
        TempAxis: () => import("./timeAxis/components/temperature"),
        // TempLineChart,
        TempLineChart: () => import("./tempLineChart/tempLineChart"),
        HeadNurse: () => import("@/components/page/Common_WEB/temperature/tempLineChart/headNurseSignName"),
    },
    mounted() {
        this.getLoadNum();
        this.getAddRows();
        this.evtListenrTempTrHeight();
        // 监听页面浏览器高度变化
        this.addEvtListenerHeight();
        let that = this;
        this.$nextTick(() => {
            window.addEventListener("resize", function () {
                that.evtListenrTempTrHeight();
                that.addEvtListenerHeight();
            });
            
        });
    },
    methods: {
        // 放大，缩小，还原
        zoomScale(type) {
            this.perCurType = type;
            if (type == 0) {
                this.exponent = 1;
            } else {
                if (type < 0) {
                    this.exponent -=this.zoom;
                } else {
                    this.exponent +=this.zoom;
                }
                // this.exponent = Math.pow(this.zoom, this.count);
            };
            this.temPercentage = Math.floor(Number(this.exponent.toFixed(2))*100);
            this.changeImgSize(this.exponent);
        },
        // 改变图片大小
        changeImgSize(exponent) {
            let imgHtml = document.querySelectorAll('.temperature-chart')[document.querySelectorAll('.temperature-chart').length-1];
            if (!imgHtml) return;
            let transX = 0;
            imgHtml.style.transformOrigin = "0 0";
            imgHtml.style.transform= `scale(${exponent}, ${exponent}) translate(-${transX}%, 0)`;
            imgHtml.style.zoom = "1";
            
        },
        // 判断是否拥有编辑权限
        hasPower(info) {
            if (!info.show) {
                if (info.type == "cancel") {
                    this.showSignName = false;
                } else {
                    this.$message({
                        message: "您现在可以编辑了！",
                        type: "success"
                    });
                    setTimeout(() => {
                        this.showSignName = false;
                        // 体征录入
                        this.doShowInput()
                        // this.itemAdjustVisible = true;
                        // this.findVisitTemperatureVitalList();
                    }, 500);
                }
            } else {
                // 授权失败
            }
        },
        // 获取是否是护士长
        getConfigData() {
            this.$axios
                ._post(`${hlwsSerUrl}emr/common/getSystemConfigList`, { empNo: this.userInfo.empNo })
                .then(res => {
                    if (res.success) {
                        this.systemOrgName = res.data.systemOrgName;
                        this.nurseManage = res.data.nurseManage;
                        this.temperatureForChiefnurse = res.data.temperatureForChiefnurse
                        // console.log(this.temperatureForChiefnurse, this.nurseManage)
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        getAddRows(){
            let that = this;
            bus.$on("getAddRows", function (num) {
                if(that.firstLoad){
                    that.firstLoad = false;
                    sessionStorage.setItem("addRows", num);
                }
            });
        },
        lineChart() {
            this.lineChartShow = true;
            this.zoomScale(0);
        },
        closeChart() {
            this.lineChartShow = false;
        },
        pageNumHandle(pageData) {
            this.pageData = pageData;
        },
        // 上一周
        lastWeekBtn() {
            this.nextBtnDis = false;
            this.lastBtnDialog = true;
            this.inpTemDate = this.getDateStr(-7);
            bus.$emit("watchDate", this.inpTemDate);
        },
        // 下一周
        nextWeekBtn() {
            this.nextBtnDialog = true;
            this.lastBtnDis = false;
            this.inpTemDate = this.getDateStr(7);
            bus.$emit("watchDate", this.inpTemDate);
            // if (this.temPatInfo.ipStatus == 2) {
            //     this.nextBtnDis = false;
            //     // this.$message({
            //     //     type: "warning",
            //     //     message: "已经最后一页了"
            //     // })
            // } else {
            //     this.lastBtnDis = false;
            //     this.inpTemDate = this.getDateStr(7);
            //     bus.$emit("watchDate", this.inpTemDate);
            // }
        },
        // 获取当前时间
        getServerNowTime(flag) {
            this.getServerTime("ymdHms").then((time) => {
                // 如果该患者出院则传入院日期，如果在院以当前系统日期查询
                this.curDate = this.formatDate(new Date(time));
                this.defaultCurDate = this.formatDate(new Date(time))
                if (this.temPatInfo && this.temPatInfo.ipStatus == 2) {
                    this.inpTemDate = this.temPatInfo.admissionDateTime;
                } else {
                    this.inpTemDate = this.formatDate(new Date(time));
                }
            });
        },
        getDateStr(AddDayCount) {
            let dd = new Date(this.inpTemDate);
            dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
            let y = dd.getFullYear();
            let m =
                dd.getMonth() + 1 < 10
                    ? "0" + (dd.getMonth() + 1)
                    : dd.getMonth() + 1; //获取当前月份的日期，不足10补0
            let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0
            return y + "-" + m + "-" + d;
        },
        confirmOpen() {
            this.zoomScale(0);
            // 只开放给护士长使用
            if(this.temperatureForChiefnurse == '1') {
                // 是护士长
                if(this.nurseManage == 1) {
                    // 体征录入
                    this.doShowInput()
                    return
                }
                // 授权弹窗
                this.showSignName = true;
                return
            }

            
            if (this.systemOrgName.indexOf("阿特蒙") > -1) {
                this.$confirm('请优先去体征录入页面录入体征信息', '提示', {
                    distinguishCancelAndClose: true,
                    confirmButtonText: '体征录入',
                    cancelButtonText: '继续录入',
                    // type: 'warning'
                    }).then(() => {
                        // 更多
                        this.lineChart();
                        this.temPercentage = 100;
                        this.zoomScale(0);
                    }).catch(action => {
                        if (action === 'cancel') {
                            // 体征录入
                            this.doShowInput()
                            this.temPercentage = 100;
                            this.zoomScale(0);
                        }
                        
                    });
            } else {
                this.doShowInput();
                this.temPercentage = 100;
            }
        },
        doShowInput() {
            let obj = {
                temPatInfo: this.temPatInfo,
                inpTemDate: this.inpTemDate,
            };
            if (!this.inpTemDate) {
                this.inpTemDate = this.curDate;
            }
            this.tempInputShow = true;
            this.isShowTempAxis = false;
            this.TempSetShow = false;
            bus.$emit("initTempData", obj);
        },
        doShowSet() {
            this.TempSetShow = true;
            this.tempInputShow = false;
            this.isShowTempAxis = false;
        },
        closedown() {
            this.isShowTempAxis = true;
            this.tempInputShow = false;
            this.TempSetShow = false;
        },
        // 根据患者就诊ID获取患者入院信息
        findUniqueViVisit() {
            let params = {
                idVisit: this.temParams.idVisit,
                idPat: this.temParams.idPat,
                sdVisitType: this.temParams.sdVisitType,
                idDept: this.temParams.idDept,
                deptName: this.temParams.deptName,
                hisUserId: this.temParams.hisUserId,
                hisUserName: this.temParams.hisUserName,
            };
            this.$axios._post(getUniqueViVisit, params).then((res) => {
                if (res.success) {
                    this.isShowTempAxis = true;
                    let patData = res.data;
                    this.temPatInfo = {
                        name: patData.patName,
                        age: patData.patAge,
                        sex: patData.sdSex,
                        bedNo: patData.bedName, //床号
                        endemicName: patData.deptName, //科室名称
                        inpNo: patData.mrnIp, //住院号
                        wardName: patData.wardName , // 病区
                        ipStatus: patData.ipStatus, // 1 在院， 2出院
                        dischargeDatetime: patData.dischargeDatetime, // 出院日期
                        admissionDateTime:
                            patData.dtEntry == undefined
                                ? ""
                                : patData.dtEntry.split(" ")[0],
                    };
                    this.inpTemDate = this.temPatInfo.ipStatus == 2 ? this.temPatInfo.admissionDateTime : this.curDate;
                } else {
                    this.$message({
                        type: "warning",
                        message: res.message,
                    });
                }
            });
        },
        // 更改获取患者信息接口
        findPatInfoByIdVisit() {
            let params = {
               idVisit: this.temParams.idVisit 
            }
            this.$axios._post(hlwsSerUrl + "emr/hisdata/getPatientInfoByIdVisit",params).then(res=> {
                if (res.success) {
                    this.isShowTempAxis = true;
                    let patData = res.data;
                    // docCanEdit 0 不可编辑(只读)， 1可编辑
                    this.onlyRead = patData.docCanEdit == 0 ? true : false;
                    this.temPatInfo = {
                        idVisit: patData.visitId,
                        name: patData.patientName,
                        age: patData.ageDesc,
                        sex: patData.sexDesc,
                        bedNo: patData.bedCode, //床号
                        endemicName: patData.sspmDesc, //科室名称
                        inpNo: patData.mrnIp, //住院号
                        wardName: patData.wardDesc , // 病区
                        ipStatus: patData.ipStatus, // 1 在院， 2出院
                        dischargeDatetime: patData.dischargeDatetime, // 出院日期
                        admissionDateTime:
                            patData.admissionDatetime == undefined
                                ? ""
                                : patData.admissionDatetime.split(" ")[0],
                    };
                    let sessionDate = sessionStorage.getItem('tempDate');
                    if (sessionDate) {
                        this.inpTemDate = sessionDate;
                    } else {
                        this.inpTemDate = this.temPatInfo.ipStatus == 2 ? this.temPatInfo.admissionDateTime : this.curDate;
                    }
                } else {
                    this.$message({
                        type: "warning",
                        message: res.message,
                    });
                }
            })
        },
        //打印
        print() {
            // let iframeBox = document.getElementById("iframeBoxPrint");
            // this.initPrint(iframeBox.innerHTML);
            // console.log(iframeBox, iframeBox.innerHTML)
            this.isPrint = true;
            this.tempTrHeight = "15";
            this.tempTrWidth = '15';
            this.painTbTrH = '8';
            this.dateList=[];
            setTimeout(()=>{
                this.loadNum = 0;
                this.dateList.push(this.inpTemDate);
            }, 30)
        },
        printAll() {
            this.isPrint = true;
            this.tempTrHeight = "15";
            this.tempTrWidth = '15';
            this.painTbTrH = '8';
            this.allLoading = true;
            this.allLoadingText = "加载全部打印内容中，请稍等...";
            this.dateList = [];
            this.loadNum = 0;
            this.$axios
                ._post(getPrintAllDate, {
                    idVisit: this.temParams.idVisit,
                })
                .then((res) => {
                    if (res.success) {
                        this.dateList = res.data;
                    } else {
                        this.allLoading = false;
                        this.$message({
                            type: "warning",
                            message: res.message,
                        });
                    }
                });
        },
        printAllPreview() {
            let iframeBox = document.getElementById("printAll");
            sessionStorage.setItem('tempDate', this.inpTemDate)
            setTimeout(() => {
                this.initPrint(iframeBox.innerHTML);
            }, 30);
            this.allLoading = false;
        },
        getLoadNum() {
            let that = this;
            bus.$on("loadComplate", function () {
                that.loadNum++;
            });
        },
        initPrint(html) {
            let docWin = document.getElementById("printContainer")
                .contentWindow;
            let doc = docWin.document;
            let cssStyle = `@charset "UTF-8";html, body, #main {width: 100%;height: 100%;}body {padding: 0;margin: 0;font-weight: normal;}h1, h2, h3, h4, h5, h6 {text-align: center;}.show-detail {overflow-x: auto;}.show-detail::-webkit-scrollbar {width: 0;height: 8px;}.show-detail::-webkit-scrollbar-corner, .show-detail::-webkit-scrollbar-track {background-color: #B7B7B7;}.show-detail::-webkit-scrollbar-thumb {border-radius: 0;background-color: rgba(0, 0, 0, 0.3);}.footBtn {line-height: 28px;text-align: left;margin: 15px 0;}.footBtn .ant-calendar-picker {margin-right: 10px;}.temperature-chart {position: relative;margin: 0 auto;overflow: hidden;width: 765px;height: 1122px;padding: 44px 19px 40px 19px;font-family: 'SimSun';font-weight: normal;box-sizing: border-box;}.temperature-chart .ant-spin-nested-loading {width: 100%;height: 100%;}.temperature-chart .ant-spin-nested-loading .ant-spin-container {width: 100%;height: 100%;}.temperature-chart .tempChartLogo {position: absolute;top: 200px;left: -14px;}.temperature-chart .tempChartLogo .tempChartBox {display: flex;flex-direction: column;}.temperature-chart .tempCartSvg {position: relative;}.temperature-chart .showInfo {width: 100%;table-layout: fixed;}.temperature-chart .showInfo tr td.borderVL {border-right-color: #1a1919;border-right-width: 2px;}.temperature-chart .showInfo tr td:first-child {border-left-color: #1a1919;}.temperature-chart .showInfo td {height: 20px;border: 1px solid #3c3c3c;}.temperature-chart .showInfo tr td {text-align: center;font-size: 12px;}.temperature-chart .showInfo tr td:first-child {border-right-color: #1a1919;border-right-width: 2px;}.temperature-chart .showInfo tr td:last-child {border-right-width: 1px;}.temperature-chart .showInfo tr td:nth-of-type(1) {text-align: justify;text-align-last: justify;padding: 0 1px;}.temperature-chart .showInfo tr:first-child td {border-top-color: #1a1919;}.temperature-chart .showInfo tr:last-of-type td {border-bottom: none;}.temperature-chart .showInfo tr td:last-of-type {border-right-color: #1a1919;}.temperature-chart .flow_div {position: relative;left: 0;width: 100%;height: calc(100% - 51px);max-height: calc(100% - 51px);overflow-y: auto;overflow-x: hidden;box-sizing: border-box;}.temperature-chart .flow_div::-webkit-scrollbar {width: 0;height: 0;}.temperature-chart table.tableSvg {width: 100%;border-collapse: collapse;table-layout: fixed;border-bottom: none;}.temperature-chart table.tableSvg td {border: 1px solid #3c3c3c;}.temperature-chart table.tableSvg tr td {font-size: 12px;}.temperature-chart table.tableSvg tr:last-child td {border-bottom-color: #1a1919;}.temperature-chart table.tableSvg tr td:first-child {border-left-color: #1a1919;}.temperature-chart table.tableSvg tr:first-child td:first-child {border-right-color: #1a1919;border-right-width: 2px;}.temperature-chart table.tableSvg tr td {position: relative;white-space: nowrap;overflow: hidden;}.temperature-chart table.tableSvg tr td.redLight .fontSizeChange {font-size: 12px;width: 118%;transform-origin: 0 0;transform: scale(0.8);white-space: normal;vertical-align: middle;line-height: 14px;display: inline-block;text-align: left;}.temperature-chart table.tableSvg td {text-align: center;}.temperature-chart table.tableSvg tr td.borderR, .temperature-chart table.tableSvg tr.height td.borderR {border-right-color: red;border-right-width: 2px;}.temperature-chart table.tableSvg tr td.borderVL {border-right: 1px solid #1a1919;border-right-width: 2px;}.temperature-chart table.tableSvg tr.height.borderT td, .temperature-chart table.tableSvg tr.borderT td {border-top: 1px solid red;border-top-width: 2px;}.temperature-chart table.tableSvg tr.height.borderB td, .temperature-chart table.tableSvg tr.borderB td, .temperature-chart table.tableSvg tr.height td.borderB {border-bottom: 1px solid #1a1919;border-bottom-width: 2px;}.temperature-chart table.tableSvg tr td:last-of-type {border-right: 1px solid #1a1919;}.temperature-chart table.tableSvg .painTrCss span {display: block;}.temperature-chart table.tableSvg tr td.hideBorder {border: none;border: 1px solid #ffffff;}.temperature-chart .svgCenter {position: absolute;width: 100%;z-index: 98;}.temperature-chart .svgPainBox {position: absolute;width: 100%;z-index: 98;}.temperature-chart #titleTr tr:nth-of-type(2) td {padding-bottom: 3px;}.temperature-chart .svgLeft, .temperature-chart .svgRight, .temperature-chart #svgLeft, .temperature-chart #svgRight {width: 100%;height: 100%;position: absolute;top: 0;left: 0;}.temperature-chart [line] {cursor: pointer;}.temperature-chart .container.print table tr.height {height: 15px;}.temperature-chart .container.print .footBtn {display: none;}.temperature-chart .container.print .scale {transform: scale(1);}.temperature-chart .container.print .patInfo td {height: 17px;line-height: 17px;font-size: 12px;}.temperature-chart .container.print .showInfo td {height: 15px;line-height: 15px;font-size: 12px;}.temperature-chart .container.alone.print tr.every td {line-height: 15px;font-size: 12px;}.temperature-chart .container.alone.print .tableSvg tr.addClone {height: 15px;}.temperature-chart .container.print .flow_div {max-height: inherit;}.temperature-chart text {font-size: 12px;}.temperature-chart .container.print text {font-size: 12px;}.temperature-chart circle, .temperature-chart rect, .temperature-chart line, .temperature-chart path {cursor: pointer;}.temperature-chart .pageFooter {position: absolute;left: 0;bottom: 40px;width: 100%;font-size: 14px;text-align: center;}.temperature-chart .pageFooter .printSow {display: none;}.ant-tooltip-inner {background: #FFF;font-size: 11px;font-family: "microsoft yahei", "Helvetica Neue For Number", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;line-height: 15px !important;min-height: 15px !important;padding: 5px 10px !important;}.kdTitle {position: absolute;width: 100%;height: 40px;top: 0;left: 0;display: flex;}.kdTitle p {text-align: center;flex: 1;}.hospitalName {text-align: center;font-size: 26px;line-height: 24px;margin-bottom: 8px;font-weight: bold;letter-spacing: 16px;margin-top: 10px;}.tempTitle {text-align: center;font-size: 16px;}.patinfoDiv {display: flex;flex-wrap: wrap;justify-content: space-between;line-height: 18px;margin-bottom: 6px;box-sizing: border-box;}.patinfoDiv .p {white-space: nowrap;display: inline-block;margin: 0;}.patinfoDiv .p span:nth-child(1) {font-size: 12px;}.patinfoDiv .p span:nth-child(2) {font-size: 14px;text-decoration: underline;}.patinfoDiv .p:last-child {padding: 0;margin: 0px;}#msvg, #svgPain {float: right;}.tooltipClass {color: #000000;background: #ffffff;z-index: 999;border-radius: 5px;padding: 2px 8px;font-size: 14px;background: #F9F9F9;box-shadow: 0px 4px 5px -3px rgba(0, 0, 0, 0.25);}.redLight {color: red;}@media print {.temperature-chart {position: relative;font-family: 'SimSun';font-weight: normal;padding: 44px 19px 40px 19px;margin: 0 auto auto 24px;zoom: 1;transform: scale(0.94, 1);transform-origin: 0 1;-moz-transform: scale(0.94, 1);-moz-transform-origin: 0 1;box-sizing: border-box;}.hospitalName {margin-bottom: 8px;font-weight: bold;}.printHide {display: none;}.printSow {display: block !important;}}@page {margin: 0;padding: 0;size: A4 portrait;}`

            let content = `<!DOCTYPE html><html lang="en"><head><style>${cssStyle}</style></head><body>${html}</body></html>`;

            doc.write(content);
            // console.log(content);
            doc.close();
            if (html) {
                docWin.close();
                docWin.focus();
                docWin.print();
                this.$emit("afterPrint");
            }
        },
        dateChange() {
            bus.$emit("watchDate", this.inpTemDate);
        },
        // 监听整体高度自适应
        addEvtListenerHeight() {
            if (!document.documentElement.clientHeight) return;
            let clientHeight = document.documentElement.clientHeight;
            this.tmpBoxHeight = clientHeight - 100 + "px";
        },
        evtListenrTempTrHeight() {
            let tableDis = document.querySelector('.getTableTrHeight');
            if (!tableDis) return;
            let tbTrH = tableDis.querySelectorAll('td')[0].getBoundingClientRect().height;
            let painTbTrH = tableDis.querySelectorAll('td')[1].getBoundingClientRect().height;
            this.tempTrHeight = tbTrH.toFixed(2);
            this.tempTrWidth = tbTrH.toFixed(2);
            this.painTbTrH = painTbTrH.toFixed(2);
        }
    },
    destroyed() {
        window.removeEventListener("resize", this.addEvtListenerHeight);
        window.removeEventListener("resize", this.evtListenrTempTrHeight);
    },
};
</script>

<style lang="scss" src="./tempMain.scss">
</style>
<style lang="scss" scoped>
 .getTableTrHeight{
    border-collapse: collapse;
    table-layout: fixed;
    border-bottom: none;
    opacity: 0;
    td{
        height: 15px;
        width: 15px;
        border: 1px solid #ccc;
        box-sizing: border-box;
    }
    .painTrtd td {
        height: 8px;
        width: 8px;
    }
    
}
</style>
