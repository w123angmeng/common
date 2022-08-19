<template>
    <div class="testIndicatorEchartDialog_wrap">
         <el-dialog
            :title="dgTitle"
            :visible.sync="testIndicatorEchartForm.visible"
            width="765px"
            class="testIndicatorEchartDialog"
            :close-on-press-escape="false"
            :close-on-click-modal="false"> 
            <searchForm :formData="formData" :resData="resData" @search="getDetail"></searchForm>
            <template>
                <div v-show="!isEmptyData" class="dialog-container">
                    <div id="chartsInner" style="width:718px; height: 300px;"></div>
                </div>
                <div v-show="!loading && isEmptyData" class="flex" style="width:718px; height: 300px;">
                    <EmptyData></EmptyData>
                </div>
            </template>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" size="small" @click="cancelDialog" class="common_button--fs-big">关闭</el-button>
            </span> 
         </el-dialog>    
    </div>
</template>
<script>
import searchForm from './searchFrom/searchForm';
import EmptyData from '@/components/page/Common_WEB/emptyData';

export default {
    props: ['testIndicatorEchartForm'],
    components: {
        searchForm,
        EmptyData,
    },
    data() {
        return {
            dgTitle: '检验结果趋势图',
            rowData: '', //数据行，选中的 具体检验报告 的 检验项目
            formData: {
                num: 10, //最近次数
                beginDate: '', //报告时间段开始
                endDate: '', //报告时间段结束
            },
            resData: {
                totalTimes: 0,
                loading: true, //请求数据中...,只控制总计x次的显示
            },
            loading: true, //请求数据中...
            myChart: '',
            option: {
                xAxis: {
                    data: [], //横向坐标轴数据
                },
                series: {
                    data: [], //纵向坐标轴数据
                }
            },
            searchType: 'byNum', // 查询方式
        }
    },
    computed: {
        isEmptyData() { //查询结果无数据
            return !this.option.xAxis.data.length;
        }
    },
    created(){
    },
    async mounted () {
        this.rowData = this.testIndicatorEchartForm.rowData;
        this.dgTitle = `检验结果趋势图-${this.rowData.curveName}`
        this.$nextTick(()=>{
            this.initEcharts();
            this.getDetail({
                num: 10 //默认按次数查询10次
            });
        })
    },
    methods: {

        // 初始化图表
        initEcharts(){
            let dom = document.getElementById('chartsInner');
            this.myChart = this.$echarts.init(dom);
            // 指定图表的配置项和数据
            this.option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '5%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    // data: ['2015-08-03', '2015-08-08', '2015-08-13', '2015-08-18', '2015-08-23', '2015-08-28', '2015-09-02']
                    data: []
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: this.rowData.curveName,
                        type: 'line',
                        stack: this.rowData.curveName,
                        // data: [41, 42, 43, 41, 38, 40, 42, 43]
                        data: []
                    }
                ]
            };

            // 初始化图表
            this.myChart.setOption(this.option);
        },

        //重置页面数据
        resetPageState() {
            this.resData =  {
                totalTimes: 0,
                loading: true, //数据请求中
            };
            this.loading = true; //数据请求中
            let xAxisData =  [],
            series0Data = [];
            this.option.xAxis.data = xAxisData;
            this.option.series[0].data = series0Data;
            // 刷新图表展示
            this.myChart.setOption(this.option);
        },

        //获取详情
        async getDetail(filters = {num: 10}) {
            let url = '/doctws/applyReport/listReportItemQuota';
            this.searchType = filters.searchType ? filters.searchType : 'byNum'; //默认查询方式是按次数
            delete filters.searchType;

            let params = {
                pageIndex: 1,
                pageSize: filters.num - 0, //查询次数，按时间查询，传0
                patientId: this.rowData.patientId,
                visitId: this.rowData.visitId,
                reportItemCode: this.rowData.quotaItemCode, //指标code
            };

            this.formData = filters;
            params = Object.assign(params, filters);
            delete params.num;
            this.resetPageState();
            await this.$axios._post(url, [params]).then(res => {
                if(res.success){
                    let xAxisData =  [],
                    series0Data = [];
                    // 测试数据，用于查看样式
                    //xAxisData =  ['2019-08-03', '2019-08-08', '2019-08-13', '2019-08-18', '2019-08-23', '2019-08-28', '2019-09-02'];
                    //series0Data = [51, 52, 53, 51, 38, 50, 52, 53];

                    // 后端返回格式如下：
                    // var res_data = [{
                    //     '0101017': {
                    //         '2020-12-23': {},
                    //         '2020-12-23': {},
                    //     }
                    // }]
                    let resData = res.data ? res.data[0] : {};
                    Object.keys(resData).map(key=>{
                        resData = resData[key]
                    })
                    let firstRow = null;
                    Object.keys(resData).forEach((key, kIndex)=>{
                        if(kIndex === 0){
                            firstRow = resData[key];
                        }
                        let item = resData[key];
                        xAxisData.push(key);
                        series0Data.push(item.result);
                    });
                    this.option.xAxis.data = xAxisData;
                    this.option.series[0].data = series0Data;

                    let totalTimes = firstRow&&firstRow.totalTimes ? firstRow.totalTimes : 0;
                    this.resData =  {
                        totalTimes,
                        loading: false, //数据请求中
                    };
                    if(this.searchType == 'byNum'){
                        // 联动查询条件次数
                        if(filters.num && filters.num > totalTimes){
                            this.formData.num = totalTimes;
                        }
                    }

                    // 刷新图表展示
                    this.myChart.setOption(this.option);
                }else{
                    this.$message({
                        message: res.message,
                        type: 'warning'
                    })
                }
                this.loading = false; //数据请求中
            })
        },

        //关闭弹窗
        cancelDialog() {
            this.testIndicatorEchartForm.visible = false;
        },

    },
}
</script>
<style lang="scss" src="./index.scss"></style>
