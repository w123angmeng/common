<template>
    <!-- 患者列表 -->
   <el-table height="440" :data="patVisitInfo" @cell-dblclick="dbClickHandle" 
        border stripe :header-cell-style="tableTitleStyle" :cell-style="cellStyle">
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column property="patName" label="姓名"></el-table-column>
        <el-table-column property="sdSexStr" label="性别"></el-table-column>
        <el-table-column property="patCode" label="患者号" width="160"></el-table-column>
        <el-table-column property="codeMrIp" label="病案号" width="140">
            
        </el-table-column>
        <el-table-column property="idNo" label="身份证" :show-overflow-tooltip="true" min-width="200">
            
        </el-table-column>
        <el-table-column property="insuranceNo" label="医保卡" width="120" :show-overflow-tooltip="true">
            
        </el-table-column>
        <el-table-column property="visitCardNo" label="就诊卡" width="140" :show-overflow-tooltip="true">
            
        </el-table-column>
        <el-table-column property="mobile" label="手机号" width="100" :show-overflow-tooltip="true">
            
        </el-table-column>
    </el-table>
</template>
<script>
export default {
    props: {
        patVisitInfo: {
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
                color: "#595959"
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
            if (row.sspmCode) {
                if (row.sspmCode != this.userInfo.idDept) {
                    return;
                }
            }
            this.$emit("dbClickPatListRow", row);
        },
        // 单元格合并
        spanMethod({ row, column, rowIndex, columnIndex }) {
            let arr = ["patName","sdSexStr","patCode"]
            if (arr.includes(column.property)) {
                if (
                    rowIndex > 0 &&
                    row["patCode"] ===
                        this.patVisitInfo[rowIndex - 1]["patCode"]
                ) {
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                } else {
                    let rows = 1;
                    // 反之 查询相同的内容有多少行 进行合并
                    for (let i = rowIndex; i < this.patVisitInfo.length - 1; i++) {
                        if (
                            row["patCode"] ===
                            this.patVisitInfo[i + 1]["patCode"]
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
<style lang="scss" scoped src="./patientList.scss">

</style>
