<template>
    <div class="selectComWzp">
        <el-select
            v-if="isEdit"
            v-model="selectValue"
            placeholder="请选择"
            filterable
            remote
            reserve-keyword
            @change="idEmpChange"
            :remote-method="remoteMethod"
            :loading="loading"
            class="medicalSelectId"
        >
            <el-option value="0" disabled class="selectOptWrap">
                <p v-for="(item, index) in idEmpTitleList" :key="index" class="selectTableBox">
                    <span class="selectTableTit">{{item.label}}</span>
                </p>
            </el-option>
            <el-option value="1" disabled>
                <p class="selectTableBox">
                    <span class="selectTableTit"></span>
                </p>
            </el-option>
            <el-option
                v-for="item in parentList"
                :key="item.idEmp"
                :label="item.empName"
                :value="item.idEmp"
            >
                <span class="selectTableTit">
                    <tooltipOver :content="`${item.empCode ? item.empCode : ''}`"></tooltipOver>
                </span>
                <span class="selectTableTit"> 
                    <tooltipOver :content="`${item.empName ? item.empName : ''}`"></tooltipOver></span>
                <span class="selectTableTit">
                    <tooltipOver :content="`${item.empTitle ? item.empTitle : '' }`"></tooltipOver></span
                >
                <span class="selectTableTit"
                    ><tooltipOver :content="`${ item.deptName ? item.deptName : '' }`"></tooltipOver>
                </span>
            </el-option>
        </el-select>
    </div>
</template>
<script>
export default {
    props: {
        perInfoList: {
            type: Array,
            default: [],
        },
        isEdit: {
            type: Boolean,
            default: false,
        },
        idEmpValue: {
            type: String,
            default: "",
        },
        isMultipleQuto: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            loading: false,
            selectValue: this.idEmpValue,
            parentList: this.perInfoList,
            idEmpTitleList: [
                {label: "工号", prop: ""},
                {label: "姓名", prop: ""},
                {label: "职称", prop: ""},
                {label: "归属科室", prop: ""},
            ]
        };
    },
    created() {
        
        
    },
    mounted() {
        if (!this.isMultipleQuto) {
            this.getPerInfoCom();
        }
    },
    computed: {
    },
    watch: {
        idEmpValue(val) {
            this.selectValue = val;
        },
        perInfoList(arr) {
            this.parentList = arr;
        }
    },
    methods: {
        idEmpChange(value) {
            this.$emit("idEmpChange", value);
        },
        remoteMethod(query) {
            this.getPerInfoCom(query)
        },
        // 查询人员详情列表
        getPerInfoCom(query = '') {
            let params = {
                selCondition: query, // 查询条件
                sdEmpType: '01', // 人员类型 01医生 02护士
                sdEmpStatus: '1', // 1在职，2离职,3退休
                idEmp: '', // 人员id
                idDept: "" // 默认为空；当有值时，查询结果过滤掉自身
            }
            this.$axios.get(`/org/emp/getEmpInfo`,params).then(res=> {
                if (res.success) {
                    // console.log('组件调用')
                    this.parentList = res.data;
                }
            }).catch((err)=> {
                console.log(err)
            })
        },
    },
};
</script>
<style lang="scss" scoped>
.el-select-dropdown__list{
    position: relative;
    margin-top: 40px;
    .selectOptWrap{
        height: 40px;
        background: #ffffff;
        display: flex;
        border-top: 1px solid #E8E8E8;
        border-bottom: 1px solid #E8E8E8;
        position: absolute;
        z-index: 10;
        top: 0px;
    }
}

// .medicalSelectId{
//     /deep/ .el-input--suffix .el-input__inner{
//         padding: 0 20px 0 8px!important;
//     }
// }

.el-select-dropdown__item{
    padding: 0!important;
    display: flex;
    // border: 1px solid #E8E8E8;
    border-bottom: 1px solid #E8E8E8;
    border-top: 0px;
    .selectTableTit{
        padding: 0 4px;
        text-align: left;
        width: 110px!important;
        border-right: 1px solid #E8E8E8;
        
    }
    /deep/ .selectTableBox{
        width: 119px;
        color: #262626;
        font-size: 14px;
        height: 38px;
        line-height: 38px;
        background: #FAFAFA;
        border-bottom: 1px solid #eeee;
        display: flex;
        // padding: 0 4px!important;
    }
}
</style>
