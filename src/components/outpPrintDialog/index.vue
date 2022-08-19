<template>
  <div>
    <el-dialog
      :title="paramesObj.title"
      :visible.sync="paramesObj.dialogVisible"
      :width="paramesObj.width"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      class="printDialogModelContainer"
      append-to-body
    >
      <div id="printContent" v-html="paramesObj.content"></div>
      <div slot="footer" class="dialog-footer">
        <div class="outpDiagnsBtnLeft">
          <span style="padding: 0px 12px;">纸张大小</span>
          <el-select v-model="paperSize" placeholder>
            <el-option
              v-for="item in paperSizeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <span style="padding: 0px 12px;">布局</span>
          <el-select v-model="flexDirec" placeholder>
            <el-option
              v-for="item in flexList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div class="outpDiagnsBtnRight">
          <el-button @click="cancelHandle">取 消</el-button>
          <el-button type="primary" :loading="ploading" @click="printContent">打 印</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    paramesObj: {
      type: Object,
      default: () => {
        return {
          title: "",
          content: "",
          dialogVisible: false,
          width: "826px"
        };
      }
    }
  },
  data() {
    return {
      ploading: false,
      paperSize: 2, //纸张大小
      flexDirec: 1, //布局方向
      paperSizeList: [
        { label: "A4", value: 1 },
        { label: "A5", value: 2 }
      ], //纸张大小列表
      flexList: [
        { label: "横向", value: 2 },
        { label: "纵向", value: 1 }
      ]
    };
  },
  mounted() {},
  methods: {
    //打印
    printContent() {
      if (!this.paramesObj.content)
        return this.$message.warning("未获取到预约单数据！");
      if (!this.paperSize || !this.flexDirec)
        return this.$message.warning("请选择纸张大小和布局方向！");
      this.$nextTick(async () => {
        let setTimeData = 1;
        this.ploading = true;
        clearInterval(this.setIntervalHand);
        this.setIntervalHand = setInterval(() => {
          if (setTimeData <= 0) {
            this.ploading = false;
            clearInterval(this.setIntervalHand);
          } else {
            setTimeData--;
          }
        }, 1000);
        this.HisLodop({
          print: true,
          preview: false,
          html: this.paramesObj.content,
          size: this.paperSize, //纸张大小
          direction: this.flexDirec //布局方向
        });
      });
    },
    cancelHandle() {
      this.paramesObj.dialogVisible = false;
    }
  }
};
</script>
<style lang="scss" src="./index.scss"></style>
