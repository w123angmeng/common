<template>
    <div class='patientInfoDetail' v-if="showBannerStatus != '2'">
        <div class="bedInfo">
            <!-- {{patientInfo.patName}} -->
            {{patientInfo.bedCode}}床
        </div>
        <div class="patBaseInfo">
            <div class="patBaseInfoTop">
                <div class="patientName">{{patientInfo.patName}}</div> 
                <div class="nurse_special" v-if="!tabActName && isNurLevel">
                    <img v-if="patientInfo.sdNursingClass == 0" src="@/assets/images/inpNurse/nurse_special.svg" alt="">
                    <img v-if="patientInfo.sdNursingClass == 1" src="@/assets/images/inpNurse/nurse_one.svg" alt="">
                    <img v-if="patientInfo.sdNursingClass == 2" src="@/assets/images/inpNurse/nurse_second.svg" alt="">
                    <img v-if="patientInfo.sdNursingClass == 3" src="@/assets/images/inpNurse/nurse_third.svg" alt="">
                </div>
                <div>
                    <span>{{patientInfo.sdSexDesc}}</span>
                    <span  v-if="!tabActName">{{patientInfo.dtBirth}}</span>
                    <span>({{patientInfo.patAge}})</span>
                </div>
                <div><span class="fw600">患者ID：</span>{{patientInfo.patCode}}</div>
                <div v-if="tabActName&&patientInfo.sdAdmitCondition">
                    <span  class="fw600">病情：</span>
                    <span :class="getDiffSdAdmitCondClass(patientInfo.sdAdmitCondition)">{{getSdAdmitCondition[patientInfo.sdAdmitCondition]}}</span>
                </div>
                <div v-if="tabActName && isNurLevel" :class="'nurLevel_'+patientInfo.sdNursingClass">
                    <span class="fw600">护理等级：</span>
                     <span :class="getDiffClass(patientInfo.sdNursingClass)">{{getSdNursingClass[patientInfo.sdNursingClass]}}</span>
                    <!-- <span class="clF73D47" v-if="patientInfo.sdNursingClass == 0">特级</span>
                    <span class="cl9743FC" v-if="patientInfo.sdNursingClass == 1">一级</span>
                    <span class="cl55AC57" v-if="patientInfo.sdNursingClass == 2">二级</span>
                    <span class="cl1890FF" v-if="patientInfo.sdNursingClass == 3">三级</span> -->
                </div>
                <div>
                    <span class="fw600">过敏史：</span>
                    <span :class="allergyForm.allAllergyDataStr ? 'clF73D47' : 'cl000'">{{allergyForm.allAllergyDataStr ? allergyForm.allAllergyDataStr: '无'}}</span>
                    <span class="editAllergy" @click="hanlderEditAllergy" type="text">编辑</span>
                </div>
                
            </div>
            <div class="patBaseInfoBot">
                <div v-if="!tabActName">
                    <!-- <span class="fw600"> 病区|科室:</span> -->
                    {{patientInfo.idDeptAdmitName}}
                    <span class="distance" v-if="patientInfo.deptWardName">|</span>
                    <!-- <el-divider direction="vertical" v-if="patientInfo.deptWardName"></el-divider> -->
                    {{patientInfo.deptWardName}}
                </div>
                <div class="fw600" v-if="showOperationsDay(patientInfo.operationDays)">
                    <span class="cl1890FF" v-if="patientInfo.operationDays == 0">今日手术</span>
                    <span class="cl1890FF" v-if="patientInfo.operationDays == 1">明日手术</span>
                    <span class="cl1890FF" v-if="patientInfo.operationDays == -1">术后一天</span>
                </div>
                <div class="spaceLeft_10">
                    <span class="fw600">入院天数:</span>
                    <span  v-if="!tabActName">{{patientInfo.dtEntry ? patientInfo.dtEntry : '' }} {{patientInfo.days ? '('+patientInfo.days+')' : ''}}</span>
                    <span v-else>
                        {{patientInfo.days ? patientInfo.days : ''}}
                    </span>
                </div>
                 <!-- 费别编码 01自费 02医保 09商保 -->
                <div class="spaceLeft_16"> <span class="fw600">费别：</span>
                    {{patientInfo.chargeTypeCode == CONSTANT.OUTPEXCESS_CHARGETYPECODE ? "医保": patientInfo.chargeTypeCode == '9'? '商保' : "自费"}}
                </div>
                <!-- 已使用的费用包含未结算 / 预交金余额 -->
                <div class="cl1890FF spaceLeft_16">
                    ¥{{priceInfo.balance ? priceInfo.balance : '0.00'}} / <span class="cl1890FF">¥{{priceInfo.inpBill ? priceInfo.inpBill : '0.00'}}</span>
                    <span :class="priceInfo.preBalance < 0 ? 'clF73D47': 'cl55AC57'">(¥{{priceInfo.preBalance ? priceInfo.preBalance : '0.00'}})</span>
                </div>
                
                <!-- <div class="clF73D47 spaceLeft_21" v-if="!tabActName">
                    {{patientInfo.contagion ? patientInfo.contagion : ''}}
                    <el-divider direction="vertical" v-if="patientInfo.contagion"></el-divider>
                </div> -->
                
            </div>

             <!-- 过敏史弹窗 -->
            <HisAddAllergy :allergyForm.sync="allergyForm" ref="HisAddAllergy"></HisAddAllergy>
        </div>
        <div class="right-btns">
            <span class="pat-upload" @click="downLoad" v-if='showUploadBtn'>
               <i class="el-icon-upload"></i>
            </span>
            <span class="pat-upload emrIconBlue" @click="btnClickOpenEmr" v-if='showUploadBtn'>
               <i></i>
            </span>
            <span class="pat-upload pat-moveDown" @click="changeBannerStatus(2)">
               <i></i>
            </span>
        </div>
    </div>
</template>

<script>
    import bus from '@/components/common/bus.js'
    import { mapGetters, mapMutations } from 'vuex';
    import HisAddAllergy from '@/components/page/Common_WEB/hisAddAllergy/hisAddAllergy.vue';  //过敏史组件
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
                priceInfo: {} // 费用
            };
        },
        mounted() {
            let vm = this;
            bus.$off('docPatientInfo')
            bus.$on('docPatientInfo', msg => {
                this.getPatVisitInfo(msg.visitInfo.idVisit)
                this.bedCode = msg.visitInfo.bedCode;
                this.getPriceInfo(msg.visitInfo.idVisit);
            })
            this.basicDictionary();
            let idVisit = sessionStorage.getItem('receivePatientParams') ? JSON.parse(sessionStorage.getItem('receivePatientParams')).idVisit : '';
            idVisit = this.$route.query.idVisit ? this.$route.query.idVisit: idVisit;
            if(idVisit){
                this.getPriceInfo(idVisit);
            }
        },
        created(){
        },
        components: {
            HisAddAllergy,
        },
        computed: {
            ...mapGetters(["showBannerStatus"]),
            isNurLevel(){
                if(this.patientInfo.sdNursingClass == null){
                    return false;
                }
                return true;
            },
        },
        methods: {
            ...mapMutations({
                docPatientParams: 'SET_DOCPATIENTPARAMS',
                setShowBannerStatus: 'SET_SHOWBANNERSTATUS'
            }),
            //  初始界面加载
            initPatient () {
                this.getPatVisitInfo(this.$route.query.idVisit)
                this.initAllergy();
                this.bedCode = this.$route.query.bedCode;
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
                        if (res.data.length == 0) {
                            this.allergyForm.allAllergyDataStr = '';
                        } else {
                            let allVatMrData = [];
                            res.data.map((c, m) => {
                                allVatMrData.push(c.allergyName);
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
                this.$axios.get('/doctws/patManage/findPatByIdVisit', params).then(res => {
                        if (res.success) {
                            this.patientInfo = res.data;
                            // 把患者信息存储到vuex的住院医生患者变量中
                            this.docPatientParams({
                                docPatientParams: this.patientInfo
                            })
                            this.initAllergy(res.data.idPat);
                            this.allergyForm.birthDay = this.patientInfo.dtBirth;
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
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
                        classNam = 'clF73D47';
                        break;
                    case ONE:
                        classNam =  'cl9743FC';
                        break;
                    case TWO: 
                        classNam = 'cl55AC57';
                        break;
                    case THREE: 
                        classNam = 'cl1890FF';
                        break;
                }
                return classNam;
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
                this.allergyForm.idPat = this.patientInfo.idPat;
                this.$refs.HisAddAllergy.init();
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
        },
        watch:{
            patientId:{
                handler(val){
                    if(val){
                        this.idVisit = val
                        this.getPatVisitInfo();
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
<style lang="scss">
.patientInfoDetail {
    min-height: 64px;
    box-sizing: border-box;
    background: #fff;
    padding: 8px 16px;
    border-bottom: 1px solid #E9E9E9;
    font-size: 14px;
    line-height: 22px;
    opacity: 0.88;
    position: relative;
    display: flex;
    flex-direction: row;
    .bedInfo{
        font-size: 34px;
        font-weight: 600;
        color: #262626;
        padding: 0 18px;
        padding-left: 0;
        line-height: 42px;
        margin: auto 0;
    }
    .patBaseInfoTop{
        display: flex;
        flex-direction: row;
        >div{
            margin-right: 16px;
            color: #595959;
        }
        .patientName{
            font-weight: 700;
            color: #262626;
            margin-right: 8px;
        }
        .editAllergy {
            cursor: pointer;
            color: #1890FF;
            margin-left: 5px;
        }
        .nurse_special{
           display: flex;
           align-items: center;
           margin-right: 8px;
        }
    }
    .patBaseInfoBot{
        display: flex;
        flex-direction: row;
        padding-top: 6px;
        >div{
            margin-right: 16px;
            color: #595959;
        }
        .distance{
            padding: 0 8px;
        }
    }
        .searchName {
            position: absolute;
            top: 22px;
            span {
                font-size: 20px;
            }
        }
        .baseInfo {
            margin-left: 110px;
            margin-top: 10px;
            span {
                color: #363636;
                margin-right: 20px;
            }
            span:last-child {
                span {
                    font-size: 14px;
                }
            }
        }
        .nursing {
            margin-left: 110px;
            margin-top: 12px;
            margin-bottom: 16px;
            span {
                color: #363636;
                font-size: 14px;
                margin-right: 20px;
            }
            span:last-child {
                span {
                    color: #FF6C6C;
                    font-size: 14px;
                    margin-right: 0; 
                }
                .nursingAllergy {
                    display: inline-block;
                    vertical-align: top;
                    width: 300px; // 暂时写宽度大于300px时显示省略号
                    overflow: hidden;
                    text-overflow:ellipsis;
                    white-space: nowrap;
                }
            }
        } 
    .el-input {
        width: 110px;
    }
    .el-input .el-input--small {
        display: inline;
    }
    .right-btns {
        position: absolute;
        overflow: hidden;
        right: 10px;
        top: 0;
        .pat-upload {
            height: 32px;
            width: 32px;
            display: block;
            text-align: center;
            box-sizing: border-box;
            padding-top: 8px;
            float: left;
            cursor: pointer;
            i {
                font-size: 18px;
                color: #1890FF;
               }
            }
            .pat-moveDown {
                padding-top: 9px;
                i {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background: #EEFAFF url("../../../../assets/images/inpNurse/toup.svg") no-repeat center;
                    background-size: 100% 100%;
                }
            }
            .emrIconBlue {
                padding-top: 9px;
                i {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background: #EEFAFF url("../../../../assets/images/inpNurse/emrIconBlue.svg") no-repeat center;
                    background-size: 100% 100%;
                }
            }
    }
    .el-divider--vertical {
        margin: 0 2px;
    }
}
// 护理等级箭头格式
// @mixin nurseLevelSty($url){
//     min-width: 60px;
//     height: 17px;
//     display: block;
//     display: inline-block;
//     font-size: 12px !important;
//     color: #fff;
//     background: url($url) no-repeat 0 -2px;
//     line-height: 17px;
//     padding-left: 6px;
//     // vertical-align: middle;
// }
// @mixin arrowSty($cl){
//     min-width: 52px;
//     height: 20px;
//     display: block;
//     display: inline-block;
//     font-size: 12px !important;
//     color: #fff;
//     line-height: 20px;
//     background: $cl;
//     position: relative;
//     top:-2px;
//     border-radius: 3px;
//     &::before{
//         content: "";
//         display: block;
//         position: absolute;
//         top: 0px;
//         left: -19px;
//         border: 10px solid;
//         border-color: transparent transparent $cl;
//         transform: rotate(-90deg);
//     }
// }
// .nurLevelCl_2{
//     @include arrowSty(#55AC57)
// }
// .nurLevelCl_3{
//     @include arrowSty(#1890FF)
// }
// .nurLevelCl_1{
//     @include arrowSty(#9743FC)
// }
// .nurLevelCl_0{
//     @include arrowSty(#F73D47)
// }


@mixin spaceLeft($px) {
    margin-left: $px;
}


// 字体颜色
// 病情/病危/特级
.clF73D47{
    line-height: 22px;
    display: inline-block;
    color: #FF4D4F;
    // font-weight: bold;
}
.cl1890FF{
    color: #1890FF;
}
// 一级病重
.cl9743FC{
    color: #9743FC;
}
// 病情一般
.cl55AC57{
    color: #55AC57;
}
.cl000{
    color: #000;
}
// 字体大小
.fz14{
    font-size: 14px;
}
.fz16{
    font-size: 16px;
}
.fw700{
    font-weight:700;
}
.fw600{
    font-weight:600;
}

</style>
    