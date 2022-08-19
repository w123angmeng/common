<template>
    <div class="patientInfoDetail flex" v-if="showBannerStatus != '2'">
        <template>
            <!-- 无患者就诊id,显示白屏--for--护士站 -->
            <template v-if="!queryIdVisit"></template>

            <!-- 骨架占位 -->
            <Skeleton v-else-if="infoLoading"></Skeleton>
            
            <template v-else>
                <div class="infoLeft">{{patientInfo.bedCode}}床</div>
                <div class="infoCon flex-col">
                    <div class="row">
                        <div class="item item--name-wrap">
                            <div class="text f-toe f16 f-fw500 c-dark-blank infoLabel">
                                <tooltipOver 
                                    :content="`${patientInfo.patName}`"
                                    refName="PID__name">
                                    <el-button type="text">{{patientInfo.patName}}</el-button>
                                </tooltipOver>
                            </div>
                            <i class="el-icon-idcard" @click="showPatientInfo"><img src="@/assets/images/doctws/idCard.png" alt="" style=""></i>
                        </div>
                        <div class="item">
                            <div class="text">{{patientInfo.sdSexDesc}}</div>
                            <div class="text">({{patientInfo.patAge}})</div>
                            <div class="text"><span class="infoLabel">ID:</span>  {{patientInfo.patCode}}</div>
                            <div class="text"><span class="infoLabel">住院号:</span> {{patientInfo.codeMrIp}}</div>
                        </div>
                        <div class="item flex v-center" v-if="patientInfo.sdAdmitCondition || isNurLevel">
                            <div class="text" :class="getDiffSdAdmitCondClass(patientInfo.sdAdmitCondition)"><span class="infoLabel">病情:</span> {{getSdAdmitCondition[patientInfo.sdAdmitCondition]}}</div>
                            <div class="flexRow">
                                <span class="infoLabel">护理:</span>
                                <div class="text item__nurse-level" :class="getDiffClass(patientInfo.sdNursingClass)" v-if="isNurLevel"></div>
                            </div>
                        </div>
                        <!-- <div class="item">
                            <div class="text c-dark-blank">传染病:</div>
                            <div class="text item__contagion-content">
                                <tooltipOver 
                                    :content="`${'【传染病内容传染病内容传染病内容end】'}`"
                                    refName="PID__contagion-content">
                                    【传染病内容传染病内容传染病内容end】
                                </tooltipOver>
                            </div>
                        </div> -->
                        <div class="item flex v-center flex1">
                            <div class="text c-dark-blank infoLabel">过敏史:</div>
                            <div class="flex1 flex v-center over_hidden">
                                <div class="text f-toe item__allergy-content" :class="showAllergyColor()">
                                    <tooltipOver 
                                        :content="`${cmptAllAllergyDataStr}`"
                                        refName="PID__allergy-content">
                                        {{cmptAllAllergyDataStr}}
                                    </tooltipOver>
                                </div>
                                <div class="text f-csp item__allergy-edit-btn" @click="hanlderEditAllergy"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row row--second">
                        <div class="item" v-if="isGcpPat || cmptOperationDays">
                            <el-tag class="gcpTag" v-if="isGcpPat" size="mini">GCP</el-tag>
                            <div class="text item__operation" v-if="cmptOperationDays">{{cmptOperationDays}}</div>
                        </div>
                        <div class="item">
                            <div class="text"><span class="infoLabel">入院:</span> {{cmptDtEntry}}</div>
                            <div class="text">{{cmptDays}}</div>
                        </div>
                        <div class="item">
                            <div class="text"><span class="infoLabel">费别:</span> <span :class="{cgreen:getMuniMedIns}">{{patientInfo.chargeTypeName}}</span> <span v-if="patientInfo.healthCardNumber">({{patientInfo.healthCardNumber}})</span> </div>
                            <div class="text" v-if="patientInfo.patClassName"><span class="infoLabel">身份:</span> {{patientInfo.patClassName}}</div>
                            <div class="text item__money-total"><span class="infoLabel">预交金:</span> ¥{{priceInfo.balance | currency}}</div>
                            <div class="flexRow">
                                <span class="infoLabel">已用:</span>
                                <div class="text item__money-balance" :class="priceInfo.preBalance < 0 ? 'clF73D47': 'cl55AC57'">¥{{priceInfo.preBalance | currency}}</div>
                            </div>
                            <div class="flexRow">
                                <span class="infoLabel">可用余额:</span>
                                <div class="text item__money-cost">¥{{priceInfo.inpBill | currency}}</div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div class="infoRight">
                    <div class="row f-fw500 c-dark-blank">主治医生：{{patientInfo.secondDoctor}}</div>
                    <div class="row flex v-center">
                        {{patientInfo.idDeptAdmitName}}
                        <el-divider direction="vertical" v-if="patientInfo.deptWardName"></el-divider>
                        {{patientInfo.deptWardName}}</div>
                    <div class="infoRightBtns flex">
                        <i class="icon-btn f-csp download" @click="downLoad" v-if='showUploadBtn'></i>
                        <i class="icon-btn f-csp open-emr" @click="btnClickOpenEmr" v-if='showUploadBtn'></i>
                        <i class="icon-btn f-csp pat-movedown" @click="changeBannerStatus(2)"></i>
                    </div>
                </div>

                <!-- 过敏史弹窗 -->
                <HisAddAllergy :allergyForm.sync="allergyForm" ref="HisAddAllergy"></HisAddAllergy>
                <informationDialog :infoMsg="infoMsg" v-if="infoMsg.dialogVisible"></informationDialog>
            </template>
        </template>
    </div>
</template>

<script>
    import bus from '@/components/common/bus.js'
    import { mapGetters, mapMutations } from 'vuex';
    import HisAddAllergy from '@/components/page/Common_WEB/hisAddAllergy/hisAddAllergy.vue';  //过敏史组件
    import Skeleton from './skeleton'; //骨架屏组件
    import informationDialog from '../patientInformationDialog'
    // 病情
    const SICK_ZERO = "0"; //濒危
    const SICK_ONE = "1"; //危重
    const SICK_TWO = "2"; //急症
    const SICK_THREE = "3"; //非急症
    // 护理等级
    const SPECIAL = "0"; //特级
    const ONE = "1"; //一级
    const TWO = "2"; //二级
    const THREE = "3"; //三级
    export default {
        props:{
            patientId:{
                type:String,
                default:''
            },
            tabActName:{
                type:String,
                default:''
            },
            from:{
                type: Object,
                default(){
                    return {}
                }
            }
        },
        directives: {
            focus: {
                // 指令的定义
                inserted: function (el) {
                el.querySelector('input').focus()
                }
            }
        },
        data() {
            return {
                infoLoading: false, //患者信息加载中...
                queryIdVisit: '', //查询患者详情的idVisit--for:护士站，没有选择患者，展示白屏
                flag: true,
                input: '',
                showUploadBtn: false,  //控制上传按钮
                patientInfo: {
                    idPat: "",
                    patName: '', // 患者姓名
                    sdSex: '', // 性别
                    dtBirth: '', // 出生日期
                    age: '', // 年龄
                    bedCode: '', // 床位号
                    patAccountRemain: "",
                    allergy: "",
                    operationDate: "",
                    operationDays: Number(),
                    idVisit:"",
                    days:Number(),
                    idEmpDoctor:"",
                    empName:"",
                    dtAccept:"",
                    visitCode:null,
                    deptName:null,
                    idDept:"",
                    idPat:"",
                    mainDiagnosis:null,
                    chargeTypeCode:"",
                    chargeTypeName:null,
                    nursingLevel:null,
                    admitCondition:null
                },

                //过敏史数据
                allergyForm: {
                    allergyDialogVisible: false,
                    idPat: '',
                    ppatList: [],            //患者过敏列表
                    allAllergyDataStr: '',   //过敏史页面展示字符串
                    sdAllergyType: '',   //过敏类型
                    allergyDate: '',     //过敏时间
                    allergyName: '',     //过敏源名称
                    sdAllergyDegree: '', //过敏程度
                    allergyReaction: '', //过敏反应
                    description: '',     //备注
                    birthDay: ''
                },
                balanceColor: '#363636',
                levelColor: '#363636',
                getSdAdmitCondition: {}, // 通用字典查询病情
                getSdNursingClass: {}, // 通用字典查询护理等级
                priceInfo: {}, // 费用
                isGcpPat: false, //是Gcp患者
                infoMsg:{
                    dialogVisible: false
                }, // 患者详情
            };
        },
        mounted() {
            let vm = this;
            bus.$off('docPatientInfo')
            bus.$on('docPatientInfo', msg => {
                this.getPatVisitInfo(msg.visitInfo.idVisit)
                this.bedCode = msg.visitInfo.bedCode;
                this.getPriceInfo(msg.visitInfo.idVisit);
                this.getValIsGcpPat({
                    idVisit: msg.visitInfo.idVisit,
                    idPat: msg.visitInfo.idPat
                }); //获取患者是否是GCP患者
            })
            this.$root.Bus.$on('doctws_update_isGcpPat', (isGcpPat) => { //监听住院患者-gcp标识的变更
                this.isGcpPat = isGcpPat;
            });
            this.basicDictionary();
            let idVisit = sessionStorage.getItem('receivePatientParams') ? JSON.parse(sessionStorage.getItem('receivePatientParams')).idVisit : '';
            let idPat = sessionStorage.getItem('receivePatientParams') ? JSON.parse(sessionStorage.getItem('receivePatientParams')).idPat : '';
            idVisit = this.$route.query.idVisit ? this.$route.query.idVisit: idVisit;
            idPat = this.$route.query.idPat ? this.$route.query.idPat: idPat;
            if(idVisit){
                this.getPriceInfo(idVisit);
                this.getValIsGcpPat({
                    idVisit,
                    idPat
                }); //获取患者是否是GCP患者
            }
        },
        created(){
        },
        beforeDestroy(){
            // 把患者信息置空
            this.docPatientParams({
                docPatientParams: {}
            })
        },
        components: {
            HisAddAllergy,
            Skeleton,
            informationDialog
        },
        computed: {
            ...mapGetters(["showBannerStatus", "routerPath"]),
            isNurLevel(){
                if(this.patientInfo.sdNursingClass == null){
                    return false;
                }
                return true;
            },
            denyAllergyStr() {
                let arr = this.allergyForm.ppatList.filter( v => v.sdAllergyType == this.CONSTANT.DENY_ALLERGY_TYPE);
                return !!arr.length
            },
            // 过敏史
            cmptAllAllergyDataStr(){
                return this.allergyForm.allAllergyDataStr ? this.allergyForm.allAllergyDataStr: '无';
            },
            // 入院日期
            cmptDtEntry(){
                return this.patientInfo.dtAccept ? this.patientInfo.dtAccept.split(' ')[0] : ''
            },
            // 入院天数
            cmptDays(){
                return this.patientInfo.days ? '('+this.patientInfo.days+')' : ''
            },
            // 手术状态
            cmptOperationDays(){
                // 0-当日手术 1-明日手术 -1-术后一天 -14-术后14天
                // 术后大于14天，就不显示
                return (this.patientInfo.operationDays <= 1 && this.patientInfo.operationDays >= -14) ? this.patientInfo.operationDesc : '';
            },
            // 费别
            cmptChargeTypeCode(){
                return this.patientInfo.chargeTypeCode == this.CONSTANT.OUTPEXCESS_CHARGETYPECODE ? "医保": this.patientInfo.chargeTypeCode == '9'? '商保' : "自费"
            },
            getMuniMedIns(){
                return this.patientInfo.chargeTypeCode == this.CONSTANT.OUTPEXCESS_CHARGETYPECODE
            }

        },
        filters: {
            currency: function(value) {
                return value ? value : '0.00';
            }
        },
        methods: {
            ...mapMutations({
                docPatientParams: 'SET_DOCPATIENTPARAMS',
                setShowBannerStatus: 'SET_SHOWBANNERSTATUS'
            }),
            showPatientInfo(){
                this.infoMsg.dialogVisible = true;
                //埋点
                this.getBuryingPoint('基本信息查看');
            },
            //  初始界面加载
            initPatient () {
                this.getPatVisitInfo()
            
                this.initAllergy();
                this.bedCode = this.$route.query.bedCode;
            },
            //查询病案首页医疗付费方式
            getPaymentMethod() {
                this.$axios.get('/adapter/paymentMethod/getPaymentMethod', {
                        visitId: this.patientInfo.visitTimes,
                        patientId: this.patientInfo.patCode,
                    }).then(res => {
                        if (res.success) {
                            let myData = res.data
                            for(let k of Object.keys(myData)){
                                this.patientInfo[k] = myData[k]
                            }
                            console.log(this.patientInfo,24);
                            this.$forceUpdate()
                            // 把患者信息存储到vuex的住院医生患者变量中
                            this.docPatientParams({
                                docPatientParams: this.patientInfo
                            })
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
                    })
            },

            getPriceInfo(idVisit = ''){
                this.$axios.get("/reg/remain/findVisitMoney", {
                    idVisit: idVisit|| this.idVisit
                }).then(res => {
                    if (res.success) {
                        this.priceInfo = res.data;
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },
            //查询过敏史
            initAllergy(idPat = "") {
                this.$axios.post("/reg/allergy/findByIPat", {
                    idPat: this.$route.query.idPat || idPat
                }).then(res => {
                    if (res.success) {
                        this.allergyForm.ppatList = res.data || [];
                        if (res.data.length == 0) {
                            this.allergyForm.allAllergyDataStr = '';
                        } else {
                            let allVatMrData = [];
                            res.data.map((c, m) => {
                                let itmStr = c.allergyReaction ?  c.allergyName + '[' + c.allergyReaction + ']' :  c.allergyName;
                                allVatMrData.push(itmStr);
                            })
                            this.allergyForm.allAllergyDataStr = allVatMrData.join('、')
                        }
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
                // this.$refs.HisAddAllergy.findAllergyByIdPat();
            },
            handleSwitch () { // 切换患者姓名和搜索框
                let vm = this;
                vm.flag = !vm.flag
            },
            submit () { // 按回车键提交患者查询信息
                let vm = this
                bus.$emit('backParam', vm.input) 
                vm.input = ''
            },
            // 获取患者信息
            getPatVisitInfo(idVisit = "") {
                let params = {
                   idVisit: idVisit || this.idVisit,
                   idDept: this.getUserStorage().idDept,
                }
                this.infoLoading = true;
                this.queryIdVisit = params.idVisit;
                return this.$axios.get('/doctws/patManage/findPatByIdVisit', params).then(res => {
                        if (res.success) {
                            this.patientInfo = res.data;
                            this.initAllergy(res.data.idPat);
                            this.allergyForm.birthDay = this.patientInfo.dtBirth;
                            this.infoLoading = false;
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
                    }).then(res=>{
                        this.getPatVisitTime()
                    })
            },
            getPatVisitTime(){
                return this.$axios.get('/reg/visitIn/findByIdVisit', {
                    idVisit: this.idVisit
                }).then(res=>{
                    if (res.success) {
                        let myData = res.data
                        this.patientInfo.visitTimes = myData.visitTimes
                    }else {
                            this.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
                }).then(res=>{
                    // this.getPaymentMethod()
                    this.$forceUpdate()
                    // 把患者信息存储到vuex的住院医生患者变量中
                    this.docPatientParams({
                        docPatientParams: this.patientInfo
                    })

                })
            },
            //基础字典
            basicDictionary() {
                let str = 'SD_ADMIT_CONDITION, SD_NURSING_CLASS';
                this.findSdData(str).then(data => {
                    let levelArr = data.SD_NURSING_CLASS;
                    let sickArr =  data.SD_ADMIT_CONDITION;
                    levelArr.map( v => {
                        this.getSdNursingClass[v.dataCode] = v.dataName;
                    })
                    sickArr.map( v => {
                        this.getSdAdmitCondition[v.dataCode] = v.dataName;
                    })
                });
            },
            getDiffSdAdmitCondClass(params){
                let classNam = ''
                switch(params){
                    case SICK_ZERO: 
                        classNam = 'clF73D47';
                        break;
                    case SICK_ONE:
                        classNam =  'clF73D47';
                        break;
                    case SICK_TWO: 
                        classNam = 'cl9743FC';
                        break;
                    case SICK_THREE: 
                        classNam = 'cl55AC57';
                        break;
                }
                return classNam;
            },
            getDiffClass(params){
                let classNam = ''
                switch(params){
                    case SPECIAL: 
                        classNam = 'item__nurse-level--0';
                        break;
                    case ONE:
                        classNam = 'item__nurse-level--1';
                        break;
                    case TWO: 
                        classNam = 'item__nurse-level--2';
                        break;
                    case THREE: 
                        classNam = 'item__nurse-level--3';
                        break;
                }
                return classNam;
            },
            showAllergyColor() {
                if(this.cmptAllAllergyDataStr === '无') return 'text--empty'
                if(this.denyAllergyStr) return 'text--deny'
                return ''
            },
            showOperationsDay(val){ // 展示手术标识
                if(val == 0 || val == 1 || val == -1){
                    return true;
                }
                return false;
            },
            //编辑过敏史
            hanlderEditAllergy() {
                this.allergyForm.allergyDialogVisible = true;
                this.allergyForm.isFromInp = true;
                this.allergyForm.idPat = this.patientInfo.idPat;
                this.$refs.HisAddAllergy.init();
                 //埋点
                this.getBuryingPoint('过敏史查看');
            },
            //切换小导航
            changeBannerStatus(data){
                this.setShowBannerStatus(data)
            },

            //上传
            downLoad(){
                // 设置上传病历弹窗展示
                bus.$emit('setMedicalUpload', true);
            },

            // 单独打开emr
            btnClickOpenEmr() {
                const { href } = this.$router.resolve({
                    path: "/doctorDocWriting",
                    query: {
                        isHisFlag: true
                    },
                });
                window.open(href, "_blank");
            },

            //获取患者是否是Gcp患者
            async getValIsGcpPat(params) {
                console.log('pid----getValIsGcpPat', params.idVisit)
                let result = false;
                const res = await this.$axios
                    .get("/reg/gcp/findPiPatGcpReg", {
                        idPat: params.idPat,
                        idVisit: params.idVisit
                    });
                if (res.success) {
                    result = (res.data || []).length > 0;
                }else{
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
                this.isGcpPat = result;
                this.$root.Bus.$emit('doctws_update_isGcpPat', this.isGcpPat);
            },

             //埋点处理
            getBuryingPoint(eventName, parmas = {}) {
                let obj = {
                    idPat: this.patientInfo.idPat,
                    idVisit: this.patientInfo.idVisit,
                    ...parmas
                }
                //埋点
                let parame = [{
                    eventDescription: eventName, //事件名字
                    properties:[obj],   //参数
                    title: '患者导航',   //模块
                    subTitle: '功能操作', //子模块
                    url: this.routerPath,
                }]
                console.log(66,parame);
                this.buryingPoint(parame, 'hospitalDoctor');
            },
        },
        watch:{
            patientId:{
                handler(val){
                    if(val){
                        this.idVisit = val
                        this.initPatient();
                    }
                },
                immediate:true
            },
            $route: {
                handler(cur) {
                  this.showUploadBtn = +cur.query.isShowEmrUpload ? true : false
                }
            }
        }
    }
</script>

<style src='./patientInfoDetail.scss' lang="scss" scoped></style>