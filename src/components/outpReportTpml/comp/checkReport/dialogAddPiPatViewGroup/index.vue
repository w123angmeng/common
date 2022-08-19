<template>
    <el-dialog 
        title="患者入组" 
        :visible.sync="dialogAddPiPatViewGroupForm.visible"
        width="665px"
        :close-on-press-escape="false"
        :close-on-click-modal="false">
        <el-form :model="form" label-suffix="：">
            <el-form-item label="患者组">
                <el-select
                    v-model="form.name"
                    filterable
                    placeholder="请选择患者组">
                    <el-option
                        v-for="(item, index) in patGroupOptions"
                        :key="index"
                        :label="item.patViewGroupName"
                        :value="item.idPatView">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogAddPiPatViewGroupCancel">取 消</el-button>
            <el-button type="primary" @click="dialogAddPiPatViewGroupOk">确 定</el-button>
        </div>
    </el-dialog>
</template>
<script>
export default {
    props: ['dialogAddPiPatViewGroupForm'],
    data() {
        return {
            form: {
                name: ''
            },
            patGroupOptions: [], // 患者组下拉列表
            user: {}
        }
    },
    computed: {
        rowData() {
            return this.dialogAddPiPatViewGroupForm.rowData; 
        }
    },
    created () {
        this.user = JSON.parse(sessionStorage.getItem("user"));
        this.getPatGroupOptions();
    },
    methods: {
        // 获取患者所在科室的患者组下拉列表
        async getPatGroupOptions () {
            const res = await this.$axios
                .post('/doctws/patGroup/findAllGroupDeptById', {
                    idDept: this.rowData.idDept
                });
            if(res.success){
                this.patGroupOptions = res.data || [];
            }else{
                this.$message({
                    type: "warning",
                    message: res.message
                })
            }
        },

        // 患者入组弹框-确认入组
        async dialogAddPiPatViewGroupOk() {
            if(!this.form.name){
                this.$message.warning('请先选择患者组');
                return;
            }
            // 区分患者组是否为新创建的
            let targetRow = this.patGroupOptions.filter(v=>v.idPatView == this.form.name);
            targetRow = targetRow[0] ? targetRow[0] : {};
            let params = {
                idVisit: this.rowData.idVisit,
                idPatView: targetRow.idPatView,
                piPatViewQuotaList: targetRow.piPatViewQuotaList,
                piPatViewEventList: targetRow.piPatViewEventList,
                piPatViewDrugList: targetRow.piPatViewDrugList,
            };
            // 入组
            let res = await this.$axios
                ._post('/doctws/patGroup/addPiPatViewGroup', params);
            if(res.success && res.data == 1){
                this.$emit('dialogAddPiPatViewGroup_ok', 'ok');
                this.dialogAddPiPatViewGroupForm.visible = false;
            }
            if(!res.success){
                this.$message.error(res.message || '患者入组失败');
            }
        },

        // 患者入组弹框-取消入组
        dialogAddPiPatViewGroupCancel() {
            this.$emit('dialogAddPiPatViewGroup_cancel', 'cancel');
            this.dialogAddPiPatViewGroupForm.visible = false;
        },
    },
}
</script>
<style lang="scss" scoped>
</style>