<template>
    <div class="ordersCancel">
        <el-dialog 
            title="医嘱作废" 
            :visible.sync="ordersCancelForm.dialogCancelVisible" 
            :close-on-press-escape="false"
            :close-on-click-modal="false">
            <!-- <el-form class="cancel" :model="cancelTimeForm">
                <el-form-item label="作废原因">
                    <el-input v-model="cancelTimeForm.reason" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer cancelfoot">
                <el-button @click="handleCancelSubmit" type="primary">提交</el-button>
            </div> -->
            <span>是否作废该医嘱？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="hideDialog">否</el-button>
                <el-button type="primary" @click="handleCancelSubmit">是</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        props: {
            ordersCancelForm: {
                type: Object,
                default: () => { }
            },
            updateItem:{
                type: Object,
                default:()=>({})
            }
        },
        data() {
            return {
                cancelTimeForm: {
                    reason: '', //作废原因
                },
            }
        },
        methods: {
            hideDialog() {
                this.ordersCancelForm.dialogCancelVisible = false;
            },
            //提交
            handleCancelSubmit(){
                this.ordersCancelForm.dialogCancelVisible = false
                let cancelStopObj = {
                    stopTime: this.ordersCancelForm.stopTime?this.ordersCancelForm.stopTime:'',
                    idOrders: this.ordersCancelForm.idOrders,
                    sdClinicType: this.ordersCancelForm.sdClinicType, //服务类型
                    idForm:this.ordersCancelForm.idForm, //申请单id
                    row: this.updateItem
                }
                this.$emit('confirmSubmit',cancelStopObj)
            }
        }
    }
</script>
<style lang="scss" src="./ordersCancel.scss">
</style>