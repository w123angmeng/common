<template>
    <div class="AppointRecord">
        <div class="searchContent">
            <div class="hander-box">
                <span>
                    <span class="labelTitle">日期</span>
                    <el-date-picker
                        class="w240"
                        ref="datePicker"
                        :clearable="false"
                        v-model="selectDateValue"
                        @change="handleTime"
                        :picker-options="pickerOptions"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"
                    ></el-date-picker>
                </span>
                <span>
                    <span class="labelTitle">科室</span>
                    <el-select
                        ref="departments"
                        class="w120"
                        v-model="appointForm.idDept"
                        placeholder="请选择科室"
                        :disabled="deptSelectDisable"
                        filterable
                        clearable
                        remote
                        :remote-method="pageType != '01' || !isSelfFlag ? remoteIdDeptMethod : findWorkerIdDept"
                        @focus="pageType != '01' || !isSelfFlag ? remoteIdDeptMethod('', true) : findWorkerIdDept('')"
                        @change="changeDept"
                    >
                        <el-option v-for="(item, index) in departmentList" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </span>
                <span>
                    <span class="labelTitle">医生</span>
                    <el-select
                        class="w120"
                        :disabled="doctorSelectDisable"
                        v-model="appointForm.idEmp"
                        filterable
                        clearable
                        remote
                        :remote-method="remoteIdEmpMethod"
                        @focus="remoteIdEmpMethod('')"
                        @change="chageDoctor"
                        :placeholder="pageType != '01' ? '请选择医生' : ''"
                    >
                        <el-option v-for="(item, index) in doctorsList" :key="index" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </span>
                <span>
                    <span class="labelTitle">号别</span>
                    <el-select
                        class="w120"
                        v-model="appointForm.idServe"
                        placeholder="请选择号别"
                        filterable
                        clearable
                        remote
                        :disabled="serveSelectDisable"
                        :remote-method="findServeList"
                        @focus="findServeList('')"
                        @change="changeServeList"
                    >
                        <el-option
                            v-for="(item, index) in numOtherList"
                            :key="index"
                            :label="item.serveName"
                            :value="item.idServe"
                        ></el-option>
                    </el-select>
                </span>
                <span>
                    <span class="labelTitle">渠道</span>
                    <el-select
                        class="w120"
                        multiple
                        v-model="appointForm.channelCode"
                        placeholder="请选择渠道"
                        filterable
                        clearable
                        remote
                        :remote-method="getChannelList"
                        @focus="getChannelList('')"
                        @change="changeChannel"
                    >
                        <el-option
                            v-for="(item, index) in channelList"
                            :key="index"
                            :label="item.channelName"
                            :value="item.channelCode"
                        ></el-option>
                    </el-select>
                </span>
                <span>
                    <span class="labelTitle">初复诊</span>
                    <el-select class="w120" v-model="appointForm.firstIndicator" placeholder="请选择" @change="changeDicator">
                        <el-option v-for="(item, index) in xxxList" :key="index" :label="item.name" :value="item.value"></el-option>
                    </el-select>
                </span>
            </div>
            <div class="recBtns">
                <!-- <el-button type="primary" @click="getAptRegRecord();">查询</el-button> -->
                <el-button type="primary" @click="exportTable">导出</el-button>
                <el-button type="primary" v-if="!isDefault" @click="clinicalAppointNew">诊间预约</el-button>
            </div>
        </div>
        <el-table
            ref="appointCenter"
            class="tableContent"
            :data="tableData"
            :border="true"
            :header-cell-style="tableTitleStyle"
            highlight-current-row
            :cell-style="cellStyle"
            v-loading="loadingFlag"
        >
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="duringSourceStr" label="场景"></el-table-column>
            <el-table-column prop="dateBeginStr" label="日期" width="100" :resizable="false"> </el-table-column>
            <el-table-column prop="weekNo" label="周" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="serveName" label="号别" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="deptName" label="科室" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="dayslotName" label="时间段" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="patCode" label="患者ID" :resizable="false" width="120" show-overflow-tooltip></el-table-column>
            <el-table-column prop="patName" label="姓名" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="mobile" label="手机号" width="110" :resizable="false" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="channelName" label="预约渠道" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="empName" label="医生姓名" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="empAppointName" label="预约人" :resizable="false" show-overflow-tooltip>
                <template slot-scope="scope">
                    {{ scope.row.idChannel === '05' ? scope.row.patName : scope.row.empAppointName }}
                </template>
            </el-table-column>
            <el-table-column prop="dtArrivedStr" label="就诊状态" width="90" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="sdAppointStatusStr" label="状态" width="90" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column prop="firstIndicator" label="初复诊" :resizable="false" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <!-- <el-button type="text" disabled>打印</el-button> -->
                    <el-button
                        type="text"
                        :disabled="!canHander || ['已取消', '已到诊'].includes(scope.row.sdAppointStatusStr)"
                        @click="cancelAppoint(scope.row)"
                        >取消</el-button
                    >
                    <el-button
                        type="text"
                        :disabled="!canHander || ['已取消', '已到诊'].includes(scope.row.sdAppointStatusStr)"
                        @click="chengAppoint(scope.row)"
                        >改约</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <div class="paginationContant" v-show="!totalPages == 0">
            <el-pagination
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="appointForm.pageNum"
                :page-size="appointForm.pageSize"
                layout="total, prev, pager, next"
                :total="totalPages"
            ></el-pagination>
        </div>
        <!-- 诊间预约弹窗(新版本) -->
        <AppointNew v-if="appointForm1.dialogVisible" :appointForm="appointForm1"></AppointNew>
        <AppointChange :visible.sync="appointChange.appointChangeShow" v-bind="appointChange.data" v-on="appointChange.on"></AppointChange>
    </div>
</template>
<script>
let fileDownload = require('js-file-download')
import AppointNew from '@/components/page/OutPatient_WEB/receivePatient/appointNew/appoint.vue'
import AppointChange from '@/components/page/AppointReg_WEB/appointChange'
export default {
    name: 'AppointRecord',
    props: ['currAccountName'],
    data() {
        return {
            appointChange: {
                data: {
                    direction: 'ltr',
                    'show-close': false,
                    size: '80%',
                    wrapperClosable: false,
                    'custom-class': 'appointchangeClass',
                    row: null
                },
                on: {
                    cancel: this.cancelAppointChange
                },
                appointChangeShow: false
            },
            //新版诊间预约参数
            appointForm1: {
                dialogVisible: false
            },
            loadingFlag: false,
            pageType: '', // 01:德州二院
            serveName: '', // 号别
            idDept: '',
            isSelfFlag: false,
            idEmp: this.getUserStorage().idEmp || '',
            doctorSelectDisable: false,
            deptSelectDisable: false,
            serveSelectDisable: false,
            pickerMinDate: '',
            totalPages: 0,
            time: '', //当日时间
            tableData: [],
            selectDateValue: [],
            appointForm: {
                channelCode: [], //渠道编码
                pageNum: 1,
                pageSize: 10,
                dtBegin: '', //开始时间
                dtEnd: '',
                idDept: '', //科室
                idEmp: '', //医生
                idServe: '', //号别
                // ticketSource: "1", // 来源 1：互联网诊疗
                sdAppointStatus: '', // 来源 1：互联网诊疗
                idPat: '', // 来源 1：互联网诊疗
                firstIndicator: ''
            },
            configerDefaultValue: '', //复诊标识
            channelList: [],
            departmentList: [], //科室列表查询
            numOtherList: [], //号别列表
            doctorsList: [], //医生列表
            xxxList: [
                {
                    name: '全部',
                    value: ''
                },
                {
                    name: '初诊',
                    value: '1'
                },
                {
                    name: '复诊',
                    value: '0'
                }
            ],
            //号别查询
            numData: {
                idDept: '',
                pageIndex: 1,
                pageSize: 10000
            },
            /** 样式 ------------------- */
            tableTitleStyle: {
                fontSize: '14px',
                color: '#000',
                background: '#FAFAFA'
            },
            cellStyle: {
                fontSize: '14px',
                height: '46px',
                color: '#333'
            },
            pickerOptions: {
                onPick: ({ maxDate, minDate }) => {
                    this.pickerMinDate = minDate
                    if (maxDate) {
                        this.pickerMinDate = ''
                    }
                },
                disabledDate: time => {
                    if (this.pickerMinDate !== '') {
                        let minTime = new Date(this.pickerMinDate)
                        let maxTime = new Date(this.pickerMinDate)
                        maxTime.setMonth(maxTime.getMonth() + 2)
                        minTime = new Date(minTime)
                        maxTime = new Date(maxTime)
                        return time.getTime() < this.pickerMinDate || time.getTime() > maxTime
                    }
                }
            },
            isDefault: '',
            canHander: false
        }
    },
    components: {
        AppointNew,
        AppointChange
    },
    async created() {
        this.remoteIdDeptMethod('') //科室列表
        this.remoteIdEmpMethod('') //医生列表
        this.getChannelList() //渠道列表列表
        this.findServeList('') //号别列表
        this.pageType = this.$route.query && this.$route.query.sourceOrigin ? this.$route.query.sourceOrigin.toString() : ''
        console.log(this.getUserStorage().idEmp, 'this.getUserStorage().idEmp')
        // 01:德州二院 default: 目前是门诊医生
        switch (this.pageType) {
            case '01':
                this.doctorSelectDisable = true
                await this.getSystemTime()
                this.initParamData()
                await this.remoteIdDeptMethod('') //科室列表
                await this.findServeList(this.serveName, true) //号别列表
                this.getAptRegRecord()
                break
            default:
                await this.getSystemTime()
                this.getAppointModule().then(res => {
                    console.log(res, 'getAppointModule')
                    this.configerDefaultValue = res
                    this.isDefault = this.configerDefaultValue === this.getUserStorage().idDept ? true : false
                    if (this.configerDefaultValue === this.getUserStorage().idDept) {
                        this.appointForm.idEmp = ''
                        this.appointForm.idEmp = ''
                        this.getAptRegRecord()
                    } else {
                        // 默认当前登录科室,跳转的清空默认
                        if (this.currAccountName) {
                            this.appointForm.idEmp = ''
                            this.appointForm.idEmp = ''
                        } else {
                            const idDept = this.getUserStorage().idDept,
                                idEmp = this.getUserStorage().idEmp
                            this.appointForm.idDept = this.departmentList.findIndex(item => item.value === idDept) > -1 ? idDept : ''
                            this.appointForm.idEmp = this.doctorsList.findIndex(item => item.value === idEmp) > -1 ? idEmp : ''
                            console.log(this.departmentList, this.doctorsList, 'idDept,idEmp')
                            // this.appointForm.idDept = this.getUserStorage().idDept
                            // this.appointForm.idEmp = this.getUserStorage().idEmp
                        }

                        this.getAptRegRecord()
                    }
                    //当前角色权限
                    let curRoles = res.indexOf('|') > -1 ? res.split('|') : [res],
                        roles = this.getUserStorage().roleList
                    for (let i of roles) {
                        if (curRoles.includes(i.idRole)) {
                            console.log('cccc')
                            this.canHander = true
                            break
                        }
                    }
                    console.log(curRoles, roles, this.canHander, 'curRoles')
                })
                // this.getAptRegRecord();
                break
        }
    },
    watch: {
        'appointForm.idServe': function(val) {
            // 非诊间预约-不区分普通科室
            if (this.pageType != '01') {
                return
            }
            // 诊间预约-区分普通科室
            this.appointForm.idEmp = this.isSelfFlag ? this.$route.query.idEmp : ''
        }
    },

    methods: {
        chengAppoint(row) {
            this.appointChange.data.row = row
            this.appointChange.appointChangeShow = true
        },
        cancelAppointChange(type) {
            if (type) {
                this.getAptRegRecord()
            }

            this.appointChange.appointChangeShow = false
        },
        clinicalAppointNew() {
            this.appointForm1.dialogVisible = true
        },
        changeDicator() {
            this.appointForm.pageNum = 1
            this.getAptRegRecord() //获取左下方号别列表
        },
        // 渠道列表
        getChannelList() {
            this.$axios.post('/sch/channel/listScChannel').then(res => {
                this.channelList = res.data
            })
        },
        // 导出
        exportTable() {
            let obj = JSON.parse(JSON.stringify(this.appointForm))
            obj.channelCode = obj.channelCode.join(',')
            this.$axios.get('/apr/report/exportAppointRecordByParam', obj, 'arraybuffer').then(res => {
                if (res) {
                    fileDownload(res, '预约挂号查询.xlsx')
                } else {
                    this.$message.error('无数据可导出！')
                }
            })
        },
        initParamData: function() {
            let queryData = this.$route.query
            this.appointForm.idDept = queryData && queryData.idDept ? queryData.idDept : ''
            this.idDept = queryData && queryData.idDept ? queryData.idDept : ''

            this.appointForm.idEmp = queryData && queryData.idEmp ? queryData.idEmp : ''
            this.serveName = queryData && queryData.serveName ? queryData.serveName : ''
            console.log(this.appointForm, 'this.serveName')
            this.doctorsList.push({
                label: queryData && queryData.doctorName ? queryData.doctorName : '',
                value: queryData && queryData.idEmp ? queryData.idEmp : ''
            })
            this.sourceOrigin = queryData && queryData.sourceOrigin ? queryData.sourceOrigin : ''
        },
        //查询工作组科室
        findWorkerIdDept(idDept) {
            let vm = this
            vm.$axios
                .get('/org/dept/findWorkGroupDeptByIdEmp', {
                    idEmp: this.appointForm.idEmp,
                    flag: 'OUTPATIENT',
                    idDept: ''
                })
                .then(res => {
                    if (res.success) {
                        this.departmentList = res.data
                    } else {
                        vm.$message({
                            message: res.message,
                            type: 'warning'
                        })
                    }
                })
        },
        //获取服务时间
        async getSystemTime() {
            return this.getServerTime('ymdHms').then(data => {
                if (data) {
                    var dateValue1 = new Date(new Date(data).getTime() + 24 * 60 * 60 * 1000)
                    var time1 = this.formatDate(dateValue1) //第二天的时间 2021-07-23
                    var dateValue = data.split(' ')
                    this.nowHms = dateValue[1]
                    this.time = dateValue[0]
                    var curDate = this.formatDate(new Date(this.time))
                    curDate = curDate + ' 00:00:00'
                    var NextDate = time1 + ' 23:59:59'
                }
                this.selectDateValue.push(curDate, NextDate)
                // console.log('this.selectDateValue',this.selectDateValue);
            })
        },
        //选择科室
        changeDept(e) {
            if (this.pageType == '01') {
                this.appointForm.pageNum = 1
                this.appointForm.idServe = ''
                this.findServeList()
                this.getAptRegRecord() //获取左下方号别列表
                return
            }
            this.appointForm.pageNum = 1
            this.appointForm.idEmp = '' //清空医生
            this.remoteIdEmpMethod() //获取科室下的医生
            this.appointForm.idServe = ''
            this.findServeList()
            this.getAptRegRecord() //获取左下方号别列表
        },
        changeChannel() {
            this.appointForm.pageNum = 1
            this.getAptRegRecord() //获取左下方号别列表
        },
        //切换医生
        chageDoctor(e) {
            this.appointForm.pageNum = 1
            this.getAptRegRecord() //获取左下方号别列表
        },
        //选择挂号时间
        handleTime(e) {
            // 时间为必填项
            if (!this.selectDateValue || this.selectDateValue.length < 2) {
                return
            }
            this.appointForm.pageNum = 1
            this.getAptRegRecord()
        },
        //号别列表
        async findServeList(query = '', initFlag = false) {
            return this.$axios
                ._post('/sch/serve/pageScServe', {
                    enabled: 1,
                    idDept: initFlag ? '' : this.appointForm.idDept,
                    idEmp: '',
                    pageIndex: 1,
                    pageSize: 20,
                    serveName: query
                })
                .then(res => {
                    if (res.success) {
                        if (this.pageType != '01') {
                            this.numOtherList = res.data.records
                            return
                        }
                        // 科室号
                        if (!initFlag && !this.isSelfFlag) {
                            this.numOtherList = res.data.records.filter(item => !item.idEmp)
                            return
                        }
                        // 个人号
                        if (!initFlag && this.isSelfFlag) {
                            this.numOtherList = res.data.records.filter(item => item.idEmp == this.$route.query.idEmp)
                            return
                        }
                        let listData = res.data.records
                        let selectedItem = listData.find(item => {
                            return item.serveName == this.serveName
                        })
                        // 首次选中默认号别
                        if (selectedItem && initFlag) {
                            // 科室号
                            if (!selectedItem.idEmp) {
                                this.isSelfFlag = false
                                this.deptSelectDisable = true
                                this.serveSelectDisable = true
                                this.numOtherList = listData.filter(item => {
                                    return !item.idEmp
                                })
                                this.appointForm.idServe = selectedItem.idServe
                                // 个人号
                            } else {
                                this.isSelfFlag = true
                                this.numOtherList = listData.filter(item => {
                                    return item.idEmp == this.$route.query.idEmp
                                })
                                this.findWorkerIdDept()
                                this.appointForm.idServe = selectedItem.idServe
                            }
                        }
                    } else {
                        this.$message({
                            message: res.message,
                            type: 'warning'
                        })
                    }
                })
                .catch(err => {
                    this.$message.error(err.message)
                })
        },
        //切换号别
        changeServeList(e) {
            this.getAptRegRecord() //获取左下方号别列表
        },
        //获取所有号别关联的科室列表
        async remoteIdDeptMethod(query = '', filterFlag = false) {
            return this.$axios
                .get('/sch/serve/findServeDeptList', {
                    deptName: query
                })
                .then(res => {
                    if (res.success) {
                        if (this.pageType == '01' && !this.isSelfFlag && filterFlag) {
                            this.departmentList = res.data.filter(item => {
                                return item.value == this.idDept
                            })
                            return
                        }
                        this.departmentList = res.data
                    } else {
                        this.$message({
                            message: res.message,
                            type: 'warning'
                        })
                    }
                })
                .catch(err => {
                    this.$message.error(err.message)
                })
        },
        //获取所有号别关联的医生列表
        remoteIdEmpMethod(query = '') {
            this.$axios
                .get('/sch/serve/findServeEmpList', {
                    empName: query,
                    idDept: this.appointForm.idDept
                })
                .then(res => {
                    if (res.success) {
                        this.doctorsList = res.data
                    } else {
                        this.$message({
                            message: res.message,
                            type: 'warning'
                        })
                    }
                })
                .catch(err => {
                    this.$message.error(err.message)
                })
        },
        //分页导航
        handleCurrentChange(val) {
            this.appointForm.pageNum = val
            this.getAptRegRecord()
        },
        //改变每页条数
        handleSizeChange(val) {
            this.appointForm.pageSize = val
            this.getAptRegRecord()
        },
        //获取参数配置
        getAppointModule() {
            return this.$axios
                .get('/dict/conf/findConfigerByCode', {
                    configerCode: 'Operation_Apt_Role'
                })
                .then(res => {
                    if (res.success) {
                        console.log(res.data, 'res.data')
                        return res.data.configerDefaultValue
                    } else {
                        this.$message({
                            message: res.message,
                            type: 'warning'
                        })
                    }
                })
        },
        // 取消预约
        cancelAppoint(row) {
            let idEmp = this.getUserStorage().idEmp
            let Obj = {
                idAppoint: row.idAppoint,
                idEmpCancel: idEmp
            }
            let msg = `是否取消【${row.patName}】【${row.deptName}】【${row.dtArrivedStr}】的预约?`
            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    this.$axios.get('/apr/appoint/cancelAppoint', Obj).then(res => {
                        if (res.success) {
                            this.getAptRegRecord()
                            this.$message({
                                message: res.message || '取消成功',
                                type: 'success'
                            })
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning'
                            })
                        }
                    })
                })
                .catch(() => {})
        },
        getAptRegRecord() {
            if (this.selectDateValue.length < 2) {
                this.$message({
                    message: '开始结束时间不能为空',
                    type: 'warning'
                })
                return
            }
            this.loadingFlag = true
            Object.assign(this.appointForm, {
                dtBegin: this.selectDateValue.length > 1 ? this.selectDateValue[0] : '',
                dtEnd: this.selectDateValue.length > 1 ? this.selectDateValue[1] : ''
            })
            let obj = JSON.parse(JSON.stringify(this.appointForm))
            obj.channelCode = obj.channelCode.join(',')
            try {
                this.$axios.post('apr/appoint/pageAptInfo', obj).then(res => {
                    if (res.success) {
                        this.totalPages = res.data.count
                        this.tableData = res.data.records
                    } else {
                        this.$message({
                            message: res.message,
                            type: 'warning'
                        })
                    }
                    this.loadingFlag = false
                })
            } catch (error) {
                this.$message({
                    message: res.message,
                    type: 'warning'
                })
                this.loadingFlag = false
            }
        }
    }
}
</script>

<style lang="scss" src="./appointRecord.scss"></style>
