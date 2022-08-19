<template>
    <div class="checkReportTpml flexColumn">
        <ReportTitle :row="row" :typeMap="typeMap" @lookTestOriginalReport="originReport" :showBtn="showBtn" :isInPatient="isInPatient" :isShowPdfUrl="isShowPdfUrl">
            <template slot="nodata" v-if="!showNoDataStatus">
                <div style="width: 100%;text-align: center;margin-top: 200px;" class="el-table__empty-text">
                    暂无数据
                </div>
            </template>
        </ReportTitle>
        
        <div class="reportContent" v-if="showNoDataStatus">
            <div class="currReportTop flexRow">
                <div>
                    <div class="currReportLi flexRow" v-for="(item,index) in currReportLi" :key="index">
                        <div class="reportLabel">{{item.text}}:</div>
                        <div class="reportCont">{{currReport[item.key]}}</div>  
                    </div>
                </div>
                <div class="abnormalImg" :class="{isAbnormal:currReport.isAbnormal}">
                    {{currReport.isAbnormal | isAbnormalFilter}}
                </div>
            </div>
            <div class="currReportBottom">
                <div class="currReportLi flexRow " v-for="(item,index) in currReportBottom" :key="index">
                    <div class="reportLabel" v-html="item.text"></div>
                    <div class="reportCont">{{currReport[item.key]}}</div>  
                </div>
            </div>
        </div>
        
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import ReportTitle from '../common/reportTitle';
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
            relaParam:{
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        components: {
            ReportTitle
        },
        data() {
            return {
                currReport:{},
                reportUrl:[],
                currReportLi:[
                    {
                        text:'检查目的',
                        key:'examObjective'
                    },
                    {
                        text:'相关化验',
                        key:'relevantLabTest'
                    },
                    {
                        text:'检查所见',
                        key:'description'
                    }
                ],
                currReportBottom:[
                    {
                        text:'印&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;象:',
                        key:'impression'
                    },
                    {
                        text:'建&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;议:',
                        key:'recommendation'
                    },
                ],
                atmPdfUrl: [], //阿特蒙新增pdf报告
            }
        },
        computed: {
            ...mapGetters(['routerPath']),
            isAtmeng() {
                return this.$limits.isFun(this)
            },
            showBtn(){
                return this.reportUrl.length > 0
            },
            isShowPdfUrl(){
                return this.atmPdfUrl.length > 0
            },
            showNoDataStatus() {
                let keys = ['relevantLabTest', 'description', 'impression', 'recommendation'];
                let idx = 0
                if(!Object.keys(this.currReport).length) return false
                keys.map( v => {
                    if(this.currReport[v]=== null || this.currReport[v] === '') idx ++
                })
                return idx != 4
            }, 
            isInPatient(){ //住院
                return this.relaParam.type === 'inPatient'
            },
            showPdfClass() {
                return '心电图'
            },
        },
        filters:{
            isAbnormalFilter(val){
                if(val == '1'){
                    return '阳'
                }
                return '阴'
            }
        },
        created() {
            
        },
        methods: {
            init(){
                this.currReport = {}
                this.reportUrl = []
                this.atmPdfUrl = []
                this.$axios
                    .get(this.relaParam.reqUrl, {
                        sdClinicType: this.row.sdClinicType,
                        testNo: this.row.testNo,
                        itemCode: this.row.itemCode,
                        idApply: this.row.idApply,
                    })
                    .then(res => {
                        if(res.data.length){
                            this.currReport = res.data[0]
                            // if(this.currReport.examClass === this.showPdfClass && this.isAtmeng) {
                            // if(this.currReport.examClass === this.showPdfClass) {
                            //     this.reportUrl = this.currReport.pdfUrl||[]
                            // } else {
                            //     this.reportUrl = this.currReport.jpgUrl||[]
                            // }
                            this.reportUrl = this.currReport.jpgUrl||[]
                            this.atmPdfUrl = this.currReport.pdfUrl||[]

                            this.$set(this.row,'reportDateTime',this.currReport.reportDateTime)
                            this.$set(this.row,'examClass',this.currReport.examClass)
                        } else {
                             this.currReport = {};
                        }
                    })
            },
            originReport(val){
                this.openReportUrl(val)
            },
            openReportUrl(val = '') {
                if(val){ // pdf报告
                    if (!this.atmPdfUrl.length) return
                    return this.atmPdfUrl.forEach(item=>{
                        window.open(item)
                    })
                }
                if (!this.reportUrl.length) return
                this.reportUrl.forEach(item=>{
                    window.open(item)
                })
                //埋点
                this.getInpBuryingPoint('原始报告查阅')
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
<style lang='scss' src='./inspectReport.scss'>
</style>