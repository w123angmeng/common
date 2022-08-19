<template>
    <div>
        <temperatureChart
            ref="temperatureChart"
            v-if="temShow"
            :params="params"
            :key="randomDate"
            :isPrint="isPrint"
            :tempChartLogoData="tempChartLogoData"
        />
    </div>
</template>

<script>
// import html2canvas from 'html2canvas';
import bus from "@/components/common/bus.js";
import temperatureChart from "./temperatureChart.vue";
import { mapMutations, mapGetters } from "vuex";
import TMPCODE from "../../tmpcode.js"; //引用模块进来

const tempUrl = window.globalUrl.tempUrl;
const hlwsUrl =  window.globalUrl.hlwsServiceUrl
const getVitalSignNoneKeysList = hlwsUrl + "emr/common/getVitalSignNoneKeysList"; // 获取体征未查快捷键标志
const viewSevenDayPage = tempUrl + "/timeaxis/tpBill/viewSevenDayPage";
const findVitalsignItemList = tempUrl + "/timeaxis/tpnew/findVitalsignItemList";
const getUniqueViVisit = window.globalUrl.tempUrl + "/timeaxis/tpnew/getUniqueViVisit"; // 根据患者就诊ID获取患者入院信息
const getTemperatureStruc = window.globalUrl.tempUrl + "/timeaxis/tpnew/getTemperatureStruct"; // 获取体温骨架图用于初始化体温单
const getTemperatureNotes = window.globalUrl.tempUrl + "/timeaxis/tpnew/getTemperatureNotes"; // 获取体温单注释说明

export default {
    name: "temperature",
    props: {
        inpTemDate: {
            default: "",
            type: String,
        },
        temParams: {
            default: {},
            type: Object,
        },
        temPatInfo: {
            default: {},
            type: Object,
        },
        tempTrHeight: {
            default: "",
            type: String,
        },
        tempTrWidth: {
            default: "",
            type: String,
        },
        painTbTrH: {
            default: "",
            type: String,
        },
        isPrint: {
            default: false,
            type:Boolean
        }
    },
    data() {
        return {
            selfTmpCode: {}, //体温单常量
            temShow: false,
            loading: false,
            KDobj: {
                trLines: "5", //一个刻度对应5行tr
                beginTime: 2, //时间开始偏移量 1 - 5 - 9 / 2 - 6 - 10
                wdStartValue: "", //温度开始值
                wdEndValue: "", //温度结束值
                mbStartValue: "", //脉搏开始值
                mbEndValue: "", //脉搏结束值
                hxStartValue: "",
                hxEndValue: "",
                trRowBeginHX: "",
                trRowEndHX: "",
                disKDWD: "",
                disKDMB: "", //脉搏刻度差
                disKDHX: "",
                trHeight: Number(this.tempTrHeight), //tr高度
                trWidth: Number(this.tempTrWidth), //tr高度
                ttTrHeight: Number(this.painTbTrH),// Number(), // tt tr高度
                ttStartValue: 0,//
                ttEndValue: 10,
                disKDTT: 2, // 
                lastTr: "", //最后一行TR数
                trLittleCounts: 0,
                wljwSet: {},
                ywSet: {},
                kwSet: {},
                gwSet: {},
                ewSet: {},
                hxSet: {},
                xlSet: {},
                temperatureTitle: "",
                leftScaleData: [], // 左侧坐标尺数据展示
                //启用禁用刻度标尺
                scaleDisplayObj: {
                    showScaleTW: true,
                    showScaleMB: true,
                    showScaleHX: true,
                },
            }, //刻度配置项
            data: "", //暂不使用
            hospital: "",
            beginDate: "",
            patientList: {
                name: "", //姓名
                sex: "", //性别
                age: "", //年龄
                admissionDateTime: "", //入院时间
                endemicName: "", //科室
                bedNo: "", //床号
                inpNo: "", //住院号
            },
            configPhysicalSign: {}, // 抬头项目和其他护理体征项目数据存储
            //住院天数
            dayList: ["", "", "", "", "", "", ""],
            //手术天数
            dayOps: ["", "", "", "", "", "", ""],
            titleBarMap: {}, // 抬头项目
            breathingList: [],
            dayMap: {}, // 其他护理项目
            pointTime: {
                //时间和事件
                tt: [],
                mb: [],
                xl: [],
                tw: [], //体温汇总数据 根据type区分
                eventDatas: [],
                breathingList: [],
                ventilator: [], // 呼吸机
                pacemaker: [], // 起搏器
            }, // 时间段录入信息
            loading: false,
            params: {}, //将数据封装为对象传给子组件
            signConfigData: [], // 动态渲染体征项目
            signItemData: [], //设置体征项目图形样式
            pageNum: 0, // 当前体温单页码
            pageTotal: 0, // 总计体温单页码
            tempDate: this.inpTemDate,
            tempTrHei: "",
            commonConfigData: {}, // 接收公共基础配置数据，用于处理绘图抬头项目
            tempStrucData: [], // 体温单模板数据（四部分）
            userInfoData: {}, // 
            signShortcuts: [], // 体征快捷键标志数组
            tempChartLogoData: [], // 体温单左侧图形标识展示
            completeData: {
                mb: [],
                xl: []
            }, // 获取脉搏、心率原始数据，为了根据脉搏填充心率值
            randomDate: new Date().getTime(),//
            hxData: [], // 呼吸数据
            xlData: [], // 心率数据
        };
    },
    components: {
        temperatureChart,
    },
    watch:{
        tempTrHeight: {
            handler(val){
                let obj = JSON.parse(JSON.stringify(this.KDobj))
                obj["trHeight"] = val;
                this.setKDlimit(obj);
                // this.doParams();
            },
            deep: true
        },

    },
    created() {
        this.userInfoData = this.getUserStorage();
        this.selfTmpCode = TMPCODE;
        // this.getSetInfo(); //获取设置数据
        // this.findUniqueViVisit(); // 患者信息
        this.tempDate = this.inpTemDate;
        
        // console.time();
        this.findSignItemList();
        this.getVitalSignKeysList();
        this.getTempChartLogo();
        // this.getVisitTempDataByDay(); // 体征项目数据(主要体征项目，其他体征项目)
    },
    mounted() {
        bus.$off("watchDate");
        bus.$on("watchDate", (date) => {
            if (date) {
                this.tempDate = date;
                this.getPatientInfo();
            }
        });
    },
    computed: {
    },
    methods: {
        ...mapMutations({
            setKDlimit: "SET_KDLIMIT",
        }),
        doParams() {
            this.params = {
                pageNum: this.pageNum,
                pageTotal: this.pageTotal,
                beginDate: this.beginDate,
                patientList: this.temPatInfo,
                dayOps: this.dayOps,
                breathingList: this.breathingList,
                dayList: this.dayList,
                tempStrucData: this.tempStrucData,
                dayMap: this.dayMap,
                titleBarMap: this.titleBarMap,
                pointTime: this.pointTime,
                hospital: this.hospital,
                tempTrHeight: this.tempTrHeight,
                ttTrHeight: this.painTbTrH,
                completeData: this.completeData,
                signConfigData: this.signConfigData, // 抬头、其他护理项目数据配置
            };
            this.temShow = true;
            this.randomDate = new Date().getTime();
        },
        doSymbol(name) {
            // 该配置
            switch (name) {
                case "黑色实心圆":
                    return { color: "black", fill: true, type: "circle" };
                    break;
                 case "黑色空心圆":
                    return { color: "black", fill: false, type: "circle" };
                    break;
                case "红色实心圆":
                    return { color: "red", fill: true, type: "circle" };
                    break;
                case "红色空心圆":
                    return { color: "red", fill: false, type: "circle" };
                    break;
                case "蓝色空心三角":
                    return { color: "blue", fill: false, type: "triangle" };
                    break;
                case "蓝色实心三角":
                    return { color: "blue", fill: true, type: "triangle" };
                    break;
                case "蓝色实心圆":
                    return { color: "blue", fill: true, type: "circle" };
                    break;
                case "蓝色空心圆":
                    return { color: "blue", fill: false, type: "circle" };
                    break;
                case "蓝色叉子":
                    return { color: "blue", fill: true, type: "cross" };
                    break;
                case "蓝色空心叉":
                    return { color: "blue", fill: true, type: "cross" };
                    break;
                case "红色叉子":
                    return { color: "red", fill: true, type: "cross" };
                    break;
                case "紫色空心三角":
                    return { color: "purple", fill: false, type: "triangle" };
                    break;
                case "绿色空心三角":
                    return { color: "#0bbe4a", fill: false, type: "triangle" };
                    break;
                case "绿色实心三角":
                    return { color: "#0bbe4a", fill: true, type: "triangle" };
                    break;
                case "绿色R":
                    return { color: "#0bbe4a", fill: true, type: "R" };
                    break;
                case "蓝色R":
                    return { color: "blue", fill: true, type: "R" };
                    break;
                case "黑色R":
                    return { color: "black", fill: true, type: "R" };
                    break;
                case "红色H":
                    return { color: "red", fill: true, type: "H" };
                    break;
                default:
                    return { color: "", fill: true, type: "" };
                    break;
            }
        },
        // 获取体温单注释说明
        getTempChartLogo() {
            this.$axios._post(getTemperatureNotes,{}).then(res => {
                if (res.success) {
                    let data = res.data, arr=[], obj={};
                    data.forEach(item=> {
                        obj = Object.assign(this.doSymbol(item.value), {label: item.label});
                        arr.push(obj);
                    })
                    this.tempChartLogoData = arr;
                }
            })
        },
        // 初始化体温单模板
        initTemptureStruc() {
            let params = {
                idVisit: this.temParams.idVisit,
                idDept: this.temParams.idDept
            }, _this = this;
            let obj = {
                scaleDisplayObj: {
                    showScaleHX: false,
                    showScaleMB: false,
                    showScaleTW: false,
                    showScaleTT: false
                },
                wljwSet: {},
                ywSet: {},
                kwSet: {},
                gwSet: {},
                ewSet: {},
                hxSet: {},
                xlSet: {},
                trLines: "5", //一个刻度对应5行tr
                beginTime: 2, //时间开始偏移量 1 - 5 - 9 / 2 - 6 - 10
                wdStartValue: "", //温度开始值
                wdEndValue: "", //温度结束值
                mbStartValue: "", //脉搏开始值
                mbEndValue: "", //脉搏结束值
                hxStartValue: "",
                hxEndValue: "",
                trRowBeginHX: "",
                trRowEndHX: "",
                ttTrHeight: Number(this.painTbTrH),// Number(), // tt tr高度
                ttStartValue: 0,//
                ttEndValue: 10,
                disKDTT: 2,
                disKDWD: "",
                disKDMB: "", //脉搏刻度差
                disKDHX: "",
                trHeight: Number(this.tempTrHeight), //tr高度
                trWidth: Number(this.tempTrWidth), // tr宽度
                lastTr: "", //最后一行TR数
                trLittleCounts: 0,
            };
            this.$axios
                ._post(getTemperatureStruc, params).then(res=> {
                if (res.success) {
                    this.tempStrucData = res.data;
                    obj.beginTime = res.data.firstHour;
                    if (this.tempStrucData.leftScaleList.length) {
                        this.tempStrucData.leftScaleList.map((val) => {
                            if (
                                val.values.includes(this.selfTmpCode.AXILLARY_TMP) ||
                                val.values.includes(this.selfTmpCode.EARS_TMP) ||
                                val.values.includes(this.selfTmpCode.MOUTH_TMP) ||
                                val.values.includes(this.selfTmpCode.ANAL_TMP)
                            ) {
                                obj.wdStartValue = Number(val.minValue);
                                obj.wdEndValue = Number(val.maxValue);
                                obj.disKDWD = val.interval;
                                obj.scaleDisplayObj.showScaleTW =
                                    val.enabled == 1 ? true : false;
                            } else if (
                                val.values[0] == this.selfTmpCode.PULSE_TMP
                            ) {
                                obj.mbStartValue = Number(val.minValue);
                                obj.mbEndValue = Number(val.maxValue);
                                obj.disKDMB = val.interval;
                                obj.scaleDisplayObj.showScaleMB =
                                    val.enabled == 1 ? true : false;
                            } else if (
                                val.values[0] == this.selfTmpCode.BREATHING_TMP
                            ) {
                                obj.hxStartValue = Number(val.minValue);
                                obj.hxEndValue = Number(val.maxValue);
                                obj.disKDHX = val.interval;
                                obj.scaleDisplayObj.showScaleHX =
                                    val.enabled == 1 ? true : false;
                            }
                        });
                    }
                     // 设置主要体征项目图形标识
                    if (this.signItemData.length) {
                        this.signItemData.map((val) => {
                            switch (val.itemCode) {
                                case this.selfTmpCode.AXILLARY_TMP:
                                    obj.ywSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                case this.selfTmpCode.EARS_TMP:
                                    obj.ewSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                case this.selfTmpCode.MOUTH_TMP:
                                    obj.kwSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                case this.selfTmpCode.ANAL_TMP:
                                    obj.gwSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                case this.selfTmpCode.HEARTRATE_TMP:
                                    obj.xlSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                case this.selfTmpCode.BREATHING_TMP:
                                    obj.hxSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                case this.selfTmpCode.PULSE_TMP:
                                    obj.mbSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                case this.selfTmpCode.PHYSICAL_COOLING_TMP:
                                    obj.wljwSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                case this.selfTmpCode.PAIN_SCORE_TMP:
                                    obj.ttSet = _this.doSymbol(val.sdShapeSign);
                                    break;
                                default:
                            }
                        });
                    }
                    //判断温度差是否有小数
                    let trLittleCounts = 0;
                    if (String(obj.wdEndValue).indexOf(".") > 0) {
                        if (obj.trLines == "5") {
                            trLittleCounts =
                                String(obj.wdEndValue).split(".")[1] / 2;
                        } else if (obj.trLines == "10") {
                            trLittleCounts = String(obj.wdEndValue).split(".")[1];
                        }
                        obj.wdEndValue = String(obj.wdEndValue).split(".")[0];
                        let WDDisKD =
                            (obj.wdEndValue - obj.wdStartValue) /
                            Number(obj.disKDWD);
                        obj.wdEndValue = Number(obj.wdEndValue);
                        obj.lastTr = WDDisKD * obj.trLines + Number(trLittleCounts);
                    } else {
                        if (obj.disKDWD) {
                            let WDDisKD =
                            (obj.wdEndValue - obj.wdStartValue) /
                            Number(obj.disKDWD);
                            obj.lastTr = WDDisKD * obj.trLines + Number(trLittleCounts);
                        } else if (obj.disKDMB) {
                            let MBDisKD =
                            (obj.mbEndValue - obj.mbStartValue) /
                            Number(obj.disKDMB);
                            obj.lastTr = MBDisKD * obj.trLines + Number(trLittleCounts);
                        } else if (obj.disKDHX) {
                            obj.lastTr = 40;
                        }
                    }
                    obj.trLittleCounts = trLittleCounts;
                    obj.mbEndValue = Number(obj.mbEndValue);
                    this.hospital = obj.temperatureTitle;
                    this.KDobj = obj;
                    this.setKDlimit(this.KDobj);
                    sessionStorage.setItem("beginTimeTemp", obj.beginTime);
                    // 设置完成 渲染数据
                    this.getPatientInfo();
                }
            }).catch(res => {
                console.log('初始化体温单模板',res);
            });
        },
        // 从体征项目维护来获取体温、呼吸、物理降温、脉搏、心率的所用到的图形标识，然后设置对应的样式
        findSignItemList() {
            let query = {
                itemCode: "",
                itemDesc: "",
                useRange: "",
                sdEntryFrequency: "",
                batchStatus: null,
                sdOwnerRightType: "",
                idDeptList: [],
                enabled: 1,
            };
            this.$axios._post(findVitalsignItemList, query).then((res) => {
                if (res.success) {
                    this.signItemData = res.data;
                    this.initTemptureStruc(); // 初始化体温单模板
                }
            });
        },
        // 处理空数据
        filterEmptyData(arr) {
            return arr.filter((item) => item.value > 0 && item.value);
        },
        // 默认值处理
        calcDefault(info, defaultInfo) {
            for (let key in defaultInfo) {
                defaultInfo[key].forEach((val, index) => {
                    if (info[key]) {
                        if (val != "" && info[key][index] == "") {
                            info[key][index] = val;
                        }
                    }
                    
                });
            }
            return info;
        },
        
        //请求患者体温单数据
        getPatientInfo() {
            if (!this.tempDate && !this.inpTemDate) {
                this.$message({
                    type: "error",
                    message: "参数有误！请检查日期与idVisit",
                });
                return;
            }
            let params = {
                date: this.tempDate || this.inpTemDate, // 如果该患者出院则传入院日期，如果在院以当前系统日期查询
                idVisit: this.temParams.idVisit, //"db8bfc8d000006c0",
                hisUserId: this.userInfoData.idEmp,
                idDept: this.userInfoData.idDept
            };
            this.loading = true;
            this.pointTime = {};
            let cellMap = {}, noriseData = [], evtList=[];
            this.completeData = {
                mb: [],
                xl: []
            }
            this.$axios.post(viewSevenDayPage, params).then((res) => {
                if (res.success) {
                    this.loading = false;
                    this.dayMap = {};
                    this.pageNum = res.data.pageNum;
                    this.pageTotal = res.data.pageTotal;
                    this.hospital = res.data.hospital;
                    this.beginDate = res.data.beginDate;
                    let pageObj = {
                        pageNum: this.pageNum,
                        pageTotal: this.pageTotal
                    }
                    this.$emit("pageNumHandle", pageObj);
                    // hasData这周是否录入数据，无数据为0 有数据为1（为了处理没数据时也需要绘制空表格）
                    if (res.data.hasData == 0) {
                        this.drawEmptyTable(res.data)
                        let evtItem = res.data.eventList == undefined ? [] : res.data.eventList;
                        this.pointTime["eventDatas"] = evtItem;
                        return;
                    }
                    cellMap = res.data.cellMap;
                    // 抬头项目,主要体征项目和其他体征项目数据
                    let arrOtherItem = this.tempStrucData.footerList;
                    let arrMainItem = this.tempStrucData.mainShapeList;
                    let titleBarData = this.tempStrucData.titleBarList, titleBarItem=[];
                    // let configPhysicalSign = res.data.listMap;
                    let configPhysicalSign = this.calcDefault(res.data.listMap, res.data.defaultListMap);
                    let lowArr = []; //低压
                    let heiArr = []; //高压
                    let concatLowAndHei = []; //合并高低压
                    let breathData = [], breatheEquip = []; // 呼吸,呼吸机标识

                    let isTemp = arrMainItem.findIndex((item=> {
                        // 返回-1则代表没有
                        return item.itemCode == this.selfTmpCode.AXILLARY_TMP || item.itemCode == this.selfTmpCode.EARS_TMP || item.itemCode == this.selfTmpCode.MOUTH_TMP || item.itemCode == this.selfTmpCode.ANAL_TMP;
                    }))
                    // 主要体征项目绘图展示
                    if (arrMainItem.length) {
                        arrMainItem.map((strucItem) => {
                            // 如果isTemp>-1，因为没有体温这个code所以需要上面的条件判断是否有体温，有体温项目需要展示在主要项目中
                            if (isTemp > -1) {
                                let tempArr =
                                cellMap[this.selfTmpCode.TMP_DATA] == undefined
                                    ? []
                                    : this.filterEmptyData(
                                        cellMap[this.selfTmpCode.TMP_DATA]
                                    );
                                // 处理体温类型字段（因为控件的字段都是首字母拼音，所以现在这转换一下）
                                if (tempArr.length) {
                                    tempArr.map((val, ind) => {
                                        if (val.type == this.selfTmpCode.AXILLARY_TMP) {
                                            this.$set(val, "type", "yw");
                                        } else if (val.type == this.selfTmpCode.EARS_TMP) {
                                            this.$set(val, "type", "ew");
                                        } else if (val.type == this.selfTmpCode.MOUTH_TMP) {
                                            this.$set(val, "type", "kw");
                                        } else if (val.type == this.selfTmpCode.ANAL_TMP) {
                                            this.$set(val, "type", "gw");
                                        }
                                        return val;
                                    });
                                }
                                if (this.KDobj.scaleDisplayObj.showScaleTW) {
                                    this.pointTime["tw"] = tempArr;
                                } else {
                                    // this.pointTime["tw"] = [];
                                }
                            }
                            // 如果cellMap中有体温模板主要项目的数据则展示出来
                            if (cellMap[strucItem.itemCode]) {
                                switch (strucItem.itemCode) {
                                    case this.selfTmpCode.PULSE_TMP:
                                        // 处理脉搏
                                        let pulseArr = cellMap[this.selfTmpCode.PULSE_TMP] == undefined ? [] : this.filterEmptyData(cellMap[this.selfTmpCode.PULSE_TMP]);
                                        pulseArr.map((val) => {
                                            this.$set(val, "type", "mb");
                                        });
                                        if(this.KDobj.scaleDisplayObj.showScaleMB) {
                                            this.pointTime["mb"] = pulseArr;
                                        }
                                        this.completeData.mb = cellMap[this.selfTmpCode.PULSE_TMP];
                                        break;
                                    case this.selfTmpCode.HEARTRATE_TMP:
                                        // 处理心率
                                        this.xlData = cellMap[this.selfTmpCode.HEARTRATE_TMP]
                                        let heartRateArr =
                                            cellMap[this.selfTmpCode.HEARTRATE_TMP] ==
                                            undefined
                                                ? []
                                                : this.filterEmptyData(
                                                    cellMap[
                                                        this.selfTmpCode.HEARTRATE_TMP
                                                    ]
                                                );
                                        heartRateArr.map((val) => {
                                            this.$set(val, "type", "xl");
                                        });
                                        if(this.KDobj.scaleDisplayObj.showScaleMB) {
                                            this.pointTime["xl"] = heartRateArr;
                                        }
                                        this.completeData.xl = cellMap[this.selfTmpCode.HEARTRATE_TMP];
                                        break;
                                    case this.selfTmpCode.BREATHING_TMP:
                                        // 处理呼吸
                                        this.hxData = cellMap[this.selfTmpCode.BREATHING_TMP]
                                        let breathItem = this.KDobj.scaleDisplayObj
                                            .showScaleHX
                                            ? cellMap[this.selfTmpCode.BREATHING_TMP] ==
                                            undefined
                                                ? []
                                                : this.filterEmptyData(
                                                    cellMap[
                                                        this.selfTmpCode.BREATHING_TMP
                                                    ]
                                                )
                                            : [];
                                        breathItem.map((val) => {
                                            this.$set(val, "type", "hx");
                                        });
                                        if(this.KDobj.scaleDisplayObj.showScaleHX) {
                                            this.pointTime["hx"] = breathItem;
                                        }
                                        let breath =
                                            cellMap[this.selfTmpCode.BREATHING_TMP];
                                        if (breath && breath.length) {
                                            breath.forEach((ele) => {
                                                this.breathingList.push(ele.value);
                                            });
                                        } else {
                                            this.breathingList = [];
                                        }
                                        break;
                                    case this.selfTmpCode.PHYSICAL_COOLING_TMP:
                                        //处理物理降温目前还没有维护物理降温，所以编码目前是自定义的
                                        if (cellMap[this.selfTmpCode.PHYSICAL_COOLING_TMP] && this.pointTime["tw"]) {
                                            let phValArr = cellMap[this.selfTmpCode.PHYSICAL_COOLING_TMP] == undefined
                                                    ? []
                                                    : cellMap[this.selfTmpCode.PHYSICAL_COOLING_TMP]; //物理降温数组
                                            if (phValArr.length > 0 && this.pointTime["tw"].length > 0) {
                                                phValArr.map((item) => {
                                                    item.value = item.value ? item.value : '';
                                                    
                                                    this.pointTime["tw"].map((citem) => {
                                                        if (item.dateTime == citem.dateTime) {
                                                            citem.phValue = item.value;
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                        break;
                                    case this.selfTmpCode.NORISE_TMP:
                                        // 处理体温不升
                                        if (cellMap[this.selfTmpCode.NORISE_TMP] && this.pointTime["tw"]) {
                                            let data = cellMap[this.selfTmpCode.NORISE_TMP];
                                            if (data.length) {
                                                data.map((val) => {
                                                    this.$set(val, "type", "");
                                                    if (val.value && val.value !=0) {
                                                        noriseData.push(val)
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                    case this.selfTmpCode.PAIN_SCORE_TMP:
                                        // 疼痛曲线
                                        // 如果疼痛曲线有则展示绘图
                                        this.KDobj.scaleDisplayObj.showScaleTT = true;
                                        let painArr = [];
                                        if (cellMap[this.selfTmpCode.PAIN_SCORE_TMP]) {
                                            let data = cellMap[this.selfTmpCode.PAIN_SCORE_TMP];
                                            if (data.length) {
                                                data.map((val) => {
                                                    this.$set(val, "type", "tt");
                                                    if (val.value){
                                                        painArr.push(val)
                                                    }
                                                });
                                            }
                                            if (this.KDobj.scaleDisplayObj.showScaleTT) {
                                                this.pointTime["tt"] = painArr;
                                            }
                                        }
                                        this.setKDlimit(this.KDobj);
                                        break;
                                    default:
                                        break;
                                }
                            }
                            
                        })
                    }
                    // 其他护理项目绘图展示
                    if (arrOtherItem && arrOtherItem.length) {
                        arrOtherItem.forEach(footItem => {
                            if (configPhysicalSign[footItem.itemCode]) {
                                if (
                                    footItem.itemCode ==
                                    this.selfTmpCode.HYPOTENSION_TMP
                                ) {
                                    lowArr = configPhysicalSign[footItem.itemCode];
                                } else if (
                                    footItem.itemCode ==
                                    this.selfTmpCode.HYPERTENSION_TMP
                                ) {
                                    heiArr = configPhysicalSign[footItem.itemCode];
                                } else if (
                                    footItem.itemCode ==
                                    this.selfTmpCode.BREATHING_TMP
                                ) {
                                    breathData = configPhysicalSign[footItem.itemCode];
                                    breatheEquip = configPhysicalSign["Breathe_Equip"]
                                }
                            }
                        })
                        if (lowArr.length) {
                            lowArr.forEach((item, ind) => {
                                let pulseData = "";
                                let d = lowArr[ind] ? lowArr[ind] : "";
                                if (d < 0 || heiArr[ind] < 0) {
                                    // d = this.negativeConversion(d)
                                    heiArr[ind] = this.negativeConversion(heiArr[ind]);
                                    if (d && heiArr[ind]) {
                                        // pulseData = heiArr[ind] + '/' + d;
                                        pulseData = heiArr[ind];
                                    } else if (d && !heiArr[ind]) {
                                        pulseData = d;
                                    }else if (heiArr[ind] && !d) {
                                        pulseData = heiArr[ind];
                                    }
                                } else {
                                    if (d && heiArr[ind]) {
                                        pulseData = heiArr[ind] + '/' + d;
                                    } else {
                                        if (d && !heiArr[ind]) {
                                            pulseData = '/' +  d;
                                        } else if (!d && heiArr[ind]) {
                                            pulseData = heiArr[ind] + '/';
                                        }
                                    }
                                }
                                
                                concatLowAndHei.push(pulseData);
                            });
                        }
                        if (breathData.length) {
                            this.dayMap["{name:'呼吸',units:'次/分'}"] = this.switchWord(breathData);
                        }
                        if (!this.KDobj.scaleDisplayObj.showScaleHX) {
                            if (breatheEquip && breatheEquip.length && breathData.length) {
                                this.hxData = breatheEquip;
                            }
                        }
                        
                        this.dayMap["{name:'血压',units:'mmHg'}"] = concatLowAndHei;

                        arrOtherItem.forEach(val=>{
                            if (configPhysicalSign[val.itemCode]) {
                                if (val.itemCode != this.selfTmpCode.HYPOTENSION_TMP && val.itemCode != this.selfTmpCode.HYPERTENSION_TMP && val.itemCode !=
                                        this.selfTmpCode.BREATHING_TMP) {
                                        // 没有空数据的话就不绘制空格子了，如药物过敏博仁医院没有，如果配置了，但是没有空数据就不绘制
                                        if (configPhysicalSign[val.itemCode].length) {
                                            this.dayMap[val.keyName] = this.switchWord(configPhysicalSign[val.itemCode]);
                                        }
                                    }
                            }
                        })
                    }
                    // 处理抬头项目展示
                    if (titleBarData.length) {
                        titleBarData.map((item) => {
                            if (configPhysicalSign[item.itemCode]) {
                                this.titleBarMap[
                                    item.keyName
                                ] = configPhysicalSign[item.itemCode];
                            }
                        });
                    }
                   // 如果有体温不升这个事件则放到事件数据中跟事件一起展示出来，如果没有则只展示对应的其他护理事件
                    evtList = res.data.eventList == undefined ? [] : res.data.eventList;
                    if (noriseData) {
                        let concatArr = evtList.concat(noriseData);
                        concatArr = this.quickSort(concatArr, "dateTime", false);
                        this.pointTime["eventDatas"] = concatArr;
                    } else {
                        this.pointTime["eventDatas"] = evtList;
                    }
                    this.assemblyVenPace();
                    this.doParams();
                } else {
                    this.loading = false;
                    this.$message({
                        type: "warning",
                        message: res.message,
                    });
                }
            }).catch(res => {
                console.log(res);
            });
        },

        /**拿到体温单数据之后组装呼吸机、起搏器（格式跟心率一样）
         * 呼吸机、起搏器要根据呼吸、心率数据的标识来添加 
         * 显示效果, 配合具体呼吸值、心率值显示
         * 有呼吸机标志+呼吸值、有呼吸曲线，在呼吸图标内画R
         * 有呼吸机标志+呼吸值、无呼吸曲线，在标准网格区(非疼痛)最后一行显示R标志
         * 有呼吸机标志、无呼吸值，在标准网格区(非疼痛)最后一行显示R标志 
         * 有起搏器标志+心率值、在心率图标内画H
         * 有起搏器标志、无心率值，在标准网格区(非疼痛)最后一行显示H标志
         * 当呼吸与体温有交叉时，保持现有效果；如有呼吸机标志，在标准网格区(非疼痛)最后一行显示R标志
         * 当心率与其他曲线有交叉时，保持现有效果；如有起搏器标志，在标准网格区(非疼痛)最后一行显示H标志
        */
        assemblyVenPace() {
            this.pointTime.ventilator = this.extractionRules(this.hxData, 'hx', this.KDobj.scaleDisplayObj.showScaleHX, 'R').hx;
            this.pointTime.pacemaker = this.extractionRules(this.xlData, 'xl', null, 'H').xl;
        },
        // 提取画起搏器、呼吸机规则方法
        /**
         * arr数据，type 类型， isCurve是否判断有曲线，iconFlag 标识图标；
         */
        extractionRules(arr, type,isCurve,iconFlag) {
            let obj = { hx: [], xl: []}
            if (arr.length) {
                arr.forEach(item => {
                    item.type = type;
                    // 有标志
                    if (item.equipFlag && item.equipFlag == 1) {
                        // 有值
                        if (item.value && item.value != '0') {
                            // 有曲线
                            if (type == 'hx') { // 为呼吸的话，需要判断有没有曲线
                                if (isCurve) {
                                    // 在呼吸图标内画R
                                    this.$set(item, 'lastLine', '');
                                    this.$set(item, 'iconFlag', iconFlag);
                                    obj[type].push(item)
                                } else {
                                    // 在标准网格区(非疼痛)最后一行显示R标志
                                    this.$set(item, 'lastLine', iconFlag);
                                    this.$set(item, 'iconFlag', '');
                                    obj[type].push(item)
                                }
                            } else { // 为心率不需要判断是否有曲线
                                // 在标准网格区(非疼痛)最后一行显示R标志
                                this.$set(item, 'lastLine', '');
                                this.$set(item, 'iconFlag', iconFlag);
                                obj[type].push(item)
                            }
                            
                        } else {
                            this.$set(item, 'lastLine', iconFlag);
                            this.$set(item, 'iconFlag', '')
                            item.value = iconFlag;
                            // newArr.push(item)
                            obj[type].push(item)
                        }
                    }
                })
            }
            return obj;
        },
         // 其他护理项目如果数据中有-1 则转换成 拒测 文字展示
        switchWord(arr) {
            arr.map((val, idx) => {
                arr[idx] = this.negativeConversion(val);
                // if (val == '-1') {
                //     arr[idx] = "拒测";
                // } else if (val == '-2') {
                //     arr[idx] = "卧床";
                // }
            })
            return arr;
        },
        // 获取体征未查快捷键标志
        getVitalSignKeysList() {
            this.$axios.get(getVitalSignNoneKeysList, {}).then(res => {
                this.signShortcuts = res.data;
            }).catch(err=> {
                console.log(err)
            })
        },
        // 负数-1 拒测 -2 卧床
        negativeConversion(val) {
            let value = '';
            value = val ? val : '';
            this.signShortcuts.forEach(item=> {
                if (item.value == val) {
                    value = item.name;
                }
            })
            return value;
        },
        // 处理体温单无数据时绘制空表格
        drawEmptyTable(tempData) {
            let titleBarItem = this.tempStrucData.titleBarList;
            let footerDataItem = this.tempStrucData.footerList;
            let mainShapeItem = this.tempStrucData.mainShapeList;
            
            let dateArr = tempData.dateList;
            // 抬头项目
            if (titleBarItem.length) {
                titleBarItem.map((item) => {
                    this.signItemData.map((val) => {
                        if (item.itemCode == val.itemCode) {
                            // 有默认值直接赋值
                            if (tempData.defaultListMap) {
                                if (tempData.defaultListMap[item.itemCode]){
                                    this.titleBarMap[item.keyName] = tempData.defaultListMap[item.itemCode];
                                } else {
                                    this.titleBarMap[item.keyName] = this.fillEmptyData(val.fequencyTimes, dateArr);
                                }
                            } else {
                                this.titleBarMap[item.keyName] = this.fillEmptyData(val.fequencyTimes, dateArr);
                            }
                        }
                    })
                });
            }
            // 特殊处理疼痛曲线，没有数据时如果有疼痛的编码则绘制空表格
            if (mainShapeItem.length) {
                mainShapeItem.some((item)=> {
                    if (item.itemCode == this.selfTmpCode.PAIN_SCORE_TMP) {
                        this.KDobj.scaleDisplayObj.showScaleTT = true;
                    }
                })
            }
            // 其他体征项目
            if (footerDataItem.length) {
                this.sortDbOrBreath(dateArr, footerDataItem, this.signItemData);
            }
            footerDataItem.map((item) => {
                this.signItemData.map((val) => {
                    if (item.itemCode != this.selfTmpCode.HYPOTENSION_TMP && item.itemCode != this.selfTmpCode.HYPERTENSION_TMP && item.itemCode!=this.selfTmpCode.BREATHING_TMP) {
                        this.dayMap[item.keyName] = this.fillEmptyData(val.fequencyTimes, dateArr);
                    }
                })
            })
            this.setKDlimit(this.KDobj);
            this.assemblyVenPace();
            this.doParams();
        },
        // 处理呼吸、血压顺序
        sortDbOrBreath(dateArr, otherArr, signItem) {
            let lowArr = []; //低压
            let heiArr = []; //高压
            let concatLowAndHei = []; //合并高低压
            let breathData = []; // 呼吸
            otherArr.map((item) => {
                signItem.map((val) => {
                    if (item.itemCode == val.itemCode) {
                        if (
                            item.itemCode ==
                            this.selfTmpCode.HYPOTENSION_TMP
                        ) {
                            lowArr = this.fillEmptyData(val.fequencyTimes, dateArr);
                        } else if (
                            item.itemCode ==
                            this.selfTmpCode.HYPERTENSION_TMP
                        ) {
                            heiArr = this.fillEmptyData(val.fequencyTimes, dateArr);
                        } else if (item.itemCode==this.selfTmpCode.BREATHING_TMP){
                            breathData = this.fillEmptyData(val.fequencyTimes, dateArr);
                            this.dayMap["{name:'呼吸',units:'次/分'}"] = breathData;
                        }
                    }
                })
                
            });
            if (lowArr.length) {
                lowArr.forEach((item, ind) => {
                    let pulseData = "";
                    let d = lowArr[ind] ? lowArr[ind] : '';
                    if (d && heiArr[ind]) {
                        pulseData = heiArr[ind] + "/" + d;
                    } else if (d && !heiArr[ind]) {
                        pulseData = d;
                    } else if (heiArr[ind] && !d) {
                        pulseData = heiArr[ind];
                    }
                
                    concatLowAndHei.push(pulseData);
                });
                this.dayMap["{name:'血压',units:'mmHg'}"] = concatLowAndHei;
            }
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
                    let patData = res.data;
                    this.patientList = {
                        name: patData.patName,
                        age: patData.patAge,
                        sex: patData.sdSex,
                        bedNo: patData.bedName, //床号
                        endemicName: patData.deptName, //科室名称
                        inpNo: patData.mrnIp, //住院号
                        wardName: patData.wardName , // 病区
                        ipStatus: patData.ipStatus, // 1 在院， 2出院
                        admissionDateTime:
                            patData.dtEntry == undefined
                                ? ""
                                : patData.dtEntry.split(" ")[0],
                    };
                    // ipStatus 1 在院， 2出院
                } else {
                    this.$message({
                        type: "warning",
                        message: res.message,
                    });
                }
            });
        },
        // 根据录入频率，来填充空数据绘制空表格
        // fequencyTimes 1 每天一次， 2 每日2次， 6 每4小时一次
        fillEmptyData(fequencyTimes, dateArr) {
            let emptyArr = [], dateLen = dateArr.length;
            switch (Number(fequencyTimes)) {
                case 1:
                    for( let i=0, len = dateLen * 1; i<len; i++ ){
                        emptyArr.push('');
                    }
                    break;
                case 2:
                    for( let i=0, len = dateLen * 2; i<len; i++ ){
                        emptyArr.push('');
                    }
                    break;
                case 6:
                    for( let i=0, len = dateLen * 6; i< len;i++ ){
                        emptyArr.push('');
                    }
                    break;
                default:
                    for( let i=0, len = dateLen * 1; i<len; i++ ){
                        emptyArr.push('');
                    }
                    break;
            }
            return emptyArr;
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/app.scss";
</style>
