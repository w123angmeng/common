
export const mixinShareOrders = {
    data(){
        return {
            checkData: {
                // 传递给弹窗的值
                dialogVisible: false, // 弹窗是否展示
                messageList: "", // 要校验的数据
                submitStatus: false, // 是否展示确认按钮
                isFreeStatus: false, // 是否展示转自费按钮
                showDetail: false, // 是否展示查看详情按钮
                toImmediately: false, //是否展示转即刻是按钮
                insuranceFlag: false, //医保拒付是按钮
                noImmediately: false, //是否展示否按钮
            }, 
            toSelfPayIdList: [],     //转自费列表
            
            /** 共享医嘱查询数据 */
            shareData: {
                passFlag: '', //通过标识
                idOrders: '',
                orderGroupCode: '',
                chargeTypeCode: '',  //费别
                targetGroupIdOrders: '', //目标合组医嘱id
                idPat: '', //患者ID
                idVisit: '', //就诊id
                icno: '', //医保号
                sdScene: '', //医保场景

                days: '', //开药天数
                once: '', //单次剂量
                idFreq: '', //频次ID
                group: 1, //是否成组
                totalAmountUnit: '', //总量单位
                totalAmount: '', //总量
                idClinicItem: '', //项目主键
                doseUnit: '', //总量单位
                factorUnits:'', //转换系数
                freqCounter: '', //频次次数
                freqInterval: '', //频次间隔
                stockUnit: '', //库存单位
                drugCode: '', //药品代码
                drugName: '', //药品名称
                drugFormUnit: '', //剂型单位
                factorDoseDrugForm: '',   //计算系数剂量剂型 - 盒
                factorDrugFormStock: '', //计算系数剂型包装 , -片
                skinTestIndicator:  0, //默认不需要皮试 0  ，1皮试
            },
        }   
    },
    computed: {
       
    },
    methods: {
 
        //医保校验天数参数
        drugDaysParmas(row) {
            //中药不走医保天数校验
            if (this.isHerBalDrug(row)) return false

            let parmas = this.copyObject(this.shareData);

            for (let k of Object.keys(parmas) ) {

                //药品信息
                if(!!row.currDrugsDetails[k] || row.currDrugsDetails[k] === 0) {
                    parmas[k] = row.currDrugsDetails[k];
                }
                //频次信息
                if(!!row.curFreqObj[k] || row.curFreqObj[k] === 0) {
                    parmas[k] = row.curFreqObj[k];
                }
                //当前行信息
                if(!!row[k] || row[k] === 0) {
                    parmas[k] = row[k];
                }
               
            }

            parmas.idPat = this.sourcePatInfo.idPat; //患者ID
            parmas.idVisit = this.sourcePatInfo.idVisit; //就诊id
            parmas.icno = this.sourcePatInfo.insuranceNo; //医保号
            parmas.sdScene = this.sourcePatInfo.sdScene; //医保场景

            parmas.passFlag = this.passFlag; //通过标识
            parmas.chargeTypeCode = this.chargeTypeCode;  //费别 ???  自费 01
            parmas.days = row.planDays;  //开药天数
            parmas.once = row.dose;  //单次剂量
            parmas.doseUnit = row.doseUnits;  //总量单位
            parmas.drugName = row.currDrugsDetails.clinicItemName;  //药品名称

            return parmas
        },

        //医保天数校验  -- 接口  （门诊开药）
        async checkDrugDaysValidAsync(row) {
            let parmas = this.drugDaysParmas(row);
            if(!parmas) return false
                
            let url = `outpdr/druginsurance/checkDrugOrder`;
            let res = await this.$axios._post(url, parmas);
            if (res.success) {
                return res.data;
            } else {
                this.$message.warning(res.message);
                return false
            }
        },

        //医保校验
        async getCheckDrugDaysValid(row) {
            let res = await this.checkDrugDaysValidAsync(row);
            if(!res) return ''
            
            row.currentPassTypeObj = res;

            this.showTipMessages(row, true);
        },

        //药品医保校验回调函数
        drugMedicalValid(val) {
            //医保转自费回调
            if (val == "isInsuranceToSelf") {
                this.checkData.messageList.map((item) => {
                    if (item.idList) {
                        item.idList.map((i) => {
                            this.toSelfPayIdList.push(i);
                        });
                    }
                });
            }
            //转即刻
            if(val == 'isImmediately') {

            }
        },
        

        //门诊共享医嘱校验
        async getShareOrdersValid(row) {
            let res = await this.checkDrugDaysValidAsync(row);
            if(!res) return ''
            
            // this.passFlag = res.passFlag
            if (res.state == 1) {
                // 校验通过
                this.checkData.dialogVisible = false;
                this.passFlag = 0;
                // this.saveTemplate(); //调用引用模板接口
            } else if (res.state == 0) {
                // 校验未通过

                this.passFlag = res.passFlag;
                this.checkData.dialogVisible = true;
                this.checkData.messageList = res.messageList;
                this.checkData.showDetail = false;
                this.checkData.submitStatus = false;
                this.checkData.isFreeStatus = true;
                this.checkData.toImmediately = false; //是按钮
                this.checkData.noImmediately = false; //否按钮
                this.checkData.insuranceFlag = false; //医保拒付是按钮


                let noPass_onlyColse = [15, 21, 30, 40];    //只有关闭
                let noPass_onlyColse_bren = [71];          //只有关闭
                let noPass_submit = [50];          //有确定按钮
                let noPass_detail = [60];         // 关闭，转自费，查看详情
                let noPass_insur = [20];         // 医保拒付是按钮
                let noPass_toImmed = [22];         // 转即刻是按钮


                if (noPass_onlyColse.includes(res.noPassType)) {
                    // 只有关闭
                    this.checkData.isFreeStatus = false;

                } else if (noPass_onlyColse_bren.includes(res.noPassType) && !this.isAtmeng) {
                    // 博仁 医保天数校验  --  只有关闭
                    this.checkData.isFreeStatus = false;

                }else if (noPass_submit.includes(res.noPassType)) {
                    this.checkData.submitStatus = true; // 有确定按钮
                    this.checkData.isFreeStatus = false;

                } else if (noPass_detail.includes(res.noPassType)) {
                    // 关闭，转自费，查看详情
                    this.checkData.showDetail = true;

                } else if (noPass_insur.includes(res.noPassType)) {
                    this.checkData.insuranceFlag = true; //医保拒付是按钮
                    this.checkData.toImmediately = false; //转即刻是按钮

                } else if (noPass_toImmed.includes(res.noPassType)) {
                    this.checkData.toImmediately = true; //转即刻是按钮
                    this.checkData.noImmediately = true; //否按钮
                    this.checkData.isFreeStatus = false; //转自费不展示
                    this.checkData.insuranceFlag = false; //医保拒付是按钮
                    // this.toSelfPayIdList = [] //转自费数组为空

                    // 转即刻数组赋值
                    res.messageList.map((item) => {
                        if (item.idList) {
                            item.idList.map((i) => {
                                this.toImmediatelyIdList.push(i);
                            });
                        }
                    });
                } else {
                    this.checkData.showDetail = false;
                    this.checkData.submitStatus = false;
                    this.checkData.isFreeStatus = true;
                }
            }

        },

         // 关闭弹窗将passFlag置为0
        changePassFlag(val) {
            this.passFlag = val;
            this.toSelfPayIdList = [];
            this.toImmediatelyIdList = [];
        },
        // 不转即刻
        noImmediately() {
            this.toImmediatelyIdList = [];
            this.getShareOrdersValid() //?????
        },
       
    }
}    