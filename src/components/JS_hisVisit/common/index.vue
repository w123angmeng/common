<template>
    <div class="historyVisitPage_Js">
        <div class="tit_js">
            <span class="patCont">
                <span>{{recParmas.patName}}</span>
                <span>{{recParmas.patCode}}</span>
                <span>{{recParmas.sdSexStr}}</span>
                <span>{{recParmas.ageStr}}</span>
                <el-tooltip  
                    effect="dark" 
                    :content="recParmas.diagnosisName"
                    :disabled='recParmas.diagnosisName && recParmas.diagnosisName.length < 17'
                    placement="right-end">
                    <span class="diagnosisN">主诊断：{{mainDians}}</span>
                </el-tooltip>
                <span>就诊日期：{{curVisitObj.dtEntry}}</span>
            </span>
        </div>
        <div class="Js_Content">
            <div class="js_l">
                <div 
                    v-for="(item, index) in caseHisVList" :key="index" 
                    @click="changeCurVisit(item, index)"
                    class="item_hisVisit" 
                    :class="{curVisitJs: curVisitObj.idVisit == item.idVisit}">
                    <div>
                        <span class="spanTitle">就诊日期: </span> {{item.dtEntry}}
                    </div>
                    <div>
                        <span class="spanTitle">就诊科室: </span> {{item.deptName}}
                    </div>
                    <div>
                        <span class="spanTitle">接诊医生: </span> {{item.doctorName}}
                    </div>
                </div>
            </div>
            <div class="js_r">
                <component 
                    :is="currentComponent"  
                    v-if="currentComponent" 
                    :curVisitObj="curVisitObj"
                    @curMrDians="curMrDians"
                    :ref="currentComponent">
                </component>
            </div>
        </div>  
    </div>
</template>
<script>
import MedDetail from "./medDetail.vue";

export default {
    props: {
        historyVisitForm: {
            type: Object,
            default: () => {
                return {}
            },
        },
    }, 
    components: {
        MedDetail
    },
    data() {
        return {

            recParmas: {},
            mainDians: '',   //主诊断
            caseHisVList: [], //历史就诊列表

            curVisitObj: {},
           
            activeName: 'medDetail',
            outpTabs: [
                {
                    title: '病历',
                    name: 'medDetail',
                    component: 'MedDetail',
                }, 
            ]
        };
    },
    created() {
        this.init();
    },
    computed: {
        checkTabComponent(){
            let map = new Map();
            this.outpTabs.forEach(item=>{
                map.set(item.name,item.component)
            })
            return map
        },
        currentComponent(){
            return this.checkTabComponent.get(this.activeName);
        },
        idPatStr() {
            return this.$route.query.idPat || '';
        },
        //京顺免密病历
        isFreeLoginJshun() {
            return this.$route.query.accountName || ''
        },
        searchVisitTimeUrl() {
            if(this.isFreeLoginJshun) return '/reg/visit/visitTimeLine'
            return 'outpdr/ciMrItem/otherSystemVisit'
        },
    },
    methods: {
         /**初始数据  */
        init() {
            if(this.isFreeLoginJshun) {
                 this.findRegPatInfo();
            } else {
                 this.recParmas = JSON.parse(sessionStorage.getItem('receivePatientParams'));
            }
           
            this.getCaseHistoryList();
        },

        /**患者信息  */
        findRegPatInfo() {
            this.$axios.get("/reg/pat/findPatById", {
                idPat: this.idPatStr
            }).then(resData => {
                if (resData.success) {
                    this.recParmas = resData.data;
                } else {
                    this.$message.warning(resData.message)
                }
            });
        },


        /**获取患者就诊记录列表  */
        async getCaseHistoryList() {
            let parmas = {
                sdVisitType: this.CONSTANT.OUTP_VISIT_TYPE,
                pageSize: 999,
                idPat: this.idPatStr,
                idDept: ''
            }

            let resData = await this.$axios.post(this.searchVisitTimeUrl, parmas);
            if(resData.success) {
                this.caseHisVList = resData.data; //历史病历就诊列表
                if(this.caseHisVList.length) {
                    this.changeCurVisit(this.caseHisVList[0], 0)
                }
                console.log( this.caseHisVList);
                return true
            } 
            this.$message.warning(resData.message)
            return false
        },
        
        /**切换当前就诊  */
        changeCurVisit(item, inddex) {
            this.curVisitObj = item;
            this.$nextTick(()=> {
                this.$refs[this.currentComponent].init();
            })
        },

        /** 主诊断 */
        curMrDians(val) {
            this.mainDians = val;
        },
    }
  };

</script>

<style lang="scss" src="./index.scss">
</style>