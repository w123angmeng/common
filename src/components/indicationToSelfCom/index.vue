<template>
    <div class="indicationToSelfComs">
          <el-dialog title="提示" :visible.sync="indicationToSelfForm.dialogVisible" width="30%" :close-on-click-modal="false" :close-on-press-escape="false"  :show-close="false">
            <span>{{ toSelfTip }}</span>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="defineDrugs">确定</el-button>
                <el-button v-if="isInsuranceDrugFree" @click="toSelf">继续转自费</el-button>
                <el-button @click="cancel()">否</el-button>
                
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    props:{
        indicationToSelfForm:{
            type: Object,
            default: ()=>({})
        },
    },
    data() {
        return {
            isInsuranceDrugFree: true,  //医保转自费 -- 默认 转自费
        }
    },
    computed: {
       toSelfTip() {
        //    return `【${this.indicationToSelfForm.drugOrders.ordersName}】 无药品适应症信息，不可以选择自费！`
           return `【${this.indicationToSelfForm.drugOrders.ordersName}】 属于医保内无限定适应范围的药品，无法以自费方式开出！`
       },
       
    },
    async created() {
        console.log(this.indicationToSelfForm);
        await this.getInsuranceDrugFree();
    },
    methods: {

          /** 保内药品转自费  0 可自费  1 不可自费 */ 
        getInsuranceDrugFree() {
            let Obj = {
                systemId: this.CONSTANT.OUTP_SYSTEM_FLAG,  //门诊
                paramTypeCode: 'Insurance_Drug_Free',
            }
            return this.getDefaultValueBySystemParamCode(Obj).then((data)=> {
                let arr = data || [];
                if(arr.length) this.isInsuranceDrugFree = arr.includes('1') ? false : true;
                
            })
        },

        //确定
        defineDrugs() {
            this.indicationToSelfForm.self = false;
            this.close();
        },

        //转自费
        toSelf() {
            this.indicationToSelfForm.self = true;
             this.close();
        },
        //否
        cancel() {
            this.indicationToSelfForm.self = false;
            this.close();
        },
        close() {
            this.indicationToSelfForm.dialogVisible = false;
        },
    }
}
</script>
<style scoped lang="scss">

</style>
