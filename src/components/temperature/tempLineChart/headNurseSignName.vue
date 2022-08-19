<template>
    <div class="headNurseSignName">
        <!-- 护士长授权控件 -->
        <el-dialog
            :title="dialogInfo.title"
            :close-on-click-modal="false"
            :visible.sync="showSignName"
            @close="cancel"
            width="500px"
            append-to-body
            v-dialogDrag
            class="headNurseSignNameDialog"
        >
            <el-form
                v-if="showSignName"
                label-position="left"
                label-width="0"
                :model="signForm"
                ref="signForm"
            >
                <SignName :signForm="signForm" :tootip="tootip" @canSave="canSave"></SignName>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button
                    type="primary"
                    @click="submitSignForm('signForm')"
                    :disabled="canSubmit"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
const hlwsServiceUrl = globalUrl.hlwsServiceUrl;
import SignName from "@/components/page/BaseService_WEB/signName/signName";

export default {
    props: {
        onlyHeadNurse: {
            type: Boolean,
            default: true
        },
        userInfo: {
            type: Object,
            default() {
                return {};
            }
        },
        dialogInfo: {
            type: Object,
            default() {
                return {
                    title: "授权确认"
                };
            }
        },
        // tootip: {
        //     type: Object,
        //     default() {
        //         return {
        //             show: true,
        //             tip: "请录入护士长账号，以获得信息编辑的权限！",
        //             showColor: "warn"
        //         };
        //     }
        // }
    },
    watch: {
        onlyHeadNurse: {
            handler(newVal) {
                if(newVal) {
                    this.tootip.tip = "请录入护士长账号，以获得信息编辑的权限！"
                } else {
                    this.tootip.tip = "请录入护士长或超级管理员账号，以获得信息编辑的权限！"
                }
            },
            immediate:true
        }
    },
    data() {
        return {
            showSignName: true,
            signForm: {
                userName: "",
                password: ""
            },
            canSubmit: true,
            tootip: {
                show: true,
                tip: "请录入护士长账号，以获得信息编辑的权限！",
                showColor: "warn"
            }
        };
    },
    methods: {
        cancel() {
            this.$emit("hasPower", {
                type: "cancel",
                show: false
            });
        },
        // 编辑授权--确定按钮是否可用
        canSave(info) {
            this.canSubmit = !info;
        },
        // 编辑授权--确认账号密码是否正确
        submitSignForm() {
            let param = {
                loginName: this.signForm.userName,
                password: this.$md5(this.signForm.password),
                idDept: this.userInfo.idDept,
                onlyHeadNurse: this.onlyHeadNurse ? 1 : 0 // 1 仅护士长账号、 0 护士长及超级权限账号
            };
            this.$axios
                ._post(hlwsServiceUrl + "emr/portal/headNurseLogin", param)
                .then(res => {
                    if (res.success) {
                        // this.showSignName = false;
                        let data = res.data;
                        this.$emit("hasPower", {
                            type: "success",
                            show: false,
                            msg: res.message,
                            authEmpCode: data.employeeCode,
                            authEmpName: data.employeeName,
                            authTime: data.currentDateTime,
                        });
                    } else {
                        Object.assign(this.tootip, {
                            tip: `${res.message}，未获得编辑授权，请重新输入！`,
                            showColor: "error"
                        })
                        this.$emit("hasPower", {
                            type: "error",
                            show: true,
                            msg: res.message
                        });
                    }
                });
        }
    },
    components: {
        SignName
    }
};
</script>
<style lang="scss">
    .headNurseSignNameDialog{
        .el-dialog__body {
            padding: 10px 20px 20px;
        }
    }
</style>