<template>
    <div class="tempTableWrap">
        <el-table
            :data="tableDataList"
            style="width: 100%"
            height="348"
            border
            stripe
            cell-class-name="tableBox cellClassName"
            :header-cell-style="tableTitleStyle"
            :cell-style="cellStyle"
            @cell-dblclick="dblEditTd"
            @row-contextmenu="rowRightClick"
        >
            <el-table-column type="index" label="序号" width="50" fixed>
                <template slot-scope="{$index}">{{!edit ? $index + 1 : $index == 0 ? '' : $index}}</template>
            </el-table-column>
            <el-table-column
                v-for="list in tableTitle"
                align="center"
                min-width="140"
                :width="list.idMrElement == 'dateId' ? '180px' : ''"
                :prop="list.idMrElement"
                :label="list.elementValue"
                :key="list.idMrElement"
                :fixed="list.idMrElement == 'dateId' ? true : false"
            >
                <template slot="header" slot-scope="{ column}">
                    <div class="headerCss">
                        <span class="cl262626 fz14 fw">{{column.label}}</span>
                        <span
                            class="fz12 cl8c8c8c fnor marginL"
                        >{{list.elementUnit ? list.elementUnit : ''}}</span>
                    </div>
                </template>
                <template slot-scope="{row, column, $index}">
                    <!-- <p class="tooltipShow" v-if="row[list.idMrElement].tooltipDia">非测量人，不允许修改此体征信息</p> -->
                    <template v-if="$index == 0 && edit == true">
                        <div>
                            <div v-if="list.idMrElement == 'measureId'">
                                {{userInfo.empName}}
                                <br />
                                <el-button type="primary" size="mini" @click="saveRecord" :loading="saveFlag" :disabled="saveFlag">确定</el-button>
                            </div>
                            <div v-else-if="list.idMrElement == 'dateId'">
                                <el-date-picker
                                    class="dateInput"
                                    type="datetime"
                                    format="yyyy-MM-dd HH:mm"
                                    value-format="yyyy-MM-dd HH:mm"
                                    placeholder="选择日期时间"
                                    size="mini"
                                    width="140"
                                    v-model="curDateTime"
                                    :picker-options="pickerOptions"
                                ></el-date-picker>
                            </div>
                            <div v-else class="tipWrap">
                                <!-- 体温不升 -->
                                <el-checkbox
                                    v-if="row[list.idMrElement].signCode=='Hypothermia'"
                                    v-model="row[list.idMrElement].elementValue"
                                    :true-label="'体温不升'"
                                    :false-label="''"
                                ></el-checkbox>

                                <div v-else class="signEntryValTip">
                                    <div v-if="row[list.idMrElement].sdElementDataTypePc == '2'">
                                        <el-popover
                                            placement="top"
                                            width="208"
                                            trigger="focus"
                                            popper-class="elPopoverTmp"
                                        >
                                            <TempSignCom
                                                ref="tempSignCom"
                                                :wdTypeList="wdTypeList"
                                                :tempSignComShow="tempSignComShow"
                                                :id="row[list.idMrElement].idMrElement"
                                                :list="row[list.idMrElement]"
                                                @signTypeValChange="signTypeValChange"
                                            ></TempSignCom>
                                            <el-input
                                                size="mini"
                                                type="text"
                                                slot="reference"
                                                v-model="row[list.idMrElement].elementValue"
                                                @focus="editSpecial(row[list.idMrElement])"
                                                placeholder="请输入"
                                                :class="'r'+ $index + 'c'"
                                                :disabled="row[list.idMrElement].disabled ? true : false"
                                                @input="row[list.idMrElement].elementValue = checkHandleNum(row[list.idMrElement]), inputHandle(row, list.idMrElement)"
                                                :readonly="true"
                                                @keyup.native="keyUpHandle($event, $index, row[list.idMrElement])"
                                            ></el-input>
                                        </el-popover>
                                    </div>
                                    <el-input
                                        size="mini"
                                        type="text"
                                        v-else
                                        v-model="row[list.idMrElement].elementValue"
                                        placeholder="请输入"
                                        :disabled="row[list.idMrElement].disabled ? true : false"
                                        :class="'r'+ $index + 'c'"
                                        @input="row[list.idMrElement].elementValue = checkHandleNum(row[list.idMrElement]), inputHandle(row, list.idMrElement)"
                                        :readonly="inputReadonly.indexOf(row[list.idMrElement].code)>-1"
                                        @keyup.native="keyUpHandle($event, $index, row[list.idMrElement])"
                                        @focus="editSpecial(row[list.idMrElement])"
                                    ></el-input>
                                    <span
                                        class="maxMinRange"
                                    >{{classHandleNum(row[list.idMrElement]).messageTip}}</span>
                                <span
                                        class="highLowTip"
                                    >{{row[list.idMrElement].disabled ? "单次只能录入一种体温" : classHandleNum(row[list.idMrElement]).highLowTip}}</span>
                                </div>
                                <!-- <el-input placeholder="请输入" size="mini" v-model="row[list.idMrElement].elementValue"></el-input> -->
                                <el-input
                                    class="markInput"
                                    placeholder="备注"
                                    size="mini"
                                    :disabled="row[list.idMrElement].disabled ? true : false"
                                    name="markInput"
                                    v-model="row[list.idMrElement].elementRemark"
                                ></el-input>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div>
                            <div class v-show="row[list.idMrElement].showEdit">
                                <el-input
                                    v-model="row[list.idMrElement].elementValue"
                                    placeholder="请输入"
                                    :disabled="row[list.idMrElement].disabled ? true : false"
                                    @input="inputHandle(row, list.idMrElement)"
                                ></el-input>
                            </div>
                            <div
                                v-show="!row[list.idMrElement].showEdit"
                                class="tdCon"
                                v-html="calcTdCon(row,list.idMrElement)"
                            ></div>
                            <span class="maxMinRange">{{classHandleNum(row[list.idMrElement]).messageTip}}</span>
                            <span class="highLowTip">
                                {{row[list.idMrElement].disabled ? "单次只能录入一种体温" : classHandleNum(row[list.idMrElement]).highLowTip}}
                            </span>
                        </div>
                    </template>
                </template>
            </el-table-column>
        </el-table>
        <signControl
            v-if="showEdit"
            :needDate="edit ? false : true"
            :signInfo="signInfo"
            :signList="signList"
            @submitSignData="submitSignData"
            @cancleSignData="cancleSignData"
        ></signControl>
        <HeadNurse
            v-if="showHeadNurse"
            :userInfo="userInfo"
            :dialogInfo="dialogInfo"
            @hasPower="hasPower"
            :onlyHeadNurse="false"
        ></HeadNurse>
    </div>
</template>
<script>
const hsUrl = globalUrl.hlwsServiceUrl;
const bspUrl = window.globalUrl.hlwsServiceUrl;
// import signControl from "@/components/page/NursingDoc_WEB/signEntryCompon/signEntryCompon";
// import HeadNurse from "./headNurseSignName";
import { tableHandle } from "@/components/page/NursingDoc_WEB/batchSignEntry/tableHandle";
import { leaveMark } from "./leaveMark";

export default {
    mixins: [tableHandle, leaveMark],
    props: {
        edit: {
            // 当前是否编辑模式
            type: Boolean,
            default() {
                return false;
            }
        },
        temParams: {
            type: Object,
            default: function() {
                return {};
            }
        },
        onlyRead: {
            // 体温单不可录入体征数据
            type: Boolean,
            default() {
                return false;
            }
        },
        tabData: {
            default: {},
            type: Object
        },
        signDate: {
            type: String,
            default: function() {
                return "";
            }
        },
        signList: {
            default: [],
            type: Array
        },
        idMrElementList: {
            type: Array,
            default: function() {
                return [];
            }
        },
        curDate: {
            type: String,
            default: function() {
                return "";
            }
        }
    },
    data() {
        return {
            userInfo: {},
            showEdit: false,
            showHeadNurse: false,
            dialogInfo: {
                title: "修改授权"
            },
            tableDataList: [],
            tableTitle: [],
            signInfo: {},
            tooltipDia: true,
            tableTitleStyle: {
                background: "#FAFAFA"
            },
            cellStyle: {
                fontSize: "14px",
                // height: "47px",
                color: "#595959"
            },
            curRow: {},
            systemInfo: {},
            curColumn: {},
            powerInfo: {},
            inputReadonly: ["BloodGlucose"], // 部分input只读
            tempSignComShow: false, // 体温单体征控件显示隐藏
            wdTypeList: [],
            dicDataObj: {},
            otherKeysArr: [],
            specKeysArr: [],
            // 时间校验
            pickerOptions: {
                disabledDate: time => {
                    var dateTimebegin = new Date(this.curDate);
                    return time.getTime() > dateTimebegin.getTime();
                }
            },
            curDateTime: "",
            tempEleIdList: [], // 获取体温单体征元素类型
            saveFlag: false,
        };
    },
    watch: {
        tabData: {
            handler(newVal) {
                this.tableDataList = this.handleTableData(newVal.dataList);
                this.tableTitle = newVal.titleList[0];
            },
            deep: true
        },
        idMrElementList: {
            type: Array,
            default: function() {
                return [];
            }
        },
        edit: {
            handler(newVal) {
                // console.log("newVal:", newVal);
                // this.tableDataList = []
                // this.tableDataList = this.handleTableData(this.tabData.dataList);
            },
            deep: true
        }
    },
    created() {
        this.userInfo = this.getUserStorage();
        this.tableDataList = this.handleTableData(this.tabData.dataList);
        this.tableTitle = this.tabData.titleList[0];
        // console.log(this.tableDataList, this.tableTitle);
        // 获取特殊字符
        this.findTempEleIdList();
        this.getSpecKeysArr();
        this.getSystemObj();
        this.getDicData();
        this.getSignDate();
    },
    methods: {
        // input 录入数据,根据后端返回的体温单体征类型，录入时只能录入一个体温单类型的项目
        inputHandle(row, id) {
            let tempArr = [...new Set(this.getTempEleTypeData())];
            let maxMinType = this.findCurSingCheckVal(id);
            let obj = Object.assign(row[id], maxMinType)
            this.classHandleNum(obj);
            let isHas = this.tempEleIdList.some(item=> item.idMrElement == id);
            if (!isHas) return;
            tempArr.forEach(l=> {
                if (l.idMrElement != row[id].idMrElement && row[id].elementValue) {
                    l.disabled = true;
                    l.elementValue = "";
                } else {
                    l.disabled = false;
                }
            })
        },
        // 获取数据列表中体温单类型元素的数据
        getTempEleTypeData(row) {
            let arr = []
            if (!this.tableDataList.length) return;
            this.tableDataList.forEach(li=> {
                this.tempEleIdList.forEach(item=> {
                    if (li[item.idMrElement]) {
                        if (li[item.idMrElement].idMrElement == item.idMrElement) {
                            arr.push(li[item.idMrElement]);
                        }
                    }
                    
                })
                
            })
            return arr;
        },
         // 获取体温单中的体温类型在护理体征中的数据源ID列表
        findTempEleIdList() {
            this.$axios._post(`${bspUrl}emr/csmrelementdict/getTemperatureElementIdList`,{}).then(res => {
                if (res.success) {
                    this.tempEleIdList = res.data;
                } else {
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
            })
        },
        // 获取特殊字符
        getSpecKeysArr() {
            this.$axios._post(`${bspUrl}emr/common/getSystemConfigList`, {}).then(res => {
                if (res.success) {
                    this.specKeysArr = res.data.vitalsignSpecKeys
                    res.data.vitalsignSpecKeys.forEach(item=> {
                      this.dicDataObj[item.value] = item.name
                  })
                }
            }).catch(err=> {
                console.log(err)
            })
        },
        getSignDate() {
            this.getServerTime("ymdHm").then(time => {
                this.curDateTime = time;
            });
        },
        numberCheck(val) {
            var str = val;
            var len1 = str.substr(0, 1);
            var len2 = str.substr(1, 1);
            // 如果第一位是-，第二位不是1，则用1替换
            // if (str.length > 1 && len1 == '-' && len2 != '-') {
            //     str = len1 + this.getCaption(str);
            // } else {
            //如果第一位是0，第二位不是点，就用数字把点替换掉
            if (str.length > 1 && len1 == 0 && len2 != ".") {
                str = str.substr(1, 1);
            }
            //第一位不能是.
            if (len1 == ".") {
                str = "";
            }
            //限制只能输入一个小数点
            if (str.indexOf(".") != -1) {
                var str_ = str.substr(str.indexOf(".") + 1);
                if (str_.indexOf(".") != -1) {
                    str = str.substr(
                        0,
                        str.indexOf(".") + str_.indexOf(".") + 1
                    );
                }
            }
            // }
            str = str.match(/^\-?\d*(\.?\d{0,1})/g)[0] || null;

            //正则替换，保留数字和小数点
            // str = str.match(/^\d*(\.?\d{0,1})/g)[0] || null;
            // str = str.match(/^\-?\d*(\.?\d{0,1})/g)[0] || null;
            return str;
        },
        // 校验数值、文本校验
        checkHandleNum(row) {
            let value = row.elementValue;
            if (
                row.sdElementDataType == "num" &&
                !Object.keys(this.dicDataObj).includes(value)
            ) {
                return this.numberCheck(value);
            } else {
                return value;
            }
        },
        // 获取右键菜单列表
        getDicData() {
            this.$axios
                .get(`${bspUrl}emr/common/getVitalSignNoneKeysList`)
                .then(res => {
                    if (res.success) {
                        this.otherKeysArr = res.data;
                        res.data.forEach(item => {
                            this.dicDataObj[item.value] = item.name;
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        editSpecial(rowInfo) {
            this.curPatInfo = {};
            if (rowInfo.sdElementDataTypePc == 3 || rowInfo.signCode == 'Breathe' || rowInfo.signCode == 'HeartRate') {
                this.showEdit = true;

                this.signInfo = {
                    measureDtStr: rowInfo.measureDtStr,
                    mrElementName: rowInfo.label,
                    sdElementDataTypePc: rowInfo.sdElementDataTypePc,
                    sdElementDataType: rowInfo.sdElementDataType,
                    signCode: rowInfo.signCode,
                    signDesc: rowInfo.signDesc,
                    idMrElement: rowInfo.value,
                    elementValue: rowInfo.elementValue,
                    eatType: rowInfo.elementType,
                    elementRemark: rowInfo.elementRemark,
                    hours: rowInfo.elementOther1 ? rowInfo.elementOther1 : "",
                    elementOther1: rowInfo.elementOther1 ? rowInfo.elementOther1 : "",
                    elementOther2: rowInfo.elementOther2 ? rowInfo.elementOther2 : "",
                    elementOther3: rowInfo.elementOther3 ? rowInfo.elementOther3 : "",
                };
                this.curPatInfo = rowInfo;
            }
        },
        // 获取控件中的值
        signTypeValChange(data) {
            // console.log(data)
            // this.dataItem = data;
        },
        // 获取体温控件下拉列表
        findTempControList() {
            this.$axios.post(getTemperatureControList, {}).then(res => {
                if (res.success) {
                    this.wdTypeList = res.data;
                }
            });
        },
        // 血压控件自动聚焦
        aotuInputEvt() {
            let ele = "";
            setTimeout(() => {
                ele = this.$refs.tempSignCom.$refs.gyInput;
                if (ele) {
                    ele.focus();
                }
            }, 100);
        },
        keyUpHandle(ev, idx, row) {
            let rowCount = this.tableDataList[0].length;
            // 替代 switch 的优雅写法
            const actions = {
                ArrowUp: () => {
                    idx--;
                    if (idx < 0) idx = rowCount - 1;
                    this.aotuInputEvt();
                },
                ArrowDown: () => {
                    idx++;
                    if (idx >= rowCount) idx = 0;
                    this.aotuInputEvt();
                },
                Enter: () => {
                    idx++;
                    if (idx >= rowCount) idx = 0;
                    this.aotuInputEvt();
                }
            };
            let action = actions[ev.key];
            if (action !== undefined) {
                action.call();
                // 用 nextTick 避免 input 还没渲染出来
                this.$nextTick(() => {
                    if (document.querySelector(".r" + idx + "c")) {
                        document
                            .querySelector(".r" + idx + "c")
                            .querySelector(".el-input__inner")
                            .focus();
                    }
                });
            }
        },
        // 高低值校验
        classHandleNum(row) {
            let minMaxRange = "",
                lowTip = "",
                highTip = "",
                max = 0,
                min = 0,
                low = 0,
                high = 0;
            let messageTip = "",
                highLowTip = "";
            let val = row.elementValue; // 录入的值
            if (val == "") return "";
            max = row.maxValue ? row.maxValue : 0;
            min = row.minValue ? row.minValue : 0;
            low = row.lowValue ? row.lowValue : 0;
            high = row.highValue ? row.highValue : 0;
            minMaxRange = `有效范围${row.minValue}~${row.maxValue}`;
            lowTip = `${row.label}过低`;
            highTip = `${row.label}过高`;
            if (Object.keys(this.dicDataObj).includes(val)) {
                row.effectRangeFlag = false;
                return "";
            }
            // 非数字，或者不为高低压时
            if (
                row.sdElementDataType != "num" ||
                row.sdElementDataTypePc == "2" ||
                Object.keys(this.dicDataObj).includes(val)
            )
                return "";
            if (val && val.indexOf("-") < 0) {
                let value = Number(val);
                if (max || min) {
                    if (value >= min && value <= max) {
                        row.effectRangeFlag = false;
                        if (high || low) {
                            if (value >= high) {
                                highLowTip = highTip;
                            } else if (value <= low) {
                                highLowTip = lowTip;
                            }
                        }
                    } else {
                        messageTip = minMaxRange;
                        row.effectRangeFlag = true;
                    }
                } else {
                    row.effectRangeFlag = false;
                    if (high || low) {
                        if (value >= high) {
                            highLowTip = highTip;
                        } else if (value <= low) {
                            highLowTip = lowTip;
                        }
                    }
                }
            } else {
                if (val == "-") {
                    messageTip = "请输入合法数值";
                    row.effectRangeFlag = true;
                } else {
                    row.effectRangeFlag = false;
                    let status = true;
                    this.otherKeysArr.forEach(arr => {
                        if (arr.value == val) {
                            status = false;
                        }
                    });
                    if (status && val) {
                        messageTip = "请输入合法数值";
                        row.effectRangeFlag = status;
                    }
                }
            }
            return {
                messageTip,
                highLowTip
            };
        },
        // 校验数据是否合法
        checkIsLegitimate() {
            let count = 0,
                legit = false;
            for (let key in this.tableDataList[0]) {
                if (this.tableDataList[0][key].effectRangeFlag) {
                    count++;
                }
            }
            if (count > 0) {
                legit = true;
            } else {
                legit = false;
            }
            return legit;
        },
        // 检测保存条件是否满足checkCondition
        checkCondition() {
            let message = "";
            if (!this.curDateTime) {
                message = "日期时间不能为空！";
            } else if (this.checkIsLegitimate()) {
                message = "数据录入有误，请核对！";
            } else if (this.idMrElementList.length < 1) {
                message = "请选择体征项目！";
            }
            return message;
        },
        saveRecordHandle(obj) {
            let resDataList = [];
            for (let key in obj) {
                if (!["index"].includes(key) && !["dateId", "measureId"].includes(obj[key].idMrElement)) {
                    Object.assign(obj[key], {
                        measureDt: this.curDateTime,
                        measureDtStr: this.curDateTime,
                        measureIdEmp: this.userInfo.idEmp
                    });
                    resDataList.push(obj[key]);
                }
            }
            return resDataList;
        },
        saveRecord() {
            this.saveFlag = true
            let message = this.checkCondition();
            if (message) {
                this.$message({
                    type: "warning",
                    message: `${message}`
                });
                this.saveFlag = false
                return;
            }
            let ui = this.userInfo,
                tp = this.temParams,
                curDate = this.curDateTime.substring(0, 10)
            let param = {
                idVisit: tp.idVisit,
                idPat: tp.idPat,
                patientNo: tp.patientNo ? tp.patientNo : "",
                measureEmpCode: ui.idEmp,
                measureIdEmp: ui.idEmp,
                measureEmpName: ui.empName,
                deptCode: ui.idDept,
                idDept: ui.idDept,
                deptName: ui.deptName,
                hisUserId: ui.idEmp,
                hisUserName: ui.empName,
                measureDt: curDate,
                dataList: this.saveRecordHandle(this.tableDataList[0])
            };
            this.$axios
                ._post(
                    `${hsUrl}mobile/patient/batchModifyVisitElementDetailData`,
                    [param]
                )
                .then(res => {
                    this.saveFlag = false
                    if (res.success) {
                        this.$message({
                            type: "success",
                            message: "保存成功！"
                        });
                        this.tableData = [];
                        this.$emit("findPatVitalRecord");
                        this.getSignDate();
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message
                        });
                    }
                });
        },
        handleTableData(list) {
            let tableList = this.copyObject(list);
            let newList = [];
            tableList.forEach((info, index) => {
                for (let l in info) {
                    Object.assign(info[l], {
                        showEdit: false,
                        disabled: false
                    });
                    info.index = index
                }
            });
            // 编辑模式 组织新增数据
            // this.$nextTick(()=>{
            //     this.edit ? tableList.unshift(this.handleAddData()) : null
            // })
            return tableList;
        },
        handleAddData() {
            let addData = {};
            let titleList = this.copyObject(this.tableTitle);
            const info = {
                idCiVisitElementDetail: "",
                measureDt: this.signDate,
                elementValue: "",
                elementType: "",
                elementRemark: ""
            };

            titleList.forEach(item => {
                addData[item.idMrElement] = item;
                // console.log(signList.length);
                this.signList.some((value, index) => {
                    if (value.value == item.idMrElement) {
                        Object.assign(value, info);
                        addData[item.idMrElement] = value;
                        return true;
                    }
                });
            });
            return addData;
        },
        // 判断是否拥有编辑权限
        hasPower(info) {
            if (!info.show) {
                if (info.type == "cancel") {
                    this.showHeadNurse = false;
                } else {
                    this.$message({
                        message: "您现在可以编辑了！",
                        type: "success"
                    });
                    this.showHeadNurse = false;
                    this.systemInfo.superFlag = 1;
                    this.powerInfo = info;
                }
            } else {
                // 授权失败
            }
        },
        //右键
        rowRightClick(row, column, event) {
            // 新增状态下
            if (this.edit) {
                // console.log("row",row, column, column.property,event)
                event.preventDefault();
                if(row.index > 0) return; // 只有第一行是新增行，需要右键菜单
                if (["measureId", "dateId"].includes(column.property)) return; // 患者信息、操作列
                if (["markInput"].includes(event.target.name)) return; // 备注
                if (row.sdElementDataTypePc == 4) return;
                let currentRow = row;
                let itemsArr = [];
                this.otherKeysArr.forEach((item, index) => {
                    itemsArr.push({
                        label: item.name,
                        divided:
                            index == this.otherKeysArr.length - 1
                                ? true
                                : false,
                        onClick: () => {
                            Object.assign(row[column.property], {
                                elementValue: item.value
                            });
                        }
                    });
                });
                this.specKeysArr.forEach((item, index) => {
                    itemsArr.push({
                        label: item.name,
                        onClick: () => {
                            Object.assign(row[column.property], {
                                elementValue: item.value
                            });
                        }
                    });
                });
                this.$contextmenu({
                    items: itemsArr,
                    event,
                    //x: event.clientX,
                    //y: event.clientY,
                    customClass: "rightClick",
                    zIndex: 9999,
                    minWidth: 150
                });
                return;
            }
            // 如果该患者出院不能进行删除操作
            if (this.onlyRead) {
                return;
            }
            event.preventDefault();
            this.curRow = row;
            this.curColumn = column;
            if (["measureId"].includes(column.property)) return; // 测量人列
            let isAll = ["dateId"].includes(column.property) ? true : false,
                item = this.curRow[this.curColumn.property],
                detailFlag = true,
                disabledFlag = true; // 不能删
            //  disabledFlag = isAll ? false : !item.idCiVisitElementDetail ? true :  (item.measureIdEmp ==  this.userInfo.idEmp||this.systemInfo.superFlag==1) ? false : true;
            if (isAll) {
                let name = row.measureId.elementValue;
                if (this.systemInfo.superFlag == 1) {
                    disabledFlag = false;
                } else if (name.split("、").includes(this.userInfo.empName)) {
                    disabledFlag = false;
                }
            } else {
                disabledFlag = !item.idCiVisitElementDetail
                    ? true
                    : item.measureIdEmp == this.userInfo.idEmp ||
                      this.systemInfo.superFlag == 1
                    ? false
                    : true;
            }
            // 详情
            let info = row[column.property];
            // 体征可修改
            if (info.sdElementDataTypePc) {
                // 有或无均可修改
                if (info.idCiVisitElementDetail) {
                    // 本人才可修改
                    if (
                        info.measureIdEmp == this.userInfo.idEmp ||
                        this.systemInfo.superFlag == 1
                    ) {
                        detailFlag = false;
                    }
                } else {
                    detailFlag = false;
                }
            }
            let items = [
                {
                    label: "详情",
                    disabled: detailFlag,
                    onClick: () => {
                        this.editCon(row, column);
                    }
                },
                {
                    label: isAll ? "行删除" : "删除",
                    disabled: disabledFlag,
                    onClick: () => {
                        this.btnClickDel(isAll);
                    }
                }
            ];
            if (this.systemInfo.superFlag == 0) {
                items.push({
                    label: "修改授权",
                    // disabled: false,
                    onClick: () => {
                        this.showHeadNurse = true;
                    }
                });
            }
            this.$contextmenu({
                items: items,
                event,
                //x: event.clientX,
                //y: event.clientY,
                customClass: "rightClick",
                zIndex: 9999,
                minWidth: 150
            });
            return false;
        },
        btnClickDel(isAll = false) {
            let idsArr = [],
                markList = [];
            if (isAll) {
                for (let key in this.curRow) {
                    if (this.curRow[key].idCiVisitElementDetail) {
                        idsArr.push(this.curRow[key].idCiVisitElementDetail);
                        let markInfo = this.getMarkInfo(this.curRow[key]);
                        if (Object.keys(markInfo).length) {
                            markList.push(markInfo);
                        }
                    }
                }
            } else {
                idsArr.push(
                    this.curRow[this.curColumn.property].idCiVisitElementDetail
                );
                let markInfo = this.getMarkInfo(
                    this.curRow[this.curColumn.property]
                );
                if (Object.keys(markInfo).length) {
                    markList.push(markInfo);
                }
            }
            let param = {
                measureIdEmp: this.userInfo.idEmp,
                measureEmpName: this.userInfo.empName,
                idCiVisitElementDetails: idsArr
            };
            this.$axios
                ._post(
                    `${hsUrl}mobile/patient/visitElementDetail/enabled`,
                    param
                )
                .then(res => {
                    if (res.success) {
                        if (markList.length) {
                            this._operatelogs(markList);
                        }
                        this.saveSuccess();
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message
                        });
                    }
                });
        },
        cancleSignData() {
            this.showEdit = false;
        },
        // 获取双击改变的数据
        getChgList() {
            let chgList = [];
            this.tableDataList.forEach(tableData => {
                for (let data in tableData) {
                    let info = tableData[data];
                    if (info.showEdit) {
                        // 过滤无id及无value
                        if (
                            !info.idCiVisitElementDetail &&
                            info.elementValue == ""
                        ) {
                        } else {
                            chgList.push(info);
                        }
                    }
                }
            });
            // console.log(chgList);
            return chgList;
        },
        // 保存--组装数据
        calcTableData(info = {}) {
            let message = this.checkCondition();
            if (message) {
                this.$message({
                    type: "warning",
                    message: `${message}`
                });
                this.$emit('clearSavingState')
                return;
            }
            let ui = this.userInfo,
                markList = [],
                tp = this.temParams;
            let commonParam = {
                idVisit: tp.idVisit,
                idPat: tp.idPat,
                measureEmpCode: ui.idEmp,
                measureIdEmp: ui.idEmp,
                measureEmpName: ui.empName,
                deptCode: ui.idDept,
                idDept: ui.idDept,
                deptName: ui.deptName,
                hisUserId: ui.idEmp,
                hisUserName: ui.empName
            };
            let saveList = [];
            let dblChgData = this.getChgList();
            // console.log('dblChgData', dblChgData)
            dblChgData.forEach(data => {
                let info = {};
                let markInfo = this.getMarkInfo(data);
                if (Object.keys(markInfo).length) {
                    markList.push(markInfo);
                }
                Object.assign(info, commonParam, data);
                info.measureDt = info.measureDtStr + ":00";
                saveList.push(info);
            });
            // 弹框内容保存
            if (Object.keys(info).length) {
                let newInfo = {};
                let markInfo = this.getMarkInfo(info);
                if (Object.keys(markInfo).length) {
                    markList.push(markInfo);
                }
                Object.assign(newInfo, commonParam, info);
                saveList.push(newInfo);
            }
            if (saveList.length == 0) {
                this.$message({
                    type: "warning",
                    message: "您没有内容需要保存！"
                });
                this.$emit('clearSavingState')
                return;
            }
            this.batchSaveDetail(saveList, markList);
        },
        // 更新新增数据
        submitAddSignData(data) {
            // this.curPatInfo.elementValue = data.elementValue
            // this.curPatInfo.elementRemark = data.elementRemark
            // this.curPatInfo.elementOther1 = data.hours
            // this.curPatInfo.elementType = data.eatType
            this.cancleSignData();
        },
        // 保存
        submitSignData(info) {
            // 新增模式
            if (this.edit) {
                let key = info.idMrElement;
                Object.assign(this.tableDataList[0][key], {
                    elementValue: info.elementValue,
                    elementRemark: info.elementRemark,
                    elementOther1: info.hours,
                    elementOther2: info.elementOther2,
                    elementOther3: info.elementOther3,
                    elementType: info.eatType
                });
                this.cancleSignData();
                return;
            }
            this.cancleSignData();
            if (info.sdElementDataTypePc == "2") {
                info.elementValue = info.maxVal + "/" + info.minVal;
            }
            info.measureDt = info.measureDtStr + ":00";
            this.calcTableData(info);
            return;
            let ui = this.userInfo,
                tp = this.temParams;
            let dataObj = {
                idCiVisitElementDetail: info.idCiVisitElementDetail,
                idMrElement: info.idMrElement,
                sdElementDataTypePc: info.sdElementDataTypePc,
                label: info.label,
                measureIdEmp: info.measureIdEmp,
                mrElementName: info.mrElementName,
                measureDt: info.measureDt + ":00",
                elementValue: info.elementValue,
                elementType: info.eatType,
                elementRemark: info.elementRemark,
                elementOther1: info.hours,
                elementOther2: info.elementOther2,
                elementOther3: info.elementOther3,
                signCode: info.signCode
            };
            // 有idCiVisitElementDetail 走mobile/patient/modifyVisitElementDetailDataByPrimaryKey接口
            // 无 走mobile/patient/batchModifyVisitElementDetailData接口
            if (info.idCiVisitElementDetail) {
                let param = Object.assign(
                    {
                        idVisit: tp.idVisit,
                        idPat: tp.idPat,
                        measureEmpCode: ui.idEmp,
                        measureIdEmp: ui.idEmp,
                        measureEmpName: ui.empName,
                        deptCode: ui.idDept,
                        idDept: ui.idDept,
                        deptName: ui.deptName,
                        hisUserId: ui.idEmp,
                        hisUserName: ui.empName,
                        measureDt: info.measureDt + ":00"
                    },
                    dataObj
                );
                this.modifyDetail(param, dataObj);
            } else {
                let batchParam = {
                    idVisit: tp.idVisit,
                    idPat: tp.idPat,
                    patientNo: tp.patientNo ? tp.patientNo : "",
                    measureEmpCode: ui.idEmp,
                    measureIdEmp: ui.idEmp,
                    measureEmpName: ui.empName,
                    deptCode: ui.idDept,
                    idDept: ui.idDept,
                    deptName: ui.deptName,
                    hisUserId: ui.idEmp,
                    hisUserName: ui.empName,
                    measureDt: info.measureDt,
                    dataList: [dataObj]
                };
                this.batchDetail(batchParam);
            }
        },
        // 保存患者护理体征项（单项，只能修改值）
        modifyDetail(param, dataObj) {
            this.$axios
                ._post(
                    `${hsUrl}mobile/patient/modifyVisitElementDetailDataByPrimaryKey`,
                    param
                )
                .then(res => {
                    if (res.success) {
                        let markInfo = this.getMarkInfo(dataObj);
                        if (Object.keys(markInfo).length) {
                            this._operatelogs([markInfo]);
                        }
                        this.saveSuccess();
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message
                        });
                    }
                });
        },
        getMarkInfo(dataObj) {
            let info = {};
            if (
                this.userInfo.idEmp != dataObj.measureIdEmp &&
                dataObj.idCiVisitElementDetail
            ) {
                info = {
                    authEmpCode: this.powerInfo.authEmpCode || "",
                    authEmpName: this.powerInfo.authEmpName || "",
                    authTime: this.powerInfo.authTime || "",
                    idCiVisitElementDetail: dataObj.idCiVisitElementDetail,
                    // "modifiedEmpName": "",
                    modifiedEmpCode: dataObj.measureIdEmp,
                    operateEmpCode: this.userInfo.idEmp,
                    operateEmpName: this.userInfo.empName
                };
            }
            return info;
        },
        batchDetail(param) {
            // console.log(param);
            this.$axios
                ._post(
                    `${hsUrl}mobile/patient/batchModifyVisitElementDetailData`,
                    [param]
                )
                .then(res => {
                    if (res.success) {
                        this.saveSuccess();
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message
                        });
                    }
                });
        },
        batchSaveDetail(param, markList) {
            // console.log(param);
            this.$axios
                ._post(`${hsUrl}visitElementDetails`, param)
                .then(res => {
                    if (res.success) {
                        if (markList.length) {
                            this._operatelogs(markList);
                        }
                        this.saveSuccess();
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message
                        });
                    }
                    this.$emit('clearSavingState')
                });
        },
        saveSuccess() {
            this.$message({
                type: "success",
                message: "保存成功！"
            });
            this.tableData = [];
            // this.getSignDate();
            // 重置权限
            this.getSystemObj();
            this.$emit("findPatVitalRecord");
        },
        // 获取系统参数
        getSystemObj() {
            this.$axios
                ._post(hsUrl + "emr/common/getSystemConfigList", {
                    empNo: this.userInfo.empNo
                })
                .then(res => {
                    if (res.success) {
                        this.systemInfo = res.data;
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
        },
        editCon(row, column) {
            let info = row[column.property];
            let maxMinType = this.findCurSingCheckVal(column.property);
            info.hours = info.elementOther1 || '';
            info.elementOther2 = info.elementOther2 || '';
            info.elementOther1 = info.elementOther1 || '';
            info.elementOther3 = info.elementOther3 || '';
            info.eatType = info.elementType;
            // 如果该患者出院不能进行编辑操作
            if (this.onlyRead) {
                return;
            }
            // 体征可修改
            if (info.sdElementDataTypePc) {
                // 有或无均可修改
                if (info.idCiVisitElementDetail) {
                    // 本人才可修改
                    if (
                        info.measureIdEmp == this.userInfo.idEmp ||
                        this.systemInfo.superFlag == 1
                    ) {
                        this.signInfo = Object.assign(info, maxMinType);
                        this.showEdit = true;
                    } else {
                        this.$message({
                            type: "warning",
                            message: "非测量人，不允许修改此体征信息!"
                        });
                    }
                } else {
                    info.measureDtStr = row.dateId.elementValue;
                    this.signInfo = Object.assign(info, maxMinType);
                    this.showEdit = true;
                }
            }
        },
        // 双击表格内编辑
        dblEditTd(row, column) {
            // 如果该患者出院不能进行编辑操作
            if (this.onlyRead) {
                return;
            }
            let info = row[column.property];
            // 体征可修改
            if (info.sdElementDataTypePc) {
                // 有或无均可修改
                if (info.idCiVisitElementDetail) {
                    // 本人才可修改
                    if (
                        info.measureIdEmp == this.userInfo.idEmp ||
                        this.systemInfo.superFlag == 1
                    ) {
                        row[column.property].showEdit = true;
                        // this.signInfo = Object.assign(info, maxMinType);
                        // this.showEdit = true;
                    } else {
                        this.$message({
                            type: "warning",
                            message: "非测量人，不允许修改此体征信息!"
                        });
                    }
                } else {
                    row[column.property]["measureDtStr"] =
                        row.dateId.elementValue;
                    row[column.property].showEdit = true;
                    // info.measureDtStr = row.dateId.elementValue;
                    // this.signInfo = Object.assign(info, maxMinType);
                    // this.showEdit = true;
                }
            }
        },
        // 查找当前编辑的体征项目高低值
        findCurSingCheckVal(id) {
            let obj = {
                lowValue: "",
                highValue: "",
                minValue: "",
                maxValue: "",
                sdElementDataType: ""
            };
            this.signList.forEach(item => {
                if (item.value == id) {
                    obj = {
                        lowValue: item.lowValue ? item.lowValue : "",
                        highValue: item.highValue ? item.highValue : "",
                        minValue: item.minValue ? item.minValue : "",
                        maxValue: item.maxValue ? item.maxValue : "",
                        sdElementDataType: item.sdElementDataType
                            ? item.sdElementDataType
                            : ""
                    };
                }
            });
            return obj;
        }
    },
    components: {
        // HeadNurse,
        HeadNurse: () => import("./headNurseSignName"),
        // signControl,
        signControl: () =>
            import(
                "@/components/page/NursingDoc_WEB/signEntryCompon/signEntryCompon"
            ),
        // TempSignCom,
        TempSignCom: () =>
            import(
                "@/components/page/Common_WEB/temperature/tempSignCom/tempSignCom"
            )
    }
};
</script>
<style lang="scss" scoped>
@import "@/components/page/NursingDoc_WEB/batchSignEntry/tableHandle.scss";
.tempTableWrap {
    .el-table {
        .tipWrap {
            padding: 8px 0;
        }
        .dateInput {
            width: 160px;
        }
        .markInput {
            margin-top: 6px;
        }
        /deep/ .el-table__body-wrapper {
            height: calc(100% - 3px);
            /*修改滚动条样式*/
            &::-webkit-scrollbar {
                width: 10px;
                height: 10px;
            }
            &::-webkit-scrollbar-track {
                background: #d6d6d6;
                border-radius: 10px;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0);
            }
            &::-webkit-scrollbar-thumb {
                background: #bfbfbf;
                border-radius: 10px;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0);
            }
            &::-webkit-scrollbar-corner {
                background: rgb(239, 239, 239);
            }
        }
        .tableBox {
            position: relative;
        }
        .tooltipShow {
            color: #ff4d4f;
            cursor: pointer;
            // display: block;
            position: absolute;
            line-height: 14px;
            background: #bfbfbf;
            top: 0;
            &:hover {
                display: none;
            }
        }
        .cellClassName {
            cursor: pointer;
            &:hover {
                .highLowTip {
                    display: block;
                }
            }
            // position: relative;
            .maxMinRange {
                position: absolute;
                left: 14px;
                font-size: 12px;
                color: #f56c6c;
                bottom: -7px;
            }
            .highLowTip {
                display: none;
                position: absolute;
                left: 14px;
                font-size: 12px;
                color: #f56c6c;
                bottom: -7px;
            }
        }
        // /deep/ .headerCss {
        //     .cl262626 {
        //         color: #262626;
        //     }
        //     .cl8c8c8c {
        //         color: #8c8c8c;
        //     }
        //     .fz12 {
        //         font-size: 12px;
        //     }
        //     .fz14 {
        //         font-size: 14px;
        //     }
        //     .fw {
        //         font-weight: bold;
        //     }
        //     .fnor {
        //         font-weight: normal;
        //     }
        //     .marginL {
        //         margin-left: 4px;
        //     }
        // }
    }
}
</style>