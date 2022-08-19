<template>
<div id="backPrint">
    <div class='printBackPage printFrontPage'>
        <div class="medicalRecordOuter">
        <div class="firstTitle">
            <div class="h3">{{ outHospital.orgName }}</div>
            <div class="h4">住院病案首页(二)</div>
            <div class='organizationalCode'>(组织机构代码: {{outHospital.orgCode}})</div>
        </div>
        <div class="baseInfo">
            <div class="baseInfoUp">
                <div>
                    姓名:
                    <span class="dataText">{{outHospital.patName}}</span>
                    <!-- <el-input v-model="outHospital.patName" placeholder="--" class="recordNumWidth"></el-input> -->
                </div>
                <div>
                    第
                    <span class="dataText">{{outHospital.visitTimes}}</span>
                    <!-- <el-input readonly v-model="outHospital.visitTimes" placeholder="--" class="inHospitalWidth"></el-input> -->
                    次住院
                </div>
                <div>
                    病案号
                    <span class="dataText">{{outHospital.visitCode}}</span>
                    <!-- <el-input v-model="outHospital.visitCode" placeholder="--" class="recordNumWidth"></el-input> -->
                </div>
            </div>
            <div class="baseInfoUp">
                <div>
                </div>
                <div>
                    识别号(ID)
                    <span class="dataText">{{outHospital.patCode}}</span>
                    <!-- <el-input v-model="outHospital.patCode" placeholder="--" class="IDWidth"></el-input> -->
                </div>
            </div>
        </div>
        <div class="contentInfo">
            <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableMid contentInfoTableTitle">
                    <div>手术操作编码</div>
                </div>
                <div class="contentInfoTableMidd contentInfoTableTitle">
                    <div>手术及操作日期</div>
                </div>
                <div class="contentInfoTableMin contentInfoTableTitle">
                    <div>手术级别</div>
                </div>
                <div class="contentInfoTableMax contentInfoTableTitle">
                    <div>手术及操作名称</div>
                </div>
                <!-- <div class="contentInfoTableMax contentInfoTableMaxLineHeight contentInfoTableTitle">
                    <div>手术及操作医师</div>
                    <div class="contentInfoTableInnerFlex">
                        <div>术者</div>
                        <div>Ⅰ助</div>
                        <div>Ⅱ助理</div>
                    </div>
                </div> -->
                <!-- 下面是删除contentInfoTableMaxLineHeight这个类 -->
                <div class="contentInfoTableMax contentInfoTableTitle">
                    <div>手术及操作医师</div>
                    <div class="contentInfoTableInnerFlex">
                        <div>术者</div>
                        <div>Ⅰ助</div>
                        <div>Ⅱ助理</div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableTitle">
                    <div>切口愈合等级</div>
                </div>
                <div class="contentInfoTableMid contentInfoTableTitle">
                    <div>麻醉方式</div>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableTitle">
                    <div>麻醉医师</div>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline" v-for='(item, index) in outHospital.ciFrontOpList' :key='index'>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <span class="color666 tableText">{{item.operationCode}}</span>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <span class="color666 tableText">{{item.dtOp}}</span>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight color666">
                    <span v-if="item.sdOperationLevelName">{{item.sdOperationLevelName}}</span>
                    <span v-else>{{operationList[index]}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <span class="color666">{{item.operationName}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div class="contentInfoTableHeight">
                            <span class="color666">{{item.empOpName}}</span>
                        </div>
                        <div class="contentInfoTableHeight">
                            <span class="color666">{{item.empAsst1Name}}</span>
                        </div>
                        <div class="contentInfoTableHeight">
                            <span class="color666">{{item.empAsst2Name}}</span>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <span class="color666">{{item.sdIncitpName}}</span>
                    /
                    <span class="color666">{{item.sdIncihgName}}</span>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <span class="color666">{{item.sdNarcosisModeName}}</span>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <span class="color666">{{item.empAnesName}}</span>
                </div>
            </div>
        

            <div class="contentInfoTable">
                <div class="contentInfoTableHeight positionSpan">
                    离院方式
                    <span class="dataText">{{outHospital.sdDischargeWay}}</span>
                    <span class="color666" v-for='item in sdDischargeWayList' :key='item.dataCode'>
                    {{item.dataCode+'.'+item.dataName}}
                    <template  v-if="item.dataCode == '2'">，拟接收医疗机构名称:<span class="dataText borderColor666">{{outHospital.nameOrgRec}}</span>
                    </template>
                    </span>
                    <!-- <el-select v-model="outHospital.sdDischargeWay" placeholder="" class="minnWidth">
                        <el-option v-for='item in outHospitalMethod' :label="item.label" :value="item.value"
                            :key='item.value'>
                        </el-option>
                    </el-select>1.医嘱离院 2.医嘱转院，拟接收医疗机构名称:<el-input v-model="outHospital.nameOrgRec2" placeholder="--"
                        :readonly='outHospital.sdDischargeWay != 2' class="bigWidth"></el-input> -->
                    <!-- <span v-if='!outHospital.nameOrgRec2'>--</span> -->
                </div>
            </div>
            <!-- <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableHeight positionSpan"> -->
                    <!-- <el-input v-model="outHospital.nameOrgRec3"
                        :readonly='outHospital.sdDischargeWay != 3' placeholder="--" class="bigWidth"></el-input> -->
                    <!-- <span v-if='!outHospital.nameOrgRec3'>--</span> -->
                <!-- </div>
            </div> -->
            <!-- <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableHeight color666">
                    4.非医嘱离院 5.死亡 9.其他
                </div>
            </div> -->
            <div class="contentInfoTable">
                <div class="contentInfoTableHeight color666">
                    是否有出院31天内再住院计划
                    <span class="dataText borderColor666">{{outHospital.fgAgain31}}</span>
                    1.否 2.有，目的:
                    <span class="dataText borderColor666">{{outHospital.desAgainPps}}</span>
                    <!-- <el-select v-model="outHospital.fgAgain31" placeholder="" class="minnWidth">
                        <el-option v-for='item in outHospitalInPlanOption' :label="item.label" :value="item.value"
                            :key='item.value'></el-option>
                    </el-select>1.无 2.有 -->
                </div>
                <!-- <div class="contentInfoTableHeight positionSpan">
                    目的:
                    <span class="dataText">{{outHospital.desAgainPps}}</span>
                    <el-input v-model="outHospital.desAgainPps" placeholder="--" class="bigWidth"></el-input> -->
                <!-- </div>  -->
            </div>
            <div class="contentInfoTable">
                <div class="contentInfoTableHeight color666">
                    颅脑损伤患者昏迷时间:入院前
                    <span class="dataText borderColor666">{{outHospital.comaDay1}}</span>天
                    <span class="dataText borderColor666">{{outHospital.comaHours1}}</span>小时
                    <span class="dataText borderColor666">{{outHospital.comaMinute1}}</span>分钟
                    &emsp;入院后
                    <span class="dataText borderColor666">{{outHospital.comaDay2}}</span>天
                    <span class="dataText borderColor666">{{outHospital.comaHours2}}</span>小时
                    <span class="dataText borderColor666">{{outHospital.comaMinute2}}</span>分钟
                    <!-- <el-input v-model="outHospital.comaDay1" placeholder="" class="minWidth"></el-input>天
                    <el-input v-model="outHospital.comaHours1" placeholder="" class="minWidth"></el-input>小时<el-input
                        v-model="outHospital.comaMinute1" placeholder="" class="minWidth"></el-input>分钟<el-input
                        v-model="outHospital.comaDay2" placeholder="" class="minWidth"></el-input>天<el-input
                        v-model="outHospital.comaHours2" placeholder="" class="minWidth"></el-input>小时<el-input
                        v-model="outHospital.comaMinute2" placeholder="" class="minWidth"></el-input>分钟 -->
                </div>
            </div>
            <div class="contentInfoTable">
                <div class="contentInfoTableMaxx contentInfoTableHeight">
                    重症监护室名称
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    进入重症监护室时间(_年_月_日_时_分_秒)
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight noBorder">
                    转出重症监护室时间(_年_月_日_时_分_秒)
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline" v-for='(item, index) in outHospital.ciFrontIcuList' :key="'Icu'+ index">
                <div class="contentInfoTableMaxx contentInfoTableHeight">
                    <span class="dataText tableText">{{item.deptName}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <span class="dataText tableText">{{item.changeOverTime}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight noBorder">
                    <span class="dataText tableText">{{item.rollOutTime}}</span>
                </div>
            </div>
            <div class="contentInfoTable ">
                <div class="contentInfoTableMaxx noBorder contentInfoTableHeight flexAlignCenter">
                    输血:
                    <span class="dataText">{{outHospital.bloodTrans == '2' ? '有' : '无'}}</span>
                </div>
            </div>
            <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableMaxx noBorder contentInfoTableHeight">
                    红细胞:
                    <span class="dataText">{{outHospital.redBloodCell}}</span>
                    <!-- <el-input :readonly='outHospital.bloodTrans==1' v-model="outHospital.redBloodCell" placeholder="--" class="minWidth"></el-input> -->
                    单位 血小板
                    <span class="dataText">{{outHospital.bloodCells}}</span>
                    <!-- <el-input :readonly='outHospital.bloodTrans==1' v-model="outHospital.bloodCells" placeholder="--" class="minWidth"></el-input> -->
                    人份 血浆
                    <span class="dataText">{{outHospital.bloodPlasma}}</span>
                    <!-- <el-input :readonly='outHospital.bloodTrans==1' v-model="outHospital.bloodPlasma" placeholder="--" class="minWidth"> -->
                    <!-- </el-input> -->
                    ml 全血:
                    <span class="dataText">{{outHospital.wholeBlood}}</span>
                    <!-- <el-input :readonly='outHospital.bloodTrans==1' v-model="outHospital.wholeBlood" placeholder="--" class="minWidth"></el-input> -->
                    ml 自体血回输:
                    <span class="dataText">{{outHospital.ioatBlood}}</span>
                    <!-- <el-input :readonly='outHospital.bloodTrans==1' v-model="outHospital.ioatBlood" placeholder="--" -->
                        <!-- class="minWidth"></el-input> -->
                    ml 其他
                    <span class="dataText">{{outHospital.elseBlood}}</span>
                        <!-- <el-input :readonly='outHospital.bloodTrans==1'
                        v-model="outHospital.elseBlood" placeholder="--" class="minWidth">
                    </el-input> -->
                </div>
            </div>
            <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableMaxx noBorder contentInfoTableHeight">
                    呼吸机使用时间:
                    <span class="dataText">{{outHospital.ventilatorUse}}</span>
                    <!-- <el-input v-model="outHospital.ventilatorUse" placeholder="--" class="midWidth">
                    </el-input> -->
                    小时
                </div>
            </div>
            <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableMaxx noBorder contentInfoTableHeight">
                    肿瘤分期:
                    T
                    <span class="dataText">{{outHospital.tnmT}}</span>
                    <!-- <el-input v-model="outHospital.tnmT" placeholder="--" class="midWidth"></el-input>-->
                    N
                    <span class="dataText">{{outHospital.tnmN}}</span>
                    <!-- <el-input v-model="outHospital.tnmN" placeholder="--" class="midWidth"></el-input> -->
                    M
                    <span class="dataText">{{outHospital.tnmM}}</span>
                    <!-- <el-input v-model="outHospital.tnmM" placeholder="--" class="midWidth">
                    </el-input> -->
                    临床分期:
                    <span class="dataText">{{outHospital.figo}}</span>
                    <!-- <el-input v-model="outHospital.figo" placeholder="--" class="midWidth">
                    </el-input> -->
                    期
                </div>
            </div>
            <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableMaxx noBorder contentInfoTableHeight">
                    日常生活能力评定量表得分:&emsp;
                    入院
                    <span class="dataText">{{outHospital.adlpiScoreAdmit}}</span>
                    <!-- <el-input v-model="outHospital.adlpiScoreAdmit" placeholder="--" class="midWidth" /> -->
                    &emsp; 出院
                    <span class="dataText">{{outHospital.adlpiScoreDischarge}}</span>
                    <!-- <el-input v-model="outHospital.adlpiScoreDischarge" placeholder="--" class="midWidth" /> -->
                </div>
            </div>
            <div style="border-top: 1px solid #000;">
                <div class="contentInfoTableMaxx contentInfoTableHeight noBorder" style="display: block;">
                    住院费用(元):&emsp;总费用
                    <span class="dataText">{{outHospital.totalAmount}}</span>
                    <span class="color666">
                        (自付金额:<span class="dataText borderColor666">{{outHospital.selfPaymentAmount}}</span>)
                    </span>
                </div>
                <FeeDetails></FeeDetails>
            </div>
        </div>
        </div>
    </div>
</div>
</template>

<script>
    import bus from '@/components/common/bus.js';
    import FeeDetails from './children/printFeeDetails';
    import cssom from './js/style.js';
    export default {
        data() {
            return {
                outHospital: {
                    orgName: '',
                    orgCode: '',
                    patName: '', // 患者姓名
                    visitTimes: '', // 第几次住院
                    visitCode: '', // 病案号
                    patCode: '', // 识别号
                    ciFrontOpList: [],
                    sdDischargeWay: '', // 离院方式值
                    // nameOrgRec2: '--', // 医嘱转院,拟接收机构
                    // nameOrgRec3: '--', // 医嘱转社区卫生服务机构,拟接收医疗机构名称
                    nameOrgRec: '', // 接收机构最终字段
                    fgAgain31: '', // 是否有出院31天再住院计划
                    fgAutopsy: '',  //是否尸检
                    desAgainPps: '', // 目的
                    ciFrontIcuList: [],
                    comaDay1: '', // 入院前昏迷天数
                    comaHours1: '', // 小时数
                    comaMinute1: '', // 分钟数
                    comaDay2: '', // 入院前昏迷天数
                    comaHours2: '', // 小时数
                    comaMinute2: '', // 分钟数
                    // dtCtcPreIp: '', // 入院前昏迷时间
                    // dtCtcLatIp: '', // 入院后昏迷时间
                    // ICUName1: '', // 重症监护室名称
                    // ICUName2: '', // 重症监护室名称
                    // ICUName3: '', // 重症监护室名称
                    // ICUTime1: '', // 进入重症监护室时间
                    // ICUTime2: '', // 进入重症监护室时间
                    // ICUTime3: '', // 进入重症监护室时间
                    // ICUTime4: '', // 进入重症监护室时间
                    // ICUTime5: '', // 进入重症监护室时间
                    // ICUTime6: '', // 进入重症监护室时间
                    bloodTrans: '1', // 是否有输血
                    redBloodCell: '', // 红细胞
                    bloodCells: '', // 血小板
                    bloodPlasma: '', // 血浆
                    wholeBlood: '', // 全血
                    ioatBlood: '', // 自体血回输
                    elseBlood: '', // 其他
                    ventilatorUse: '', // 呼吸机使用时间
                    tnmT: '', // 肿瘤分期
                    tnmN: '', // 肿瘤分期
                    tnmM: '', // 肿瘤分期
                    figo: '', // 临床分期
                    adlpiScoreAdmit: '', // 入院得分
                    adlpiScoreDischarge: '', // 出院得分
                    totalAmount: '--', // 总金额
                    selfPaymentAmount: '--' // 自付金额
                },
                ciFrontOpItem: {
                    dtOp: '',
                    empAnesName: '',
                    empAsst1Name: '',
                    empAsst2Name: '',
                    empOpName: '',
                    idEmpAnes: '',
                    idEmpAsst1: '',
                    idEmpAsst2: '',
                    idEmpOp: '',
                    idFrontOperation: '',
                    idFrontSheet: '',
                    operationCode: '--',
                    operationName: '',
                    sdIncihg: '',
                    sdIncihgName: '',
                    sdIncitp: '',
                    sdIncitpName: '',
                    sdNarcosisMode: '',
                    sdNarcosisModeName: '',
                    sdOperationLevel: '',
                    sdOperationLevelName: ''
                },
                ciFrontIcuItem: {
                    changeOverTime: '',
                    deptCode: '',
                    deptName: '--',
                    idDept: '',
                    idFrontIcu: '',
                    idFrontSheet: '',
                    rollOutTime: ''
                },
                sdIncihgNameList: [], //愈合等级
                sdIncitpNameList: [], //切口等级
                transfusionBloodOptions: ['无', '有'], //是否输血
                sdDischargeWayList: [], //出院方式
                outHospitalMethod: [{
                        label: '1',
                        value: '1'
                    },
                    {
                        label: '2',
                        value: '2'
                    },
                    {
                        label: '3',
                        value: '3'
                    },
                    {
                        label: '4',
                        value: '4'
                    },
                    {
                        label: '5',
                        value: '5'
                    },
                    {
                        label: '9',
                        value: '9'
                    }
                ],
                outHospitalInPlanOption: [{
                        label: '1',
                        value: '1'
                    },
                    {
                        label: '2',
                        value: '2'
                    }
                ],
                department: [],
                docDicLists: [], // 医生列表
                findNameAndCodeList: [], //手术名称列表
                operationList: ['', '', '', '', '', '', '', ''], //手术级别名称列表
                narcosisModeOptions: [], // 麻醉方式
            }
        },
        components: {
            FeeDetails
        },
        computed: {
            // dtCtcPreIp: '', // 入院前昏迷时间
            // dtCtcLatIp: '', // 入院后昏迷时间
            // dtCtcPreIp() {
            //   return this.outHospital.comaDay1 + '-' + this.outHospital.comaHours1 + '-' + this.outHospital.comaMinute1
            // },
            // dtCtcLatIp() {
            //   return this.outHospital.comaDay2 + '-' + this.outHospital.comaHours2 + '-' + this.outHospital.comaMinute2
            // }
        },
        watch: {
            'outHospital.bloodTrans': {
                handler: function (val, oldVal) {
                    // console.log(val)
                    if (val == '1') {
                        this.outHospital.redBloodCell = ''
                        this.outHospital.bloodCells = ''
                        this.outHospital.bloodPlasma = ''
                        this.outHospital.wholeBlood = ''
                        this.outHospital.ioatBlood = ''
                        this.outHospital.elseBlood = ''
                    }
                }
            },
            // 'outHospital.sdDischargeWay': {
            //     handler: function (val) {
            //         if (val == '2') {
            //             this.outHospital.nameOrgRec3 = ''
            //         } else if (val == '3') {
            //             this.outHospital.nameOrgRec2 = ''
            //         } else {
            //             this.outHospital.nameOrgRec2 = '--'
            //             this.outHospital.nameOrgRec3 = '--'
            //         }
            //     }
            // }
        },
        created() {
            let vm = this
            // vm.getDocDicData() //医生劣列表
            // vm.remoteMethod('');
            // this.findNameAndCode(); //查手术名称列表

            // this.operationListHandle(); //手术等级列表
            // bus.$off('submitEvent')
            // bus.$on('submitEvent', (msg) => {
            //     // console.log(msg)
            //     if (vm.outHospital.sdDischargeWay == '2') {
            //         vm.outHospital.nameOrgRec = vm.outHospital.nameOrgRec2
            //     } else if (vm.outHospital.sdDischargeWay == '3') {
            //         vm.outHospital.nameOrgRec = vm.outHospital.nameOrgRec3
            //     } else {
            //         vm.outHospital.nameOrgRec = ''
            //     }
            //     delete vm.outHospital.nameOrgRec2
            //     delete vm.outHospital.nameOrgRec3
            //     bus.$emit('submitBack', vm.outHospital)
            // })
            vm.initDicInfo();
            bus.$off('medicalRecordAllData');
            bus.$on('medicalRecordAllData', msg => {
                vm.listAssign(vm.outHospital, msg);  //对象赋值
                vm.outHospital = vm.objDefaultFormatter(vm.outHospital);

                // vm.outHospital = msg
                console.log(vm.outHospital,'反面')
                let ciFrontOpNum = 7 - vm.outHospital.ciFrontOpList.length, i = 0;
                let ciFrontIcuNum = 2 - vm.outHospital.ciFrontIcuList.length, j = 0;
                while (i <= ciFrontOpNum) {
                    vm.outHospital.ciFrontOpList.push(this.ciFrontOpItem);
                    i++;
                }
                while (j <= ciFrontIcuNum) {
                    vm.outHospital.ciFrontIcuList.push(this.ciFrontIcuItem);
                    j++;
                }
                if (msg.dtCtcPreIp) {
                    vm.outHospital.comaDay1 = msg.dtCtcPreIp.split('-')[0] || '--'
                    vm.outHospital.comaHours1 = msg.dtCtcPreIp.split('-')[1] || '--'
                    vm.outHospital.comaMinute1 = msg.dtCtcPreIp.split('-')[2] || '--'
                }
                if (msg.dtCtcLatIp) {
                    vm.outHospital.comaDay2 = msg.dtCtcLatIp.split('-')[0] || '--'
                    vm.outHospital.comaHours2 = msg.dtCtcLatIp.split('-')[1] || '--'
                    vm.outHospital.comaMinute2 = msg.dtCtcLatIp.split('-')[2] || '--'
                }
                // if (msg.sdDischargeWay == '2') {
                //     vm.outHospital.nameOrgRec2 = msg.nameOrgRec
                // } else if (msg.sdDischargeWay == '3') {
                //     vm.outHospital.nameOrgRec3 = msg.nameOrgRec
                // } else {
                //     vm.outHospital.nameOrgRec2 = '--'
                //     vm.outHospital.nameOrgRec3 = '--'
                // }
                vm.outHospital.bloodTrans = vm.outHospital.bloodTrans + ''
            })
            bus.$off('PrintPatInfo')
            bus.$on('PrintPatInfo', msg => {
                vm.outHospital.patName = msg.pat.patName
                vm.outHospital.patCode = msg.pat.patCode
                vm.outHospital.visitCode = msg.visit.visitCode
            })
        },
        mounted() {},
        methods: {
            //打印
            getBackParams () {
                let coverCss = ".printBackPage .contentInfoTableHeight {padding-top: 3px;padding-bottom: 3px;}"
                let cssBack = cssom.BackCss(coverCss);
                let domTree = document.getElementById('backPrint').innerHTML;
                return {
                    css: cssBack,
                    dom: domTree
                }
            },
            //查询手术字典编码
            async findNameAndCode() {
                let ajaxUrl = "dict/ciOperationDict/findNameAndCode";
                let resData = await this.$axios.post(ajaxUrl, {});
                if (resData.success) {
                    this.findNameAndCodeList = resData.data;
                } else {
                    this.$message({
                        type: 'error',
                        message: resData.message
                    })
                }
            },
            //切换手术操作
            // async operationChange(e, index) {
            //     console.log('下标:', index);
            //     // this.findNameAndCodeList.map((item) => {
            //     //     if (item.operationCode == e) {
            //     //         // this.formData.operationCode = item.operationCode;
            //     //         // this.formData.stdCodeSystem = item.stdCodeSystem;
            //     //         this.outHospital.ciFrontOpList[index].operationCode = item.operationCode
            //     //         // this.outHospital.ciFrontOpList[index].sdOperationLevel=
            //     //     }
            //     // })
            //     let ajaxUrl = 'dict/ciOperationDict/findOperationCode';
            //     let params = {
            //         operationCode: e
            //     };
            //     let resData = await this.$axios.post(ajaxUrl, params);
            //     if (resData.success) {
            //         console.log('详情信息：', resData.data);
            //         let ObjStr = this.copyObject(this.outHospital.ciFrontOpList[index]);
            //         ObjStr.operationCode = resData.data.operationCode;
            //         ObjStr.sdOperationLevel = resData.data.sdOperationLevel;
            //         ObjStr.sdOperationLevelName = resData.data.sdOperationLevelName;
            //         this.$set(this.outHospital.ciFrontOpList, index, ObjStr)
            //         this.$set(this.operationList, index, resData.data.sdOperationLevelName)
            //         // this.selectState = false;
            //         // this.$nextTick(() => {
            //         //     this.$set(this.outHospital.ciFrontOpList, index, ObjStr);
            //         //     this.selectState = true;
            //         // })
            //         // this.outHospital.ciFrontOpList[index].operationCode = resData.data.OPERATION_CODE;
            //         // this.outHospital.ciFrontOpList[index].sdOperationLevel = resData.data.SD_OPERATION_LEVEL;
            //         // console.log('赋值后1：', this.outHospital.ciFrontOpList[index].operationCode);
            //         // console.log('赋值后2：', this.outHospital.ciFrontOpList[index].sdOperationLevel)
            //         // 
            //     } else {
            //         this.$message({
            //             type: 'error',
            //             message: resData.message
            //         })
            //     }


            //     // console.log('接收:', this.outHospital.ciFrontOpList[index].operationCode)
            // },
            //手术等级列表
            // async operationListHandle() {
            //     // this.operationList = this.findNameAndCodeList; //测试数据
            //     let SD_OPERATION_LEVEL = 'SD_OPERATION_LEVEL';
            //     let resData = await this.findSdData(SD_OPERATION_LEVEL);
            //     this.operationList = resData.SD_OPERATION_LEVEL;
            // },
            remoteMethod(query = '') { // 科室的远程搜索
                this.selectDepartment(this.getUserStorage().idOrg, '', 'INS', '', query).then(data => {
                    this.department = data
                })
            },
            getDocDicData(name = '') {
                let vm = this
                vm.$axios
                    .get('/org/emp/listAssignEmpInfo', {
                        idOrg: this.getUserStorage().idOrg,
                        deptType: 'clinical',
                        empType: 'doctor',
                        selCondition: name
                    })
                    .then(res => {
                        if (res.success) {
                            vm.docDicLists = res.data
                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            })
                        }
                    })
            },
            async initDicInfo() { // 通用字典
                let vm = this
                let str = 'SD_DISCHARGE_WAY'; // 离院方式
                // let SD_INCIHG = 'SD_INCIHG'; //愈合情况
                // let SD_INCITP = 'SD_INCITP'; //切口等级
                vm.findSdData(str).then(data => {
                    // vm.narcosisModeOptions = data.SD_NARCOSIS_MODE;  //麻醉方式
                    vm.sdDischargeWayList = data.SD_DISCHARGE_WAY;
                })
                // sdIncihgNameList: [], //愈合等级
                //     sdIncitpNameList: [], //切口等级

                // let resData1 = await this.findSdData(SD_INCIHG);
                // let resData2 = await this.findSdData(SD_INCITP);
                // this.sdIncihgNameList = resData1.SD_INCIHG;
                // this.sdIncitpNameList = resData2.SD_INCITP;

            },
            //默认显示'--'
            objDefaultFormatter (obj, str) {
                if (!(obj instanceof  Object)) {
                    return;
                }
                let defaultstr = str || '--';
                let newObj = Array.isArray(obj) ? [] : {};
                for (let key in obj) {
                    if (key == 'diagnosisList' || key == 'ciFrontOpList' || key == 'ciFrontIcuList') {
                        if (!obj[key] || obj[key].length == 0) {
                           newObj[key] = [];
                        } else {
                           newObj[key] = this.objDefaultFormatter(obj[key], defaultstr);
                        }
                    } else if (obj[key] == null || obj[key] == 'null' || obj[key] == "" ) {
                        newObj[key]  = defaultstr;
                    } else if (typeof obj[key] == 'object') {
                      newObj[key] = this.objDefaultFormatter(obj[key], defaultstr);
                   } else {
                      newObj[key] = obj[key];
                   }
                }
                return newObj;
            },
            //拼装 -- 字典 key-排序字段
            concatBloodList (blood, str, key, name) {
                let strs = ''
               blood.sort((a,b) => {
                   return a[key] - b[key];
               }).forEach ((item) => {
                   strs +=  `${item[key]}.${item[name]} `
               })
               this[str] = strs;
            },
        }
    }

</script>
<style lang='scss' src='./css/printCss.scss'></style>
<style src='./css/printBack.css'></style>
