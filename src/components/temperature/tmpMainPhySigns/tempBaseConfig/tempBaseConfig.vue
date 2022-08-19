<template>
    <div>
        <div class="tempBaseConfig">
            <el-form
                ref="phySignConfigForm"
                status-icon
                :model="phySignConfigForm"
                class="demo-ruleForm listForm"
                :rules="rules"
            >
                <div class="tempComInTop">
                    <div class="tempComInForm">
                        <el-form-item label="首次录入时间" prop="firstHour">
                            <el-select
                                class="tempComInp"
                                v-model="phySignConfigForm.firstHour"
                                placeholder="请选择时间"
                                clearable
                            >
                                <el-option
                                    v-for="item in firstHourList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="tempComInForm">
                        <el-form-item label="体温组合控件" prop="tempDesc">
                            <el-input
                                class="tempComInp"
                                placeholder="体温"
                                v-model="phySignConfigForm.tempDesc"
                                clearable
                            ></el-input>
                        </el-form-item>
                        <el-form-item prop="tempDescList">
                            <el-select
                                class="tempComSel"
                                multiple
                                collapse-tags
                                v-model="phySignConfigForm.tempDescList"
                                placeholder="请选择体温组合控件"
                                clearable
                            >
                                <el-option
                                    v-for="item in findSelectData"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="tempComInForm">
                        <el-form-item label="血压组合控件" prop="bloodDesc">
                            <el-input
                                class="tempComInp"
                                placeholder="血压"
                                v-model="phySignConfigForm.bloodDesc"
                                clearable
                            ></el-input>
                        </el-form-item>
                        <el-form-item prop="bloodDescList">
                            <el-select
                                class="tempComSel"
                                v-model="phySignConfigForm.bloodDescList"
                                placeholder="请选择血压"
                                multiple
                                collapse-tags
                                clearable
                            >
                                <el-option
                                    v-for="(item, index) in findSelectData"
                                    :key="index"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                </div>
            </el-form>
            <div class="headerItemWrap">
                <div class="headerItemTit">
                    <span class="requiredTip">抬头项目</span>
                    <el-button type="primary" @click="addItem('titleBar')">新增</el-button>
                </div>
                <!-- 列表 -->
                <el-form status-icon class="demo-ruleForm listForm">
                    <el-table
                        :data="tempBaseConObj.titleBar"
                        border
                        class="itemConTable"
                        ref="titleBar"
                        style="width: 100%;"
                        height="300"
                        highlight-current-row
                        :header-cell-style="tableTitleStyle"
                        :cell-style="cellStyle"
                    >
                        <el-table-column prop="name" label="项目描述" align="center" width="180">
                            <template slot-scope="scope">
                                <el-form-item class="elFormSpace">
                                    <el-input
                                        v-model="scope.row.name"
                                        ref="name"
                                        size="small"
                                        placeholder="请输入项目描述"
                                        clearable
                                    />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column prop="values" label="体征项目" align="center" width="180">
                            <template slot-scope="scope">
                                <el-form-item
                                    :prop="'titleBar.'+scope.$index+'.values'"
                                    class="elFormSpace"
                                >
                                    <el-select
                                        v-model="scope.row.values"
                                        placeholder="请选择体征项目"
                                        @change="signItemChange($event, scope.row)"
                                        multiple
                                        :multiple-limit="1"
                                    >
                                        <el-option
                                            v-for="item in findSelectData"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column prop="sdOwnerRightType" label="范围" align="center">
                            <template slot-scope="scope">
                                <el-form-item
                                    :prop="'titleBar.'+scope.$index+'.sdOwnerRightType'"
                                    class="elFormSpace"
                                >
                                <span v-if="scope.row.sdOwnerRightType == '0'">
                                    全院
                                </span>
                                <div v-else>
                                    <el-tooltip placement="top" :content="scope.row.deptNames" v-if="scope.row.deptNames">
                                        <span class="span-ellipsis">{{scope.row.deptNames}}</span>
                                    </el-tooltip>
                                </div>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column prop="enabled" label="状态" align="center">
                            <template slot-scope="scope">
                                <el-select
                                    class="doubleItemMini"
                                    v-model="scope.row.enabled"
                                    placeholder="请选择状态"
                                >
                                    <el-option
                                        v-for="item in statusList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120" align="center">
                            <template slot-scope="scope">
                                <el-button
                                    class="fz14"
                                    type="text"
                                    @click="enabledHandle(scope.$index, scope.row)"
                                >{{ scope.row.enabled == 0 ? "启用" : "禁用"}}</el-button>
                                <!-- <span class="cle9e9e9">|</span> -->
                                <!-- <el-button
                                    class="fz14"
                                    type="text"
                                    :disabled="!scope.row.statusDisable"
                                    @click="enabledHandle(0, scope.row)"
                                >禁用</el-button> -->
                                <span class="cle9e9e9" v-if="scope.row.newRowFlag">|</span>
                                <el-button
                                    v-if="scope.row.newRowFlag"
                                    type="text"
                                    class="fz14"
                                    @click="deleteHandle(scope.$index, 'titleBar')"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form>
            </div>
            <div class="headerItemWrap">
                <div class="headerItemTit">
                    <span class="requiredTip">左侧坐标尺</span>
                    <el-button type="primary" @click="addItem('leftScale')">新增</el-button>
                </div>
                <el-form>
                    <el-table
                        :data="tempBaseConObj.leftScale"
                        border
                        class="itemConTable"
                        ref="leftScale"
                        style="width: 100%;"
                        height="300"
                        highlight-current-row
                        :header-cell-style="tableTitleStyle"
                        :cell-style="cellStyle"
                    >
                        <el-table-column prop="name" label="坐标尺描述" align="center" width="180">
                            <template slot-scope="scope">
                                <el-form-item
                                    :prop="'leftScale.'+scope.$index+'.name'"
                                    :rules="rules['name']"
                                    class="elFormSpace"
                                >
                                    <el-input
                                        v-model="scope.row.name"
                                        size="small"
                                        placeholder="请输入项目描述"
                                        clearable
                                    />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column prop="values" label="体征项目" align="center" width="180">
                            <template slot-scope="scope">
                                <el-form-item
                                    :prop="'leftScale.'+scope.$index+'.values'"
                                    :rules="rules['values']"
                                    class="elFormSpace"
                                >
                                    <el-select
                                        v-model="scope.row.values"
                                        placeholder="请选择体征项目"
                                        multiple
                                        collapse-tags
                                        clearable
                                    >
                                        <el-option
                                            v-for="item in findSelectData"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column prop="minValue" label="下限" align="center">
                            <template slot-scope="scope">
                                <el-form-item
                                    :prop="'leftScale.'+scope.$index+'.minValue'"
                                    :rules="rules['minValue']"
                                    class="elFormSpace"
                                >
                                    <el-input
                                        v-model="scope.row.minValue"
                                        size="small"
                                        placeholder="下限"
                                        clearable
                                    />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column prop="maxValue" label="上限" align="center">
                            <template slot-scope="scope">
                                <el-form-item
                                    :prop="'leftScale.'+scope.$index+'.maxValue'"
                                    :rules="rules['maxValue']"
                                    class="elFormSpace"
                                >
                                    <el-input
                                        v-model="scope.row.maxValue"
                                        size="small"
                                        placeholder="上限"
                                        clearable
                                    />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column prop="interval" label="间隔" align="center">
                            <template slot-scope="scope">
                                <el-form-item
                                    :prop="'leftScale.'+scope.$index+'.interval'"
                                    :rules="rules['interval']"
                                    class="elFormSpace"
                                >
                                    <el-input
                                        v-model="scope.row.interval"
                                        size="small"
                                        placeholder="间隔"
                                        clearable
                                    />
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column prop="enabled" label="状态" align="center">
                            <template slot-scope="scope">
                                <el-select
                                    class="doubleItemMini"
                                    v-model="scope.row.enabled"
                                    placeholder="请选择状态"
                                >
                                    <el-option
                                        v-for="item in statusList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120" align="center">
                            <template slot-scope="scope">
                                <el-button
                                    class="fz14"
                                    type="text"
                                    @click="enabledHandle(scope.row.enabled, scope.row)"
                                >{{scope.row.enabled == 1 ? '禁用' : '启用'}}</el-button>
                                <span class="cle9e9e9" v-if="scope.row.newRowFlag">|</span>
                                <el-button
                                    v-if="scope.row.newRowFlag"
                                    type="text"
                                    class="fz14"
                                    @click="deleteHandle(scope.$index, 'leftScale')"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form>
            </div>
        </div>

        <div slot="footer" class="tempComInBtn">
            <el-button @click="cancleBaseDialog">取 消</el-button>
            <el-button type="primary" @click="saveTempBaseEvt('phySignConfigForm')">确 定</el-button>
        </div>
    </div>
</template>
<script>
const tempUrl = window.globalUrl.tempUrl;
const getTemperatureControList = tempUrl + "/timeaxis/tpnew/getTemperatureControList"; // 获取体温控件下拉列表
const getBpControlList = tempUrl + "/timeaxis/tpnew/getBpControlList"; // 获取血压控件下拉列表
const findSelectList = tempUrl + "/timeaxis/tpnew/findSelectList"; // 体征项目下拉列表
const findDeptList = tempUrl + "/timeaxis/util/findDeptList"; // 查询部门列表
const findEnabledList = tempUrl + "/timeaxis/util/findEnabledList"; // 查询状态列表
const getTemperatureBaseConfig = tempUrl + "/timeaxis/tpnew/getTemperatureBaseConfig"; // 获取体温单公共基本配置
const saveTemperatureBaseConfig = tempUrl + "/timeaxis/tpnew/saveTemperatureBaseConfig"; // 保存体温单公共基本配置
const getVitalItemSdOwnerRightByItemCode = tempUrl + "/timeaxis/tpnew/getVitalItemSdOwnerRightByItemCode"; // 根据体征编码获取体征权限

import { mapGetters } from "vuex";
import bus from "@/components/common/bus.js";
export default {
    data() {
        return {
            phySignConfigForm: {
                firstHour: "", // 录入时间
                tempDesc: "", // 体温描述
                bloodDesc: "", // 血压描述
                tempDescList: [],
                bloodDescList: [],
            },
            firstHourList: [
                {
                    label: "01:00",
                    value: 1
                },
                {
                    label: "02:00",
                    value: 2
                },
                {
                    label: "03:00",
                    value: 3
                }
            ], // 录入时间
            deptScopeData: [],// 范围
            bloodDescArr: [],// 血压控件下拉列表
            tempDescData: [], // 体温组合控件数据
            findSelectData: [], // 体征项目下拉列表
            statusList: [], // 禁用启用状态
            tempBaseConObj: {
                leftScale: [
                    // {
                    //     values: [],
                    //     maxValue: "",
                    //     enabled: 1,
                    //     minValue: "",
                    //     name: "",
                    //     interval: "",
                    //     newRowFlag: true,
                    // },
                ], // 左侧坐标尺
                titleBar: [
                    // {
                    //     values:[], // 体征项目
                    //     enabled: 1, // 禁用，启用
                    //     sdOwnerRightType:"", // 0全院， 1 部门科室
                    //     name:"", // 项目描述
                    //     idDeptList:[], // 科室列表
                    //     newRowFlag: true,
                    // }
                ], // 抬头项目
                commonConfig: {
                    firstHour: "", // 首次录入时间，
                    bpControl: "", // 血压控件
                    temperatureControl: "", // 体温控件
                }, // 
            }, // 体温单公共配置所有数据
            propsCascader: { value:'value', label:'label', multiple: true,checkStrictly: true  },
            tableTitleStyle: {
                fontSize: "14px",
                color: "#000",
                padding: "10px 0",
                background: "#f5f5f5",
            },
            cellStyle: {
                fontSize: "14px",
                height: "50px",
                color: "#333",
                padding: "0",
            },
            rules: {
                firstHour: [
                    { required: true, message: "请输入录入时间", trigger: "blur"},
                ],
                tempDesc: [
                    { required: true, message: "请输入", trigger: "blur"},
                ],
                tempDescList: [
                    { required: true, message: "请选择体温", trigger: "blur"},
                ],
                bloodDesc: [
                    { required: true, message: "请输入", trigger: "blur"},
                ],
                bloodDescList: [
                    { required: true, message: "请选择血压", trigger: "blur"},
                ],
            },
        };
    },
    created() {
        this.findTempControList();
        this.findBpControlList();
        this.findSelList();
        this.findEnabledData();
        this.findDeptData();
        this.findTempBaseConfig();
        bus.$off("tempBaseConfigData");
        bus.$on("tempBaseConfigData", () => {
            this.findTempBaseConfig();
        })
    },
    watch: {},
    components: {},
    mounted() {
    },
    methods: {
        signItemChange(code, row) {
            let params = code[0];
            this.findVitalItemItemCode(params).then(res => {
                if (res.success) {
                    let idDeptList = [];
                    row.sdOwnerRightType = res.data.sdOwnerRightType; // res.data.sdOwnerRightType;
                    if (res.data.deptNames) {
                        let arr = res.data.deptNames;
                        this.$set(row, 'deptNames', arr);
                    }
                    return row
                }
            })
        },
        async findVitalItemItemCode(code) {
            return await this.$axios._post(getVitalItemSdOwnerRightByItemCode, {itemCode: code}).then(data => {
                return data
            })
        },
        // 获取体温单公共基本配置
        findTempBaseConfig() {
            this.$axios.post(getTemperatureBaseConfig, {}).then((res) => {
                if (res.success){
                    let leftScale = [];
                    this.tempBaseConObj = res.data.config;
                    this.phySignConfigForm.bloodDescList = this.tempBaseConObj.commonConfig.bpControl.values;
                    this.phySignConfigForm.bloodDesc = this.tempBaseConObj.commonConfig.bpControl.name;
                    this.phySignConfigForm.tempDescList = this.tempBaseConObj.commonConfig.temperatureControl.values;
                    this.phySignConfigForm.tempDesc = this.tempBaseConObj.commonConfig.temperatureControl.name;
                    this.phySignConfigForm.firstHour = this.tempBaseConObj.commonConfig.firstHour;
                } else {
                    this.$message({
                        type: "error",
                        message: res.message
                    })
                }
            })
        },
        // 保存提交体温单公共基础配置数据
        saveTempBaseEvt(formName) {
            let titleBar = [], leftScale = []; 
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    let params = {};
                    if (this.tempBaseConObj.leftScale.length >=1) {
                        this.tempBaseConObj.leftScale.map((v, ind) => {
                            leftScale.push(this.filterProperty(v));
                        })
                    } else {
                        this.$message.error( "左侧坐标尺项目必须填写一条数据");
                        return;
                    }
                    if (this.tempBaseConObj.titleBar.length >= 1) {
                        this.tempBaseConObj.titleBar.map((v, ind) => {
                            titleBar.push(this.filterProperty(v));
                        })
                    } else {
                        this.$message.error( "抬头项目必须填写一条数据");
                        return;
                    }
                    params = {
                        commonConfig: {
                            firstHour: this.phySignConfigForm.firstHour,
                            temperatureControl: {
                                name: this.phySignConfigForm.tempDesc,
                                values: this.phySignConfigForm.tempDescList
                            },
                            bpControl: {
                                name: this.phySignConfigForm.bloodDesc,
                                values: this.phySignConfigForm.bloodDescList
                            },
                        },
                        leftScale: leftScale,
                        titleBar: titleBar
                    }
                    console.log(params)
                    this.saveTempBaseConfig(params);
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        // 体温单公共基础配置接口
        saveTempBaseConfig(params) {
            this.$axios._post(saveTemperatureBaseConfig, {config: params}).then(res => {
                if (res.success) {
                    this.$emit('cancleTempConfig'); // 关闭当前弹框
                    this.$message({
                        type: "success",
                        message: res.message
                    });

                } else {
                    this.$message({
                        tyep: "error",
                        message: res.message
                    });
                }
            })
        },
        // 关闭弹框
        cancleBaseDialog() {
            this.$emit('cancleTempConfig'); // 关闭当前弹框
        },
        // 禁用，启用，删除
        enabledHandle(status, row) {
            console.log(status, row)
            // row.statusDisable = !row.statusDisable;
            row.enabled =  row.enabled == 1 ? 0 : 1;
        //     row.enabled = this.statusDisable ? 1 : 0;
        },
        // 状态
        findEnabledData() {
            this.$axios.post(findEnabledList, {}).then(res=>{
                if (res.success) {
                    this.statusList = res.data;
                }
            })
        },
        // 获取体温控件下拉列表
        findTempControList() {
            this.$axios.post(getTemperatureControList, {}).then((res) => {
                if (res.success){
                    this.tempDescData = res.data;
                }
            })
        },
        // 获取血压控件下拉列表
        findBpControlList() {
            this.$axios.post(getBpControlList, {}).then((res) => {
                if (res.success){
                    this.bloodDescArr = res.data;
                }
            })
        },
        // 体征项目下拉列表
        findSelList() {
            this.$axios.post(findSelectList, {}).then((res) => {
                if (res.success){
                    this.findSelectData = res.data;
                }
            })
        },
        // 科室列表
        findDeptData() {
            this.$axios.post(findDeptList, {}).then(res=>{
                if (res.success) {
                    let data = res.data;
                    this.deptScopeData = data;
                }
            })
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
        
        // 新增项目
        addItem(type){
            let addTr = {}
            let length = this.tempBaseConObj[type].length;
            if (type == 'titleBar'){
                addTr = {
                    values:[], 
                    enabled: 1, 
                    sdOwnerRightType:"", 
                    name:"", 
                    idDeptList:[], 
                    newRowFlag: true,
                } // 初始化新增表单
            } else if (type == 'leftScale') {
                addTr = {
                    values:[],
                    maxValue: "",
                    enabled: 1,
                    minValue: "",
                    name: "",
                    interval: "",
                    newRowFlag: true,
                } // 初始化新增表单
            }
            this.tempBaseConObj[type].push(addTr);
            let formTabHeight = this.$refs[type];
            let _this = this;
            // 定位到最后一行
            this.$nextTick(() => {
                formTabHeight.bodyWrapper.scrollTop =
                    formTabHeight.bodyWrapper.scrollHeight;
            });
            formTabHeight.setCurrentRow(this.tempBaseConObj[type][length]);
        },
        // 物理删除新增的行记录
        deleteHandle(index, type) {
            this.tempBaseConObj[type].splice(index, 1);
        },
        // 过滤不必要的属性，暂时先这样写
        filterProperty(item) {
            let { newRowFlag, deptType, ...params } = item;
            return params;
        },
    },
};
</script>

<style lang="scss" src="./tempBaseConfig.scss">
</style>