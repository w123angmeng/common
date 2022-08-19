<template>
  <div class="outpTmplBar" :class="{isInPatient:isInPatient}">
      <div class="outpTmplBarModal" v-if='outpTmplBarModal' 
        v-loading="isInPatient && isLoading"
      >
        <el-row style="height: 100%;" :class="{isInPatientRow:isInPatient}">
          <el-col :span="4" style="height: 100%;" :class="{isInPatientLeftBar:isInPatient}">
            <OutpTmplBarLeftTree :from="from"></OutpTmplBarLeftTree>
          </el-col>
          <el-col :span="20" style="height: 100%;"  v-if="!isInPatient">
            <OutpTmplBarRightCont @cancle="switchBtn"  :from="from" :inspectData="inspectData"></OutpTmplBarRightCont>
          </el-col>
          <div v-else class="inpatientRight">
            <!-- <OutpTmplBarRightCont2 @cancle="switchBtn"  :from="from" :inspectData="inspectData" ></OutpTmplBarRightCont2> -->
            <doctwsTmplBarRightCont @cancle="switchBtn" :from="from" :inspectData="inspectData"></doctwsTmplBarRightCont>
          </div>
        </el-row>
    </div>
    <div v-if="outpTmplBarModal"  class="mask isModal"></div>
    <div class="outpTmplBarTitle" @click='switchBtn' :style="{ left: left}">
      医嘱模板
    </div>
    <div v-if="showHistoryPrescript" @click='showHistoryPrescriptHandler' class="mask isModal"></div>
    <div class="historyPrescript outpTmplBarTitle" v-if="showHistoryBtn" :style="{ left: historyLeft}" @click="showHistoryPrescriptHandler">
      历史处方
    </div>
    <OutpTmpl v-if="outpTmplVisible" :outpTmplData="outpTmplData" :curTpmlType="0"
        @closeHisModal="closeHisModal">
    </OutpTmpl>
  </div>
  
</template>

<script>
  import bus from '@/components/common/bus.js';
  import OutpTmplBarLeftTree from './outpTmplBarLeftTree/outpTmplBarLeftTree.vue' // 左侧树结构
  import OutpTmplBarRightCont from './outpTmplBarRightCont/outpTmplBarRightCont.vue' // 右侧内容
  import OutpTmplBarRightCont2 from './outpTmplBarRightCont/outpTmplBarRightCont2.vue' // 右侧内容
  import OutpTmpl from '@/components/page/OutPatient_WEB/receivePatient/outpDocOrders/outpTmpl/outpTmpl.vue'; //药品模板组件
  import doctwsTmplBarRightCont from './outpTmplBarRightCont/doctwsTmplBarRightCont.vue'
  import {
        mapMutations,
        mapGetters
    } from 'vuex';
  const DOCORDER_TAB = 'doctorAdvice';   //医嘱tab
  export default {
     props:{
      inspectData:{},
      from:{
        default(){
          return {}
        }
      }
    },
    components: {
      OutpTmplBarLeftTree, // 左侧树结构
      OutpTmplBarRightCont, // 右侧内容
      OutpTmplBarRightCont2, // 右侧最新内容
      OutpTmpl,
      doctwsTmplBarRightCont
    },
    data() {
      return {
        showTemplate: false, //是否显示医嘱模板tab条
        outpTmplBarModal: false, // 是否显示模板内容
        outpTmplVisible: false, // 是否显示历史处方
        showHistoryPrescript: false, // 历史处方开关
        left: '0px',
        historyLeft: '0px',
        outpTmplData: {
            specialDiseases: '', //特病标识
            sdScene: '', //场景
            dialogVisible: true,
            idDiagnosisClass: '', //诊断分组id
        }, //模板类型数据
        isLoading: true, // 全屏loading防止数据还未计算完切换其他分类-控制台报错问题
      }
    },
    
    computed: {
      ...mapGetters(["outpCurTab", "routerPath"]),
      isInPatient(){
        return this.from.type === 'inPatient'
      },
      showHistoryBtn(){
        return !this.isInPatient&&this.outpCurTab === DOCORDER_TAB
      }
    },
    created() {
      this.init()
    },
    mounted() { },
    methods: {
      init(){
        bus.$off('closeTemplate') //关闭医嘱模板弹窗
        bus.$on('closeTemplate', msg => {
          if (msg == '1') {
            this.outpTmplBarModal = false
            this.left = 0
          }
        })
        this.$root.Bus.$off('isToggleDisabled');
        this.$root.Bus.$on('isToggleDisabled',(params)=>{
            this.isLoading = params;
        })
      },
      //设置当前所需数据
      setOutpTmplData(){
        this.outpTmplData.specialDiseases = this.inspectData.specialDisease; //特病标识
        this.outpTmplData.sdScene = this.inspectData.sdScene; //场景
        this.outpTmplData.idDiagnosisClass = this.inspectData.idDiagnosisClass; //诊断分组id
      },
      //点击医嘱模板按钮
      switchBtn() {
        this.outpTmplBarModal = !this.outpTmplBarModal
        this.computedLeft(this.outpTmplBarModal)
      },
      computedLeft(flag,from='left'){
        let collapse = JSON.parse(sessionStorage.getItem('collapse'))
        setTimeout(() => {
          let width = 0
          let coll = 0
          if(document.querySelector('.outpTmplBarModal')&&document.querySelector('.sidebar')){
            width = document.querySelector('.outpTmplBarModal').offsetWidth
            coll = document.querySelector('.sidebar').offsetWidth
          }
          this[from] = flag ? (collapse ? '94%' : `${width - coll}px`) : '0px'
        }, 30);
      },
      showHistoryPrescriptHandler(){
        this.showHistoryPrescript = !this.showHistoryPrescript
        this.setOutpTmplData()
        this.outpTmplVisible = this.showHistoryPrescript
        this.outpTmplData.dialogVisible = this.showHistoryPrescript
        this.computedLeft(this.showHistoryPrescript,'historyLeft')
        if(this.showHistoryPrescript) this.getBuryingPoint('历史处方');
      },
      closeHisModal(){
        this.outpTmplVisible = false
        this.outpTmplData.dialogVisible = false
        
      },
       //埋点处理
      getBuryingPoint(eventName, parmas = {}) {
          //埋点
          let parame = [{
              eventDescription: eventName,
              properties:[parmas],
              title: '患者病历',   //模块
              subTitle: '患者病历', //子模块
              url: this.routerPath,
          }]
          this.buryingPoint(parame);
      },
    },
    watch:{
      showHistoryPrescript(val){
        this.computedLeft(val,'historyLeft')
      },
      'outpTmplData.dialogVisible'(val){
        this.showHistoryPrescript = val
        this.computedLeft(this.showHistoryPrescript,'historyLeft')
      }
    }
  }

</script>
<style lang='scss' src='./outpTmplBar.scss'>
</style>