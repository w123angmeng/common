<template>
  <div class="error-page">
      <!-- <div class="error-code">4<span>0</span>4</div> -->
      <!-- <div class="error-desc">啊哦~ 你所访问的页面不存在</div> -->
        <img 
        class="login404" 
        src="@/assets/images/welcome/404.png"
        alt="">
      <div class="error-desc">系统功能还在建设中，敬请期待！</div>
      <div class="error-handle">
          <router-link to="/">
            <el-button v-if="isShowBtn" type="primary" size="large" @click="backWecome">返回首页</el-button>
          </router-link>
          <!-- <el-button class="error-btn" type="primary" size="large" @click="goBack">返回上一页</el-button> -->
      </div>
  </div>
</template>

<script>
export default {
    computed: {
        isShowBtn(){
            if(this.$route.query) {
                if(this.$route.query.noshowBtn) return false
            }
            return true
        },
    },
    methods: {
        goBack(){
            this.$router.go(-1);
        },
        //返回首页
        backWecome(){
            this.$nextTick(()=>{
                this.comeRouter({
                    path: "/welcome"
                });
            })
        }
    }
}
</script>


<style scoped>
    .error-page{
        display: flex;
        justify-content: center;
        /* align-items: center; */
        /* flex-direction: column; */
        width: 100%;
        height: 100%;
        background: #fff;
        box-sizing: border-box;
        position: relative;
    }
   .error-page .login404 {
        width: 665px;
        height: 665px;
        margin-top: 5px;
    }
    .error-code{
        line-height: 1;
        font-size: 250px;
        font-weight: bolder;
        color: #2d8cf0;
    }
    .error-code span{
        color: #00a854;
    }
    .error-desc{
        position: absolute;
        top: 503px;
        font-family: PingFang SC;
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        color: #0E5699;
    }
    .error-handle{
        position: absolute;
        top: 553px;
        /* margin-top: 30px;
        padding-bottom: 200px; */
    }
    .error-btn{
        margin-left: 100px;
    }
</style>
