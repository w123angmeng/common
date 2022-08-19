<template>
    <el-dialog title="临床药物禁忌提示" class="cdcDrgusMsg" :visible.sync="cdcDrugsInfo.dialogVisible" width="40%" :close-on-click-modal="false" 
    :close-on-press-escape="false" :before-close="handleClose" append-to-body>
        <el-form :model="formData" label-suffix=":">
            <el-form-item label="试验编号">
                <span>{{formData.projectCode || '无'}}</span>
            </el-form-item>
            <el-form-item label="试验名称">
                <span>{{formData.projectName  || '无'}}</span>
            </el-form-item>
            <el-form-item label="禁忌药品">
                <span>{{getDrugsList || '无'}}</span>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose">关 闭</el-button>
        </span>
    </el-dialog>
</template>
<script>
export default {
    name: 'cdcDrgusMsg',
    props:{
        cdcDrugsInfo:{
            type: Object,
            default:()=>({})
        }
    },
    data(){
        return{
            formData:{},
            dialogVisible: false, 
        }
    },
    computed:{
        getDrugsList(){
            let list = [];
            this.formData.infos && this.formData.infos.map(item =>{
                item.drugs.map(v=>{
                    list.push(v.drugName)
                })
            })
            return list.join('、');
        }
    },
    created(){
        Object.assign(this.formData,this.cdcDrugsInfo.result);
    },
    methods:{
        handleClose(){
            this.cdcDrugsInfo.dialogVisible = false;
            this.$emit('cancleCdcMsg');
        }
    }
}
</script>
<style lang="scss">
.cdcDrgusMsg{
    .el-dialog {
        .el-dialog__header{
            border-bottom: 1px solid #E8E8E8;
        }
        .el-dialog__body{
            padding: 16px 20px 0;
        }
    }
}
</style>