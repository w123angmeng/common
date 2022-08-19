<template>
    <div class="transSelfDrugForm_wrap">
        <el-dialog
            title="医保适应症"
            :visible.sync="transSelfDrugForm.visible"
            append-to-body
            :close-on-click-modal="false"
        >
            <el-table
                :data="transSelfDrugForm.trSelfList"
                class=""
                :show-header="false"
                style="width: 100%">
                <el-table-column
                    prop="date"
                    show-overflow-tooltip
                    label="">
                    <template slot-scope="scope">
                        {{scope.row.clinicItemName}}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="name"
                    label=""
                    width="100">
                    <template slot-scope="scope">
                    <div>
                        <el-checkbox
                        v-model="scope.row.self"
                        class="bottomItem"
                        >自费</el-checkbox>
                    </div>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="address"
                    width="450"
                    label="">
                    <template slot-scope="scope">
                        <IndicationsCom :IndicationsForm="scope.row.IndicationsForm" :fromType="fromType"></IndicationsCom>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancleForceSelf">否</el-button>
                <el-button type="primary" @click="forceSelfHandler">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import IndicationsCom from "@/components/page/Common_WEB/outpIndicationsCom/indicationsCom.vue"; //适应症组件
export default {
    props:['transSelfDrugForm'],
    data () {
        return {
            fromType: 'mBar',
        }
    },
    components: {
        IndicationsCom
    },
    methods: {
        forceSelfHandler() {
            this.transSelfDrugForm.visible = false;
            this.$emit('forceSelfHandler')
        },
        cancleForceSelf() {
            this.transSelfDrugForm.visible = false;
        },
    },
    watch:{
        
    },
}
</script>
<style  lang="scss" src="./index.scss"></style>