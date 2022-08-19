<template>
    <div class="checkTestReports flexColumn">
        <ReportTitle :row="row" :typeMap="typeMap" @lookTestOriginalReport="lookTestOriginalReport" :showBtn="showBtn" :isInPatient="isInPatient"></ReportTitle>
        <div class="reportTable">
            <el-table
                :data="reportDetails"
                height="100%"
                stripe
                class="reportTestTable"
                :header-cell-style="tableTitleStyle"
                @row-dblclick="viewIndicatorsEcharts"
                :row-class-name="rowClass"
                :cell-style="cellStyle"
                border
                >
                <el-table-column
                    prop="reportItemName"
                    label="检验项目">
                    <template slot-scope="scope">
                        {{scope.row.reportItemName}}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="result"
                    label="结果"
                    >
                    <template slot-scope="scope">
                        {{scope.row.result}}
                        <i class="el-icon-top" style="color:#FF4D4F;" v-if="scope.row.abnormalIndicator=='H'" ></i>
                        <i class="el-icon-bottom" style="color:#1890FF;" v-if="scope.row.abnormalIndicator=='L'"></i>
                        <img src="@/assets/images/doctws/target_warning_yellow.svg" alt="" class="warning_icon" v-if="rowClass(scope) == 'crisisValue'">
                        <span class="error_txt" v-if="rowClass(scope) == 'errorMsg'">异</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="units"
                    label="单位"
                    >
                </el-table-column>
                <el-table-column
                    prop="referContext"
                    label="参考值">
                </el-table-column>
                <el-table-column
                    prop="mic"
                    label="MIC">
                </el-table-column>
                <el-table-column
                    prop="rad"
                    label="RAD">
                </el-table-column>
                <!-- <el-table-column
                    v-if="isInPatient"
                    prop="abnormalIndicator"
                    label="异常"
                    align="center"
                    width="80px">
                    <template slot-scope="scope">
                        <span v-if="scope.row.abnormalIndicator != 'M' "><img src="@/assets/images/inpDoctor/docOver_abnormal.svg" /></span>
                    </template>
                </el-table-column> -->
                <el-table-column
                    v-if="isInPatient"
                    prop="referContext"
                    label="操作"
                    width="100px">
                    <template slot-scope="scope">
                        <!-- 指标的关注状态，需要逐条向后端获取 -->
                        <!-- 指标数据非数值 || 当前科室没有患者组 || 当前患者没有患者组，不可以操作关注按钮 -->
                        <template v-if="scope.row.isStarLoaded">
                            <el-button v-if="!scope.row.isStar" :disabled="!isNumber(scope.row.result) || !currDeptHavePatGroup || !patGroupInfo.idPiPatView" class="btn" type="text" @click="star(scope.row)">
                                关注
                            </el-button>
                            <el-button v-else :disabled="!isNumber(scope.row.result) || !currDeptHavePatGroup || !patGroupInfo.idPiPatView" class="btn" type="text" @click="cancelStar(scope.row)">
                                取消关注
                            </el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 指标echart -->
        <TestIndicatorEchart v-if="testIndicatorEchartForm.visible" :testIndicatorEchartForm="testIndicatorEchartForm"></TestIndicatorEchart>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import ReportTitle from '../common/reportTitle';
    import TestIndicatorEchart from './testIndicatorEchart/index.vue';   // 检验指标曲线图
    export default {
        props: {
            row: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            typeMap:{
                type:Map,
                default(){
                    return new Map()
                }
            },
            relaParam: {
                type: Object,
                default: () => {
                    return {}
                }
            },
        },
        components: {
            ReportTitle,
            TestIndicatorEchart,
        },
        data() {
            return {
                tableTitleStyle: {
                    fontSize: "14px",
                    color: "#000",
                    height: "40px",
                    padding: "0",
                    background: "#f5f5f5"
                },
                cellStyle: {
                    fontSize: "14px",
                    height: "32px",
                    lineHeight: "32px",
                    padding: "0px",
                },
                reportDetails: [],
                // 指标曲线弹窗维护
                testIndicatorEchartForm: {
                    visible: false,
                },
                // 患者入组信息
                patGroupInfo: {
                    // idPiPatView 患者归属的患者组id
                },
            }
        },
        
        computed: {
            ...mapGetters(['currDeptHavePatGroup', 'routerPath']),
            isAtmeng() {
                return this.$limits.isFun(this)
            },
            isBren(){
                return this.$limits.isDiffBren(this)
            },
            showBtn(){
                if(!this.reportDetails.length) return false
                let pdfurlArr = this.reportDetails[0].pdfUrl;
                return pdfurlArr && pdfurlArr.length
            },
            isInPatient(){ //住院
                return this.relaParam.type === 'inPatient'
            },
            idVisit(){
                return this.$route.query.idVisit;
            },
            idPat(){
                return this.$route.query.idPat;
            },
        },
        created() {
        },
        methods: {
            init(){
                this.reportDetails = [];
                this.$axios
                    .get(this.relaParam.reqUrl, {
                        sdClinicType: this.row.sdClinicType,
                        testNo: this.row.testNo,
                        itemCode: this.row.itemCode,
                        idApply: this.row.idApply,
                    })
                    .then(res => {
                        if(res.data.length){
                            this.reportDetails = res.data
                            this.$set(this.row,'reportDateTime',this.reportDetails[0].reportDateTime)
                            if(this.isInPatient && this.idVisit){ //住院，支持患者入组、关注指标
                                this.storePatGroupInfo(); // 存储患者入组信息
                                this.getListIsStar(this.reportDetails); // 查询指标关注状态
                            }
                        }
                    })
            },
            //查看原始报告
            lookTestOriginalReport() {
                // if( !this.reportDetails.length ) return this.$message.warning('没有对应的图文报告');
                let pdfurlArr = this.reportDetails[0].pdfUrl;
                if(pdfurlArr && pdfurlArr.length) {
                    let agentip = '';
                    let agentmac = '';
                    let url = pdfurlArr[0];
                    this.getAgentMacAndIp().then(data => {
                        agentip = data.ip || '';
                        agentmac = data.mac || '';

                        let arr = url.split('ViewReport/');
                        let start = arr[0];
                        let queryArr = arr[1].split('/');
                        let queryObj = {}
                        queryArr.map( v => {
                            let one = v.split('=')
                            queryObj[one[0]] = one[1]
                        })
                        queryObj.mac = agentmac;
                        queryObj.ip = agentip;
                        let str = this.lookTestRecord(queryObj)
                        let newPdfUrl = start + 'ViewReport/' + str
                        
                        window.open(newPdfUrl)
                    })
                   

                } else {
                    this.$message.warning('没有对应的图文报告');
                }
            },

             //对象转 URL
            lookTestRecord(obj) {
                if (!obj && !Object.keys(obj).length) {
                    return "";
                } else {
                    var arr = [];
                    for (var key in obj) {
                        arr.push(key + "=" + obj[key]);
                    }
                    return arr.join("/");
                }
            },

            // 获取单个指标是否被关注
            async getItemIsStar (item) {
                let data = await this.batchUpdIsStar([item]);
                if(data.length > 0){
                    this.$set(item, 'isStar', data[0]);
                    this.$set(item, 'isStarLoaded', true); // 代表是否关注状态已加载完成
                }
            },

            // 批量设置指标关注状态
            async getListIsStar (list) {
                let data = await this.batchUpdIsStar(list);
                data.map((item, iIndex)=>{
                    this.$set(list[iIndex], 'isStar', item);
                    this.$set(list[iIndex], 'isStarLoaded', true); // 代表是否关注状态已加载完成
                })
            },

            // 批量获取指标是否被关注
            async batchUpdIsStar(list) {
                let result = [];
                
                let params = list.map(item=>{
                    return {
                        idVisit: this.idVisit,
                        quotaName: item.reportItemName,
                        quotaItemCode: item.reportItemCode
                    }
                });
                let res = await this.$axios
                    ._post('/doctws/patGroup/focusIs', params);

                if(res.success){
                    result = res.data || [];
                }else{
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
                return result;
            },

            // 存储患者入组信息
            async storePatGroupInfo () {
                let res = await this.$axios
                    .post('/doctws/patGroup/findByIdVisit', {
                        idVisit: this.idVisit
                    });
                
                if(res.success){
                    this.patGroupInfo = res.data;
                }else{
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
            },

            // 关注
            async star (row) {
                // 关注
                let res = await this.$axios
                    ._post('/doctws/patGroup/focusOnIndicatorsLab', {
                        'idVisit': this.idVisit,
                        'idPatView': this.patGroupInfo.idPiPatView,
                        'quotaFigure': row.result,
                        'quotaItemCode': row.reportItemCode,
                        'quotaName': row.reportItemName,
                        'quotaType': this.CONSTANT.TEST_TYPE, // 检验类型都传3
                        'quotaUnit': row.units
                    });
                if(res.data){
                    // 关注成功，刷新关注状态
                    this.getItemIsStar(row);
                    //住院埋点
                    this.getInpBuryingPoint('关注指标'); 
                }else{
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
            },

            // 取消关注
            async cancelStar (row) {
                let res = await this.$axios
                    .post('/doctws/patGroup/cancelFocusOnIndicatorsLab', {
                        'idVisit': this.idVisit,
                        'quotaName': row.reportItemName,
                        'quotaItemCode': row.reportItemCode
                    });
                if(res.data){
                    // 关注成功，刷新关注状态
                    this.getItemIsStar(row);
                    //住院埋点
                    this.getInpBuryingPoint('取消关注'); 
                }else{
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
            },

            // 是数值
            isNumber(val){
                return (val === 0 || (val && !isNaN(val)));
            },

            // 双击查看检验指标曲线（仅限住院）
            viewIndicatorsEcharts(row, column, event) {
                if(!this.isInPatient){ //非住院，不支持双击
                    return;
                }
                if(!this.isNumber(row.result)){ // 结果非数值，不支持查看检验指标曲线
                    return;
                }
                let rowData = {
                    curveName: row.reportItemName,
                    quotaItemCode: row.reportItemCode,
                    patientId: this.idPat,
                    visitId: this.idVisit,
                };
                this.testIndicatorEchartForm.visible = true;
                this.testIndicatorEchartForm.rowData = rowData;
                //住院埋点
                this.getInpBuryingPoint('指标双击'); 
            },
            rowClass(item){
                const {row} = item;
                let obj = {
                    'high': ['H'], // 偏高
                    'lower': ['L'], // 偏低
                    'crisisValue': ['*', 'LL', 'HH'], // 检验危机值
                    'errorMsg': ['E'] // 异常数据
                }
                for(const [key,val] of Object.entries(obj)){
                    if(val.includes(row.abnormalIndicator)){
                        return key;
                    }
                }
            },

             //埋点处理 -- 住院
            getInpBuryingPoint(eventName, parmas = {}) {
                if(!this.isInPatient) return   //住院埋点
                //埋点
                let parame = [{
                    eventDescription: eventName,
                    properties:[parmas],
                    title: '报告查询',   //模块
                    subTitle: '报告查阅', //子模块
                    url: this.routerPath,
                }]
                this.buryingPoint(parame, 'hospitalDoctor');
            },
        },
        watch: {
            row:{
                handler(val){
                    if(val){
                        this.init()
                    }
                },
                immediate:true
            }
        }
    }

</script>
<style lang="scss" scoped>
.checkTestReports{
    height: 100%;
    .reportTable{
        flex: 1;
        overflow: hidden;
        i[class^= 'el-icon']{
            font-size: 14px;
            vertical-align: middle;
        }
    }
    .el-table {
        /deep/ .high>td:nth-child(2){
            color: #E53935;
        }
        /deep/ .lower>td:nth-child(2){
            color: #2196F3;
        }
        /deep/ .crisisValue>td:nth-child(2){
            color: #FFA726;
            font-weight: bold;
        }
        /deep/ .errorMsg>td:nth-child(2){
            color: #757575;
        }
        .warning_icon,.error_txt{
            float: right;
            vertical-align: middle;
        }
        .error_txt{
            width: 20px;
            height: 20px;
            line-height: 20px;
            display: inline-block;
            color: #757575;
            background: #EEEEEE;
            border: 1px solid #BDBDBD;
            border-radius: 4px;
            text-align: center;
        }
    }
}
</style>