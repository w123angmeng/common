<template>
  <div class="checkDetailTpml">
    <!-- 医保校验详情弹窗 -->
    <el-dialog title="药品信息" :visible.sync="checkDetailData.dialogVisibleDetail" width="70%" :close-on-click-modal='false' :close-on-press-escape="false"
          append-to-body custom-class="detailMsg">
          <div class="passMsg">{{checkDetailData.messageList[0].drugName}}&emsp;超量时间点: {{checkDetailData.messageList[0].excessBeginTradeDate}}&emsp;用药天数: {{checkDetailData.messageList[0].insuranceDays}}&emsp;提前天数: {{checkDetailData.messageList[0].aheadDays}}</div>
          <el-table :data="tableData" style="width: 100%" :header-cell-style="tableTitleStyle" default-expand-all>
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-form label-position="left" inline class="demo-table-expand">
                  <el-form-item label="">
                    <span>{{ props.row.itemname }}&nbsp;{{props.row.specification }}</span>
                  </el-form-item>
                  <el-form-item label="数量:">
                    <span>{{ props.row.count }}{{ props.row.packaging}}</span>
                  </el-form-item>
                  <el-form-item label="用法信息:">
                    <span>{{ props.row.dosage }}{{ props.row.minpackage}}&emsp;{{ props.row.howtouseDisplayName }}</span>
                  </el-form-item>
                  <el-form-item label="金额:">
                    <span>{{ props.row.fee }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="tradedate" label="交易日期" width="">
            </el-table-column>
            <el-table-column prop="trademiname" label="药品机构" width="" >
            </el-table-column>
            <el-table-column prop="days" label="医保天数" width="">
            </el-table-column>
            <el-table-column prop="endDate" label="结束日期" width="">
            </el-table-column>
            <el-table-column prop="aheadDays" label="提前天数" width="">
            </el-table-column>
            <el-table-column prop="recipeno" label="处方号" width="">
            </el-table-column>
            <el-table-column prop="fee" label="金额" width="">
            </el-table-column>
            <el-table-column prop="feein" label="保内金额" width="">
            </el-table-column>
            <el-table-column prop="feeout" label="保外金额" width="">
            </el-table-column>
          </el-table>
          <span slot="footer" class="dialog-footer">
            <el-button @click="checkDetailData.dialogVisibleDetail = false">返回</el-button>
          </span>
        </el-dialog>
  </div>
</template>

<script>
export default {
props: {
    checkDetailData: {
        type: Object,
        default: () => {
            return {}
        }
    }
},
  data () {
    return {
      tableTitleStyle: {
        background: "#f5f5f5",
        height: "40px",
        padding: '0'
      },
      tableData: []
    }
  },
  components: {},
  computed: {},
  created () {
  },
  mounted () {},
  methods: {
    // 获取详情数据
    getDetail (insuranceCode) {
      let vm = this
      let receivePatientParams = JSON.parse(sessionStorage.getItem('receivePatientParams'))
      vm.$axios.get('/adapter/insurance/listFeeItemInfo', {
        icno: receivePatientParams.insuranceNo,
        insuranceCode: insuranceCode
      }).then(res => {
        if (res.success) {
          vm.tableData = res.data
        } else {
          vm.$message({
            message: res.message,
            type: 'warning',
          })
        }
      })
    }
  }
}

</script>
<style lang='scss' src='./checkDetailTpml.scss'>
</style>