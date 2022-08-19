// 医嘱模版引用 - 门诊

import relateDiagnoseCom from "@/components/page/DictManage_WEB/doctorOrderModule/comp/relateDiagnoseCom/index.vue"; //关联诊断
import AddChargeItem from "@/components/page/Common_WEB/outpTmplBar/outpTmplBarRightCont/addChargeItem/addChargeItem.vue"; // 模版引用附加收费
import { mapMutations, mapGetters } from "vuex";
import bus from "@/components/common/bus.js";

export const mixinOutpTmpl = {
    data(){
        return {
            chargeItemData: {
                chargeItemVisable: false,
                idOrdersTemplate: "",
                idOrdersTemplateItem: "",
            },
            insuranceIndicator: 0,
            ciOrdersTempDiagLength: 0,  //关联诊断的个数
        }   
    },
    computed: {
        ...mapGetters(["outpCurTab", "routerPath"]),
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
        //门诊引用模版校验通过之后回调函数
        bus.$off("afterQuoteTemplCheck");
        bus.$on("afterQuoteTemplCheck", () => {
            this.afterQuoteTemplOutp();
        });
    },
    methods:{
        ...mapMutations(["SET_DOCCOMMITSTATE", "SET_DOCGOBACKSTATE"]),
        //处理门诊医嘱模板 自费 医保
        handlerInsuranceIndicatorOutp() {
            if (this.inspectData.specialDisease === 1) {
                this.insuranceIndicator = 2; //特病
            } else {
                if (this.chargeTypeCode == this.CONSTANT.OUTPEXCESS_CHARGETYPECODE) {
                    this.insuranceIndicator = 1; //医保
                } else {
                    // 费别值是02的时候为医保，其余值全为自费  自费患者不能取消
                    this.insuranceIndicator = 0; //自费
                }
            }
        },

         //关联诊断个数
        ciOrdersTemplateDiagLength(num) {
            this.ciOrdersTempDiagLength = num || 0;
        },

         //引用模版之前校验
        beforeSaveTemplOutp() {
            bus.$emit("beforeQuoteTempl", this.ciOrdersTempDiagLength);
        },

        //引用模版校验之后
        afterQuoteTemplOutp() {
            this.confrimQuoteEvent();

        },

        confrimQuoteEvent() {
            // this.isLoading = true;
            if (this.isHasWestSelect) {
                // console.log('药品 -----');
                this.drugMedicalValid();
            } else {
                // console.log('非药品 -----');
                this.handerTmplSaveOrdersOutp(); //调用引用模板接口
            }
        },


        //保存前校验
        async handerTmplSaveOrdersOutp(isReimPass) {
            //校验多报销比例
            if(!isReimPass) {
                let isvalidateRem = await this.validateReimburInfo();
                if(isvalidateRem) return this.$emit('upDataSaveLoading', false);
            }
          
            // 对接cdc禁忌药提示
            let cdcDrugsFlag = await this.handlerCdcDrugs();
            if(cdcDrugsFlag) return this.$emit('upDataSaveLoading', false);

            this.saveOutpTmpAllFn();
        },
        saveOutpTmpAllFn(){
            let copyObj = this.handlerSaveDataOutpTpml();
            console.log("保存", copyObj);
            // this.saveOutpTemplateReq(copyObj);
        },
        //处理保存数据
        handlerSaveDataOutpTpml() {

            let Obj = {
                chargeTypeCode: this.chargeTypeCode,
                idDept: this.userParmas.idDept,
                idDeptCreate: this.userParmas.idDept,
                createDeptName: this.userParmas.deptName,
                idPat: this.$route.query.idPat,
                idVisit: this.$route.query.idVisit,
                idDiagnosisClass: this.inspectData.idDiagnosisClass, // 诊断分组id
                sdScene: this.inspectData.sdScene, //场景
                idOrdersTemplate: this.idOrdersTemplate,
                insuranceIndicator: this.insuranceIndicator, //0-自费 1-医保 2-特
                toImmediatelyIdList: this.toImmediatelyIdList, //转即刻数组
            };
            Obj = this.traversalObject(Obj);
            console.log('最终保存 -----', Obj);


            this.multipleSelection.map( row => {
                row.idOrdersTemplate = this.idOrdersTemplate
            })
            Obj.templateItemList = this.multipleSelection
            return  Obj
        },

        /** 保存门诊医嘱模板引用 --接口 */
        async saveOutpTemplateReq(Obj){

            let res = await this.$axios._post("/outpdr/quoteOutpTemplate/saveTemplate", Obj);

            if(res.success) {
                this.$message({
                    message: "保存成功",
                    type: "success",
                });

                bus.$emit("closeTemplate", 1); //关闭医嘱模板弹窗

                if (this.outpCurTab === MEDICAL_TAB) {
                    bus.$emit("afterQuoteupDateDiagns");
                }

                if (this.outpCurTab === DOCORDER_TAB) {
                    this.SET_DOCCOMMITSTATE(true); //获取医嘱列表数据
                }

                return true
            }

            this.$message.warning(res.message);
            return false
        },
    }
}