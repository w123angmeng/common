<template>
    <div class="checkSpecReport">
        <ReportTitle :row="row" :typeMap="typeMap" v-if="showTitle" :isInPatient="isInPatient">
            <template slot="nodata">
                <div style="width: 100%;text-align: center;" class="el-table__empty-text">
                    暂无数据
                </div>
            </template>
        </ReportTitle>
        <el-image 
            v-for="(item,index) in srcList"
            :key="index"
            :src="item">
        </el-image>

    </div>
</template>

<script>
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
                srcList:[]
            }
        },
        computed: {
            showTitle(){
                return this.srcList.length === 0
            },
            isInPatient(){ //住院
                return this.relaParam.type === 'inPatient'
            },
        },
        created() {
           
        },
        methods: {
            init(){
                this.openPathologyReport(this.row)
            },
             //打开病理/特检报告
            openPathologyReport(row) {
                this.srcList = []
                this.$axios
                    .get(this.relaParam.reqUrl, {
                        sdClinicType: this.row.sdClinicType,
                        testNo: this.row.testNo,
                        itemCode: this.row.itemCode,
                        idApply: this.row.idApply,
                    })
                    .then(res => {
                        if (res.success) {
                            if(!res.data.length) {
                                this.$message({
                                    message: '没有对应的报告图片',
                                    type: "warning"
                                })
                            } else {
                                this.srcList = res.data[0].jpgUrl||res.data[0].pdfUrl||[]
                            }     
                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            });
                        }
                    })
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
<style lang='scss' src='./specReport.scss'>
</style>