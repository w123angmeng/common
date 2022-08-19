<template>
    <el-dialog 
        :title="title" 
        :visible.sync="signConfirmModelForm.visible"
        :width="width"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :before-close="signConfirmCancel"
        custom-class="signConfirmBox_w"
        append-to-body>
        <span v-if="signConfirmModelForm.tip" style="color: #262626">
            <i class="el-icon-warning" style="color: #BFBFBF"></i>
            <span class="tipFw">{{signConfirmModelForm.tip}}</span>
        </span>
        <el-form :model="ruleFormTest" :rules="rulesTest" ref="ruleFormTest" label-width="80px">
            <div class="itemFx">
                <el-form-item  label="用户工号" prop="empCode" style="width:240px;margin-top:20px">
                    <el-input
                        v-model.trim="ruleFormTest.empCode"
                        placeholder="用户工号"
                        @input="inputChangeSearchName"
                        @keyup.enter.native="signConfirmOk"
                    ></el-input>
                </el-form-item>
                <el-form-item  label="用户姓名" prop="empName" style="width:240px;margin-top:20px">
                    <el-input
                        v-model.trim="ruleFormTest.empName"
                        placeholder="用户姓名"
                        :readonly="true"
                        @keyup.enter.native="signConfirmOk"
                    ></el-input>
                </el-form-item>
            </div>
            <!-- <el-form-item label="密码" prop="password" style="width:300px">
                <el-input
                    ref="password"
                    type="password"
                    placeholder="密码"
                    prefix-icon="el-icon-lock"
                    v-model="ruleFormTest.password"
                    @keyup.enter.native="signConfirmOk"
                ></el-input>
            </el-form-item> -->
            <el-form-item label="执行时间" prop="ifCalcExeDate" style="width:300px;">
                <div class="itemFx">
                    <el-radio :label="'1'" v-model="ruleFormTest.ifCalcExeDate" @change="radioChangeEvent">
                        推荐：计划执行时间 +{{ruleFormTest.numOfMinutes}}分钟
                    </el-radio>
                    <el-radio :label="'0'" v-model="ruleFormTest.ifCalcExeDate" @change="radioChangeEvent" class="realExeBox">
                        <el-form-item prop="dtRealExecution">
                            <el-date-picker
                                class="elDateInput"
                                v-model="ruleFormTest.dtRealExecution"
                                type="datetime"
                                placeholder="选择日期时间"
                                format="yyyy-MM-dd HH:mm"
                                @change="changeDateHandler"
                                value-format="yyyy-MM-dd HH:mm">
                            </el-date-picker>
                        </el-form-item>
                    </el-radio>
                </div>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="signConfirmCancel">取 消</el-button>
            <el-button type="primary" @click="signConfirmOk">确 定</el-button>
        </div>
    </el-dialog>
</template>
<script>
export default {
    props: ['signConfirmModelForm'],
    data() {
        var checkRealExcution = (rule, value, callback)=> {
            if (this.ruleFormTest.ifCalcExeDate == 0) {
                if (value === '') {
                    callback(new Error('请选择日期时间'));
                } else {
                    callback();
                }
            } else {
                callback();
            }
            
        }
        return {
            ruleFormTest:{
                numOfMinutes: "", // 执行时间偏移分钟数
                ifCalcExeDate: "1", // 是否计算执行时间(1计算，0不计算)
                dtRealExecution: "", // 实际执行时间
                // password: "",
                empCode: "",
                empName: ""
            },
            rulesTest:{
                empCode: [
                    {
                        required: true,
                        message: "请输入用户工号",
                        trigger: "blur",
                    },
                ],
                password: [
                    {
                        required: true,
                        message: "请输入密码",
                        trigger: "blur",
                    },
                ],
                ifCalcExeDate: [
                    {
                        required: true,
                        message: "请选择执行时间",
                        trigger: "change",
                    }
                ],
                dtRealExecution: [
                    {
                        trigger: "change",
                        validator: checkRealExcution
                    }
                ]
            },
            is360: false,
            curDateTime: '',
            resAccountData: {},
        }
    },
    computed: {
        rowData() {
            return this.signConfirmModelForm.rowData; 
        },
        title() {
            return this.signConfirmModelForm.title || '签名确认';
        },
        width() {
            return this.signConfirmModelForm.width || '400px';
        },
    },
    created () {
        this.getSysTimeParams();
    },
    methods: {
        // 根据录入用户工号实时查询用户姓名
        async inputChangeSearchName() {
            let params = {
                empCode: this.ruleFormTest.empCode
            };
            let [errAccount, resAccount] = await this.awaitWrap(this.$axios.get("/org/emp/findEmpInfoByCode", params));
            if(errAccount){
                return false;
            }
            if (resAccount.success) {
                this.ruleFormTest.empName = resAccount.data.empName;
                this.resAccountData = resAccount.data;
            }
        },
        // 获取当前系统时间
        getNowTime(){
            this.getServerTime().then(time => {
                let dateTime = this.formatDateTime(new Date(time / 1000));
                this.ruleFormTest.dtRealExecution = dateTime.substr(0, 16);
            })
        },
        // 
        radioChangeEvent(val) {
            if (val == 0) {
                this.getNowTime();
            } else {
                this.ruleFormTest.dtRealExecution = "";
            }
        },
        // 更改时间默认选中
        changeDateHandler() {
            this.ruleFormTest.ifCalcExeDate = '0';
        },
        // 获取时间偏移参数
        getSysTimeParams() {
            let Obj = {
                systemId: this.CONSTANT.INP_NURSE_SYSTEM_FLAG,  // 住院护士系统id
                paramTypeCode: 'EXECUTION_TIME_OFFSET_MINUTES',
            }
            this.getDefaultValueBySystemParamCode(Obj).then((res)=> {
                if (res.length) {
                    this.ruleFormTest.numOfMinutes = res[0];
                }
            }).catch(err=> {
                console.log('获取系统参数有误',err)
            })
        },

        // 签名确认弹框-确认
        async signConfirmOk() {
            // let result = false;
            let formValid; //表单检验通过标识
            await this.$refs.ruleFormTest.validate(valid=> {
                formValid = valid;
            });
            if(!formValid){
                return false; //表单校验未通过，保存失败
            }
            //登陆接口
            this.is360 = this._mime(
                "type",
                "application/vnd.chromium.remoting-viewer"
            );
            if (this.isChrome() && this.is360) {
                // 兼容360浏览器写法
                let element = document.documentElement;
                if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                }
            }
            // let newObj = Object.assign({}, this.ruleFormTest);
            // newObj.password = this.$md5(newObj.password);
            // const [err, res] = await this.awaitWrap(this.$axios.post("upm/login", newObj));
            // const newObj = {
            //     userCode: this.ruleFormTest.empCode
            // }
            // const [err, res] = await this.awaitWrap(this.$axios._post("upm/findAccountByUserCode", newObj));
            // if(err){
            //     return false;
            // }
            // if(!res.success){
            //     this.$message.warning('请录入有效的账号信息！')
            //     return false; //登录校验未通过
            // }
            // const params = {
            //     empCode: this.ruleFormTest.empCode
            // };
            
            // const [errAccount, resAccount] = await this.awaitWrap(this.$axios.get("upm/findAccountInfo", params));
            // const [errAccount, resAccount] = await this.awaitWrap(this.$axios.get("/org/emp/findEmpInfoByCode", params));
            // if(errAccount){
            //     return false;
            // }
            if(!this.ruleFormTest.empName){
                // this.$message.warning('请录入有效的账号信息！')
                this.$message.warning('未查到用户工号信息，请重新输入！')
                return false; //登录校验未通过
            }
            // result = resAccount.data;
            let ruleParams = {
                ruleFormTest: this.ruleFormTest,
                verifyRes: this.resAccountData
            }
            this.signConfirmModelForm.visible = false;
            this.$emit('signConfirmModel_ok', ruleParams);
        },
        //检测是否是谷歌内核(可排除360及谷歌以外的浏览器)
        isChrome() {
            var ua = navigator.userAgent.toLowerCase(); //检测浏览器内核标识
            return ua.indexOf("chrome") > 1;
        },
        //测试mime
        _mime(option, value) {
            var mimeTypes = navigator.mimeTypes;
            for (var mt in mimeTypes) {
                if (mimeTypes[mt][option] == value) {
                    return true;
                }
            }
            return false;
        },

        // 签名确认弹框-取消
        signConfirmCancel() {
            this.$emit('signConfirmModel_cancel', 'cancel');
            this.signConfirmModelForm.visible = false;
        },
    },
}
</script>
<style lang="scss">
.signConfirmBox_w{
    .itemFx{
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .elItemBox{
        display: flex;
        flex-wrap: wrap;
        
    }
    .realExeBox{
        display: flex;
        align-items: center;
        .el-form-item--small.el-form-item{
            margin-bottom: 0!important;
        }
    }
    .tipFw{
        font-weight: bold;
    }
    .itemFx{
        .elDateInput{
            width: 156px!important;
        }
    }
    
    .el-dialog__header{
        border-bottom: 1px solid #E8E8E8;
    }
    .el-dialog__body{
        padding-top: 16px!important;
    }
}

</style>