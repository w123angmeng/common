<template>
  <div class="printPage">
    <!-- 切换板 -->
    <el-tabs v-model="activeTab">
      <!-- 病案首页正面 -->
      <el-tab-pane label="正面" name="1">
        <div class="homeBrowseTab" :style="{height: pageHeight}">
          <Front ref="frontModel"></Front>
        </div>
      </el-tab-pane>
      <!-- 病案首页反面 -->
      <el-tab-pane label="反面" name="2">
        <div class="homeBrowseTab" :style="{height: pageHeight}">
          <Back ref="backModel"></Back>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import Front from "./printFront"; // 病案首页
import Back from "./printBack"; // 病案首页
export default {
  components: {
    Front,
    Back
  },
  props: ["pageHeight"],
  data() {
    return {
      activeTab: "1",
      idFrontSheet: null
    };
  },
  created(){
    this.$root.Bus.$on('printIdFrontSheet', data => {
        if (data) {
          this.idFrontSheet = data
        }
    })
  },
  computed: {
      isAtmeng() {
          return this.$limits.isFun(this)
      }
  },
  methods: {
      onPrint() {
          if(this.isAtmeng){
            let obj = {
              '1': '/print/frontSheet/printFront',
              '2': '/print/frontSheet/printFrontBack'
            }
            return this.printInfo(obj[this.activeTab]);
          }
          this.handlePrint();
      },
      handlePrint(){
          let frontTree = this.$refs.frontModel.getPrintParams();
          let backTree = this.$refs.backModel.getBackParams();
          let css = frontTree.css + backTree.css;
          let dom = frontTree.dom + backTree.dom;
          let tree =
            '<!DOCTYPE html><head><meta charset="utf-8"/><style>' +
            css +
            "</style></head><body>" +
            dom +
            "</body></html>";
          this.HisLodop({
            print: true,
            preview: true,
            html: tree
          });
      },
      printInfo(url){
          let thiz = this;
          let obj = {idFrontSheet: this.idFrontSheet};
          this.$axios.post(url, obj).then(res => {
              if (res.success && res.data) {
                thiz.PDFHisLodop({
                    pdfurl: res.data[0]
                })
              } else {
                  this.$message.warning(res.message)
              }
          })
      }
  },
  
};
</script>
<style scoped lang='scss'>
.printPage {
  width: 100%;
  .homeBrowseTab {
    overflow-y: scroll;
  }
}
</style>