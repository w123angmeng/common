/** 医保多报销比例 */
<template>
    <el-dialog title="信息提示" class="reimbursement_container" :visible.sync="reimbursement.dialogVisible" width="60%" :before-close="cancle" :close-on-press-escape="false" :close-on-click-modal="false" append-to-body>
        <el-form ref="form" class="settingSize" :model="reimbursement" label-width="80px" label-suffix=":">
            <el-form-item label="诊断信息">
                {{getDiagnosisName}}
            </el-form-item>
            <div v-for="(item, key) in reimbursement.drugsDetailList" :key="key" class="space_border">
                <el-row>
                    <el-col :span="11">
                        <el-form-item label="药品名称">
                            {{item.clinicItemName}}
                        </el-form-item>
                    </el-col>
                    <el-col :span="3">
                        <div style="line-height:32px;">
                            <el-checkbox v-model="item.self" @change="handlerChange(item)" v-if="showSelf(item)" :disabled="item.isSelfDisabled">自费</el-checkbox>
                        </div>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="特殊用药" v-if="item.excessReimburseRatioFlag && isIncludesChargeType">
                            <el-radio-group v-model="item.specialDrugIndicator">
                                <el-radio :label="1" :disabled="item.self">符合</el-radio>
                                <el-radio :label="0" :disabled="item.self">不符合</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="医保信息">
                    <span>{{item.description || '无'}}</span>
                </el-form-item>
                <el-form-item label="系统信息" v-if="item.diagnosisArr && item.diagnosisArr.length">
                    <el-row>
                        <el-col :span="item.isHasLimitDay ? 20 : 24">
                             <div v-for="(v,idx) in item.diagnosisArr" :key="idx">
                                <template v-if="!isLimitDayType(v)">
                                    <div>{{v.description || '无'}}</div>
                                    <div class="flex h-sb msgInfo">
                                        <div class="warning">{{showMessageTitle(v)}}</div>
                                        <div class="superDrug" v-if="isShowSuper(v)" @click="openSuperPdf(v)">告知书</div>
                                    </div>
                                </template>
                            </div>
                        </el-col>
                        <!-- 限制天数 -->
                        <el-col :span="4" v-if="item.isHasLimitDay">
                            <div class="day-bord"> {{showLimitDaysMessage(item)}}</div>
                        </el-col>
                    </el-row>       
                </el-form-item>
            </div>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="cancle">取 消</el-button>
            <el-button type="primary" @click="submitDialog">确 定</el-button>
        </span>
    </el-dialog>   
</template>
<script>
/** reimbursement:{ // 医保多报销比例
        dialogVisible: false,
        diagnosisType: [], // 诊断信息
        drugsDetailList: [], // 药品信息兼容模板多药品
        chargeTypeCode: '' // 费别
    }
*/
export default {
    name: 'Reimbursement',
    props:{
        reimbursement:{
            type: Object,
            default:()=>({})
        }
    },
    data(){
        return {
        }
    },
    computed:{
        getDiagnosisName(){
            return this.reimbursement.diagnosisType.map(curr => curr.diagnosisName).join('、')
        },
        isIncludesChargeType(){
            let arr = [];
            if(this.isAtmeng){
                arr = [this.CONSTANT.OUTPEXCESS_CHARGETYPECODE,this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE_ATM]
            }else{
                arr = [this.CONSTANT.OUTPEXCESS_CHARGETYPECODE,this.CONSTANT.OUTPEXCESS_RMED_CHARGETYPECODE]
            }
            return arr.includes(this.reimbursement.chargeTypeCode)
        },
        //阿特蒙
        isAtmeng(){
            return this.$limits.isFun(this)
        },
        getTabooMsg(){
            let map = new Map();
            this.reimbursement.diagnosisType.filter(v=>v.idDiagnosis).map(item =>{
                map.set(item.idDiagnosis, item)
            }) 
            return map;
        },
        limitDaysType() {
            return '8';
        },
    },
    filters:{
    },
    created(){
        if(this.reimbursement.dialogVisible){
            this.init();
        }
    },
    methods:{
        init(){
            this.reimbursement.drugsDetailList.map(item =>{
                this.$set(item,'specialDrugIndicator',2);
                this.$set(item,'isHasLimitDay',false);  //限天数控制状态
                this.$set(item,'isSelfDisabled', item.self || item.isEdit); // 自费患者默认不可编辑，或 开医嘱编辑不可编辑

                if(item.diagnosisArr && item.diagnosisArr.length) {
                    let isDay = this.isShowLimitDays(item);
                    if(isDay && isDay.length) {
                        this.$set(item,'isHasLimitDay',true);  //限天数控制状态
                        this.$set(item,'limitDays',isDay[0].limitDays || 0);  //限天数
                    }
                }
            })
            
            console.log(this.reimbursement, );
        },
        cancle(){
            this.init();
            this.$emit('cancle');
        },
        submitDialog(){
            this.$emit('confirmClinic')
        },
        handlerChange(item){
            if(item.self){ // 勾选自费后清空特殊用药  1-符合，0-不符合，2-未设置
                this.$set(item,'specialDrugIndicator',2);
            }
        },
        showSelf(item){
            if(this.isAtmeng){
                return !!item.description
            }else{
                let sdConsLevel_BR = [this.CONSTANT.CONSTRainedLEVEL_4,this.CONSTANT.CONSTRainedLEVEL_5];
                return sdConsLevel_BR.includes(item.sdConstrainedLevel)
            }
        },
        // isHasSuper(drugName) {
        //     let str = '';
        //     this.CONSTANT.SUPER_INSTRUCTION_DRUG.map( v => {
        //         if(drugName.includes(v))  str = v
        //     })
        //     return str
        // },
        //是否显示超说明书
        isShowSuper(v) {
            // !!this.isHasSuper(item.clinicItemName)
            return this.isAtmeng && v.url
        },
        isLimitDayType(item ) {
            return item.sdDiagnosisClassType == this.limitDaysType
        },
        //是否显示限用天数
        isShowLimitDays(item) {
            let flag = item.diagnosisArr.filter(v => this.isLimitDayType(v) )
            return flag || []
        },
        //打开超说明书用药
        openSuperPdf(v) {
            // let drugName = this.isHasSuper(item.clinicItemName);
            // let pdfStr = `超说明书用药（${drugName}）知情同意书.pdf`
            // let ips = window.globalUrl.baseURL.split(':');

            // let newStr = `${ips[0]}:${ips[1]}/outp/${pdfStr}`
            // let urlencode = encodeURI(newStr);
            window.open(v.url, "_blank");
        },
        showMessageTitle(v){
            let str = '';
            if(v.sdDiagnosisClassType == '4'){
                str = `【不适症】与临床诊断（${this.getDiagnosisName}）不相关，可能存在超适应症用药；`
            }
            if(v.sdDiagnosisClassType == '5'){
                let title = v.idDiagnosisList.reduce((arr,ele)=>{
                    arr.push(this.getTabooMsg.get(ele).diagnosisName)
                    return arr;
                },[])
                str = `【禁忌】与临床诊断（${title.join('、')}）存在禁忌反应，可能存在禁忌用药；`
            }
            return str;
        },
        //限制天数文案
        showLimitDaysMessage(item) {
            let str = '';
            str = `最大限用 ${item.limitDays} 天`
            return str
        },
    }
}
</script>
<style lang="scss" scoped>
$border:1px solid #E9E9E9;
.reimbursement_container {
    .el-dialog .el-dialog__header{
        border: $border;
    }
    .settingSize{
        max-height: 300px;
        overflow-y: scroll;
    }
    .space_border{
        border-bottom: $border;
        &:last-child{
            border-bottom: 0;
            margin: 4px 0;
        }
    }
    .msgInfo{
        color: #92444D;
        font-size: 14px;
        font-weight: 700;
        .warning{
            width: 80%;
        }
    }
    .superDrug {
        margin-right: 30px;
        text-decoration: underline;
        cursor: pointer;
        box-sizing: border-box;
    }

    .day-bord {
        font-size: 14px;
        font-weight: 700;
    }
}
</style>