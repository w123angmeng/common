
export const mixinSaveAgent = {
    data(){
        return {
            //造影剂弹窗
            agentDrugForm: {
                visible: false,
                sdVisitType: '',  //就诊类型
                source: '',       //来源住院
                funSource: 'agent',  //功能来源 -- 造影剂
                isFromApply: false,
                isCopy: false,
                column: {
                    repeatIndicator: true,
                    dose: true,
                    routeName: true,
                    planDays: true,
                    doseUnits: true,
                    idFreq: true,
                },
                tableList: [],
                commitDrug: [],
            },
            agentListObj: {},
            allAgentList: [],
        }   
    },
    computed: {
         //门诊来源
        isSourceOutp() {
            return this.agentDrugForm.source === 'outp';
        },
        isFromInp() {
            return this.agentDrugForm.source === 'inp';
        },
        isFromCopy() {
            return this.isFromInp && this.agentDrugForm.isCopy 
        },
        //申请单
        isFromApply() {
            return this.agentDrugForm.isFromApply || false
        },
        saveAgentUrl() {
            if(this.isSourceOutp) {
                return '/outpdr/drug/batchSaveDrug'
            }
            return 'doctws/drugOrdersIn/batchSaveDrugOrders'
        },
    },
    methods:{

        async getCurrentTime() {
            await this.getServerTime('ymdHms');
        },

        // 增强项目查询 --- 造影剂 
        getAgentList(id) {
            this.$axios.get("/dict/itemPackage/listByIdClinicItem", {
                idClinicItem: id
            }).then(res => {
                if (res.success) {
                    if(res.data && res.data.length) {
                        this.agentDrugForm.tableList = res.data;
                        this.agentDrugForm.idClinicItem = id;
                        this.agentDrugForm.visible = true;
                    }
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },

         // 增强项目查询 (复制) --- 造影剂 
        getCopyAgentList(idList = []) {
            if(!idList.length) return
            this.$axios._post("/dict/itemPackage/listByListIdClinicItem", idList).then(res => {
                if (res.success) {
                    if(res.data && res.data.length) {
                        this.agentDrugForm.tableList = res.data;
                        this.agentDrugForm.visible = true;
                    }
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },
        //复制检查增强类 弹出造影剂直接保存
        async saveCopyAgent() {
            let nowTime = await this.getServerTime('ymdHms')
            let copyRows = this.copyObject(this.agentDrugForm.commitDrug)
            copyRows.map( item => {
                // item.ciOrders.dtOrderStart = nowTime;
                //特殊处理复制增强检查医嘱开始时间 跟着检查走
                let ts = this.agentDrugForm.dtOrderStartObj[item.ciOrders.idClinicItemParent];

                item.ciOrders.dtOrderStart = ts ? `${ts}` : nowTime;
                //特殊处理复制医嘱自费  费别跟着检查走
                // item.self = this.agentDrugForm.selfObj[item.ciOrders.idClinicItemParent];
            })

            const resData = await this.$axios._post( this.saveAgentUrl, copyRows) 
            if (resData.success) {
                let obj = {
                    ordersList: resData.data,
                    type: 'copyOrders'
                }
                this.copyGetNewOrdersList(obj); // 复制检查后-保存药品，调用医嘱列表不刷新数据处理
                this.$emit('upDataSaveLoading', false);
            } else {
                this.$message({
                    message: resData.message,
                    type: "warning"
                });
                this.$emit('upDataSaveLoading', false);
            } 
            this.allAgentList = [];
        },
        
        //重置造影剂
        resetAgent() {
            this.agentListObj = {};
            this.allAgentList = [];

            if(this.isFromApply) return

            if(this.isSourceOutp) {
                this.SET_DOCCOMMITSTATE(true); // 获取暂存区table数据
            } else {
                this.$emit('getDocOrderList');  //获取医嘱列表
            }
        },

        //保存造影剂
        async saveAgentListInfo() {
            console.log('保存造影剂 ---- ',this.allAgentList);
            const resData = await this.$axios._post( this.saveAgentUrl, this.allAgentList) 
            if (resData.success) {
                this.resetAgent();
               return resData.data
            } else {
                this.$message({
                    message: resData.message,
                    type: "warning"
                });
                this.resetAgent();
            } 
        },

        //校验是否有造影剂信息
        async validateIsAgent(arr) {
            this.allAgentList = [];
            let nowTime;
            if(this.isFromApply) nowTime = await this.getServerTime('ymdHms')

            arr.map( v => { 
                if( this.agentListObj[v.idClinicItem]) {
                    let rows = this.agentListObj[v.idClinicItem];
                    let copyRows = this.copyObject(rows);
                    copyRows.map( item => {
                        //门诊 特殊处理医保转自费
                         
                        let items = this.diffRowData(item, nowTime);
                        
                        this.allAgentList.push(items)
                    })
                }
            })
            return !!this.allAgentList.length
        },

        diffRowData(item, nowTime) {
            //申请单
            if(this.isFromApply) {
                item.ciOrders.dtOrderStart = nowTime;
                //费别跟随 申请单走
                // if(this.insuranceFlag) item.self = true;
               

                return item
            }

            if(this.isSourceOutp) {
                //费别跟随 申请单走
                // if(this.insuranceFlag) item.self = true;
                return item
            } else {
                //住院 特殊处理开始时间和 补录标识
                item.ciOrders.dtOrderStart = this.formData.dtOrderStart + ':00';
                item.fillFlag = this.formData.fillFlag || '0';
                return item
            }
        },

        //暂存造影剂
        commitSingleAgent() {
            //复制医嘱直接保存
            if(this.isFromCopy) {
                this.saveCopyAgent();
                return
            }
            this.agentListObj[this.agentDrugForm.idClinicItem] = this.agentDrugForm.commitDrug;
        },

        //删除造影剂
        deleteAgentItem(idx, item) {
            if(this.agentListObj[item.idClinicItem]) {
                delete this.agentListObj[item.idClinicItem]
            }
        },
    }
}    