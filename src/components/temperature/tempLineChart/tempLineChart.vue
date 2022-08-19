<template>
    <div class="tempLineChartWrap">
        <div class="block">
            <div class="left">
                <span>选择体征</span>
                <el-select
                    class="sign"
                    v-model="signGroupId"
                    placeholder="请选择"
                    @change="signGroupChange"
                    clearable
                >
                    <el-option
                        v-for="item in signGroupEleData"
                        :key="item.idMrElementGroup"
                        :label="item.groupDesc"
                        :value="item.idMrElementGroup"
                    ></el-option>
                </el-select>
                <el-select
                    class="signMultiple"
                    v-model="searchInfo.idMrElementList"
                    placeholder="请选择"
                    @change="signAllSearch"
                    @remove-tag="removeTagEvt"
                    clearable
                    multiple
                >
                    <el-option
                        v-for="item in signList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </div>
        </div>

        <div class="elTabs">
            <div class="tabsBox">
                <div class="searchCondition">
                    <div class="tabsWrap">
                        <div
                            class="tabs"
                            v-for="item in tabsArr"
                            :key="item.name"
                            :class="getClassName(item.name)"
                            @click="handleTabClick(item)"
                        >
                            <p v-if="item.name == 'first'">
                                <img
                                    v-if="activeName == 'first'"
                                    src="../tempImg/curveAct.svg"
                                    alt=""
                                />
                                <img
                                    v-else
                                    src="../tempImg/curveGray.svg"
                                    alt=""
                                />
                            </p>
                            <p
                                v-if="item.name == 'second'"
                                :class="activeName == 'second' ? 'actTab2' : ''"
                            >
                                <img
                                    v-if="activeName == 'second'"
                                    src="../tempImg/tabAct.svg"
                                    alt=""
                                />
                                <img
                                    v-else
                                    src="../tempImg/tabGray.svg"
                                    alt=""
                                />
                            </p>
                            <p
                                v-if="item.name == 'third'"
                                :class="activeName == 'third' ? 'actTab3' : ''"
                            >
                                <img
                                    v-if="activeName == 'third'"
                                    src="../tempImg/editAct.svg"
                                    alt=""
                                />
                                <img
                                    v-else
                                    src="../tempImg/editGray.svg"
                                    alt=""
                                />
                            </p>
                        </div>
                    </div>
                    <div class="searchLeft" v-show="activeName != 'third'">
                        <el-date-picker
                            v-model="searchDate"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            @change="dateChange"
                            value-format="yyyy-MM-dd"
                            :editable="false"
                            :picker-options="pickerOptions"
                        >
                        </el-date-picker>
                        <!-- <el-button @click="selectDate('up')">
                            <i class="el-icon-arrow-left"></i>
                        </el-button>
                        <el-button :disabled="btnDisabled" @click="selectDate('next')">
                            <i class="el-icon-arrow-right"></i>
                        </el-button> -->
                        <el-button
                            :disabled="btnDisabled"
                            @click="selectDate('today')"
                            class="searchTody"
                            >今日</el-button
                        >
                        <el-button @click="btnOpenTemp">体温单</el-button>
                    </div>
                    <!-- <div class="signDate" v-show="activeName == 'third'">
                        <el-date-picker
                            v-model="signDate"
                            type="datetime"
                            format="yyyy-MM-dd HH:mm"
                            value-format="yyyy-MM-dd HH:mm"
                            placeholder="选择日期时间"
                            :picker-options="pickerOptions"
                            >
                            
                        </el-date-picker>
                    </div> -->
                </div>
                <div class="searchRight" v-show="activeName != 'third'">
                    <div v-show="activeName == 'second'" class="tableCon">
                        <el-checkbox v-model="excludeTemperature">排除体温单</el-checkbox>
                        <!-- <el-checkbox v-model="checked">异常值</el-checkbox> -->
                        <el-button v-if="!onlyRead" @click="saveData" :loading="saveFlag" :disabled="saveFlag">保存</el-button>
                        <el-button
                            @click="pagePrint('single')"
                            :disabled="Object.keys(tabData).length == 0"
                            >打印</el-button
                        >
                        <el-button
                            @click="pagePrint('all')"
                            :disabled="Object.keys(tabData).length == 0"
                            >全部打印</el-button
                        >
                    </div>
                    <el-button
                        type="primary"
                        class="refreshBtn"
                        @click="refrechData"
                        >刷新</el-button
                    >
                </div>
                <div v-show="activeName == 'third'">
                    <!-- <el-button
                        type="primary"
                        @click="saveSignData"
                        >保存</el-button> -->
                </div>
            </div>
            <div class="tabsCont">
                <div class="tempLineChart" v-show="activeName == 'first'">
                    <div ref="chart" class="chart" style="height: 500px"></div>
                </div>
                <!-- v-if="Object.keys(tabData).length" -->
                <div v-if="activeName != 'first'">
                    <tempTable
                        ref="tempTable"
                        v-if="Object.keys(tabData).length"
                        :curDate="curDate"
                        :tabData="tabData"
                        :signList="signList"
                        :idMrElementList="searchInfo.idMrElementList"
                        :temParams="temParams"
                        :onlyRead="activeName == 'third'? true : onlyRead"
                        :edit="activeName == 'third'? true : false"
                        @findPatVitalRecord="findPatVitalRecord"
                        @clearSavingState="clearSavingState"
                    ></tempTable>
                    <el-pagination
                        v-if="Object.keys(tabData).length"
                        class="paginationBox"
                        background
                        @current-change="handleCurrentChange"
                        :current-page="tabData.page.current"
                        :page-size="tabData.page.size"
                        layout="total, prev, pager, next, jumper"
                        :total="tabData.page.total"
                    >
                    </el-pagination>
                    <div style="height: 500px" v-if="tabDataLoading" v-loading="tabDataLoading"></div>
                </div>
                <!-- <div v-if="activeName == 'third'">
                    <SignTable 
                        ref="signTable"
                        :temParams="temParams"
                        :signDate="signDate"
                        :signGroupId="signGroupId" :signGroupEleData="signGroupEleData"
                        :signList="signList" :idMrElementList="searchInfo.idMrElementList"
                    ></SignTable>
                </div> -->
            </div>
        </div>
        <el-dialog
            custom-class="previewDialog"
            v-if="isPrint"
            title="打印预览"
            :visible.sync="isPrint"
            :fullscreen="true"
            :modal="false"
        >
            <pdfPrint
                :pdfInfo="pdfInfo"
                :signTabPrint="signTabPrint"
                @closePdfPrint="closePdfPrint"
            ></pdfPrint>
        </el-dialog>
        <el-dialog
            v-if="tempShow"
            custom-class="tempDialog"
            title="体温单"
            :visible.sync="tempShow"
            :fullscreen="true"
            :modal="false"
            :lock-scroll="true"
            v-dialogDrag
            width="80%"
            top="5vh"
        >
            <!-- :key="currentDateTime" -->
            <TempMain
                :onlyRead="true"
                :temParams="temParams"
                :scalableTemParam ="scalableTemParam"
                :key="currentDateTime"
                :showBtnMore="false"
                @afterPrint="afterPrint"
                ></TempMain>
        </el-dialog>
    </div>
</template>
<script>
const bspUrl = window.globalUrl.hlwsServiceUrl;
const pbspUrl = window.globalUrl.publicServiceParentUrl;
// import tempTable from "./tempTable";
// import SignTable from "./signTable";
// import pdfPrint from "@/components/page/NursingDoc_WEB/pdfPrint/pdfPrint";

let myChart;
export default {
    props: {
        curDate: {
            type: String,
            default: function () {
                return "";
            },
        },
        onlyRead: { // 体温单不可录入体征数据
            type: Boolean,
            default() {
                return false;
            }
        },
        temParams: {
            type: Object,
            default: function () {
                return {};
            },
        },
    },
    watch: {
        'temParams.signGroupId': {
            handler: function(val, oldVal) {
                this.signGroupId = val
                this.signGroupChange(val)
            },
            deep: true
        }
    },
    data() {
        return {
            saveFlag: false,
            tempShow: false,
            currentDateTime: new Date().getTime(),
            tabsArr: [
                {
                    label: "曲线",
                    name: "first",
                },
                {
                    label: "表格",
                    name: "second",
                },
                {
                    label: "编辑",
                    name: "third",
                },
            ],
            searchInfo: {
                // 查询条件
                idVisit: this.temParams.idVisit,
                idMrElementList: [],
                measureDtBeginStr: "",
                measureDtEndStr: "",
                reportNo: "", // 报表字段
            },
            signList: [], // 体征列表
            // // 时间校验
            // pickerOptions: {
            //     disabledDate: (time) => {
            //         var dateTimebegin = new Date();
            //         return time.getTime() > dateTimebegin.getTime();
            //     },
            // },
            btnDisabled: false, // 按钮可用状态
            searchDate: "", // 日期范围
            tabData: {}, // 表格数据
            tabDataLoading: true, // 表格loading
            pageSize: 31,
            pageIndex: 100000,
            activeName: "second",
            className: "actTab2",
            signGroupEleData: [
                {
                    groupDesc: "全部",
                    idMrElementGroup: "-1",
                    idMrElementList: ["all"],
                },
            ], // 多个体征组数据
            signGroupId: "",
            signItemTag: [], // 体征组中关联的体征项目
            isPrint: false, // 是否打印
            printLoading: false, // 打印预览时的loading
            pdfInfo: {}, // pdf打印相关信息
            signTabPrint: "signTabPrint", // 体征表格打印类型
            selecSignId: "", // 移除项目的id
            // 时间校验
            pickerOptions: {
                disabledDate: (time) => {
                    var dateTimebegin = new Date(this.curDate);
                    return time.getTime() > dateTimebegin.getTime();
                },
                shortcuts: [
                    {
                        text: "今天",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            picker.$emit("pick", [start, end]);
                        },
                    },
                    {
                        text: "昨天",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24);
                            end.setTime(end.getTime() - 3600 * 1000 * 24);
                            picker.$emit("pick", [start, end]);
                        },
                    },
                    {
                        text: "一周前",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 7
                            );
                            picker.$emit("pick", [start, end]);
                        },
                    },
                ],
            },
            signDate:"",
            excludeTemperature: false, // 排除体温单 默认 false
            scalableTemParam: {
                showTempInp: false, // 体温单扩展展示，是否显示体温单录入按钮
            }
        };
    },
    created() {
        // 默认查最近三天体征
        // this.searchInfo.measureDtBeginStr = this.getDateStr(this.curDate, -1);
        // this.searchInfo.measureDtEndStr = this.getDateStr(this.curDate, 1);
        // this.searchDate = [
        //     this.searchInfo.measureDtBeginStr,
        //     this.searchInfo.measureDtEndStr,
        // ];
        this.initData();
    },
    mounted() {
        // let chart = this.$refs.chart;
        // myChart = this.$echarts.init(chart);
    },
    components: {
        // tempTable,
        tempTable: () => import("./tempTable"),
        // pdfPrint,
        pdfPrint: () => import("@/components/page/NursingDoc_WEB/pdfPrint/pdfPrint"),
        // SignTable,
        SignTable: () => import("./signTable"),
        // TempMain,
        TempMain: () =>
            import("@/components/page/Common_WEB/temperature/tempMain")
    },
    methods: {
        afterPrint() {
            this.currentDateTime = new Date().getTime();
        },
        btnOpenTemp() {
            this.tempShow = true
        },
        getClassName(name) {
            let className = "";
            if (name == "first" && this.activeName == "first") {
                className = "actTab1";
            } else if (name == "second" && this.activeName == "second") {
                className = "actTab2";
            } else if (name == "third" && this.activeName == "third") {
                className = "actTab3";
            }
            return className;
        },
        clearSavingState() {
            this.saveFlag = false
        },
        saveData() {
            this.saveFlag = true
            this.$refs.tempTable.calcTableData();
        },
        saveSignData() {
            this.$refs.signTable.saveRecord();
        },
        setSignDate(date) {
            this.signDate = date;
        },
        initData() {
            this.getSignList();
            this.tabsArr.forEach((item, idx)=> {
                if (item.name == 'third') {
                    if (this.onlyRead){
                        this.tabsArr.splice(idx,1)
                    }
                }
            })
        },
        refrechData(refreshFlag = true) {
            if (this.activeName == "second") {
                this.pageIndex = refreshFlag ? 1 : this.pageIndex
                this.findPatVitalRecord();
            } else if (this.activeName == "first") {
                this.search();
            } else {
                this.pageIndex = refreshFlag ? 1 : this.pageIndex
                this.findPatVitalRecord();
            }
        },
        // tab切换
        handleTabClick(val) {
            this.activeName = val.name;
            if (this.searchInfo.idMrElementList.length == 0) {
                this.$message({
                    type: "warning",
                    message: "请您先选择体征！",
                });
                return;
            }
            this.refrechData();
        },
        handleAddData(tableTitleList) {
            let addData = {}
            let titleList = this.copyObject(tableTitleList)
            const info = {
                    idCiVisitElementDetail: "",
                    measureDt: this.signDate,
                    elementValue: "",
                    elementType: "",
                    elementRemark: ""
                };
            
            titleList.forEach(item => {
                addData[item.idMrElement] = Object.assign(item, {elementValue:''});
                // console.log(signList.length);
                this.signList.some((value, index) => {
                    if (value.value == item.idMrElement) {
                        
                        Object.assign(value, info, {
                            idMrElement: item.idMrElement
                        });
                        addData[item.idMrElement] = value
                        return true;
                    }  
                });
            });
            return addData
        },
        // 查询表格
        findPatVitalRecord() {
            let startTime = '',endTime="";
            this.tabData = {};
            this.tabDataLoading = true
            if (this.searchInfo.idMrElementList.length == 0) {
                this.$message({
                    type: "warning",
                    message: "请您先选择体征！",
                });
                return;
            }

            let signList = this.copyObject(this.signList);
            // console.log(signList);
            startTime = this.searchInfo.measureDtBeginStr;
            endTime = this.searchInfo.measureDtEndStr;
            let params = {
                idVisit: this.temParams.idVisit,
                measureDtBeginStr:
                    startTime ? startTime + " 00:00:00" : '',
                measureDtEndStr: endTime ? endTime + " 23:59:59" : '',
                idMrElementList: this.searchInfo.idMrElementList,
                page: this.pageIndex,
                limit: this.pageSize,
                includeTemperature: this.excludeTemperature ? 0 : 1
            };
            this.$axios
                ._post(
                    `${bspUrl}mobile/vital/getPatientVitalRecordList`,
                    params
                )
                .then((res) => {
                    if (res.success) {
                        let data = JSON.parse(JSON.stringify(res.data));
                        let arr = [],
                            obj = {};
                        data.dataList.forEach((list) => {
                            let info = {}
                            list.forEach(item => {
                                signList.some((value, index) => {
                                    if (value.value == item.idMrElement) {
                                        item.sdElementDataTypePc = value.sdElementDataTypePc;
                                        return true;
                                    }
                                });
                                // info[item.idMrElement] = item.elementValue;
                                // console.log(item);
                                info[item.idMrElement] = item;
                            });
                            arr.push(info);
                        });
                        this.activeName == 'third' ? arr.unshift(this.handleAddData(data.titleList[0])) : null
                        obj.dataList = JSON.parse(JSON.stringify(arr));
                        obj.titleList = data.titleList;
                        obj.page = data.page;
                        this.tabDataLoading = false
                        this.tabData = obj;
                        
                    } else {
                        this.$message({
                            type: 'warning',
                            message: res.message
                        })
                    }
                });
        },
        dateChange(val) {
            if (val) {
                this.searchInfo.measureDtBeginStr = val[0];
                this.searchInfo.measureDtEndStr = val[1];
                // this.pageIndex = 1;
                // this.pageSize = 10;
                this.refrechData();
                this.btnCanUse();
            } else {
                this.searchInfo.measureDtBeginStr = '';
                this.searchInfo.measureDtEndStr = '';
                this.refrechData();
                this.btnDisabled = false;
            }
        },
        // 选则体征13dc0496000002c0
        signGroupChange(arrVal) {
            // 切换组默认定位最后一页
            this.pageIndex = 100000
            this.searchInfo.idMrElementList = [];
            this.searchInfo.reportNo = "";
            let signAllList = JSON.parse(JSON.stringify(this.signList));
            if (arrVal == "-1") {
                signAllList.forEach((list) => {
                    this.searchInfo.idMrElementList.push(list.value);
                });
                this.pageSize = 31
            } else {
                this.signGroupEleData.forEach((item) => {
                    if (item.idMrElementGroup == arrVal) {
                        this.searchInfo.reportNo = item.reportNo;
                        this.pageSize = item.pageSize
                        signAllList.forEach((list) => {
                            if (item.idMrElementList.includes(list.value)) {
                                this.searchInfo.idMrElementList.push(
                                    list.value
                                );
                            }
                        });
                    }
                });
            }
            this.refrechData();
        },
        // 多选体征项目
        signAllSearch(item) {
            let mbVal = "",
                xlVal = "";
            if (item.length) {
                this.signList.forEach((list) => {
                    if (list.label == "脉搏") {
                        mbVal = list.value;
                    } else if (list.label == "心率") {
                        xlVal = list.value;
                    }
                });

                if (
                    this.searchInfo.idMrElementList.includes(xlVal) &&
                    !this.searchInfo.idMrElementList.includes(mbVal) &&
                    mbVal
                ) {
                    this.searchInfo.idMrElementList.push(mbVal);
                } else if (
                    this.searchInfo.idMrElementList.includes(mbVal) &&
                    !this.searchInfo.idMrElementList.includes(xlVal) &&
                    xlVal
                ) {
                    this.searchInfo.idMrElementList.push(xlVal);
                }
            }

            this.refrechData();
        },
        removeTagEvt(val) {
            let mbVal = "",
                xlVal = "";
            this.selecSignId = val;
            this.signList.forEach((list) => {
                if (list.label == "脉搏") {
                    mbVal = list.value;
                } else if (list.label == "心率") {
                    xlVal = list.value;
                }
            });
            if (this.selecSignId) {
                if (this.selecSignId == mbVal || this.selecSignId == xlVal) {
                    if (
                        this.searchInfo.idMrElementList.includes(
                            this.selecSignId
                        )
                    ) {
                        this.searchInfo.idMrElementList.splice(
                            this.searchInfo.idMrElementList.indexOf(
                                this.selecSignId
                            ),
                            1
                        );
                    }
                }
            }
            // this.refrechData();
        },
        // 查询
        search() {
            if (myChart) {
                myChart.clear();
            }
            // let param = {
            //     idVisit: "000435875",
            //     measureDtBeginStr: "2020-11-22",
            //     measureDtEndStr: "2020-11-22",
            //     idMrElementList: ["c9b601a9000003c0", "73d623eb000023c0"]
            // };
            if (this.searchInfo.idMrElementList.length == 0) {
                this.$message({
                    type: "warning",
                    message: "请您先选择体征！",
                });
                return;
            }
            let startTime = '', endTime = '';
            startTime = this.searchInfo.measureDtBeginStr
            endTime = this.searchInfo.measureDtEndStr
            let params = {
                measureDtBeginStr: startTime ? startTime + " 00:00:00" : "",
                measureDtEndStr: endTime ? endTime + " 23:59:59" : "",
                idVisit: this.temParams.idVisit,
                idMrElementList: this.searchInfo.idMrElementList,
            }
            this.$axios
                ._post(
                    `${bspUrl}mobile/sign/getPatientEchartSignDataList`,
                    params
                )
                .then((res) => {
                    if (res.success) {
                        this.drawLine(res.data.series);
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message,
                        });
                    }
                });
        },
        // 上一天/下一天/今天 时间切换
        selectDate(type) {
            let newDate = "";
            if (type == "up") {
                newDate = this.getDateStr(
                    this.searchInfo.measureDtBeginStr,
                    -1
                );
            } else if (type == "next") {
                newDate = this.getDateStr(this.searchInfo.measureDtBeginStr, 1);
            } else {
                newDate = this.curDate;
                this.searchInfo.measureDtEndStr = this.curDate;
                this.searchDate = [this.curDate, this.curDate];
            }
            this.searchInfo.measureDtBeginStr = newDate;
            this.btnCanUse();
            this.refrechData();
        },
        // 日期切换
        btnCanUse() {
            if (this.searchInfo.measureDtBeginStr == this.curDate) {
                this.btnDisabled = true;
            } else {
                this.btnDisabled = false;
            }
        },
        // 画折线图
        drawLine(dataList) {
            let chart = this.$refs.chart;
            let myChart = this.$echarts.init(chart);
            let obj = {
                type: "line",
                itemStyle: { normal: { label: { show: true } } },
            };
            let len = 1,
                legendData = [];
            dataList.forEach((list) => {
                if (list.data.length > len) {
                    len = list.data.length;
                }
                Object.assign(list, obj);
                legendData.push(list.name);
            });
            // console.log(dataList);
            let option = {
                tooltip: {
                    formatter: function (params) {
                        let data = params.data;
                        let res = `<div>${data.value} ${data.systemDesc}</div><div>${data.measureDt} ${data.userName}</div>`;
                        return res;
                    },
                },
                legend: {
                    padding: [10, 5, 5, 5],
                    data: legendData,
                },
                xAxis: {
                    data: new Array(len).fill(""),
                },
                yAxis: {},
                series: dataList,
            };
            // 绘制图表
            myChart.setOption(option);
        },
        // 获取日期
        getDateStr(date, addDayCount) {
            let dd = new Date(date);
            dd.setDate(dd.getDate() + addDayCount); //获取addDayCount天后的日期
            let y = dd.getFullYear();
            let m =
                dd.getMonth() + 1 < 10
                    ? "0" + (dd.getMonth() + 1)
                    : dd.getMonth() + 1; //获取当前月份的日期，不足10补0
            let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0
            return y + "-" + m + "-" + d;
        },
        // 获取体征列表
        // getSignList() {
        //     this.$axios
        //         ._post(`${bspUrl}mobile/sign/getVisitSignList`, {
        //             idVisit: this.temParams.idVisit,
        //             // idVisit: "000435875"
        //         })
        //         .then((res) => {
        //             if (res.success) {
        //                 this.signList = res.data;
        //                 res.data.forEach((list) => {
        //                     if (list.show) {
        //                         this.searchInfo.idMrElementList.push(
        //                             list.value
        //                         );
        //                     }
        //                 });
        //                 this.findGroupIncludeVitalList();
        //             } else {
        //                 this.$message({
        //                     type: "warning",
        //                     message: res.message,
        //                 });
        //             }
        //         });
        // },
        // 获取体征列表
        getSignList() {
            this.$axios
                ._post(`${bspUrl}mobile/sign/getAllSignList`, {})
                .then((res) => {
                    if (res.success) {
                        this.signList = res.data;
                        res.data.forEach((list) => {
                            if (list.show) {
                                this.searchInfo.idMrElementList.push(
                                    list.value
                                );
                            }
                        });
                        this.findGroupIncludeVitalList();
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message,
                        });
                    }
                });
        },
        // 查询包含体征元素idlist的体征组
        findGroupIncludeVitalList() {
            this.$axios
                .post(
                    `${pbspUrl}baseservice/mobile/findGroupIncludeVitalList`,
                    {}
                )
                .then((res) => {
                    if (res.success) {
                        this.searchInfo.idMrElementList = [];
                        let signAllList = JSON.parse(
                            JSON.stringify(this.signList)
                        ); // 全部体征列表
                        let data = this.signGroupEleData.concat(res.data);
                        this.signGroupEleData = data;

                        // 父组件传过来默认值
                        if(this.temParams.idMrElementList && this.temParams.idMrElementList.length > 0 && this.temParams.signGroupId) {
                            this.signGroupId = this.temParams.signGroupId
                            this.searchInfo.idMrElementList = this.temParams.idMrElementList
                            let item = this.signGroupEleData.find(item => item.idMrElementGroup == this.signGroupId)
                            if(item) {       
                                this.searchInfo.reportNo = item.reportNo
                                this.pageSize = item.pageSize
                                // console.log("resItemReportNo:", this.searchInfo.reportNo)
                            }
                            this.refrechData(false);
                            return
                        }

                        // 父组件传过来 选中组id
                        if(this.temParams.signGroupId && !this.temParams.idMrElementList) {
                            this.signGroupId = this.temParams.signGroupId
                            this.signGroupChange(this.signGroupId)
                            return
                        }

                        // else 默认显示第一个体征组 signGroupId
                        if (
                            res.data.length &&
                            Object.keys(res.data[0]).length > 0
                        ) {
                            this.signGroupId = res.data[0].idMrElementGroup;
                            this.searchInfo.reportNo = res.data[0].reportNo;
                            this.pageSize = res.data[0].pageSize
                            signAllList.forEach((list) => {
                                if (
                                    res.data[0].idMrElementList.includes(
                                        list.value
                                    )
                                ) {
                                    this.searchInfo.idMrElementList.push(
                                        list.value
                                    );
                                   
                                }
                            });
                        }
                        this.refrechData(false);
                    }
                });
        },
        // 打印\全部打印
        pagePrint(type) {
            if (this.searchInfo.idMrElementList.length == 0) {
                this.$message({
                    type: "warning",
                    message: "请您先选择体征！",
                });
                return;
            }
            this.isPrint = true;
            // 全部打印
            if (type == "all") {
                this.pdfInfo = {
                    idMrElementGroup:this.signGroupId,
                    idVisit: this.temParams.idVisit,
                    // measureDtBeginStr: this.searchInfo.measureDtBeginStr,
                    // measureDtEndStr: this.searchInfo.measureDtEndStr,
                    idMrElementList: this.searchInfo.idMrElementList,
                    reportNo:this.searchInfo.reportNo,
                    printAll: 1,
                    includeTemperature: this.excludeTemperature ? 0 : 1
                };
            } else {
                this.pdfInfo = {
                    idMrElementGroup: this.signGroupId,
                    idVisit: this.temParams.idVisit,
                    measureDtBeginStr: this.searchInfo.measureDtBeginStr,
                    measureDtEndStr: this.searchInfo.measureDtEndStr,
                    idMrElementList: this.searchInfo.idMrElementList,
                    reportNo:this.searchInfo.reportNo,
                    page: this.pageIndex,
                    limit: this.pageSize,
                    includeTemperature: this.excludeTemperature ? 0 : 1
                };
            }
        },
        handleSizeChange(size) {
            this.pageSize = size;
            this.findPatVitalRecord();
        },
        handleCurrentChange(idx) {
            this.pageIndex = idx;
            this.findPatVitalRecord();
        },
        // 关闭pdf打印
        closePdfPrint() {
            this.isPrint = false;
        },
    },
};
</script>
<style lang="scss">
.tempLineChartWrap {
    .tempDialog /deep/.el-dialog__body {
        height: 90vh;
        overflow-y: scroll;
    }
    background-color: #ffffff;
    .block {
        display: flex;
        flex-wrap: wrap;
        padding: 0 20px;
    }
    .sign {
        margin: 0 0 0 15px;
        width: 400px;
    }
    .left {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 0 0 8px;
        line-height: 32px;
        .signMultiple {
            // width: calc(100% - 400px);
            flex: 1;
        }
        .el-tag {
            margin-left: 8px;
            cursor: pointer;
        }
        .button-new-tag {
            margin-left: 10px;
            height: 32px;
            line-height: 30px;
            padding-top: 0;
            padding-bottom: 0;
        }
        .input-new-tag {
            width: 90px;
            margin-left: 10px;
            vertical-align: bottom;
        }
    }
    .divTagBox {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        padding: 0 8px 0 8px;
        border: 1px solid #e8e8ee;
        border-left: none;
    }
    .chart {
        height: 500px !important;
    }
}
.elTabs {
    padding: 0 16px;
    .tabs {
        width: 32px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        &.actTab1 {
            border: 1px solid #1890ff;
            border-radius: 4px 0px 0px 4px;
        }
        &.actTab2 {
            border: 1px solid #1890ff;
            border-radius: 0px;
        }
        &.actTab3 {
            border: 1px solid #1890ff;
            border-radius: 0px 4px 4px 0px;
        }
        &.disNone{
            display: none;
        }
    }
    .tabsBox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        // margin-bottom: 13px;
        .searchCondition {
            display: flex;
            justify-content: space-between;
            padding: 0 16px 13px 0;
            .searchTody {
                margin-left: 8px;
            }

            .refreshBtn {
                display: flex;
                align-items: flex-end;
            }
        }
        .searchRight,
        .searchLeft {
            display: flex;
        }
        .searchLeft {
            margin-right: 10px;
        }
        .searchRight {
            margin-bottom: 13px;
            .tableCon {
                margin: 0 8px;
            }
        }
        .tabsWrap {
            // width: 98px;
            min-width: 66px;
            height: 30px;
            display: flex;
            align-items: center;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            margin-right: 50px;
            p {
                height: 24px;
                width: 24px;
                display: flex;
                justify-content: center;
                img {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
    .tabsCont {
        height: 500px;
        position: relative;
    }
    .paginationBox {
        position: absolute;
        bottom: 0;
        right: 0;
        margin-right: 0px;
    }
}
</style>