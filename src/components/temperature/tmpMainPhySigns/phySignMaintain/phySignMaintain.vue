<template>
    <div class="phySignMaintain">
        <div class="phySignForm">
            <el-form
                ref="phySignMainForm"
                status-icon
                :model="phySignMainForm"
                class="demo-ruleForm listForm"
                :rules="rules"
            >
                <div class="extend">
                    <div class="phyFormLeft">
                        <el-form-item label="编码" prop="itemCode">
                            <el-input
                                class="phySignItemInp"
                                placeholder="请输入编码"
                                v-model="phySignMainForm.itemCode"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </div>
                    <div class="phyFormLeft">
                        <el-form-item label="描述" prop="itemDesc">
                            <el-input
                                class="phySignItemInp"
                                placeholder="请输入描述"
                                v-model="phySignMainForm.itemDesc"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </div>
                </div>
                <div class="extend">
                    <div class="phyFormLeft">
                        <el-form-item label="图形标识" prop="sdShapeSign">
                            <el-select
                                class="doubleItemMini"
                                clearable
                                v-model="phySignMainForm.sdShapeSign"
                                placeholder="请选择"
                            >
                                <el-option
                                    v-for="item in shapeSignData"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="单位" prop="itemUnit">
                            <el-input
                                class="doubleItemMini"
                                placeholder="请输入单位"
                                v-model="phySignMainForm.itemUnit"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </div>
                   
                    <div class="phyFormLeft">
                        <el-form-item label="录入频率" prop="sdEntryFrequency">
                            <el-select
                                class="phySignItemInp"
                                clearable
                                v-model="phySignMainForm.sdEntryFrequency"
                                placeholder="请选择录入频率"
                            >
                                <el-option
                                    v-for="item in comDataObj.freqList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                </div>
                <div class="extend">
                    <div class="phyFormLeft">
                        <el-form-item label="数据类型" prop="dataType">
                            <el-select
                                class="phySignItemInp"
                                clearable
                                v-model="phySignMainForm.dataType"
                                placeholder="请选择数据类型"
                                @change="dataTypChange"
                            >
                                <el-option
                                    v-for="item in dataTypeArr"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="phyFormLeft">
                        <el-form-item label="数据格式" prop="dataFormat">
                            <el-select
                                :disabled="dataForEff"
                                clearable
                                class="phySignItemInp"
                                v-model="phySignMainForm.dataFormat"
                                placeholder="请选择数据格式"
                            >
                                <el-option
                                    v-for="item in dataFormatArr"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                </div>
                <div class="extend">
                    <div class="phyFormLeft">
                        <el-form-item label="有效范围">
                            <el-input
                                class="phySignItemMini"
                                placeholder="请输入"
                                v-model="phySignMainForm.minValue"
                                clearable
                            ></el-input>
                            <span>（小）</span>
                            <span>——</span>
                            <el-input
                                class="phySignItemMini"
                                placeholder="请输入"
                                v-model="phySignMainForm.maxValue"
                                clearable
                            ></el-input>
                            <span>（大）</span>
                        </el-form-item>
                    </div>
                    <div class="phyFormLeft">
                        <el-form-item label="高低值" prop="">
                            <el-input
                                class="phySignItemMini"
                                placeholder="请输入"
                                v-model="phySignMainForm.lowValue"
                                @input="phySignMainForm.lowValue = numberCheck(phySignMainForm.lowValue, 4)" 
                                clearable
                            ></el-input>
                            <span class="posTop">（低）</span>
                            <span>——</span>
                            <el-input
                                class="phySignItemMini"
                                placeholder="请输入"
                                v-model="phySignMainForm.highValue"
                                @input="phySignMainForm.highValue = numberCheck(phySignMainForm.highValue, 4)" 
                                clearable
                            ></el-input>
                            <span class="posTop">（高）</span>
                        </el-form-item>
                    </div>
                </div>
                <div class="extend">
                    <div class="phyFormLeft">
                        <el-form-item label="低值提醒" prop="lowAlertMsg">
                            <el-input
                                class="phySignItemInp"
                                placeholder="请输入低值提醒"
                                v-model="phySignMainForm.lowAlertMsg"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </div>
                    <div class="phyFormLeft">
                        <el-form-item label="高值提醒" prop="highAlertMsg">
                            <el-input
                                class="phySignItemInp"
                                placeholder="请输入高值提醒"
                                v-model="phySignMainForm.highAlertMsg"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </div>
                </div>
                <div class="extend">
                    <div class="phyFormLeft">
                        <!-- <el-radio v-model="phySignMainForm.sdOwnerRightType" label="0">全院默认</el-radio> -->
                        <el-checkbox v-model="phySignMainForm.sdOwnerRightType" label="0" :false-label="''" :true-label="'0'" @change="signDeptChange($event, 0)">全院默认</el-checkbox>
                    </div>

                    <div class="phyFormLeft">
                        <el-form-item label="使用范围" prop="useRange">
                            <el-select
                                class="doubleItemMini"
                                v-model="phySignMainForm.useRange"
                                placeholder="请选择范围"
                            >
                                <el-option
                                    v-for="item in comDataObj.useRangeData"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                         <el-form-item label="状态" prop="enabled">
                            <el-select
                                class="doubleItemMini"
                                v-model="phySignMainForm.enabled"
                                placeholder="请选择状态"
                            >
                                <el-option
                                    v-for="item in comDataObj.enabledList"
                                     :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                </div>
                <div class="extend">
                    <div class="phyFormLeft">
                        <el-form-item label-width="0" prop="idDeptList">
                            <!-- <el-radio v-model="phySignMainForm.sdOwnerRightType" label="1">科室默认</el-radio> -->
                            <el-checkbox v-model="phySignMainForm.sdOwnerRightType" label="1" :true-label="'1'" :false-label="''"  @change="signDeptChange($event, 1)">科室默认</el-checkbox>
                            <el-select clearable multiple collapse-tags v-model="phySignMainForm.idDeptList" class="deptSeletCss" placeholder="请选择科室默认">
                                <el-option
                                    v-for="item in comDataObj.deptList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                </div>
                <div class="extend">
                    <div class="phyFormLeft">
                        <el-checkbox v-model="phySignMainForm.batchStatus">批量录入</el-checkbox>
                        <el-form-item label="序号" prop="serialNo">
                            <el-input
                                class="serialNoCss"
                                placeholder="请输入序号"
                                v-model="phySignMainForm.serialNo"
                                @input="serialChange"
                                clearable
                            ></el-input>
                        </el-form-item>
                    </div>
                    <div class="phyFormLeft">
                        <el-form-item label="数据元" prop="mrElementId">
                            <el-input
                                class="phySignItemInp"
                                v-model="phySignMainForm.mrElementName"
                                disabled
                            ></el-input>
                            <!-- <el-select
                                class="phySignItemInp"
                                v-model="phySignMainForm.mrElementId"
                                placeholder="请选择数据元"
                                clearable
                            >
                                <el-option
                                    v-for="(item, index) in dataElement"
                                    :key="index"
                                    :label="item.mrElementName"
                                    :value="item.mrElementId"
                                ></el-option>
                            </el-select> -->
                        </el-form-item>
                    </div>
                </div>
                <div class="phySignSubmit">
                    <el-button @click="cancleDialog">取消</el-button>
                    <el-button
                        type="primary"
                        class="departmentPreservation"
                        :loading="submitBtnState"
                        @click="savePhySignData('phySignMainForm')"
                    >确定</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>
<script>
const tempUrl = window.globalUrl.tempUrl;
const findDataTypeList = tempUrl + "/timeaxis/util/findDataTypeList"; // 查询数据类型列表
const findDataFormatList = tempUrl + "/timeaxis/util/findDataFormatList"; // 查询数据格式列表
const findShapeSignList = tempUrl + "/timeaxis/util/findShapeSignList"; // 查询图形标志列表
const modifyVitalsignItem = tempUrl + "/timeaxis/tpnew/modifyVitalsignItem"; // 保存体征项目
import bus from "@/components/common/bus.js";

import { mapGetters } from "vuex";
export default {
    props: {
        comDataObj: {
            type: Object
        },
        phySignMainVisible: {
            type:Boolean
        },
        phySignMainForm: {
            type: Object
        }
    },
    data() {
        return {
            // phySignMainForm: {
            //     idCiVitalsignItem: "",
            //     itemCode: "",
            //     itemDesc: "",
            //     dataType: "",
            //     dataFormat: "",
            //     itemUnit: "",
            //     minValue: "",
            //     maxValue: "",
            //     lowValue: "",
            //     highValue: "",
            //     lowAlertMsg: "",
            //     highAlertMsg: "",
            //     useRange: 0, // 0通用 1 成人 2 婴儿
            //     serialNo: null,
            //     sdOwnerRightType: "0", // 0 为全院， 1为科室
            //     batchStatus: false, // 批量录入
            //     sdShapeSign: "",
            //     sdEntryFrequency: "",
            //     mrElementId: "",
            //     mrElementName: "",
            //     hisUserId: "",
            //     enabled: 1, // 0禁用 1启用
            //     idDeptList: [],
            // },
            dataFormatArr: [], // 数据格式
            dataTypeArr: [], // 数据类型
            dataForEff: true, // 数据格式只针对类型日期时有效
            submitBtnState: false,
            dataElement: [],
            shapeSignData: [],
            tempComInfrastForm: {},
            rules: {
                itemCode: [
                    { required: true, message: '请输入编码', trigger: 'blur' }
                ],
                itemDesc: [
                    { required: true, message: '请输入描述', trigger: 'blur' }
                ],
                sdEntryFrequency: [
                    { required: true, message: '请选择频率', trigger: 'change' }
                ],
                dataType: [
                    { required: true, message: '请选择数据类型', trigger: 'change' }
                ],
                useRange: [
                    { required: true, message: '请选择使用范围', trigger: 'change' }
                ],
                enabled: [
                    { required: true, message: '请选择状态', trigger: 'change' }
                ]
            },
        };
    },
    created() {
        this.findDataType();
        this.dataFormatList();
        this.shapeSignAxios();
    },
    watch: {
    },
    components: {},
    mounted() {
    },
    methods: {
        // 全院、科室可以为空
        signDeptChange(e,type) {
            if (type == '0') {
                e = e ? '0' : ''
            } else if (type == '1') {
                e = e ? '1' : '';
            }
        },
        // 数据类型
        findDataType() {
            this.$axios.post(findDataTypeList, {}).then(res=>{
                if (res.success) {
                    this.dataTypeArr = res.data;
                }
            })
        },
        // 数据格式
        dataFormatList() {
            this.$axios.post(findDataFormatList, {}).then(res=>{
                if (res.success) {
                    this.dataFormatArr = res.data;
                }
            })
        },
        // 图形列表
        shapeSignAxios() {
            this.$axios.post(findShapeSignList, {}).then(res=>{
                if (res.success) {
                    this.shapeSignData = res.data;
                }
            })
        },
        resetPhySignForm(formName) {
            this.$refs[formName].resetFields();
            this.phySignMainForm.minValue = '';
            this.phySignMainForm.maxValue = '';
            this.phySignMainForm.lowValue = '';
            this.phySignMainForm.highValue = '';
            this.phySignMainForm.idCiVitalsignItem = '';
            this.phySignMainForm.sdOwnerRightType = "0"; // 默认为全院
            this.phySignMainForm.mrElementName = '';
            this.phySignMainForm.idDeptList = [];
            this.phySignMainForm.hisUserId = '';
            this.phySignMainForm.deptNames = '';
            // this.$emit('canclePhySignDia'); // 关闭当前弹框
        },
        // 取消事件关闭弹框
        cancleDialog() {
            this.$emit('canclePhySignDia'); // 关闭当前弹框
        },
        // 提交数据
        savePhySignData(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    let params = this.filterProperty(this.phySignMainForm);
                    params.hisUserId = this.getUserStorage().idEmp; // 用户id
                    params.batchStatus = this.phySignMainForm.batchStatus ? 1 : 0;
                    params.lowValue = this.handleNum(this.phySignMainForm.lowValue);
                    params.highValue = this.handleNum(this.phySignMainForm.highValue);
                    params.maxValue = this.handleNum(this.phySignMainForm.maxValue);
                    params.minValue = this.handleNum(this.phySignMainForm.minValue);
                    params.dataFormat = this.phySignMainForm.dataFormat ? this.phySignMainForm.dataFormat : '';
                    params.highAlertMsg = this.phySignMainForm.highAlertMsg ? this.phySignMainForm.highAlertMsg : '';
                    params.itemUnit = this.phySignMainForm.itemUnit ? this.phySignMainForm.itemUnit : '';
                    params.lowAlertMsg = this.phySignMainForm.lowAlertMsg ? this.phySignMainForm.lowAlertMsg : '';
                    params.sdShapeSign = this.phySignMainForm.sdShapeSign ? this.phySignMainForm.sdShapeSign : '';
                    this.findModifySignItem(modifyVitalsignItem, params);
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        handleNum(num) {
            if (num == 0 && /0/.test(num)) {
                return 0;
            } else if (num != "" && /[0-9]/g.test(num)) {
                // null!=""可能会返回0,需额外处理,判断是否有数字
                return Number(num);
            }
            return '';
        },
        // 保存接口
        findModifySignItem(url, params) {
            this.$axios._post(url, params).then(res=>{
                if (res.success){
                    this.$emit('canclePhySignDia'); // 关闭当前弹框
                    this.resetPhySignForm('phySignMainForm'); // 清空表单数据
                    this.$emit('findVitalsignList'); // 重新获取数据
                    this.$message({
                        type: 'success',
                        message: res.message
                    })
                } else{
                    this.$message({
                        type: 'error',
                        message: res.message
                    })
                }
            })
        },
        // 数据类型change事件
        dataTypChange(val) {
            // 0 为文本 1为数字 2日期
            this.dataForEff = val == "2" ? false : true;
        },
        // 序号change事件（输入数字验证）
        serialChange(val) {
            console.log(val)
            let reg = val.match(/^\d{0,2}/g)[0];
            this.phySignMainForm.serialNo = Number(reg);
        },
        // 过滤不必要的属性
        filterProperty(item) {
            let { deptNames, ...params } = item;
            return params;
        },
        numberCheck (val, count) {
            var str = val;
            var len1 = str.substr(0, 1);
            var len2 = str.substr(1, 1);
            //如果第一位是0，第二位不是点，就用数字把点替换掉
            if (str.length > 1 && len1 == 0 && len2 != ".") {
                str = str.substr(1, 1);
            }
            //第一位不能是.
            if (len1 == ".") {
                str = "";
            }
            //限制只能输入一个小数点
            if (str.indexOf(".") != -1) {
                var str_ = str.substr(str.indexOf(".") + 1);
                if (str_.indexOf(".") != -1) {
                    str = str.substr(0, str.indexOf(".") + str_.indexOf(".") + 1);
                }
            }
            //正则替换，保留数字和小数点
            // str = (str.match(/^\d*(\.?\d{0,1})/g)[0]) || null
            str = (str.match(/^\d*(\.?\d{0,2})/g)[0]) || null
            // 判断小数点前的位数
            if (parseInt(str).toString().length <= count) {
                return str;
            } else {
                return 0
            }
        },
    },
};
</script>

<style lang="scss" src="./phySignMaintain.scss">
</style>
