<template>
    <div class="patInfoQueryCom">
        <!-- 查询患者 -->
        <div class="patInfoQueryComBox">
            <div class="patInfoQueryTop">
                <el-select class="filterCon selIdNo" v-model="queryPatType" clearable placeholder="请选择" @change="selectPatType">
                    <el-option
                        v-for="item in cardReaderList"
                        :key="item.typeCode"
                        :label="item.typeName"
                        :value="item.typeCode"
                    >
                    </el-option>
                </el-select>
                <el-input class="searchInput searchW" :style="{width: patInputWidth+'px'}" @keyup.enter.native="getListPatCardVist(patNum, queryPatType)" v-model.trim="patNum"></el-input>
                <div class="cardBox">
                    <img class="cardIcon" src="./img/cardReader.png" alt="身份证" @click="readIDCards(patNum, queryPatType)">
                </div>
            </div>
            <!-- 患者基础信息展示 -->
            <div class="patInfoQueryBot" v-if="Object.keys(patVisitInfo).length">
                <span>{{patDetailInfo.patName}}</span>
                <span>{{patDetailInfo.sdSexStr}}</span>
                <span>{{patDetailInfo.dtBirth}}</span>
            </div>
        </div>
        <!-- 患者列表 -->
        <el-dialog title="患者列表" v-dialogDrag :visible.sync="patListDia" width="800px" :closeOnClickModal="false">
            <patientList :patVisitInfo="patVisitInfo" :typeComponentRef="typeComponentRef" @dbClickPatListRow="dbClickPatListRow"></patientList>
        </el-dialog>
        
        <el-dialog title="患者就诊列表" v-dialogDrag :visible.sync="listVisitDia" width="800px" :closeOnClickModal="false">
            <ListPatVisit :patVisitTable="patVisitInfo" :typeComponentRef="typeComponentRef" @dbClickRow="dbClickRow"></ListPatVisit>
        </el-dialog>
    </div>
</template>
<script>
export default {
    props: {
        patQueryCompType: {
            type: String,
            default: "1"
        },
        patInputWidth: {
            type: Number,
            default: 220
        }
    },
    data() {
        return {
            listVisitDia: false, // 患者就诊列表弹框显示
            typeComponentRef: "nurse", 
            patListDia: false, // 患者列表弹框显示
            queryPatType: "",
            patNum: "",
            patListTable: [], // 患者列表数据
            cardReaderList: [], // 读卡类型设置列表
            patVisitInfo: [], // 获取患者相关信息
            patDetailInfo: {}, // 展示患者姓名 出生日期 性别
        };
    },
    created() {
        this.findCardReadList();
    },
    methods: {
        // 卡类型改变
        selectPatType(type) {
        },
        dbClickRow(data) {
        },
        // 双击患者列表
        dbClickPatListRow(data) {
            this.patDetailInfo = data;
            this.patListDia = false;
            this.getIdPatInfo();
        },
        // 获取患者证件及就诊信息列表
        getListPatCardVist(cardNo, type) {
            if (!cardNo) {
                this.$message({
                    type: "warning",
                    message: "卡号不能为空！"
                })
                return;
            }
            if (!type) {
                this.$message({
                    type: "warning",
                    message: "请选择卡类型！"
                })
                return;
            }

            let params = {
                cardNo: cardNo, // 证件号
                type: type // 证件类型
            };
            this.$axios.get("/nurse/admissionRegister/listPatCardVisit", params).then(res => {
                if (res.success) {
                    this.patDetailInfo = {};
                    this.patVisitInfo = res.data;
                    if (!this.patVisitInfo.length) {
                        this.$message({
                            type: "warning",
                            message: "暂未查到该患者信息！"
                        })
                        this.$emit('clearForm', 'clearPatInfo');
                        return
                    };
                    if (this.patVisitInfo.length == 1) {
                        this.patDetailInfo = res.data[0];
                        this.getIdPatInfo();
                    } else {
                        this.patListDia = true;
                    }
                } else {
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
            })
        },
        // 住院登记获取患者信息
        getIdPatInfo(c) {
            let params = {
                idPat: this.patDetailInfo.idPat
            }
            this.$axios.get('/nurse/admissionRegister/getAdmissionRegistrationInfo',params).then(res => {
                if (res.success) {
                    let data = res.data;
                    let obj = {
                        patVisitInfo: this.patVisitInfo,
                        patRegInfo: data
                    }
                    this.$emit('patVisitInfoChange', obj);
                } else {
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
            })
            
        },
         //读身份证 //1身份证 0就诊卡 2医保卡
        readIDCards(cardNo, type) {
            let typeName = "";
            this.cardReaderList.forEach(li => {
                if (li.typeCode == type) {
                    typeName = li.typeName;
                }
            })
            if(typeName === '身份证') {
                this.readIdCard("1").then(res => {
                    if (res) {
                        //证件号
                        this.patNum = res.idcard;
                        this.getListPatCardVist(res.idcard, type);
                        /**addr: "河北省邢台市内丘县五郭店乡东北岭村91号"
                        birth: "19831028"
                        folk: "汉"
                        idcard: "130523198310280616"
                        name: "秦会杰"
                        sex: "男"
                        **/
                    } else {
                        this.$message({
                            message: "读卡失败，请重新读取！",
                            type: "warning"
                        });
                    }
                })
            } else if(typeName == '就诊卡'){
                this.readIdCard("0").then(res => {
                    // card: "10000172"
                    this.patNum = res;
                    this.getListPatCardVist(res, type);
                })
            } else if (typeName == '医保卡') {
                // 暂时没有
                this.readIdCard("2").then(res => {
                })
            }
            //目前不支持读 医保卡
        },
        // 查询读卡类型列表
        findCardReadList() {
            let params = {
                enabled: "1", // 启用标识
                show: "1" // 是否显示
            }
            this.$axios.post('/dict/card/listReadCardType', params).then(res => {
                if(res.success) {
                    this.cardReaderList = res.data;
                    if (this.cardReaderList.length) {
                        // 默认展示选中第一条的数据
                        this.queryPatType = this.cardReaderList.find(li=> li.checked == 1).typeCode;
                    }
                } else{
                    this.$message({
                        type: "warning",
                        message: res.message
                    })
                }
            })
        },
        // 清空查询条件
        clearQuery() {
            this.patNum = '';
            this.patDetailInfo = {};
        },
    },
    components: {
        ListPatVisit: ()=>import('./listPatientVisits/listPatientVisits'),
        patientList: () =>import('./patientList/patientList')
    }
};
</script>
<style lang="scss" scoped src="./patInfoQueryCom.scss"></style>