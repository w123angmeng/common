<template>
  <div>
    <el-dialog
      :title="paramesObj.title"
      :visible.sync="paramesObj.dialogVisible"
      width="850px"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      class="printDialogModelContainer"
      append-to-body
    >
      <div class="iframeContainer">
         <!-- v-if='isAtmeng' -->
        <template>
           <template v-if="paramesObj.content && paramesObj.content.data.length">
             <div v-for="(pdfs, pdfIndx) in paramesObj.content.data" :key="pdfIndx">
                  <pdfViewer :src="pdfs"></pdfViewer>
            </div>
           </template>
           
        </template>
        <!-- <div id="printContent" v-html="paramesObj.content" v-else></div> -->
      </div>
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
import pdfViewer from "@/components/page/Common_WEB/pdfView/pdfView.vue";
import { mapMutations, mapGetters } from "vuex";
import { mixinWebPrint } from "@/components/page/Common_WEB/mixins/mixinWebPrint.js";
export default {
  mixins: [mixinWebPrint],
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
    },
    isFromHisInpDoctor: {
      type: Boolean,
      default: ()=> {
        return false
      }
    }
  },
  components:{
    pdfViewer
  },
  data() {
    return {
      ploading: false,
      isPrintStatus: true,
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
  computed:{
    ...mapGetters(["getPrintNameMessage"]),
    isAtmeng(){
      return this.$limits.isFun(this)
    },
  },
  mounted() {
    console.log(this.paramesObj.content);
  },
  methods: {
    //打印
    printContent() {
      // if (!this.isAtmeng && !this.paramesObj.content) return this.$message.warning("未获取到预约单数据！");
      if (this.isAtmeng && !this.paramesObj.content.data) return this.$message.warning("未获取到预约单数据！");
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
        
        if(this.isFromHisInpDoctor) {
          //校验服务
          let servers = await this.validateWebPrintRules('住院-诊间预约');
          if(!servers) return
        }
        //住院医生站 web打印
        if(this.isFromHisInpDoctor && this.isNewWebPrint) {

          this.paramesObj.content.data.map( (v,i) => {
             setTimeout(()=> {
               if(this.getPrintNameMessage && !!i) return
                var obj = {
                  FileFormat: 'pdfUrl',  //默认 pdfUrl
                  FileStream: v,  //默认 pdf地址
                } 
                this.PDFNewPrint(obj);
             }, i* 2000)
          })
          return
        }
   
        this.paramesObj.content.data.map(v => {
            this.PDFHisLodop({
              pdfurl: v,
              size: this.paperSize, //纸张大小
              direction: this.flexDirec //布局方向
          })
        })
      });
    },
    cancelHandle() {
      this.paramesObj.dialogVisible = false;
    }
  }
};
</script>
<style scoped lang="scss" src="./index.scss"></style>
