<template>
  <div class="testReport">
    <el-popover popper-class="popperTestName" placement="left" trigger="click" @show="getReportDetail(row)" @hide="showMask=false">
        <div style="height: 45px; line-height: 45px;">
            <div style="float: left;font-weight: 600; font-size: 16px;">检验报告</div>
            <!-- <div style="float: right; color: #5280FE;" v-show="showType=='2'">查看原始报告</div> -->
        </div>
        <div v-show="!gridData.length" @click='handleClick'>暂无数据</div>
        <!-- <div v-show="gridData.length" style="color: #5280FE;" @click='handleClick'>无文字报告，请点击查看原始报告！</div> -->
        <el-table :data="gridData" :header-cell-style='headerStyle' height='400' v-show="gridData.length" class="reportTableModel">
            <el-table-column property="reportItemName" label="检验项目" show-overflow-tooltip>
                <template slot-scope="scope">
                    {{scope.row.reportItemName}}
                    <img v-show="scope.row.abnormalIndicator=='L'" width="14px" height="14px"
                        style="vertical-align: middle;" src="@/assets/images/inpDoctor/docAdvice_low.png" alt="">
                    <img v-show="scope.row.abnormalIndicator=='H'" width="14px" height="14px"
                        style="vertical-align: middle;" src="@/assets/images/inpDoctor/docAdvice_high.png" alt="">
                </template>
            </el-table-column>
            <el-table-column width="120" property="result" label="结果" show-overflow-tooltip></el-table-column>
            <el-table-column width="100" property="units" label="单位" show-overflow-tooltip></el-table-column>
            <el-table-column width="200" property="referContext" label="参考值" show-overflow-tooltip></el-table-column>
            <el-table-column v-if="isBren"  prop="mic" label="MIC" width="100px"></el-table-column>
            <el-table-column v-if="isBren"  prop="rad" label="RAD" width="100px"></el-table-column>
        </el-table>
        <img slot="reference" class="moreDetail"
            src="@/assets/images/inpDoctor/docAdvice_report.svg">
    </el-popover>
    <div class="maskFlag" v-show="showMask"></div>
    <!-- 手写弹窗遮罩层校验 -->
    <div v-if="showMask" class="isModal"></div>
  </div>
</template>

<script>
export default {
    props: ['row'],
  data () {
    return {
        showMask:false, //遮罩层
        sdVisitType:'',//标识门诊还是住院
        gridData: [],
        // gridData: [
        //   {
        //     reportItemName: '血红蛋白',
        //     result: '地下',
        //     units: '厘米',
        //     referContext: '10000',
        //     abnormalIndicator: 'L'
        //   },
        // ],
        showType: '0',
        pdfUrl: '',
        headerStyle: {
            background: "#f5f5f5",
        }
    }
  },
  components: {},
  computed: {
        isBren(){
            return this.$limits.isDiffBren(this)
        },
  },
  created () {
  },
  mounted () {},
  methods: {
      getReportDetail(row) {
        // console.log(row)
        this.showMask = true
          this.getReport(row.applyLabCode, row.idClinicItem)
          // this.getReport(row.applyLabCode)
      },
      getReport(applyId, idClinicItem) {
          //sdVisitType 01门诊 03住院
          let Url;
          this.sdVisitType = this.$route.query.sdVisitType
          console.log('this.sdVisitType',this.sdVisitType)
          if(this.sdVisitType == '01') {
            Url = '/outpdr/applyReport/findLabResultByApplyIdAndCode'
          } else if(this.sdVisitType == '03'){
            Url = '/doctws/applyReport/findLabResultByApplyIdAndCode'
          }
          this.$axios
              .post(Url, {
                applyId: applyId,
                idClinicItem: idClinicItem
              })
              .then(res => {
                  if (res.success) {
                    // 特检和检验分开了,不需要区分 
                    //   vm.showType = res.data.showType
                    //   if (vm.showType == '2') {
                    //       vm.gridData = res.data.labResult
                    //   } else if (vm.showType == '1') {
                    //       vm.pdfUrl = res.data.pdfUrl
                    //       vm.gridData = []
                    //   }
                    this.gridData = res.data
                  } else {
                      this.$message({
                          message: res.message,
                          type: "warning"
                      })
                  }
              })
      },
      handleClick() {
          window.open(this.pdfUrl)
      }
  }
}

</script>
<style lang='scss' src='./testReport.scss'>
</style>