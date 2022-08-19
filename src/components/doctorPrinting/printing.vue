<template>
   <!-- <el-dialog class="printInfo" title="医嘱打印" :visible.sync="dialogPrint.dialogPrintVisible" width="415px" :before-close="cancel"  :close-on-click-modal="false"> -->
        <el-form class="printInfo" ref="formPrint" :model="printForm" label-width="90px" label-suffix="：" label-position="left" v-loading="isLoading">
            <el-form-item label="打印内容">
                <el-radio-group v-model="printForm.repeatIndicator" @change="handleChangeSign">
                    <el-radio :label="1">长期医嘱</el-radio>
                    <el-radio :label="0">临时医嘱</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="打印范围" class="printScope">
                <el-radio-group v-model="printForm.printType" @change="handlePrintScope">
                    <el-radio v-for="(item,idx) in printRange" :key="idx" :label="item.key" v-show="!(!printForm.repeatIndicator && idx == 3)">{{item.label}}</el-radio>
                </el-radio-group>
                <div class="page_inner">
                    <el-input placeholder="请输入" v-model="printForm.specifiPage" @input="(val)=>{printForm.specifiPage = val.replace(/\D|^0/g, '')}" style="width: 100px;">
                        <template slot="append">页</template>
                    </el-input> 
                    <div class="continuity">
                         <el-input placeholder="请输入" v-model="printForm.continuePage" :disabled="isDisabledPage" @input="(val)=>{printForm.continuePage = val.replace(/\D|^0/g, '')}" style="width: 100px;">
                            <template slot="append">页</template>
                        </el-input>
                         <el-input placeholder="请输入" v-model="printForm.continueLine"  :disabled="isDisabledLine" @input="(val)=>{printForm.continueLine = val.replace(/\D|^0/g, '')}" style="width: 100px;margin-left:4px;">
                            <template slot="append">行</template>
                        </el-input>
                    </div>
                      <!-- <el-checkbox v-model="printForm.printType" :label="5">续打重整</el-checkbox> -->
                </div>
            </el-form-item>
            <el-form-item class="right_btns">
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" :disabled="!idVisit" @click="validForm()" :loading="isLoading">打印</el-button>
            </el-form-item>
        </el-form>
    <!-- </el-dialog> -->
</template>
<script>
export default {
    props:{
        dialogPrint:{
            type: Object,
            default (){
                return {}
            }
        },
        source: {
            type: String,
            default: ''
        }
    },
    data(){
        return{
            printForm: {
                repeatIndicator: 1,
                printType: 6,
                specifiPage: '',
                continuePage: '',
                continueLine: '',
                limit: 25
            },
            printRange:[
                {key: 1, label: "全部"},
                {key: 2, label: "指定页"},
                {key: 6, label: "续   打"},
                {key: 4, label: "重整医嘱"},
                // {key: 5, label: "续打重整"},
            ],
            isDisabledPage: false,
            isDisabledLine: false,
            showDetails: {}, // 回显信息
            printMessage: {}, // 打印数据整合
            idVisit: '',
            continuePageArr: [], // 可续打的页码
            count: 0,
            isLoading: false,
        }
    },
    computed: {
        isFormNursePage() {
            return this.source == 'nursePage'
        }
    },
    created(){
        if(this.$route.query.idVisit){
            this.idVisit = this.$route.query.idVisit;
        }else{
            if(!this.isFormNursePage)  this.idVisit = this.dialogPrint.idvisit; // 来源于护士站弹窗
           
        }
        if(!this.isFormNursePage) this.handleChangeSign(1);
    },
    methods:{
        cancel(){
            this.$emit('cancel');
        },
        handleChangeSign(val,type = ''){
            if(!this.idVisit) return
            let obj = {
                idVisit: this.idVisit,
                repeatIndicator: val
            }
            this.isDisabledPage = false;
            this.isDisabledLine = false;
            this.count = 0; // 切换长临清空可续打页数
            if(!type){
                this.findContinueOrdersPrint(); // 切换查询续打
            }
            this.$axios.post('/doctws/orderPrint/findOrdersPrint', obj).then((res)=> {
                if(res.success){
                    this.showDetails = res.data;
                    if(Object.keys(this.showDetails).length > 0){
                        if(this.showDetails.pageNo){
                            this.isDisabledPage = true;
                        }
                        if(this.showDetails.lineNo){
                            this.isDisabledLine = true;
                        }
                        this.$set(this.printForm,'continuePage',this.showDetails.pageNo);
                        this.$set(this.printForm,'continueLine',this.showDetails.lineNo);
                    }else{
                        this.printForm.continuePage = '';
                        this.printForm.continueLine = '';
                    }
                }else{
                    this.$message({
                        type: 'warning',
                        message: res.message,
                    });
                }
            })
        },
        resetInput(){
            this.printForm.specifiPage = '';
            this.printForm.continuePage = '';
            this.printForm.continueLine = '';
        },
        handlePrintScope(val){
            this.resetInput();
            this.handleChangeSign(this.printForm.repeatIndicator, '1');
        },
        validForm(){
            if(this.printForm.repeatIndicator == void 0){
                return this.$message({
                    type: 'warning',
                    message: '请填写打印内容～',
                });
            }
            if(!this.printForm.printType){
                return this.$message({
                    type: 'warning',
                    message: '请填写打印范围～',
                });
            }
            if(this.printForm.printType == 2){
                if(!this.printForm.specifiPage){
                    return this.$message({
                        type: 'warning',
                        message: '请填写指定页页数～',
                    });
                }
            }
            if(this.printForm.printType == 6 || this.printForm.printType == 4){
                if(this.printForm.printType == 6 && (!this.printForm.continuePage || !this.printForm.continueLine)){
                    return this.$message({
                        type: 'warning',
                        message: '请填写续打页数行数～',
                    });
                }
                if(this.printForm.continueLine > this.showDetails.lineNo){
                    return this.$message({
                        type: 'warning',
                        message: '当前行数不可大于上次打印行数～',
                    });
                }
                if(this.printForm.continueLine > this.printForm.limit){
                    return this.$message({
                        type: 'warning',
                        message: '当前行数已超出限制！',
                    });
                }
                if(this.count < this.continuePageArr.length){
                    let str = '';
                    if(this.printForm.printType == 4 && this.showDetails.lineNo == 25){
                        str = `请放入【新纸】后，点击确定继续`;
                        console.log('提示语：',str);
                    }else{
                        str = `请插入第【${this.continuePageArr[this.count].continuePageno}页】纸后，点击确定继续`;
                    }
                    // return;
                    this.$confirm(str, '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(async() => {
                            this.printForm.continuePage = this.continuePageArr[this.count].continuePageno;
                            await this.submitForm();
                            this.count ++;
                        }).catch(() => {
                            this.$message({
                                type: 'info',
                                message: '已取消'
                            });
                        });
                }else{
                    this.$message({
                        type: 'warning',
                        message: '暂无可续打医嘱'
                    });
                }
                return;
            }
           this.submitForm();
        },
        findContinueOrdersPrint(){
            this.$axios.post('/doctws/orderPrint/findContinueOrdersPrint',{
                idVisit: this.idVisit,
                repeatIndicator: this.printForm.repeatIndicator
            }).then(res => {
                if(res.success){
                    this.continuePageArr = res.data;
                }else{
                    this.$message({
                        type: 'warning',
                        message: res.message,
                    });
                }
            })
        },
        setPrintInfo(){
            this.printForm.idVisit = this.idVisit;
            let sendPrintForm = JSON.parse(JSON.stringify(this.printForm));
            delete sendPrintForm.continueLine // 续打不需要传入行号
            return this.$axios.post('/doctws/orderPrint/orderPrint',sendPrintForm).then((res)=> {
                if(res.success){
                    let data = res.data;// 获取将要打印信息
                    let flag = false;
                    for(var key in data){
                        if(!data[key]){
                            flag = true;
                        };
                    }
                    if(flag){
                        this.$message({
                            type: 'warning',
                            message: '打印信息不存在~',
                        });
                        return {};
                    }
                    return res.data;
                }else{
                    this.$message({
                        type: 'warning',
                        message: res.message,
                    });
                    return {}
                }
            })
        },
        submitForm(){
            this.isLoading= true;
            Promise.all([this.setPrintInfo(),this.getOrderPrint()]).then((result)=>{
                // 整合要打印的数据
                if(Object.keys(result[0]).length > 0){ // 确保打印信息已获取
                    this.printMessage.printType = this.printForm.printType;
                    this.printMessage.repeatIndicator = this.printForm.repeatIndicator;
                    if(this.printForm.printType == 2){
                        this.printMessage.pageNo = this.printForm.specifiPage;
                    }else if(this.printForm.printType == 6){ // 续打
                        this.printMessage.pageNo = this.printForm.continuePage;
                        this.printMessage.lineNo = this.printForm.continueLine;
                    }else if(this.printForm.printType == 4){ // 重整
                        this.printMessage.pageNo = this.showDetails.pageNo;
                        this.printMessage.lineNo = this.showDetails.lineNo;
                    }else{
                        this.printMessage.pageNo = '';
                        this.printMessage.lineNo = '';
                    }
                    result[0].printVos.forEach(element => {
                        if(element.remark){
                            element.printOrdersName = `${element.printOrdersName} ${element.remark}`
                        }
                    });
                    let obj = {...result[0],...this.printMessage,...result[1]};
                    this.medicalOrderSheet.startPrint(this,obj);
                    // 打印完再赋值展示页面
                    let ciOrdersPrintEntity = result[0].ciOrdersPrintEntity;
                    if(ciOrdersPrintEntity){
                        if(this.printForm.printType == 2){
                            this.$set(this.printForm,'specifiPage',ciOrdersPrintEntity.pageNo);
                        }
                        // this.$set(this.printForm,'continuePage',ciOrdersPrintEntity.pageNo);
                        // this.$set(this.printForm,'continueLine',ciOrdersPrintEntity.lineNo);
                        if(ciOrdersPrintEntity.pageNo){
                            this.isDisabledPage = true;
                        }
                        if(ciOrdersPrintEntity.lineNo){
                            this.isDisabledLine = true;
                        }
                    }
                }
                this.isLoading= false;
            }).catch(err=>{
                this.isLoading= false;
            })
        },
        getOrderPrint() { 
            return this.findSdData('SD_ORDER_PRINTING').then(data => {
                return data;
            })
        },
    }
}
</script>
<style lang="scss" scoped>
    @mixin c59(){
        color: #595959;
    }
    @mixin c26(){
        color: #262626;
    }
    .printInfo{
        padding-bottom: 20px;
        .el-radio{
            font-weight: normal;
            @include c59;
            /deep/ .el-radio__input.is-checked .el-radio__inner::after {
                content: '';
                width: 9px;
                height: 4px;
                border: 2px solid #1890FF;
                border-top: transparent;
                border-right: transparent;
                text-align: center;
                display: block;
                position: absolute;
                top: 1px;
                left: 1px;
                vertical-align: middle;
                transform: rotate(-45deg);
                border-radius: 0px;
                background: none;
            }
            /deep/ .el-radio__input.is-checked .el-radio__inner{
                background: #fff;
            }
            /deep/ .el-radio__input.is-checked + .el-radio__label{
                @include c59;
            }
        }
        .printScope{
            .el-radio-group{
                display: flex;
                flex-direction: column;
                margin-top: 10px;
                width: 76px;
                .el-radio{
                    font-weight: normal;
                    margin:0 0 24px 0;
                    @include c59;
                    // &:last-child{
                    //     position: absolute;
                    //     right: 0;
                    //     bottom: 0;
                    // }
                }
            }
            /deep/ .el-form-item__content{
                display: flex;
            }
            /deep/ .el-input-group__append{
                padding: 0 8px;
                background: #fff;
                @include c26;
            }
            .page_inner{
                margin-top: 38px;
            }
            .continuity{
                margin: 12px 0 9px;
            }
            .el-checkbox{
                float: right;
                font-weight: normal;
                /deep/ .el-checkbox__input.is-checked + .el-checkbox__label{
                    @include c59;
                }
            }
            
        }
        .right_btns{
            text-align: right;
        }
        /deep/ .el-form{
            padding-bottom:24px;
        } 
    }
</style>