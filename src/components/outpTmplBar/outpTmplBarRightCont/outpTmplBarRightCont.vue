<template>
    <div class="outpTmplBarRightCont">
        <!-- 关联诊断 -->
        <relateDiagnoseCom
            v-if="!isHistoryPrescript"
            :from="currentMsg"
            :editFlag="false"
            @ciOrdersTemplateDiagLength="ciOrdersTemplateDiagLength"
        ></relateDiagnoseCom>

        <el-table
            height="100%"
            :cell-style="cellStyle"
            :cell-class-name="cellcb"
            :header-cell-style="tableTitleStyle"
            ref="tableData"
            :data="tableData"
            style="width: 100%"
            row-key="idOrdersTemplateItems"
            default-expand-all
            :row-class-name="showBChildrenBg"
            
            @selection-change="handleSelectionChange"
            @select="handleSelect"
            @select-all="selectAll"
            :tree-props="{
                children: 'listChargeItem',
                hasChildren: 'hasChildren',
            }"
        >
            <el-table-column type="selection" width="40" :selectable="selectableHandler"></el-table-column>
            <el-table-column label="长临" v-if="fromColumn.repeatIndicator">
                <template slot-scope="scope">
                    {{ scope.row.repeatIndicator | repeatIndicatorFilter }}
                </template>
            </el-table-column>
            <el-table-column prop="sdClinicTypeStr" label="类型" :width="isHistoryPrescript?'80px':'55px'">
                <template slot-scope="scope">
                    <span>{{ scope.row | sdClinicTypeFilter }}</span>
                </template>
            </el-table-column>
            <el-table-column
                prop="clinicItemName"
                label="医嘱"
                show-overflow-tooltip
                min-width="120px"
            >
                <template slot-scope="scope">
                    <span>{{ scope.row | clinicItemNameFilter }}</span>
                </template>
            </el-table-column>
            <el-table-column
                prop="drugSpecification"
                label="规格"
                width="80"
                show-overflow-tooltip
                v-if="!isHistoryPrescript"
            >
                <template slot-scope="scope">
                    <span v-if="scope.row.drugSpecification">{{
                        scope.row.drugSpecification
                    }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="数量" width="130">
                <template slot-scope="scope">
                    <template v-if="scope.row.totalAmount">
                        <template v-if="isShowInputTotal(scope.row)">
                            <inputNum
                                :num="scope.row.totalAmount"
                                @changeHandle="totalAmountChange"
                                :currentIndex="scope.$index"
                                :row="scope.row"
                            ></inputNum>
                            <el-tooltip
                                effect="dark"
                                :content="scope.row.sdUnitStr"
                                :disabled="
                                    !scope.row.sdUnitStr ||
                                    scope.row.sdUnitStr.length < 3
                                "
                                placement="top"
                            >
                                <span>{{
                                    tooltipsFormatter(scope.row.sdUnitStr, 3)
                                }}</span>
                            </el-tooltip>
                        </template>
                    </template>
                    <template v-else-if="scope.row.amount">
                        <inputNum
                            :num="scope.row.amount"
                            @changeHandle="totalAmountChange"
                            :currentIndex="scope.$index"
                            :row="scope.row"
                        ></inputNum>
                        <el-tooltip
                            effect="dark"
                            :content="scope.row.sdUnitStr"
                            :disabled="
                                !scope.row.sdUnitStr ||
                                scope.row.sdUnitStr.length < 3
                            "
                            placement="top"
                        >
                            <span>{{
                                tooltipsFormatter(scope.row.sdUnitStr, 3)
                            }}</span>
                        </el-tooltip>
                    </template>
                </template>
            </el-table-column>
            <el-table-column
                prop="dose" 
                label="用量"
                align="left"
                width="120"
            >
                <template slot-scope="scope">
                    <el-input-number
                        class="inputNumModel"
                        v-if="scope.row.sdClinicType == CONSTANT.DRUG_TYPE"
                        controls-position="right"
                        v-model="scope.row.dose"
                        @change="
                            (val) => doseChange(val, scope.$index, scope.row)
                        "
                    ></el-input-number>
                    <span class="doseSpan">
                        {{ scope.row | unitFilter }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column
                prop="routeName"
                label="途径"
                width="70"
                show-overflow-tooltip
            >
                <template slot-scope="scope">
                    <span>
                        {{ scope.row | routeNameFilter }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="频次" width="60" show-overflow-tooltip>
                <template slot-scope="scope" v-if="!isInPatient">
                    <span v-show="isInterim(scope.row)">
                        {{ scope.row | idFreqFilter }}
                    </span>
                </template>
                <template slot-scope="scope" v-else>
                    <el-select
                        v-model="scope.row.idFreq"
                        @change="(val) => changeFreq(val, scope.row)"
                        placeholder="片/次"
                        ref="idFreq"
                        v-show="isInterim(scope.row)"
                    >
                        <el-option
                            v-for="item in inspectList"
                            :key="item.idFreq"
                            :label="item.description"
                            :value="item.idFreq"
                        >
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column
                prop="groupCode"
                label="执行时段"
                width="120"
                align="center"
                show-overflow-tooltip
                v-if="fromColumn.groupCode"
            >
                <template slot-scope="scope">
                    <el-select
                        placeholder="执行时段"
                        v-model="scope.row.groupCode"
                        @change="updateInPatientTemplate(scope.row)"
                        v-show="isInterim(scope.row)"
                    >
                        <el-option
                            v-for="item in handlerGroupCode(scope.row)"
                            :key="item.groupCode"
                            :label="item.executeTimeStr"
                            :value="item.groupCode"
                        >
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column
                prop="dtOrderStart"
                label="开始时间"
                width="220"
                v-if="fromColumn.dtOrderStart"
            >
                <template slot-scope="scope">
                    <el-date-picker
                        v-show="isInterim(scope.row)"
                        v-model="scope.row.dtOrderStart"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        @blur="updateInPatientTemplate(scope.row)"
                        placeholder="选择日期时间"
                        :default-time="handlerDefaultTime(scope.row)"
                    >
                    </el-date-picker>
                </template>
            </el-table-column>
            <el-table-column
                prop="planDays"
                label="天数"
                width="50"
                align="center"
                show-overflow-tooltip
            ></el-table-column>
            <el-table-column
                prop="deptName"
                :label="isHistoryPrescript ? '药房' : '执行科室'"
                width="100"
                show-overflow-tooltip
            ></el-table-column>
            <el-table-column
                prop="checkMessage"
                label="验证"
                width="100"
                show-overflow-tooltip
                :formatter="formatMessage"
            ></el-table-column>
            <el-table-column prop label="操作" width="60" v-if="!isHistoryPrescript">
                <template slot-scope="scope">
                    <span v-if="scope.row.priceItemName">
                        <el-button
                            @click="deleteChargeItems(scope.row, scope.$index)"
                            type="text"
                            >删除</el-button
                        >
                    </span>
                    <span v-else>
                        <el-button
                            :disabled="scope.row.sdClinicType == '1'"
                            @click="addChargeItems(scope.row, scope.$index)"
                            type="text"
                            >新增</el-button
                        >
                    </span>
                </template>
            </el-table-column>
        </el-table>
        <div style="text-align: right; padding:20px;">
            <el-button @click="cancleDialog">取消</el-button>
            <el-button
                :loading="isLoading"
                type="primary"
                @click="confrimQuote"
                :disabled="isClock || !btnDisabledStatus"
                >确定</el-button
            >
        </div>

        <!-- 添加收费项目组件 -->
        <AddChargeItem
            v-if="chargeItemData.chargeItemVisable"
            @sendChargeObj="sendChargeObj"
            :chargeItemData="chargeItemData"
        ></AddChargeItem>
        <!-- 医保校验弹窗 -->
        <!-- <MedicalCheck :MedicalCheckData = "MedicalCheckData" ref="MedicalCheck" @saveTemplate="saveTemplate" @changeLoading="changeLoading"></MedicalCheck> -->
        <!-- 医保校验不通过弹窗 -->
        <CheckTpml
            :checkData="checkData"
            @changePassFlag="changePassFlag"
            @checkHistory="drugMedicalValid"
            @noImmediately="noImmediately"
            ref="CheckTpml"
        ></CheckTpml>
        <!-- <OutpIndicationTpmlBar 
            v-if="transSelfDrugForm.visible"
            :transSelfDrugForm="transSelfDrugForm"
            @forceSelfHandler="forceSelfHandler">

        </OutpIndicationTpmlBar> -->
        <Reimbursement  v-if="reimbursement.dialogVisible" :reimbursement="reimbursement" @cancle="cancleReimburDialog" @confirmClinic="forceSelfHandler"></Reimbursement>
        <!-- 禁忌药 -->
        <cdcDrugsMsg :cdcDrugsInfo="cdcDrugsInfo" v-if="cdcDrugsInfo.dialogVisible" @cancleCdcMsg="cancleCdcMsg"></cdcDrugsMsg>
    </div>
</template>

<script>
import bus from "@/components/common/bus.js";
import { mapMutations, mapGetters } from "vuex";
import AddChargeItem from "./addChargeItem/addChargeItem.vue";
import CheckTpml from "@/components/page/Common_WEB/outPatientcomp/checkTpml/checkTpml.vue"; // 医保校验弹窗
import inputNum from "./comp/inputNumber.vue";

import relateDiagnoseCom from "@/components/page/DictManage_WEB/doctorOrderModule/comp/relateDiagnoseCom/index.vue"; //关联诊断
// import MedicalCheck from '../../medicalCheck/MedicalCheck.vue'
import OutpIndicationTpmlBar from './outpIndicationTpmlBar/index.vue';
import Reimbursement from '@/components/page/Common_WEB/reimbursement/medicalInsReimbursement.vue'; // 医保多报销比例弹层
import cdcDrugsMsg from '@/components/page/Common_WEB/cdcDrugsMsg'; // cdc禁忌药

import mixinsGcpAtm from "@/components/page/Common_WEB/mixins/mixinsGcpAtm";
import {mixinCheckDiagnosis} from '@/components/page/Common_WEB/reimbursement/mixinCheckDiagnosis.js' // 诊断分类查询适应症或禁忌
const MEDICAL_TAB = "medicalRecord"; //病历tab
const DOCORDER_TAB = "doctorAdvice"; //医嘱tab

var reg = /^[1-9]\d*$/;         //正整数

let that;
export default {
    props: {
        inspectData: {
            default() {
                return {};
            },
        },
        from: {
            default() {
                return {};
            },
        },
    },
    components: {
        AddChargeItem,
        CheckTpml,
        inputNum,
        relateDiagnoseCom,
        OutpIndicationTpmlBar,
        // MedicalCheck
        Reimbursement,
        cdcDrugsMsg
    },
    mixins:[mixinsGcpAtm,mixinCheckDiagnosis],
    data() {
        return {
            transSelfDrugForm: {
                visible: false,
                trSelfList: [],//转自费药品的列表
            },
            reimbursement:{ // 医保多报销比例
                dialogVisible: false,
                diagnosisType: [], // 诊断信息
                drugsDetailList: [], // 药品信息
                chargeTypeCode: JSON.parse(sessionStorage.getItem("receivePatientParams")).chargeTypeCode, // 费别
            },
            ciOrdersTempDiagLength: 0, // 诊断个数
            currentMsg: {},
            currentParamObj: {}, //当前对象属性合集
            immediatelyId: [],
            currentTime: 0,
            inspectList: [],
            isClock: false,
            btnDisabledStatus: false,
            passFlag: 0,
            handlerTimeObj: {},
            idOrdersList: [], //医嘱id集合
            templateItemList: [], //引用项目集合
            insuranceIndicator: 1, //医保
            idOrdersTemplate: "", //医嘱模板主键
            templateType: "", //类型
            isLoading: false, //按钮是否显示加载状态
            multipleSelection: [],
            idOrdersTemplateItem: [], //医嘱模板id
            idClinicItem: [], //药品id
            checkDoctorAuthObj: {}, //医生开立权限
            chargeItemData: {
                chargeItemVisable: false,
                idOrdersTemplate: "",
                idOrdersTemplateItem: "",
            },
            idOrdersTemplateItemList: [],
            //医保校验弹窗数据
            // MedicalCheckData: {
            //   idOrdersTemplateItemList: [],
            //   idOrdersTemplate: '',
            // },
            checkData: {
                // 传递给弹窗的值
                dialogVisible: false, // 弹窗是否展示
                messageList: "", // 要校验的数据
                submitStatus: false, // 是否展示确认按钮
                isFreeStatus: false, // 是否展示转自费按钮
                showDetail: false, // 是否展示查看详情按钮
                toImmediately: false, //是否展示转即刻是按钮
                insuranceFlag: false, //医保拒付是按钮
                noImmediately: false, //是否展示否按钮
            },
            toSelfPayIdList: [], // 需要转自费的数据
            toImmediatelyIdList: [], //需要转小剂量的数据
            routeNameObj: {}, //用途列表对象
            idFreqObj: {}, //频次列表对象
            tableData: [],
            tableTitleStyle: {
                fontSize: "14px",
                color: "#000",
                padding: "0px",
                height: "32px",
                lineHeight: "32px",
                background: "#f5f5f5",
            },
            cellStyle: {
                fontSize: "14px",
                height: "32px",
                lineHeight: "32px",
                color: "#333",
                padding: "0px",
            },
            keysArr: [],
            pharmacy: "", //药房
            storageName: "", //药房名称
            checkDrugParams: {
                insuranceFlag: "",
                icno: "",
                idOrdersTemplate: "",
                idPat: "",
                idVisit: "",
                sdScene: "",
            },
            templateClinicType: "",
            inspectTreeList: [],   //检查类别tree
            examDeptUseLocalArr: [], //检查本科室
            clinicItemEnabledList: [], // 诊疗项目是否可用list
            prPriceItemVsInsuranceVOList: [],
            cdcDrugsInfo:{ // cdc禁忌药信息
                dialogVisible: false,
            },
            csClinicItemDrugVo: [],
        };
    },

    computed: {
        ...mapGetters(["outpCurTab", "routerPath"]),
        indicatorType() {
            let obj = {
                outpatient: "01",
                historyPrescript: "01",
                emergency: "02",
                inPatient: "03",
            };
            return obj[this.fromType];
        },
        userParmas() {
            return this.getUserStorage();
        },
        idDeptStr() {
            return this.userParmas.idDept;
        },
        idEmp() {
            return this.userParmas.idEmp;
        },
        deptNameStr() {
            return this.userParmas.deptName;
        },
        fromType() {
            return this.from.type || "";
        },
        fromColumn() {
            return this.from.column || {};
        },
        isInPatient() {
            return this.fromType === "inPatient";
        },
        isHistoryPrescript() {
            return this.fromType === "historyPrescript";
        },
        //阿特蒙
        isAtmeng(){
            return this.$limits.isFun(this)
        },
        chargeTypeCode() {
            let chargeTypeCode = JSON.parse(sessionStorage.getItem("receivePatientParams")).chargeTypeCode;
            // 阿特蒙异地医保处理  如果是异地医保 默认走医保流程
            chargeTypeCode = this.isAtmeng && chargeTypeCode == this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE_ATM ? this.CONSTANT.OUTPEXCESS_CHARGETYPECODE : chargeTypeCode;
            // 博仁异地医保处理  如果是异地医保 默认走医保流程
            chargeTypeCode = !this.isAtmeng && chargeTypeCode == this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE ? this.CONSTANT.OUTPEXCESS_CHARGETYPECODE : chargeTypeCode;
            return chargeTypeCode
        },    
        isInsPat() {
            return this.chargeTypeCode == this.CONSTANT.OUTPEXCESS_CHARGETYPECODE
        },
        idClinicItemList() {
            return this.templateItemList.map(v => v.idClinicItem).filter(item => item);
        },
        getIdClinicArr(){
            return this.tableData.reduce((arr,item) =>{
                let obj = {};
                obj.idClinicItem = item.idClinicItem;
                obj.sdClinicType = item.sdClinicType;
                item.idClinicItem && arr.push(obj);
                return arr;
            },[])
        },
        getEnabledClinic(){
            return this.clinicItemEnabledList.map(item =>item.idClinicItem);
        },
        // 西药项目id集合
        westDrugIdClinicItemList() {
            return this.templateItemList.filter(v => this.isWestDrug(v)).map(item => item.idClinicItem);
        },
        getPrPriceItemList(){
            let map = new Map();
            this.prPriceItemVsInsuranceVOList.map(item =>{
                map.set(item.idClinicItem, item.prPriceItemVsInsuranceVOList)
            })
            return map
        },
        concatSympStr() {
            let clinicSymp = this.inspectData.clinicSymp || '';//接诊主诉
            let physSign = this.inspectData.physSign || '';//接诊体征
            if(clinicSymp && physSign) return `${clinicSymp} ; ${physSign}`
            return `${clinicSymp}${physSign}`
        },
        getCsClinicItemDrugVoList(){
            let map = new Map();
            this.csClinicItemDrugVo.map(item =>{
                map.set(item.idClinicItem, item.csClinicItemDrugVo)
            })
            return map
        },
        //药品 项目主键id
        allDrugIdClinicItemList() {
            let arr = this.tableData.filter( v => this.isDrugType(v))
            return arr
        },
        filterRepeatDrugObj() {
            let newSort = this.repeatArrayElements(this.allDrugIdClinicItemList, 'idClinicItem');
            let paramsArr = [];
            paramsArr = newSort.map( v => {
                return {
                    chargeTypeCode: this.chargeTypeCode,
                    idClinicItem: v.idClinicItem,
                    idStorage: v.idDept, //药房
                    visitType: this.indicatorType, //就诊类型 01-门诊 02-急诊 03-住院 04-体检
                    sellUnit: "", //销售单位
                }
            })
            return paramsArr
        },
    },
    filters: {
        repeatIndicatorFilter(val) {
            let map = new Map().set(0, "临时").set(1, "长期");
            return map.get(val);
        },
        unitFilter(row) {
            return row.doseUnitsStr || row.doseUnits;
        },
        sdClinicTypeFilter(row) {
            let str = row.sdPriceItemStr || row.sdClinicTypeStr || row.presType;
            return str;
        },
        routeNameFilter(row) {
            if (!row.idRoute) {
                return "";
            }
            if (!that.routeNameObj[row.idRoute]) {
                return "";
            }
            return that.routeNameObj[row.idRoute].routeName;
        },
        idFreqFilter(row) {
            if (!row.idFreq) {
                return "";
            }
            if (!that.idFreqObj[row.idFreq]) {
                return "";
            }
            return that.idFreqObj[row.idFreq].description;
        },
        clinicItemNameFilter(row) {
            if(that.isHerBalDrug(row) && row.sdClinicTypeStr) {
                let cn =  row.clinicItemName || ''
                let pn =  row.prescriptionName || ''
                let ds =  row.description || ''
               return cn +' ' + pn + ds
            }
            return row.priceItemName || row.clinicItemName || row.ordersName;
        },
    },
     created() {
        that = this;
        this.chargeFreq();
        this.drugsFreq();
        this.initUsageOptions();
        this.$root.Bus.$off("treeData");
        this.$root.Bus.$on("treeData", async (msg) => {
            if (msg == 0) {
                this.tableData = [];
            }
            let receivePatientParams = JSON.parse(
                sessionStorage.getItem("receivePatientParams")
            );
            if (typeof msg === "object") {
                this.currentMsg = msg;
                console.log(msg,'msg');
                this.idOrdersTemplate = msg.idOrdersTemplate;
                this.templateClinicType = msg.sdClinicType;
                this.checkDrugParams.insuranceFlag = this.isInsPat ? true : false;
                this.checkDrugParams.icno = receivePatientParams.insuranceNo;
                this.checkDrugParams.idPat = receivePatientParams.idPat;
                this.checkDrugParams.idVisit = receivePatientParams.idVisit;
                this.checkDrugParams.sdScene = this.inspectData.sdScene;
                this.checkDrugParams.idPat = receivePatientParams.idPat;
                this.checkDrugParams.idOrdersTemplate = msg.idOrdersTemplate;
                await this.remoteClinicTypeTree();
                await this.getExamDeptUseLocal();
                await this.checkDoctorAuth();
                this.getChargeList();
            }
        });
       
        // 特病优先走特病开医嘱
        if (this.inspectData.specialDisease === 1) {
            this.insuranceIndicator = 2; //特病
        } else {
            if (this.chargeTypeCode == this.CONSTANT.OUTPEXCESS_CHARGETYPECODE) {
                this.insuranceIndicator = 1; //医保
            } else {
                // 费别值是02的时候为医保，其余值全为自费  自费患者不能取消
                this.insuranceIndicator = 0; //自费
            }
        }
        if (this.isInPatient) {
            this.init();
        }

        //门诊引用模版校验通过之后回调函数
        bus.$off("afterQuoteTemplCheck");
        bus.$on("afterQuoteTemplCheck", () => {
            this.afterQuoteTempl();
        });
        this.getDiagnosis();// 获取当前诊断信息
    },
    mounted() {},
    methods: {
        ...mapMutations(["SET_DOCCOMMITSTATE", "SET_DOCGOBACKSTATE"]),
        async init() {
            this.getCurrTime();
        },
        //药品
        isDrugType(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE;
        },
        //中药
        isHerBalDrug(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE && row.sdSubClinicType === this.CONSTANT.DRUG_SUB_TYPE
        },
        //西药
        isWestDrug(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE && row.sdSubClinicType !== this.CONSTANT.DRUG_SUB_TYPE
        },
        //是否显示数量输入框
        isShowInputTotal(row) {
            //中药只展示一个数量
            if(this.isHerBalDrug(row) && !row.sdClinicTypeStr) return false
            return true
        },
        // selectableHandler(row){
        //     return !row.checkMessage
        // },

        selectableHandler(row){
            // if(row.isChargeTypePriceDesc === 0) return false
            if(this.orderGroupCodeObj[row.orderGroupCode]){
                let flags = this.orderGroupCodeObj[row.orderGroupCode].some(item=>{
                    return item.checkMessage
                })
                return !flags
            }
            return !row.checkMessage
        },
        cancleDialog() {
            this.$emit("cancle");
        },
        // 获取当前时间
        getCurrTime() {
            this.getServerTime().then((res) => {
                this.currentTime = res;
            });
        },
        //获取检查类型、部位的树形数据
        remoteClinicTypeTree() {
            return this.$axios.get("dict/data/listParentAndChildData", {
                dataClassCode: "SD_CLINIC_TYPE",
                dataCode: this.CONSTANT.INSPECT_TYPE, //检查
            }).then(res => {
                if (res.success) {
                    this.inspectTreeList = res.data || [];
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },

         // 查看医生开药权限
        checkDoctorAuth() {
            let ajaxUrl = "/org/emp/property/findReEmpAnti";
            return this.$axios.post(ajaxUrl, {  idEmp: this.idEmp}).then((res) => {
                if (res.success) {

                    return this.checkDoctorAuthObj = res.data;
                }else {
                    this.$message.warning(res.message);
                    return false
                }
            })
        },

        /** 获取哪些分类下属于本科室 */
        getExamDeptUseLocal() {
            let Obj = {
                systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                paramTypeCode: 'Exam_Dept_Use_Local',
            }
            return this.getDefaultValueBySystemParamCode(Obj).then((data)=> {
                console.log('Exam_Dept_Use_Local ----',data);
                this.examDeptUseLocalArr = data || [];
            })
        },
          //校验是否是本科室
        isOwnDept(row) {
            row.idDept =  row.idDept || this.idDeptStr; //患者所在科室id
            row.deptName =  row.deptName || this.deptNameStr; //患者所在科室名字
            this.inspectTreeList.map( v =>{
                if(v.code === row.sdSubClinicType && v.childVOList) {
                    v.childVOList.map( item => {
                        if(item.code === row.sdSubExamType && this.examDeptUseLocalArr.includes(item.idData)) {
                            row.idDept = this.idDeptStr; //患者所在科室id
                            row.deptName = this.deptNameStr; //患者所在科室名字
                        }
                    })
                }
            })
        },
        //用法
        async initUsageOptions() {
            let arr = await this.selectRoute();
            let obj = {};
            arr.forEach((item) => {
                obj[item.idRoute] = item;
            });
            this.routeNameObj = obj;
        },
        isInterim(row) {
            if (!this.isInPatient) {
                return true;
            }
            return row.repeatIndicator === 1;
        },
        handlerDefaultTime(row) {
            // 根据执行时段设置默认时间
            let curr = row.idFreqTimeList.filter((item) => {
                return item.groupCode === row.groupCode;
            })[0];
            if (curr) {
                let data = new Date(this.currentTime + 8 * 3600 * 1000);
                let time = data.toJSON().substr(11, 2);
                let arr = curr.executeTimeStr.split("-");
                arr.sort((a, b) => {
                    return a - b;
                });
                let str = "";
                for (let i = 0, l = arr.length; i < l; i++) {
                    let item = arr[i];
                    let pre = time - item > 0;
                    let next = arr[i + 1] - time > 0;
                    if (pre && next) {
                        str = arr[i + 1];
                        break;
                    } else {
                        str = item;
                    }
                }
                return `${str}:00:00`;
            }
            return "12:00:00";
        },
        handlerGroupCode(row) {
            if (!row.idFreqTimeList) {
                this.changeFreq(row.idFreq, row, "groupCode");
                this.$set(row, "idFreqTimeList", []);
            }
            return row.idFreqTimeList;
        },
        changeFreq(val, row, from) {
            this.getExecuteTime(val).then((res) => {
                if (res) {
                    if (!from) {
                        row.groupCode = "";
                        this.updateInPatientTemplate(row);
                    }
                    row.idFreqTimeList = res;
                }
            });
        },
        // 验证必填数据
        validateTable(row) {
            // 临时医嘱
            if (!this.isInterim(row)) {
                return true;
            }
            let msg = "";
            if (!row.dtOrderStart) {
                msg = "请选择开始时间";
            }
            if (!row.groupCode) {
                msg = "请选择执行时段";
            }
            if (!row.idFreq) {
                msg = "请选择频次";
            }
            if (msg) {
                this.$message({
                    type: "warning",
                    message: msg,
                });
                return false;
            }
            return true;
        },
        updateInPatientTemplate(row) {
            if (this.isInPatient) {
                let flag = this.validateTable(row);
                if (!flag) {
                    return;
                }
                this.updateInPatient(row);
            }
        },
        // 更新住院模板数据
        updateInPatient(row) {
            let data = JSON.parse(JSON.stringify(row));
            data.idOrdersTemplate = this.idOrdersTemplate;
            delete data.idFreqTimeList;
            let url = "/tpl/ciOrdersTemplate/updateCiOrdersTemplateItemInp";
            this.$axios._post(url, data).then((res) => {
                if (res.success) {
                } else {
                    this.$message({
                        type: "warning",
                        message: res.message,
                    });
                }
            });
        },
        // 保存模板数据
        saveInPatientTemplate() {
            let idList = [];
            let listChargeItem = [];
            let flag = false;
            this.multipleSelection.map((item) => {
                let valid = this.validateTable(item);
                if (!valid) {
                    flag = true;
                    return;
                }
                idList.push(item.idOrdersTemplateItem);
                listChargeItem.push(...item.listChargeItem);
            });
            if (flag) {
                this.isLoading = false;
                return;
            }
            let Obj = {
                idList: idList,
                idPat: this.$route.query.idPat,
                idVisit: this.$route.query.idVisit,
                listChargeItem: listChargeItem,
                idWard: this.getUserStorage().idDept,
            };
            let url = "doctws/quoteTemplate/saveTemplate";
            // url = window.globalUrl.baseURL11 + url
            this.$axios._post(url, Obj).then((res) => {
                this.isLoading = false;
                if (res.success) {
                    this.$message({
                        message: "保存成功",
                        type: "success",
                    });
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
            });
        },
        //执行时段
        getExecuteTime(idFreq) {
            let Obj = {
                idFreq: idFreq,
            };
            return this.$axios
                .post("/dict/freq/findFreqInfoById", Obj)
                .then((res) => {
                    if (res.success) {
                        return res.data.freqTimeList;
                    } else {
                        this.$message({
                            type: "warning",
                            message: res.message,
                        });
                        return false;
                    }
                });
        },
        //频次列表
        async drugsFreq() {
            let arr = await this.selectFrep();
            let obj = {};
            arr.forEach((item) => {
                obj[item.idFreq] = item;
            });
            this.idFreqObj = obj;
            this.inspectList = arr;
        },
        //tooltip格式化
        tooltipsFormatter(str, len) {
            if (str && str.length > len) {
                return str.substr(0, len - 1) + "...";
            } else {
                return str;
            }
        },
        //验证字段格式化
        formatMessage(row, column) {
            let res = row.checkMessage;
            return res;
        },
        doseChange(val, index, row) {
            let newIndex = row.currentPIndex 
            row.dose = val;
            // 第四个参数是用量修改标识
            this.totalAmountChange(row.totalAmount, newIndex, row, true);
        },
        //查药品信息根据ID
        drugsHerbalDetailFn(parmas) {
            return this.$axios.post('dict/clinicDrug/findCsClinicItemDrugById', parmas).then(res => {
                if (res.success) {
                    return res.data;            
                } else {
                    this.$message({
                        type: 'warning',
                        message: res.message,
                    });
                }
            })
        },
        filterHerbalTotalAmount(val, row) {
            let some = this.tableData.filter( v => v.orderGroupCode === row.orderGroupCode);
            some.map( v => v.totalAmount = val)
            let stockParam = [];
            some.map( v => {
                //药品库存校验参数
                stockParam.push({
                    idClinicItem: v.idClinicItem,
                    idDept: v.idDept,
                    insuranceIndicator: "",
                    totalAmount: v.totalAmount || v.amount,
                    totalAmountUnit: v.sdUnitStr,
                    sdSubClinicType: v.sdSubClinicType,
                    dose: v.dose,
                    doseUnits: v.doseUnits,
                    idOrdersTemplateItem: v.idOrdersTemplateItem
                });
            })
            this.checkDrugStock(stockParam);
        },
    
        //编辑数量计算天数
        totalAmountChange(val, index, row, doseFlag = false) {
            let newIndex = row.currentPIndex 
            //中药数量修改
            if(this.isHerBalDrug(row)) {
                row.totalAmount = val;
                this.filterHerbalTotalAmount(val, row)
                return
            }
            if (row.totalAmount) {
                row.totalAmount = val;
            } else if (row.amount) {
                //材料
                row.amount = val;
                return;
            }
            if (this.isInPatient) {
                this.updateInPatientTemplate(row);
                return;
            }
            //非药品或者即刻不计算,这种写法是为了兼容不同数据来源
            if (!val) {
                if (row.sdClinicType != "1")  return;
                return;
            }
            let param = {
                total: val,
                days: row.planDays,
                once: row.dose,
                sellUnitOp: row.sdUnit || row.sdUnitStr,
                idClinicItem: row.idClinicItem,
            };
            this.drugsDetails(newIndex, doseFlag, param);
            // 如果不是药品，不查库存
            if (row.sdClinicType != "1")  return;
            let data = [];
            data.push({
                idClinicItem: row.idClinicItem,
                idDept: row.idDept,
                insuranceIndicator: "",
                totalAmount: row.totalAmount,
                totalAmountUnit: row.sdUnitStr || row.totalAmountUnit,
                sdSubClinicType: row.sdSubClinicType,
                dose: row.dose,
                doseUnits: row.doseUnits,
                idOrdersTemplateItem: row.idOrdersTemplateItem
            });
            this.checkDrugStock(data, newIndex);
        },
        //是否即刻
        chargeFreq() {
            let data = {
                systemId: 1,
                paramTypeCode: "Freq_Immediately",
            };
            return this.$axios
                .post(
                    "/dict/conf/listBySystemIdAndParamTypeCodeForDefaultValue",
                    data
                )
                .then((res) => {
                    if (res.success) {
                        this.immediatelyId = res.data;
                    }
                });
        },
        //计算数量/天数
        async totalChange(isCalculateAmount, index, params) {
            let currRow = this.tableData[index];

            isCalculateAmount ? delete params.total : delete params.days;
            let res = await this.calculationTotal2(params);

            if (isCalculateAmount) {
                //计算数量
                if (currRow.totalAmount) {
                    currRow.totalAmount = res;
                } else if (currRow.amount) {
                    currRow.amount = res;
                }
                
            } else {
                //计算天数
                res = res || 1;
                // 如果是即刻，不修改天数
                if (!currRow.isImmediate) {
                    currRow.planDays = res;
                }
                if (currRow.orderGroupCode) {
                    this.findGroupMate(index, res);
                }
            }
            //库存校验
            let stockParam = [];
            stockParam.push({
                idClinicItem: currRow.idClinicItem,
                idDept: currRow.idDept,
                insuranceIndicator: "",
                totalAmount: currRow.totalAmount,
                totalAmountUnit: currRow.sdUnitStr,
                sdSubClinicType: currRow.sdSubClinicType,
                dose: currRow.dose,
                doseUnits: currRow.doseUnits,
                idOrdersTemplateItem: currRow.idOrdersTemplateItem
            });
            this.checkDrugStock(stockParam, index).then(res=>{
                if(res){
                    let toSelfOrderArr = [];
                        if (currRow.sdConstrainedLevel == "3")
                            toSelfOrderArr.push(currRow.idOrdersTemplateItem);
                        let checkParam = Object.assign(
                            {
                                passFlag: this.passFlag,
                                idOrdersTemplateItemList: new Array({
                                    id: currRow.idOrdersTemplateItem,
                                    planDays: currRow.planDays,
                                    totalAmount: currRow.totalAmount || currRow.amount,
                                    dose: currRow.dose,
                                }),
                                toSelfPayIdList: toSelfOrderArr,
                                toImmediatelyIdList: [],
                            },
                            this.checkDrugParams
                        );
                        //中药不校验医保天数
                        if(this.isHerBalDrug(currRow)) return

                        this.checkDrugOrder(checkParam).then((checkResult) => {
                            let tipMessage = "";
                            if (!checkResult.state) {
                                //未通过
                                if (
                                    checkResult.messageList &&
                                    checkResult.messageList[0].idList &&
                                    currRow.idOrdersTemplateItem ==
                                        checkResult.messageList[0].idList[0]
                                ) {
                                    tipMessage = checkResult.messageList[0].msg;
                                }
                                if(this.tableData[index].checkMessage && !tipMessage) return
                                //校验未通过的显示提示信息
                                this.toggleRowSelectionSetMessage(index, tipMessage);
                            } else {
                                tipMessage = "";
                                //校验未通过的显示提示信息
                                if(this.tableData[index].checkMessage && !tipMessage) return
                                this.toggleRowSelectionSetMessage(index, tipMessage);
                                this.clockHandle();
                            }
                        });
                }
            })
            
        },
        //确定按钮状态判断
        clockHandle() {
            if (!this.idOrdersTemplateItemList.length) {
                this.isClock = true;
                return;
            }
            this.isClock = false;
        },
        //查询相同组号的医嘱
        findGroupMate(currentIndex, result) {
            let copyGroupCode = this.tableData[currentIndex].orderGroupCode;

            this.tableData.forEach((item, index) => {
                if (
                    item.orderGroupCode &&
                    item.orderGroupCode == copyGroupCode &&
                    index != currentIndex
                ) {
                    // 非即刻重新计算天数
                    if (!this.immediatelyId.includes(item.idFreq)) {
                        item.planDays = result;
                    }
                    let obj = this.tableData[index];
                    //非药品不计算
                    if (obj.sdClinicType != "1") {
                        return;
                    }
                    let param = {
                        once: item.dose,
                        sellUnitOp: item.sdUnit || item.sdUnitStr,
                        idClinicItem: item.idClinicItem,
                        days: item.planDays,
                    };

                    //根据天数换算数量
                    this.drugsDetails(index, true, param);
                }
            });
        },
        //查询药品信息
        async drugsDetails(index, isCalculateAmount, obj) {
            this.currentParamObj[index] = obj;
            let params = {
                idClinicItem: obj.idClinicItem,
                idStorage: obj.idDept, //药房
                visitType: this.indicatorType, //就诊类型 01-门诊 02-急诊 03-住院 04-体检
                sellUnit: "", //销售单位
            };
            let res = await this.$axios.post("dict/clinicDrug/findCsClinicItemDrugById", params);
            if (res.success) {
                //查频次信息
                let freqData = await this.queryFrequency(this.tableData[index].idFreq);
                this.immediatelyId.forEach((it) => {
                    if (it == this.tableData[index].idFreq) {
                        this.tableData[index].planDays = eval(freqData.freqCounter);
                        this.tableData[index].isImmediate = true;
                    }
                });
                obj.freqCounter = eval(freqData.freqCounter);
                obj.factorUnits = eval(freqData.factorUnits);
                obj.freqInterval = eval(freqData.freqInterval);
                obj.factorDoseDrugForm = eval(res.data.factorDoseDrugForm);
                obj.factorDrugFormStock = eval(res.data.factorDrugFormStock);
                obj.stockUnit = res.data.stockUnit; //取药品库存单位
                obj.sdDrugFormUnit = res.data.drugFormUnit;
                (obj.sdDrugForm = res.data.sdDrugForm), //剂型
                    (obj.doseDefault = res.data.doseDefault), //默认剂量
                    (obj.unitState =
                        this.tableData[index].sdUnit == res.data.stockUnit
                            ? false
                            : true);
                this.totalChange(isCalculateAmount, index, obj);
            }
        },

          //获取每一个药的药品信息
        async getAllDrugsDetails() {
            let ajaxUrl = "/dict/clinicDrug/findCsClinicItemDrugByIds";
            let res = await this.$axios._post(ajaxUrl, this.filterRepeatDrugObj);
            if (res.success) {
                this.csClinicItemDrugVo = res.data;
                this.tableData.map( (row, rIndex) => {
                    let cur = this.getCsClinicItemDrugVoList.get(row.idClinicItem);
                    if(!cur) return
                    this.$set(row, "currDrugsDetails", cur);   //药品信息
                    let msg = this.checkDrugsAuth(row);
                    if(msg) this.toggleRowSelectionSetMessage(rIndex, msg)
                })
                return true;
            } else {
                this.$message.warning(res.message);
                return false
            }
        },
        //医保天数校验
        checkDrugOrder(data) {
            let url = `/outpdr/druginsurance/checkDrugOrderFromTemplateList`;
            if (this.isHistoryPrescript) {
                url = `/outpdr/druginsurance/historyCheckDrugOrderFromTemplateList`;
            }
            return this.$axios._post(url, data).then((res) => {
                if (res.success) {
                    return res.data;
                } else {
                    this.$message({
                        type: "error",
                        message: res.message,
                    });
                    return {};
                }
            });
        },
        //查频次信息
        queryFrequency(id) {
            return this.$axios
                .post("dict/freq/findFreqInfoById", {
                    idFreq: id,
                })
                .then((res) => {
                    if (res.success) {
                        return res.data;
                    } else {
                        this.$message({
                            type: "error",
                            message: res.message,
                        });
                        return new Error(res.message);
                    }
                });
        },
        showBChildrenBg({ row, rowIndex }) {
            if (row.listChargeItem) {
                return "BChildrenBg";
            }
        },
        //是否显示复选框
        cellcb(row) {
            if (!row.row.sdClinicTypeStr && row.columnIndex == "0") {
                return "myCell";
            }
            let n = 10;
            if (this.isInPatient) {
                n = 13;
            }
            if (this.isHistoryPrescript) {
                n = 9;
            }
            if (
                row.row.checkMessage &&
                row.columnIndex == n
            ) {
                return "colorRed";
            }
        },
        handleSelect(selection, row) {
            if (this.isHistoryPrescript) {
                this.$emit("handleSelect", selection, row);
            }
        },
        selectAll(selection) {
            if (this.isHistoryPrescript) {
                this.$emit("select-all", selection);
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = val;
            let newIdClinicItem = []; //药品id集合接收变量
            let newSdClinicType = []; //类型集合接收遍历
            let templateItemArr = []; //引用项目集合
            let idOrdersTemplateItemArr = []; //医嘱模板项目id集合
            let copyVals = this.copyObject(val);
            copyVals.map((item, index) => {
                 if(this.isDrugType(item)) delete item.currDrugsDetails
                //若没有组号，直接存储选中的
                if (!item.orderGroupCode) {
                    templateItemArr.push(item);
                    idOrdersTemplateItemArr.push(item.idOrdersTemplateItem); //传递给医保校验的数据
                } else {
                    //若是成组的，组中的每一项都进行存储（因为同组中只展示一个复选框）
                    this.tableData.map((i) => {
                        if (
                            item.orderGroupCode == i.orderGroupCode &&
                            item.sdClinicTypeStr
                        ) {
                            templateItemArr.push(i);
                            idOrdersTemplateItemArr.push(
                                i.idOrdersTemplateItem
                            ); //传递给医保校验的数据
                        }
                    });
                }

                newIdClinicItem.push(item.idClinicItem); //药品id集合
                newSdClinicType.push(item.sdClinicType); //类型集合
              
            });
           
            //检查处理查体和主诉、备注
            templateItemArr.map( item => {
                if(item.sdClinicType === this.CONSTANT.INSPECT_TYPE) {
                    item.clinicSymp = this.concatSympStr
                    item.description = item.description || '-'
                }

            })

            this.idClinicItem = JSON.parse(JSON.stringify(newIdClinicItem));
            this.templateType = JSON.parse(JSON.stringify(newSdClinicType));
            this.templateItemList = templateItemArr;
            this.idOrdersTemplateItemList = JSON.parse(
                JSON.stringify(idOrdersTemplateItemArr)
            );
            this.clockHandle(); //控制按钮状态
            if (this.isHistoryPrescript) {
                this.$emit("selection-change", templateItemArr);
                return;
            }
        },
        addChargeItems(row, index) {
            this.chargeItemData.chargeItemVisable = true;
            this.chargeItemData.idOrdersTemplate = this.idOrdersTemplate;
            this.chargeItemData.idOrdersTemplateItem = row.idOrdersTemplateItem;
            this.chargeItemData.idOrdersTemplateItems =
                row.idOrdersTemplateItem + index;
        },
        deleteChargeItems(row, index) {
     
            this.confirmdeleteCharge(row);
        },
        confirmdeleteCharge(row) {
            this.tableData.map((item) => {
                if (item.listChargeItem.length) {
                    item.listChargeItem.map((i, ind) => {
                        if (
                            i.idOrdersTemplateChargeItem ==
                            row.idOrdersTemplateChargeItem
                        ) {
                            item.listChargeItem.splice(ind, 1);
                        }
                    });
                }
            });
        },
        //删除不必要的属性
        deleteProperty(item) {
            delete item.content;
            delete item.doseUnitsStr;
            delete item.groupCodeStr;
            delete item.idFreqStr;
            delete item.sdClinicTypeStr;
            delete item.sdSubClinicTypeName;
            delete item.sdUnitStr;
            delete item.specimenName;
            delete item.sdBodyStr;
            delete item.deptName;
            delete item.routeName;
            // delete item.drugSpecification
            delete item.idOrdersTemplateItems;
        },
        //接收添加收费项目子组件传递的数据
        sendChargeObj(obj) {
            this.tableData.map((item) => {
                if (obj.idOrdersTemplateItem == item.idOrdersTemplateItem) {
                    //界面新增收费项目
                    item.listChargeItem.push(obj);
                }
            });
        },

        //药品适应症医保等级接口
        drugIndication(list,templateItemList) {
            return this.getIndicationsBrOrATM(list).then(data=>{
                this.prPriceItemVsInsuranceVOList = data;
                templateItemList.forEach(item =>{
                    let rowId = this.getPrPriceItemList.get(item.idClinicItem);
                    if(rowId){
                        item.prPriceItemVsInsuranceVOList = rowId
                    }
                })
            })
        },

        //引用模板
        confrimQuote() {
            if (!this.multipleSelection.length) {
                this.$message({
                    message: "请选择要使用的医嘱模板",
                    type: "warning",
                });
            } else {
                // 住院
                if (this.isInPatient) {
                    this.isLoading = true;
                    this.saveInPatientTemplate();
                    return;
                }
                //历史处方
                if (this.isHistoryPrescript) {
                    this.isLoading = false;
                    this.$emit("saveHistoryPrescript", this.multipleSelection);
                    return;
                }
                this.toSelfPayIdList = [];
                this.beforeSaveTempl();
            }
        },

        confrimQuoteEvent() {
            this.isLoading = true;
            if (this.templateType.includes("1")) {
                // console.log('药品 -----');
                this.drugMedicalValid();
            } else {
                // console.log('非药品 -----');
                this.saveTemplate(); //调用引用模板接口
            }
        },
        //当医保校验接口请求失败，改变loading的值
        // changeLoading(val) {
        //   this.isLoading = val
        // },
        // 关闭弹窗将passFlag置为0
        changePassFlag(val) {
            this.passFlag = val;
            this.toSelfPayIdList = [];
            this.toImmediatelyIdList = [];
        },
        // 不转即刻
        noImmediately() {
            // this.passFlag = 31
            this.toImmediatelyIdList = [];
            this.drugMedicalValid();
        },

        //药品校验
        drugMedicalValid(val) {
            if (val == "isInsuranceToSelf") {
                this.checkData.messageList.map((item) => {
                    if (item.idList) {
                        item.idList.map((i) => {
                            this.toSelfPayIdList.push(i);
                        });
                    }
                });
            }
            this.isLoading = true;
            // this.$refs.CheckTpml.submitLoading = true
            let newArr = [];
            this.idOrdersTemplateItemList.forEach((item) => {
                for (let i = 0; i < this.tableData.length; i++) {
                    let curr = this.tableData[i];
                    //过滤中药
                    if ( curr.idOrdersTemplateItem == item && curr.sdClinicType == "1" && !this.isHerBalDrug(curr)) {
                        newArr.push({
                            id: item,
                            planDays: curr.planDays,
                            dose: curr.dose,
                            totalAmount: curr.totalAmount || curr.amount
                        });
                        //丙类转自费
                        if (
                            curr.sdConstrainedLevel == "3" &&
                            !this.toSelfPayIdList.includes(item)
                        ) {
                            this.toSelfPayIdList.push(item);
                        }
                        break;
                    }
                }
            });
            this.tableData;
            let obj = Object.assign(
                {
                    idOrdersTemplateItemList: newArr,
                    passFlag: this.passFlag,
                    toSelfPayIdList: this.toSelfPayIdList,
                    toImmediatelyIdList: this.toImmediatelyIdList,
                },
                this.checkDrugParams
            );
             //过滤中药
            if(!newArr.length) {
                this.saveTemplate(); //调用引用模板接口
                return
            }
            let url = "/outpdr/druginsurance/checkDrugOrderFromTemplate";
            this.$axios._post(url, obj).then((res) => {
                if (res.success) {
                    // this.passFlag = res.data.passFlag
                    if (res.data.state == 1) {
                        // 校验通过
                        this.checkData.dialogVisible = false;
                        this.isLoading = true;
                        this.passFlag = 0;
                        this.saveTemplate(); //调用引用模板接口
                    } else if (res.data.state == 0) {
                        // 校验未通过
                        // if (res.data.noPassType == 10) {
                        //   res.data.messageList.map(item => {
                        //     if(item.idList) {
                        //       item.idList.map(i=>{
                        //         this.toSelfPayIdList.push(i)
                        //       })
                        //     }

                        //   })
                        // }

                        this.passFlag = res.data.passFlag;
                        this.checkData.dialogVisible = true;
                        this.isLoading = false;
                        this.checkData.messageList = res.data.messageList;
                        this.checkData.showDetail = false;
                        this.checkData.submitStatus = false;
                        this.checkData.isFreeStatus = true;
                        // res.data.noPassType = 22
                        this.checkData.toImmediately = false; //是按钮
                        this.checkData.noImmediately = false; //否按钮
                        this.checkData.insuranceFlag = false; //医保拒付是按钮
                        if (
                            res.data.noPassType == 15 ||
                            res.data.noPassType == 21 ||
                            res.data.noPassType == 30 ||
                            res.data.noPassType == 40
                        ) {
                            // 只有关闭
                            this.checkData.isFreeStatus = false;
                        } else if (res.data.noPassType == 71 && !this.isAtmeng) {
                            // 博仁 医保天数校验  --  只有关闭
                            this.checkData.isFreeStatus = false;
                        }else if (res.data.noPassType == 50) {
                            this.checkData.submitStatus = true; // 有确定按钮
                            this.checkData.isFreeStatus = false;
                        } else if (res.data.noPassType == 60) {
                            // 关闭，转自费，查看详情
                            this.checkData.showDetail = true;
                        } else if (res.data.noPassType == 20) {
                            this.checkData.insuranceFlag = true; //医保拒付是按钮
                            this.checkData.toImmediately = false; //转即刻是按钮
                        } else if (res.data.noPassType == 22) {
                            this.checkData.toImmediately = true; //转即刻是按钮
                            this.checkData.noImmediately = true; //否按钮
                            this.checkData.isFreeStatus = false; //转自费不展示
                            this.checkData.insuranceFlag = false; //医保拒付是按钮
                            // this.toSelfPayIdList = [] //转自费数组为空
                            // 转即刻数组赋值
                            res.data.messageList.map((item) => {
                                if (item.idList) {
                                    item.idList.map((i) => {
                                        this.toImmediatelyIdList.push(i);
                                    });
                                }
                            });
                        } else {
                            this.checkData.showDetail = false;
                            this.checkData.submitStatus = false;
                            this.checkData.isFreeStatus = true;
                        }
                    }
                    //  转自费
                    if (val == "isInsuranceToSelf") {
                        this.templateItemList.map((item) => {
                            item.isInsuranceToSelf = "0";
                            this.toSelfPayIdList.map((i) => {
                                if (item.idOrdersTemplateItem == i) {
                                    item.isInsuranceToSelf = "1"; //转自费
                                }
                            });
                        });
                        // 转即刻
                    }
                    // else if(val == 'isImmediately') {
                    //   this.templateItemList.map(item=> {
                    //     // item.isImmediately = '0'
                    //     item.toImmediatelyIdList = this.toImmediatelyIdList
                    //     // this.toImmediatelyIdList.map(i => {
                    //     //   if(item.idOrdersTemplateItem == i) {
                    //     //     item.isImmediately = '1' //转即刻
                    //     //   }
                    //     // })
                    //   })
                    // }
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                    // this.$emit('changeLoading',false)
                }
                this.$refs.CheckTpml.submitLoading = false;
                this.$refs.CheckTpml.noImmediatelyLoading = false;
                this.isLoading = false;
            });
        },
        //获取列表接口
        getChargeList() {
            this.btnDisabledStatus = false
            let obj = {
                pageIndex: 1,
                pageSize: 999,
                idOrdersTemplate: this.idOrdersTemplate,
                isShowChargeItem: "1",
            };
            let url = `/tpl/ciOrdersTemplate/pageCiOrdersTemplateItem`;
            if (this.isHistoryPrescript) {
                url = `/outpdr/historypres/historyPres`;
                obj = {
                    pageIndex: 1,
                    pageSize: 999,
                    idVisit: this.currentMsg.idVisit,
                };
            }
            this.$axios.post(url, obj).then( async (res) => {
                if (res.success) {
                    this.tableData = res.data.records;
                    // console.log("tableData", this.tableData);
                    let stockParam = []; //库存校验参数
                    if (this.$refs.tableData) this.$refs.tableData.clearSelection(); 
                    if (!this.tableData.length) return;
                    this.tableData.map((v, i) => {
                        v.currentPIndex = i;
                        //中药类型处理
                        if(this.isHerBalDrug(v)) v.sdClinicTypeStr = '中药'
                        //阿特蒙检查 数量处理
                        if(this.isAtmeng && v.sdClinicType == this.CONSTANT.INSPECT_TYPE)  v.totalAmount = v.quantity || 1

                        if (!v.sdUnitStr)  v.sdUnitStr = v.totalAmountUnit;

                        if (this.isHistoryPrescript) {
                            // 历史处方都是药品,适配原来的数据
                            v.sdClinicType = "1";
                            v.sdPriceItemStr = "";
                            v.idOrdersTemplateItem = v.idOrders;
                            v.sdClinicTypeStr = v.presType;
                        }
                        
                        if (v.sdClinicType == "1") {
                            //药品库存校验参数
                            stockParam.push({
                                idClinicItem: v.idClinicItem,
                                // idDept: this.pharmacy,
                                idDept: v.idDept,
                                insuranceIndicator: "",
                                totalAmount: v.totalAmount || v.amount,
                                totalAmountUnit: v.sdUnitStr,
                                sdSubClinicType: v.sdSubClinicType,
                                dose: v.dose,
                                doseUnits: v.doseUnits,
                                idOrdersTemplateItem: v.idOrdersTemplateItem
                            });
                        }
                        // 默认全选
                        this.$nextTick(() => {
                            if (this.$refs.tableData) this.$refs.tableData.toggleRowSelection( this.tableData[i],  true);
                        });
                        
                        //处理key值
                        if (v.idOrdersTemplateItem)  v.idOrdersTemplateItems = JSON.parse(JSON.stringify(v.idOrdersTemplateItem));

                        //解决key值的重复问题
                        if (v.listChargeItem && v.listChargeItem.length) {
                            v.listChargeItem.map((item, index) => {
                                if ( v.idOrdersTemplateItem == item.idOrdersTemplateItem ) {
                                    item.idOrdersTemplateItems = item.idOrdersTemplateChargeItem;
                                }
                            });
                        }
                        // 检查检验一个申请单多个项目展示分组
                        if (i == this.tableData.length - 1) return;
                        let curTable =  this.tableData[i];
                        if ( curTable.sdClinicType != "1" && curTable.idForm != null && curTable.idForm == this.tableData[i + 1].idForm) {
                            this.tableData[i + 1].sdClinicTypeStr = "";
                        }
                    });
                    //检索相同组号医嘱
                    this.arrayRepet(this.tableData, "orderGroupCode").map((item, index) => {
                        this.tableData[item].sdClinicTypeStr = "";
                    });
                    
                    let idOrdersTemplateItemArr = [];
                    let toSelfOrderArr = [];
                    this.tableData.forEach( (item) => {
                        //中药不走医保天数校验
                        if (item.sdClinicType == "1" && !this.isHerBalDrug(item)) {
                            idOrdersTemplateItemArr.push({
                                id: item.idOrdersTemplateItem,
                                planDays: item.planDays,
                                totalAmount: item.totalAmount || item.amount,
                                dose: item.dose,
                            });
                            // item.deptName = this.storageName;
                            //丙类转自费
                            if (item.sdConstrainedLevel == "3") toSelfOrderArr.push(item.idOrdersTemplateItem);
                        }

                        //检查本科室处理                
                        if(item.sdClinicType == this.CONSTANT.INSPECT_TYPE) {                          
                            this.isOwnDept(item);
                        }
                    });

                    //库存校验
                    if (stockParam && stockParam.length) {
                        await this.checkDrugStock(stockParam);
                    }
                        
                    //医保校验
                    if ( idOrdersTemplateItemArr &&  idOrdersTemplateItemArr.length  ) {
                        let checkParam = Object.assign(
                            {
                                passFlag: this.passFlag,
                                idOrdersTemplateItemList: idOrdersTemplateItemArr,
                                toSelfPayIdList: toSelfOrderArr,
                                toImmediatelyIdList: this.toImmediatelyIdList,
                            },
                            this.checkDrugParams
                        );
                        // 如果是住院，暂时不调用校验规则
                        if (this.isInPatient)  return;

                        this.checkDrugOrder(checkParam).then((checkResult) => {
                            let list = checkResult.messageList;
                            if (!list) return;
                            let tipMessage = "";
                            this.tableData.forEach((value,idx) => {
                                tipMessage = "";
                                list.forEach((item) => {
                                    if (
                                        item.idList &&
                                        value.idOrdersTemplateItem ==
                                            item.idList[0]
                                    ) {
                                        tipMessage = item.msg;
                                    }
                                });
                                //校验未通过的显示提示信息
                                if(this.tableData[idx].checkMessage && !tipMessage) return
                                this.toggleRowSelectionSetMessage(idx, tipMessage);
                            });
                        });
                    }

                } else {
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
            }).then(async ()=>{
                await this.getAllDrugsDetails();
                this.listClinicItemForEnable();// 查询诊疗项目是否失效
                this.btnDisabledStatus = true
            });
        },
        // 查询诊疗项目enable 可用的
        listClinicItemForEnable(){
            if(!this.getIdClinicArr.length) return;
            this.$axios._post('/dict/clinicItem/listClinicItemForEnable',this.getIdClinicArr).then(res =>{
                if(res.success){
                    this.clinicItemEnabledList = res.data;
                }else{
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
            }).then(()=>{
                this.checkEnabledClinic();
            })
        },
        // 诊疗项目失效后不可引用
        checkEnabledClinic(){
            this.tableData.map((row,index) =>{
                if(!this.getEnabledClinic.includes(row.idClinicItem)){
                    this.toggleRowSelectionSetMessage(index, '已失效！');
                }
            })
        },
        // isFilterCurrentIndex(row) {
        //     this.tableData.filter(())
        // },
        isFilterSomeOrderGroup(row) {
             if(this.orderGroupCodeObj[row.orderGroupCode]){
                let curr = this.orderGroupCodeObj[row.orderGroupCode].filter(item=>{
                    return item.idOrdersTemplateItem === row.idOrdersTemplateItem
                })[0]
                let flags = this.orderGroupCodeObj[row.orderGroupCode].some(item=>{
                    return item.checkMessage
                })
                if(flags){
                    this.$nextTick(()=>{
                        this.$refs.tableData.toggleRowSelection(this.orderGroupCodeObj[row.orderGroupCode][0],false);
                    })
                }else{
                    this.$nextTick(()=>{
                        this.$refs.tableData.toggleRowSelection(this.orderGroupCodeObj[row.orderGroupCode][0],true);
                    })
                }
            }
        },
      
        //库存校验
        checkDrugStock(data, index = null) {
          
            return this.$axios
                ._post("/outpdr/drug/batchCheckStock", data)
                .then((res) => {
                    if (res.success) {
                        let mydata = res.data
                        if (mydata.length > 0 && !index) {
                            //列表初始化校验
                            mydata.forEach((item) => {
                                for (  let i = 0;  i < this.tableData.length; i++ ) {
                                    if (
                                        this.tableData[i].idClinicItem ==
                                            item.idClinicItem &&
                                        item.totalAmountUnit ==
                                            this.tableData[i].sdUnitStr &&
                                        item.absent
                                    ) {
                                        this.toggleRowSelectionSetMessage(i, item.desc);
                                    }
                                }
                            });
                        } 
                        if(mydata.length == 0 && index === null) {
                            //列表初始化校验
                            data.forEach((item) => {
                                for (  let i = 0;  i < this.tableData.length; i++ ) {
                                    if (this.tableData[i].idClinicItem == item.idClinicItem) {
                                        this.toggleRowSelectionSetMessage(i, '');
                                    }
                                }
                            });
                        }
                        if (index || index == "0") {
                            if (mydata.length && mydata[0].absent) {
                                //单项修改校验
                                this.toggleRowSelectionSetMessage(index, mydata[0].desc);

                                return false
                            }
                            this.toggleRowSelectionSetMessage(index, '');
                            this.clockHandle();
                        }
                        return true
                    } else {
                        this.$message.warning(res.message);
                        return false
                    }
                });
        },

        toggleRowSelectionSetMessage(index, message) {

            let msg = this.checkDrugsAuth(this.tableData[index]);
            if(msg) message = msg;
            this.$set(this.tableData[index], "checkMessage", message);
            this.$refs.tableData.toggleRowSelection(this.tableData[index],!message);
            this.isFilterSomeOrderGroup(this.tableData[index])
        },

          //毒麻 处方、高价药校验
        checkDrugsAuth(row){
            if(!this.isDrugType(row)) return ''
            let currDrugsDetails = row.currDrugsDetails || {}
            let msg = ''
            // 高价药权限
            if(currDrugsDetails.highPriceFlag){
                if(this.checkDoctorAuthObj.highPricePerm !== '1'){
                    msg = `药品【${currDrugsDetails.clinicItemName}】为高价药，您不具备高价药的开立权限！`;
                }
            }
        
            //中药不提示西药提示
            if(this.isHerBalDrug(row)) msg = '';

            return msg;
        },
        //引用模板接口
        async saveTemplate() {
            let vm = this;
            let toSelfList = [];
            this.templateItemList.map((item, index) => {
                if(item.sdClinicType == this.CONSTANT.DRUG_TYPE){
                    item.specialDrugIndicator = 2;   // 医保多报销 不设置特效药字段 1-符合，0-不符合，2-未设置
                }
                if (this.insuranceIndicator !== 0 && item.sdConstrainedLevel == "3") {
                    //丙类转自费
                    item.isInsuranceToSelf = "1";
                    item.insuranceIndicator = '0';
                }
                
                //药品 
                if(this.isWestDrug(item)){
                    toSelfList.push(item.idClinicItem);
                }
                // if(this.isInsPat && item.sdClinicType == this.CONSTANT.DRUG_TYPE && item.insuranceIndicator !== '0' && !this.toSelfPayIdList.includes(item.idOrdersTemplateItem)) {
                // //    console.log('医保患者 药品， 非自费  --- 查医保适应症');
                //    toSelfList.push(item.idClinicItem);
                // }
                for (let i = 0; i < this.tableData.length; i++) {
                    if (
                        item.idOrdersTemplateItem ==
                        this.tableData[i].idOrdersTemplateItem
                    ) {
                        //阿特蒙检查 数量处理
                        if(this.isAtmeng && item.sdClinicType == this.CONSTANT.INSPECT_TYPE) {
                            item.quantity = this.tableData[i].totalAmount || 1;
                        }
                        item.totalAmount =
                            this.tableData[i].totalAmount ||
                            this.tableData[i].amount;
                        item.planDays = this.tableData[i].planDays;
                        if (item.listChargeItem.length) {
                            item.listChargeItem.map((it, x) => {
                                it.amount =
                                    vm.tableData[i].listChargeItem[x].amount;
                            });
                        }
                        return;
                    }
                }
            });
             // 包含医保适应症的药品
            if(toSelfList.length) {
               this.isHasToSelfHanlder(toSelfList, this.templateItemList);
               return

            } 
            // this.saveTemplateInfo();
            this.beforeSaveTemplate();
           
        },
        async beforeSaveTemplate(){
            // 优先执行禁忌药提示，关闭后 保存
            let cdcFlag = await this.handlerCdcDrugs(this.templateItemList);
            if(cdcFlag) return; 
            this.saveTemplateInfo();
        },
        // cdc禁忌药提示 阿特蒙 历史处方通用
        async handlerCdcDrugs(data){
            if(this.isAtmeng){
                let drugCodeList = data.filter(item=>{
                    if(this.isWestDrug(item)){
                        return item.drugCode
                    }
                }).map(v=> v.drugCode);
                drugCodeList = [...new Set(drugCodeList)];
                if(!drugCodeList.length) return false;
                let obj = {
                    idVisit: this.$route.query.idVisit,
                    idPat: this.$route.query.idPat,
                    drugsIdList: drugCodeList
                }
                let cdcResult = await this.getQueryTabooDrug(obj);
                if(cdcResult){
                    this.cdcDrugsInfo.result = cdcResult;
                    this.cdcDrugsInfo.dialogVisible = true;
                    return true;
                }  
                return false;
            }
            return false;
        },
        // 取消cdc后继续执行医保校验，保存
        cancleCdcMsg(){
            this.isLoading = true;
            //历史处方
            if (this.isHistoryPrescript) {
                this.$emit("finallyHisTorySave");
                return;
            }else{
                this.saveTemplateInfo();
            }
        },
         //打开医保适应症转自费弹窗
        isOpenInsureSelfDialog(iData) {
            let sdConsLevel_BR = [this.CONSTANT.CONSTRainedLEVEL_4,this.CONSTANT.CONSTRainedLEVEL_5];
            //医保等级4和5需要弹出适应症信息并且要有转自费按钮   --- 博仁 有特殊药品标识也要提示
            if(!this.isAtmeng) {
                return this.isInsPat && (sdConsLevel_BR.includes(iData.sdConstrainedLevel) || iData.excessReimburseRatioFlag)
            } else {
                //医保患者判断适应症信息是否有无，有，则弹出适应症信息，由医生选择是否转自费。   --- 阿特蒙
                return this.isInsPat && (!!iData.description || iData.excessReimburseRatioFlag)
            }
        },
         // 包含医保适应症的药品
        async isHasToSelfHanlder(toSelfList, templateItemList) {
            this.reimbursement.drugsDetailList = [];
            await this.drugIndication(toSelfList,templateItemList);
            // 查询诊断分类 适应症，禁忌信息
            if(this.isAtmeng){
                await this.findClassClinicByIdClinicItems(this.westDrugIdClinicItemList, JSON.parse(sessionStorage.getItem("receivePatientParams")));
            }
            templateItemList.map(item =>{
                let priceItem = item.prPriceItemVsInsuranceVOList;
                console.log(item);
                let showDialog = this.includesShowDialog(item,priceItem);
                if(showDialog){
                    let v = priceItem[0];
                    v.clinicItemName = v.priceItemName;
                    v.idClinicItem = item.idClinicItem;
                    if(this.isAtmeng){
                        let arr = this.getDrugsDiagnosisDetail.get(v.idClinicItem) || []; // 存在不适症提示，禁忌提示
                        this.$set(v,'diagnosisArr',arr);
                    }
                    this.$set(v, 'self', !this.insuranceIndicator) // 0-自费患者 提示框勾选
                    v.isEdit = false; // 不是编辑
                    this.reimbursement.drugsDetailList.push(v)
                }
            })
            if(this.reimbursement.drugsDetailList.length) {
                //打开转自费弹窗
                this.reimbursement.dialogVisible = true
            } else {

                  //历史处方
                if (this.isHistoryPrescript) {
                    if(this.isAtmeng){ // 阿特蒙集成cdc
                        this.$emit("beforeHistorySave");
                        return;
                    }
                    this.$emit("finallyHisTorySave");
                    return;
                }
                this.beforeSaveTemplate();
            }
        },
        includesShowDialog(item,priceItem){
            // 存在对应诊断分类 适应症，禁忌提示
            if(this.isAtmeng && this.getDrugsDiagnosisDetail.get(item.idClinicItem)){
                return true;
            }
            // 医保患者 药品， 非自费  --- 查医保适应症 (阿特蒙,博仁) 共享医嘱转自费后排除
            if(priceItem && priceItem.length && this.isOpenInsureSelfDialog(priceItem[0]) && item.insuranceIndicator !== '0' && !this.toSelfPayIdList.includes(item.idOrdersTemplateItem)){
                return true;
            }
            return false;
        },
        cancleReimburDialog(){
            this.reimbursement.dialogVisible = false;
            if(this.isHistoryPrescript){ // 历史处方引用
                this.$emit('resetCheckList');
            }
        },
        // 获取诊断类型
        getDiagnosis(){
            let idPat = this.$route.query.idPat;
            let idVisit = this.$route.query.idVisit;
            this.selectCiDiaRecord(idPat, idVisit, this.CONSTANT.OUTP_DIAGNOSIS_FLAG ).then( data => {
                if(data.length) {
                    this.reimbursement.diagnosisType =  data;
                }
            })
        },
        //处理手动转自费
        forceSelfHandler() {
            //历史处方
            if (this.isHistoryPrescript) {
                this.$emit("forceSelfHandler", this.reimbursement.drugsDetailList);
                return;
            }

            this.isLoading = true;
            let toSelfArr = this.copyObject(this.reimbursement.drugsDetailList);
            this.templateItemList.map( v => {
                v.specialDrugIndicator = 2;   // 医保多报销 不设置特效药字段 1-符合，0-不符合，2-未设置
                toSelfArr.map( item => {
                    //适应症转自费
                    if(v.idClinicItem === item.idClinicItem) {
                        if(item.self){
                            v.isInsuranceToSelf = "1";
                            v.insuranceIndicator = '0';
                        }
                        v.specialDrugIndicator = item.specialDrugIndicator;
                    }
                })
            })
            this.cancleReimburDialog();
            this.beforeSaveTemplate();

        },
        //关联诊断个数
        ciOrdersTemplateDiagLength(num) {
            this.ciOrdersTempDiagLength = num || 0;
        },
        //引用模版之前校验
        beforeSaveTempl() {
            bus.$emit("beforeQuoteTempl", this.ciOrdersTempDiagLength);
        },
        //引用模版校验之后
        afterQuoteTempl() {
            this.confrimQuoteEvent();
        },
        async saveTemplateInfo() {

             //gcp 医嘱
            if(this.isAtmeng) {
                let gcpParmas = {
                    sdVisitType: this.CONSTANT.OUTP_VISIT_TYPE,
                    gcpOrders: this.templateItemList, 
                    idList: this.idClinicItemList,
                }
                let gcpOrders = await this.commitSomeGcpOrders(gcpParmas);
                if(!gcpOrders) return
                this.templateItemList = this.copyObject(gcpOrders);
            }

            let Obj = {
                chargeTypeCode: this.chargeTypeCode,
                idDept: this.getUserStorage().idDept,
                idDeptCreate: this.getUserStorage().idDept,
                createDeptName: this.getUserStorage().deptName,
                idPat: this.$route.query.idPat,
                idVisit: this.$route.query.idVisit,
                templateItemList: this.templateItemList,
                insuranceIndicator: this.insuranceIndicator, //0-自费 1-医保 2-特
                toImmediatelyIdList: this.toImmediatelyIdList, //转即刻数组
                idDiagnosisClass: this.inspectData.idDiagnosisClass, // 诊断分组id
                sdScene: this.inspectData.sdScene, //场景
                idOrdersTemplate: this.currentMsg.idOrdersTemplate, //模版id
            };
            Obj = this.traversalObject(Obj);
             console.log('最终保存 -----', Obj);
             //埋点
            this.getBuryingPoint('医嘱模板引用', Obj);

            this.$axios
                ._post("/outpdr/quoteOutpTemplate/saveTemplate", Obj)
                .then((res) => {
                    // this.isLoading = false
                    if (res.success) {
                        this.isLoading = false;
                        this.$message({
                            message: "保存成功",
                            type: "success",
                        });
                        this.multipleSelection = [];
                        bus.$emit("closeTemplate", 1); //关闭医嘱模板弹窗

                        if (this.outpCurTab === MEDICAL_TAB) {
                            bus.$emit("afterQuoteupDateDiagns");
                        }

                        if (this.outpCurTab === DOCORDER_TAB) {
                            this.SET_DOCCOMMITSTATE(true); //获取医嘱列表数据
                        }
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning",
                        });
                        this.isLoading = false;
                    }
                });
        },

         //埋点处理
        getBuryingPoint(eventName, parmas = {}) {
            //埋点
            let parame = [{
                eventDescription: eventName,
                properties:[parmas],
                title: '医嘱操作',   //模块
                subTitle: '医嘱开立', //子模块
                url: this.routerPath,
            }]
            this.buryingPoint(parame);
        },
        //清空定时器
        clearHandle() {
            let setTimeData = this.API.api.setTime;
            this.setIntervalHand = setInterval(() => {
                if (setTimeData <= 0) {
                    this.isLoading = false;
                    clearInterval(this.setIntervalHand)
                } else {
                    setTimeData--;
                }
            }, 1000)
        },
    },
     watch:{
        isLoading: {
            handler(val) {
                if (val === true) {
                    this.clearHandle();
                } else {
                    clearInterval(this.setIntervalHand)
                }
            },
        },
        tableData(val){
            if(val.length){
                this.orderGroupCodeObj = this.orderGroupCodeDataHandler(val)
            }
        }
    }
};
</script>
<style lang='scss' src='./outpTmplBarRightCont.scss'>
</style>