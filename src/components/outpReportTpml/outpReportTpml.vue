<template>
    <div class="OutpReportTpml flexRow" >
        <!-- :class="['flexColumn','reportLeft', isFromInp? 'bigSize':'']"  -->
        <div class="flexColumn reportLeft bigSize" v-if="showTree">
            <div class="flexRow selBox">
                <div class="radioBox">
                    <el-radio-group v-model="radio" @change="radioChange" class="common_radio_group">
                        <el-radio-button
                            :label="item.label"
                            v-for="(item, index) in radioList"
                            :key="index"
                            >{{ item.name }}</el-radio-button>
                    </el-radio-group>
                </div>
                <div class="searchSel" v-if="leftTreeFlag">
                    <el-checkbox-group v-model="checkList">
                        <el-checkbox
                            :label="item.value"
                            v-for="(item, index) in checkListDataComputed"
                            :key="index"
                            >{{ item.label }}</el-checkbox
                        >
                    </el-checkbox-group>
                </div>
                <div class="searchSel" v-else>
                    <el-select
                        v-model="treeValue"
                        filterable
                        remote
                        clearable
                        @change="changeTreeData"
                        value-key="itemName"
                        reserve-keyword
                        placeholder="请输入关键词"
                        :remote-method="getTreeData"
                    >
                    <template slot="prefix">
                        <i class="el-icon-search"></i>
                    </template>
                        <el-option
                            v-for="item in options"
                            :key="item.itemName"
                            :label="item.itemName"
                            :value="item"
                        >
                        </el-option>
                    </el-select>
                </div>
            </div>
            <component
                :is="radio"
                :reGetFlag="reGetFlag"
                :relaParam="relaParam"
                @setCurrentRow="bccellclick"
            ></component>
        </div>
        <div class="box-right">
            <!-- 检验报告 -->
            <component
                :is="currentComponent"
                :reGetFlag="reGetFlag"
                :typeMap="checkListObj"
                :row="currentRow"
                :relaParam="relaParam"
                v-if="currentComponent"
            ></component>
            <div v-else class="nodata el-table__empty-text">
                <div class="empty_list_block">
                    <img src="@/assets/images/doctws/list_empty.png" alt="" />
                    <div class="empty_txt">
                        暂无数据
                    </div>
                </div>
            </div>
            <!-- 检查报告 -->
            <!-- <InspectReport :row="currentRow"></InspectReport> -->
            <!-- 特检或者病理 -->
            <!-- <SpecReport></SpecReport> -->
        </div>
    </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import CheckReport from "./comp/checkReport/checkReport";
import InspectReport from "./comp/inspectReport/inspectReport";
import SpecReport from "./comp/specReport/specReport";
import leftTreeByType from "./leftTree/leftTreeByType.vue";
import leftTreeByProject from "./leftTree/leftTreeByProject.vue";

export default {
    props: {
        docPatientParams: {
            default() {
                return {};
            },
        },
        height: {
            default: "",
        },
        from:{
            default(){
                return {}
            }
        }
    },
    components: {
        CheckReport,
        InspectReport,
        SpecReport,
        leftTreeByType,
        leftTreeByProject,
    },
    data() {
        return {
            treeValue: {},
            options: [],
            allOptions: [],
            radio: "leftTreeByProject",
            radioList: [
                {
                    label: "leftTreeByProject",
                    name: "项目",
                },
                {
                    label: "leftTreeByType",
                    name: "就诊",
                },
            ],
            reGetFlag: false, //获取数据开关
            dateStart: "", //开始时间
            dateEnd: "", //结束时间
            patientId: "", //患者id
            currentRow: {},
            formInline: {
                user: "",
                region: "",
            },
            checkList: [], //选中状态
            checkListMsg: [], //选中数据
            checkListData: [
                {
                    label: "检查",
                    component: "InspectReport",
                    value: this.CONSTANT.INSPECT_TYPE,
                },
                {
                    label: "检验",
                    component: "CheckReport",
                    value: `${this.CONSTANT.TEST_TYPE}`,
                },
                {
                    label: "病理",
                    component: "SpecReport",
                    value: this.CONSTANT.PATHOL0GY_TYPE,
                },
                {
                    label: "特检",
                    component: "SpecReport",
                    value: this.CONSTANT.SPECIAL_INSPECT_TYPE,
                },
            ],

            spanArr: [],
            params: {}
        };
    },
    computed: {
        ...mapGetters(["routerPath"]),
        isFromInp() {
            let type = this.from ? this.from.type : '';
            return type === 'inPatient'
        },
        leftTreeFlag() {
            return this.radio === "leftTreeByType";
        },
        checkListObj() {
            let mapFilter = new Map();
            this.checkListData.forEach((item) => {
                mapFilter.set(item.value, item);
            });
            return mapFilter;
        },
        currentComponent() {
            if (this.checkListObj.get(this.currentRow.sdClinicType)) {
                return this.checkListObj.get(this.currentRow.sdClinicType)
                    .component;
            }
            return false;
        },
        checkListDataComputed() {
            return this.checkListData.filter((item) => {
                return item.value !== this.CONSTANT.SPECIAL_INSPECT_TYPE;
            });
        },
        treeDataOptions(){
            if(Object.keys(this.treeValue).length){
                return [this.treeValue]
            }
            return this.allOptions
        },
        relaParam() {
            return {
                sdClinicTypeList: this.checkListMsg,
                // beginDate: this.dateTime ? this.dateTime[0] : "",
                // endDate: this.dateTime ? this.dateTime[1] : "",
                docPatientParams: this.docPatientParams,
                checkListObj: this.checkListObj,
                treeDataOptions:this.treeDataOptions,
                reqUrl: this.currUrl,
                ...this.from
            };
        },
        currUrl(){
            let url = "/outpdr/report/queryReport";
            if(this.from.type === 'inPatient'){
                url = '/doctws/applyReport/queryReport';
            }
            return url;
        },
        showTree(){
            return !this.from.hideTree;
        }
    },

    methods: {
        //埋点处理
        getBuryingPoint(eventName, parmas = {}) {
            if(this.isFromInp) return   //住院暂时不开通埋点
            //埋点
            let parame = [{
                eventDescription: eventName,
                properties:[parmas],
                title: '报告查询',   //模块
                subTitle: '报告查询', //子模块
                url: this.routerPath,
            }]
          
            this.buryingPoint(parame);
        },

         //埋点处理 -- 住院
        getInpBuryingPoint(eventName, parmas = {}, subTitle) {
            if(!this.isFromInp) return   //住院埋点
            //埋点
            let parame = [{
                eventDescription: eventName,
                properties:[parmas],
                title: '报告查询',   //模块
                subTitle: subTitle || '类型选泽', //子模块
                url: this.routerPath,
            }]
            this.buryingPoint(parame, 'hospitalDoctor');
        },

        //项目检索
        changeTreeData() {
            if(this.isFromInp)  this.getInpBuryingPoint('项目检索');
        },

        getTreeData(val='') {
            let url = "outpdr/report/itemNameAll";
            let type = this.from ? this.from.type : '';
            if(type === 'inPatient'){
                url = '/doctws/applyReport/itemNameAll';
            }
            // url = window.globalUrl.baseURL11 + url;
            let receivePatientParams = JSON.parse(
                sessionStorage.getItem("receivePatientParams")
            ); //缓存里患者基本信息
            let obj = {
                patientId: receivePatientParams
                    ? receivePatientParams.patCode
                    : this.docPatientParams.patCode,
                idPat: receivePatientParams
                    ? receivePatientParams.idPat
                    : this.docPatientParams.idPat,
                itmeName: val,
            };
            this.$axios._post(url, obj).then((res) => {
                if (res.success) {
                    let data = res.data
                    if(!val){
                        this.allOptions = data
                    }
                    this.options = data
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
            });
        },
        radioChange(val) {
            this.getChangeTypeBuryingPoint(); //埋点
            this.reGetData();       
        },
        //切换就诊、项目埋点处理
        getChangeTypeBuryingPoint() {
            let eveName = this.radio === "leftTreeByType" ? '按照就诊选择': '按照项目选择'
             //埋点
            
            if(this.isFromInp) {
                //埋点 - 住院
                if(this.radio === 'leftTreeByProject' && this.isFromInp) this.getInpBuryingPoint(eveName)
            } else {
                this.getBuryingPoint(eveName);
            }
         
        },
        bccellclick(row) {
            this.currentRow = {...row, ...this.from};
        },
        reGetData() {
            this.treeValue = {}
            this.reGetReportData()
        },
        reGetReportData(){
           this.reGetFlag = true;
            this.bccellclick({});
            this.$nextTick(() => {
                this.reGetFlag = false;
            });
            if(!this.leftTreeFlag){
                this.getTreeData()
            }
        },
        init() {
            this.reGetData();
            if(!this.isFromInp) this.getChangeTypeBuryingPoint();  //埋点
        },
    },
    created() {
        if(this.showTree){
            this.init();
            if(this.isFromInp){
                this.radio = 'leftTreeByType'
            }else{
                this.radio = 'leftTreeByProject'
            }
        }else{
            this.bccellclick(this.from.params);
        }
    },
    mounted() {
    },
    watch: {
        checkList: {
            handler(val, valOld) {
                let curVal = '';
                if(val.length > valOld.length) {
                    curVal = val[val.length - 1]
                }
                this.checkListMsg = val.filter((item) => {
                    return item.value !== this.CONSTANT.SPECIAL_INSPECT_TYPE;
                });
                let flag = val.includes(this.CONSTANT.TEST_TYPE);
                if (flag) {
                    this.checkListMsg.push(this.CONSTANT.SPECIAL_INSPECT_TYPE);
                }
                this.checkListData.map((item) => {
                    if (curVal == item.value) {
                        let eveName = `就诊${item.label}选择`
                        //埋点
                        this.getBuryingPoint(eveName, {type: item.value});
                        //埋点 - 住院
                        let eNInp = `${item.label}过滤`
                        this.getInpBuryingPoint(eNInp, {type: item.value});
                    }
                });
                this.reGetData();
            },
        },
        treeValue: {
            handler(val) {
                if(Object.keys(val).length){
                    this.getTreeData();
                }
            },
        },
    },
};
</script>
<style lang='scss' src='./outpReportTpml.scss'>
</style>