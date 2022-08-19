// 医嘱模版引用 - 住院

import relateDiagnoseCom from "@/components/page/DictManage_WEB/doctorOrderModule/comp/relateDiagnoseCom/index.vue"; //关联诊断
import AddChargeItem from "@/components/page/Common_WEB/outpTmplBar/outpTmplBarRightCont/addChargeItem/addChargeItem.vue"; // 模版引用附加收费
import { mapMutations } from "vuex";

export const mixinDoctwsTmpl = {
    data(){
        return {
            chargeItemData: {
                chargeItemVisable: false,
                idOrdersTemplate: "",
                idOrdersTemplateItem: "",
            },
        }   
    },
    computed: {
        currentMsg(){ // 诊断信息
            return this.from.diagnosisMsg
        },
        idOrdersTemplate(){
            return this.from.params.idOrdersTemplate
        }
    },
    components:{
        relateDiagnoseCom,
        AddChargeItem
    },
    created(){
    },
    methods:{
        ...mapMutations(["SET_DOCGOBACKSTATE"]),
        //获取列表数据
        getTmplListAsync(){
            return this.$axios.post(this.from.axiosUrl, this.from.params).then(resData=>{
                if(resData.success) {
                    return resData.data.records
                }else{
                    this.$message.warning(resData.message);
                    return false
                }
            })
        },
        // 增加附加收费项目
        addChargeItems(row, index) {
            this.chargeItemData.chargeItemVisable = true;
            this.chargeItemData.idOrdersTemplate = this.idOrdersTemplate;
            this.chargeItemData.idOrdersTemplateItem = row.idOrdersTemplateItem;
            this.chargeItemData.idOrdersTemplateItems =
                row.idOrdersTemplateItem + row.listChargeItem.length;
            //埋点
            if(this.isFromDoctwsTmpl)  this.getBuryingPoint('新增内容')    
           
        },
        // 删除附加收费项目
        confirmdeleteCharge(row) {
            this.tableData.map((item) => {
                if (item.listChargeItem.length) {
                    item.listChargeItem.map((i, ind) => {
                        if (i.idOrdersTemplateChargeItem == row.idOrdersTemplateChargeItem) {
                            item.listChargeItem.splice(ind, 1);
                        }
                    });
                }
            });
        },
        //接收添加收费项目子组件传递的数据
        sendChargeObj(obj) {
            this.tableData.map((item) => {
                if (obj.idOrdersTemplateItem == item.idOrdersTemplateItem) {
                    //界面新增收费项目
                    obj.content = obj.priceItemName
                    item.listChargeItem.push(obj);
                }
            });
        },

        //保存前校验
        async handerTmplSaveOrders(isReimPass) {
            //校验多报销比例
            if(!isReimPass) {
                let isvalidateRem = await this.validateReimburInfo();
                if(isvalidateRem) return this.$emit('upDataSaveLoading', false);
            }

            // 校验出院时间
            this.ValidateLeaveHosTime();
            if(this.valiDateList.length){
                this.valiDateFlag = true;
                return this.$emit('upDataSaveLoading', false);
            }
            // 对接cdc禁忌药提示
            let cdcDrugsFlag = await this.handlerCdcDrugs();
            if(cdcDrugsFlag) return this.$emit('upDataSaveLoading', false);

            this.saveDocTmpAllFn();
        },
        saveDocTmpAllFn(){
            // 弱网下 修改成组数量正在计算时 防止数量出错
            setTimeout(()=>{
                let copyObj = this.handlerSaveData();
                console.log("保存", copyObj);
                this.saveInPatientTemplateReq(copyObj);
            },200)
        },
        //处理保存数据
        handlerSaveData() {
            let obj = {
                idPat: this.urlParams.idPat,
                idOrdersTemplate: this.idOrdersTemplate,
                idVisit: this.urlParams.idVisit,
                idWard: this.docPatientParams.idDeptAdmit,
                insuranceIndicator: +this.isInsurePat, //0-自费 1-医保
                listChargeItem: []
            }
            this.multipleSelection.map( row => {
                obj.listChargeItem.push(...row.listChargeItem)
                row.idOrdersTemplate = this.idOrdersTemplate
            })
            obj.templateItemList = this.multipleSelection
            return  obj
        },
        saveInPatientTemplateReq(obj){
            let url = "doctws/quoteTemplate/saveTemplate";
            this.$axios._post(url, obj).then((res) => {
                if (res.success) {
                    this.$message({
                        message: "保存成功",
                        type: "success",
                    });
                    this.$emit('cancelTmp')
                    this.SET_DOCGOBACKSTATE(false)
                    this.$nextTick(()=>{
                        this.SET_DOCGOBACKSTATE(true)
                    })
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning",
                    });
                }
                this.$emit('upDataSaveLoading', false);
            });
        },
    }
}