<template>
    <div class="signTable">
        <el-table
            :data="tableData"
            :span-method="spanMethod"
            height="480"
            border
            style="width: 100%"
            cell-class-name="cellClassName"
            @row-contextmenu="rowRightClick"
            :header-cell-style="tableTitleStyle" :cell-style="cellStyle"
        >
            <el-table-column prop="signName" label="分组"></el-table-column>
            <el-table-column prop="label" label="项目"></el-table-column>
            <el-table-column prop="elementValue" label="体征值">
                <template slot-scope="scope">
                   <div>
                        <!-- 体温不升 -->
                        <el-checkbox
                            v-if="scope.row.signCode=='Hypothermia'"
                            v-model="scope.row.elementValue"
                            :true-label="'体温不升'"
                            :false-label="''"
                        ></el-checkbox>
                    
                        <div v-else class="signEntryValTip">
                            <div v-if="scope.row.sdElementDataTypePc == '2'">
                                <el-popover placement="top" width="208"  trigger="focus" popper-class="elPopoverTmp">
                                    <TempSignCom ref="tempSignCom" :wdTypeList="wdTypeList" :tempSignComShow="tempSignComShow" :id="scope.row.idMrElement" :list="scope.row" @signTypeValChange="signTypeValChange"></TempSignCom>
                                    <el-input type="text" slot="reference" v-model="scope.row.elementValue" 
                                        @focus="editSpecial(scope.row)"
                                        placeholder="请输入"
                                        :class="'r'+ scope.$index + 'c'"
                                        @input="scope.row.elementValue = checkHandleNum(scope.row)"
                                        :readonly="true"
                                        @keyup.native="keyUpHandle($event, scope.$index, scope.row)"></el-input>
                                </el-popover>
                            </div>
                            <el-input type="text" v-else 
                                v-model="scope.row.elementValue"
                                placeholder="请输入"
                                :class="'r'+ scope.$index + 'c'"
                                @input="scope.row.elementValue = checkHandleNum( scope.row)"
                                :readonly="inputReadonly.indexOf(scope.row.code)>-1"
                                @keyup.native="keyUpHandle($event, scope.$index, scope.row)"
                                @focus="editSpecial(scope.row)"></el-input>
                            <span class="maxMinRange">{{classHandleNum(scope.row).messageTip}}</span>
                            <span class="highLowTip">{{classHandleNum(scope.row).highLowTip}}</span>
                        </div>
                   </div>
                </template>
            </el-table-column>
            <el-table-column prop="elementRemark" label="备注">
                <template slot-scope="{row}">
                    <el-input v-model="row.elementRemark" placeholder="请输入备注"></el-input>
                </template>
            </el-table-column>
        </el-table>
        <signControl
            v-if="showEdit"
            :signInfo="signInfo"
            :needDate="false"
            @submitSignData="submitSignData"
            @cancleSignData="cancleSignData"
        ></signControl>
    </div>
</template>
<script>
const hsUrl = globalUrl.hlwsServiceUrl;
const bspUrl = window.globalUrl.hlwsServiceUrl;
// import signControl from "@/components/page/NursingDoc_WEB/signEntryCompon/signEntryCompon";
// import TempSignCom from "@/components/page/Common_WEB/temperature/tempSignCom/tempSignCom"; // 体温单体征项目血压、体温控件
const tempUrl = window.globalUrl.tempUrl;
const getTemperatureControList =
        tempUrl + "/timeaxis/tpnew/getTemperatureControList"; // 获取体温控件下拉列表
export default {
    props: {
        temParams: {
            type: Object,
            default: function() {
                return {};
            }
        },
        signDate: {
            type: String,
            default: function() {
                return "";
            }
        },
        signGroupId: {
            type: String,
            default: function() {
                return "";
            }
        },
        signGroupEleData: {
            type: Array,
            default: function() {
                return [];
            }
        },
        signList: {
            type: Array,
            default: function() {
                return [];
            }
        },
        idMrElementList: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    data() {
        return {
            userInfo: {},
            inputReadonly: ["BloodGlucose"], // 部分input只读
            signName: "",
            tableData: [],
            originData: [], // 原始空数据
            showEdit: false,
            tempSignComShow:false, // 体温单体征控件显示隐藏
            wdTypeList: [],
            curPatInfo: {},
            signInfo: {},
            currentDate: "", // 当前日期
            tableTitleStyle: {
                background: "#FAFAFA",
                color: "#262626",
                fontSize: "14px",
            },
            cellStyle: {
                fontSize: "14px",
                height: "54px",
                color: "#595959"
            },
            dicDataObj: {},
            otherKeysArr: [],
            specKeysArr: []
        };
    },
    created() {
        // console.log(this.temParams);
        this.userInfo = this.getUserStorage();
        this.getDicData();
        // 获取特殊字符
        this.getSpecKeysArr()
        this.getSignDate();
        this.getSignName();
        // this.getEleName();
    },
    watch: {
        signDate(newVal) {
            if (newVal) {
                if (this.tableData.length) {
                    this.chgMeasureDt();
                } else {
                    this.getEleName();
                }
            }
        },
        signGroupId(newVal) {
            // console.log(newVal);
            this.getSignName();
        },
        idMrElementList: {
            handler(list) {
                // console.log(list);
                this.getEleName();
            },
            deep: true
        },
        tableData: {
            handler(data, oldData) {
                oldData.forEach(item=> {
                    data.some((list)=> {
                        if (item.idMrElement == list.idMrElement) {
                            for (var key in item) {
                                list[key] = item[key];
                            }
                        }
                    })
                })
            },
            deep: true,
        }
    },
    methods: {
         // 获取控件中的值
        signTypeValChange(data) {
            // console.log(data)
            // this.dataItem = data;
        },
        cancleSignData() {
            // console.log(123);
            this.showEdit = false;
        },
        submitSignData(data) {
            this.curPatInfo.elementValue = data.elementValue
            this.curPatInfo.elementRemark = data.elementRemark
            this.curPatInfo.elementOther1 = data.hours
            this.curPatInfo.elementType = data.eatType
            this.cancleSignData();
        },
        editSpecial(rowInfo) {
            this.curPatInfo = {};
            if(rowInfo.sdElementDataTypePc == 3) {
                this.showEdit = true;
                this.signInfo= {
                    mrElementName: rowInfo.label,
                    sdElementDataTypePc: rowInfo.sdElementDataTypePc,
                    sdElementDataType: rowInfo.sdElementDataType,
                    signCode: rowInfo.signCode,
                    signDesc: rowInfo.signDesc,
                    idMrElement: rowInfo.idMrElement,
                    elementValue: rowInfo.elementValue,
                    eatType: rowInfo.elementType,
                    elementRemark: rowInfo.elementRemark,
                    hours: rowInfo.elementOther1? rowInfo.elementOther1: '',
                    
                };
                this.curPatInfo= rowInfo;
            }
        },
        getSignName() {
            // console.log(this.signGroupEleData);
            this.signGroupEleData.forEach(list => {
                if (list.idMrElementGroup == this.signGroupId) {
                    this.signName = list.groupDesc;
                }
            });
        },
        getEleName() {
            // console.log('--=',this.tableData);
            const info = {
                idCiVisitElementDetail: "",
                measureDt: this.signDate,
                elementValue: "",
                elementType: "",
                elementRemark: ""
            };
            this.tableData = [];
            let signList = this.copyObject(this.signList);
            this.idMrElementList.forEach(list => {
                // console.log(signList.length);
                signList.some((value, index) => {
                    if (value.value == list) {
                        value.signName = this.signName;
                        value.idMrElement = list;
                        Object.assign(value, info);
                        this.tableData.push(value);
                        this.originData.push(value);
                        // console.log(value);
                        signList.splice(index, 1);
                        return true;
                    }
                });
            });
            // console.log('==',this.tableData);
        },
        chgMeasureDt() {
            this.tableData.forEach(data => {
                data.measureDt = this.signDate;
            });
        },
        // 检测保存条件是否满足
        checkCondition() {
            let message = '';
            if (!this.signDate) {
                message = '日期时间不能为空！';
            } else if (this.checkIsLegitimate()) {
                message = '数据录入有误，请核对！';
            } else if (this.idMrElementList.length < 1) {
                message = '请选择体征项目！';
            }
            return message;
        },
        saveRecord() {
            let message = this.checkCondition();
            if (message) {
                this.$message({
                    type: "warning",
                    message: `${message}`
                })
                return;
            }
            let ui = this.userInfo,
                tp = this.temParams;
                console.log(tp)
            let param = {
                idVisit: tp.idVisit,
                idPat: tp.idPat,
                patientNo: tp.patientNo ? tp.patientNo : '',
                measureEmpCode: ui.idEmp,
                measureIdEmp: ui.idEmp,
                measureEmpName: ui.empName,
                deptCode: ui.idDept,
                idDept: ui.idDept,
                deptName: ui.deptName,
                hisUserId: ui.idEmp,
                hisUserName: ui.empName,
                measureDt: this.currentDate,
                dataList: this.tableData
            };
            this.$axios
                ._post(
                    `${hsUrl}mobile/patient/batchModifyVisitElementDetailData`,
                    [param]
                )
                .then(res => {
                    if (res.success) {
                        this.$message({
                            type: "success",
                            message: "保存成功！"
                        });
                        this.tableData = [];
                        this.getSignDate();
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message
                        });
                    }
                });
        },
        //右键
        rowRightClick(row, column, event) {
            event.preventDefault();
            if (!['elementValue'].includes(column.property)) return;  // 患者信息、操作列
            if (row.sdElementDataTypePc == 4) return;
            let currentRow = row;
            let itemsArr = []
            // for(let key in this.dicDataObj) {
            //     itemsArr.push({
            //         label: this.dicDataObj[key],
            //         onClick: () => {
            //             Object.assign(row, {
            //                 elementValue: key
            //             })
            //         }
            //     })
            // }
            this.otherKeysArr.forEach((item, index) => {
                    itemsArr.push({
                        label: item.name,
                        divided: index == this.otherKeysArr.length - 1 ? true : false,
                        onClick: () => {
                          Object.assign(row, {
                              elementValue: item.value
                          })
                        }
                    })
                })
                this.specKeysArr.forEach((item, index) => {
                    itemsArr.push({
                        label: item.name,
                        onClick: () => {
                          Object.assign(row, {
                              elementValue: item.value
                          })
                        }
                    })
                })
            this.$contextmenu({
                items: itemsArr,
                event,
                //x: event.clientX,
                //y: event.clientY,
                customClass: "rightClick",
                zIndex: 9999,
                minWidth: 150
            });
            return false;
        },
        // 获取右键菜单列表
        getDicData() {
            this.$axios.get(`${bspUrl}emr/common/getVitalSignNoneKeysList`).then(res => {
                if (res.success) {
                    this.otherKeysArr = res.data
                    res.data.forEach(item=> {
                        this.dicDataObj[item.value] = item.name
                    })
                //   console.log("组织数据：",this.dicDataObj)
                }
            }).catch(err=> {
                console.log(err)
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
        // 校验数据是否合法
        checkIsLegitimate() {
            let count = 0, legit=false;
            this.tableData.forEach(li=> {
                if (li.effectRangeFlag) {
                    count++
                }
            })
            if (count>0) {
                legit = true;
            } else {
                legit = false;
            }
            return legit;
        },
        getSignDate() {
            this.getServerTime("ymdHm").then(time => {
                // this.signDate = time;
                this.currentDate = time.substring(0, 10);
                if (this.signDate == time) {
                    this.getEleName();
                } else {
                    this.$parent.setSignDate(time);
                }
            });
        },
        // 行合并
        spanMethod({ row, column, rowIndex, columnIndex }) {
            if (rowIndex == 0) {
                if (columnIndex == 0) {
                    return {
                        rowspan: this.tableData.length,
                        colspan: 1
                    };
                }
            } else {
                if (columnIndex == 0) {
                    return {
                        rowspan: 0,
                        colspan: 1
                    };
                }
            }
        },
        // 高低值校验
        classHandleNum(row) {
            let minMaxRange= "", lowTip="",highTip="", max = 0, min = 0, low = 0, high=0;
            let messageTip="", highLowTip= '';
            let val = row.elementValue; // 录入的值
            if (val == "") return '';
            max = row.maxValue ? row.maxValue : 0;
            min = row.minValue ? row.minValue : 0;
            low = row.lowValue ? row.lowValue : 0;
            high = row.highValue ? row.highValue : 0;
            minMaxRange = `有效范围${row.minValue}~${row.maxValue}`
            lowTip = `${row.label}过低`;
            highTip = `${row.label}过高`;
            if (Object.keys(this.dicDataObj).includes(val)) {
                row.effectRangeFlag = false;
                return '';
            }
            // 非数字，或者不为高低压时
            if(row.sdElementDataType != 'num' || row.sdElementDataTypePc == '2' || Object.keys(this.dicDataObj).includes(val)) return '';
            if (val && val.indexOf('-') < 0) {
                let value = Number(val);
                if (max || min) {
                    if (value >= min && value <=max) {
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
                if (val == '-') {
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
                highLowTip,
            }
        },
        // 校验数值、文本校验
        checkHandleNum(row) {
            let value = row.elementValue;
            if (row.sdElementDataType == 'num' && !Object.keys(this.dicDataObj).includes(value)) {
                return this.numberCheck(value);
            } else {
                return value;
            }
        },
        keyUpHandle(ev, idx, row) {
            let rowCount = this.tableData.length;
            // 替代 switch 的优雅写法
            const actions = {
                'ArrowUp': () => {
                    idx--
                    if (idx < 0) idx = rowCount - 1
                    this.aotuInputEvt();
                },
                'ArrowDown': () => {
                    idx++
                    if (idx >= rowCount) idx = 0;
                    this.aotuInputEvt();
                },
                'Enter': () => {
                    idx++
                    if (idx >= rowCount) idx = 0;
                    this.aotuInputEvt();
                },
            }
            let action = actions[ev.key];
            if (action !== undefined) {
                action.call()
                // 用 nextTick 避免 input 还没渲染出来
                this.$nextTick(() => {
                    if (document.querySelector('.r' + idx + 'c')) {
                        document.querySelector('.r' + idx + 'c').querySelector('.el-input__inner').focus();
                    }
                })
            }
        },
        // 血压控件自动聚焦
        aotuInputEvt() {
            let ele='';
            setTimeout(()=>{
                ele = this.$refs.tempSignCom.$refs.gyInput
                if (ele) {
                    ele.focus();
                }
            }, 100)
        },
        // 获取体温控件下拉列表
        findTempControList() {
            this.$axios.post(getTemperatureControList, {}).then((res) => {
                if (res.success) {
                    this.wdTypeList = res.data;
                }
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
    },
    components: {
        // signControl,
        signControl: () => import("@/components/page/NursingDoc_WEB/signEntryCompon/signEntryCompon"),
        // TempSignCom,
        TempSignCom: () => import("@/components/page/Common_WEB/temperature/tempSignCom/tempSignCom"),
    }
};
</script>
<style lang="scss">
.signTable {
    .el-table th.is-leaf {
        color: #262626;
        font-weight: bold;
        font-size: 14px;
    }
    .cellClassName{
        cursor: pointer;
        &:hover{
            .highLowTip{
                display: block;
            }
        }
        position: relative;
        .maxMinRange{
            position: absolute;
            left: 14px;
            font-size: 12px;
            color: #f56c6c;
            bottom: -7px;
        }
        .highLowTip{
            display: none;
            position: absolute;
            left: 14px;
            font-size: 12px;
            color: #f56c6c;
            bottom: -7px;
            
        }
    }
    
}
</style>