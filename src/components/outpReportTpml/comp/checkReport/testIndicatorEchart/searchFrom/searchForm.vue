<template>
    <el-form ref="searchFrom" label-suffix=":" :inline="true" :model="formDataInline" class="searchForm flex v-center">
        <el-radio-group v-model="radio" class="common_radio_group" style="display:inline-block; margin-right: 10px;">
            <el-radio-button
                :label="item.label"
                v-for="(item, index) in radioList"
                :key="index"
                >{{ item.name }}
            </el-radio-button>
        </el-radio-group>
        <el-form-item v-if="radio == 'byTime'">
            <el-date-picker
                v-model="formDataInline.timeRange"
                type="daterange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                align="right">
            </el-date-picker>
        </el-form-item>
        <el-form-item v-if="radio == 'byNum'" label="次数" prop="num">
            <!-- <el-input type="number" v-model="formDataInline.num" placeholder="次数" style="width: 100px"></el-input> -->
            <el-input-number
                style="width: 100px;"
                v-model="formDataInline.num"
                placeholder="次数"
                :min="0"
                :precision="0"
                :controls="false">
            </el-input-number>
        </el-form-item>
        <el-form-item label="" style="min-width: 50px;">
            <span v-show="!resData.loading">总计{{resData.totalTimes}}次</span>
        </el-form-item>

        <el-button type="primary" size="small" class="fr common_button--fs-big" @click="clkSearch">查询</el-button>
    </el-form>
</template>
<script>
export default {
    props: ['formData', 'resData'],
    data(){
        return {
            formDataInline: {
                num: '',
                timeRange: ['','']
            },
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit('pick', [start, end]);
                    }
                }]
            },
            radio: "byNum",
            radioList: [
                {
                    label: "byNum",
                    name: "按次数",
                },
                {
                    label: "byTime",
                    name: "按时间",
                },
            ],
        }
    },
    watch: {
        'formData.num' (newValue, oldValue) {
            this.formDataInline.num = newValue;
        }
    },
    created () {
        this.formDataInline = {
            num: this.formData.num,
            timeRange: [this.formData.beginDate, this.formData.endDate],
        };
    },
    methods: {
        clkSearch() {
            let num = this.formDataInline.num && !isNaN(this.formDataInline.num) ? this.formDataInline.num : 10; // 无效数字传10
            let data = {
                searchType: this.radio, //查询方式
            };
            if(this.radio === 'byNum'){
                data = {
                    num: num
                }
            }else{
                this.formDataInline.timeRange = this.formDataInline.timeRange || ['',''];
                data = {
                    beginDate: this.formDataInline.timeRange[0],
                    endDate: this.formDataInline.timeRange[1],
                    num: 0, //按时间查询，固定传0
                }
            }
            this.$emit('search', data);
        }
    },
}
</script>
<style lang="scss" scoped>
    .searchForm{
        background: #FAFAFA;
        padding: 8px 16px;
        /deep/ .el-form-item--small.el-form-item{
            margin-bottom: 0;
        }
        /deep/ .el-input-number .el-input__inner {
            text-align: left;
        }
    }
</style>