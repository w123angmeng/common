import {mixinLeaveHosValidate} from '@/components/page/Doctws_WEB/syntheticalView/comp/doctorOrder/commonComponents/mixinLeaveHosValidate.js'

export const mixinStartTime = {
    data(){
        return {
            headInfo: {
                beginDate: '',
                beginTime: '',
            },
            nowDate: '',     //当前时间
            templateAsyn: '0',//同步按钮
            allStartTime: '',
        }   
    },
    mixins:[mixinLeaveHosValidate],
    computed: {},
    methods: {
        //获取当前系统时间
        async getCurrentServerTime(){
            let flag = await this.getLeaveHosDate();
            this.getServerTime('ymdHm').then(res => {
                this.nowDate = `${res}:00`;
                this.allStartTime = `${res}:00`
                if(this.nowDate && !flag) {
                    let times = this.nowDate.split(' ');
                    this.headInfo.beginDate = times[0];
                    this.headInfo.beginTime = times[1];
                }else{ // 存在出院时间时，默认开始时间为出院时间
                    let timer = this.leaveOrdersStartObj.dtOrderStart.split(' ');
                    this.headInfo.beginDate = timer[0];
                    this.headInfo.beginTime = timer[1];
                }
            })
        },
        //单个同步时间
        applyTime(val,row, isAll){
            row.templateAsyn = val
            let beginTime = this.headInfo.beginTime.length == 5 ? this.headInfo.beginTime + ':00': this.headInfo.beginTime
            let time = this.headInfo.beginDate + ' ' + beginTime
            row.dtOrderStart = time;
            row.beginDate = this.headInfo.beginDate;
            row.beginTime = beginTime;
            this.applyGroupTime(row);  //同步成组时间
            if(isAll) return 
            //埋点
            if(this.isFromDoctwsTmpl || this.isFromCopy || this.isFromTemporaryStorage) {
                let subTitle = '';
                if(this.isFromDoctwsTmpl) subTitle = '医嘱模板'
                if(this.isFromCopy || this.isFromTemporaryStorage) subTitle = '复制暂存'
                this.getBuryingPoint('同步个体时间', {}, subTitle)
            }
        },

        //同步所有时间
        applyAllTime(val){
            this.templateAsyn = true
            this.tableData.forEach(item=>{
                this.applyTime(this.templateAsyn, item, true)
            })
            //埋点
            if(this.isFromDoctwsTmpl || this.isFromCopy || this.isFromTemporaryStorage) {
                let subTitle = '';
                if(this.isFromDoctwsTmpl) subTitle = '医嘱模板'
                if(this.isFromCopy || this.isFromTemporaryStorage) subTitle = '复制暂存'
                this.getBuryingPoint('同步全部时间', {}, subTitle)
            }
        },
        //列表 时间发生变化
        startTimeChange(row){
            let dtOrderStart = row.beginDate + ' ' + (row.beginTime.length == 5 ? row.beginTime + ':00': row.beginTime)
            row.dtOrderStart = dtOrderStart;

            this.applyGroupTime(row);  //同步成组时间
        },
        //同步成组时间
        applyGroupTime(row) {
            this.applyGroupKeys(row, ['groupCode', 'groupCodeStr', 'dtOrderStart', 'beginDate', 'beginTime']);

            // if(this.orderGroupCodeObj[row.orderGroupCode]){
            //     this.orderGroupCodeObj[row.orderGroupCode].forEach(item=>{
            //         item.groupCode = row.groupCode
            //         item.groupCodeStr = row.groupCodeStr
            //         item.dtOrderStart = row.dtOrderStart
            //         item.beginDate = row.beginDate;
            //         item.beginTime = row.beginTime;
            //     })
            // }

            // if(row.idForm && this.idFormObj[row.idForm]){
            //     this.idFormObj[row.idForm].forEach(item=>{
            //         item.groupCode = row.groupCode
            //         item.groupCodeStr = row.groupCodeStr
            //         item.dtOrderStart = row.dtOrderStart
            //         item.beginDate = row.beginDate;
            //         item.beginTime = row.beginTime;
            //     })
            // }
        },
    }
}    