<template>
    <!-- 选择护理单元弹窗组件 -->
    <div class="nursingUnit">
        <el-form ref="ruleForm" :model="formData" :rules="rules">
            <div class="nurDepartBox">
                <el-form-item :label="labels" prop="value">
                    <el-select @change="handleChange" class="unitSelect" v-model="formData.value" placeholder="请选择">
                        <el-option v-for="(item,index) in NursingArr" :key="index" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
            </div>
        </el-form>
        <div class="footer-div">
            <el-button class="btn diaLogBtn" type="primary" @click="confirmDialog('ruleForm')">确认</el-button>
            <el-button class="btn diaLogBack" @click="handleBack">返 回</el-button>
        </div>
    </div>
</template>
<script>
    import {
        mapGetters,
        mapMutations
    } from 'vuex';
    export default {
        props: {
            NursingArr: Array,
            checkDeptStatus: Boolean,
            isinpatientWard: Boolean
        },
        data() {
            return {
                labels: this.isinpatientWard ? '请选择病区' : '请选择护理单元',
                Nurslabel: "",
                userData: "",
                userIdEmp: "",
                formData: {
                    value: '',
                    label: ''
                },
                rules: {
                    value: [{
                        required: true,
                        message: '请选择护理单元',
                        trigger: 'change'
                    }],
                }
            };
        },
        computed: {
            ...mapGetters(["docAdState"])
        },
        methods: {
            ...mapMutations(['SET_DOCADSTATE']),
            //返回按钮处理
            handleBack() {
                this.checkDeptStatus ? this.$emit('backBtn') : this.backRouter()
            },
            //切换护理单元时，改变上级科室id
            handleChange(e) {
                this.NursingArr.map(item => {
                    if (e == item.value) {
                        this.Nurslabel = item.label
                    }
                })
            },
            //提交form
            confirmDialog(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        // 给父组件传护理单元名字和id
                        let obj = {
                            label: this.Nurslabel,
                            value: this.formData.value
                        }
                        this.$emit('benInfoShow', obj)
                        this.resetForm(formName)
                        this.$emit("getDepartmentInfo")
                        if (this.checkDeptStatus) {
                            this.$emit("getOwnColor") //切换护理单元时还原筛选条件颜色
                        }
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            //重置form
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            cancelBedViewDialog() {
                resetForm("ruleForm")
            }
        },
        mounted() {},
        created() {}
    };
</script>
<style lang="scss" src="./nursingUnit.scss"></style>