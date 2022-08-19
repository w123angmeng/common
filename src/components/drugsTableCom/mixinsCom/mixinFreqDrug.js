export const mixinFreqDrug = {
    data(){
        return {
            idFreqObj: {},    //频次列表对象
            frequencyData: [],       //频次列表
            tempFreqList: [],  //临时频次
            longFreqList: [],  //长期频次
            doseFormList: [], //剂型单位列表  
        }   
    },
    computed: {
        tempFreqArr() {
            let arr = this.frequencyData.filter(item=>{
                return this.tempFreqList.includes(item.idFreq)
            })
            return arr
        },

        longFreqArr() {
            let arr = this.frequencyData.filter(item=>{
                return this.longFreqList.includes(item.idFreq)
            })
            return arr
        },
    },
    methods: {

          //长临是否禁用
        disRepeatIndicator(row) {
            // 检查 检验 手术  中药 西药处方 西药出院带药
            let disArr = [this.CONSTANT.INSPECT_TYPE, this.CONSTANT.TEST_TYPE, this.CONSTANT.OPERATION_TYPE];
            return disArr.includes(row.sdClinicType) || this.isHerBalDrug(row) || this.dischargeMedicationIndicatorFlag(row) || row.idForm && this.isWestDrug(row)
        },

        //是否显示频次下拉
        isShowFreq(row) {
            if(this.isFromCopy) {
                // 除了药品长临都可以编辑，其他所有的临时的都不可编辑
                return !this.isInterim(row) || row.sdClinicType == this.CONSTANT.DRUG_TYPE
            }
            return false
        },

        //同步成组key
        applyGroupKeys(row, keys) {
            if(row.orderGroupCode && this.orderGroupCodeObj[row.orderGroupCode]){
                this.orderGroupCodeObj[row.orderGroupCode].forEach(item=>{
                    keys.forEach( key => {
                        item[key] = row[key]
                    })
                })
            }
            if(row.idForm && this.idFormObj[row.idForm]){
                this.idFormObj[row.idForm].forEach(item=>{
                    keys.forEach( key => {
                        item[key] = row[key]
                    })
                })
            }
        },

         //长/临时切换
         changlinChange(row, index) {
             this.frequencySomeData(index, row)
             //临时
            if (this.isInterim(row)) {
                let onceDefaultObj = this.tempFreqArr.filter(item=>{
                    return item.description.toLowerCase() === this.CONSTANT.FREQUENCY_ONCE
                })[0]
                row.idFreq = onceDefaultObj.idFreq;
                row.planDays = '1';  //切换临时 天数默认1
                //西药
                if(this.isWestDrug(row)) {
                    this.changeFreq(row, index);
                } else {
                    // row.idFreq = ''
                    row.groupCode = '';
                    row.totalAmount = 1; // 切换临时非药品总量默认 1
                }
                
                this.applyGroupKeys(row, ['repeatIndicator', 'idFreq', 'groupCode', 'planDays']);
                // 频次切换时已请求，防止循环多次请求
                //根据天数和单次用量  反算总量
                // this.tableData.map( (v,i) => {
                //     if( row.orderGroupCode == v.orderGroupCode) {
                //         this.totalAmountChange(v.totalAmount, i, v, true);
                //     }
                // })
    
            } else {
                if(this.longFreqArr.length) {
                    row.idFreq = this.longFreqArr[0].idFreq;
                    this.changeFreq(row, index)
                }
                row.planDays = 0; // 切换长期清空天数
                // 切换长期 药品清空用药总量  非药品默认1
                row.totalAmount = this.isWestDrug(row) ? 0 : 1; 

                this.applyGroupKeys(row, ['repeatIndicator', 'totalAmount', 'planDays']);
               
                //切换长期重新计算库存
                if(this.isWestDrug(row)) this.checkDrugStock(null, row)
            }
        },
    
        //频次列表
        async findDrugsFrep() {
            this.selectFrep().then(res=>{
                this.frequencyData = res;
            })
        },
       
        //出院带药标识
        dischargeMedicationIndicatorFlag(row) {
            return row.dischargeMedicationIndicator == 1;
        },

        //注射类药品
        isDefaultNow(row){
            return  this.isWestDrug(row) && this.doseFormList.includes(row.currDrugsDetails.sdDrugForm) && this.isInterim(row)
        },

        frequencySomeData(index, row){
            let curRow = this.tableData[index];
            // 出院带药，包括所有频次
            if(this.dischargeMedicationIndicatorFlag(curRow)){
                return this.$set(curRow,'frequencySomeData',this.copyObject(this.frequencyData))
            }

             // 中药，包括所有频次
             if(this.isHerBalDrug(curRow)){
                return this.$set(curRow,'frequencySomeData',this.copyObject(this.frequencyData))
            }
            //临时
            if(this.isInterim(curRow)) {
                //注射类 参数配置里的频次
                if(this.isDefaultNow(curRow)) {
                    return this.$set(curRow,'frequencySomeData',this.copyObject(this.tempFreqArr))
                }
                //非注射类 所有频次
                return this.$set(curRow,'frequencySomeData',this.copyObject(this.frequencyData))

            } else {
                //长期
                return this.$set(curRow,'frequencySomeData',this.copyObject(this.longFreqArr))
            }
        },

        //频次列表
        async drugsFreq() {
            let arr = await this.selectAllFrep();
            if(!arr) return
            let obj = {};
            arr.forEach((item) => {
                obj[item.idFreq] = item;
            });
            this.idFreqObj = obj;
        },
        //查询所有频次信息
        async selectAllFrep() {
            let res = await this.$axios.post("/dict/freq/findAllFreqInfo", {});
            if (res.success) {
                return res.data;
            } else {
                this.$message.warning(res.message);
                return false
            }
        },
         //处理频次 执行时段
        changeFreq(row, index, val, isFist) {
            if (!row.idFreq) return
          
            // let curr = this.tableData[index];
            let curr = row; // 不能使用index获取当前行，不适用于模版引用
            let curFreq = this.idFreqObj[row.idFreq];
            console.log('频次信息---',curFreq);
            if (!curFreq) return
            this.$set(curr, "curFreqObj", curFreq);         //频次信息
            this.$set(curr, "idFreqTimeList", curFreq.freqTimeList || []);     //执行时段列表
            this.applyGroupKeys(row, ['idFreq', 'curFreqObj', 'idFreqTimeList']);
            if(!val) {
                curr.groupCode = '';
                curr.groupCodeStr = '';
                curr.currentGroupCodeObj = {};
            }
            this.$nextTick(()=> {
                // 如果执行时段没有值，就默认第一个
                if(curr.idFreqTimeList.length) {
                    if(!curr.groupCode){
                        if(!this.isInterim(row)) {
                            curr.currentGroupCodeObj = curr.idFreqTimeList[0];
                            curr.groupCode = curr.idFreqTimeList[0].groupCode;
                            curr.groupCodeStr = curr.idFreqTimeList[0].executeTimeStr;
                        }
                    } else {
                        curFreq.freqTimeList.map( v => {
                            if(v.groupCode === val) {
                                curr.currentGroupCodeObj = v ;
                                curr.groupCode = v.groupCode;
                                curr.groupCodeStr = v.executeTimeStr;
                            }
                        })
                    }
                }
                this.applyGroupKeys(row, ['groupCode', 'groupCodeStr', 'currentGroupCodeObj']);
                this.$nextTick(()=> {
                    //药品 频次发生变化 重新计算总量  天数不变
                    if(this.isWestDrug(row) && !val && this.isInterim(row)) {
                        if(isFist) return
                        this.totalAmountChange(row.totalAmount, index, row, true);
                    }
                })
            })
        },
    }
}    