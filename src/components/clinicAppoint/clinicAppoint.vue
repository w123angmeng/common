<template>
    <div class="ClinicAppoint">
        <div class="appointContent" :style="{ height: appiontBodyHeight }">
            <div class="appointLf">
                <span class="labelTitle">科室</span>
                <el-select 
                    filterable 
                    remote 
                    reserve-keyword
                    :remote-method="remoteIdDeptMethod" 
                    @focus="remoteIdDeptMethod('')"
                    v-model="searchForm.idDept" 
                    @change="changeSearch('dept')"
                    :disabled="departDisabled"
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
                    v-model="searchForm.serveName" 
                    @change="changeSearch"
                    :disabled="serveNameDisabled"
                    placeholder="请选择号别" 
                    clearable>
                    <el-option 
                        v-for="item in numberAliasList" 
                        :key="item.idServe" 
                        :label="item.serveName" 
                        :value="item.serveName">
                    </el-option>
                </el-select>
                <span class="labelTitle">人员</span>
                <el-select 
                    filterable 
                    remote 
                    reserve-keyword
                    :remote-method="remoteEmpMethod" 
                    @focus="remoteEmpMethod('')"
                    v-model="searchForm.idEmp" 
                    placeholder="请选择医生" 
                    @change="changeSearch"
                    :disabled="doctorDisabled"
                    clearable>
                    <el-option 
                        v-for="item in doctors" 
                        :key="item.value" 
                        :label="item.label" 
                        :value="item.value">
                    </el-option>
                </el-select>

                <div class="numberAliasList" :style="{ height: numberAliasHeight }">
                    <div 
                        class="itemNumber" 
                        v-for="(item, index) in commitNumberList" 
                        :key="index" 
                        :class="item.idServe === curNumberTreeIndex.idServe ? 'curNumberTree' : ''" 
                        @click="dbClickCurNumber(item, index)">
                        <el-tooltip  v-if="item.serveName && item.serveName.length > 12" class="item" effect="dark" :content="item.serveName" placement="right-start">
                            <div class="numberTitle">{{item.serveName}}</div>
                        </el-tooltip>
                        <div v-else class="numberTitle">{{item.serveName}}</div>
                        <el-tooltip  v-if="showTip(item)" class="item" effect="dark" :content="showContent(item) " placement="right-start">
                            <div class="empTitle" >
                                <span>{{item.empName}}</span>
                                <span v-if="item.className">（{{item.className}}）</span>
                            </div>
                        </el-tooltip>
                        <div v-else class="empTitle" >
                            <span>{{item.empName}}</span>
                            <span v-if="item.className">（{{item.className}}）</span>
                        </div>
                        <div v-if="item.price !== null" class="itemPrice">{{item.price}} 元</div>
                    </div>
                </div>
            </div>
            <div class="appointRt">
                <div class="contentData"  >
                    <div class="fl" :style="{ height: appointListHeight }" v-if="curNumberTreeIndex.idServe">
                        <!-- 月视图 -->
                        <CalendarModel 
                            v-if="!calendarModelStatus"
                            :idServe="idServe"
                            :idDept="idDept"
                            @clickDayGetCurAppiont="clickDayGetCurAppiont"
                            @changeCalenMonth="changeCalenMonth"
                            @appendMarkMoreColor="appendMarkMoreColor"
                            @updateSearchOneMonthStatus="updateSearchOneMonthStatus"
                            ref="CalendarModel">
                        </CalendarModel>
                        
                        <p class="appointList" @dblclick="goAppoint(item)" v-for="(item,index) in appointList" :key="index">
                            <span class="date">{{item.date}}</span>
                            <span class="week">{{item.week}}</span>
                            <span class="time">{{item.dayslotsName}}</span>
                            <span class="timeArea">{{item.timeBegin + ' - ' + item.timeEnd}}</span>
                            <span class="a_number" v-if="item.surplusNumber > 0 ">余号：{{item.surplusNumber}}</span>
                            <span class="a_noNumber" v-else>已约满</span>
                        </p>
                        
                        <span v-if="!searchOneMonthStatus && !searchOneAppointDtStatus && curDayIndex && !appointList.length">
                             <!-- 无排班tip  -->
                            <span class="noData" v-if="!curDayIndex.idServe">当天无排班，请查看其他日期号源</span>
                        </span>
                         <span v-if="!searchOneMonthStatus && curDayIndex && curDayIndex.idServe">
                            <!-- 约满tip -->
                            <span class="noData" v-if="curDayIndex.amountAppt === curDayIndex.amountUsed">当天已无号，请查看其他日期号源</span>
                        </span>
                        
                    </div>
                    <div v-else class="fl"></div>
                    <div class="fr"  v-show="this.recordList.length">
                        <div class="title">已预约记录</div>
                        <div ref="recordList" class="recordList" :style="{ height: recordListHeight }">
                            <div v-for="(item,index) in recordList" :key="index" class="record">
                                <p>就诊日期：{{item.visitDate}}&nbsp;&nbsp;{{item.week}}</p>
                                <p>就诊时段：{{item.dayslotName}} {{item.timeArea}}</p>
                                <p>就诊诊室：{{item.deptName}}</p>
                                <p>号&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别：{{item.serveName}}</p>
                                <p>医&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;生：{{item.empName}}</p>
                                <p>医生服务费: {{item.servePrice}}
                                    <span class="cancel">
                                        <el-button @click="printAgainAppoint(item)" type="text">打印</el-button>
                                        <el-button @click="cancelAppoint(item)" type="text">取消</el-button>
                                    </span>
                                
                                </p>
                                <span class="line"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <PrintDialog :paramesObj.sync='paramesObj' ref="child" :isFromHisInpDoctor="isFromHisInpDoctor"></PrintDialog>

         <!-- 取消预约弹窗 -->
        <CancelAppointDialog v-if="cancelAppointForm.visible" :cancelAppointForm="cancelAppointForm" @upDateAppointList="upDateAppointList"></CancelAppointDialog>
    </div>
</template>
<script>
    import { mapMutations, mapGetters } from 'vuex';
    import PrintDialog from './outpPrintDialog/index.vue';
    import moment from 'moment';
    import CalendarModel from './calendarModel/calendarModel.vue';
    import CancelAppointDialog from './cancelAppointDialog/cancelAppointDialog.vue';

    const SOURCE_DOC_FLAG = '住院医生';  //住院医生来源

    export default {
        name: '',
        props: ['patInfo', 'sourceFLag', 'patInfoHandle'],
        data() {
            return {
                extraAptSign: 0,    //需要麻醉 1 不需要麻醉 0 （阿特蒙）
                searchOneMonthStatus: false,
                calendarModelStatus: false,
                idEmps: '', //根据号别查到的医生id
                empNames: '', //根据号别查到的医生姓名
                showListData: false,
                nowHms: '', //当前时分秒
                beginTime: '', //挂号开始时间
                forWardDays: 0, //提前放号天数
                sourceOrigin: '', //来源
                // serveIdDept: '', //当前登录医生出诊号别的科室
                idEmpDoc: '', //人员id
                // serveIdEmp: '', //号别医生id
                // idEmpDoctor: '', //接诊医生id
                doctorName: '', //医生名称
                serveName: '', //号别名称
                idPat: '', //德州二院患者id
                chargeTypeCode: '1', //德州二院费别
                sdSex: '', // 德州二院性别
                patCode: '', //德州二院患者编码
                curPrice: 0, //价格字段
                saveItem:{}, //用来备份获取号别列表的对象
                departDisabled: false, //科室是否可输入
                serveNameDisabled: false, //号别是否可输入
                doctorDisabled: false, //人员是否可输入
                noData: false, //是否展示暂无数据
                pageNum: 1,
                pageSize:10,
                recordTotalPage: 0,
                curIdSchedule: '', //排班id
                pageIndex: 1,
                // totalPage: 0,  //总页数
                searchDate: '', //搜索日期
                nowDate: '',   //当前日期
                curPageIndex: 1, //当前页
                totalPages: 0,    //总页数
                idServe: '',     //号别id
                idDept: '',      //科室id
                idEmp: '', //医生id
                empName: '', //医生姓名
                beginDate: '',   //开始时间
                endDate: '',     //结束时间
                curDayIndex: null, //周的 当天
                countAppoitList: [],
                appointList:[],
                copyAppointList: [],
                commitAppointList: [],
                idScheduleLength: 0,   //排班id长度
                recordList: [],

                randomNum: '',    //随机数1
                randomNum2: '',    //随机数2

                searchAppointDtStatus: false,
                searchOneAppointDtStatus: false,
                // 查询条件
                searchForm: {
                    idDept: '',  //科室
                    serveName: '', //号别
                    idEmp: '',   //医生
                },

                //取消原因参数
                cancelAppointForm: {
                    visible: false,
                    idAppoint: '',
                },

                appiontBodyHeight: 0,

                numberAliasHeight: 0,   // 号别高度
                recordListHeight: 0, //已预约记录高度
                appointListHeight: 0, //号段列表高度
                curNumberTreeIndex: {},

                department: [],      //科室列表
                numberAliasList: [], //号别列表
                doctors: [],         //医生列表
                numberAliasTreeList: [], //号别列表
                commitNumberList: [],
                paramesObj: {
                    title: '预约单',
                    width: '826px',
                    content: '',
                    dialogVisible: false
                }
            }
        },
        created(){
            
            this.getServerTimeData();
            

            //二院来源
            if(this.patInfo) {
                this.patCode = this.patInfo.patCode
                
            } else {
                //住院医生来源
                if(this.isFromHisInpDoctor) {

                    this.patCode = this.docPatientParams.patCode;
                    //住院医生直接默认选中当前医生
                    this.remoteEmpMethod('');
                    // 2021-6.15注释  ---  不默认带出医生
                    // this.searchForm.idEmp = this.getUserStorage().idEmp;
                    this.getNumberAliasList(1);  //过滤号别列表

                } else {
                    console.log('门诊来源');
                    //门诊来源
                    this.patCode = sessionStorage.getItem('receivePatientParams') ? JSON.parse(sessionStorage.getItem('receivePatientParams')).patCode : ''
                }
            }
            if(sessionStorage.getItem('receivePatientParams') && this.$route.query.idVisit){
                this.findClinicItemForNarcos();   //阿特蒙
                this.findPatInfo(this.patCode)       
            }
            
        },
        mounted() {
            if(this.$route.query) {
                if(this.$route.query.idDept) {
                    this.idDept = this.$route.query.idDept;
                }
                if(this.$route.query.serveName) {
                    this.serveName = this.$route.query.serveName;
                }
                if(this.$route.query.doctorName) {
                    this.doctorName = this.$route.query.doctorName;
                }
           
                if(this.$route.query.idEmp) {
                    this.idEmpDoc = this.$route.query.idEmp;
                }
                if(this.$route.query.sourceOrigin) {
                    this.sourceOrigin = this.$route.query.sourceOrigin;
                }
                
                //住院医生来源不需要调参数管控
                if(!this.isFromHisInpDoctor) this.getSystemIdAndParam()
            } else {
                this.getSystemIdAndParam()
            }
            
            this.$nextTick(() => {
                document.querySelector(".numberAliasList").addEventListener("scroll", this.handleScroll, true);
                document.querySelector(".recordList").addEventListener("scroll", this.handleRecordScroll, true);
            })
            this.addEventListenerHeight();
            var _this = this;
            window.addEventListener('resize', function () {
                _this.addEventListenerHeight();
            })
            
        },
        computed: {
            ...mapGetters(['docPatientParams']),
            isAtmeng() {
                return this.$limits.isFun(this)
            },
            //来源 号源池客户端
            isFromEyuan() {
                return this.sourceOrigin == '01'
            },
            isFromHisInpDoctor() {
               return this.sourceFLag === SOURCE_DOC_FLAG
            },
            duringSourceFlag() {
                // 如果来源于号源池页面，增加duringSource参数， 门诊传0住院传1
                if(this.isFromEyuan) return this.$route.query.duringSource
                if(this.isFromHisInpDoctor) return '1'
                return '0'
            },
        },
        watch: {
             'patInfoHandle':{
                handler(val){
                    this.findPatInfo(val.patCode)
                     this.patCode = val.patCode
                     this.idPat = val.idPat
                     this.chargeTypeCode = val.chargeTypeCode
                     this.sdSex = val.sdSex
                }
            },
        },
        methods: {

            // 监听整体高度   自适应
            addEventListenerHeight() {
                if(!document.documentElement.clientHeight) return
                let clientHeight = document.documentElement.clientHeight;
                this.appiontBodyHeight = (clientHeight - 103) + 'px';
                this.numberAliasHeight = (clientHeight - 246) + 'px';
                // this.numberAliasHeight = (clientHeight - 276) + 'px';
                // this.recordListHeight = (clientHeight - 360) + 'px';
                this.recordListHeight = (clientHeight - 230) + 'px';
                // this.appointListHeight = (clientHeight - 270) + 'px';
                this.appointListHeight = (clientHeight - 145) + 'px';
            },

             handleScroll(e){
                let clientHeight = e.target.clientHeight; // 内容的可视区域
                let scrollTop = Math.ceil(e.target.scrollTop); //滚动条 到头部的距离
                let scrollHeight = e.target.scrollHeight; // 滚动条的总高度
                if (scrollHeight - clientHeight - scrollTop == 0) {
                    this.pageIndex++;
                    if (this.pageIndex > 1 && this.pageIndex <= this.totalPage) {
                        this.getNumberAliasList(this.pageIndex);
                    }
                }
            },
            handleRecordScroll(e) {
                let recordClientHeight = e.target.clientHeight; // 内容的可视区域
                let recordScrollTop = Math.ceil(e.target.scrollTop); //滚动条 到头部的距离
                let recordScrollHeight = e.target.scrollHeight; // 滚动条的总高度
                if (recordScrollHeight - recordClientHeight - recordScrollTop == 0) {
                    this.pageNum++;
                    if (this.pageNum > 1 && this.pageNum <= this.recordTotalPage) {
                        this.getAppointRecord(this.pageNum);
                    }   
                }
            },
            
             // 查询当前就诊是否包含需要自动预约麻醉的诊疗项目 (阿特蒙使用)
            findClinicItemForNarcos() {
                this.$axios.get("/outpdr/order/findClinicItemForNarcos", {
                    idPat: this.$route.query.idPat,
                    idVisit: this.$route.query.idVisit,
                }).then(res => {
                    if (res.success) {
                        this.extraAptSign = res.data === 1  ? 1 : 0;
                    } else {
                        this.$message({
                            message: res.message,
                            type: 'warning',
                        })
                    }
                })
            },

            // 查询患者信息
            findPatInfo(patCode) {
                this.$axios
                .get("/reg/pat/findPatByCode", {
                    patCode: patCode
                }).then(res => {
                    if (res.success) {
                       this.idPat = res.data.idPat //德州二院患者id
                       this.patName = res.data.patName
                       this.idPat = res.data.idPat
                       this.sdSex = res.data.sdSex // 德州二院性别
                       this.patCode = res.data.patCode //德州二院患者编码
                       this.$emit('curPatInfoParmas', res.data)
                       this.getAppointRecord()
                    } else {
                        this.$message({
                            message: res.message,
                            type: 'warning',
                        })
                    }
                    this.readerLoading = false
                })
            },
            //获取系统时间
            async getServerTimeData() {
                 await this.getServerTime('ymdHms').then((time)=> {
                     var dateValue = time.split(' ')
                    this.nowDate = dateValue[0];

                    var dateTime = new Date(this.nowDate);
                    dateTime = dateTime.setDate(dateTime.getDate() + 1);
                    var t = moment(dateTime).format('YYYY-MM-DD');
                    this.searchDate = t
                    this.nowHms = dateValue[1]
                })
            },
          
            //比较两个时间（时分格式）的大小
            CompareDate(t1,t2){
                var date = new Date();
                var a = t1.split(":");
                var b = t2.split(":");
                if(a.length == 3 && b.length == 3) {
                if(date.setHours(a[0],a[1],a[2]) > date.setHours(b[0],b[1],b[2])) {
                    return true
                } else {
                    return false
                }
                } else if(a.length == 2 && b.length == 2) {
                if(date.setHours(a[0],a[1]) > date.setHours(b[0],b[1])) {
                    return true
                } else {
                    return false
                }
                }
            },
            // 门诊参数管控
            getSystemIdAndParam() {
                let Obj = {
                    systemId: '1',
                    paramTypeCode: 'clinic_appoint_control'
                }

                let idDept = sessionStorage.getItem('receivePatientParams') ? JSON.parse(sessionStorage.getItem('receivePatientParams')).idDept : ''
                let serveName = sessionStorage.getItem('receivePatientParams') ? JSON.parse(sessionStorage.getItem('receivePatientParams')).serveName : this.serveName
                this.remoteIdDeptMethod()
                this.$axios.post("/dict/conf/listBySystemIdAndParamTypeCodeForDefaultValue", Obj).then(res => {
                    if (res.success) {
                        if(!idDept){
                            this.searchForm.idDept = ''
                        }else {
                            this.searchForm.idDept = idDept || '' //科室
                            this.searchForm.serveName = serveName || '' //号别
                        }
                        // this.getNumberAliasList(1, 1);
                        this.remoteNumberAliasMethod('',true) //获取号别列表
                        
                        if(res.data[0] == '0') {
                            //医生
                            this.departDisabled = true
                            this.serveNameDisabled = true
                            this.doctorDisabled = true
                            
                        } else if(res.data[0] == '1') {
                            // 科室
                            this.departDisabled = true
                        } else if(res.data[0] == '2') {
                            //全院
                        }
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            // 根据号别id查询医生
            findEmpById(id, flag) {
                this.$axios
                    .post('/sch/serve/findScServeById',{idServe: id})
                    .then(res => {
                        if (res.success) {
                            this.idEmps = res.data.idEmp
                            this.empNames = res.data.empName
                            // 是否有号别医生id
                            if(this.idEmps) {
                                this.searchForm.idEmp = this.idEmps
                                this.getNumberAliasList(1, true); //过滤号别
                                this.remoteEmpMethod('')
                            } else {
                                // 获取接诊医生id

                                this.searchForm.idEmp = ''
                            }
                            if(flag && !this.idEmps) this.getNumberAliasList(1, true);
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
                    idDept: this.searchForm.idDept,
                    idEmp: "",
                    pageIndex: 1,
                    pageSize: 20,
                    serveName: query,
                    channelCode: '04',  //渠道编码
                    ticketSource: 0,
                }).then(res => {
                    if (res.success) {
                        this.numberAliasList = res.data.records;
                        this.searchForm.serveName = res.data.records[0].serveName
                        if(this.$route.query){
                            this.searchForm.serveName = ''
                        }
                        if(this.searchForm.serveName) {
                            this.numberAliasList.map(item=>{
                                if(item.serveName == this.searchForm.serveName) {
                                    this.findEmpById(item.idServe, flag)
                                }
                            })
                        }
                        if(flag && !this.searchForm.serveName) this.getNumberAliasList(1, true);
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            //医生模糊查询
            remoteEmpMethod(query = '') {
                this.doctors = [];
                 this.$axios
                    .get('/sch/serve/findServeEmpList',{empName: query,idDept:this.searchForm.idDept})
                    .then(res => {
                        if (res.success) {
                            this.doctors = res.data;
                            this.searchForm.idEmp = this.getUserStorage().idEmp
                            if(this.$route.query){
                                this.searchForm.idEmp = ''
                            }
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

            //显示名字
            showTip(item) {
                let empName = item.empName || '';
                let className = item.className || '';
                let Str = empName + className;
                if(Str.length >=7) {
                    return true
                }
                return false
            },
            showContent(item) {
                let empName = item.empName || '';
                let className = '(' + item.className + ')' || '';
                return empName + className;
            },

            changeSearch(val) {
                this.showListData = false
                if(val == 'dept') {
                    this.searchForm.serveName = ''
                    this.searchForm.idEmp = ''
                }
                this.pageIndex = 1;
                document.querySelector('.numberAliasList').scrollTop = 0;
                this.curNumberTreeIndex = {};
                this.getNumberAliasList(this.pageIndex, true);
                this.countAppoitList = [];
                this.appointList = [];
                this.commitAppointList = [];
            },

            // 过滤号别
            getNumberAliasList(pageIndex, isFirst) {
                this.$axios._post("/sch/serve/pageScServe", {
                    enabled: 1,
                    idDept: this.searchForm.idDept,
                    idEmp: this.searchForm.idEmp,
                    pageIndex: pageIndex,
                    pageSize: 20,
                    serveName: this.searchForm.serveName,
                    channelCode: '04',  //渠道编码
                    ticketSource: 0,
                }).then(res => {
                        if (res.success) {

                            this.totalPage = Math.ceil(res.data.count / 20)
                            if (pageIndex == 1) this.numberAliasTreeList = [];
                            this.numberAliasTreeList = this.numberAliasTreeList.concat(res.data.records);


                            let numArr = this.numberAliasTreeList || [];
                            let idServeList =  numArr.map( v => { return v.idServe});
                            
                            this.getPriceServeList(numArr, idServeList, isFirst)
                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            });
                        }
                    });

            },

            // 根据号别查收费
            getPriceServeList( numArr, idServeList, isFirst) {
                let chargeTypes = '';
                 //住院医生来源
                if(this.isFromHisInpDoctor) {
                    chargeTypes = this.docPatientParams.chargeTypeCode;
                } else {
                    //门诊 或 二院
                    chargeTypes = sessionStorage.getItem('receivePatientParams') ? JSON.parse(sessionStorage.getItem('receivePatientParams')).chargeTypeCode : this.chargeTypeCode
                }
                this.$axios._post("/sch/serve/listPriceByIdServes", {
                    idServeArray: idServeList,
                    chargeType: chargeTypes
                }).then(res => {
                        if (res.success) {
                            let arr = res.data || [];
                            let result = []
                            result = arr.filter(its => {
                                return its.price > 0 
                            })
                            this.numberAliasTreeList.map( v=> {
                                result.map( itm => {
                                    if(v.idServe === itm.idServe)  {
                                        v.price = itm.price;
                                    }
                                })
                            })
                            this.commitNumberList = this.copyObject( this.numberAliasTreeList)
                            //诊间预约 默认选中第一项
                            if( isFirst && this.commitNumberList.length) {
                                this.dbClickCurNumber(this.commitNumberList[0], 0)
                            }
                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            });
                        }
                    });

            },

            //双击某一个号别
            dbClickCurNumber(item, index) {
                // console.log("双击");
                // console.log('item989898',item)
                this.calendarModelStatus = true;
                this.$nextTick(()=> {
                    this.calendarModelStatus = false;
                })
                this.curPrice = item.price
                this.curNumberTreeIndex = item;
                this.idServe = item.idServe;
                this.idDept = item.idDept;
                this.idEmp = item.idEmp || ''
                this.empName = item.empName || ''
                this.curPageIndex = 1;

                this.countAppoitList = [];
                this.appointList = [];
                this.commitAppointList = [];
                this.showListData = false;
            },
          

            // 获取号别列表
            async getNumaliasData(val, randomNum) {

                this.appointList = [];
                this.commitAppointList = [];
                this.showListData = false

                let params = {
                    idDept: this.idDept, //科室
                    idEmp: this.idEmp, //医生
                    idServe: this.idServe, //号别
                    channelCode: '04',
                    date: val.days
                }
                this.searchOneAppointDtStatus = true;
                const resData = await this.$axios.get('/apr/appoint/mainPageView',params);

                if (resData.success) {
                     setTimeout(()=> {
                        if(!this.curDayIndex) return
                         
                        if(this.randomNum === randomNum && resData.data.length) {
                            this.copyAppointList = [];
                            this.$nextTick(()=> {
                                this.idScheduleLength = resData.data.length;
                                resData.data.map((item,index)=>{
                                    // 请求接口之前先打标记  -- 随机码
                                    this.randomNum2 = Math.random().toString(36).substr(2);

                                    // setTimeout(()=> {
                                        this.getTimeAreaList(item,index,val, this.randomNum ,this.randomNum2)
                                    // },200)
                                })
                            })
                        }
                    },50)
                    this.searchOneAppointDtStatus = false;
                }  else {
                    this.$message({
                        message: resData.message,
                        type: "warning"
                    });
                    this.searchOneAppointDtStatus = false;
                    
                }
            },
            // 获取时间段列表
           async getTimeAreaList(i,idx,val) {
                let Obj = {
                    idSchedule: i.idSchedule, //排班id
                    channelCode: '04', //渠道编码
                }
               await this.$axios.get("/apr/appoint/listUsefulApptTimeArea", Obj).then(res => {
                if (res.success) {
                    let commitAppList = [];
                    res.data.list.map(item=>{
                        commitAppList.push({
                            surplusNumber: i.amountTotal - i.amountUsed,
                            date: val.days,
                            week: this.getWeekDaysFun(val.days).d2,
                            dayslotsName: i.dayslotsName,
                            timeBegin: item.timeBegin,
                            timeEnd: item.timeEnd,
                            idSchedule: i.idSchedule,
                            idTickets: item.idScheduleTickets ? item.idScheduleTickets : '',
                            idTicket:  item.idTicket ? item.idTicket : '',  
                        })
                    })
                    // 组装拼接成为二维数组
                    this.$set(this.copyAppointList,idx,commitAppList);
                    // 如果循环到最后下标  二维数组降为一维数组
                    if(idx === this.idScheduleLength -1) {
                        this.$nextTick(()=>{
                            setTimeout(()=>{
                                //不是同一天 
                                if(this.curDayIndex.days === val.days) {
                                    let copyAppointArr = this.copyObject(this.copyAppointList)
                                    copyAppointArr.map(item=>{
                                        item.map(i=>{
                                            // this.appointList.push(i) 
                                            this.commitAppointList.push(i);
                                        })
                                    })
                                } 

                                if(!this.curDayIndex) this.appointList = [];
                                this.showListData = true

                                // 去重
                               this.appointList = [];
                               let backUpObj = {};
                               this.commitAppointList.map( (v,i) => {
                                    if(!backUpObj[this.commitAppointList[i].idSchedule]) {
                                        this.appointList.push(this.commitAppointList[i])
                                        backUpObj[this.commitAppointList[i].idSchedule] = true
                                    }
                                })

                            },200)
                        })
                    }
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                    this.showListData = true
                }
                });
            },
            
            //点击某一天获取当前预约列表
            clickDayGetCurAppiont(oneDay) {
                // console.log("---点击 ---", oneDay);
                this.appointList = [];
                this.commitAppointList = [];
                this.showListData = false
                this.copyAppointList = [];
                this.getCurAppointList(oneDay)
            },

            //切换月历的月份
            changeCalenMonth() {
                this.appointList = [];
                this.commitAppointList = [];
                this.curDayIndex = null;
            },

            //切换日期自动切换月份  追加选中颜色
            appendMarkMoreColor(flag) {
                // console.log("追加选中颜色---", flag, this.curDayIndex);
                let appendDay = '';
                let tomorrowDay =  this.getNewDay(this.nowDate, 1);
                if(flag === 'first') {
                    // 第一次默认选中明天
                    // appendDay = tomorrowDay
                } else {
                    //选中的某一天
                    appendDay = this.curDayIndex === null  ? '' : this.curDayIndex.days
                }
                if(!appendDay) return
                this.$refs.CalendarModel.curMarkDay(appendDay);
            },

            // 更新月历视图接口请求成功状态
            updateSearchOneMonthStatus(e) {
                this.searchOneMonthStatus = e;
            },

            // 双击周的 某一天
            getCurAppointList(item , index) {
                this.curDayIndex = item;
                console.log('双击周的 某一天---',this.curDayIndex);

                //无排班
                if(!item.idServe)  this.showListData = true;
                this.commitAppointList = [];
                //约满
                if(item.amountAppt === item.amountUsed ) return this.appointList = []
                this.saveItem = item
                // 请求接口之前先打标记  -- 随机码
                this.randomNum = Math.random().toString(36).substr(2);

                this.getNumaliasData(item, this.randomNum)
            },
            
            // 预约
            goAppoint(item) {
                // console.log('预约item',item)
                this.curIdSchedule = item.idSchedule
                let idPat;
                let chargeTypeCode;
                let sdSex;
                let patCode;
                if(item.surplusNumber <=0) return
                 //住院医生来源
                if(this.isFromHisInpDoctor) {
                    idPat = this.docPatientParams.idPat;
                    chargeTypeCode = this.docPatientParams.chargeTypeCode;
                    sdSex = this.docPatientParams.sdSex;
                    patCode = this.docPatientParams.patCode;
                } else {
                    //门诊 或 二院
                    if(sessionStorage.getItem('receivePatientParams')) {
                        idPat = JSON.parse(sessionStorage.getItem('receivePatientParams')).idPat
                        chargeTypeCode = JSON.parse(sessionStorage.getItem('receivePatientParams')).chargeTypeCode
                        sdSex = JSON.parse(sessionStorage.getItem('receivePatientParams')).sdSex
                        patCode = JSON.parse(sessionStorage.getItem('receivePatientParams')).patCode
                    } else {
                        console.log('二院');
                        idPat = this.idPat
                        chargeTypeCode = this.chargeTypeCode || ''
                        sdSex = this.sdSex
                        patCode = this.patCode
                        console.log(this.patCode);
                    }
                }
                if(!idPat){
                    this.$message.warning("请输入患者")
                    return
                }
                let saveData = {
                    idPat: idPat, //患者id
                    chargeTypeCode: chargeTypeCode, //费别
                    idTicket: item.idTicket, //号位
                    idSchedule: item.idSchedule, //排班id
                    idTickets: item.idTickets, //号段
                    sdSex: sdSex, //性别
                    channelCode: '04', //渠道编码
                    patCode: patCode, //患者编码
                    num: '', // 当前序号
                    servePrice: this.curPrice, //价格
                    idDeptAppoint: this.isFromEyuan ? this.$route.query.idDept : '',
                    idEmpAppoint: this.isFromEyuan ? this.$route.query.idEmp : '',
                    extraAptSign: this.extraAptSign,   //是否需要麻醉
                    duringSource: this.duringSourceFlag,
                };

                // // 如果来源于号源池页面，增加duringSource参数， 门诊传0住院传1
                // if(this.isFromEyuan) {
                //     saveData.duringSource = this.$route.query.duringSource
                // }

                
                this.$axios
                .get('apr/appoint/saveAppoint', saveData)
                .then(res => {
                    if (res.success) {
                        this.$message({
                            message: '预约成功！',
                            type: 'success',
                        });
                        if (!this.isFromEyuan) {
                            //门诊、住院
                            this.getAppointPrintModel(res.data);
                        }
                        this.resetForm()
                    } else {
                        this.$message({
                            message: res.message,
                            type: 'warning',
                        });
                    }
                    this.saveLoading = false
                })
                .catch(err => {
                    this.$message.error(err.message);
                });
            },
            //获取预约单模版
            async getAppointPrintModel (id) {
                let url = '/print/adminssion/appointPrint';
                // if(!this.isAtmeng) url = '/print/adminssion/appointPrintBR'  //博仁
                let resData = await this.$axios.post(url,{
                    idAppoint: id
                })
                if (resData) {
                    this.paramesObj.content = resData;
                    this.paramesObj.dialogVisible = true;
                }
            },
            //获取预约记录
            getAppointRecord(pageNum = 1) {
                let idPat;
                  //住院医生来源
                if(this.isFromHisInpDoctor) {

                    idPat = this.docPatientParams.idPat;
                   
                } else {
                    //门诊 或 二院
                    idPat = sessionStorage.getItem('receivePatientParams') ? JSON.parse(sessionStorage.getItem('receivePatientParams')).idPat : this.idPat
                }   

                let Obj = {
                    pageNum: pageNum,
                    pageSize: this.pageSize,
                    idPat: idPat, //患者id
                    empName: '', //医生名
                    beginTime: this.nowDate, //开始时间
                    endTime: '', //结束时间
                    idDept: '',
                    idSchedule: '', //排班id
                    sdAppointStatus: '1', //可预约状态
                };
                this.$axios
                    .get('/apr/appoint/pageAppointListView', Obj)
                    .then(res => {
                        if (res.success) {
                            this.recordTotalPage = Math.ceil(res.data.count / this.pageSize)
                            if (this.pageNum == 1) this.recordList = [];
                            this.recordList = this.recordList.concat(res.data.records);
                            this.recordList.map(item=>{
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

            // 取消预约成功回调 更新预约列表
            upDateAppointList() {
                document.querySelector('.recordList').scrollTop = 0;
                this.pageNum = 1
                this.getAppointRecord()
            },
            //再次打印预约记录
            printAgainAppoint(item) {
                this.getAppointPrintModel(item.idAppoint);
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
            // 取消预约
            cancelAppoint(item) {
                this.cancelAppointForm.idAppoint = item.idAppoint;
                this.cancelAppointForm.visible = true;
                // this.$confirm(`是否取消预约`, '提示', {
                //         cancelButtonText: '是',
                //         confirmButtonText: '否',
                //         type: 'warning',
                //         showClose: false,
                //         closeOnClickModal:false
                //     }).then(() => {
                //         this.$message({
                //             type: 'info',
                //             message: `取消操作`
                //         });

                //     }).catch(() => {
                //         this.confirmAppoint(item) //调用取消预约方法
                //     });
            },
            // 确认取消
            confirmAppoint(item) {
                let idEmpCancel;
                //二院
                if(this.isFromEyuan) {
                    idEmpCancel = this.idEmpDoc
                } else {
                    //门诊、住院
                    idEmpCancel = this.getUserStorage().idEmp
                }
                let Obj = {
                    idAppoint: item.idAppoint,
                    idEmpCancel:idEmpCancel
                }
                this.$axios
                    .get('/apr/appoint/cancelAppoint', Obj)
                    .then(res => {
                        if (res.success) {
                            this.$message({
                                message: '取消预约成功！',
                                type: 'success',
                            });
                             document.querySelector('.recordList').scrollTop = 0;
                            this.pageNum = 1
                            this.getAppointRecord()
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
            
            // 重置数据
            resetForm() {
                document.querySelector('.recordList').scrollTop = 0;
                this.countAppoitList = [];
                this.$nextTick(()=>{
                    this.getCurAppointList(this.curDayIndex)
                    this.$refs.CalendarModel.upDateAppMonthEvnet();
                })
                 this.pageNum = 1
                 this.getAppointRecord()
            }
        },
        components:{
            PrintDialog,
            CalendarModel,
            CancelAppointDialog
        }
    }
</script>
<style lang="scss" src="./clinicAppoint.scss"></style>
