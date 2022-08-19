<template>
  <div class="outpTmplBarLeftTree flexColumn">
    <div class="oupDoctorModuleMenu">
      <div class="limitRange">
        <el-radio-group v-model="limitRadio" class="radiobox common_radio_group flexRow" @change='changelimit'>
        <el-radio-button  v-for="(item) in limitRange" :key='item.dataCode+"limitRange"' 
          :label="item.dataCode">{{item.dataName}}</el-radio-button>
          </el-radio-group>
      </div>
      <div class="inputDiv moduleSearchName">
          <el-input v-model="moduleSearchName" placeholder="模板名称"  suffix-icon="el-icon-search" @keyup.enter.native='resetTableData'>
          </el-input>
      </div>
    </div>
    <div class="leftBarTree commonTree">
      <el-tree :data="treeData" :props="defaultProps" default-expand-all @node-click="handleNodeClick" highlight-current
        :empty-text='emptyText' ref="treeBox" node-key="idItem"></el-tree>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";

  export default {
    props:{
      getData:{

      },
      from:{
        default(){
          return {}
        }
      }
    },
    data() {
      return {
        limitRadio: '0', //0 全院权限,1 科室权限，2个人
        limitRange: [], // 全院，科室，个人
        moduleSearchName: '', // 模板名称
        treeData: [],
        defaultProps: {
          children: 'ciOrdersTemplateList',
          label: 'ordersTemplateName'
        },
        emptyText: '正在加载......'
      }
    },
    components: {},
    computed: {
      ...mapGetters(["docPatientParams", 'routerPath']),
      indicatorType(){
        let obj = {
          outpatient:'01',
          emergency:'02',
          inPatient:'03',
        }
        return obj[this.fromType]
      },
      fromType(){
        return this.from.type || 'outpatient'
      },
      isInPatient(){
        return this.fromType === 'inPatient'
      }
    },
    created() {
      this.getLimitRange()
      this.resetTableData()
    },
    mounted() { },
    methods: {
      //获取医嘱模板范围 个人/科室/全院
      getLimitRange() {
        this.findSdData('SD_OWE_RIGHT_TYPE').then(res => {
          this.limitRange = res.SD_OWE_RIGHT_TYPE
        })
      },
      //切换类型
      changelimit(e) {
        this.resetTableData();
         let obj = {
          '2': '选择个人',
          '1': '选择科室'
        }
        let eventName = obj[e] || '';
        if(eventName && this.isInPatient) this.getBuryingPoint(eventName)
      },

      // 查询接口
      resetTableData() {
          this.$root.Bus.$emit('isToggleDisabled', true); // loading
        let vm = this
        let url = `/tpl/ciOrdersTemplate/listQuoteCiOrdersTemplate`
        // url = window.globalUrl.baseURL11 + url;
        vm.$axios.post(url, {
          search: vm.moduleSearchName,
          sdOweRightType: vm.limitRadio,
          idDept: vm.$route.query.idDept, // 不取当前登陆者的idDept,取当前科室的idDept,科室可以切换
          indicatorType: this.indicatorType, // 01-门诊 02-急诊 03-住院
          sdClinicType: '', // 1-药品 2-检查 3-检验 4-治疗 5-手术 6-护理 7-膳食 8-材料 9-会诊 12-其它 allType-全部
        }).then(res => {
          if (res.success) {
            vm.treeData = []
            if (!res.data.length) {
              vm.emptyText = '暂无数据'
              this.$root.Bus.$emit('treeData', 0)
              this.$root.Bus.$emit('isToggleDisabled', false); // loading
            } else {
              res.data.map(item => {
                item.ordersTemplateName = item.sdClinicTypeStr
              })
              this.formatTableData(res.data)
              this.$nextTick(_ => {
                vm.treeData = res.data
                if (vm.treeData[0].ciOrdersTemplateList.length) {
                this.$root.Bus.$emit('treeData', vm.treeData[0].ciOrdersTemplateList[0])
                this.$nextTick(() => {
                  this.$refs.treeBox.setCurrentKey(vm.treeData[0].ciOrdersTemplateList[0].idItem);
                });
              }
              })
            }
          } else {
            vm.$message({
              message: res.message,
              type: 'warning',
            })
          }
        })
      },
      //添加随机唯一id
      formatTableData (arr) {
        let str = ''
        arr.forEach(item => {
          str = Math.random().toString(36).slice(2)
          item.idItem = str
          if (item.ciOrdersTemplateList && item.ciOrdersTemplateList.length) {
             this.formatTableData(item.ciOrdersTemplateList)
          }
        })
      },
      // 点击树状结构
      handleNodeClick(data) {
        if (!data.sdClinicTypeStr) {
            this.$root.Bus.$emit('treeData', data)
            this.$root.Bus.$emit('isToggleDisabled', true); // loading
        }
      },
      //埋点处理
      getBuryingPoint(eventName, parmas = {}) {
          let obj = {
              idPat: this.docPatientParams.idPat || this.$route.query.idPat,
              idVisit: this.docPatientParams.idVisit || this.$route.query.idVisit,
              ...parmas
          }
          //埋点
          let parame = [{
              eventDescription: eventName, //事件名字
              properties:[obj],   //参数
              title: '医嘱录入',   //模块
              subTitle: '医嘱模板', //子模块
              url: this.routerPath,
          }]
          this.buryingPoint(parame, 'hospitalDoctor');
      },
    }
  }

</script>
<style lang='scss' src='./outpTmplBarLeftTree.scss'>
</style>