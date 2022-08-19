<template>
    <div class="outpTmplBarRightCont flexColumn template">
        <!-- 关联诊断 -->
        <relateDiagnoseCom
            v-if="!isHistoryPrescript"
            :from="currentMsg"
            :editFlag="false"
            @ciOrdersTemplateDiagLength="ciOrdersTemplateDiagLength"
        ></relateDiagnoseCom>
        <div class="flexRow templateTimePiker">
            <StartAndEndTime
                v-model="allStartTime"
                :isModules="true" 
                label-width="0"
            ></StartAndEndTime>
            <bed-comp @change="applyAllTime" v-model="templateAsyn"  :disabled="!allStartTime" from="templateAsyn" class="templateAsyn"></bed-comp>
        </div>
        <!--  row-key="idOrdersTemplateItems" -->
        <div class="templateTable">
            <el-table
            height="100%"
            :cell-style="cellStyle"
            :cell-class-name="cellcb"
            :header-cell-style="tableTitleStyle"
            ref="tableData"
            stripe
            border
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
                <el-table-column :resizable="false"  type="selection" width="35" :selectable="selectableHandler"></el-table-column>
                
                <el-table-column :resizable="false"  label="长临" v-if="fromColumn.repeatIndicator" width="50px">
                    <template slot-scope="scope">
                       <span v-if="isGroup(scope.row)">{{ scope.row.repeatIndicator | repeatIndicatorFilter }}</span> 
                    </template>
                </el-table-column>
                <el-table-column :resizable="false"  prop="sdClinicTypeStr" label="类型" :width="isHistoryPrescript?'80px':'55px'">
                    <template slot-scope="scope" >
                        <span v-if="isGroup(scope.row)">{{ scope.row | sdClinicTypeFilter }}</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" 
                    prop="clinicItemName"
                    label="医嘱内容"
                    min-width="240px"
                >
                    <template slot-scope="scope">
                        <span class="ordersNameDetails"  v-if="scope.row.sdClinicType == CONSTANT.DRUG_TYPE">
                            <!-- 药品医嘱内容展示 (!isInterim(scope.row)? 3: 2)-->
                            <template v-for="(item, index) in 2">
                                <span class="orderItem" :key="index">
                                    <!-- 药品成组展示图标 -->
                                    <span v-show="index==0 && scope.row.orderGroupCode">
                                        <!-- 图标上 -->
                                        <span v-if="isFirst(scope.row)" class="groupFirst"></span>   
                                        <!-- 图标下     -->
                                        <span v-if="isLast(scope.row)" class="groupLast"></span>
                                        <!-- 图标中 -->
                                        <span v-if="isMiddle(scope.row)" class="groupMiddleItem"></span>
                                    </span>
                                    <template v-if="isGroup(scope.row) || index <3">
                                        <span v-if="isHideContent(index, scope.row)"> {{index == 2 ? '-' : ''}} </span>
                                        <span v-else>
                                             <tooltipOver
                                                v-if="scope.row.ordNames[index]"
                                                :content="scope.row.ordNames[index]"
                                                :refName="`ordNames${index}-${scope.$index}`">
                                                {{scope.row.ordNames[index]}}
                                            </tooltipOver>
                                            <span v-else>-</span>
                                        </span>
                                       
                                    </template>
                                    <span v-else>-</span>
                                    <div class="letter_space">
                                        <span v-if="index == scope.row.ordNames.length && scope.row.sdOrderStatus!='0'">
                                                <span 
                                            v-if="isFirst(scope.row,'idFormFontRange')" class="groupFirst reverse"></span>   
                                            <!-- 图标下     -->
                                            <span v-if="isLast(scope.row,'idFormFontRange')" class="groupLast reverse"></span>
                                            <!-- 图标中 -->
                                            <span v-if="isMiddle(scope.row,'idFormFontRange')" class="groupMiddleItem reverse"></span>
                                        </span>
                                        <!-- 皮试医嘱 -->
                                        <span v-if="scope.row.skinTestIndicator == 1 && index==1" class="special">皮</span>
                                        <!-- 特 -->
                                        <span v-if="scope.row.insuranceIndicator == 2 && index==1" class="special">特</span>
                                        <span class="special" v-if="scope.row.absent && index==1">
                                            缺
                                        </span>
                                        <span v-if="scope.row.dischargeMedicationIndicator == 1 && index==1" class="blueTxt">出</span>
                                        <span v-if="scope.row.providedIndicator == 1 && index==1" class="greenTxt">自</span>
                                    </div>
                                </span>
                            </template>
                        </span>
                        <!-- 非药品医嘱内容展示 -->
                        <span class="ordersNameDetails" v-else>
                            <template v-for="(item, index) in 2">
                                <span class="orderItem" :key="index">
                                    <template v-if="index == 0">
                                        <tooltipOver 
                                            :content="`${ handlerContent(scope.row)}`"
                                            :refName="`content${scope.$index}`">
                                            {{handlerContent(scope.row)}}
                                        </tooltipOver>
                                    </template>
                                </span>
                            </template>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false"  prop="totalAmount" label="数量" width="100">
                    <template slot-scope="scope">
                        <div>
                            <div class="flexRow"  v-show="!isInterim(scope.row)">
                                <!-- :disabled="!scope.row.priceItemName" 下面两个inputNumber去掉禁用-->
                                <el-input-number  
                                    v-if="isShowInputNumber(scope.row, 'totalAmount')" 
                                    :controls="false" 
                                    :disabled="isOneDay(scope.row)"
                                    v-model="scope.row.totalAmount" 
                                    @change="val=>totalAmountChange(val, scope.row)">
                                </el-input-number>
                                <el-input-number  
                                    v-if="scope.row.amount" 
                                    :controls="false" 
                                    :disabled="isOneDay(scope.row)"
                                    v-model="scope.row.amount" 
                                    @change="val=>totalAmountChange(val, scope.row)">
                                </el-input-number>
                                <template v-if="isShowInputNumber(scope.row, 'totalAmount', 'amount')">
                                     <span class="doseSpan">
                                        {{ scope.row.totalAmountUnit}}
                                    </span>
                                </template>
                                <!-- <span class="doseSpan" v-if="scope.row.totalAmount ||scope.row.amount">
                                    {{ scope.row.sdUnitStr}}
                                </span> -->
                            </div>
                            <span v-if="isInPatient && !scope.row.priceItemName">
                                <span v-if="scope.row.quantity">{{ scope.row.quantity}} 次</span>
                                <span v-else-if="scope.row.sdClinicType == CONSTANT.INSPECT_TYPE">{{ scope.row.quantity || 1}} 次</span>
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" 
                    prop="dose" 
                    label="单次用量"
                    align="left"
                    width="80px"
                >
                    <template slot-scope="scope">
                        <div class="flexRow">
                            <el-input-number
                                v-if="scope.row.dose !=void 0"
                                :controls="false"
                                controls-position="right"
                                v-model="scope.row.dose"
                                :max="maxDoseRow(scope.row)"
                                @change="
                                    (val) => doseChange(val, scope.row)
                                "
                            ></el-input-number>
                            <span class="doseSpan">
                                {{ scope.row | unitFilter }}
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" 
                    prop="routeName"
                    label="途径"
                    width="70"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">
                        <span v-if="isGroup(scope.row)">
                            {{ scope.row | routeNameFilter }}
                        </span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false"  label="频次" :width="idFreqWidth" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div v-if="isGroup(scope.row)">
                            <span>
                                {{ scope.row | idFreqFilter }}
                            </span>
                        </div>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" 
                    prop="groupCode"
                    label="执行时段"
                    width="120"
                    align="center"
                    show-overflow-tooltip
                    v-if="fromColumn.groupCode"
                >
                    <template slot-scope="scope">
                        <div v-if="isGroup(scope.row)">
                            <el-select
                                placeholder="执行时段"
                                v-model="scope.row.groupCode"
                                @change="val=>changeFreq(scope.row.idFreq, scope.row,'groupCode')"
                                v-show="isInterim(scope.row)"
                            >
                                <el-option
                                    v-for="item in scope.row.idFreqTimeList"
                                    :key="item.groupCode"
                                    :label="item.executeTimeStr"
                                    :value="item.groupCode"
                                >
                                </el-option>
                            </el-select>
                        </div>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" 
                    prop="dtOrderStart"
                    label="开始时间"
                    width="180"
                    v-if="fromColumn.dtOrderStart"
                >
                    <template slot-scope="scope">
                        <div v-if="showStartTime(scope.row)" class="flex">
                            <!-- <el-date-picker
                                v-model="scope.row.dtOrderStart"
                                type="datetime"
                                @focus="setCurrTime(scope.row)"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                @blur="updateInPatientTemplate(scope.row)"
                                placeholder="选择日期时间"
                                :default-time="handlerDefaultTime(scope.row)"
                            >
                            </el-date-picker> -->
                            <el-date-picker 
                                class="beginDate"
                                v-model="scope.row.beginDate" 
                                type="date"
                                format="yyyy-MM-dd" 
                                value-format="yyyy-MM-dd"
                                :clearable="false"
                                @change="startTimeChange(scope.row)"
                                placeholder="开始时间">
                            </el-date-picker>
                            <el-time-picker
                                v-model="scope.row.beginTime"
                                class="beginTime"
                                format="HH:mm"
                                :clearable="false" 
                                value-format="HH:mm"
                                @change="startTimeChange(scope.row)"
                                placeholder="请选择">
                            </el-time-picker>
                            <!-- <StartAndEndTime
                                v-model="scope.row"
                                :isModules="true" 
                                label-width="0"
                                @changeTime="(val)=>startTimeChange(val,scope.row)"
                                :relateData="scope.row.relateData"
                            ></StartAndEndTime> -->
                        </div>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" width="35" >
                    <template slot-scope="scope">
                         <bed-comp v-if="isGroup(scope.row) && !scope.row.priceItemName" @change="val=>applyTime(val,scope.row)" v-model="scope.row.templateAsyn" :disabled="!allStartTime" from="templateAsyn"></bed-comp>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" 
                    prop="planDays"
                    label="天数"
                    width="50"
                    align="center"
                    show-overflow-tooltip
                >
                    <template slot-scope="scope">
                        <span v-if="isGroup(scope.row)">
                            {{ scope.row.planDays}}
                        </span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" 
                    prop="deptName"
                    :label="isHistoryPrescript ? '药房' : '执行科室'"
                    width="100"
                    show-overflow-tooltip
                ></el-table-column>
                <el-table-column :resizable="false" 
                    prop="checkMessage"
                    label="验证"
                    width="100"
                    show-overflow-tooltip
                    :formatter="formatMessage"
                ></el-table-column>
                <el-table-column :resizable="false" label="操作" width="60" v-if="!isHistoryPrescript">
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
                                :disabled="scope.row.sdClinicType == '1' || scope.row.isChargeTypePriceDesc === 0"
                                @click="addChargeItems(scope.row, scope.$index)"
                                type="text"
                                >新增</el-button
                            >
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        
        <div class="templateHandler">
            <el-button @click="cancleDialog">取消</el-button>
            <el-button
                :loading="isLoading"
                type="primary"
                @click="confrimQuote"
                :disabled="isClock"
                >确定</el-button
            >
        </div>
        <!--  详细适应症弹窗 -->
        <!-- 添加收费项目组件 -->
        <AddChargeItem
            v-if="chargeItemData.chargeItemVisable"
            @sendChargeObj="sendChargeObj"
            :inspectData="inspectData"
            :chargeItemData="chargeItemData"
        ></AddChargeItem>
        <!-- 医保校验弹窗 -->
        <!-- <MedicalCheck :MedicalCheckData = "MedicalCheckData" ref="MedicalCheck" @saveTemplate="saveTemplate" @changeLoading="changeLoading"></MedicalCheck> -->
         <!--  医保多报销弹窗 -->
        <Reimbursement  v-if="reimbursement.dialogVisible" :reimbursement="reimbursement" @cancle="cancleReimburDialog" @confirmClinic="forceSelfHandler"></Reimbursement>
        <el-dialog title="提示" :visible.sync="valiDateFlag" append-to-body :close-on-click-modal="false" class="valiDateList">
            <el-table :data="valiDateList" style="width: 100%" max-height="400">
                <el-table-column prop="name" label="医嘱名称">
                </el-table-column>
                <el-table-column prop="message" show-overflow-tooltip label="校验">
                </el-table-column>
            </el-table>
        </el-dialog>
        <!-- 禁忌药 -->
        <cdcDrugsMsg :cdcDrugsInfo="cdcDrugsInfo" v-if="cdcDrugsInfo.dialogVisible" @cancleCdcMsg="cancleCdcMsg"></cdcDrugsMsg>
    </div>
</template>

<script>
import bus from "@/components/common/bus.js";
import { mapMutations, mapGetters } from "vuex";
import AddChargeItem from "./addChargeItem/addChargeItem.vue";
import CheckTpml from "@/components/page/Common_WEB/outPatientcomp/checkTpml/checkTpml.vue"; // 医保校验弹窗
import inputNum from "./comp/inputNumber2.vue";
import IndicationsCom from "@/components/page/Doctws_WEB/syntheticalView/comp/comTmpl/indicationsCom/indicationsCom"; //适应症组件
import relateDiagnoseCom from "@/components/page/DictManage_WEB/doctorOrderModule/comp/relateDiagnoseCom/index.vue"; //关联诊断
// import MedicalCheck from '../../medicalCheck/MedicalCheck.vue'
import StartAndEndTime from "@/components/page/Doctws_WEB/syntheticalView/comp/doctorOrder/commonComponents/startAndEndTime.vue";
import bedComp from '@/components/page/Doctws_WEB/syntheticalView/comp/doctorOrder/inpDocDrugs/checkBoxBtn.vue'
import Reimbursement from '@/components/page/Common_WEB/reimbursement/medicalInsReimbursement.vue'; // 医保多报销比例弹层
import {mixinLeaveHosValidate} from '@/components/page/Doctws_WEB/syntheticalView/comp/doctorOrder/commonComponents/mixinLeaveHosValidate.js'
import {mixinCheckDiagnosis} from '@/components/page/Common_WEB/reimbursement/mixinCheckDiagnosis.js'
import cdcDrugsMsg from '@/components/page/Common_WEB/cdcDrugsMsg'; // cdc禁忌药

const MEDICAL_TAB = "medicalRecord"; //病历tab
const DOCORDER_TAB = "doctorAdvice"; //医嘱tab

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
        StartAndEndTime,
        bedComp,
        IndicationsCom,
        // MedicalCheck
        Reimbursement,
        cdcDrugsMsg
    },
    mixins:[mixinLeaveHosValidate,mixinCheckDiagnosis],
    data() {
        return {
            drugDaysLimitOneDay: [], //用药天数固定为1天的频次
            ciOrdersTempDiagLength: 0, // 诊断个数
            currentMsg: {},
            currentParamObj: {}, //当前对象属性合集
            immediatelyId: [],
            currentTime: 0,
            // forceSelfFlag: false,
            templateAsyn: '0',//同步按钮
            allStartTime: '',
            inspectList: [],
            // forceSelfList: [],//转自费药品的列表
            templateItemListInp: [],//交给后台的模板数据
            isClock: false,
            passFlag: 0,
            idOrdersList: [], //医嘱id集合
            templateItemList: [], //引用项目集合
            insuranceIndicator: 1, //医保
            idOrdersTemplate: "", //医嘱模板主键
            templateType: "", //类型
            isLoading: false, //按钮是否显示加载状态
            multipleSelection: [],
            idOrdersTemplateItem: [], //医嘱模板id
            idClinicItem: [], //药品id
            chargeItemData: {
                chargeItemVisable: false,
                idOrdersTemplate: "",
                idOrdersTemplateItem: "",
            },
            idOrdersTemplateItemList: [],
            toxiList: [],
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
            checkDoctorAuthObj: {},
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
            chargeTypeCode: '',
            outpLimitDays: 0,//出院带药最大天数
            gcpIdentificationList: [], //gcp标识list
            examDeptUseLocalArr: [],
            inspectTreeList: [],
            prPriceItemVsInsuranceVOList:[], // 适应症list
            reimbursement:{ // 医保多报销比例
                dialogVisible: false,
                diagnosisType: [], // 诊断信息
                drugsDetailList: [], // 药品信息
                chargeTypeCode: '' // 费别
            },
            valiDateFlag: false, // 时间不符合提示
            valiDateList: [], // 校验开始时间不符合出院时间list
            clinicItemEnabledList: [], // 诊疗项目是否可用list
            idClinicItemList:[], // 西药查询适应症，禁忌id集合
            drugCodeList: [], //cdc禁忌药code
            cdcDrugsInfo:{ // cdc禁忌药信息
                dialogVisible: false,
            },
        };
    },

    computed: {
        ...mapGetters(["outpCurTab","docPatientParams"]),
        indicatorType() {
            let obj = {
                outpatient: "01",
                historyPrescript: "01",
                emergency: "02",
                inPatient: "03",
            };
            return obj[this.fromType];
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
        isAtmeng(){
            return this.$limits.isFun(this)
        },
        idFreqWidth(){
            if(this.isInPatient){
                return '80px'
            }
            return '60px'
        },
        toxiListObj(){
            let obj = {}
            this.toxiList.forEach(item=>{
                obj[item.dataCode] = item
            })
            return obj
        },
        isCityHealth(){
            return this.docPatientParams.chargeTypeCode  === "02" || this.docPatientParams.chargeTypeCode  === "2" || this.docPatientParams.chargeTypeCode  === "3"
        },
        // forceSelfListObj(){
        //     let obj = {}
        //     this.forceSelfList.forEach(item=>{
        //         obj[item.idOrdersTemplateItem] = item
        //     })
        //     return obj
        // },
        forceSelfListObjs(){
            let obj = {}
            this.reimbursement.drugsDetailList.forEach(item=>{
                obj[item.idOrdersTemplateItem] = item
            })
            return obj
        },
        getIdClinicArr(){
            return this.tableData.map(item => item.idClinicItem).filter(v=>v);
        },
        getIdClinicObjArr(){
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
        getGcpIdList(){
            return this.gcpIdentificationList.map(item => item.idClinicItem)
        },
        getclinicItem(){
            let map = new Map();
            this.gcpIdentificationList.forEach(element => {
                map.set(element.idClinicItem, element.gcpIdentification)
            });
            return map;
        },
        getPrPriceItemList(){
            let map = new Map();
            this.prPriceItemVsInsuranceVOList.map(item =>{
                map.set(item.idClinicItem, item.prPriceItemVsInsuranceVOList)
            })
            return map
        },
        urlParams() {
            return this.$route.query;
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
        
        
    },
    created() {
        let chargeTypeCode = JSON.parse(sessionStorage.getItem("receivePatientParams")).chargeTypeCode;
        if(this.isAtmeng){
            // // 阿特蒙异地医保处理  如果是异地医保 默认走医保流程
            this.chargeTypeCode = chargeTypeCode == this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE_ATM ? this.CONSTANT.OUTPEXCESS_CHARGETYPECODE : chargeTypeCode;
        }else{
            // // 博仁异地医保处理  如果是异地医保 默认走医保流程
            this.chargeTypeCode = chargeTypeCode == this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE ? this.CONSTANT.OUTPEXCESS_CHARGETYPECODE : chargeTypeCode;
        }
        // 医保多报销费别
        this.reimbursement.chargeTypeCode = this.chargeTypeCode;
        that = this;
        // this.listReStorageSelect(this.$route.query.idDept);
        this.chargeFreq();
        this.drugsFreq();
        this.initUsageOptions();
        
        
        this.$root.Bus.$off("treeData");
        this.$root.Bus.$on("treeData", async (msg) => {
            let receivePatientParams = JSON.parse(
                sessionStorage.getItem("receivePatientParams")
            );
            this.tableData = [];
            this.currentMsg = {}
            if (typeof msg === "object") {
                this.currentMsg = msg;
                this.idOrdersTemplate = msg.idOrdersTemplate;
                this.templateClinicType = msg.sdClinicType;
                this.checkDrugParams.insuranceFlag = this.chargeTypeCode == "02" ? true : false;
                this.checkDrugParams.icno = receivePatientParams.insuranceNo;
                this.checkDrugParams.idPat = receivePatientParams.idPat;
                this.checkDrugParams.idVisit = receivePatientParams.idVisit;
                this.checkDrugParams.sdScene = this.inspectData.sdScene;
                this.checkDrugParams.idPat = receivePatientParams.idPat;
                this.checkDrugParams.idOrdersTemplate = msg.idOrdersTemplate;
                await this.remoteClinicTypeTree();
                await this.getExamDeptUseLocal();
                if(!Object.keys(this.checkDoctorAuthObj).length){
                    this.checkDoctorAuth().then(res=>{
                        this.getChargeList();
                    })
                }else{
                    this.getChargeList();
                }
                
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
    },
    mounted() {},
    methods: {
        ...mapMutations(["SET_DOCCOMMITSTATE", "SET_DOCGOBACKSTATE"]),
       init() {
            this.getCurrTime();
            this.getDrugDaysLimitOneDay();
            this.getOutpLimitDays();
            this.getSpecialList();
            this.checkDoctorAuth();
            this.getToxiList();
            this.getLeaveHosDate();// 获取出院时间
            this.getDiagnosis();
        },
         //药品-- 西药和中药
        isDrugType(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE 
        },
         //中药
        isHerBalDrug(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE && row.sdSubClinicType === this.CONSTANT.DRUG_SUB_TYPE
        },
        //西药
        isWestDrug(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE && row.sdSubClinicType !== this.CONSTANT.DRUG_SUB_TYPE
        },

        //是否显示数量框
        isShowInputNumber(row, key, key1) {
            if(this.isHerBalDrug(row) && !this.isGroup(row))  return false
            if(this.isDrugType(row)) return true
            return row[key] || row[key1]
        },
         //特殊隐藏中药内容
        isHideContent(index, row) {
            if(!this.isHerBalDrug(row)) return false
            if(this.isFirst(row)) return false
            return index == 1 || index == 2
        },
        gcpFlagFn(){
            let obj = {
                idVisit: this.urlParams.idVisit,
                sdVisitType: this.CONSTANT.INPA_VISIT_TYPE,
                idEmp: this.getUserStorage().idEmp,
                idClinicItemList: this.getIdClinicArr
            }
            this.findGcpFlag(obj).then(data =>{
                this.gcpIdentificationList = data;
                this.tableData.forEach(ele => {
                    if(this.getGcpIdList.includes(ele.idClinicItem)){
                        ele.gcpIdentification = this.getclinicItem.get(ele.idClinicItem)
                    }else{
                        ele.gcpIdentification = '0'
                    }
                });
            })
        },
        //适应症医保等级接口
        indication(idList) {
            if(!idList.length){
                return;
            }
            this.getIndicationsBrOrATM(idList).then(data=>{
                this.prPriceItemVsInsuranceVOList = data;
                this.tableData.forEach(item =>{
                    let rowId = this.getPrPriceItemList.get(item.idClinicItem);
                    if(rowId){
                        item.prPriceItemVsInsuranceVOList = rowId
                    }
                })
            })
        },
        async forceSelfHandler(){
            // 模板引用
            this.templateItemListInp.forEach(item=>{
                if(this.forceSelfListObjs[item.idOrdersTemplateItem]){
                    item.self = this.forceSelfListObjs[item.idOrdersTemplateItem].self
                    item.specialDrugIndicator = this.forceSelfListObjs[item.idOrdersTemplateItem].specialDrugIndicator;
                }
            })
            this.cancleReimburDialog();
            let flag = await this.handlerCdcDrugs(this.drugCodeList);
            if(flag) return;
            this.saveInPatientTemplateReq()
        },
        // cancleForceSelf(){
        //     this.forceSelfFlag = false
        // },
        getToxiList() {
            this.findSdData('SD_TOXI_TYPE').then(data=>{
                this.toxiList = data.SD_TOXI_TYPE
            })
        },
        applyTime(val,row){
            row.templateAsyn = val   
            row.dtOrderStart = this.allStartTime   
            row.beginDate = this.allStartTime.substr(0,10) || ''   
            row.beginTime = this.allStartTime.substr(11,5)|| '' 
            this.startTimeChange(row);  
        },
        applyAllTime(val){
            this.templateAsyn = true
            this.tableData.forEach(item=>{
                this.applyTime(this.templateAsyn,item)
            })
        },
        startTimeChange(row){
            let dtOrderStart = `${row.beginDate} ${row.beginTime.length == 5 ? row.beginTime+':00': row.beginTime}`
            row.dtOrderStart = dtOrderStart;
            if(this.orderGroupCodeObj[row.orderGroupCode]){
                this.orderGroupCodeObj[row.orderGroupCode].forEach(item=>{
                    item.groupCode = row.groupCode
                    item.groupCodeStr = row.groupCodeStr
                    item.dtOrderStart = row.dtOrderStart // 保存使用dtOrderStart
                    // 以下只是展示
                    item.beginDate = row.beginDate
                    item.beginTime = row.beginTime
                })
            }
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
        /** 获取哪些分类下属于本科室 */
        getExamDeptUseLocal() {
            let Obj = {
                systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                paramTypeCode: 'Exam_Dept_Use_Local',
            }
            return this.getDefaultValueBySystemParamCode(Obj).then((data)=> {
                this.examDeptUseLocalArr = data || [];
            })
        },
        /** 用药天数固定为1天的频次 */
        getDrugDaysLimitOneDay(){
            let obj = {
                systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                paramTypeCode: 'DrugDays_Limit_OneDay'
            }
            return this.listBySystemIdAndParamTypeCodeForDefaultValue(obj).then(res=>{
                this.drugDaysLimitOneDay = res.data || [];
            })
        },
        /** 获取出院带药最大天数 */
        getOutpLimitDays(){
            let obj ={
                systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                paramTypeCode: 'Drug_For_Outp_Limit_Days'
            }
            return this.listBySystemIdAndParamTypeCodeForDefaultValue(obj).then(res=>{
                this.outpLimitDays = parseInt(res.data[0]) || 0
            })
        },
        // 获取特殊药品列表
        getSpecialList(val) {
            let Obj = {
                    systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                    paramTypeCode: 'Auto_Create_Orders_Drug_Type'
                }
            return this.getDefaultValueBySystemParamCode(Obj).then(res=>{
                this.specialList = res; //毒麻
            })
        },
        handlerContent(row) {
            return row.ordersName|| row.content || row.priceItemName || row.clinicItemName
        },
        showStartTime(row){
            return this.isGroup(row) && !row.priceItemName
        },
         //单次用量最大
        maxDoseRow(row) {
             //出院带药不超过10000， 其余不超过5位数
            // if(row.dischargeMedicationIndicator == 1) return 9999
            return 99999
        },
        isOneDay(row) {
            let drugtOneDays = this.drugDaysLimitOneDay || [];
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE && !this.isInterim(row) && drugtOneDays.includes(row.idFreq);
        },
        setCurrTime(row){
            this.getServerTime('ymdHms').then((res) => {
                row.dtOrderStart =  res;
            });
        },
        selectableHandler(row){
            if(row.isChargeTypePriceDesc === 0) return false
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
                this.allStartTime = this.formatDateTime(this.currentTime/1000)
            });
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
        changeFreq(val, row, from) {
            if(!val){
                return
            }
            this.getExecuteTime(val).then((res) => {
                if (res) {
                    row.idFreqTimeList = res.freqTimeList;
                    if(row.idFreqTimeList[0]){
                        // 切换频次，获取执行时段
                        if(!from){
                            // 如果执行时段没有值，就默认第一个
                            if(!row.groupCode){
                                row.groupCode = row.idFreqTimeList[0].groupCode;
                            }
                        }

                    }
                    let vall = ''
                    if(this.idFreqObj[row.idFreq]){
                        vall = this.idFreqObj[row.idFreq].freqStdName
                    }
                    if(vall){
                        vall = vall.toUpperCase().trim()
                    }
                    let obj = {
                        "SOS": this.CONSTANT.FREQUENCY_SOS,
                        "ONCE": this.CONSTANT.FREQUENCY_ONCE,
                        "ST": this.CONSTANT.FREQUENCY_NOW,
                        "PRN": this.CONSTANT.FREQUENCY_PRN,
                    };
                    let curr = obj[vall] || "";
                    let currentGroupCodeObj = {}
                    if(row.idFreqTimeList){
                        row.idFreqTimeList.forEach(item=>{
                            if(item.groupCode === row.groupCode){
                                currentGroupCodeObj = item
                                row.groupCodeStr = item.executeTimeStr
                            }
                        })
                    }
                    let relateData = {
                        ...row,
                        isInterim: row.repeatIndicator, //是否长期医嘱
                        groupCode: currentGroupCodeObj.executeTimeStr, //执行时段
                        frequency: row.idFreq, //频次
                        currFrequencyObj: JSON.parse(JSON.stringify(res)), //频次对象
                        idFreqFlag: JSON.parse(JSON.stringify(curr)), //临时频次标识
                        groupCodeObj: JSON.parse(JSON.stringify(currentGroupCodeObj)) , //是否是周标识
                        idFreqObj: this.idFreqObj[row.idFreq] , //批次对象
                        
                    }
                    // 开始时间相关的数据组装
                    row.relateData = relateData;
                }
            }).then(res=>{
                if(from){
                    if(this.orderGroupCodeObj[row.orderGroupCode]){
                        this.orderGroupCodeObj[row.orderGroupCode].forEach(item=>{
                            item.groupCode = row.groupCode
                            item.groupCodeStr = row.groupCodeStr
                            item.dtOrderStart = row.dtOrderStart
                        })
                    }
                    
                }
            })
        },
        checkDrugsAuth(row){
            let currDrugsDetails = row.currDrugsDetails
            let msg = ''
            // 高价药权限
            if(currDrugsDetails.highPriceFlag){
                if(this.checkDoctorAuthObj.highPricePerm !== '1'){
                    msg = `药品【${currDrugsDetails.clinicItemName}】为高价药，您不具备高价药的开立权限！`;
                }
            }
            // 没有维护药品权限
            if (this.checkDoctorAuthObj && !this.checkDoctorAuthObj.antiIdentification) {
                msg = `医生没有维护处方和抗生素权限，请先去维护`;
            }
            // 不具有该等级的开药权限
            if(currDrugsDetails.sdAnti&&this.checkDoctorAuthObj.antiIdentification && this.checkDoctorAuthObj.antiIdentification.indexOf(currDrugsDetails.sdAnti) === -1){
                msg = `药品【${currDrugsDetails.clinicItemName}】为【${currDrugsDetails.sdAnti}等级】药品，您不具备使用权限！`;
            }
            // 处方药权限
            if(row.dischargeMedicationIndicator == 1){
                if(currDrugsDetails.sdToxiType){
                    let drugFlag = String(this.checkDoctorAuthObj.orderIndicatorDetail).toUpperCase().indexOf(currDrugsDetails.sdToxiType) === -1
                    if(drugFlag){
                        msg = `您不具备【${this.toxiListObj[currDrugsDetails.sdToxiType].description}】药品的开立权限！`;
                    }
                }
                if(this.checkDoctorAuthObj.orderIndicator ==='0'){
                    msg = `您不具备处方药品的开立权限！`
                }
                
            }
            //中药不提示西药提示
            if(this.isHerBalDrug(row)) msg = '';
            return msg;
        },
        // 查看医生开药权限
        checkDoctorAuth() {
            let ajaxUrl = "/org/emp/property/findReEmpAnti";
            return this.$axios.post(ajaxUrl, {
                    idEmp: this.getUserStorage().idEmp,
                })
                .then((res) => {
                    return this.checkDoctorAuthObj = res.data;
                })
        },
        // 保存模板数据
        async saveInPatientTemplate() {
            this.templateItemListInp = [];
            this.listChargeItem = [];
            this.reimbursement.drugsDetailList = [];
            this.valiDateList = [];
            // 查询诊断分类 适应症，禁忌信息
            await this.findClassClinicByIdClinicItems(this.idClinicItemList);
            this.drugCodeList = [];
            for(let k = 0, l = this.multipleSelection.length;k < l; k++ ){
                let item = JSON.parse(JSON.stringify(this.multipleSelection[k])) 
                if(this.isWestDrug(item)){ // 只有西药查询cdc禁忌药
                    this.drugCodeList.push(item.drugCode);
                }
                item.idOrdersTemplate = this.idOrdersTemplate
                if(item.sdClinicType == this.CONSTANT.DRUG_TYPE){
                    item.specialDrugIndicator = 2;   // 医保多报销 不设置特效药字段 1-符合，0-不符合，2-未设置
                }
                this.templateItemListInp.push(item);

                this.batchUpdateTime(item)
                this.ValidateLeaveHosTime(item) && this.valiDateList.push(this.ValidateLeaveHosTime(item));
                //如果有适应症，且患者是医保患者，提示转自费
                let showDialog = this.includesShowDialog(item);
                if(showDialog){
                    let v = item.prPriceItemVsInsuranceVOList[0];
                    v.clinicItemName = item.currDrugsDetails.clinicItemName;
                    v.idClinicItem = item.currDrugsDetails.idClinicItem;
                    v.idOrdersTemplateItem = item.idOrdersTemplateItem;
                    let arr = this.getDrugsDiagnosisDetail.get(v.idClinicItem) || []; // 存在不适症提示，禁忌提示
                    this.$set(v,'diagnosisArr',arr);
                    this.$set(v, 'self', !this.insuranceIndicator)// 0-自费患者
                    v.isEdit = false; // 不是编辑
                    this.reimbursement.drugsDetailList.push(v)
                }
                this.listChargeItem.push(...item.listChargeItem);
            }
            // 校验出院时间
            if(this.valiDateList.length){
                this.isLoading = false;
                this.valiDateFlag = true;
                return;
            }

            if (this.reimbursement.drugsDetailList.length) {
                this.isLoading = false;
                this.reimbursement.dialogVisible = true;
                return;
            }
            let flag = await this.handlerCdcDrugs(this.drugCodeList);
            if(flag) return;
            this.saveInPatientTemplateReq()
        },
        // cdc禁忌药提示
        async handlerCdcDrugs(data){
            let drugCodeList = data.filter(item =>item)
            drugCodeList = [...new Set(drugCodeList)];
            if(!drugCodeList.length) return false;
            let obj = {
                idVisit: this.urlParams.idVisit,
                idPat: this.urlParams.idPat,
                drugsIdList: drugCodeList
            }
            let cdcResult = await this.getQueryTabooDrug(obj);
            if(cdcResult){
                this.cdcDrugsInfo.result = cdcResult;
                this.cdcDrugsInfo.dialogVisible = true;
                this.isLoading = false;
                return true;
            }else{
                return false;
            }
        },
        cancleCdcMsg(){
            this.saveInPatientTemplateReq()
        },
        includesShowDialog(item){
            let priceItem = item.prPriceItemVsInsuranceVOList;
            // 存在对应诊断分类 适应症，禁忌提示
            if(this.getDrugsDiagnosisDetail.get(item.idClinicItem)){
                return true;
            }
            // 医保适应症提示
            if(priceItem && priceItem.length && (priceItem[0].description || priceItem[0].excessReimburseRatioFlag) &&this.isCityHealth){
                return true;
            }
            return false;
        },
        // 校验出院通知时间
        ValidateLeaveHosTime(row){
            let {dtOrderStart:leaveHosDateTimer,outIdentification} = this.leaveOrdersStartObj;
            let leaveHosDate = leaveHosDateTimer? +new Date(leaveHosDateTimer) : ''
            let start = +new Date(row.dtOrderStart) 
            let obj = {};
            if(leaveHosDate && leaveHosDate<start){
                obj.name = row.sdClinicType == this.CONSTANT.DRUG_TYPE? row.ordNames[0]: this.handlerContent(row);
                obj.message = `医嘱开始时间【${row.dtOrderStart}】已经大于${outIdentification == '2'? '死亡时间':'出院时间'}【${leaveHosDateTimer}】,请调整医嘱`
                return obj;
            }
        },
        // 获取诊断类型
        getDiagnosis(){
            this.reimbursement.diagnosisType = sessionStorage.getItem('diagnosis')? JSON.parse(sessionStorage.getItem('diagnosis')): []
        },
        cancleReimburDialog(){
            this.reimbursement.dialogVisible = false;
        },
        //批量赋值 开始时间
        batchUpdateTime(row) {
            if(this.orderGroupCodeObj[row.orderGroupCode]){
                let firstRow = this.orderGroupCodeObj[row.orderGroupCode][0]
                if(firstRow.dtOrderStart) {
                    this.templateItemListInp.filter(item => item.orderGroupCode == row.orderGroupCode).map( v => v.dtOrderStart = firstRow.dtOrderStart)
                }
            }
        },

        saveInPatientTemplateReq(){
            this.isLoading = true;
            let obj = {
                templateItemList: this.templateItemListInp,
                idPat: this.$route.query.idPat,
                idOrdersTemplate: this.idOrdersTemplate,
                idVisit: this.urlParams.idVisit,
                listChargeItem: this.listChargeItem,
                idWard: this.docPatientParams.idDeptAdmit,
                insuranceIndicator: this.insuranceIndicator, //0-自费 1-医保 2-特
            }
            let url = "doctws/quoteTemplate/saveTemplate";
            // url = window.globalUrl.baseURL11 + url
            this.$axios._post(url, obj).then((res) => {
                this.isLoading = false;
                if (res.success) {
                    this.$message({
                        message: "保存成功",
                        type: "success",
                    });
                    this.cancleDialog()
                    this.SET_DOCGOBACKSTATE(false)
                    this.$nextTick(()=>{
                        this.SET_DOCGOBACKSTATE(true)
                    })
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
                        return res.data;
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
        freqObjChange(val){
            this.idFreqObj = val
        },
        //tooltip格式化
        tooltipsFormatter(str, len) {
            if (str && str.length > len) {
                return str.substr(0, len - 1) + "...";
            } else {
                return str;
            }
        },
        //校验是否是本科室
        isOwnDept(row) {
            row.idDept = row.idDept || this.docPatientParams.idDeptAdmit; //患者所在科室id
            row.deptName =  row.deptName || this.docPatientParams.idDeptAdmitName; //患者所在科室名字
            this.inspectTreeList.map( v =>{
                if(v.code === row.sdSubClinicType) {
                    if(!v.childVOList) return
                    v.childVOList.map( item => {
                        if(item.code === row.sdSubExamType && this.examDeptUseLocalArr.includes(item.idData)) {
                            row.idDept = this.docPatientParams.idDeptAdmit; //患者所在科室id
                            row.deptName = this.docPatientParams.idDeptAdmitName; //患者所在科室名字
                        }
                    })
                }
            })
        },
        //验证字段格式化
        formatMessage(row, column) {
            let res = row.checkMessage;
            return res;
        },
        doseChange(val, row) {
            row.dose = val;
            this.totalAmountChange(row.totalAmount,row, true);
        },
        //编辑数量计算天数
        totalAmountChange(val, row, doseFlag = false) {
            const newIdx = row.currentIndex;
             //中药数量批量修改  整方校验库存
             let someHerbal = [];
            if(this.isHerBalDrug(row)) {
                someHerbal = this.tableData.filter( v => v.orderGroupCode === row.orderGroupCode)
                someHerbal.map( v => v.totalAmount = val);
            }

            if (row.totalAmount) {
                row.totalAmount = val;
            } else if (row.amount) {
                //材料
                row.amount = val;
                return;
            }
            let param = {
                total: val,
                days: row.planDays,
                once: row.dose,
                sellUnitOp: row.sdUnit || row.sdUnitStr,
                idClinicItem: row.idClinicItem,
            };
            this.drugsDetails(newIdx, doseFlag, param);
            // 如果不是药品，不查库存
            if (row.sdClinicType != "1") {
                return;
            }
            let data = [];
            // data.push({
            //     idClinicItem: row.idClinicItem,
            //     // idDept: this.pharmacy,
            //     idDept: row.idDept,
            //     currDrugsDetails: row.currDrugsDetails,
            //     insuranceIndicator: "",
            //     totalAmount: row.totalAmount,
            //     totalAmountUnit: row.sdUnitStr || row.totalAmountUnit,
            //     ...row,
            // });

            if(this.isHerBalDrug(row)) {

                someHerbal.map( v =>{
                    data.push({
                        idClinicItem: v.idClinicItem,
                        // idDept: this.pharmacy,
                        idDept: v.idDept,
                        currDrugsDetails: v.currDrugsDetails,
                        insuranceIndicator: "",
                        totalAmount: v.totalAmount,
                        totalAmountUnit: v.sdUnitStr || v.totalAmountUnit,
                        ...v,
                    });
                })
               
            } else {
                  data.push({
                    idClinicItem: row.idClinicItem,
                    // idDept: this.pharmacy,
                    idDept: row.idDept,
                    currDrugsDetails: row.currDrugsDetails,
                    insuranceIndicator: "",
                    totalAmount: row.totalAmount,
                    totalAmountUnit: row.sdUnitStr || row.totalAmountUnit,
                    ...row,
                });
            }
            this.checkDrugStock(data, newIdx);
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
        // 是否是毒麻精放
        isSpecialDrugs(row){
            return this.specialList.includes(row.sdToxiType)
        },
        showProdict(row){
            return this.isSpecialDrugs(row) || this.isOutHospotal(row)
        },
        isOutHospotal(row){
            return row.dischargeMedicationIndicator === 1
        },
        //计算数量/天数
        async totalChange(isCalculateAmount, index, params) {
            let currRow = this.tableData[index];
            isCalculateAmount ? delete params.total : delete params.days;

            if(!this.isHerBalDrug(currRow)) {
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
                    // if (!currRow.isImmediate) {
                    currRow.planDays = res;
                    // }
                    
                    if (currRow.orderGroupCode) {
                        this.findGroupMate(index, res);
                    }
                }
                    if(this.showProdict(currRow)){
                        if(currRow.totalAmount > 1 && currRow.planDays>this.outpLimitDays){
                            // 超出限制天数
                            this.$set(
                                currRow,
                                "checkMessage",
                                `超过限制天数${this.outpLimitDays}`
                            );
                            this.$refs.tableData.toggleRowSelection(currRow,false);
                            return
                        }
                    }
            }
           

          
            // }
            //库存校验
            let stockParam = [];
            stockParam.push({
                idClinicItem: currRow.idClinicItem,
                // idDept: this.pharmacy,
                idDept: currRow.idDept,
                insuranceIndicator: "",
                totalAmount: currRow.totalAmount,
                currDrugsDetails: currRow.currDrugsDetails,
                totalAmountUnit: currRow.sdUnitStr,
                ...currRow
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
                                //校验未通过的显示提示信息
                                this.$set(currRow, "checkMessage", tipMessage);
                                if(currRow.isChargeTypePriceDesc !== 0) {
                                    this.$refs.tableData.toggleRowSelection(currRow,!tipMessage);
                                }
                                
                            } else {
                                tipMessage = "";
                                //校验未通过的显示提示信息
                                this.$set(currRow, "checkMessage", tipMessage);
                                if(currRow.isChargeTypePriceDesc !== 0) {
                                     this.$refs.tableData.toggleRowSelection(currRow,!tipMessage);
                                }
                               
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
            let params
            if(typeof index === 'object'){
                params = {
                    idClinicItem: index.idClinicItem,
                    // idStorage: this.pharmacy, //药房
                    idStorage: index.idDept, //药房
                    visitType: this.indicatorType, //就诊类型 01-门诊 02-急诊 03-住院 04-体检
                    sellUnit: "", //销售单位
                }
            }else{
                params = {
                    idClinicItem: obj.idClinicItem,
                    // idStorage: this.pharmacy, //药房
                    idStorage: obj.idDept, //药房
                    visitType: this.indicatorType, //就诊类型 01-门诊 02-急诊 03-住院 04-体检
                    sellUnit: "", //销售单位
                };
            }
            let res = await this.$axios.post(
                "dict/clinicDrug/findCsClinicItemDrugById",
                params
            );
            if (res.success) {
                if(typeof index === 'object'){
                    curr = index
                    curr.currDrugsDetails = res.data
                    return
                }
                let curr = this.tableData[index]
                this.currentParamObj[index] = obj;
                //查频次信息
                let freqData = await this.queryFrequency(
                    curr.idFreq
                );
                this.immediatelyId.forEach((it) => {
                    if (it == curr.idFreq) {
                        curr.planDays = eval(
                            freqData.freqCounter
                        );
                        curr.isImmediate = true;
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
                    (obj.unitState = curr.sdUnit == res.data.stockUnit
                            ? false
                            : true);
                this.totalChange(isCalculateAmount, index, obj);
            }
        },
        //医保天数校验
        checkDrugOrder(data) {
            if(this.isInPatient){
                return Promise.resolve({})
            }
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
            if ((!this.isGroup(row.row) && row.columnIndex == "0")||row.row.priceItemName) {
                return "myCell";
            }
            let n = 10;
            if (this.isInPatient) {
                n = 13;
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
            let newIdClinicItem = []; //药品id集合接收变量
            let newSdClinicType = []; //类型集合接收遍历
            let templateItemArr = []; //引用项目集合
            let idOrdersTemplateItemArr = []; //医嘱模板项目id集合
            // let sdClinicTypeNew=[]
            let arr = val.filter(item=>{
                return this.isGroup(item)
            })
            arr.forEach(item=>{
                if (!item.orderGroupCode) {
                    templateItemArr.push(item);
                    idOrdersTemplateItemArr.push(item.idOrdersTemplateItem); //传递给医保校验的数据
                    newIdClinicItem.push(item.idClinicItem); //药品id集合
                    newSdClinicType.push(item.sdClinicType); //类型集合
                } else {
                    //若是成组的，组中的每一项都进行存储（因为同组中只展示一个复选框）
                    this.orderGroupCodeObj[item.orderGroupCode].forEach(item=>{
                        templateItemArr.push(item);
                        idOrdersTemplateItemArr.push(
                            item.idOrdersTemplateItem
                        ); //传递给医保校验的数据
                        newIdClinicItem.push(item.idClinicItem); //药品id集合
                        newSdClinicType.push(item.sdClinicType); //类型集合
                    })
                }
            })

            //检查处理备注
            templateItemArr.map( item => {
                if(item.sdClinicType === this.CONSTANT.INSPECT_TYPE) {
                    item.description = item.description || '-'
                }
            })
          
            this.idClinicItem = JSON.parse(JSON.stringify(newIdClinicItem));
            this.templateType = JSON.parse(JSON.stringify(newSdClinicType));
            this.multipleSelection = this.templateItemList = templateItemArr;
            this.idOrdersTemplateItemList = JSON.parse(
                JSON.stringify(idOrdersTemplateItemArr)
            );
            this.clockHandle(); //控制按钮状态
            if (this.isHistoryPrescript) {
                this.$emit("selection-change", templateItemArr);
                return;
            }
            // this.MedicalCheckData.idOrdersTemplate = this.idOrdersTemplate
        },
        addChargeItems(row, index) {
            this.chargeItemData.chargeItemVisable = true;
            this.chargeItemData.idOrdersTemplate = this.idOrdersTemplate;
            this.chargeItemData.idOrdersTemplateItem = row.idOrdersTemplateItem;
            this.chargeItemData.idOrdersTemplateItems =
                row.idOrdersTemplateItem + index;
        },
        deleteChargeItems(row, index) {
            // this.$confirm(`是否删除该收费项目`, '提示', {
            //     cancelButtonText: '是',
            //     confirmButtonText: '否',
            //     type: 'warning',
            //     showClose: false,
            //     closeOnClickModal: false,
            // }).then(() => {
            //     this.$message({
            //         type: 'info',
            //         message: `已取消删除`
            //     });

            // }).catch(() => {
            //     this.confirmdeleteCharge(row)
            // });
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
            //界面删除后给后台传递数据
            // this.templateItemList.map(item => {
            //   if (item.listChargeItem.length) {
            //     item.listChargeItem.map((i, ind) => {
            //       if (
            //         i.idOrdersTemplateChargeItem == row.idOrdersTemplateChargeItem
            //       ) {
            //         item.listChargeItem.splice(ind, 1);
            //       }
            //     });
            //   }
            // });
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
                    obj.content = obj.priceItemName
                    item.listChargeItem.push(obj);
                }
            });
            //引用时，把界面中新增的收费项目保存给后台
            // this.templateItemList.map(item => {
            //   if (obj.idOrdersTemplateItem == item.idOrdersTemplateItem) {
            //     item.listChargeItem.push(obj);
            //   }
            // });
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
            }
        },
        //获取列表接口
        getChargeList() {
            if(!this.idOrdersTemplate){
                return 
            }
            // this.forceSelfList= []
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
            this.$axios.post(url, obj).then((res) => {
                if (res.success) {
                   let arr = res.data.records;
                    
                    if (!arr.length) return;
                    let drugsIndication = []; // 适应症id集合
                    arr.map((row,i) => {
                        this.$set(row, 'currentIndex', i);
                        this.$set(row, "idFreqTimeList", []);
                        this.$set(row, "relateData", {});
                        this.$set(row, "templateAsyn", false);//同步
                        this.$set(row, "beginDate", this.allStartTime.substr(0,10) || '');//当前开始时间
                        this.$set(row, "beginTime", this.allStartTime.substr(11,5)|| '' );//当前开始时分
                        this.$set(row, "dtOrderStart", this.allStartTime);// 存在出院时间时 默认出院时间
                        if(this.isHerBalDrug(row))  row.sdClinicTypeStr = '中药'
                        if(!row.idDept){
                             // 如果没有带出科室，就取当前患者的所在科室
                            let receivePatientParams = this.docPatientParams
                            row.idDept = receivePatientParams.idDeptAdmit
                            row.deptName = receivePatientParams.idDeptAdmitName
                        }
                        this.changeFreq(row.idFreq, row);
                        if (row.idOrdersTemplateItem) {
                            //处理key值
                            row.idOrdersTemplateItems = JSON.parse(
                                JSON.stringify(row.idOrdersTemplateItem)
                            );
                        }
                        //解决key值的重复问题
                        if (row.listChargeItem && row.listChargeItem.length) {
                            row.listChargeItem.map((item, index) => {
                                if (
                                    row.idOrdersTemplateItem ==
                                    item.idOrdersTemplateItem
                                ) {
                                    item.idOrdersTemplateItems =
                                        item.idOrdersTemplateChargeItem;
                                }
                            });
                        }
                        //药品医嘱内容样式处理                
                        if(row.sdClinicType == this.CONSTANT.DRUG_TYPE) {   
                            this.$set(row, "self", !this.isCityHealth);                       
                            row.ordNames = row.content.split(' ');
                            this.drugsDetails(row)
                            if(!this.isHerBalDrug(row)) {
                                drugsIndication.push(row.idClinicItem);
                            }
                        }

                         //检查本科室处理                
                        if(row.sdClinicType == this.CONSTANT.INSPECT_TYPE) {                          
                            this.isOwnDept(row);
                        }

                    })
                    this.tableData = arr
                    this.indication(drugsIndication)
                    this.idClinicItemList = drugsIndication; // 西药id集合
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
            }).then(res=>{
                this.isCheckChargeTypePrice();  //校验医嘱费别价格
                this.gcpFlagFn();
            })
        },
        //校验医嘱费别价格
        isCheckChargeTypePrice() {
            let priceArr = {};
            let committable = this.copyObject(this.tableData);
            if(!committable.length){
                return
            }
            committable.map( (row, i) => {
                row.isChargeTypePriceDesc = 1;
                let idClinicItem = row.idClinicItem;
                priceArr[idClinicItem] = this.chargeTypeCode
            })
            this.$axios._post('/dict/clinicItem/listPricesByIdClinicItems', priceArr).then((res) => {
                if (res.success) {
                    let resData = res.data;
                    if(Object.keys(resData).length) {
                        for( let k in resData ){
                            this.tableData.map( row => {
                                if(row.idClinicItem === k) {
                                    //如果每一条医嘱的价格 为0 默认不选中  价格为空或null默认选中
                                    row.isChargeTypePriceDesc = resData[k] === null ||  resData[k] === '' ? 1 :  Number(resData[k]);
                                    // this.$refs.tableData.toggleRowSelection(v,!!Number(resData[k]));
                                }
                            })
                        }
                    }
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
            }).then(res=>{
                this.isCheckAllOrders();
                this.listClinicItemForEnable();// 查询诊疗项目是否失效
            })
        },
        
        //库存校验 、医保校验
        isCheckAllOrders() {
            let stockParam = []; //库存校验参数
            let idOrdersTemplateItemArr = [];
            let toSelfOrderArr = [];
            this.tableData.map((row, i) => {
                // 默认全选
                this.$nextTick(() => {
                    if (this.$refs.tableData) {
                        if(this.tableData[i].isChargeTypePriceDesc !== 0) {
                             this.$refs.tableData.toggleRowSelection(
                                this.tableData[i],
                                true
                            );
                        }
                       
                    }
                });
                if (this.isHistoryPrescript) {
                    // 历史处方都是药品,适配原来的数据
                    row.sdClinicType = "1";
                    row.sdPriceItemStr = "";
                    row.idOrdersTemplateItem = row.idOrders;
                    row.sdClinicTypeStr = row.presType;
                }
                if (!row.sdUnitStr) {
                    row.sdUnitStr = row.totalAmountUnit;
                }
                if (row.sdClinicType == "1") {
                    //药品库存校验参数
                    stockParam.push({
                        idClinicItem: row.idClinicItem,
                        // idDept: this.pharmacy,
                        idDept: row.idDept,
                        currDrugsDetails: row.currDrugsDetails,
                        insuranceIndicator: "",
                        totalAmount: row.totalAmount || row.amount,
                        totalAmountUnit: row.sdUnitStr,
                        ...row
                    });
                }else{
                    // 检验，没有标本的不让勾选
                    if(row.sdClinicType == this.CONSTANT.TEST_TYPE){
                        this.checkTestOrder(row)
                    }
                }
                
                // 检查检验一个申请单多个项目展示分组
                if (i == this.tableData.length - 1) return;
                if (
                    this.tableData[i].sdClinicType != "1" &&
                    this.tableData[i].idForm != null &&
                    this.tableData[i].idForm ==
                        this.tableData[i + 1].idForm
                ) {
                    this.tableData[i + 1].sdClinicTypeStr = "";
                }
                if (row.sdClinicType == "1") {
                    idOrdersTemplateItemArr.push({
                        id: row.idOrdersTemplateItem,
                        planDays: row.planDays,
                        totalAmount: row.totalAmount || row.amount,
                        dose: row.dose,
                    });
                    // row.deptName = this.storageName;
                    //丙类转自费
                    if (row.sdConstrainedLevel == "3")
                        toSelfOrderArr.push(row.idOrdersTemplateItem);
                }

            });
            //库存校验
            if (stockParam && stockParam.length){
                this.checkDrugStock(stockParam);
            }
            // 如果是住院，暂时不调用校验规则
            if (this.isInPatient) {
                return;
            }
        },
        // 查询诊疗项目enable 可用的
        listClinicItemForEnable(){
            if(!this.getIdClinicObjArr.length) return;
            this.$axios._post('/dict/clinicItem/listClinicItemForEnable',this.getIdClinicObjArr).then(res =>{
                if(res.success){
                    this.clinicItemEnabledList = res.data;
                }else{
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
            }).then(res=>{
                this.checkEnabledClinic();
            })
        },
        // 诊疗项目失效后不可引用
        checkEnabledClinic(){
            this.tableData.map(row =>{
                if(row.idClinicItem && !this.getEnabledClinic.includes(row.idClinicItem)){
                    this.checkGroupMessage(row, '已失效！');
                }
            })
        },
        checkTestOrder(row){
            if(!row.idSpecimen){
                this.$nextTick(()=>{
                    let msg = '项目没有维护标本'
                    this.$set(row, "checkMessage", msg);
                    this.$nextTick(()=>{
                        this.$refs.tableData.toggleRowSelection(row,false);
                    })
                })
            }
        },
        batchCheckStock(data){
            data.forEach((item,index)=>{
                
                this.queryTotalAmount(item)
            })

        },
        //计算中药库存
        calcHerbalCount(row) {
            let tol = row.currDrugsDetails.stockFUnitCount;

            let rowtol = row.totalAmount * row.dose
                
            return Number(rowtol) > Number(tol)
        },

         // 住院校验库存
        queryTotalAmount(row){
            let flag = false
            if(!row.currDrugsDetails){
                return false
            }
            if(row.repeatIndicator === 0){ // 临时
               
                if(this.isHerBalDrug(row)) {
                    flag = this.calcHerbalCount(row)
                } else {
                    if(row.totalAmount > row.currDrugsDetails.stockFUnitCount){
                        //校验未通过的显示提示信息
                        flag = true;
                    }
                }
            }else{ // 长期
                if(row.dose && row.currDrugsDetails.factorDoseDrugForm){
                    let  totalCounts = Math.ceil(row.dose/row.currDrugsDetails.factorDoseDrugForm) ;
                    if(totalCounts > row.currDrugsDetails.stockFUnitCount){
                        flag = true
                    }
                }
            }
            // 长期校验库存
            let tipMessage = ''
            if(flag){
                tipMessage = '暂无库存'
            }else{
                // 权限校验
                tipMessage = this.checkDrugsAuth(row)
            }
            
            this.checkGroupMessage(row, tipMessage);
            return flag
        },
        // 整合校验
        checkGroupMessage(row,tipMessage){
            let current = this.tableData.filter(item=>{
                return item.idOrdersTemplateItem === row.idOrdersTemplateItem
            })[0]
            this.$set(current, "checkMessage", tipMessage);
            if(this.orderGroupCodeObj[row.orderGroupCode]){
                let curr = this.orderGroupCodeObj[row.orderGroupCode].filter(item=>{
                    return item.idOrdersTemplateItem === row.idOrdersTemplateItem
                })[0]
                this.$set(curr, "checkMessage", tipMessage);
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
            }else{
                setTimeout(()=>{
                    this.$refs.tableData.toggleRowSelection(current,!tipMessage);
                },100)
            }
        },
        //库存校验
        checkDrugStock(data, index = null) {
            if(this.isInPatient){
                this.batchCheckStock(data)
                return Promise.resolve(false)
            }
        },
        //关联诊断个数
        ciOrdersTemplateDiagLength(num) {
            this.ciOrdersTempDiagLength = num || 0;
        },
    },
    watch:{
        tableData(val){
            if(val.length){
                this.orderGroupCodeObj = this.orderGroupCodeDataHandler(val)
            }
        }
    }
};
</script>
<style lang='scss' src='./outpTmplBarRightCont2.scss'>
</style>