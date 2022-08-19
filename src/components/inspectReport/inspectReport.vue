<template>
  <div class="inspectReport">
    <el-popover popper-class="popperName" placement="left" trigger="click" @show="getReportDetail(row)" @hide="showMask=false">
      <div style="height: 30px; line-height: 30px;margin-bottom: 10px;">
        <div style="float: left;font-weight: 600; font-size: 16px;">检查报告</div>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
        <img v-if="result.isAbnormal == '1'" src="@/assets/images/inpDoctor/docAdvice_male.png" alt="" width="36px"
          height='36px'>
        <img v-else src="@/assets/images/inpDoctor/docAdvice_female.png" alt="" width="36px" height='36px'>
        <!-- <a target="_blank"  style="float: right; color: #5280FE; cursor: pointer;" href="reportUrl">查看图文报告</a> -->
        <div style="float: right; color: #1890FF; cursor: pointer;" @click='openReportUrl'>查看图文报告</div>
      </div>
      <div class="reportContent">
        <div style="margin-bottom: 12px;"><span style="font-weight: 600; font-size: 14px;">检查目的:</span><span
            v-html='row.examObjective'></span></div>
        <div style="margin-bottom: 12px;"><span style="font-weight: 600; font-size: 14px;">相关化验:</span><span
            v-html='result.relevantLabTest'></span></div>
        <div style="margin-bottom: 12px;"><span style="font-weight: 600; font-size: 14px;">检查所见:</span><span
            v-html='result.description'></span>
        </div>
        <div style="margin-bottom: 12px;"><span style="font-weight: 600; font-size: 14px;">印&emsp;&emsp;象:</span><span
            v-html='result.impression'></span></div>
        <div style="margin-bottom: 12px;"><span style="font-weight: 600; font-size: 14px;">建&emsp;&emsp;议:</span><span
            v-html='result.recommendation'></span></div>
      </div>
      <img slot="reference" class="moreDetail" src="@/assets/images/inpDoctor/docAdvice_report.svg">
    </el-popover>
    <div class="maskFlag" v-show="showMask"></div>
      <!-- 手写弹窗遮罩层校验 -->
    <div v-if="showMask" class="isModal"></div>
  </div>
</template>

<script>
  export default {
    props: ['row'],
    data() {
      return {
        showMask: false,
        reportUrl:'',//报告链接
        result: {
          relevantLabTest: '', // 相关化验
          description: '', // 检查所见
          impression: '', // 印象
          recommendation: '', // 建议
          isAbnormal: '', // 阴阳性
        }
      }
    },
    components: {},
    computed: {},
    created() {
      console.log(this.row)
    },
    mounted() { },
    methods: {
      getReportDetail(row) {
        this.showMask = true
        // console.log('row:', row);
        this.getReport(row.idApplyExam)
      },
      getReport(applyId) {
        //sdVisitType 01门诊 03住院
        let Url;
        this.sdVisitType = this.$route.query.sdVisitType
        console.log('this.sdVisitType', this.sdVisitType)
        if (this.sdVisitType == '01') {
          Url = '/outpdr/applyReport/findExamByApplyId'
        } else if (this.sdVisitType == '03') {
          Url = '/doctws/applyReport/findExamByApplyId'
        }
        this.$axios
          .post(Url, {
            applyId: applyId,
            // itemCode: itemCode
          })
          .then(res => {
            if (res.success) {
              let datas = res.data
              this.reportUrl = res.data.reportUrl
              // if(!this.reportUrl) {
              //   this.$message({
              //   message: '没有对应的图文报告',
              //   type: "warning"
              // })
              // }
              for (const key in datas) {
                var element = datas[key];
                // console.log('key',key)
                // console.log('element',element)
                if (element == 'null' || element == null) {
                  datas[key] = ''
                }
              }
              // console.log('datas', datas)
              this.result = datas
            } else {
              this.$message({
                message: res.message,
                type: "warning"
              })
            }
          })
      },
      openReportUrl() {
        if (!this.reportUrl) {
          this.$message({
            message: '没有对应的图文报告',
            type: "warning"
          })
          return
        } else {
          window.open(this.reportUrl)
        }
      }
    }
  }

</script>
<style lang='scss' src='./inspectReport.scss'>
</style>