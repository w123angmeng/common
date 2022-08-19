<template>
    <div class="CancelAppointDialog">
         <el-dialog
            title="取消原因"
            :visible.sync="cancelAppointForm.visible"
            width="372px"
            :close-on-press-escape="false"
            :close-on-click-modal="false"
            append-to-body
            custom-class="CancelAppointDialogs">
             <el-autocomplete 
                class="noteCancelStr" 
                placeholder=""
                v-model="noteCancel" 
                :fetch-suggestions="findNoteCancelList">
            </el-autocomplete>
            <div class="cancelAppointBtns">
                <el-button @click="cancelDialog">取 消</el-button>
                <el-button type="primary" @click="confirmAppoint()" :loading="saveloading" >确 定</el-button>
            </div>
         </el-dialog>    
    </div>
</template>
<script>

    export default {
        
        name: '',
        props: ['cancelAppointForm'],
        data() {
            return {
                saveloading: false,
                noteCancel: '',
                state: '',
                timeout:  null,
                noteCancelList: [
                    { value: '患者原因调整预约时间'},
                    { value: '医生出诊时间变动'},
                ]
            }
        },
        created(){

            
        },
        mounted() {

        },
        computed: {},
        methods: {

            //取消原因模糊查询
            findNoteCancelList(query, cb) {
                var noteCancelList = this.noteCancelList;
                var results = query ? noteCancelList.filter(this.createStateFilter(query)) : noteCancelList;

                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    cb(results);
                }, 20);
            },

            createStateFilter(query) {
                return (state) => {
                    return (state.value.toLowerCase().indexOf(query.toLowerCase()) === 0);
                };
            },


             // 确认取消
            confirmAppoint() {

                if(!this.noteCancel) return this.$message.warning('取消原因不能为空！')
                console.log(this.cancelAppointForm);
               
                let Obj = {
                    idAppoint: this.cancelAppointForm.idAppoint,
                    noteCancel: this.noteCancel,
                    idEmpCancel: this.getUserStorage().idEmp
                }
                this.$axios
                    .get('/apr/appoint/cancelAppoint', Obj)
                    .then(res => {
                        if (res.success) {
                            this.$message({
                                message: '取消预约成功！',
                                type: 'success',
                            });
                            this.$emit('upDateAppointList')   //更新预约列表
                            this.cancelDialog();
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning',
                            });
                        }
                    })
                    .catch(err => {
                        this.$message.error(err.message);
                    });
            },

            //关闭弹窗
            cancelDialog() {
                this.cancelAppointForm.visible = false;
            },
  
        },
        components:{
          
        }
    }
</script>
<style lang="scss" src="./cancelAppointDialog.scss"></style>
