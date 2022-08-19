<template>
    <div class="AppointTab_warp">
        <el-tabs v-model="activeName">
            <el-tab-pane label="诊间预约" name="clinicAppoint">
               <ClinicAppoint v-if="activeName === 'clinicAppoint'" :patInfoHandle="dataInfoPat" :sourceFLag="sourceFLag" @curPatInfoParmas="curPatInfoParmas"></ClinicAppoint>
            </el-tab-pane>
             <el-tab-pane label="预约详情" name="appointDetails">
                <AppointDetails  v-if="activeName === 'appointDetails'" :sourceFLag="sourceFLag"></AppointDetails>
            </el-tab-pane>
        </el-tabs>  
        <span class="appPatInfoTitle">
            <el-autocomplete
            :popper-class="makeNameArray.length ? 'querySearchPatCode' : 'noSearchPatCode'"
            v-model="patName"
            :debounce="100"
            :fetch-suggestions="querySearchPatCode"
            placeholder="请输入患者姓名/ID"
            @select="handleSelect"
            @focus="docnameFocus"
            ></el-autocomplete>
            <span>患者编码: {{patInfoParmas.patCode}}</span>
            <span>患者姓名: {{patInfoParmas.patName}}</span>
            <span>性别: {{patInfoParmas.sdSexStr}}</span>
            <span>年龄: {{patInfoParmas.age}}</span>
        </span>  
    </div>
</template>
<script>
 import { mapMutations, mapGetters } from 'vuex';
 import ClinicAppoint from '../clinicAppoint.vue';
 import AppointDetails from '../appointDetails/appointDetails.vue';
 const SOURCE_DOC_FLAG = '住院医生';  //住院医生来源

    export default {
        props: ['sourceFLag'],
        data() {
            return {
               activeName: 'clinicAppoint',
               patInfoParmas: {},
               patName: '',            //搜索框名称
                makeNameArray: [],
                dataInfoPat: '',
            }
        },
        computed: {
            ...mapGetters(['docPatientParams']),
        },
        components:{
            ClinicAppoint,
            AppointDetails
        },
        methods: {
            curPatInfoParmas(data) {
                this.patInfoParmas = data;
            },
             //患者模糊查询
            querySearchPatCode(name, callback, fn) {
                this.makeNameArray = [];
                this.patInfoParmas.patCode = '';
                if (name) {
                    this.$axios
                        .post("reg/pat/findByPatName", {
                            patName: name
                        })
                        .then(res => {
                            if (res.success) {
                                let newMakeList = [];
                                let dataMake = res.data;
                                dataMake.map(item => {
                                    let patCode = item.patCode || '';
                                    let patName = item.patName || '';
                                    let sdSexStr = item.sdSexStr || '';
                                    let age = item.age || '';
                                    let mobile = item.mobile || '';

                                    newMakeList.push({
                                        ...item,
                                        value: patCode + "   " + patName +
                                            "   " +
                                            sdSexStr +
                                            "   " +
                                            age +
                                            "   " +
                                            mobile,
                                    });
                                });
                                if(res.data.length == 0) {
                                    this.patInfoParmas.patCode = '';
                                }
                                this.makeNameArray = newMakeList;
                                callback(newMakeList);
                            } else {
                                this.$message({
                                    message: res.message,
                                    type: "warning"
                                });
                            }
                        })
                }  else {
                    this.makeNameArray = [];
                    callback(this.makeNameArray);
                    this.patInfoParmas.patCode = "";
                }      
            },
            docnameFocus(){
                this.makeNameArray = [];
            },

            handleSelect(item) {
                this.patName = item.patName;          //页面展示名字
                this.patInfoParmas.patCode = item.patCode;  //后端查询条件
                this.patInfoParmas.patName = item.patName;  //后端查询条件
                this.patInfoParmas.sdSexStr = item.sdSexStr;  //后端查询条件
                this.patInfoParmas.age = item.age;  //后端查询条件
                this.dataInfoPat = item
            },
        }
    }
</script>
<style lang="scss" src="./appointTab.scss"></style>
