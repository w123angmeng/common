<template>
    <div class="AppointDetails_warp" :style="{ height: appiontBodyHeight }">
        <div class="handle-box">
            <span class="labelTitle">患者信息：</span>
            <el-input @keyup.enter.native="searchHandle" v-model="formData.patName"></el-input> 
            <span class="labelTitle">预约日期：</span>
            <el-date-picker
                v-model="beginAndendTime"
                type="daterange"
                align="right"
                unlink-panels
                :clearable="false"
                @change="changeBeginAndendTime"
                :picker-options="pickerOptions"
                range-separator="至"
                value-format="yyyy-MM-dd"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
            <el-button type="primary" @click="searchHandle" class="searchList">查 询</el-button>
        </div>    

        <div class="appointtableData_warps" :style="{ height: appointtableDataHeight }">
            <el-table
                class="appointtableDatas"
                :data="tableData"
                border
                style="width: 100%;"
                :header-cell-style="tableTitleStyle"
                :cell-style="cellStyle">
                <el-table-column prop="" label="序号" align="center" width="50px">
                    <template slot-scope="scope">
                        <span>{{scope.$index + 1}}</span>
                    </template>    
                </el-table-column>
                <el-table-column prop="visitDate" label="预约日期" align="left" width="110px"></el-table-column>
                <el-table-column prop="week" label="周" align="left"  width="70px"></el-table-column>
                <el-table-column prop="serveName" label="号别" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="" label="时间段" align="left" width="160px">
                     <template slot-scope="scope">
                        <span>{{scope.row.dayslotName}} &nbsp; {{scope.row.timeArea}}</span>
                    </template> 
                </el-table-column>
                <el-table-column prop="patCode" label="患者ID" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="patName" label="姓名" align="left"  width="90px" show-overflow-tooltip></el-table-column>
                <el-table-column prop="channelName" label="预约渠道" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="appointEmpName" label="预约人" align="left"  width="90px" show-overflow-tooltip></el-table-column>
                <el-table-column prop="" label="操作" align="left" width="90px" >
                    <template slot-scope="scope">
                        <el-button 
                            type="text"
                            @click="handlePrint(scope.row, scope.$index)">
                            打印
                        </el-button>
                        <el-button 
                            type="text"
                            @click="handleCancel(scope.row, scope.$index)">
                            取消
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 打印 -->
        <PrintDialog :paramesObj.sync='paramesObj'></PrintDialog>

        <!-- 取消预约弹窗 -->
        <CancelAppointDialog v-if="cancelAppointForm.visible" :cancelAppointForm="cancelAppointForm" @upDateAppointList="upDateAppointList"></CancelAppointDialog>
         
    </div>
</template>
<script>
import PrintDialog from '../outpPrintDialog/index.vue';
import CancelAppointDialog from '../cancelAppointDialog/cancelAppointDialog.vue';
    export default {
        
        name: '',
        props: [''],
        data() {
            return {
                time: 0,           //当前时间戳
                nowDate: [],       //当前日期
                appiontBodyHeight: null,
                appointtableDataHeight: null,
                beginAndendTime: [], //搜索日期区间
                totalPage: 0,        //总页数
                tableData: [],       //列表数据
                //列表查询参数
                formData: { 
                    pageNum: 1,       //页码
                    pageSize: 20,     //每页条数
                    beginTime: '',    //开始时间
                    endTime: '',      //结束时间
                    patName: '',      //患者信息
                    idEmp: this.getUserStorage().idEmp,      //医生id
                    empName: '',      //医生名字
                    idDept: '',       //科室id
                    idPat: '',        //患者id
                    idSchedule: '',   //排班id
                    sdAppointStatus: '1', //可预约状态
                },
                //打印需要参数
                paramesObj: {
                    title: '预约单',
                    width: '826px',
                    content: '',
                    dialogVisible: false
                },

                //取消原因参数
                cancelAppointForm: {
                    visible: false,
                    idAppoint: '',
                },

                 // 表格样式
                tableTitleStyle: {
                    fontSize: "14px",
                    color: "#1F1F1F",
                    padding: "7px 0",
                    height: "45px",
                    background: "#f5f5f5",
                },
                cellStyle: {
                    fontSize: "14px",
                    color: "#1F1F1F",
                    height: "40px"
                },

                pickerOptions: {
                    shortcuts: [
                        {
                            text: "近7天",
                            onClick: picker => {
                                const end = new Date(this.time);
                                const start = new Date(this.time);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
                                picker.$emit("pick", [start, end]);
                            }
                        },
                        {
                            text: "近一个月",
                            onClick: picker => {
                                const end = new Date(this.time);
                                const start = new Date(this.time);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 29);
                                picker.$emit("pick", [start, end]);
                            }
                        },
                        {
                            text: "近三个月",
                            onClick: picker => {
                                const end = new Date(this.time);
                                const start = new Date(this.time);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 89);
                                picker.$emit("pick", [start, end]);
                            }
                        }
                    ]
                }
            }
        },
        created(){
            this.getSystemTime();
            
        },
        mounted() {
            this.addEventListenerHeight();
            var _this = this;
            window.addEventListener('resize', function () {
                _this.addEventListenerHeight();
            })
            this.$nextTick(() => {
                document.querySelector(".appointtableDatas").addEventListener("scroll", this.handleScroll, true);
            })
        },
       computed: {
            isAtmeng() {
                return this.$limits.isFun(this)
            },
        },
        methods: {

             // 监听整体高度   自适应
            addEventListenerHeight() {
                if(!document.documentElement.clientHeight) return
                let clientHeight = document.documentElement.clientHeight;
                this.appiontBodyHeight = (clientHeight - 87) + 'px';
                this.appointtableDataHeight = (clientHeight - 259) + 'px';
            },

              //获取服务时间
            getSystemTime() {
                this.getServerTime().then(time => {
                    var dateTime = new Date(time);
                    this.time = dateTime.setDate(dateTime.getDate());
                    //初始页面默认展示今天数据
                    this.nowDate = this.formatDate(new Date(time));
                    this.formData.beginTime = this.nowDate;
                    this.formData.endTime = this.getNewDay(this.nowDate, 7);
                    this.beginAndendTime = [this.nowDate, this.formData.endTime];
                    this.getAppointDataList(1);
                });
            },

             //切换开始时间和结束时间
            changeBeginAndendTime(e) {
                if (e) {
                    this.formData.beginTime = e[0];
                    this.formData.endTime = e[1];
                    this.formData.pageNum = 1;
                    this.resetTableData();
                }
            },

            //查询预约列表
            getAppointDataList( pageNum = 1) {

                this.formData.pageNum = pageNum;

                this.$axios
                    .get('/apr/appoint/pageAppointListView', this.formData)
                    .then(res => {
                        if (res.success) {
                            this.totalPage = Math.ceil(res.data.count / this.formData.pageSize)
                            if (this.formData.pageNum == 1) this.tableData = [];
                            this.tableData = this.tableData.concat(res.data.records);
                            this.tableData.map(item=>{
                                let dtBegin = item.dtBegin.split(' ')
                                let dtEnd = item.dtEnd.split(' ')
                                item.visitDate = dtBegin[0]
                                
                                let timeAreaBegin = dtBegin[1].split(':')
                                let timeAreaEnd = dtEnd[1].split(':')
                                item.timeAreaBegin = timeAreaBegin[0] + ':' + timeAreaBegin[1]
                                item.timeAreaEnd = timeAreaEnd[0] + ":" + timeAreaEnd[1]
                                item.timeArea = item.timeAreaBegin + '-' + item.timeAreaEnd
                                item.week = this.getWeekDaysFun(item.visitDate).d2
                            })
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

            handleScroll(e) {
                let clientHeight = e.target.clientHeight; // 内容的可视区域
                let scrollTop = Math.ceil(e.target.scrollTop); //滚动条 到头部的距离
                let scrollHeight = e.target.scrollHeight; // 滚动条的总高度
                if (scrollHeight - clientHeight - scrollTop == 0) {
                    this.formData.pageNum++;
                    if (this.formData.pageNum > 1 && this.formData.pageNum <= this.totalPage) {
                        this.getAppointDataList(this.formData.pageNum);
                    }   
                }
            },

            //查询按钮
            searchHandle() {
                this.resetTableData();
            },

             //重新获取列表数据
            resetTableData() {
                document.querySelector('.el-table__body-wrapper').scrollTop = 0;
                this.formData.pageNum = 1
                this.getAppointDataList(this.formData.pageNum);
            },

            //打印
            handlePrint(row, index) {
                this.getAppointPrintModel(row.idAppoint)
            },

             //获取预约单模版
            async getAppointPrintModel (id) {
                let url = '/print/adminssion/appointPrint';
                // if(!this.isAtmeng) url = '/print/adminssion/appointPrintBR'  //博仁
                let resData = await this.$axios.post(url,{idAppoint: id})
                if (resData) {
                    this.paramesObj.content = resData;
                    this.paramesObj.dialogVisible = true;
                }
            },

             //取消
            handleCancel(row, index) {
                console.log(row);
                this.cancelAppointForm.idAppoint = row.idAppoint;
                this.cancelAppointForm.visible = true;

            },

            //更新预约列表
            upDateAppointList() {
                this.resetTableData();
            },
        },
        components:{

            PrintDialog,
            CancelAppointDialog
        }
    }
</script>
<style lang="scss" src="./appointDetails.scss"></style>
