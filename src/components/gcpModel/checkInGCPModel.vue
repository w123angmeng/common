<template>
    <div>
        <el-dialog
            class="checkInGCPModel"
            title="GCP登记"
            :visible.sync="dialogForm.visible"
            width="945px" 
            :append-to-body="true"
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            @close="closeCheckInGCPDiaglog">
            <div class="gcptitle">
                <span>患者ID：{{patientParams.patCode}}</span>
                <span>患者姓名：{{patientParams.patName}}</span>
                <span>性别：{{patientParams.sdSexDesc || patientParams.sdSexStr}}</span>
                <span>年龄：{{patientParams.patAge || patientParams.ageStr}}</span>
            </div>
            <el-table 
                style="width: 100%"
                :data="tableData" 
                :header-cell-style="tableTitleStyle" 
                :cell-style="cellStyle"
                stripe>
                <el-table-column prop="gcpRegisterDt" label="登记日期" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="gcpCode" label="试验编码" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="gcpProjectName" label="试验项目" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="screenCode" label="筛选号" width="100" align="left" show-overflow-tooltip></el-table-column>
                <!-- <el-table-column prop="dtStart" label="有效期" width="300" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span>{{getDtStartAndDtEnd(scope.row)}}</span>
                    </template>
                </el-table-column> -->
                <el-table-column width="60" label="操作" align="left">
                    <template slot-scope="scope">
                        <el-button 
                            class="btn" 
                            type="text" 
                            @click="handleDelete(scope.$index, scope.row)">
                            取消
                        </el-button>
                    </template>    
                </el-table-column>
            </el-table>

            <el-form :model="formData" :rules="rules" label-position="right" label-width="80px" :inline="true" ref="formData" class="mainForm" :disabled="!canAdd">
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="试验信息" prop="gcpCode">
                            <el-select v-model="formData.gcpCode" placeholder="请选择" clearable  @change="changeClinic">
                                <el-option :value="item.gcpCode" :label="`${item.gcpCode} ${item.gcpName}`" v-for="(item,index) in gcpCodeOptions" :key="index"></el-option>
                            </el-select>
                        </el-form-item>    
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="筛选号" prop="screenCode">
                            <el-input placeholder="" v-model="formData.screenCode"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>    
                <!-- <div>
                    <el-form-item label="有效期" prop="timeRange">
                        <el-date-picker
                            style="width: 354px"
                            v-model="formData.timeRange"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            align="right">
                        </el-date-picker>
                    </el-form-item>
                </div>  -->
            </el-form>  

            <span slot="footer" class="dialog-footer">
                <el-button class="common_button--fs-big" @click="closeCheckInGCPDiaglog">关闭</el-button>
                <el-button class="common_button--fs-big" type="primary" :loading="saveloading" @click="addGCPItem('formData')" :disabled="!canAdd">添加</el-button>
            </span>
        </el-dialog>   
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import bus from "@/components/common/bus.js";
import { mixinSaveLoading } from "@/components/page/Common_WEB/mixins/mixinSaveLoading";
export default {
    name: '',
    props: ['dialogForm'],
     mixins: [mixinSaveLoading],
    data() {
        return {
            user: {},
            tableData: [],
            formData: {
                idPat: '',
                idVisit: '',
                visitCode: '',
                sdVisitType: '',
                screenCode: '',        // 试验号
                screenName: '',       // 试验名称
                freeIndicator: 0,     //全免标记  0不全免  1 全免
                gcpCode: '',           // gcp编码
                gcpProjectName: '',    // gcp名字
                idDiscSch: '',
                timeRange: ['', ''], // 有效期范围
            },
            //表格样式
            tableTitleStyle: {
                height: '40px',
                fontSize: "14px",
                color: "#1F1F1F",
                background: "#F5F5F5",
                fontWeight: 'normal',
            },
            cellStyle: {
                height: '40px',
                // padding: '0px',
                color: "#1F1F1F",
                fontSize: "14px",
            },
            gcpCodeOptions: [], // GCP-code下拉列表
            screenCodeOptions: [], // 试验号下拉列表
            rules: {
                gcpCode: [{required: true, message: '请输入GCP编码', trigger: "change"}],
                screenCode: [{required: true, message: '请输入试验号', trigger: "blur"}],
            },
            patientParams: {}
        };
    },
    computed: {
        ...mapGetters(["docPatientParams"]),
        canAdd() { // 可以进行新增操作
            return this.tableData.length < 1; //GCP登记时，只能登记一条，不支持登记多条记录
        },
        getGcpName(){
            let map = new Map();
            this.gcpCodeOptions.forEach(item => {
                map.set(item.gcpCode, item)
            })
            return map;
        },
        isFromOutp() {
           return this.dialogForm.form == 'OutPatient'
        },
        isFromInp() {
           return this.dialogForm.form == 'doctws'
        },
    },
    created() {
        this.user = JSON.parse(sessionStorage.getItem("user"));
        if(this.isFromOutp){
            this.patientParams = JSON.parse(sessionStorage.getItem("receivePatientParams"));
        } else if(this.isFromInp){
            this.patientParams = this.docPatientParams;
        }
        Object.assign(this.formData, {
            idPat: this.patientParams.idPat,
            idVisit: this.patientParams.idVisit,
            visitCode: this.patientParams.visitCode,
            sdVisitType: this.patientParams.sdVisitType,
        });
        this.findPatGcpList();    //获取患者登记列表
        this.getGcpCodeOptions(); // 获取GCP-code下拉列表
        // this.getScreenCodeOptions(); // 获取试验号下拉列表

        
    },
    mounted() {},
    methods: {
        changeClinic(){
            let itemGcp = this.getGcpName.get(this.formData.gcpCode);
            console.log(itemGcp);
            this.formData.gcpProjectName = itemGcp.gcpName;
            this.formData.freeIndicator = itemGcp.freeIndicator;
            this.formData.idDiscSch = itemGcp.idDiscSch || '';
        },
        // 获取GCP-code下拉列表
        getGcpCodeOptions() {
            this.$axios.get('/dict/gcp/listGcp').then(res => {
                if(res.success){
                    let data = res.data;
                    if(data.length){
                        this.gcpCodeOptions = data.filter(item =>{
                            return item.enabled;
                        })
                    }
                }else{
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            })
        },

        // 获取试验号下拉列表
        async getScreenCodeOptions () {
            const res = await this.$axios
                .get('/adapter/gcp/listTestNo', {});

            if(res.success){
                (res.data || []).map(item=>{
                    // 处理后端返回的引号问题--对接：赵永焕
                    item.researchName = item.researchName.replace(/"/g, '');
                })
                this.screenCodeOptions = res.data || [];
            }else{
                this.$message({
                    type: "warning",
                    message: res.message
                })
            }

        },

        findUnSubmitOrder(type = ''){
            let url = "/doctws/order/findUnSubmitOrder";
            let params = {
                idVisit: this.patientParams.idVisit,
                sdClinicType: type,
            };
            return this.$axios.get(url, params).then(res=>{
                let arr =  res.data || [];
                let unGcp = arr.some( v => v.gcpIdentification == '1')
                return unGcp
            })
        },

        //获取患者登记列表 
        async findPatGcpList() {
            let res = await this.$axios
                .get("/reg/gcp/findPiPatGcpReg", {
                    idPat: this.patientParams.idPat,
                    idVisit: this.patientParams.idVisit
                });
            if (res.success) {
                (res.data || []).forEach(item=>{
                    item.dtStart = item.dtStart ? this.formatDateTime(item.dtStart/1000) : '';
                    item.dtEnd = item.dtEnd ? this.formatDateTime(item.dtEnd/1000) : '';
                })
                this.tableData = res.data || [];
            } else {
                this.$message({
                    message: res.message,
                    type: "warning"
                });
            }
        },
    
        //关闭弹窗
        closeCheckInGCPDiaglog() {
            this.dialogForm.visible = false;
            this.resetForm('formData');
            if(this.isFromOutp){
                bus.$emit('updataPatInoGcpShow', this.tableData.length)
            }else if(this.isFromInp){
                this.$root.Bus.$emit('doctws_update_isGcpPat', this.tableData.length>0);
            }
        },

        //添加
        addGCPItem(formName) {

            let obj = {
                ...this.formData,
                gcpStatus: 1,  // 2 取消 1 保存
                empNameRegisterGcp: this.user.empName,   //登记人员名称
                idEmpRegisterGcp: this.user.idEmp,        //登记人员id 
                empCode: this.user.empCode,   //登记人员code
            }
            
            this.$refs[formName].validate(valid => {
                if (valid) {
                        this.saveGcpInfo(obj, 'add');
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },

        //删除
        async handleDelete(index, row) {

            let obj = {
                ...this.formData,
                screenCode: row.screenCode,        // 试验号
                gcpCode: row.gcpCode,           // gcp编码
                gcpProjectName: row.gcpProjectName,    // gcp名字
                freeIndicator: row.freeIndicator,
                gcpStatus: 2,   // 2 取消 1 保存
                idPatGcp: row.idPatGcp,   //患者Gcp登记id ,
                empNameCancelGcp: this.user.empName,  //撤销人员名称 
                idEmpCancelGcp: this.user.idEmp,      //撤销人员id 
                idDiscSch: row.idDiscSch,  //价格分类
                empCode: this.getUserStorage().empCode,

            }

            let isUnOrder = false;
            if(this.isFromInp) {
              isUnOrder = await this.findUnSubmitOrder();
            }
            if(isUnOrder) return this.$message.warning("存在未提交的GCP医嘱，请提交或者删除GCP医嘱后再取消登记！")
            this.saveGcpInfo(obj) 
        },

        // 保存或者取消患者GCP信息
        saveGcpInfo(obj, str) {
            // 处理有效期
            obj.dtStart = (obj.timeRange&&obj.timeRange[0]) ? obj.timeRange[0] : '';
            obj.dtEnd = (obj.timeRange&&obj.timeRange[1]) ? obj.timeRange[1] : '';
            delete obj.timeRange;
            if(str) this.saveloading = true;
            this.$axios._post("/reg/gcp/saveOrUpdate",obj)
                .then(res => {
                    if (res.success) {
                        this.$message({
                            message: res.message,
                            type: "success"
                        });
                        
                        this.findPatGcpList();
                        if(str === 'add')  this.resetForm('formData'); 
                        
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }

                    if(str) this.saveloading = false;
            });
        },

            // 重置
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },

        // 更改GCP编码
        changeGcpCode(val) {
            if(val){
                let row = this.gcpCodeOptions.filter(item=>item.trialCode == val);
                row = row[0] ? row[0] : null;
                if(row){
                    // 联动GCP名称
                    this.formData.gcpProjectName = row.trialName;
                }
            }
        },

        // 更改试验号
        changeScreenCode(val) {
            if(val){
                let row = this.screenCodeOptions.filter(item=>item.researchCode == val);
                row = row[0] ? row[0] : null;
                if(row){
                    // 联动试验名称
                    this.formData.screenName = row.researchName;
                }
            }
        },

        // 有效期
        getDtStartAndDtEnd(row) {
            if(row.dtStart || row.dtStart){
                return `${row.dtStart}至${row.dtEnd}`;
            }else{
                return '';
            }
        }
    },
};
</script>

<style lang="scss" src="./checkInGCPModel.scss"></style>
    