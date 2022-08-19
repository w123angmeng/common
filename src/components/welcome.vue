<template>
  <div class="welcome">
    <div class="welcome_content">
        <el-container class="el-container">
            <el-aside class="aside_left">
                <div class="orgName">
                    <div class="orgNameTitle">{{`欢迎来到${$t('config.hospitalName')}`}}</div>
                    <div class="desc">{{`${desc}`}}</div>
                </div>
                <div class="welcome_left">
                    <img src="../../../assets/images/header/wecome_left_1.png" alt="">
                </div>
            </el-aside>
            <el-main>
                <div class="listMenu">
                    <div class="list" v-for="(item,index) in dataList" :key="index" @click="goRouteModule(item)">
                        <div class="listImg">
                            <img v-if="item.systemIcon" :src="require(`../../../assets/images/welcome/${item.systemIcon}.svg`)" class="setImg" alt="">
                            <img v-else :src="require(`../../../assets/images/welcome/basic_maintenance.svg`)" class="setImg" alt="">
                        </div>
                        <div class="listTitle">{{item.label}}</div>
                    </div>
                </div>
                <div class="decorate1">
                    <img :src="require('../../../assets/images/header/wecome_list_left.png')" alt="">
                </div>
                <div class="decorate2">
                    <img :src="require('../../../assets/images/header/wecome_decorate1.png')" alt="">
                </div>
                <div class="decorate3">
                    <img :src="require('../../../assets/images/header/wecome_decorate2.png')" alt="">
                </div>
                <div class="decorate4"></div>
            </el-main>
        </el-container>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations} from 'vuex';
import { mixinSSO } from '@/components/common/sso.js'

export default {
  data () {
    return {
        dataList:[],
        title:window.globalUrl.systemTitle,
        desc:'请选择您即将操作的系统'
    }
  },
  mixins: [mixinSSO],
  components: {},
  computed: {
      ...mapGetters(['routerPath'])
  },
  created () {
      let modulesList = JSON.parse(sessionStorage.getItem('moduleList'));
      this.dataList = modulesList;
  },
  mounted () {
  },
  methods: {
      ...mapMutations(["SET_CHANGECOLORINDEX", "SET_CHANGECOLORID"]),
      //跳转当前模块
      async goRouteModule(item){
        //   console.log('当前点击模块：',item);
        const roleList = JSON.parse(sessionStorage.getItem('roleList')) || [];
        let obj = {
                idSystem:item.value,//模块ID
                idRoles: roleList.map(v=>v.idRole).join(',') //角色ID
            }
          //查询当前模块路由资源
          sessionStorage.setItem("menuLabel", JSON.stringify(item));
          await this.listCommomPage(obj);
          await this.getSecondMenuList(obj); //查当前系统下二级菜单列表
          //单点登录 第三方系统
          if(item.otherSystemSign == this.CONSTANT.IS_OTHER_SYSTEM_SIGN) {
              this.goOtherSystemSignSSO(item)
              return
          }
          this.comeRouter({path:`/${item.resourceUrl}`});
      },
      //查当前模块下常用页面列表
    async listCommomPage(obj){
        let res = await this.getRouteModuleList(obj);
        if(res.success){
            sessionStorage.setItem('smallIconList',JSON.stringify(res.data));
        }else{
            this.$message({
                type:'error',
                message:res.message
            })
        }
    },
    
        //查当前系统下二级菜单列表
        async getSecondMenuList(obj){
            let data = [];
            const [err, res] = await this.awaitWrap(this.$axios.get("/upm/listResBySystemWithId", {
                selCondition: '',
                idSystem: obj.idSystem,
                idRoles: obj.idRoles
            }));
            if(res && res.success){
                data = res.data || [];
            }else if(res && !res.success){
                this.$message.warning(res.message);
            }
            // 把二级菜单存在缓存里，路由守卫的时候会用对应的id来查按钮权限
            sessionStorage.setItem("secondMenuList", JSON.stringify(data));
        },
  }
}

</script>
<style lang="scss">
    .welcome {
        height: 100%;
        .welcome_content{
            width: 100%;
            height: 100%;
            .el-container{
                height: 100%;
                .el-aside{
                    position: relative;
                    @media (min-width: 1366px) and (max-width: 1919px) {
                        width:400px !important;
                            .orgNameTitle{
                                font-size: 30px;
                            }
                            .desc{
                                margin-top: 8px;
                                font-size: 18px;
                            }
                    }
                    @media (min-width: 1920px) {
                        width:570px !important;
                            .orgNameTitle{
                                font-size: 40px;
                            }
                            .desc{
                                margin-top: 8px;
                                font-size: 28px;
                            }
                    }
                    .orgName{
                        position: absolute;
                        top:95px;
                        left: 15px;
                        
                    }
                    
                    .welcome_left{
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        // margin:100px auto ;
                        img{
                            width:372px;
                            height:263px;
                        }
                    }
                }
                
            }

            
        }
        // .content_left{
        //     background:rgba(255, 255, 255, 1); 
        // }
        
        
        .el-main{
            position: relative;
            background: rgba(233, 235, 238, 1);
        }
        .decorate1{
            position: absolute;
            top:15%;
            left: 10%;
        }
        .decorate2{
            position: absolute;
            top:8%;
            right: 12%;
        }
        .decorate3{
            position: absolute;
            top:20%;
            right: 8%;
            transform:rotate(10deg);
            -ms-transform:rotate(10deg); 	/* IE 9 */
            -moz-transform:rotate(10deg); 	/* Firefox */
            -webkit-transform:rotate(10deg); /* Safari 和 Chrome */
            -o-transform:rotate(10deg); 	/* Opera */
        }
        .decorate4{
            position: absolute;
            bottom: 25px;
            right: 45px;
            width: 78px;
            height: 78px;
            background: rgba(0, 120, 255, 0.27);
            border-radius: 50%;
        }
        .el-main{
            padding:0;
        }
        @media (min-width: 0px) and (max-width: 1919px) {
            .listMenu{
                width: 680px;
                margin: 50px 150px;

            }
            .list{
                width: 120px;
                height:140px;
                margin-right: 16px;
                margin-bottom: 14px;
                display: inline-block;
                background: #005CAB;
                border-radius: 4px;
                cursor: pointer;
            }
            .list:nth-child(5n){
                margin-right: 0px;
            }
            .listImg{
                width: 52px;
                height:52px;
                text-align: center;
                margin: 25px auto 20px;
            }
            .listTitle{
                text-align: center;
                font-size: 14px;
                color:#fff;
            }
        }
        @media (min-width: 1920px) {
            .listMenu{
                width: 1048px;
                margin: 150px 130px;
            }
            .list{
                margin-right: 16px;
                margin-bottom: 14px;
                display: inline-block;
                background: #005CAB;
                border-radius: 16px;
                cursor: pointer;
            }
            .list:nth-child(5n){
                margin-right: 0px;
            }
            .listImg{
                width: 196px;
                padding-top: 50px;
                padding-bottom: 35px;
                text-align: center;
                .setImg{
                    width:66px; 
                    height:66px;
                }
            }
            .listTitle{
                width: 196px;
                height: 84px;
                text-align: center;
                font-size: 22px;
                color:#fff;
            }
        }
        
    }
    

</style>