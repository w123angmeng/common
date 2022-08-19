<template>
    <div class="">
        <el-dialog
            title="权限管控"
            :visible.sync="authMsgListFlag"
            append-to-body
            :close-on-click-modal="false">
            <div>您不具备以下的开立权限</div>
            <el-table
                :data="authMsgList"
                class="forceSelfFlagClass"
                style="width: 100%">
                <el-table-column
                    show-overflow-tooltip
                    label="">
                    <template slot-scope="scope">
                        【{{clinicItemNameHandler(scope.row)}}】
                    </template>
                </el-table-column>
                <el-table-column
                    label="">
                    <template slot-scope="scope">
                        {{scope.row.errorMsg}}
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="authMsgHandler">关闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>


export default {
    props: {
        authMsgListFlag:{
            type: Boolean,
            default: false
        },
        authMsgList: {
            type: Array,
            default: ()=> ([])
        }
    },
    data() {
        return {

        };
    },
    methods: {
        clinicItemNameHandler(row){
            return row.ordNames ? row.ordNames[0]: row.ordersName.split(' ')[0]
        },

        authMsgHandler(){
            this.$emit('authMsgHandler')
        },
    }
  };

</script>

<style lang="scss" scoped>

</style>