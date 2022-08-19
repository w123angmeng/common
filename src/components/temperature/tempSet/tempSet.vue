<template>
    <!-- 体温单设置 -->
    <div class="tempSetDiv">
        <el-dialog title="体温单设置" :visible.sync="tempSetShow" :show-close=false :close-on-click-modal=false>
            <!-- <p class="titleCla"></p> -->
            <div class="listBox">
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px"
                    class="demo-ruleForm fontSizeCla">
                    <el-row>

                        <el-col :span=12 style="float:none;">
                            <el-form-item label="体温单标题" prop="name" class="titleName">
                                <el-input v-model="ruleForm.name"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span=12>
                            <el-form-item label="温度上限" prop="Upper_limit_tem">
                                <el-input v-model="ruleForm.Upper_limit_tem"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span=12>
                            <el-form-item label="温度下限" prop="lower_limit_tem">
                                <el-input v-model="ruleForm.lower_limit_tem"></el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :span=12>
                            <el-form-item label="脉搏上限" prop="Upper_limit_pulse">
                                <el-input v-model="ruleForm.Upper_limit_pulse"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span=12>
                            <el-form-item label="脉搏下限" prop="lower_limit_pulse">
                                <el-input v-model="ruleForm.lower_limit_pulse"></el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :span=12>
                            <el-form-item label="脉搏符号" prop="Symbol_pulse">
                                <el-select v-model="ruleForm.Symbol_pulse" placeholder="请选择脉搏符号">
                                    <el-option v-for='(item,index) in SymbolOptions' :label="item.label" :key='item.code' :value="item.label"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span=12>
                            <el-form-item label="心率符号" prop="Symbol_heart_rate">
                                <el-select v-model="ruleForm.Symbol_heart_rate" placeholder="请选择心率符号">
                                    <el-option v-for='item in SymbolOptions' :label="item.label" :key='item.code' :value="item.label"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span=12>
                            <el-form-item label="口温符号" prop="Symbol_mouth">
                                <el-select v-model="ruleForm.Symbol_mouth" placeholder="请选择口温符号">
                                    <el-option v-for='item in SymbolOptions' :label="item.label" :key='item.code' :value="item.label"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span=12>
                            <el-form-item label="腋温符号" prop="Symbol_axillary">
                                <el-select v-model="ruleForm.Symbol_axillary" placeholder="请选择腋温符号">
                                    <el-option v-for='item in SymbolOptions' :label="item.label" :key='item.code' :value="item.label"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span=12>
                            <el-form-item label="肛温符号" prop="Symbol_annal">
                                <el-select v-model="ruleForm.Symbol_annal" placeholder="请选择肛温符号">
                                    <el-option v-for='item in SymbolOptions' :label="item.label" :key='item.code' :value="item.label"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span=12>
                            <el-form-item label="物理降温符号" prop="phTmValue">
                                <el-select v-model="ruleForm.phTmValue" placeholder="请选择物理降温符号">
                                    <el-option v-for='item in SymbolOptions' :label="item.label" :key='item.code' :value="item.label"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span=12>
                            <el-form-item label="偏移量" prop="Offset">
                                <el-select v-model="ruleForm.Offset" placeholder="请选择偏移量">
                                    <el-option  label="2"  value="2"></el-option>
                                    <el-option  label="3"  value="3"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span=12>
                            <el-form-item label="刻度对应行数" prop="trCounts">
                                <el-select v-model="ruleForm.trCounts" placeholder="请选择刻度对应行数">
                                    <el-option  label="5"  value="5"></el-option>
                                    <el-option  label="10"  value="10"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        
                    </el-row>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hideDialog">取 消</el-button>
                <el-button class='' type="primary" @click="submitForm('ruleForm')">提交</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        props: {
            tempSetShow: {
                type: Boolean,
            }
        },
        data() {
            return {
                idOrg:'',
                ruleForm: {
                    name: '',
                    Upper_limit_tem: '',
                    lower_limit_tem: '',
                    Upper_limit_pulse: '',
                    lower_limit_pulse: '',
                    Symbol_pulse: '',
                    Symbol_heart_rate: '',
                    Symbol_mouth: '',
                    Symbol_axillary: '',
                    Symbol_annal: '',
                    Offset: '',
                    trCounts:'',
                    phTmValue:''
                },
                SymbolOptions:[
                    {
                        label:'红色实心圆',
                        code:'1',
                    }, {
                        label:'红色空心圆',
                        code:'2',
                    }, {
                        label:'红色X',
                        code:'3',
                    }, {
                        label:'蓝色实心圆',
                        code:'4',
                    }, {
                        label:'蓝色空心圆',
                        code:'5',
                    }, {
                        label:'蓝色X',
                        code:'6',
                    },
                ],
                rules: {
                    name: [{
                        required: true,
                        message: '请输入标题名称',
                        trigger: 'blur'
                    }, ],
                    Upper_limit_tem: [{
                        required: true,
                        message: '请输入温度上限',
                        trigger: 'change'
                    }],
                    lower_limit_tem: [{
                        required: true,
                        message: '请输入温度下限',
                        trigger: 'change'
                    }],
                    Upper_limit_pulse: [{
                        required: true,
                        message: '请输入脉搏上限',
                        trigger: 'change'
                    }],
                    lower_limit_pulse: [{
                        required: true,
                        message: '请输入脉搏下限',
                        trigger: 'change'
                    }],
                    Symbol_pulse: [{
                        required: true,
                        message: '请选择心率符号',
                        trigger: 'change'
                    }],
                    Symbol_heart_rate: [{
                        required: true,
                        message: '请选择脉搏符号',
                        trigger: 'change'
                    }],
                    Symbol_mouth: [{
                        required: true,
                        message: '请选择口温符号',
                        trigger: 'change'
                    }],
                    Symbol_axillary: [{
                        required: true,
                        message: '请选择腋温符号',
                        trigger: 'change'
                    }],
                    Symbol_annal: [{
                        required: true,
                        message: '请选择肛温符号',
                        trigger: 'change'
                    }],
                    Offset: [{   
                        required: true,
                        message: '输入偏移量',
                        trigger: 'change'
                    }],
                    trCounts: [{   
                        required: true,
                        message: '输入每刻度对应行数',
                        trigger: 'change'
                    }],
                    phTmValue: [{   
                        required: true,
                        message: '请选择物理降温符号',
                        trigger: 'change'
                    }],
                }
            };
        },
        created(){
            this.idOrg = this.getUserStorage().idOrg;
            this.getDefaultInfo()//获取默认信息
        },
        methods: {
            getDefaultInfo(){
                this.$axios.post('dict/conf/findByModuleName',{
                    moduleName:'体温单',
                    idConfigerControl:this.idOrg
                })
                .then(res => {
                    if(res.success){
                        res.data.map(item => {
                            switch(item.configerCode){
                                case 'tpListTitle':
                                    this.ruleForm.name = item.configerDefaultValue;
                                    break;
                                case 'tmpUpperLimit':
                                    this.ruleForm.Upper_limit_tem = item.configerDefaultValue;
                                    break;
                                case 'tmpLowerLimit':
                                    this.ruleForm.lower_limit_tem = item.configerDefaultValue;
                                    break;
                                case 'pulseUpperLimit':
                                    this.ruleForm.Upper_limit_pulse = item.configerDefaultValue;
                                    break;
                                case 'pulseLowerLimit':
                                    this.ruleForm.lower_limit_pulse = item.configerDefaultValue;
                                    break;
                                case 'pulseSign':
                                    this.ruleForm.Symbol_pulse = item.configerDefaultValue;
                                    break;
                                case 'heartRateSign':
                                    this.ruleForm.Symbol_heart_rate = item.configerDefaultValue;
                                    break;
                                case 'mouthTmpSign':
                                    this.ruleForm.Symbol_mouth = item.configerDefaultValue;
                                    break;
                                case 'axillaryTmpSign':
                                    this.ruleForm.Symbol_axillary = item.configerDefaultValue;
                                    break;
                                case 'analTmpSign':
                                    this.ruleForm.Symbol_annal = item.configerDefaultValue;
                                    break;
                                case 'timeOffset':
                                    this.ruleForm.Offset = item.configerDefaultValue;
                                    sessionStorage.setItem('tempTimeOffset',item.configerDefaultValue)
                                    break;
                                case 'rowsForScale':
                                    this.ruleForm.trCounts = item.configerDefaultValue;
                                    break;
                                case 'phyDownSign':
                                    this.ruleForm.phTmValue = item.configerDefaultValue;
                                    break;
                                default :
                            }
                           
                           
                        })
                    }
                })
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {  
                    if (valid) {
                        sessionStorage.setItem('tempTimeOffset',this.ruleForm.Offset)
                        this.$axios._post('dict/conf/updateConfiger',
                            [{
                                configerDefaultValue:this.ruleForm.name,
                                configerCode:'tpListTitle'
                            },{
                                configerDefaultValue:this.ruleForm.Upper_limit_tem,
                                configerCode:'tmpUpperLimit'
                            },{
                                configerDefaultValue:this.ruleForm.lower_limit_tem,
                                configerCode:'tmpLowerLimit'
                            },{
                                configerDefaultValue:this.ruleForm.Upper_limit_pulse,
                                configerCode:'pulseUpperLimit'
                            },{
                                configerDefaultValue:this.ruleForm.lower_limit_pulse,
                                configerCode:'pulseLowerLimit'
                            },{
                                configerDefaultValue:this.ruleForm.Symbol_pulse,
                                configerCode:'pulseSign'
                            },{
                                configerDefaultValue:this.ruleForm.Symbol_heart_rate,
                                configerCode:'heartRateSign'
                            },{
                                configerDefaultValue:this.ruleForm.Symbol_mouth,
                                configerCode:'mouthTmpSign'
                            },{
                                configerDefaultValue:this.ruleForm.Symbol_axillary,
                                configerCode:'axillaryTmpSign'
                            },{
                                configerDefaultValue:this.ruleForm.Symbol_annal,
                                configerCode:'analTmpSign'
                            },{
                                configerDefaultValue:this.ruleForm.Offset,
                                configerCode:'timeOffset'
                            },{
                                configerDefaultValue:this.ruleForm.phTmValue,
                                configerCode:'phyDownSign'
                            },{
                                configerDefaultValue:this.ruleForm.trCounts,
                                configerCode:'rowsForScale'
                            }])
                        .then(res => {
                            if(res.success){
                                this.$message({
                                    message: '提交成功',
                                    type: 'success',
                                })
                                this.$emit('closedown')

                            }else{
                                this.$message({
                                    message: res.message,
                                    type: "warning"
                                });
                            }
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            //关闭弹窗事件
            hideDialog() {
                this.$emit('closedown')
            },
        }
    }

</script>

<style lang="scss" src="./tempSet.scss">

</style>
