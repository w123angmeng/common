<template>
    <div class="quoteSign">
        <div class="block">
            <div class="search">
                <span class="span">日期</span>
                <el-date-picker
                    v-model="searchInfo.measureDtStr"
                    type="date"
                    value-format="yyyy-MM-dd"
                    :picker-options="pickerOptions"
                    @change="dateChange"
                ></el-date-picker>
                <el-checkbox
                    class="showAll"
                    v-model="showAll"
                    :true-label="1"
                    :false-label="0"
                    @change="newTabledata"
                >显示全部</el-checkbox>
                <el-button @click="selectDate('up')">
                    <i class="el-icon-arrow-left"></i>
                </el-button>
                <el-button :disabled="btnDisabled" @click="selectDate('next')">
                    <i class="el-icon-arrow-right"></i>
                </el-button>
                <el-button :disabled="btnDisabled" @click="selectDate('today')">今日</el-button>
            </div>
            <div class="btns">
                <!-- <el-checkbox
                    class="selectAll"
                    v-model="selectAll"
                    :true-label="1"
                    :false-label="0"
                    @change="selectAllData"
                >全部选中</el-checkbox>-->
                <el-button @click="updateTableData('all')">全选</el-button>
                <el-button @click="updateTableData('notAll')">反选</el-button>
                <el-button @click="search">查询</el-button>
                <el-button type="primary" @click="addTemp">入体温单</el-button>
            </div>
        </div>
        <div class="tableBlock">
            <el-table height="600px" :data="tableData" style="width: 100%" :span-method="objectSpanMethod">
                <el-table-column fixed prop="groupDesc" width="180px"></el-table-column>
                <el-table-column fixed prop="alias" width="220px" label="体征项目">
                    <template
                        slot-scope="scope"
                    >{{scope.row.alias?scope.row.alias:scope.row.mrElementName}}</template>
                </el-table-column>
                <el-table-column v-for="data in dataMaxLen" :key="data" width="120px">
                    <template slot-scope="scope">
                        <!-- {{scope.row[data]}} -->
                        <TdCon
                            v-if="scope.row[data]"
                            :selected="scope.row[data].selected"
                            :tdInfo="scope.row[data]"
                            :isSign="scope.row.signCode"
                            @checkboxChg="checkboxChg"
                        ></TdCon>
                        <TdCon
                            v-else
                            :tdInfo="scope.row[data]"
                            :isSign="scope.row.signCode"
                            @checkboxChg="checkboxChg"
                        ></TdCon>
                    </template>
                </el-table-column>
                <el-table-column></el-table-column>
            </el-table>
        </div>
        <div class="fill"></div>
    </div>
</template>
<script>
const hlwsServiceUrl = window.globalUrl.hlwsServiceUrl;
import TdCon from "./tdCon";
export default {
    props: {
        curDate: {
            type: String,
            default() {
                return "";
            }
        },
        temParams: {
            type: Object,
            default() {
                return {};
            }
        },
        pageStructure: {
            type: Object,
            default() {
                return {};
            }
        },
        hourList: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            // 时间校验
            pickerOptions: {
                disabledDate: time => {
                    let dateTimebegin = new Date(this.curDate);
                    return time.getTime() > dateTimebegin.getTime();
                }
            },
            searchInfo: {
                idVisit: this.temParams.idVisit,
                measureDtStr: "",
                hisUserId: this.temParams.hisUserId,
                hisUserName: this.temParams.hisUserName
            },
            showAll: 0,
            originTabData: [],
            dataMaxLen: 0,
            dataObj: [
                {
                    key: "info1",
                    value: "info1"
                },
                {
                    key: "info2",
                    value: "info2"
                }
            ],
            tableData: [],
            btnDisabled: true,
            selectSign: {},
            newHourList: [],
            selectAll: 0, // 全部选中
            selected: false
        };
    },
    created() {
        // console.log(this.hourList);
        this.hourRange();
        this.initDate();
    },
    mounted() {},
    methods: {
        dateChange() {
            this.btnCanUse();
        },
        // 全/反选
        updateTableData(type) {
            this.tableData.forEach(data => {
                for (let i = 1; i < this.dataMaxLen + 1; i++) {
                    if (data[i] && data[i].hasOwnProperty("selected")) {
                        if (type == "all") {
                            data[i].selected = true;
                        } else {
                            data[i].selected = !data[i].selected;
                        }
                    }
                }
            });
            this.tableData.splice(1, 0);
        },
        // 时间点处理为时间范围 2-> 0-4
        hourRange() {
            let newList = [];
            this.hourList.forEach(list => {
                if (list - 2 < 0) {
                }
                let info = {
                    bgT: parseFloat(list - 2 + "00"),
                    endT: parseFloat(list + 2 + "00")
                };
                newList.push(info);
            });
            this.newHourList = newList;
            // console.log(newList);
        },
        initDate() {
            this.searchInfo.measureDtStr = this.curDate;
            this.search();
        },
        search() {
            // console.log(this.searchInfo);
            // let param = {
            //     idVisit: "000435875",
            //     measureDtStr: "2020-11-22",
            //     hisUserId: "1234567890",
            //     hisUserName: "管理员"
            // };
            this.$axios
                ._post(
                    `${hlwsServiceUrl}mobile/patient/findPatientNursingSignsDataList`,
                    this.searchInfo
                    // param
                )
                .then(res => {
                    if (res.success) {
                        let data = res.data;
                        this.originTabData = data;
                        this.newTabledata();
                    } else {
                        this.$message({
                            type: "error",
                            message: res.message
                        });
                    }
                });
        },
        // 处理表格显示的数据
        newTabledata() {
            let tableData = [];
            this.originTabData.forEach(data => {
                if (data.groupFlag) {
                    if (data.elementList) {
                        data.elementList.forEach(list => {
                            let info = this.getEleInfo(list, data.groupDesc);
                            info ? tableData.push(info) : "";
                        });
                    }
                } else {
                    let info = this.getEleInfo(data.element);
                    info ? tableData.push(info) : "";
                }
            });
            // console.log(tableData);
            this.tableData = tableData;
        },
        //
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            // 对第一列 进行合并
            if (columnIndex === 0) {
                // 当 当前行与上一行内容相同时 返回0 0 意味消除
                if (
                    rowIndex > 0 &&
                    row[column.property] ===
                        this.tableData[rowIndex - 1][column.property]
                ) {
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                } else {
                    let rows = 1;
                    // 反之 查询相同的内容有多少行 进行合并
                    for (let i = rowIndex; i < this.tableData.length - 1; i++) {
                        if (
                            row[column.property] ===
                            this.tableData[i + 1][column.property]
                        ) {
                            rows++;
                        }
                    }
                    // 返回相同内容的行数
                    return {
                        rowspan: rows,
                        colspan: 1
                    };
                }
            }
        },
        //
        getEleInfo(eleIf, groupDesc = "") {
            let info = {
                groupDesc: groupDesc
            };
            if (!eleIf.dataList) {
                return false;
            }
            eleIf.dataList.forEach((list, index) => {
                if (eleIf.signCode) {
                    list.selected = false;
                    list.signCode = eleIf.signCode;
                }
                info[index + 1] = list;
            });
            Object.assign(info, eleIf);
            if (this.showAll) {
                if (eleIf.dataList.length > this.dataMaxLen) {
                    this.dataMaxLen = eleIf.dataList.length;
                }
                return info;
            } else {
                if (eleIf.signCode) {
                    if (eleIf.dataList.length > this.dataMaxLen) {
                        this.dataMaxLen = eleIf.dataList.length;
                    }
                    return info;
                } else {
                    return false;
                }
            }
        },
        // 手动选中处理
        checkboxChg(tdInfo, value) {
            // console.log(tdInfo, value);
            this.tableData.forEach(data => {
                if (data.signCode == tdInfo.signCode) {
                    for (let i = 1; i < this.dataMaxLen + 1; i++) {
                        if (
                            data[i].idCiVisitElementDetail ==
                            tdInfo.idCiVisitElementDetail
                        ) {
                            data[i].selected = value ? true : false;
                        }
                    }
                }
            });
            this.tableData.splice(1, 0);
        },
        // 入体温单
        addTemp() {
            // console.log(this.selectSign);
            if (this.searchInfo.measureDtStr == this.curDate) {
                // 获取入体温单数据
                this.tableData.forEach(data => {
                    for (let i = 1; i < this.dataMaxLen + 1; i++) {
                        if (
                            data[i] &&
                            data[i].hasOwnProperty("selected") &&
                            data[i].selected
                        ) {
                            this.selectSign[data[i].idCiVisitElementDetail] =
                                data[i];
                        }
                    }
                });
                if (Object.keys(this.selectSign).length == 0) {
                    this.$message({
                        type: "warning",
                        message: "您没有选择任何体征项目！"
                    });
                    return;
                }
                this.addToTemp();
            } else {
                this.$message({
                    type: "warning",
                    message: "当前日期下暂时不能入体温单！"
                });
            }
        },
        addToTemp() {
            let obj = {};
            for (let i in this.selectSign) {
                let sign = this.selectSign[i];
                if (Object.keys(sign).length == 0) continue;
                let time = parseFloat(sign.measureTime.replace(/\:/g, ""));
                let info = {
                    index: this.getIndex(time),
                    value: sign.elementValue,
                    measureTime: time
                };
                // 是否有这个key
                if (obj[sign.signCode]) {
                    // 相同index的数据是否已经添加,如果添加了,则判断时间;未添加则添加
                    let hasI = false,
                        q = -1;
                    obj[sign.signCode].forEach((o, si) => {
                        if (o.index == info.index) {
                            q = si;
                            hasI = true;
                        }
                    });
                    if (hasI) {
                        // 体温Temperature 比较特殊,以最高温度为准
                        if (sign.signCode.indexOf("Temperature") > -1) {
                            if (
                                parseFloat(info.value) >
                                parseFloat(obj[sign.signCode][q].value)
                            ) {
                                obj[sign.signCode].splice(q, 1);
                                obj[sign.signCode].push(info);
                            }
                            continue;
                        }
                        // 以时间大的为准--先删除后添加
                        if (
                            info.measureTime > obj[sign.signCode][q].measureTime
                        ) {
                            obj[sign.signCode].splice(q, 1);
                            obj[sign.signCode].push(info);
                        }
                    } else {
                        obj[sign.signCode].push(info);
                    }
                } else {
                    obj[sign.signCode] = [info];
                }
            }
            //
            let bloodList = [
                "BloodPressure",
                "SystolicPressure",
                "SiastolicPressure"
            ];
            for (let i in obj) {
                // 体温不升单独处理
                if (i == "Hypothermia") {
                    obj[i].forEach(data => {
                        if (data.value) {
                            data.value = 1;
                        } else {
                            data.value = 0;
                        }
                    });
                } else if (bloodList.indexOf(i) > -1) {
                    // 血压相关
                    obj[i] = this.getBloodList(obj[i]);
                } else {
                    // 频次为2次需单独处理
                    if (this.getItemTimes(i) == 2) {
                        obj[i] = this.getBloodList(obj[i]);
                    }
                }
            }
            // console.log(obj);
            this.$emit("addToTemp", obj);
        },
        getItemTimes(code) {
            let info = this.pageStructure.mainDataList.find(list => {
                return list.itemCode == code;
            });
            return info ? (info.times ? info.times : -1) : -1;
        },
        getBloodList(list) {
            let i = -1,
                hourList = this.newHourList,
                st1 = hourList[0].bgT,
                end1 = hourList[2].endT,
                newList = [];
            list.forEach(l => {
                let vl = l.value.split("/");
                if (
                    l.measureTime > st1 &&
                    (l.measureTime < end1 || l.measureTime == end1)
                ) {
                    newList[0] = {
                        index: 0,
                        value: l.value,
                        g: vl[0],
                        d: vl[1],
                        measureTime: l.measureTime
                    };
                } else {
                    newList[1] = {
                        index: 1,
                        value: l.value,
                        g: vl[0],
                        d: vl[1],
                        measureTime: l.measureTime
                    };
                }
            });
            return newList;
        },
        // 获取时间对应的index
        getIndex(time) {
            let i = -1;
            this.newHourList.forEach((list, index) => {
                if (
                    list.bgT < time &&
                    (list.endT > time || list.endT == time)
                ) {
                    i = index;
                } else if (time == 0) {
                    i = 5;
                }
            });
            return i;
        },
        // 上一天/下一天/今天 时间切换
        selectDate(type) {
            let newDate = "";
            if (type == "up") {
                newDate = this.getDateStr(this.searchInfo.measureDtStr, -1);
            } else if (type == "next") {
                newDate = this.getDateStr(this.searchInfo.measureDtStr, 1);
            } else {
                newDate = this.curDate;
            }
            this.searchInfo.measureDtStr = newDate;
            this.btnCanUse();
        },
        // 日期切换
        btnCanUse() {
            if (this.searchInfo.measureDtStr == this.curDate) {
                this.btnDisabled = true;
            } else {
                this.btnDisabled = false;
            }
            this.search();
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
        }
    },
    components: {
        TdCon
    }
};
</script>
<style lang="scss">
.quoteSign {
    background-color: #fff;
    .block {
        display: flex;
        padding-top: 15px;
    }
    .span {
        margin-right: 10px;
    }
    .showAll {
        margin: 0 15px;
    }
    .selectAll {
        margin-right: 15px;
    }
    .search {
        flex: 1;
        padding-left: 10px;
    }
    .btns {
        margin-right: 20px;
    }
    .tableBlock {
        margin-top: 15px;
        .el-table {
            td,
            .is-leaf {
                border-right: 1px solid #e8e8e8;
                border-bottom: 1px solid #e8e8e8;
            }
            th {
                background-color: #fafafa;
                border-top: 1px solid #e8e8e8;
            }
            .cell {
                line-height: 20px;
                font-size: 14px;
            }
        }
    }
    .fill {
        height: 10px;
        background-color: #f5f5f5;
    }
}
</style>