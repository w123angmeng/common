<template>
    <div class="CalendarModel">
       <div class="CalendarModel_wraps">
            <div v-show="!searchOneMonthStatus">
                <Calendar 
                    ref="Calendar"
                    @choseDay="clickDay" 
                    @changeMonth="changeDate" 
                    @isToday="clickToday" 
                    :markDate= markDateArr
                    :markDateMore= markDateMoreArr
                    :agoDayHide="agoDayHideTime"
                    :futureDayHide="futureDayHideTime" 
                    :class="{yy:true}">
                </Calendar>
            </div>
            <div class="calendar_fr">
                <div class="no_num colornum" ></div>
                <div>无号</div>
                <div class="have_num colornum"></div>
                <div>有号</div>
                <div class="full_num colornum"></div>
                <div>约满</div>
            </div>
        </div>  
     
      <div class="cutLine"></div>
   
  </div>
</template>

<script>
import Calendar from 'vue-calendar-component';
// import Calendar from '@/components/page/Common_WEB/vueCalendar/calendar.vue';
import moment from 'moment';

const CURDAY_COLOR = 'mark_curDay';  //当前选中颜色
const NOSCH_COLOR = 'mark_noSch';    //无排班颜色
const FULLUSE_COLOR = 'mark_fullUse';//约满颜色
const FESTDAY_COLOR = 'mark_festDay';//节假日颜色

    export default {
        props: ['idServe', 'idDept'],
        data () {
            return {
                time: '',         //当前时间戳
                nowDate: '',      //当前日期
                tomorrowDay: '',  //明天
                appointEndDay: '',//可预约的最后一天
                forWardDays: 0,   //提前放号天数
                beginDate: '',    //开始时间
                endDate: '',      //结束时间
                oneMonthDayArr: [],//每个月号源数
                agoDayHideTime: '',      //某日期之前禁止点击，时间戳最多10位数
                futureDayHideTime: '',   //某日期之后禁止点击，时间戳最多10位数   
                markDateArr: [],
                searchOneMonthStatus: false,
                //要标记不同颜色的数组  
                markDateMoreArr: [],  
                // holiDayArr: ['2021-03-09', '2021-03-16', '2021-03-17', '2021-04-03'],// 节假日 
                holiDayArr: [],// 节假日 
            }
        },
        components: {
            Calendar
        },
        computed: {},
        created () {
            this.getHoliDayDict();
            this.getServerTimeData();
        },
        methods: {
            //获取系统时间
            async getServerTimeData() {
                await this.getServerTime().then((time)=> {
                    this.time = time;
                    this.markDateArr = [new Date(time)];
                    this.nowDate = moment(time).format('YYYY-MM-DD');
                    this.tomorrowDay =  this.getNewDay(this.nowDate, 1);
                    
                    this.agoDayHideTime = this.time.toString().substring(0,10);
                
                    this.curMonthData('first');
                })

                this.forwardGetNumDay();
            },
            
            // 获取节假日
            getHoliDayDict() {
                this.findSdData('SD_HOLIDAY_DICT').then((data)=> {
                    let dataArr = data.SD_HOLIDAY_DICT || [];
                    this.holiDayArr = dataArr.map( v => v.dataCode)
                })
            },

             //获取提前放号天数
            forwardGetNumDay() {
                let Obj = { 
                    code: '04'
                }
                this.$axios.post("/sch/channel/findScChannelByCode",Obj).then(res => {
                    if (res.success) {
                        this.forWardDays = res.data.days || 0 //提前放号天数
                        let endDate = this.getNewDay(this.nowDate, this.forWardDays )
                        this.appointEndDay = endDate;
                        let date = new Date(endDate)
                        let time = date.getTime();
                        this.futureDayHideTime = time.toString().substring(0,10);
                        if(!res.data.idChannel) {
                            this.$message({
                                message: '请先维护渠道信息!',
                                type: "warning"
                            });
                        } 
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            // 本月
            curMonthData(flag) {

                let year = this.nowDate.split('-')[0];
                let month = this.nowDate.split('-')[1];
                this.getMonthFirstLastDay(year, month, flag);
            },

            // 根据月份计算当月系统初始、末尾日期
            getMonthFirstLastDay(year, month, flag) {

                //这个月的第一天  当月的1号
                let firstDay_month = new Date(year, month - 1, 1);
                let firstDate = new Date(Date.parse(firstDay_month));  
                //当月的1号对应的星期
                let firstNum = this.getWeekDaysFun(firstDate).d1;
                // 补全月自然视图
                let firstDay = firstDate.setDate(firstDate.getDate() - firstNum + 1);

                let lastDay = firstDate.setDate(firstDate.getDate() + 41 );
                firstDay = this.formatDate(new Date(firstDay));
                lastDay = this.formatDate(new Date(lastDay));
                let endDayStr = lastDay.split('-')[2]
                if(Number(endDayStr) > 7) {
                    lastDay = this.getNewDay(firstDay, 34)
                }

                this.beginDate=  firstDay;
                this.endDate = lastDay

                this.getDateAreaByServe(flag)

            },

             //查询号别在日期区间中有号无号
            getDateAreaByServe(flag) {
                if(flag !== 'upDate')  this.searchOneMonthStatus = true;

                this.$axios
                    .get("/apr/appoint/findDateAreaByServe", {
                        channelCode: '04',
                        idServe: this.idServe,
                        idDept: this.idDept,   
                        beginDate: this.beginDate,    
                        endDate: this.endDate,
                    })
                    .then(res => {
                        if (res.success) {

                            // console.log('----------月日历接口返回值：',res.data);

                            let commitDates = this.copyObject(res.data);
                            this.oneMonthDayArr = this.formatEveryDay(this.beginDate, this.endDate);

                            let appiontDaysArr = [];
                            commitDates.map( item => {
                                item.days = item.dateStr.split(' ')[0];
                                appiontDaysArr.push(item.days)
                            })

                            this.markDateMoreArr = [];
                            this.oneMonthDayArr.map( v => {
                            
                                commitDates.map( item => {
                                    item.days = item.dateStr.split(' ')[0];
                                    item.weekStr = item.dateStr.split(' ')[1];
                                    if(v.days === item.days) {
                                        v.amountAppt = item.amountAppt,
                                        v.amountUsed = item.amountUsed,
                                        v.idSchedule = item.idSchedule,
                                        v.idServe = item.idServe
                                    }
                                })
                            })

                            this.oneMonthDayArr.map( v => {

                                this.handerMarkDayEvent(v.days, '')

                                if(this.compareTime(this.tomorrowDay, v.days) && this.compareTime(v.days, this.appointEndDay)) {
                                    
                                    //无号标记颜色 无排班
                                    if(!appiontDaysArr.includes(v.days)) {
                                        // console.log("标记颜色--无排班", v.days);
                            
                                         this.handerMarkDayEvent(v.days, NOSCH_COLOR)

                                    } else {
                                        //约满标记颜色
                                        if(v.amountAppt === v.amountUsed) {
                                            // console.log("标记颜色--约满", v.days);

                                            this.handerMarkDayEvent(v.days, FULLUSE_COLOR)

                                        }
                                    }
                                    // //默认选中明天 放到最后  当天选中样式会覆盖其他样式
                                    if(v.days === this.tomorrowDay && flag === 'first') {
                                        // console.log("标记颜色--选中", v.days);
                                        this.$emit('clickDayGetCurAppiont', v)
                                    }
                                } 
                            })
                            //追加选中颜色   更新月历视图数据不需要追加选中颜色
                            this.$emit('appendMarkMoreColor', flag)

                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            });
                        }
                        if(flag !== 'upDate')  this.searchOneMonthStatus = false;
                    });
            },

            //标注 当天选中的颜色
            curMarkDay(date) {
                // console.log("回调函数", date);
                this.handerMarkDayEvent(date, CURDAY_COLOR)
            },

            //处理不同类型日期标记颜色
            handerMarkDayEvent(date, color) {
                let colorStr = color ? color + ' ' + FESTDAY_COLOR : FESTDAY_COLOR;
                //节假日
                if(this.holiDayArr.includes(date)) {
                    this.markDateMoreArr.push({
                        date: date,
                        className: colorStr
                    })
                    return
                }
                if(!color) return
                //非节假日
                this.markDateMoreArr.push({
                    date: date,
                    className: color
                })
            },

            //计算月历的每一天
            formatEveryDay(start, end) {
                // console.log(start, end);
                let dateList = []; 
                let startTime = this.getDate(start);
                let endTime = this.getDate(end);

                while ((endTime.getTime() - startTime.getTime()) >= 0) {
                    let year = startTime.getFullYear();
                    let month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
                    let day = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
                    let oneDay = year + "-" + month + "-" + day;
                    let oneWeekDays = this.getWeekDaysFun(oneDay).d1;
                    dateList.push({
                        days: oneDay,
                        weekStr: oneWeekDays,
                        amountAppt: null,
                        amountUsed: null,
                        idSchedule: "",
                        idServe: ''

                    }); 
                    startTime.setDate(startTime.getDate() + 1);
                }
                return dateList;
            },

            getDate(datestr) {
                let temp = datestr.split("-");
                let date = new Date(temp[0], temp[1] - 1, temp[2]);
                return date;
            },
            
            //点击某一天
            clickDay(date) {
                let t = moment(date).format('YYYY-MM-DD');//没错，此处大写，非yyyy-MM-dd
                // console.log("点击天 ---",t);
                this.oneMonthDayArr.map(v => {
                    if(v.days === t)  this.$emit('clickDayGetCurAppiont', v)
                })

                //点击某一天 先移除之前选中标记 再追加标记
                this.markDateMoreArr.map( (v,i) => {
                    if(v.className.includes(CURDAY_COLOR)) this.markDateMoreArr.splice(i ,1)
                })
                this.handerMarkDayEvent(t, CURDAY_COLOR)
            },

            //左右点击切换月份
            changeDate(date) {
                let t = moment(date).format('YYYY-MM-DD');//没错，此处大写，非yyyy-MM-dd
                // console.log("点击月份 ---",t);

                let year = t.split('-')[0];
                let month = t.split('-')[1];
                this.getMonthFirstLastDay(year, month);
                this.$emit('changeCalenMonth')
            },

            //切换今天
            clickToday(date) {},

            //预约成功更新月历视图数据
            upDateAppMonthEvnet() {

                this.getDateAreaByServe('upDate');

            },

        },
        watch: {
            searchOneMonthStatus: {
                handler(val) {
                    this.$emit('updateSearchOneMonthStatus', this.searchOneMonthStatus)
                },
            }
        }
    }

</script>
<style lang='scss' src='./calendarModel.scss'>
</style>