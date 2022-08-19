
export default {
    name:'mixinsGcpAtm',
    data(){
        return {
            gcpIdentificationList: [],
            isGcp: false,
            gcpIdentification: this.CONSTANT.UN_GCP_FLAG_ATM,
        }
    },
    computed: {
        isAtmeng(){
            return this.$limits.isFun(this) || false
        },
        userParmasObj() {
            return this.getUserStorage();
        },
        idEmpStr() {
            return this.userParmasObj.idEmp;
        },
        getGcpIdList(){
            return this.gcpIdentificationList.map(v => v.idClinicItem).filter(item => item);
        },
        getclinicItem(){
            let map = new Map();
            this.gcpIdentificationList.forEach(element => {
                map.set(element.idClinicItem, element.gcpIdentification)
            });
            return map;
        },
    },
    methods: {

         //  查询gcp
         async gcpFlagFn(gcpParmas){
            let obj = {
                idVisit: this.$route.query.idVisit,
                sdVisitType: gcpParmas.sdVisitType,
                idEmp: this.idEmpStr,
                idClinicItemList: gcpParmas.idList,
            }

            return this.gcpIdentificationList = await this.findGcpFlag(obj);
        },
        //单条医嘱 取消gcp 业务
        gcpFlagFnOne(gcpParmas){ 
            if(!this.isAtmeng) return
            let obj = {
                idVisit: this.$route.query.idVisit,
                sdVisitType: gcpParmas.sdVisitType,
                idEmp: this.idEmpStr,
                idClinicItemList: gcpParmas.idList,
            }
            this.resetGcpOne();
            this.findGcpFlag(obj).then(data =>{
                console.log('单条 ---', data);
                if(data.length){
                    this.gcpIdentification = data[0].gcpIdentification;
                    this.isGcp = gcpParmas.isEditFlag ? gcpParmas.gcpIdentification == this.CONSTANT.GCP_FLAG_ATM: this.gcpIdentification == this.CONSTANT.GCP_FLAG_ATM
                }
            })
        },

        //清除单条医嘱 gcp
        resetGcpOne() {
            this.isGcp = false;
            this.gcpIdentification = this.CONSTANT.UN_GCP_FLAG_ATM;
        },
        
         //多条医嘱 取消gcp 业务
        async commitGcpOrders(gcpParmas) {
            console.log('多条医嘱--- gcpParmas --', gcpParmas);
            if(this.isAtmeng) {
                let resData = await this.gcpFlagFn(gcpParmas);
                if(!resData && typeof(resData) === 'undefined') return false
                console.log('单条 ---', resData);
                let id = '';
                if(!gcpParmas.isEditFlag) id = gcpParmas.idList[0];  //新增
                console.log("新增0项--id---", id);
               
                gcpParmas.gcpOrders.map( (item, idx) => {
                    let isGcp = false;

                    if(!gcpParmas.isEditFlag) {
                        if(gcpParmas.isForm !== 'apply') {
                            if(item.idClinicItem !== id ) return
                            console.log("项目id一致");
                            if(gcpParmas.index !== idx) return
                            console.log("下标值一致");
                        }
                        item.gcpIdentification = this.CONSTANT.UN_GCP_FLAG_ATM;
                    } else {
                        //编辑直接读取后端返回 的 gcp 标识
                        item.gcpIdentificationCopy = item.gcpIdentificationCopy;
                        isGcp = gcpParmas.isForm === 'apply' ? item.gcpIdentificationCopy == this.CONSTANT.GCP_FLAG_ATM : item.gcpIdentification == this.CONSTANT.GCP_FLAG_ATM 
                    }
                   
                    this.$nextTick(() => {
                        if(this.getGcpIdList.includes(item.idClinicItem)){
                            item.gcpIdentification = this.getclinicItem.get(item.idClinicItem)
                            console.log("接口项目有返回gcp标识", item);
                        }
                        //新增
                        if(!gcpParmas.isEditFlag) {
                            isGcp = item.gcpIdentification == this.CONSTANT.GCP_FLAG_ATM ? true : false
                            item.gcpIdentificationCopy = item.gcpIdentification
                            console.log('新增--', item);
                        }
                        console.log('item---',item,);
                       
                        // console.log(isGcp,'gcpIdentificationCopy---', item.gcpIdentificationCopy, 'gcpIdentification---', item.gcpIdentification);
                        this.$set(item, 'isGcp', isGcp)
                        this.$forceUpdate();
                    })
                })
            }
            console.log('return ---gcpOrders',gcpParmas.gcpOrders);
            return gcpParmas.gcpOrders
        },

         //多条医嘱gcp查询标记 （复制 -- 暂存 -- 中药）
         async commitSomeGcpOrders(gcpParmas) {

            if(this.isAtmeng) {
                let resData = await this.gcpFlagFn(gcpParmas);
                if(!resData && typeof(resData) === 'undefined') return false

                gcpParmas.gcpOrders.map( (item, idx) => {
                    item.gcpIdentification = this.CONSTANT.UN_GCP_FLAG_ATM;
                    this.$nextTick(() => {
                        if(this.getGcpIdList.includes(item.idClinicItem)){
                            item.gcpIdentification = this.getclinicItem.get(item.idClinicItem)
                        }
                    })
                })
            }
            return gcpParmas.gcpOrders
        },
        
        //保存gcp医嘱处理标识
        saveGcpOrdersFlag(gcpOrders, isSome) {
            if(!this.isAtmeng) return gcpOrders

            if(isSome) {
                gcpOrders.forEach(ele => {
                    ele.gcpIdentification = this.CONSTANT.UN_GCP_FLAG_ATM;
                    ele.gcpIdentification = ele.isGcp ? this.CONSTANT.GCP_FLAG_ATM : this.CONSTANT.UN_GCP_FLAG_ATM
                });

            } else {
                gcpOrders.gcpIdentification = this.isGcp ? this.CONSTANT.GCP_FLAG_ATM : this.CONSTANT.UN_GCP_FLAG_ATM; // 新增gcp标识
            }

            return gcpOrders
        },

         //显示gcp
        isShowGcpBtn() {
            if(!this.isAtmeng) return false
            return this.isGcpPat
        },

        //多条、单条数据 禁用 gcp
        disableGcp( item , index) {
            if(item && item.idClinicItem) {
                return item.gcpIdentification != this.CONSTANT.GCP_FLAG_ATM
            }
            return this.gcpIdentification != this.CONSTANT.GCP_FLAG_ATM
        },
    }
}    