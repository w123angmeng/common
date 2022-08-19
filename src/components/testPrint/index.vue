<template>
  <div class="print-page">
      打印地址:  <el-input v-model="printUrl"></el-input>
      <div>
          <p>https://10.102.11.31/inp/20220704115123799_021401_treatList.pdf</p>
          <p>https://10.102.11.54/inp/aa1.pdf</p>
          <p>https://10.102.11.54/inp/2022070511571092_10000000000025933818_treatList.pdf</p>
          <p>https://10.102.11.54/inp/2022070511571092_100000000000259338181_treatList.pdf</p>
         
          
         
      </div>
      <div class="pthd">
          <!-- <el-button @click="lodopPrint">lodop打印</el-button>
          <el-button @click="webPrint">web打印</el-button> -->
      </div>
    
       
       
      
  </div>
</template>

<script>
// import { mixinWebPrint } from "@/components/page/Common_WEB/mixins/mixinWebPrint.js";

export default {
    // mixins: [mixinWebPrint],
    data(){
        return {
            printUrl: 'https://10.102.11.54/inp/aa1.pdf',
        }
    },
    computed: {
       
    },
    methods: {

        // lodopPrint() {
        //     this.PDFHisLodop({
        //         pdfurl: this.printUrl,
        //         isPreview: false
        //     })
        // },

        // async webPrint() {
        //       //校验服务
        //     let servers = await this.validateWebPrintRules('治疗单');
        //     if(!servers) return 
        //     var obj = {
        //         FileFormat: 'pdfUrl',  //默认 pdfUrl
        //         FileStream: this.printUrl,  //默认 pdf地址
        //     } 
        //     this.PDFNewPrint(obj);
        // },
       
    }
}
</script>
<style scoped>
.print-page {
    background: #fff;
    min-height: 96%;
    padding: 30px;
   
}

.pthd {
     margin-top: 30px;
        
}
   
</style>
