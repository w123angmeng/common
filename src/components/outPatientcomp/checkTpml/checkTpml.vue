<template>
  <div class="checkTpml">
    <el-dialog title="共享医嘱提示" :visible.sync="checkData.dialogVisible" width="70%" :close-on-press-escape="false" :close-on-click-modal='false' append-to-body custom-class="errorMsg" :before-close='closeModal'>
        <div v-for='(item, index) in checkData.messageList' class="messageList" :class="[index==checkData.messageList.length -1 ? 'noBorder' : '']" :key="index">
            {{ item.msg }}
            <span class="detailInfo" v-if='checkData.showDetail' @click='viewExcessHandle(item)'>详情信息</span>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button :loading = "submitLoading" v-show='checkData.submitStatus' type="primary" @click="gotoNext">确定</el-button>
            <!-- 医保拒付的是按钮 -->
            <el-button :loading = "submitLoading" v-show='checkData.insuranceFlag' type="primary" @click="gotoNext">是</el-button>
            <el-button :loading = "submitLoading" v-show='checkData.isFreeStatus' type="primary" @click="next">继续【自费】开立</el-button>
            <!-- 转即刻的是按钮 -->
            <el-button :loading = "submitLoading" v-show='checkData.toImmediately' type="primary" @click="goImmediately">是</el-button>
            <el-button :loading = "noImmediatelyLoading" v-show='checkData.noImmediately' type="primary" @click="noImmediately">否</el-button>
            <el-button @click="closeModal">关闭</el-button>
        </span>
    </el-dialog>
    <CheckDetailTpml ref='checkDetailTpml' :checkDetailData='checkDetailData'></CheckDetailTpml>
  </div>
</template>

<script>
import CheckDetailTpml from '../checkDetailTpml/checkDetailTpml.vue' // 医保校验查看详情弹窗
export default {
    props: {
        checkData: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },
  data () {
    return {
        submitLoading:false,
        noImmediatelyLoading: false,
        checkDetailData: {
            dialogVisibleDetail: false,
            messageList: [
                {
                    drugName: '',
                    excessBeginTradeDate: '',
                    insuranceDays: '',
                    aheadDays: ''
                }
            ]
        }
    }
  },
  components: {
      CheckDetailTpml // 医保校验查看详情弹窗

  },
  computed: {},
  created () {},
  mounted () {},
  methods: {
      // 关闭弹窗
      closeModal () {
          this.checkData.dialogVisible = false
          this.$emit('changePassFlag', 0)
      },
      gotoNext() {
        this.submitLoading = true
        this.$emit('checkHistory')
      },
      next () {
          this.submitLoading = true
          this.$emit('checkHistory','isInsuranceToSelf')
      },
      // 转即刻
      goImmediately() {
          this.submitLoading = true
          this.$emit('checkHistory','isImmediately')
      },
      // 不转即刻
      noImmediately() {
          this.noImmediatelyLoading = true
          this.$emit('noImmediately')
      },
      // 查看详情
      viewExcessHandle (row) {
          let arr = []
          arr.push(row)
          this.checkDetailData = {
            dialogVisibleDetail: true,
            messageList: arr
          }
          this.$refs.checkDetailTpml.getDetail(row.insuranceCode)
      }
  }
}

</script>
<style lang='scss' src='./checkTpml.scss'>
</style>