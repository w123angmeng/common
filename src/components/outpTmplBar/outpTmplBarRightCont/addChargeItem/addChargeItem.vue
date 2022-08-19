<template>
    <div>
        <el-dialog 
            title="添加收费项目"
            class="addChargeItem outpTmplBarRightCont template common_container"
            :visible.sync="chargeItemData.chargeItemVisable" 
            :before-close="cancelMedical" 
            :append-to-body="true"
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            >
            <el-form 
                :model="formData" 
                :rules="rules" 
                label-position="right" 
                label-width="75px" 
                ref="formData" 
                class="chargeItemData">
                <div class="formDataList">
                    <div class="sdPriceItem formLeft">
                        <el-form-item label="类型" prop="sdPriceItem" class="chargeType" label-width="80px" >
                            <el-select v-model="formData.sdPriceItem" placeholder="类型" @change="changeType">
                                <el-option
                                    v-for="item in priceTypeList"
                                    :key="item.dataCode"
                                    :label="item.dataName"
                                    :value="item.dataCode">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="chargeList formLeft">
                        <el-form-item label="名称" prop="priceItemCode">
                            <el-select 
                                v-model="formData.priceItemCode" 
                                popper-class="AddOutpTpmlList"
                                placeholder="名称"
                                filterable 
                                remote
                                reserve-keyword  
                                :remote-method="remotePriceItem"
                                @focus="remotePriceItem('')"
                                @change="changeItems">
                                <el-option
                                    v-for="(item,index) in priceItemList"
                                    :key="index"
                                    :label="item.priceItemName"
                                    :value="item.priceItemCode">
                                    <el-tooltip 
                                        class="itmPriName" 
                                        effect="dark"
                                        v-if="item.priceItemName && item.priceItemName.length > 20"
                                        :content="item.priceItemName" 
                                        placement="right-start">
                                        <span>{{ item.priceItemName }}</span>
                                    </el-tooltip>
                                    <span class="itmPriName" v-else> {{ item.priceItemName }} </span>
                                    <el-tooltip 
                                        class="itmSpec" 
                                        effect="dark"
                                        v-if="item.itemSpec && item.itemSpec.length > 16"
                                        :content="item.itemSpec" 
                                        placement="right-start">
                                        <span>{{ item.itemSpec ? item.itemSpec : '' }}</span>
                                    </el-tooltip>
                                    <span class="itmSpec" v-else> {{ item.itemSpec ? item.itemSpec : '' }} </span>
                                </el-option>
                                
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="amount formLeft">
                        <el-form-item label="数量" prop="amount">
                            <el-input  placeholder="" v-model="formData.amount"></el-input>
                        </el-form-item>
                        <span class='sdUnit'>{{formData.sdUnitStr}}</span>
                    </div>
                    <div class="idDept formLeft">
                        <el-form-item label="执行科室" prop="idDept" labelWidth="80px">
                            <el-select 
                                v-model="formData.idDept" 
                                filterable 
                                remote
                                reserve-keyword  
                                :remote-method="remoteIdDept"
                                @focus="remoteIdDept('')"
                                @change="changeIdDept"
                                placeholder="请选择">
                                <el-option 
                                    v-for="(item,index) in department" 
                                    :key="index" 
                                    :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="chargePrice formLeft">
                        <span>单价：</span> <span>{{formData.priceStd.toFixed(2)}}</span>&nbsp;&nbsp;&nbsp;
                        <span>金额：</span> <span>{{totalCosts.toFixed(2)}}</span>
                    </div>
                </div>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button plain @click="cancelMedical">取消</el-button>
                <el-button type="primary" @click="submitForm('formData')">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        props: {
            chargeItemData: {
                type: Object,
                default: () => { }
            },
            inspectData: {
                type: Object,
                default: () => { }
            }
        },
        data() {
            let checkNum = (rule, value, callback) => {
                if (!value) {
                    this.totalCosts = 0; //数量为空总价为空
                    this.numFlag = false;
                    return callback(new Error("必填项不能为空！"));
                } else {
                    if(!/^\+?[1-9][0-9]*$/.test(value)) {
                        this.totalCosts = 0; //非数字总价为空
                        this.numFlag = false;
                        callback(new Error("填写正确的数量！"));
                    } else {
                        this.numFlag = true;
                        this.totalCosts = this.floatNumber(this.formData.priceStd, value, 'mul')
                        callback();
                    }
                } 
            };
            return {
                numFlag: false,     //整数标志
                totalCosts: 0,      //总价
                priceTypeList: [],  //项目类别列表
                priceItemList: [],  //收费项目列表
                department: [],     //科室列表

                formData: {
                    sdPriceItem: "",    //价表项目类别
                    sdPriceItemStr: '', //价表项目类别 中文
                    idPriceItem: '',
                    priceItemCode: "",  //价表项目编码
                    priceItemName:"",   //收费项目
                    amount: "",         //数量
                    deptName: "",       //科室名称
                    idDept: "",         //科室
                    itemSpec: '',       //规格
                    sdUnit: "",         //单位
                    sdUnitStr: '',      //单位名称
                    priceStd: 0,        //单价
                    idOrdersTemplate: '',//模板id
                    idOrdersTemplateItem: '',
                    idOrdersTemplateChargeItem: '',
                    idOrdersTemplateItems:''
                },
               
                //表格样式
                tableTitleStyle: {
                    fontSize: "14px",
                    color: "#000",
                    padding: "0",
                    height: "38px",
                    background: "#f5f5f5",
                },
                cellStyle: {
                    fontSize: "14px",
                    color: "#333",
                    height: "38px",
                    padding: "0px",
                }, // 表格样式
                rules: {
                    sdPriceItem: [{ required: true, message: '必填项不能为空!',trigger: 'change' }],
                    priceItemCode: [{ required: true,message: '必填项不能为空!',trigger: 'change'}],
                    idDept: [{ required: true, message: '必填项不能为空!',trigger: 'change' }],
                    amount: [{ required: true, validator: checkNum, trigger: 'change' }],
                },
            }
        },
        computed:{
            routeQuery(){
                return this.$route.query
            },
            idPat(){
                return this.routeQuery.idPat
            },
            idVisit(){
                return this.routeQuery.idVisit
            }
        },
        created() {
            this.getTypeList();
        },
        mounted() {},
        methods: {
            //项目类型列表
            getTypeList(){
                this.findSdData('SD_PRICE_ITEM').then(data => {                                     
                    this.priceTypeList = data.SD_PRICE_ITEM;
                    // data.SD_PRICE_ITEM.map( v => {
                    //     if(v.dataCode == this.CONSTANT.MATERICAL_CHARGE) {
                    //         this.priceTypeList.push(v)
                    //     }
                    //     if(v.dataCode == this.CONSTANT.BED_CHARGE) {
                    //         this.priceTypeList.push(v)
                    //     }
                    //     if(v.dataCode == this.CONSTANT.OTHER_CHARGE) {
                    //         this.priceTypeList.push(v)
                    //     }
                    // })
                })
            },

            //切换项目类型 
            changeType(e){
                this.priceTypeList.map(v => {
                    if(v.dataCode == e) {
                        this.formData.sdPriceItemStr = v.dataName;
                    }
                })
                this.formData.priceItemCode = "";
                this.formData.priceStd = 0;
                this.totalCosts = 0;
                this.formData.amount = "";
                this.formData.sdUnitStr = "";
            },

            // 根据类型查询收费项目
            async remotePriceItem(query = '') {
                this.priceItemList = [];
                if(!this.formData.sdPriceItem) return
                let ajaxUrl = "/dict/price/listPriceItem";
                let params = {
                    pageIndex: 1,
                    pageSize: 20,
                    selCodition: query,
                    sdPriceItem: this.formData.sdPriceItem,
                    chargeTypeCode: JSON.parse(sessionStorage.getItem("receivePatientParams")).chargeTypeCode,
                };
                let resData = await this.$axios.get(ajaxUrl, params);

                if(resData.success) {
                    this.priceItemList = resData.data.records;  //收费项目列表
                } else {
                    this.$message({
                        message: resData.message,
                        type: "warning"
                    });
                }
            },
          
            //切换项目名称
            changeItems(e){
                this.priceItemList.map( v => {
                    if(e == v.priceItemCode) {
                        this.listAssign(this.formData, v)
                        this.formData.priceStd = v.priceStd || 0; //单价
                        this.formData.amount = '1';
                        if(!this.numFlag) return  //非数字或空
                        this.totalCosts = this.floatNumber(this.formData.amount, this.formData.priceStd, 'mul')
                    }
                })
            },

            //科室列表
            remoteIdDept(query = '') {
                this.selectDepartment(this.getUserStorage().idOrg, '', 'INS', '', query).then(data => {
                    this.department = data;
                })
            },

            //切换科室
            changeIdDept(e) {
                this.department.map(v => {
                    if(v.value == e) {
                        this.formData.deptName = v.label;
                    }
                })
            },

            //提交
            submitForm(formName) {
                this.formData.idOrdersTemplateItem = this.chargeItemData.idOrdersTemplateItem;
                this.formData.idOrdersTemplateItems = this.chargeItemData.idOrdersTemplateItems;
                this.formData.idOrdersTemplate = this.chargeItemData.idOrdersTemplate;
                this.formData.idPat = this.idPat;
                this.formData.idVisit = this.idVisit;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        // 收费项目添加成功 处理事件
                        let sendChargeObj = {
                            ...this.formData,
                        }
                        this.$emit('sendChargeObj',sendChargeObj)
                        this.cancelMedical()
                     
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            //取消详细弹窗
            cancelMedical(){
                this.chargeItemData.chargeItemVisable = false;
                this.resetForm('formData')
            },
         
            //清空表单
            resetForm(formName) {
                this.totalCosts = 0;
                this.formData.priceStd = 0;
                this.$refs[formName].resetFields();
            },
        }
    }
</script>
<style lang="scss" src="./addChargeItem.scss">
</style>