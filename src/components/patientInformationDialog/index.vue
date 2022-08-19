<template>
    <el-dialog title="患者基本信息" class="patientInfo" :visible.sync="infoMsg.dialogVisible" :width="isAtmeng?'70%':'80%'" 
    append-to-body :close-on-click-modal="false" :close-on-press-escape="false" >
        <el-form ref="form" :model="formData" label-width="80px" label-suffix=":">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="患者ID">
                        <el-input v-model="formData.patCode" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="姓名">
                        <el-input v-model="formData.patName" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="性别">
                        <el-input v-model="formData.sdSexStr" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="年龄">
                        <el-input v-model="formData.age" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="出生日期">
                        <el-input v-model="formData.dtBirthStr" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="身份证号">
                        <el-input v-model="formData.idNo" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="国籍">
                        <el-input v-model="formData.nationality" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="民族">
                        <el-input v-model="formData.nationStr" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="职业">
                        <el-input v-model="formData.occupation" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="婚姻">
                        <el-input v-model="formData.marryStr" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="出生地">
                        <el-input v-model="formData.birthPlace" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="籍贯">
                        <el-input v-model="formData.nativePlace" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="乡村/街道">
                        <el-input v-model="formData.township" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="现住址">
                        <el-input v-model="formData.currentAddress" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="电话">
                        <el-input v-model="formData.tel" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="18">
                    <el-form-item label="户口地址">
                        <el-input v-model="formData.permanentAddress" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="单位地址">
                        <el-input v-model="formData.workUnit" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="单位电话">
                        <!-- <el-input v-model="formData.tel" disabled  v-if="!isFormOutp"></el-input> -->
                        <!-- 暂无单位电话 -->
                        <el-input  disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="联系人">
                        <el-input v-model="formData.contactName" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="关系">
                        <el-input v-model="formData.contactType" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="地址">
                        <el-input v-model="formData.contactAddress" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="联系电话">
                        <el-input v-model="formData.contactTel" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="社保卡号">
                        <el-input v-model="formData.insuranceNo" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="病案号">
                        <el-input v-model="docPatientParams.codeMrIp" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="infoMsg.dialogVisible = false">关 闭</el-button>
        </span>
    </el-dialog>
</template>
<script>
export default {
    name: "patientInfo",
    props:{
        infoMsg:{
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    data(){
       return {
           formData: {},
           generationals: {}, // 与患者关系
           marryLists: {}, // 婚姻
           nationLists: {}, // 民族
           careerLists: {}, // 职业
           nationality: {}, // 国籍
       }
    },
    computed:{
        urlParams(){
            return this.$route.query;
        },
        isFormOutp(){
            return this.infoMsg.form == 'outp'
        },
        isAtmeng() {
            return this.$limits.isFun(this)
        },
        docPatientParams(){
            return sessionStorage.receivePatientParams? JSON.parse(sessionStorage.receivePatientParams): {}
        },
        getMarryStr(){
            let map = new Map();
            this.marryLists.map(item =>{
                map.set(item.dataCode, item.dataName)
            })
            return map;
        },
        getNationality(){
            let map = new Map();
            this.nationality.map(item =>{
                map.set(item.dataCode, item.dataName)
            })
            return map;
        },
        getOccupation(){
            let map = new Map();
            this.careerLists.map(item =>{
                map.set(item.dataCode, item.dataName)
            })
            return map;
        },
    },
    created(){
        this.init();
    },
    methods:{
        async init(){
            await this.basicDictionary();
            this.findPatById();
        },
        findPatById(){
            let idPat = this.urlParams.idPat?this.urlParams.idPat: this.docPatientParams.idPat;
            this.$axios.get("/reg/pat/findPatById", {
              idPat: idPat
            }).then(res => {
                if(res.success){
                    this.formData = res.data;
                    this.formData.marryStr = this.getMarryStr.get(this.formData.sdMarry);
                    this.formData.nationality = this.getNationality.get(this.formData.sdCounty);
                    this.formData.occupation = this.getOccupation.get(this.formData.sdOccupation);
                    
                    const [nationList] = this.nationLists.filter(item => item.dataCode == this.formData.sdNation || item.dataName.includes(this.formData.sdNation))
                    this.formData.nationStr = nationList? nationList.dataName: '';

                    const {patContactList,patAddressList} = res.data;
                    if(patContactList.length){ // 联系人信息
                        const [{dataName}] = this.generationals.filter(item => item.dataCode == patContactList[0].sdContactType);
                        this.formData.contactType = dataName;
                        this.formData.contactName = patContactList[0].contactName;
                        this.formData.contactAddress = patContactList[0].address;
                        this.formData.contactTel = patContactList[0].contactTel;
                    }
                    if(patAddressList.length){
                        patAddressList.map(v => {
                            switch(v.sdAddressType){
                                case this.CONSTANT.NATIVE_PLACE: //籍贯
                                    this.formData.nativePlace = v.address;
                                    break;
                                case this.CONSTANT.CURRENT_ADDRESS:  //现住址
                                    this.formData.currentAddress = v.address;
                                    break;
                                case this.CONSTANT.PERMANENT_ADDRESS: // 户籍地址
                                    this.formData.permanentAddress = v.address;
                                    break;
                                case this.CONSTANT.BIRTH_PLACE:  //出生地
                                    this.formData.birthPlace = v.address;
                                    break;
                                case this.CONSTANT.TOWN_SHIP: //乡镇街道
                                    this.formData.township = v.address;
                                    break;
                                default: '';
                            }
                        });
                    }
                }else{
                    this.$message({
                      message: res.message,
                      type: 'warning',
                    })
                }
            })
        },
        //基础字典
        basicDictionary() {
            let str = 'SD_CONTACT_TYPE,SD_MARRY,SD_NATION,SD_OCCUPATION,SD_COUNTY';
            return this.findSdData(str).then(data => {
                ({ SD_CONTACT_TYPE:this.generationals, // 与患者关系
                    SD_MARRY:this.marryLists,// 婚姻
                    SD_NATION:this.nationLists, // 民族
                    SD_OCCUPATION:this.careerLists, // 职业
                    SD_COUNTY:this.nationality // 国籍
                    } = data);
            });
        },
    }
}
</script>
<style lang="scss">
.patientInfo{
    .el-dialog {
        .el-dialog__header{
            border-bottom: 1px solid #E8E8E8;
            .el-dialog__title{
                font-size: 16px;
                color: #262626;
            }
        }
        .el-dialog__body{
            padding: 16px 20px 0;
        }
    }
    .el-form-item--small.el-form-item{
        margin-bottom: 12px;
        .el-form-item__label{
            color: #262626;
        }
        .el-input.is-disabled .el-input__inner{
            cursor: auto;
            color: #424242 !important;
            background-color: #F5F5F5!important;
            border-color: #E0E0E0!important;
        }
    }
}
</style>
