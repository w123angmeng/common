<!--
 * @Author: changxy
 * @Date: 2022-02-09 16:20:55
 * @LastEditors: changxy
 * @LastEditTime: 2022-05-10 09:40:39
 * @Description: 请填写简介
-->
<template>
  <div class="form-search">
        <div class="form-search-tool">
            <span class="form-search-title">查询方案</span>
            <!-- <span class="form-operate-btn el-icon-circle-plus-outline" @click="openDialog('新增查询方案')"></span> -->
            <el-button type="text" @click="openDialog('新增查询方案')"><i class="el-icon-arrow-right el-icon-plus"></i>新增</el-button>

            <!-- <span class="form-operate-btn el-icon-refresh" @click.stop="resetList()"></span> -->
        </div>
        <el-scrollbar style="height:calc(100% - 30px)" v-if="searchList.length > 0">
            <el-menu
                class="form-search-menu"
                ref="menuList" >
                    <el-menu-item
                                v-for="(item,index) in searchList"
                                :index="String(index)"
                                :key="index"
                                @click.native="searchClick(item)">
                        <span slot="title" class="search-content">
                            <span class="search-title">{{item.planName}}</span>
                            <span class="form-operate-tool">
                                <span class="form-operate-btn el-icon-edit-outline" @click.stop="editSearch(item)"></span>
                                <span class="form-operate-btn el-icon-delete" @click.stop="deleteSearch(item)"></span>
                            </span>
                        </span>
                    </el-menu-item>
            </el-menu>
         </el-scrollbar>
        <el-empty description="暂无数据"  :image="images" v-else class="form-empty"></el-empty>
  </div>
</template>

<script>
//弹框组件
import ThrowComponentDiog from '@/components/page/Common_WEB/GlCommon/plugins/throwComponentDiog';
import { listMaterialSelectPlan, selectPlanResult, updateEnabled } from './api';
import closeBtn from '@/components/page/Material_WEB/common/images/closeBtn.svg';
import showBtn from '@/components/page/Material_WEB/common/images/showBtn.svg';
import images from './images/list_empty.svg';
export default {
    props: {
        commonItems:Object,
        pageKey: String,
    },

    data() {
        return {
            //打开弹框
            throwDialog: new ThrowComponentDiog(),
            searchList: [],
            isShowSearchPlan: true,
            images: images
        }
    },
    created() {
       this.getSearchList();
    },
    methods: {
        async getSearchList() {
            let param = {
                transCode: this.pageKey
            };
            let res = await listMaterialSelectPlan({vm: this, data: param});
            if(res.success) {
                this.searchList = res.data;
            }else {
                this.$message.error('查询方案列表错误');
            }
        },
        //打开弹框
        openDialog(title,param) {
            this.throwDialog.throw({
                component: require("./components/searchForm.vue").default,
                // 组件配置
                componentConfig: {
                    sure: async (data, next) => {
                        next && next();
                        this.throwDialog.close();
                        this.getSearchList();
                    },
                    cancel: () => {
                        this.throwDialog.close();
                    },
                    data: {
                        commonItems: this.commonItems,
                        pageKey: this.pageKey,
                        param: param
                    },
                },
                // dialog配置
                dialogConfig: {
                    isRemoveDom: true,
                    isCustomDlalogFooter: true,
                    title: `${title}`,
                    width: "50%",
                    hideOnBlur: true,
                    on: {
                        'opened': (opened) => {
                            console.log(opened)
                        }
                    }
                }
            }).$off().$on('onShow', () => {
                console.log('onShow')
            }).$on('onHide', () => {
                console.log('onHide')
            })
        },
        //编辑查询方案
        editSearch(item) {
            this.openDialog('修改方案', item);
        },
        //删除查询方案
        deleteSearch(item) {
            this.$confirm('确定要删除该方案吗？','提示').then(() => {
                this.delSearch(item.idPlan);
            })

        },
        async delSearch(idPlan) {
            let res = await updateEnabled({vm: this, data: {
                idPlan:idPlan,
            }});
            if(res.success) {
                this.$message.success('删除成功');
                this.getSearchList();
            }else {
                 this.$message.error('删除失败');
            }
        },
        async searchClick(item){
            let res = await selectPlanResult({
                vm: this,
                data: {
                    idPlan: item.idPlan,
                    transCode: this.pageKey,
                }
            });
            if(res.success) {
                //查询列表
                this.$emit('refreshSearchList',res.data);
            }else {
                this.$message.error('查询数据失败');
            }
        },
        resetList() {
            this.$emit('resetList')
        },
        toggleSearchPlan(dom,btn) {
            this.isShowSearchPlan = !this.isShowSearchPlan;
            this.$nextTick(() => {
                if(this.isShowSearchPlan) {
                    dom.style.left = "0";
                    dom.style.width = "190px";
                    btn.src = closeBtn;
                }else {
                    dom.style.width = "0px";
                    dom.style.left = "-100%";
                    btn.src = showBtn;
                }
            })
        },
    }
}
</script>

<style lang="scss" scoped>
.form-search {
    height:100%;
    border-right: 1px solid #e6e6e6;
    position: relative;
    padding-left:12px;
    overflow-x:visible;
}
.search-content{
    display: block;
    display: flex;
    // justify-content: space-between;
    align-items: center;
}
.form-operate-tool {
    // display: none;
    color:#8C8C8C;
}
// .form-search-menu /deep/ .el-menu-item:hover  {
//     .form-operate-tool {
//         display: block;
//     }

// }
.form-search-menu /deep/ .el-menu-item {
    height:44px;
    line-height:44px;
    padding: 0 !important;
     border-right: none;
}

.form-search /deep/ .el-menu {
    border-right: none;
}
.form-operate-btn {
    display: inline-block;
    font-size: 18px;
    cursor: pointer;
}
.form-search-tool{
    display: flex;
    justify-content: left;
    margin-right:10px;
    height:30px;
    align-items: center;
     .form-operate-btn {
         padding-right:5px;
         color: #46a6ff;
     }
     .form-search-title {
         padding-right:10px;
         font-size:18px;
         color:#262626;
     }
}

.search-title{
    max-width: 105px;
    white-space: nowrap;/*设置不换行*/
    overflow: hidden; /*设置隐藏*/
    text-overflow: ellipsis; /*设置隐藏部分为省略号*/
    padding-left: 5px;
    color:#595959;
    padding-right:10px;
}
.form-search-btn{
    position: absolute;
    right:-20px;
    top:50%;
    z-index:999;
}

.form-empty {
    height:calc(100% - 40px);
    display: flex;
    justify-content: center;
    flex-direction: column;
    // align-items: center;

    /deep/ .el-empty__image {
        text-align: center;

        image {
            width: 48px;
        }
    }

    /deep/ .el-empty__description  {
        margin-top: 8px;
        color: #B6C9DB;
        font-size: 14px;
        line-height: 22px;
        text-align: center;
    }
}
.el-icon-arrow-right {
    font-size:14px;
    padding-right:2px;
}
</style>
