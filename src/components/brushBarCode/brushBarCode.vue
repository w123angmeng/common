<template>
    <div >
       <el-dialog
            title="高博二维码"
            :visible.sync="brushBarCodeForm.visible"
            width="350px"
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            class="brushBarCodeDialogs">

            <el-input ref="barCode" v-model="searchName"></el-input>
            <div class="">
                <el-button @click="cancelDialog">关闭</el-button>
            </div>
         </el-dialog>  
    </div>
</template>

<script>
export default {
    name:'brushBarCode',
    props:{
        brushBarCodeForm: {
            type: Object,
            default:{}
        },
    },
    data(){
        return {
            searchName: '',
            timeIndex: 0,
            lastTime: 0,
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.barCode.focus()
        })
    },
    computed: {
        empiOrgCode() {
            return this.$t('config.empiOrgCode')
        }
    },
    methods:{

        //刷高博二维码就诊
        getBrushBarCode() {
            let Obj = {
                    type: "Empi",
                    data: [{
                    empiId: this.searchName
                // empiId: "cY0BEng9IlAhR04Rl9aJpXxgiQd4X2Vntj9pImB1K6U398AEcC5JtgtKKRskbWdx4n1st9csouTj+Fj5Y+rlx4pT7cFbl+/2I8XVY/Fv12rUnB+3lSN9c/O5ukJcI9xQajgkSL/w7LhejjYdSCY5DFhQ/uQdxze1DzYedACiZTs=",
                }]
            }
            // http://10.95.103.240:8099/hl7/patInfo  //杨松本地
            this.$axios._post(window.globalUrl.empiBarCodeUrl + "/hl7/patInfo", Obj).then(res => {
                if (res.success) {
                    let list = res.data.empiSrcPatIndexList || [];
                    let filterCode = list.filter(v => v.idOrg === this.empiOrgCode);
                    if(filterCode.length) {
                        this.$emit('filterPatCode', filterCode[0])
                        this.cancelDialog();
                    } else {
                        this.$message.warning("无此患者的就诊信息!");
                        this.searchName = '';
                        this.$refs.barCode.focus();
                    }
                
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },

        //关闭弹窗
        cancelDialog() {
            this.brushBarCodeForm.visible = false;
        },
    },
    watch:{
        searchName: {
            handler(newval, oldVal) {
                // 判断扫码枪与键盘按下的区别
                if(!oldVal) this.lastTime = new Date().getTime();
                if(!newval) {
                    this.lastTime = 0;
                    this.timeIndex = 0;
                }
                var currTime = new Date().getTime();
                if(currTime - this.lastTime <= 320 && this.searchName.length > 20) {
                    this.timeIndex ++;
                    if(this.timeIndex > 1) return
                    setTimeout(()=> {
                        //刷条形码进行就诊
                        this.getBrushBarCode();
                    },1000)
                }
            }
        },
    }
}
</script>
<style lang="scss">
    .brushBarCodeDialogs .el-dialog {
        
        height: 220px;
    }
</style>
