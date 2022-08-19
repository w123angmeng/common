<template>
    <div class="outpNurseUniversalPrinting">
        <div class="contentHeader">
            <div class="headerTitle">
                <p>门诊护士通用打印</p>
            </div>
            <div class="searchHandlerWrap">
                <div>
                    <span class="labelTitle">临床科室</span>
                    <el-select 
                        filterable 
                        remote 
                        reserve-keyword
                        :remote-method="remoteIdDeptMethod" 
                        @focus="remoteIdDeptMethod('')"
                        v-model="visitParams.idDept" 
                        @change="changeSearch('dept')"
                        placeholder="请选择科室" 
                        clearable>
                        <el-option 
                            v-for="item in department" 
                            :key="item.value" 
                            :label="item.label" 
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <span class="labelTitle">号别</span>
                    <el-select 
                        filterable 
                        remote 
                        reserve-keyword
                        :remote-method="remoteNumberAliasMethod" 
                        @focus="remoteNumberAliasMethod('')"
                        v-model="visitParams.idServe" 
                        @change="changeSearch"
                        placeholder="请选择号别" 
                        clearable>
                        <el-option 
                            v-for="item in numberAliasList" 
                            :key="item.idServe" 
                            :label="item.serveName" 
                            :value="item.idServe">
                        </el-option>
                    </el-select>
                    <span class="labelTitle">患者信息</span>
                    <el-autocomplete
                    :popper-class="makeNameArray.length ? 'querySearchPatCode' : 'noSearchPatCode'"
                    v-model="patName"
                    :debounce="100"
                    :fetch-suggestions="querySearchPatCode"
                    placeholder="患者姓名/ID"
                    @select="handleSelect"
                    @focus="docnameFocus"
                    ></el-autocomplete>
                    <span class="labelTitle">就诊日期</span>
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
                    end-placeholder="结束日期"
                    ></el-date-picker>
                    <el-button type="plain" @click="searchList" class="searchList">查 询</el-button>
                </div>
            </div>
        </div>
        <el-table
            class="tbls"
            :data="tableData"
            border
            stripe
            :header-cell-style="tableTitleStyle"
            :cell-style="cellStyle"
            @row-dblclick="rowDblclickHanle"
        >
            <el-table-column prop="patCode" label="患者ID" align="left" width="110"></el-table-column>
            <el-table-column prop="patName" label="姓名" align="left" width="90">
            </el-table-column>
            <el-table-column prop="sdSexStr" label="性别" align="left" width="70"></el-table-column>
            <el-table-column prop="ageStr" label="年龄" align="left" width="80"></el-table-column>
            <el-table-column prop="chargeTypeStr" label="费别" align="left" :width= "100">
            </el-table-column> 
            <el-table-column prop="dtAccept" label="就诊日期" align="left" width="160"></el-table-column>
            <el-table-column prop="deptName" label="就诊科室" align="left" width="150"></el-table-column>
            <el-table-column prop="serveName" label="号别" align="left" show-overflow-tooltip></el-table-column>
            <el-table-column prop="doctorName" label="医生" align="left" width="90"></el-table-column>
            <el-table-column prop="sdVisitStatus" label="状态" align="left" width="50">
                <template slot-scope="scope">
                    <span>{{showStatus(scope.row.sdVisitStatus)}}</span>
                </template>
                </el-table-column>
        </el-table>
        <!-- 分页 sizes  jumper-->
        <div class="pagination" v-show="!total == 0">
            <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="visitParams.pageIndex"
            :page-sizes="pageSizes"
            :page-size="visitParams.pageSize"
            layout="total, prev, pager, next"
            :total="total"
            ></el-pagination>
        </div>
        <!-- <div class="printModelWrap" id="printModelWrap">
            <template v-if="showPrintBox">
                <OutpPrintCompAtmeng v-if="isAtmeng" :printAllVisit="idVisit" 
                    :definedParams="definedParams" :dtSign="printDtSign" ref="OutpPrintComp"></OutpPrintCompAtmeng>
                <OutpPrintComp v-else :printAllVisit="idVisit" :dtSign="printDtSign" ref="OutpPrintComp" ></OutpPrintComp>
                <div class="emptyBox" v-if="!visitedList.length">
                    <img class="simpleImgSvg" src="@/assets/images/iconSmall/simple.svg" alt />
                </div>
            </template>
        </div> -->
        <!-- 打印弹窗 -->
      <el-dialog
        class="printAllTypeDialog"
        title="打印"
        :visible.sync="printDialogVisible"
        width="1080px"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :before-close="cancelPrint">
        <div v-if="printDialogVisible">
            <!--  v-if="isAtmeng"  -->
          <OutpPrintCompAtmeng 
            :printAllVisit="idVisit" 
            :definedParams="definedParams" 
            :dtSign="printDtSign" 
            @cancelPrint="cancelPrint"
            ref="OutpPrintComp">
          </OutpPrintCompAtmeng>
          <!-- <OutpPrintComp @cancelPrint = "cancelPrint" v-else 
            :printAllVisit="idVisit" 
            :dtSign="printDtSign" 
            ref="OutpPrintComp" >
          </OutpPrintComp> -->
          <!-- <div class="emptyBox" v-if="!visitedList.length">
            <img class="simpleImgSvg" src="@/assets/images/iconSmall/simple.svg" alt />
          </div> -->
        </div>
      </el-dialog>
       
    </div>
</template>
<script>
import OutpPrintComp from "@/components/page/OutPatient_WEB/receivePatient/outpPrintComp/outpPrintComp.vue"; //门诊打印组件
import OutpPrintCompAtmeng from "@/components/page/OutPatient_WEB/receivePatient/outpPrintCompAtmeng/outpPrintComp.vue"; //阿特蒙门诊打印组件
import elementResizeDetectorMaker from 'element-resize-detector'

export default {
    data() { 

        return {
            idVisit: '', //就诊id
            printDialogVisible: false, //打印弹窗
            tableData: [], //表格数据
            total: 0, //总页数
            pageSizes: [10], //分页规则
            time: "", //系统当前时间
            nowDate: "", 
            makeNameArray: [], //患者信息集合数组
            department: [],      //科室列表
            numberAliasList: [], //号别列表
            beginAndendTime: [], //历史就诊区间值
            printDtSign: "",
            patName: "",
            showPrintBox: false,
            contanierHeight: null, //容器的高度
            visitedItem: null,  //就诊项目
            visitedList: [],  //就诊记录
            // 表格样式
            tableTitleStyle: {
                fontSize: "14px",
                color: "#1F1F1F",
                height:'40px',
                padding: "7px 0",
                background: "#f5f5f5",
            },
            cellStyle: {
                fontSize: "14px",
                color: "#1F1F1F",
                height: "40px",
                padding: "0px 0",
            },
            visitParams: {
                patCode: "", //患者编号
                idDept: "", //科室id
                idServe: "", //号别
                dtBegin: "", //开始时间
                dtEnd: "", //结束时间
                pageIndex: 1,
                pageSize: 10,
            },
            pickerOptions: {
            disabledDate: time => {
            var dateTime = new Date(this.time);
            return time.getTime() > dateTime;
            },
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
    components: {
        OutpPrintComp,
        OutpPrintCompAtmeng
    },
    computed:{
        isAtmeng(){
            return this.$limits.isFun(this)
        },
        // activedItem(){
        //     if (this.visitedList.length && (this.visitedItem || this.visitedItem == "0")) {
        //          return this.visitedList[this.visitedItem];
        //     } else {
        //         return "";
        //     }
        // },
        // idVisit(){
        //     return this.activedItem.idVisit ? this.activedItem.idVisit : "";
        // },
        definedParams(){
            return {
                hasRecordBook: true,
                // contanierHeight: this.contanierHeight || 0
            }
        }
    },
    created() {

    },
    mounted(){
        this.getSystemTime() //获取系统时间
    },
    methods: {
     
        //获取服务时间
        getSystemTime() {
        this.getServerTime().then(time => {
            var dateTime = new Date(time);
            this.time = dateTime.setDate(dateTime.getDate());
            //初始页面默认展示今天数据
            this.nowDate = this.formatDate(new Date(time));
            this.visitParams.dtBegin = this.nowDate;
            this.visitParams.dtEnd = this.nowDate;
            this.beginAndendTime = [this.nowDate, this.nowDate];
            this.searchList()
        });
        },
        // 分页导航
        handleCurrentChange(val) {
        this.visitParams.pageIndex = val;
        this.getVisitedList() //获取就诊记录
        },
        handleSizeChange(val) {
        this.visitParams.pageSize = val;
        this.getVisitedList() //获取就诊记录
        },
        docnameFocus() {
            this.makeNameArray = [];
        },
        handleSelect(item) {
            this.patName = item.patName; //页面展示名字
            this.visitParams.patCode = item.patCode; //后端查询条件
        },
        //切换开始时间和结束时间
        changeBeginAndendTime(e) {
            if (e) {
                this.visitParams.dtBegin = e[0];
                this.visitParams.dtEnd = e[1];
                this.getVisitedList() //获取就诊记录
            }
        },
        //某一行被点击
        rowDblclickHanle(row) {
            console.log('row',row)
            this.idVisit = row.idVisit //就诊id
            let itemInfo = JSON.stringify(row)
            sessionStorage.setItem('idVisitRecordParams',itemInfo);
            this.printDialogVisible = true;
        },
        //关闭打印弹窗
        cancelPrint() {
            console.log('关闭打印弹窗了')
            this.printDialogVisible = false;
        },
        // 查询列表数据
        searchList() {
            if (!this.visitParams.patCode) this.visitParams.patCode = this.patName;
            //埋点查询记录
            this.visitParams.pageIndex = 1;
            this.getVisitedList() //获取就诊记录
        },
        //患者模糊查询
        querySearchPatCode(name, callback, fn) {
        this.makeNameArray = [];
        this.visitParams.patCode = "";
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
                    let patCode = item.patCode || "";
                    let patName = item.patName || "";
                    let sdSexStr = item.sdSexStr || "";
                    let age = item.age || "";
                    let mobile = item.mobile || "";
                    newMakeList.push({
                    ...item,
                    value:
                        patCode +
                        "   " +
                        patName +
                        "   " +
                        sdSexStr +
                        "   " +
                        age +
                        "   " +
                        mobile
                    });
                });
                if (res.data.length == 0) this.visitParams.patCode = "";
                this.makeNameArray = newMakeList;
                callback(newMakeList);
                } else {
                this.$message({
                    message: res.message,
                    type: "warning"
                });
                }
            });
        } else {
            this.makeNameArray = [];
            callback(this.makeNameArray);
            this.visitParams.patCode = "";
        }
        },
        // 获取门诊科室（部门）
        remoteIdDeptMethod(query = '') {
                this.$axios
                .get('/sch/serve/findServeDeptList',{deptName: query})
                .then(res => {
                    if (res.success) {
                        this.department = res.data;
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
        //号别列表  
        remoteNumberAliasMethod(query = '', flag) {
            this.$axios._post("/sch/serve/pageScServe", {
                enabled: 1,
                idDept: this.visitParams.idDept,
                idEmp: "",
                pageIndex: 1,
                pageSize: 20,
                serveName: query,
                channelCode: '04',  //渠道编码
            }).then(res => {
                if (res.success) {
                    this.numberAliasList = res.data.records;
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },
        //切换筛选条件
        changeSearch(val) {
            if(val == 'dept') {
                this.visitParams.idServe = ''
                }
        },
        showStatus(num) {
            switch (num) {
                case this.CONSTANT.NOT_CLOSE_VISIT_STATUS:
                return "未诊";
                break;
                case this.CONSTANT.VISITING_STATUS:
                return "诊中";
                break;
                case this.CONSTANT.VISITED_STATUS:
                return "已诊";
                break;
                case this.CONSTANT.CLOSE_VISIT_STATUS:
                return "诊毕";
                break;
                default:
                return "";
                break;
            }
            },
        //获取就诊记录
        getVisitedList() {
            this.$axios.post("/reg/visit/pageNurseVisitIn", this.visitParams).then(res => {
            if (res.success) {
                 this.tableData = res.data.records;
                 this.total = res.data.count;
                 this.pageSizes = this.hisPageSizes(
                        res.data.count,
                        this.visitParams.pageSize
                    );
            } else {
                this.$message.warning(res.message);
            }
        });
        },
        //清空数据
        clearParams(){
             this.showPrintBox = false;
             this.visitedItem = null,  //就诊项目
             this.visitedList =  [],  //就诊记录
             this.visitParams.patCode = ""
        },
        //关闭打印弹窗
        handlePrintClear() {
            this.$refs.OutpPrintComp.printNum = "";
        },

    },
    destroyed(){
        sessionStorage.removeItem('idVisitRecordParams');
    }
}
</script>
<style lang="scss" src="./index.scss"></style>