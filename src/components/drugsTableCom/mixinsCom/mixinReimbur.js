const REIM_PASS = 'reim_pass';
import {mixinCheckDiagnosis} from '@/components/page/Common_WEB/reimbursement/mixinCheckDiagnosis.js' // 诊断分类查询适应症，禁忌信息
export const mixinReimbur = {
    data(){
        return {
            prPriceItemVsInsuranceVOList: [],  //所有药品适应症信息
            /** 医保多报销比例 */
            reimbursement:{ 
                dialogVisible: false,
                diagnosisType: [],   // 诊断信息
                drugsDetailList: [], // 药品信息
                chargeTypeCode: ''   // 费别
            }
        }   
    },
    mixins: [mixinCheckDiagnosis],
    computed: {
        getPrPriceItemList(){
            let map = new Map();
            this.prPriceItemVsInsuranceVOList.map(item =>{
                map.set(item.idClinicItem, item.prPriceItemVsInsuranceVOList)
            })
            return map
        },
        forceSelfListObjs(){
            let obj = {}
            this.reimbursement.drugsDetailList.forEach(item=>{
                obj[item.rowKey] = item
            })
            return obj
        },
    },
    methods: {
        //适应症医保等级接口
        drugIndication(idList) {
            if(!idList.length)  return;

            this.getIndicationsBrOrATM(idList).then( data => {
                this.prPriceItemVsInsuranceVOList = data;

                this.tableData.forEach(item =>{
                    let rowId = this.getPrPriceItemList.get(item.idClinicItem);
                    if(rowId){
                        item.prPriceItemVsInsuranceVOList = rowId
                    }
                })
            })
        },

        // 获取门诊诊断类型
        getOutpDiagnosis(){
            let idPat = this.$route.query.idPat;
            let idVisit = this.$route.query.idVisit;
            this.selectCiDiaRecord(idPat, idVisit, this.CONSTANT.OUTP_DIAGNOSIS_FLAG ).then( data => {
                if(data.length) {
                    this.reimbursement.diagnosisType =  data;
                }
            })
        },

        // 获取诊断类型
        getDiagnosis(){
            //来源门诊
            if(this.isFromOutp)  return
            this.reimbursement.diagnosisType = sessionStorage.getItem('diagnosis')? JSON.parse(sessionStorage.getItem('diagnosis')): []
        },

        //校验多报销比例弹窗
        async validateReimburInfo() {
            // 医保多报销费别
            this.reimbursement.chargeTypeCode = this.chargeTypeCode;
            this.getDiagnosis();
            // 查询诊断分类 适应症，禁忌信息
            await this.findClassClinicByIdClinicItems(this.westDrugIdClinicItemList, this.sourcePatInfo);
            this.reimbursement.drugsDetailList = [];
            let obj = {}
            this.multipleSelection.map( v => {
                let item = JSON.parse(JSON.stringify(v)) 
                 // 医保多报销 不设置特效药字段 1-符合，0-不符合，2-未设置
                if(this.isWestDrug(v))  item.specialDrugIndicator = 2;
                // 判断适应症药品是否重复
                // if(obj[v.idClinicItem]) return;
                // obj[item.idClinicItem] = item;
                //如果有适应症，且患者是医保患者，提示转自费,或者不是医保患者存在诊断分类适应症，禁忌诊断提示
                let showDialog = this.includesShowDialog(item);
                if(showDialog){
                    let v = item.prPriceItemVsInsuranceVOList[0];
                    v.clinicItemName = item.currDrugsDetails.clinicItemName;
                    v.idClinicItem = item.currDrugsDetails.idClinicItem;
                    v.rowKey = item.rowKey;
                    let arr = this.getDrugsDiagnosisDetail.get(v.idClinicItem) || []; // 存在不适症提示，禁忌提示
                    this.$set(v,'diagnosisArr',arr);
                    v.self = !this.isInsurePat;
                    this.reimbursement.drugsDetailList.push(v)
                }
            })
            if (this.reimbursement.drugsDetailList.length) {
                this.reimbursement.dialogVisible = true;
                return true
            } else {
                return false
            }
        },
        includesShowDialog(item){
            let priceItem = item.prPriceItemVsInsuranceVOList;
           
            if(priceItem && priceItem.length) {
                // 存在对应诊断分类 适应症，禁忌提示
                if(this.getDrugsDiagnosisDetail.get(item.idClinicItem)){
                    return true;
                }
                // 医保适应症提示
                if(this.isOpenInsureSelfDialog(priceItem[0]) && this.isInsurePat) {
                   return true;
               }
            }
           
            return false;
        },
        //打开医保适应症转自费弹窗
        isOpenInsureSelfDialog(iData) {
            let sdConsLevel_BR = [this.CONSTANT.CONSTRainedLEVEL_4,this.CONSTANT.CONSTRainedLEVEL_5];
            //医保等级4和5需要弹出适应症信息并且要有转自费按钮   --- 博仁 有特殊药品标识也要提示
            if(!this.isAtmeng) {
                return sdConsLevel_BR.includes(iData.sdConstrainedLevel) || iData.excessReimburseRatioFlag
            } else {
                //医保患者判断适应症信息是否有无，有，则弹出适应症信息，由医生选择是否转自费。   --- 阿特蒙
                return !!iData.description || iData.excessReimburseRatioFlag
            }
        },

        //取消弹窗
        cancleReimburDialog(){
            this.reimbursement.dialogVisible = false;
        },
         
        //转自费确定
        forceSelfHandler(){
            // 模板引用
            this.multipleSelection.forEach(item=>{
                if(this.forceSelfListObjs[item.rowKey]){
                    item.self = this.forceSelfListObjs[item.rowKey].self
                    item.specialDrugIndicator = this.forceSelfListObjs[item.rowKey].specialDrugIndicator;

                    // //处理长期医嘱 + 多报销比例弹窗弹窗 有限制天数 条件，业务处理
                    // if(!this.isLongTerm(item) && this.forceSelfListObjs[item.rowKey].isHasLimitDay) {
                    //     //满足当前选择的结束时间 - 开始时间 > 限制天数条件， 重置 结束时间 = 开始时间 + 最大限制天数时间
                    //     let d = 0;
                    //     let start = item.dtOrderStart;
                    //     let end = item.dtOrderEnd;
                    //     if(start && end) {
                    //         d = this.calculatedDays([start, end]);
                    //     }
                    //     if(!end || d > this.forceSelfListObjs[item.rowKey].limitDays) {
                    //         let std = start.split(' ')
                    //         let newEnd = this.getNewDay(std[0], this.forceSelfListObjs[item.rowKey].limitDays)
                    //         item.dtOrderEnd = `${newEnd} ${std[1]}`
                    //         this.applyGroupKeys(row, ['dtOrderEnd']);
                    //     }
                    // }
                }
            })
            this.cancleReimburDialog();
            // 引用按钮继续loading
            this.$emit('upDataSaveLoading', true);
            // 保存接口
            //来源造影剂
            if(this.isFromAgent) {
                this.commitSaveAgentInfo(REIM_PASS)
            }

             //来源造影剂
             if(this.isFromCopy) {
                this.handerQuoteSaveCopyOrders(REIM_PASS)
            }
            // 模版引用-住院
            if(this.isFromDoctwsTmpl){
                console.log(this.multipleSelection,'自费后');
                this.handerTmplSaveOrders(REIM_PASS);
            }
        },
    }
}    