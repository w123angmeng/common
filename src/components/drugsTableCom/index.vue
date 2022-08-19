<template>
    <div class="drugsTableCom_wrap">
        <div class="head_Contents" v-if="isFromCopy || isFromDoctwsTmpl">
            <!-- 关联诊断 -->
            <relateDiagnoseCom
                v-if="isFromDoctwsTmpl"
                :from="currentMsg"
                :editFlag="false"
            ></relateDiagnoseCom>
            <div class="wraningTips" v-if="isFromCopy">
                <span class="wraningBd">!</span>
                <span>选中医嘱后，可进行时间同步</span>
            </div>
            <div class="startTimeRange">
                <el-date-picker 
                    class="beginDate"
                    v-model="headInfo.beginDate" 
                    type="date"
                    format="yyyy-MM-dd" 
                    value-format="yyyy-MM-dd"
                    :clearable="false"
                    placeholder="请选择开始时间">
                </el-date-picker>
                <el-time-picker
                    v-model="headInfo.beginTime"
                    class="beginTime"
                    format="HH:mm"
                    :clearable="false" 
                    value-format="HH:mm"
                    placeholder="请选择">
                </el-time-picker>
                <bed-comp @change="applyAllTime" v-model="templateAsyn"  :disabled="!allStartTime" from="templateAsyn" class="templateAsyn"></bed-comp>
            </div>
        </div>
        <div class="table_wrap">
            <el-table
                height="100%"
                class="table-fixed"
                :cell-style="cellStyle"
                :cell-class-name="cellcb"
                :header-cell-style="tableTitleStyle"
                ref="tableData"
                stripe
                border
                :data="tableData"
                default-expand-all
                :row-class-name="showBChildrenBg"
                @selection-change="handleSelectionChange"
                :row-key="isShowTreeChildren"
                :tree-props="{
                    children: 'listChargeItem',
                    hasChildren: 'hasChildren',
                }"
                style="width: 100%">
                <el-table-column :resizable="false"  type="selection" width="35" :fixed="!isFromDoctwsTmpl?'left':false" :selectable="selectableHandler"></el-table-column>
                <el-table-column :resizable="false"  v-if="fromColumn('repeatIndicator')" :fixed="!isFromDoctwsTmpl?'left':false" label="长临" :width="isFromDoctwsTmpl? '55':'80'">
                    <template slot-scope="scope">
                        <el-select 
                            v-model="scope.row.repeatIndicator" 
                            placeholder="请选择" 
                            class="dInput"
                            :disabled="disRepeatIndicator(scope.row)"
                            v-if="isGroupAndForm(scope.row) && isFromCopy"
                            @change="changlinChange(scope.row, scope.$index)">
                            <el-option 
                                v-for="item in repeatIndicatorOptions" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                       <span v-else-if="isGroupAndForm(scope.row)">{{ scope.row.repeatIndicator | repeatIndicatorFilter }}</span> 
                    </template>
                </el-table-column>
                <el-table-column  v-if="fromColumn('sdClinicType')" :fixed="!isFromDoctwsTmpl?'left':false"  :resizable="false"  prop="sdClinicTypeStr" label="类型" width="55">
                    <template slot-scope="scope" >
                        <span v-if="isGroupAndForm(scope.row)">{{ scope.row | sdClinicTypeFilter }}</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" :fixed="!isFromDoctwsTmpl?'left':false"  prop="clinicItemName" label="医嘱内容"  min-width="347px">
                    <template slot-scope="scope">
                        <span>
                            <!-- 药品医嘱内容展示-->
                            <span class="ordersNameDetails"  v-if="scope.row.sdClinicType == CONSTANT.DRUG_TYPE">
                                <template v-for="(item, index) in 2">
                                    <span class="orderItemsCopy" :key="index">
                                         <!-- 药品成组展示图标 -->
                                        <span v-show="index==0 && scope.row.orderGroupCode">
                                            <!-- 图标上 -->
                                            <span v-if="isFirst(scope.row)" class="groupFirst"></span>   
                                            <!-- 图标下     -->
                                            <span v-if="isLast(scope.row)" class="groupLast"></span>
                                            <!-- 图标中 -->
                                            <span v-if="isMiddle(scope.row)" class="groupMiddleItem"></span>
                                        </span>
                                        <template v-if="isGroupAndForm(scope.row) || index <3">
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
                                            <!-- <span v-if="scope.row.insuranceIndicator == 2 && index==1" class="special">特</span> -->
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
                                <template v-for="(item, index) in 1">
                                    <span class="orderItemsCopy orderItemsCopy1" :key="index">
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
                        </span>   
                    </template>    
                </el-table-column>   
                 <el-table-column :resizable="false"  prop="totalAmount" label="数量" width="65">
                    <template slot-scope="scope">
                        <!-- !isLongTerm(scope.row)不是长期； 不能使用isInterim(scope.row)判断，附加项目没有长临字段也要展示数量 -->
                        <div>
                            <!-- 数量框显示  长期 or 临时 -->
                            <el-input-number  
                                v-if="isShowTotalAmount(scope.row)"
                                :controls="false" 
                                :disabled="isOneDay(scope.row)"
                                v-model="scope.row.totalAmount" 
                                @change="val=>totalAmountChange(val, scope.$index, scope.row)">
                            </el-input-number>
                            <!-- 附加项目可编辑数量 -->
                            <el-input-number  
                                v-if="scope.row.amount && scope.row.priceItemName" 
                                :controls="false" 
                                :disabled="isOneDay(scope.row)"
                                v-model="scope.row.amount" 
                                @change="val=>totalAmountChange(val, scope.$index, scope.row)">
                            </el-input-number>
                            <!-- 临时 只显示数量 不能编辑 -->
                            <div v-show="!isLongTerm(scope.row) && !isShowTotalAmount(scope.row) && !isHerBalDrug(scope.row) && !scope.row.priceItemName">
                                <span v-if="!isUnShowAmountTypes(scope.row)">{{ scope.row.totalAmount || 1}}</span>
                            </div>    
                        </div>
                    </template>
                </el-table-column>  
                 <!-- 总量单位 -->
                 <el-table-column :resizable="false" prop="totalAmountUnit" label="单位" align="left" :width="isFromDoctwsTmpl? '60':'80'" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <template v-if="isFromCopy && isWestDrug(scope.row) && isInterim(scope.row)">
                            <el-select
                                v-model="scope.row.totalAmountUnit"
                                placeholder="单位"
                                class="after"
                                @change="totalAmountUnitChange(scope.row,scope.$index)">
                                <el-option
                                    v-for="item in totalAmountUnitList(scope.row)"
                                    :key="item"
                                    :label="item"
                                    :value="item"
                                >
                                </el-option>
                            </el-select>
                        </template>  
                        <span class="doseSpan" v-else>
                            <span v-if="isShowInputNumber(scope.row, 'totalAmount')" >{{ scope.row.sdUnitStr || '-'}}</span>
                        </span>  
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" prop="dose" label="单次用量" align="left" width="70" v-if="fromColumn('dose')">
                    <template slot-scope="scope">
                        <div class="flexRow" v-if="isDrugType(scope.row)">
                            <!-- 大单位 -->
                            <el-input-number
                                v-if="currDoseUnitsObj(scope.row).calc"
                                v-model="scope.row.calcDose"
                                @change="calcDoseChange(scope.row, scope.$index)"
                                placeholder="用量"
                                :min="1"
                                :precision="0"
                                :max="maxDoseRow(scope.row)"
                                :controls="false"
                                controls-position="right"
                                class="inputNum"
                            >
                            </el-input-number>
                            <!-- 小单位 -->
                            <el-input-number
                                v-else
                                :controls="false"
                                :max="maxDoseRow(scope.row)"
                                :min="scope.row.dose ? 0.001 : 0"
                                controls-position="right"
                                v-model="scope.row.dose"
                                @change="(val) => doseChange(val, scope.$index, scope.row)"
                            ></el-input-number>
                        </div>
                    </template>
                </el-table-column>
                <!-- 单次用量单位 -->
                 <el-table-column :resizable="false" prop="doseUnits" label="单位" align="left" :width="isFromDoctwsTmpl? '60':'70'"  v-if="fromColumn('doseUnits')">
                    <template slot-scope="scope">
                        <div class="" v-show="isDrugType(scope.row)">
                            <template v-if="isWestDrug(scope.row) && isFromCopy">
                                <el-select
                                    v-model="scope.row.doseUnits"
                                    @change="doseUnitsChange(scope.row)"
                                    placeholder="单位"
                                    ref="company">
                                    <el-option
                                        v-for="item in doseUnitsList(scope.row)"
                                        :key="item.dataCode"
                                        :label="item.dataName"
                                        :value="item.dataCode">
                                    </el-option>
                                </el-select>
                            </template>
                            <span class="doseSpan" v-else>
                                {{ scope.row | unitFilter }}
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" v-if="fromColumn('routeName')" prop="routeName" label="途径" width="90" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span v-if="isGroupAndForm(scope.row)"> {{ scope.row | routeNameFilter }}</span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false"  label="频次" :width="isFromDoctwsTmpl? '70':'90'" show-overflow-tooltip v-if="fromColumn('idFreq')">
                    <template slot-scope="scope">
                        <div v-if="isGroupAndForm(scope.row)">
                            <span v-if="isShowFreq(scope.row)">
                                 <el-select 
                                    v-model="scope.row.idFreq" 
                                    placeholder="频次"
                                    class="dInput"
                                    @change="val=>changeFreq( scope.row)">
                                    <el-option 
                                        v-for="item in scope.row.frequencySomeData" 
                                        :key="item.idFreq"
                                        :label="item.description" 
                                        :value="item.idFreq">
                                    </el-option>
                                </el-select>
                            </span>
                            <span v-else> {{ scope.row | idFreqFilter }} </span>
                        </div>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column :resizable="false" 
                    v-if="fromColumn('groupCode')"
                    prop="groupCode"
                    label="执行时段"
                    :width="isFromDoctwsTmpl? '80':'120'"
                    align="center"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div v-if="isGroupAndForm(scope.row)">
                            <el-select
                                placeholder="执行时段"
                                v-model="scope.row.groupCode"
                                @change="val=>changeFreq( scope.row, scope.$index, val)"
                                v-show="scope.row.repeatIndicator === 1">
                                <!-- 附加收费项目repeatIndicator为undefined，不能用 !isInterim(scope.row)，使用 scope.row.repeatIndicator === 1-->
                                <el-option
                                    v-for="item in scope.row.idFreqTimeList"
                                    :key="item.groupCode"
                                    :label="item.executeTimeStr"
                                    :value="item.groupCode">
                                </el-option>
                            </el-select>
                        </div>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="fromColumn('dtOrderStart')" :resizable="false" prop="" label="开始时间" width="160">
                    <template slot-scope="scope">
                        <span v-if="showStartTime(scope.row)">
                             <el-date-picker 
                                class="beginDate"
                                v-model="scope.row.beginDate" 
                                type="date"
                                format="yyyy-MM-dd" 
                                value-format="yyyy-MM-dd"
                                :clearable="false"
                                @change="startTimeChange(scope.row, scope.$index)"
                                placeholder="开始时间">
                            </el-date-picker>
                            <el-time-picker
                                v-model="scope.row.beginTime"
                                class="beginTime"
                                format="HH:mm"
                                :clearable="false" 
                                value-format="HH:mm"
                                @change="startTimeChange(scope.row, scope.$index)"
                                placeholder="请选择">
                            </el-time-picker>
                        </span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                 <el-table-column :resizable="false" width="35" v-if="fromColumn('dtOrderStartIcon')">
                    <template slot-scope="scope">
                         <bed-comp v-if="showStartTime(scope.row)" @change="val=>applyTime(val,scope.row)" v-model="scope.row.templateAsyn" :disabled="!allStartTime" from="templateAsyn"></bed-comp>
                    </template>
                </el-table-column>
                <el-table-column v-if="fromColumn('remark') && !isFromDoctwsTmpl" :resizable="false" prop="" label="备注" width="120">
                    <template slot-scope="scope">
                        <!-- @change="changeRemark(scope.row)" -->
                        <el-input v-if="showRemark(scope.row)" v-model="scope.row.remark" ></el-input>
                    </template>    
                </el-table-column>    
                <el-table-column 
                    :resizable="false" 
                    v-if="fromColumn('planDays')"
                    prop="planDays"
                    label="天数"
                    width="50"
                    align="center"
                    show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span v-if="isGroupAndForm(scope.row) && isInterim(scope.row)">
                            {{ scope.row.planDays}}
                        </span>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column  v-if="fromColumn('idDept')" :resizable="false" prop="deptName" label="执行科室" width="100" show-overflow-tooltip>
                </el-table-column>
                <el-table-column :resizable="false"  prop="checkMessage" property="checkMessage" label="验证" width="100"  show-overflow-tooltip :formatter="formatMessage">
                </el-table-column>
                <el-table-column v-if="fromColumn('operation')" :resizable="false" :fixed="!isFromDoctwsTmpl?'right': false" label="操作" width="55">
                    <template slot-scope="scope">
                        <div>
                            <span v-if="isFromDoctwsTmpl">
                                <el-button v-if="scope.row.priceItemName" @click="confirmdeleteCharge(scope.row, scope.$index)" type="text">删除</el-button>
                                <el-button v-else :disabled="scope.row.sdClinicType == '1' || scope.row.isChargeTypePriceDesc === 0"
                                    @click="addChargeItems(scope.row, scope.$index)"
                                    type="text">新增</el-button>
                            </span>
                            <el-button type="text" v-else @click="handleDeleteCopy(scope.row, scope.$index)">删除</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 医保校验 -->
         <CheckTpml
            :checkData="checkData"
            @changePassFlag="changePassFlag"
            @checkHistory="drugMedicalValid"
            @noImmediately="noImmediately"
            ref="CheckTpml"
        ></CheckTpml>

         <!--  医保多报销弹窗 -->
        <Reimbursement v-if="reimbursement.dialogVisible" :reimbursement="reimbursement" @cancle="cancleReimburDialog" @confirmClinic="forceSelfHandler"></Reimbursement>
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

        <!-- 添加收费项目组件 -->
        <AddChargeItem
            v-if="chargeItemData.chargeItemVisable"
            @sendChargeObj="sendChargeObj"
            :inspectData="inspectData"
            :chargeItemData="chargeItemData"
        ></AddChargeItem>
    </div>
</template>

<script>
import Reimbursement from '@/components/page/Common_WEB/reimbursement/medicalInsReimbursement.vue'; // 医保多报销比例弹层
import bedComp from '@/components/page/Doctws_WEB/syntheticalView/comp/doctorOrder/inpDocDrugs/checkBoxBtn.vue'
import CheckTpml from "@/components/page/Common_WEB/outPatientcomp/checkTpml/checkTpml.vue"; // 医保校验弹窗
import cdcDrugsMsg from '@/components/page/Common_WEB/cdcDrugsMsg'; // cdc禁忌药

import { mapMutations, mapGetters } from "vuex";
import { mixinCalcDrug } from './mixinsCom/mixinCalcDrug.js';            //药品计算
import { mixinShareOrders } from './mixinsCom/mixinShareOrders.js';  //门诊共享医嘱校验
import { mixinConfigs } from './mixinsCom/mixinConfigs.js';              //参数配置
import { mixinCheckMessage } from './mixinsCom/mixinCheckMessage.js';    //校验提示
import { mixinReimbur } from './mixinsCom/mixinReimbur.js';              //多报销比例处理
import { mixinStartTime } from './mixinsCom/mixinStartTime.js';          //时间处理
import { mixinFreqDrug } from './mixinsCom/mixinFreqDrug.js';            //频次处理业务
import { mixinFromAgent } from './mixinFromAgent.js';                    //造影剂特殊处理业务
import mixinsGcpAtm from "@/components/page/Common_WEB/mixins/mixinsGcpAtm.js";  //gcp处理
import { mixinCopyOrders } from './mixinCopyOrders.js';     //复制医嘱处理
import { mixinDoctwsTmpl } from './mixinDoctwsTmpl.js';     // 模版引用处理

let that;
export default {
    props: {
        from: {
            type: Object,
            default: () => {}
        },
        inspectData: {
            type: Object,
            default: () => {}
        },
    },
    components: {
        Reimbursement,
        bedComp,
        CheckTpml,
        cdcDrugsMsg
    },
    mixins:[ mixinConfigs, mixinCalcDrug,mixinShareOrders, mixinFreqDrug, mixinCheckMessage, mixinReimbur, mixinStartTime, mixinFromAgent, mixinsGcpAtm,mixinCopyOrders,mixinDoctwsTmpl],
    data () {
        return {
            routeNameObj: {}, //用途列表对象
            tableData: [],    //列表数据
            multipleSelection: [],   //选中的数据
            finalyBtnStatus: true,

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
            repeatIndicatorOptions:[
                { value: 0, label: '临时'},
                { value: 1, label: '长期'},
            ],
            valiDateFlag: false, // 校验出院时间不通过提示
            valiDateList: [], // 不合格数据
            prPriceItemList:[], // 查询所有类型医嘱单位list
            otherClinicIds: []
        }
    },
    computed: {
        ...mapGetters(["docPatientParams", 'routerPath']),
        isAtmeng(){
            return this.$limits.isFun(this)
        },
        userParmas() {
            return this.getUserStorage();
        },
        idEmp() {
            return this.userParmas.idEmp;
        },
        sdVisitType() {
            return this.from.sdVisitType;
        },
        //门诊患者信息
        outpPatParmas() {
            return JSON.parse(sessionStorage.getItem("receivePatientParams"));
        },
        //门诊来源
        isFromOutp() {
            return this.from.source === 'outp'
        },
        //功能来源 -- 造影剂
        isFromAgent() {
            return this.from.funSource === 'agent'
        },
        //住院复制医嘱来源
        isFromCopy() {
            return this.from.funSource === 'copy'
        },
        //住院暂存医嘱来源
        isFromTemporaryStorage() {
            return this.from.ModelSource === 'TemporaryStorage'
        },
        // 住院模版引用
        isFromDoctwsTmpl() {
            return this.from.ModelSource === 'doctwsTmpl'
        },
        //患者来源
        sourcePatInfo() {
            if(this.isFromOutp) return this.outpPatParmas
            return this.docPatientParams;
        },
        //费别
        chargeTypeCode() {
            let chargeTypeCode = this.sourcePatInfo.chargeTypeCode;
            // 阿特蒙异地医保处理  如果是异地医保 默认走医保流程
            chargeTypeCode = this.isAtmeng && chargeTypeCode == this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE_ATM ? this.CONSTANT.OUTPEXCESS_CHARGETYPECODE : chargeTypeCode;
            // 博仁异地医保处理  如果是异地医保 默认走医保流程
            chargeTypeCode = !this.isAtmeng && chargeTypeCode == this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE ? this.CONSTANT.OUTPEXCESS_CHARGETYPECODE : chargeTypeCode;
            return chargeTypeCode
        },
        //医保身份
        isInsurePat(){
            if(this.isFromOutp) {
                return this.chargeTypeCode === this.CONSTANT.OUTPEXCESS_CHARGETYPECODE;
            } 
            return this.docPatientParams.chargeTypeCode  === "02" || this.docPatientParams.chargeTypeCode  === "2" || this.docPatientParams.chargeTypeCode  === "3"
        },
        shortFreqObj() {
            let Obj = {
                "SOS": this.CONSTANT.FREQUENCY_SOS,
                "ONCE": this.CONSTANT.FREQUENCY_ONCE,
                "ST": this.CONSTANT.FREQUENCY_NOW,
                "PRN": this.CONSTANT.FREQUENCY_PRN,
            };
            return Obj
        },
        //项目主键id集合
        idClinicItemList() {
            return this.tableData.map(v => v.idClinicItem).filter(item => item);
        },
        //西药 项目主键id
        westDrugIdClinicItemList() {
            let arr = this.tableData.filter( v => this.isWestDrug(v)).map(item => item.idClinicItem);
            return [...new Set(arr)]
        },
        //药品 项目主键id
        allDrugIdClinicItemList() {
            let arr = this.tableData.filter( v => this.isDrugType(v))
            return arr
        },
        getPrPriceItemLists(){
            let map = new Map();
            this.prPriceItemList.map(item =>{
                map.set(item.idClinicItem, item.prPriceItemVsInsuranceVOList)
            })
            return map
        },
        isGcpPat() {
            if(this.isFromOutp) return false
            return this.from.isGcpPat || false;
        },
        urlParams() {
            return this.$route.query;
        },
        isShowTreeChildren(){
            // 住院模版引用使用tree结构，复制暂存使用原始结构（统一使用tree影响复制删除操作）
            return this.isFromDoctwsTmpl? 'idOrdersTemplateItems':''
        }
    },
    filters: {
        repeatIndicatorFilter(val) {
            let map = new Map().set(0, "临时").set(1, "长期");
            return map.get(val);
        }, 
        sdClinicTypeFilter(row) {
            let str = row.sdClinicTypeDesc || row.sdPriceItemStr || row.sdClinicTypeStr || row.presType;
            return str;
        },  
        unitFilter(row) {
            return row.doseUnitsStr || row.doseUnits;
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
            let curFreq = that.idFreqObj[row.idFreq];
            
            if (!curFreq) {
                return "";
            }
            return curFreq.description;
        },
    },
    async created() {
        this.finalyBtnStatus = true;
        that = this;
        await this.getBatchListForDefaultValue();
        this.init();
    },
    methods: {
        async init() {
            //暂存列表没数据 不获取接口
            if(!this.from.storageNumStatus && this.isFromTemporaryStorage) {
                this.getCurrentServerTime();   //获取系统时间  ---- 造影剂不获取时间
                return
            }

            //复制医嘱
            if(this.isFromCopy || this.isFromDoctwsTmpl) {
                await this.getCurrentServerTime();   //获取系统时间  ---- 造影剂不获取时间
            }
            await this.listReStorageSelect();      //查询药房
            await this.findDrugsFrep();    //获取所有频次
            await this.drugsFreq();        //获取所有频次信息
            this.initUsageOptions();       //获取用法信息
            if(!this.isFromOutp) {
                this.checkDoctorAuth();        //查看医生开药权限
            }
            //来源门诊
            if(this.isFromOutp) {
                this.getOutpDiagnosis();   //门诊诊断类型 （多报销比例）
            }
            this.initData();
        },
        //初始列表
        async initData() {
            let resData;
            //来源造影剂
            if(this.isFromAgent) resData = this.copyObject(this.from.tableList)
            //来源复制医嘱
            if(this.isFromCopy) resData = await this.getCopyListAsync();
            // 模版引用-住院
            if(this.isFromDoctwsTmpl) resData = await this.getTmplListAsync();

         
            if(!resData) return

            resData = this.initResData(resData);
            this.tableData = this.copyObject(resData);
            this.listByIdClinicItems();
            //只有有药品的时候才调 获取药品信息的接口
            if(this.allDrugIdClinicItemList.length) {
                await this.getAllDrugsDetails();
            }
            
            if(!this.isFromAgent) {
                await this.remoteClinicTypeTree();    //获取检查类型、部位的树形数据
            }
           
            await this.getCheckChargeTypePrice();  //校验医嘱费别价格
            await this.getToxiList();
            this.tableData.forEach((row, index) => {
                 // 医嘱费别价格 不通过 禁止勾选
                this.$nextTick(() => {
                    if (this.$refs.tableData) {
                        if(this.tableData[index].isChargeTypePriceDesc !== 0) {
                            this.$refs.tableData.toggleRowSelection( this.tableData[index], true); // 除费别价格不通过，其他类型医嘱默认true
                        }
                    }
                });

                if(this.isHerBalDrug(row)) {
                    row.planDays = null;
                    this.applyGroupKeys(row, ['planDays']);
                }
                //处理无科室情况
                if(!row.idDept) this.handleNoIdDept(row, index);   
                //检查                
                if(row.sdClinicType == this.CONSTANT.INSPECT_TYPE) {
                    this.isOwnDept(row);   //检查本科室处理 
                    this.handlerDescription(row);  //检查备注 、查体、主诉处理
                }
                //解决重复keys
                this.handleRepeatKeys(row, index); 
                //处理频次 执行时段
                this.changeFreq(row, index, undefined, 'isFirst');        
                //校验库存和医保天数     -- （中药 和 西药 ）           
                if(this.isDrugType(row)) this.isCheckAllOrders(index, row); 
                // 检验，没有标本的不让勾选
                // if(row.sdClinicType == this.CONSTANT.TEST_TYPE)  this.checkTestMessage(row);
                //查单个药品信息 走这个逻辑
                // if(!this.isDrugType(row))  this.frequencySomeData(index, row);
                //查所有药品信息  走这个逻辑
                this.frequencySomeData(index, row);
            })

            //适应症信息
            this.drugIndication(this.westDrugIdClinicItemList); 

            //gcp 医嘱  造影剂gcp 标记
            if(this.isFromAgent || this.isFromDoctwsTmpl) {
                let gcpParmas = {
                    gcpOrders: this.tableData, 
                    idList: this.idClinicItemList,
                    sdVisitType: this.sdVisitType,
                }
                await this.commitSomeGcpOrders(gcpParmas);
            }

            // 校验诊疗项目是否失效  医嘱模版引用
            if(this.isFromCopy || this.isFromDoctwsTmpl){
                await this.listClinicItemForEnable();
            }

            this.finalyBtnStatus = false;
            this.$root.Bus.$emit('isToggleDisabled', false);
            console.log("列表数据----",this.tableData);
        },
        initResData(resData) {
            resData.map( row => {
                this.$set(row, "idFreqTimeList", []);     //执行时段列表
                this.$set(row, "currDrugsDetails", {});   //药品信息
                this.$set(row, "curFreqObj", {});         //频次信息
                this.$set(row, "ordNames", []);           //医保天数提示信息
                this.$set(row, "currentPassTypeObj", {}); //医保天数(门诊共享医嘱)提示信息
                this.$set(row, "currentGroupCodeObj", {});//当前条执行时段信息
                //造影剂不获取时间
                if(!this.isFromAgent) {
                    this.$set(row, "beginDate", this.headInfo.beginDate);//当前开始时间
                    this.$set(row, "beginTime", this.headInfo.beginTime);//当前开始时分
                    this.$set(row, "dtOrderStart", `${this.headInfo.beginDate} ${this.headInfo.beginTime}`);// 存在出院时间时 默认出院时间
                }
                if(this.isDrugType(row)){
                    this.$set(row, "self", !this.isInsurePat);  //药品自费标识 self false 医保  true 自费
                }
                if(this.isWestDrug(row)) {
                     //西药药房 -- 造影剂
                    if(this.isFromAgent) {
                        row.idDept = this.idStorage;
                        row.pharmacy = this.idStorage;
                    }
                }
                
                if(this.isHerBalDrug(row))  row.sdClinicTypeStr = '中药'
                if (!row.sdUnit) row.sdUnit = row.totalAmountUnit;   //门诊销售单位
                if (!row.sdUnitStr) row.sdUnitStr = row.totalAmountUnit;  //总量显示单位
                if (!row.clinicItemName) row.clinicItemName = row.clinicItemNameSon;   //项目名字
                if (!row.clinicItemCode) row.clinicItemCode = row.clinicItemCodeSon;   //项目编码
                if (!row.idClinicItem) row.idClinicItem = row.idClinicItemSon;         //项目id
                if(this.isOtherTypeOrders(row) && !this.isDrugType(row)) row.idClinicItem && this.otherClinicIds.push(row.idClinicItem);
                if(!row.totalAmount) {
                    // 住院模版引用无需赋值
                    // if(!this.isFromDoctwsTmpl && this.isInterim(row) && !this.isDrugType(row)) row.totalAmount = row.totalAmount || 1;
                    if(!this.isDrugType(row)) {
                        //非药品 兼容处理历史的 quantity 字段
                        row.totalAmount = row.quantity = row.totalAmount || row.quantity || 1;
                    }
                } 
                 //非药品 兼容处理历史的 quantity 字段
                if(!this.isDrugType(row)) row.quantity = row.totalAmount;
                
                // 药品切割空格
                row.content = row.ordersName|| row.clinicItemName || row.clinicItemNameSon || row.content;
                if(this.isDrugType(row)) {
                    row.doseUnitSave = row.doseUnits;
                    row.ordNames = row.content?row.content.split(' '):[];
                    row.specialDrugIndicator = 2; // // 医保多报销 不设置特效药字段 1-符合，0-不符合，2-未设置
                }
                if(this.isFromAgent)  row.ordNames.push(row.drugSpecification)  //规格

                // 解决key值的重复问题 -- 住院医嘱模版引用
                if (this.isFromDoctwsTmpl && row.listChargeItem && row.listChargeItem.length) {
                    row.listChargeItem.map((item, index) => {
                        if (row.idOrdersTemplateItem == item.idOrdersTemplateItem) {
                            item.idOrdersTemplateItems =item.idOrdersTemplateChargeItem;
                        }
                    });
                }
             })
            return resData
        },
        // 查询单位 确保其他类型医嘱能查询到单位
        listByIdClinicItems() {
            if(!this.otherClinicIds.length)  return;
            this.getIndicationsBrOrATM(this.otherClinicIds).then( data => {
                this.prPriceItemList = data || [];
                this.tableData.forEach(item =>{
                    let rowId = this.getPrPriceItemLists.get(item.idClinicItem);
                    if(rowId && rowId.length){
                        if (!item.sdUnit) item.sdUnit = rowId[0].sdUnit;
                        if (!item.sdUnitStr) item.sdUnitStr = rowId[0].sdUnit;
                        if (!item.totalAmountUnit) item.totalAmountUnit = rowId[0].sdUnit
                    }
                })
            })
        },
         //显示列
        fromColumn(params) {
            if(this.isFromDoctwsTmpl) return true; // 住院模版引用全部展示
            if(!this.isFromTemporaryStorage){
                for(const [key, value] of Object.entries(this.from.column)){
                    if(params == key) return value;
                }
            }else{ // 暂存列表展示
                let arr = ['idDept','repeatIndicator','sdClinicType','dtOrderStart','dtOrderStartIcon','remark','operation','idFreq'];
                let WestFlag = this.tableData.some(v=> this.isWestDrug(v));
                let HerBalFlag = this.tableData.some(v=> this.isHerBalDrug(v));
                let TestFlag = this.tableData.every(v=> !this.isOtherTypeOrders(v));
                if(WestFlag) return true;
                if(HerBalFlag) return params !== 'groupCode';
                if(TestFlag) return arr.includes(params) && params !== 'idFreq';
                return arr.includes(params)
            }
            
        },
        layOut(){
            let thiz = this;
            this.$nextTick(()=>{
                thiz.$refs.tableData.doLayout();
            })
        },
        // 药品成组+检验同一申请单
        isGroupAndForm(row){
            return  this.isGroup(row) && this.isGroup(row,'idFormFontRange')
        },
        //处理无科室情况
        handleNoIdDept(row, index) {
            //造影剂
            if(this.isFromAgent) return
            // 如果没有带出科室，就取当前患者的所在科室
            if(this.isFromOutp) {
                row.idDept = this.userParmas.idDept;
                row.deptName = this.userParmas.idDeptName;
            } else {
                //住院
                row.idDept = this.docPatientParams.idDeptAdmit;
                row.deptName = this.docPatientParams.idDeptAdmitName;
            }
        },

         //校验检查是否是本科室
        isOwnDept(row) {
            this.inspectTreeList.map( v =>{
                if(v.code === row.sdSubClinicType) {
                    if(!v.childVOList) return
                    v.childVOList.map( item => {
                        if(item.code === row.sdSubExamType && this.examDeptUseLocalArr.includes(item.idData)) {
                            this.handleNoIdDept(row);
                        }
                    })
                }
            })
        },
        //检查备注 、查体、主诉处理
        handlerDescription(row) {
            row.description = row.description || '-'
            //门诊处理 自动引用接诊查体和主诉
            if(this.isFromOutp) {
                row.physSign = this.inspectData.physSign || '';    //接诊查体
                row.clinicSymp = this.inspectData.clinicSymp || '';//接诊主诉
            }
        },

        //解决重复keys
        handleRepeatKeys(row, index) {
            let Row = this.tableData[index];

            Row.rowKey = Row.idClinicItemPackage || Row.idOrdersTemplateItem 
            if(this.isFromCopy) Row.rowKey = Row.idClinicItem + index
        },

        //临时
        isInterim(row) {
            return row.repeatIndicator === 0;
        },
        // 长期
        isLongTerm(row) {
            return row.repeatIndicator === 1;
        },
        //药品-- 西药和中药
        isDrugType(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE 
        },

        //西药
        isWestDrug(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE && row.sdSubClinicType !== this.CONSTANT.DRUG_SUB_TYPE
        },

        //中药
        isHerBalDrug(row) {
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE && row.sdSubClinicType === this.CONSTANT.DRUG_SUB_TYPE
        },
        // 其他，护理，治疗,药品类型医嘱
        isOtherTypeOrders(row){
            // 不包含 检查，检验，特检，手术以外的
            let arr = [this.CONSTANT.TEST_TYPE,this.CONSTANT.SPECIAL_INSPECT_TYPE,this.CONSTANT.INSPECT_TYPE,this.CONSTANT.OPERATION_TYPE]
            return !arr.includes(row.sdClinicType)
        },

        // 住院医嘱模板 不展示数量
        isUnShowAmountTypes(row){
            // 包含 检验，特检，手术以外的
            let arr = [this.CONSTANT.TEST_TYPE,this.CONSTANT.SPECIAL_INSPECT_TYPE,this.CONSTANT.OPERATION_TYPE]
            return this.isFromDoctwsTmpl && arr.includes(row.sdClinicType)
        },

        //用药天数固定为1天的频次  数量不能修改，不能反算天数
        isOneDay(row) {
            //造影剂 用药天数不能修改
            if(this.isFromAgent)  return true

            let drugtOneDays = this.drugDaysLimitOneDay || [];
            return row.sdClinicType == this.CONSTANT.DRUG_TYPE && this.isInterim(row) && drugtOneDays.includes(row.idFreq);
        },

        //是否显示复选框
        cellcb(row) {
            if ((!this.isGroupAndForm(row.row) && row.columnIndex == "0")||row.row.priceItemName) {
                return "myCell";
            }
        
            if(row.row.checkMessage && row.column.property == 'checkMessage') {
                return "colorRed";
            }
        },

        showBChildrenBg({ row, rowIndex }) {
            if (row.checkMessage) {
                return "BWarningBg";
            }
            if (row.listChargeItem) {
                return "BChildrenBg";
            }
        },
        isShowTotalAmount(row) { 
            if(row.priceItemName) return false
            //临时
            if(this.isInterim(row) ) {
                  //中药可以修改
                if(this.isHerBalDrug(row) && !this.isGroupAndForm(row))  return false 
                if(this.isDrugType(row)) return true
                // if(this.isFromDoctwsTmpl){ // 住院模版引用
                //     if(this.isDrugType(row)) return true
                //     return row['totalAmount']
                // }
                return (this.isOtherTypeOrders(row) || this.isPathSub(row)); // 排除检查检验手术
            }
             //药品 治疗 护理 其他  可以修改数量     排除检查检验手术
            return this.isOtherTypeOrders(row) && !this.isDrugType(row)
        },

        // 开始时间显示
        showStartTime(row){
            return this.isGroupAndForm(row) && !row.priceItemName
        },

        //病理分类
        isPathSub(row) {
            return row.sdSubClinicType == this.CONSTANT.INSPECT_PATHOL0GY_TYPE;
        },
        
        showRemark(row) {
            let rearkOk = [this.CONSTANT.INSPECT_TYPE, this.CONSTANT.TEST_TYPE, this.CONSTANT.OPERATION_TYPE];
            if(rearkOk.includes(row.sdClinicType) && !this.isGroupAndForm(row)) return false
            return true
        },
        // changeRemark(row) {
        //     if(this.showRemark(row)) this.applyGroupKeys(row, ['remark'])
        // },
       
        //特殊隐藏中药内容
        isHideContent(index, row) {
            if(!this.isHerBalDrug(row)) return false
            if(this.isFirst(row)) return false
            return index == 1 || index == 2
        },

        handlerContent(row) {
            return row.ordersName|| row.content || row.priceItemName || row.clinicItemName
        },

        //是否显示数量框
        isShowInputNumber(row, key) {
            //中药只展示一个框
            if(this.isHerBalDrug(row) && !this.isGroupAndForm(row))  return false  
            if(this.isInterim(row)) {
                return true
            } else {
                let unLong = [this.CONSTANT.DRUG_TYPE, this.CONSTANT.INSPECT_TYPE, this.CONSTANT.TEST_TYPE];
                return !unLong.includes(row.sdClinicType)
            }
        },

        //勾选状态
        selectableHandler(row){
            if(row.isChargeTypePriceDesc === 0) return false
            let group = this.orderGroupCodeObj[row.orderGroupCode] || this.idFormObj[row.idForm]
            if(group){
                let flags = group.some(item=>{
                    return item.checkMessage
                })
                return !flags
            }
            return !row.checkMessage
        },

        //勾选
        handleSelectionChange(val) {
     
            let templateItemArr = []; //项目集合
       
            let arr = val.filter(item=>{
                return  this.isGroup(item,'idFormFontRange') && this.isGroup(item)
            })
            arr.forEach(item=>{
                if(item.orderGroupCode){
                    this.orderGroupCodeObj[item.orderGroupCode].forEach(item=>{
                        templateItemArr.push(item);
                    })
                    return;
                }
                if(item.idForm){
                    this.idFormObj[item.idForm].forEach(item=>{
                        templateItemArr.push(item);
                    })
                    return;
                }
                return  templateItemArr.push(item);
            })
            if(!templateItemArr.length){ // 筛选完可勾选数据，无数据 清空
                this.$refs.tableData.clearSelection();
            }
            this.multipleSelection = templateItemArr;

            this.$emit('tableCheckedRows', this.multipleSelection)
        },


        //验证字段格式化
        formatMessage(row, column) {
            let res = row.checkMessage;
            return res;
        },

        //保存
        handleCommitSave() {
             //校验多报销比例
            if(this.isInsurePat) {
                let isvalidateRem = this.validateReimburInfo();
                if(isvalidateRem) return
            }
        },

        //埋点处理
        getBuryingPoint(eventName, parmas = {}, subTitle) {
            let obj = {
                idPat: this.docPatientParams.idPat || this.$route.query.idPat,
                idVisit: this.docPatientParams.idVisit || this.$route.query.idVisit,
                ...parmas
            }
            //埋点
            let parame = [{
                eventDescription: eventName, //事件名字
                properties:[obj],   //参数
                title: '医嘱录入',   //模块
                subTitle: subTitle || '医嘱模板', //子模块
                url: this.routerPath,
            }]
            this.buryingPoint(parame, 'hospitalDoctor');
        },

    }, 
    watch:{
        tableData(val){
            if(val.length){
                this.orderGroupCodeObj = this.orderGroupCodeDataHandler(val);
                this.idFormObj = this.idFormDataHandler(val);
                this.layOut();
            }
        }
    }     
}
</script>
<style lang="scss"  src="./index.scss">

</style>