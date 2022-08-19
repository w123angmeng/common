<template>
    <div class="inspectRight">
        <p class="f16 c26 title">已选项目</p>
        <el-form ref="formData" :rules="rules" :model="formData" label-width="74px" label-suffix=":" :inline="true">
            <el-form-item label="患者病情" prop="clinicSymp">
                <el-input v-model="formData.clinicSymp" :disabled="isSee"></el-input>
            </el-form-item>
            <el-form-item label="检查目的" prop="examObjective" >
                <el-input v-model="formData.examObjective" :disabled="isSee"></el-input>
            </el-form-item>
            <el-form-item label="注意事项" prop="announcements" class="form_diff" :class="{bedsideFlag: isFromInpDoctor}" >
                <el-autocomplete
                    v-model="formData.announcements"
                    :disabled="isSee"
                    :fetch-suggestions="getRemakOptions"
                    placeholder="注意事项"
                    style="margin-right:16px;"
                >
                </el-autocomplete>
                <span v-if="isFromInpDoctor">执行科室：</span>
                <el-select 
                    v-if="isFromInpDoctor"
                    v-model="filterIdDept" 
                    filterable 
                    remote
                    :disabled="true"
                    reserve-keyword 
                    :remote-method="remoteIdDept"
                    @focus="remoteIdDept('')" 
                    placeholder="执行科室">
                    <el-option 
                        v-for="(item,index) in department" 
                        :key="'item.value' + index" 
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <template>
                <template v-if="isFromInpDoctor">
                    <el-form-item prop="bedsideFlag" class="form_autow" label-width="10px">
                        <el-checkbox
                            :disabled="isSee"
                            true-label="1"
                            false-label="0"
                            v-model="formData.bedsideFlag">
                            床旁
                        </el-checkbox>
                    </el-form-item>
                </template>
                <!-- <template v-else> -->
                    <el-form-item class="form_autow">
                        <el-checkbox
                            :disabled="isSee || (inspectData.specialDisease !== 1 && !isInsurPat)" 
                            v-model="insuranceFlag"
                            @change="changeInuranceFlag">
                            自费
                        </el-checkbox>
                    </el-form-item>
                    
                    <el-form-item class="form_autow form_autow_last" label-width="10px">
                        <el-checkbox
                            :disabled="isSee"
                            v-model="urgentFlag"
                            @change="changeUrgentFlag">
                            加急
                        </el-checkbox>
                    </el-form-item>
                <!-- </template> -->
            </template>
       
            <div class="inspect_tableWrap">
                <div :style="{maxHeight:tableMaxHeight + 'px'}" class="csVoList">
                    <el-table 
                        :data="formData.csClinicItemBatchExamVoList" 
                        stripe style="width: 100%" 
                        :show-header="false" 
                        :empty-text="emptyText"
                        :cell-style="isDisabled ? colsecellStyle : cellStyle"
                    >
                    <!-- :max-height="tableMaxHeight" -->
                        <el-table-column prop="clinicItemName"> </el-table-column>
                        <el-table-column prop="" width="100">
                             <template slot-scope="scope">
                                 <template v-if="isShowGcpBtn(scope.row, scope.$index) && scope.row.gcpIdentification=== CONSTANT.GCP_FLAG_ATM">
                                     <span 
                                        class="showGcp" 
                                        :class="showGcpFlagClass(scope.row, scope.$index)"
                                        @click="changeCurGcp(scope.row, scope.$index)"
                                    >GCP</span>
                                    <!-- <el-checkbox
                                        v-model="scope.row.isGcp"
                                        :disabled="isDisabled || disableGcp(scope.row, scope.$index)"
                                        class="gcpIcon"
                                        >GCP</el-checkbox> -->
                                </template>
                             </template>    
                        </el-table-column>
                        <el-table-column prop="quantity"  width="170">
                            <template slot-scope="scope">
                                <span  v-if="isSee">{{scope.row.quantity || 1}}</span>
                                <el-form-item 
                                    v-else 
                                    label-width="0px"  
                                    :prop="'csClinicItemBatchExamVoList.' + scope.$index + '.quantity'"
                                    :rules="rules.quantity">
                                    <el-input :disabled="!isPathSub" style="width: 60px;" v-model="scope.row.quantity"></el-input>
                                </el-form-item>     
                            </template>    
                        </el-table-column>
                        <el-table-column v-if="!isSee" prop="priceAmount" width="120">
                            <template slot-scope="scope">
                                {{scope.row.priceAmount | number(2) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="date" width="85">
                            <template slot-scope="scope">
                                <el-button type="text" :disabled="isDisabled" @click="deleteItem(scope.$index, scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                
                <div class="inspect_indications" v-if="formData.csClinicItemBatchExamVoList.length">
                    <!-- 适应症 多项目 及 详细适应症弹窗 -->
                    <IndicationsCom :IndicationsForm="IndicationsForm" v-if="formData.csClinicItemBatchExamVoList.length"></IndicationsCom>
                </div>
            </div>
         </el-form>
          <!-- 造影剂弹窗 -->
        <AgentDrugsCom :agentDrugForm="agentDrugForm" v-if="agentDrugForm.visible" @commitSingleAgent="commitSingleAgent"></AgentDrugsCom>
       
        <div class="inspect_bottom flexRow">
            <div class="inspect_bottom_right">
                <el-button
                    type="primary"
                    :loading="saveloading"
                    :disabled="isDisabled"
                    @click="saveDocAdvice()">
                    提交
                </el-button>
                <el-button
                    plain
                    :disabled="isDisabled"
                    @click="resetOutpDocAdviceEvent">
                    清空
                </el-button>
            </div>
        </div>
    </div>
</template>
<script>
import bus from "@/components/common/bus.js";
import IndicationsCom from '../../outpIndicationsCom/indicationsCom.vue';//适应症组件
import AgentDrugsCom from '@/components/page/Common_WEB/agentDrugsCom/index.vue'   // 造影剂弹窗
import { mixinSaveAgent } from '@/components/page/Common_WEB/agentDrugsCom/mixinSaveAgent.js'   // 造影剂保存处理
import mixinsGcpAtm from "@/components/page/Common_WEB/mixins/mixinsGcpAtm";
import { mixinSaveLoading } from "@/components/page/Common_WEB/mixins/mixinSaveLoading";

import { mapMutations, mapGetters } from 'vuex';

const SPECIAL_DISEASE = 1;   //特病
export default {
    props:{
        inspectData:{
            type: Object,
            default: ()=>({})
        },
        isFromInpDoctor: {
            type: Boolean,
            default: () => {
                return false
            }
        },
        tabCommonParmas: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    mixins:[mixinSaveAgent, mixinsGcpAtm, mixinSaveLoading],
    data(){

        let checkRemark = (rules, value, callback) => {
            // if (!value) {
            //     if(!this.isAtmeng) return callback();
            //     return callback(new Error("必填项不能为空！"));
            // }
            callback();
        };

        let num = (rules, value, callback) => {
            let arr = rules.fullField.split('.');
            let dom = this.formData.csClinicItemBatchExamVoList[arr[1]];
            if (!dom.quantity) {
                return callback(new Error("数量不能为空！"));
            } else {
                if (!/^[1-9]\d*$/.test(dom.quantity)) {
                    return callback(new Error("填写正确的数字！"));
                }
            }
            callback();
        };

        return {
            examDeptUseLocalArr: [],
            tableMaxHeight: 0,
            isSee: false,
            dataLoading: false, //正在请求数据详情
            isAllowExamItemMultiple: false,  //是否支持项目多选
            department: [],         //执行科室列表
            diagnosisNameStr: '',   //诊断名称拼接字符串
            formData: {
                idPat: this.$route.query.idPat,     //患者id
                idVisit: this.$route.query.idVisit, //就诊id
                sdVisitType:  '', //就诊类型
                clinicSymp: "",                     //症状
                // physSign: "",                       //体征
                examObjective: "",                  //检查目的
                relevantLabTest: "",                //相关化验结果
                announcements: "",                  //备注
                urgentIndicator: 0,                 //加急
                insuranceIndicator: 1,              //自费   0 自费 1 医保
                chargeTypeCode: '',                 //费别
                bedsideFlag: '0',                   //床旁标识
                csClinicItemBatchExamVoList: [],           //检查项目列表
            },
            backupsForm: {},  //备份formData
            insuranceFlag: false,   //自费标识
            urgentFlag: false, //加急标识

            //适应症弹窗数据
            IndicationsForm: {
                IndicationsVisible: false,  //弹窗
                IndicationInfoList: [],     //适应症数据
            },
            cellStyle: {
                fontSize: '14px',
                color: '#1890ff',
                lineHeight: '24px',
            },
            colsecellStyle: {
                fontSize: '14px',
                lineHeight: '24px',
            },
            rules: {
                announcements: [{required: false, validator: checkRemark, trigger: "change"}],
                quantity: [{required: false, validator: num, trigger: "change"}],
            }, //校验规则
        }
    },
    computed:{
        ...mapGetters(['docCloseVisitState', 'docPatientParams', 'routerPath']),
        isAtmeng(){
            return this.$limits.isFun(this)
        },
        userParmas() {
            return this.getUserStorage();
        },
        idEmpStr() {
            return this.userParmas.idEmp;
        },
        emptyText(){
            return this.dataLoading ? ' ' : '暂无数据';
        },
        //离开本页面时，判断是否“需要提保存数据”
        isSaveStatus() {
            if(!this.isSee && this.formData.csClinicItemBatchExamVoList.length) { //新增&&有项目
                return true
            }
            return false
        },
        filterVisitType() {
            if(this.isFromInpDoctor) return this.CONSTANT.INPA_VISIT_TYPE;
            return this.CONSTANT.OUTP_VISIT_TYPE;
        },
        filterIdDept() {
            if(!this.isSee && this.formData.csClinicItemBatchExamVoList.length) return this.formData.csClinicItemBatchExamVoList[0].idDept || ''
            return this.formData.idDept || ''
        },
        idClinicItemsList() {
            let arr = this.formData.csClinicItemBatchExamVoList.map( v => v.idClinicItem).filter(item => item);
            return arr
        },
        editApplyUrl() {
            let url = this.isFromInpDoctor ? '/doctws/ciApplyExam/findById' : '/outpdr/ciApplyExam/findById';
            return url
        },
        submitApplyUrl() {
            let url = this.isFromInpDoctor ? '/doctws/ciApplyExam/batchSave' : '/outpdr/ciApplyExam/batchSave';
            return url
        },
        isDisabled() {
            return this.isSee || this.docCloseVisitState
        },
        isPathSub() {
            //病理分类
            if(!this.formData.csClinicItemBatchExamVoList || !this.formData.csClinicItemBatchExamVoList.length) return false
            
            return this.formData.csClinicItemBatchExamVoList[0].sdSubClinicType == this.CONSTANT.INSPECT_PATHOL0GY_TYPE;
        },
        isOwnDeptObj() {
            let Obj = {
                idDept: this.userParmas.idDept,
                deptName: this.userParmas.deptName,
            };
            if(this.isFromInpDoctor) {
                Obj.idDept = this.docPatientParams.idDeptAdmit; //患者所在科室id
                Obj.deptName = this.docPatientParams.idDeptAdmitName; //患者所在科室名字
            }
            return Obj
        },
        //gcp 患者
        isGcpPat() {
            if(this.isFromInpDoctor) {
                return this.tabCommonParmas.isGcpPat || false
            }
            return this.inspectData.isGcpPropertyStatus
        },
        concatSympStr() {
            let clinicSymp = this.inspectData.clinicSymp || '';//接诊主诉
            let physSign = this.inspectData.physSign || '';//接诊体征
            if(clinicSymp && physSign) return `${clinicSymp} ; ${physSign}`
            return `${clinicSymp}${physSign}`
        },
        isInsurPat() {
            let insCodes = [this.CONSTANT.OUTPEXCESS_CHARGETYPECODE];
            if(this.isAtmeng) {
                //阿特蒙 异地结算
                insCodes.push(this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE_ATM)
            } else {
                //博仁 异地结算
                insCodes.push(this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE)
            }
            return insCodes.includes(this.inspectData.chargeTypeCode)
        },
    },
    filters: {
        number: function(value, digits = 2) {
            let result = value || 0;
            return parseFloat(result).toFixed(digits);
        }
    },
    async created(){

        await this.init();
        
        bus.$off('inspectListInsert');
        bus.$on('inspectListInsert', (item)=> { //新增检查项目
            let tip = this.docCloseVisitState ? '诊毕' : '已提交';
            if(this.isDisabled){
                this.$message({
                    type: 'error',
                    message: `${tip}不能进行新增`
                })
                return;
            }
            item.quantity = 1;
            this.insertItem(item);
        });
        bus.$off('inspectRightSeeInfo');
        bus.$on('inspectRightSeeInfo', (item)=> { //查看检查申请单详情
            this.seeInfo(item);
        });
    },
    components: {
        IndicationsCom,
        AgentDrugsCom,
    },
    methods:{
        async init() {
            //页面初始化
            //打开新增页面
            this.formData.chargeTypeCode = this.inspectData.chargeTypeCode; //费别
            this.formData.sdVisitType = this.filterVisitType;
            // this.formData.physSign = this.inspectData.physSign || '';    //接诊体征

            this.formData.clinicSymp = this.concatSympStr; //患者病情
            

            this.initAgentDrug(); //造影剂需要参数
            
            await this.getExamDeptUseLocal();
            this.autoTableMaxHeight();

            // 自费处理 --- 特病、医保、自费
            this.handlerInsuranceIndicator();  
            this.formData.urgentIndicator = 0;//加急处理
            this.urgentFlag = this.formData.urgentIndicator === '1' ? true : false; //勾选加急
            this.backupsForm = this.copyObject(this.formData);  //备份数据

            if(this.isFromInpDoctor){
                this.isAllowExamItemMultiple = true; //住院支持开多条
            }else{
                this.getAllowExamItemMultipleSelect();//是否支持项目多选
            }
            this.getDiagnoseInfo();  //诊断记录列表
            this.remoteIdDept('','');///科室列表

        },
        //造影剂需要参数
        initAgentDrug() {
            this.agentDrugForm.sdVisitType = this.filterVisitType;
            this.agentDrugForm.source = this.isFromInpDoctor ? 'inp' : 'outp';
            this.agentDrugForm.isFromApply = true;
            this.agentDrugForm.isCopy = false;   //复制
        },

        //获取哪些分类下属于本科室
        async getExamDeptUseLocal() {
            let Obj = {
                systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                paramTypeCode: 'Exam_Dept_Use_Local',
            }
            await this.getDefaultValueBySystemParamCode(Obj).then((data)=> {
                this.examDeptUseLocalArr = data || [];
            })
        },
        //是否是本科室
        isExamDeptUseLocal(item) {
            return this.examDeptUseLocalArr.includes(item.sdSubExamId);
        },

        //删除检查项目
        deleteItem(index, item){
            this.deleteAgentItem(index, item);   //删除造影剂
            this.formData.csClinicItemBatchExamVoList.splice(index,1);
        },
        //检测重复项
        isRepeatItem(item) {
            let isRepeat = this.formData.csClinicItemBatchExamVoList.some(info=>info.idData == item.idData);
            if(isRepeat) {
                this.$message.warning('不支持添加重复的项目');
            }
            return isRepeat
        },

        //添加检查项目
        async insertItem(item){
            //重复
            if(this.isRepeatItem(item)){
                return;
            }
            let newItem = this.copyObject(item);
            await this.findDeptListById(newItem);
            await this.findPriceAmountById(newItem);
            if(this.isAllowExamItemMultiple){
                //重复
                if(this.isRepeatItem(item)) return
                let list = this.formData.csClinicItemBatchExamVoList;
                if(list.length) {
                    if(newItem.sdSubClinicType !== list[0].sdSubClinicType || newItem.sdSubExamType !== list[0].sdSubExamType) this.formData.csClinicItemBatchExamVoList = [];
                }
                this.formData.csClinicItemBatchExamVoList.push(newItem);
            }else{
                this.formData.csClinicItemBatchExamVoList.splice(0, 1, newItem);
            }

            this.getAgentList(item.idClinicItem); //增强项目查询 --- 造影剂 

             //默认到底部 
            this.$nextTick(()=> {
                let doms = document.querySelector('.csVoList');
                doms.scrollTop = doms.scrollHeight;
            })
            
            let lt = this.formData.csClinicItemBatchExamVoList;
            let endLg = lt.length -1
            let gcpObj = {
                gcpOrders: lt, 
                idList: [lt[endLg].idClinicItem],
                index: endLg,
                sdVisitType: this.filterVisitType,
                isEditFlag: false,
            }
            await this.getGcpOrders(gcpObj);

        },

        async getGcpOrders(gcpObj) {
            let gcpOrders = await this.commitGcpOrders(gcpObj);
            if(!gcpOrders) return false
            this.formData.csClinicItemBatchExamVoList = this.copyObject(gcpOrders);
        },

        //切换加急
        changeUrgentFlag(e) {
            this.formData.urgentIndicator = e ? 1 : 0;
        },

        //切换自费
        changeInuranceFlag(e) {
            if(this.inspectData.specialDisease === SPECIAL_DISEASE) {
                this.formData.insuranceIndicator = e ? 0 : 2;
            } else {
                this.formData.insuranceIndicator = e ? 0 : 1;
            }
        },

        //自费处理 --- 特病、医保、自费
        handlerInsuranceIndicator() {
            // 特病优先走特病开医嘱
            if(this.inspectData.specialDisease === SPECIAL_DISEASE) {
                this.insuranceFlag = false;
                this.formData.insuranceIndicator = 2;   //特病
            } else {
                if(this.isInsurPat) {
                    this.insuranceFlag = false;
                    this.formData.insuranceIndicator = 1;   //医保
                } else {
                    // 费别值是02的时候为医保，其余值全为自费  自费患者不能取消
                    this.insuranceFlag = true;
                    this.formData.insuranceIndicator = 0;   //自费
                }
            }
        },

        //注意事项
        async getRemakOptions(name, callback) {
            let result = [];
            let params = {
                clientScopeCode:  this.idEmpStr,// 0为主机名；1为用户编码 ,
                sdClientConfigScope:'1',// 0-本机；1-用户
            }
            const resData = await this.$axios._post('dict/sClientConfig/page',params);
            if(resData.success) {
                let personalConfig = resData.data.records;
                //将数据赋值给view
                let remakOptions = [];
                personalConfig.map((item,index)=>{
                    if(item.clientConfigCode == 'exam_note_select'){
                        if(item.clientConfigName) {
                            item.clientConfigName.split('|').map((item,index)=>{
                                remakOptions.push({
                                    dataName:item,
                                    dataCode:item,
                                    value: item
                                })
                            });
                        }
                    }
                })
                remakOptions.map( v => {
                    if(!name) result.push(v)
                    if(name && v.value.includes(name)) result.push(v)
                })
                callback(result)

            }else{
                this.$message({
                    type:'error',
                    message:resData.message
                })
                    callback([])
            }
        },

        //获取检查项目是否支持多选权限控制
        async getAllowExamItemMultipleSelect() {
            let Obj = {
                systemId: this.CONSTANT.OUTP_SYSTEM_FLAG,  //门诊
                paramTypeCode: 'Allow_ExamItem_Multiple_Select',
            }
            await this.getDefaultValueBySystemParamCode(Obj).then((data)=> {
                let arr = data || [];
                this.isAllowExamItemMultiple = arr.includes('0') ? false : true;
            })
        },

        //获取诊断信息
        getDiagnoseInfo(){
            let idPat = this.$route.query.idPat;
            let idVisit = this.$route.query.idVisit;
            this.selectCiDiaRecord(idPat, idVisit, this.CONSTANT.OUTP_DIAGNOSIS_FLAG ).then( data => {
                //新增状态下默认取诊断记录第一条数据
                if(data.length > 0) {
                    let nameArr = [];
                    data.map( v => {
                        nameArr.push(v.diagnosisName);
                    })
                    this.diagnosisNameStr = nameArr.join(',')
                }
            })
        },

        //查询项目是否关联适应症
        async getInsByIdClinicItem(list) {
            if(!list.length) return
            let result = await this.getIndicationsBrOrATM(list);
            this.IndicationsForm.IndicationInfoList = [];
            this.$nextTick(()=> {
                this.IndicationsForm.IndicationInfoList = result;
            })
        },

        // 检查执行科室 -- 模糊查询
        remoteIdDept(query = '') {
            this.diffDeptList('', query).then( data => {
                this.department = data;
            })
        },

        //根据执行科室id查找执行科室名字
        findDeptNameById(id) {
            let arr = this.department.filter( v => v.value == id);
            return arr[0] ? arr[0].label : '';
        },

        // 通过诊疗项目id查询执行科室
        findDeptListById(item){
            return this.$axios.get('/dict/clinicItem/findDeptList', {
                idClinicItem: item.idClinicItem,
            }).then(res => {
                if (res.success) {
                    //患者本科室处理
                    if(this.isExamDeptUseLocal(item)) {
                        this.$set(item, 'idDept', this.isOwnDeptObj.idDept);
                        this.$set(item, 'deptName', this.isOwnDeptObj.deptName);
                    } else {
                        if(res.data) {
                            this.$set(item, 'idDept', res.data[0]);
                            this.$set(item, 'deptName', this.findDeptNameById(item.idDept));
                        }
                    }
                  
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            })
        },

        // 通过诊疗项目id查询价格
        findPriceAmountById(item){
            return this.$axios.get('/dict/clinicItem/listClinicPrice', {
                idClinicItem: item.idClinicItem,
                chargeTypeCode: this.inspectData.chargeTypeCode
            }).then(res => {
                if (res.success) {
                    if(res.data) {
                        let sum = 0;
                        (res.data || []).map( v =>{
                            let priceStd = v.priceStd ? v.priceStd : 0;
                            let amount = v.amount ? v.amount : 0;
                            let price = (priceStd*amount).toFixed(2);
                            sum += Number(price);
                        })
                        sum = sum.toFixed(2);
                        this.$set(item, 'priceAmount', sum);
                    }
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            })
        },

        // 保存回调
        saveDocAdvice() {
            return this.commitInspectApply('formData');
        },

        // 检查保存处理数据
        async sendCommitForm() {
            let copyObj = this.copyObject(this.formData); //备份
            copyObj.csClinicItemBatchExamVoList = copyObj.csClinicItemBatchExamVoList.map(v => {
                return {
                    idClinicItem: v.idClinicItem,     //项目id
                    clinicItemCode: v.clinicItemCode, //项目Code
                    clinicItemName: v.clinicItemName, //项目名称
                    idDept: v.idDept,                         //执行科室id
                    deptName: v.deptName,                         //执行科室name
                    sdSubExamType: v.sdSubExamType,                  //检查部位
                    sdSubExamTypeStr: v.sdSubExamTypeStr,              //检查部位str
                    sdSubClinicType: v.sdSubClinicType,                //检查类型
                    quantity: v.quantity,
                    isGcp: v.isGcp
                }
            });
            copyObj.diagnosisName = this.diagnosisNameStr;

            if(this.isFromInpDoctor) {
                 //患者所在科室id
                copyObj.idDeptCreate = this.docPatientParams.idDeptAdmit;
                //患者所在科室名字
                copyObj.createDeptName = this.docPatientParams.idDeptAdmitName;
             
                 if(!this.insuranceFlag) delete copyObj.insuranceIndicator

            } else {
                 //当前登录科室id
                copyObj.idDeptCreate = this.getUserStorage().idDept;
                //当前登录科室名字
                copyObj.createDeptName = this.getUserStorage().deptName;

                // 门诊显示：自费、加急
                delete copyObj.bedsideFlag;
            }

            //处理gcp阿特蒙
            copyObj.csClinicItemBatchExamVoList = this.copyObject(this.saveGcpOrdersFlag(copyObj.csClinicItemBatchExamVoList, true));

            this.saveInfo('formData', copyObj);
           
        },

        commitInspectApply(formName) {
            this.sendCommitForm();
        },

        // 提交检查申请
        saveInfo(formName, sendForm) {
            return new Promise((resolve)=>{

                this.$refs[formName].validate(async valid => {
                    if (valid) {
                        if(!sendForm.csClinicItemBatchExamVoList.length){
                            this.$message({
                                message: '检查项目不能为空！',
                                type: "warning"
                            });
                            return resolve(false);
                        }
                        if(!this.filterIdDept && this.isAtmeng) {
                            this.$message({
                                message: '项目执行科室没有维护！',
                                type: "warning"
                            });
                            return resolve(false);
                        }
                        this.saveloading = true;
                        let idOrdersList = [];
                        let isHasAgent = await this.validateIsAgent(this.formData.csClinicItemBatchExamVoList);
                        if(isHasAgent) {
                            idOrdersList = await this.saveAgentListInfo();  //保存造影剂
                        }
                        sendForm.idOrdersList = idOrdersList || [];
                        this.$axios._post(this.submitApplyUrl, sendForm).then(res => {
                            if (res.success) {
                                this.$message({
                                    message: '提交成功',
                                    type: "success"
                                });
                                
                                let lastPhysSignObj = {
                                    clinicSymp: sendForm.clinicSymp,  //症状
                                    // physSign: sendForm.physSign,      //体征
                                    examObjective: sendForm.examObjective,  //检查目的
                                }
                                sessionStorage.setItem('lastPhysSign', JSON.stringify(lastPhysSignObj));
                                this.resetOutpDocAdviceEvent();     //重置检查
                                bus.$emit('refreshInspectLeftList'); //获取检查申请单列表
                                this.saveloading = false;
                                this.getBuryingPoint('检查申请单提交'); //埋点
                                return resolve(true);
                            } else {
                                this.$message({
                                    message: res.message,
                                    type: "warning"
                                });
                                this.saveloading = false;
                                return resolve(false);
                            }
                        });
                    } else {
                        console.log("error submit!!");
                        return resolve(false);
                    }
                });
            })
        },
    
        //清空回调 处理数据
        resetOutpDocAdvice(isSee){
            this.isSee = false;
            this.$refs['formData'].resetFields();
            this.formData = this.copyObject(this.backupsForm); //手动清空数据
            this.insuranceFlag = this.formData.insuranceIndicator === 0 ? true : false; //勾选自费
            this.urgentFlag = this.formData.urgentIndicator === '1' ? true : false; //勾选加急

            //引用上次开立的体征
            if(sessionStorage.getItem("lastPhysSign") && !isSee && this.isFromInpDoctor) {
                let lastPhysSignObj = JSON.parse(sessionStorage.getItem("lastPhysSign"))
                // this.formData.physSign = lastPhysSignObj.physSign;
                this.formData.clinicSymp = lastPhysSignObj.clinicSymp;
                this.formData.examObjective = lastPhysSignObj.examObjective;
            }
        },

        //重置事件
        resetOutpDocAdviceEvent(isSee){
            // 重置树的选中、重置表单
            this.$emit('resetInspectAdd', isSee)
        },

        //查看选中的检查申请单
        seeInfo(item) {
            this.resetOutpDocAdviceEvent(true);
            this.isSee = true;
            this.dataLoading = true;
            this.getApplyInfoData(item.idApplyExam).then( async(data)=>{ 
                data.csClinicItemBatchExamVoList = data.csClinicItemExamList;
                delete data.csClinicItemExamList;
                this.formData = data;
                this.insuranceFlag = this.formData.insuranceIndicator === 0 ? true : false; //勾选自费
                this.urgentFlag = this.formData.urgentIndicator === '1' ? true : false; //勾选加急
                
                this.formData.csClinicItemBatchExamVoList.map( v => v.gcpIdentificationCopy = v.gcpIdentification || this.CONSTANT.GCP_FLAG_ATM)
                let lt = this.formData.csClinicItemBatchExamVoList;
                let idList = this.formData.csClinicItemBatchExamVoList.map( v => v.idClinicItem).filter(item => item);

                let gcpObj = {
                    gcpOrders: lt, 
                    idList: idList,
                    index: 0,
                    sdVisitType: this.filterVisitType,
                    isEditFlag: true,
                    isForm: 'apply'
                }
                await this.getGcpOrders(gcpObj);
                this.dataLoading = false;
            }).catch(()=>{
                this.dataLoading = false;
            });
        },

        //获取检查申请单
        getApplyInfoData(idApplyExam) {
            return this.$axios.post(this.editApplyUrl, {
                idApplyExam: idApplyExam
            }).then(res => {
                if (res.success) {
                    return res.data
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },

        //展示gcp样式
        showGcpFlagClass(item, index) {
            if(item.gcpIdentificationCopy == this.CONSTANT.GCP_FLAG_ATM) {
                return 'gcpFlagAtm'
            }
            
            return 'unGcpFlagAtm'
        },

        changeCurGcp(item, index) {
            if(this.isDisabled) return
            item.isGcp = item.gcpIdentificationCopy == this.CONSTANT.GCP_FLAG_ATM;
            item.isGcp = !item.isGcp;
            item.gcpIdentificationCopy = item.isGcp ? this.CONSTANT.GCP_FLAG_ATM : this.CONSTANT.UN_GCP_FLAG_ATM;
        },

        autoTableMaxHeight() {
            // this.tableMaxHeight = window.innerHeight - 497;
            this.tableMaxHeight = window.innerHeight - 557;
        },

         //埋点处理
        getBuryingPoint(eventName, parmas = {}) {
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
                subTitle: '申请单提交', //子模块
                url: this.routerPath,
            }]
            this.buryingPoint(parame, 'hospitalDoctor');
        },
    },
    watch: {
        'formData.csClinicItemBatchExamVoList': {
            handler(newVal, oldVal) {
                let idClinicItemList = newVal.map(item=>item.idClinicItem);
                //查询适应症信息
                this.getInsByIdClinicItem(idClinicItemList);
            },
            deep: true,
        },
    },
}
</script>
<style src='./inspectRight.scss' lang="scss" scoped>
</style>
