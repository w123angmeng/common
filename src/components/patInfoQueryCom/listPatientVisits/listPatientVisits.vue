<template>
    <!-- 患者就诊列表 -->
    <!-- <el-dialog title="患者就诊列表" :visible.sync="listVisitDialog" @close='closeDialog' width="800px"> -->
        <el-table height="440" :data="patVisitTable" :span-method="spanMethod" @cell-dblclick="dbClickHandle" 
            border stripe :header-cell-style="tableTitleStyle" :cell-style="cellStyle">
            <el-table-column property="patientName" label="姓名"></el-table-column>
            <el-table-column property="sexDesc" label="性别"></el-table-column>
            <el-table-column property="patientNo" label="患者号"></el-table-column>
            <!-- <el-table-column property="address" label="就诊类型"></el-table-column> -->
            <el-table-column property="admissionDatetime" label="就诊时间" width="140">
                
            </el-table-column>
            <!-- 原有版本 -->
            <!-- :class="scope.row.sspmCode != userInfo.idDept ? 'disableCss' : ''" -->
            <!-- 最新修改版本 -->
            <!-- :class="!scope.row.quoteFlag ? 'disableCss' : ''" -->
            <el-table-column property="sspmDesc" label="科室" :show-overflow-tooltip="true" min-width="150">
                <template slot-scope="scope">
                    <span :class="!scope.row.quoteFlag ? 'disableCss' : ''">{{scope.row.sspmDesc}}</span>
                </template>
            </el-table-column>
            <el-table-column property="wardDesc" label="病区">
                <template slot-scope="scope">
                    <span :class="!scope.row.quoteFlag ? 'disableCss' : ''">{{scope.row.wardDesc}}</span>
                </template>
            </el-table-column>
            <el-table-column property="dischargeDatetime" label="出院时间" width="140">
                <template slot-scope="scope">
                    <span :class="!scope.row.quoteFlag ? 'disableCss' : ''">{{scope.row.dischargeDatetime}}</span>
                </template>
            </el-table-column>
            <el-table-column property="mrnIp" label="病案号">
                <template slot-scope="scope">
                    <span :class="!scope.row.quoteFlag ? 'disableCss' : ''">{{scope.row.mrnIp}}</span>
                </template>
            </el-table-column>
            <!-- <el-table-column property="address" label="身份证"></el-table-column> -->
            <el-table-column property="micNo" label="医保卡" width="120" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <span :class="!scope.row.quoteFlag ? 'disableCss' : ''">{{scope.row.micNo}}</span>
                </template>
            </el-table-column>
            <el-table-column property="cardNo" label="就诊卡" width="120">
                <template slot-scope="scope">
                    <span :class="!scope.row.quoteFlag ? 'disableCss' : ''">{{scope.row.cardNo}}</span>
                </template>
            </el-table-column>
        </el-table>
    <!-- </el-dialog> -->
</template>
<script>
export default {
    props: {
        patVisitTable: {
            type: Array,
            default: []
        },
        // 引用该组件的？hlws、nurse、
        typeComponentRef: {
            type:String,
            default: "hlws"
        }
    },
    data() {
        return {
            userInfo: {}, // 当前登录信息
            tableTitleStyle: {
                fontSize: "14px",
                color: "#262626",
                background: "#FAFAFA"
            },
            cellStyle: {
                fontSize: "14px",
                height:'31px',
                color: "#595959",
                padding: "0px"
            },
        }
    },
    computed: {},
    created() {
        this.userInfo = this.getUserStorage();
    },
    mounted() {
    },
    methods: {
        // 双击单元格拿到当前行数据
        dbClickHandle(row) {
            // if (row.sspmCode) {
            //     if (row.sspmCode != this.userInfo.idDept) {
            //         return;
            //     }
            // }
            if(!row.quoteFlag) {
                return;
            }
            this.$emit("dbClickRow", row);
        },
        // 单元格合并
        spanMethod({ row, column, rowIndex, columnIndex }) {
            let arr = ["patientName","sexDesc","patientNo"]
            if (arr.includes(column.property)) {
                if (
                    rowIndex > 0 &&
                    row['patientNo'] ===
                        this.patVisitTable[rowIndex - 1]['patientNo']
                ) {
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                } else {
                    let rows = 1;
                    // 反之 查询相同的内容有多少行 进行合并
                    for (let i = rowIndex; i < this.patVisitTable.length - 1; i++) {
                        if (
                            row['patientNo'] ===
                            this.patVisitTable[i + 1]['patientNo']
                        ) {
                            rows++;
                        }
                    }
                    // 返回相同内容的行数
                    return {
                        rowspan: rows,
                        colspan: 1
                    };
                }
            }
            
        },
    }
}
</script>
<style lang="scss" scoped src="./listPatientVisits.scss">

</style>
