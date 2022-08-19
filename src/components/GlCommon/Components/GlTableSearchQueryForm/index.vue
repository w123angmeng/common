<template>
    <div class="gl-table-search-queryForm" ref="formPanel">
        <div class="gl-table-search-queryForm__btn" v-if="$slots.btn">
            <slot name="btn"></slot>
        </div>
        <div class="gl-table-search-queryForm__form" v-else ref="queryFormEle">
            <el-form
                v-bind="$attrs"
                ref="form"
                :class="[packUpswitch ? 'down' : 'up']"
            >
                <slot />
                <el-form-item v-if="isShowBtn">
                    <el-button size="mini" type="primary" @click="queryBtn"
                        >查询</el-button
                    >
                </el-form-item>
                <el-form-item v-if="isShowBtn">
                    <el-button
                        :disabled="isAddDisable"
                        size="mini"
                        type="primary"
                        @click="addBtn"
                        v-permission="['add']"
                        >新增</el-button
                    >
                </el-form-item>
                <div
                    v-if="isPackUpSwitch"
                    class="icon"
                    @click="
                        ($event) => {
                            packUpswitchFn($event);
                        }
                    "
                >
                    <span>{{ packUpswitch ? "收起" : "展开" }}</span>
                    <i v-if="!packUpswitch" class="el-icon-arrow-down"></i>
                    <i v-if="packUpswitch" class="el-icon-arrow-up"></i>
                </div>
            </el-form>
        </div>
        <!-- <div class="put_away_handle" v-if="!packUpswitch">
            <el-form-item v-if="isShowBtn">
                <el-button size="mini" type="primary" @click="queryBtn">查询</el-button>
            </el-form-item>
            <el-form-item v-if="isShowBtn">
                <el-button :disabled="isAddDisable"  size="mini" type="primary" @click="addBtn" v-permission="['add']">新增</el-button>
            </el-form-item>
            <div v-if="isPackUpSwitch" class="icon" @click="packUpswitchFn">
                <span>{{packUpswitch ? '收起' : '展开'}}</span>
                <i v-if="!packUpswitch" class="el-icon-arrow-down"></i>
                <i v-if="packUpswitch" class="el-icon-arrow-up"></i>
            </div>
        </div> -->
    </div>
</template>

<script>
import permission from "@/components/page/Common_WEB/GlCommon/directives/permission";
export default {
    name: "index",
    directives: {
        permission,
    },
    props: {
        isShowBtn: {
            type: Boolean,
            default: true,
        },
        // 按钮是否禁用
        isAddDisable: {
            type: Boolean,
            default: false,
        },
        // 是否显示收起展开图标
        isPackUpSwitch: {
            type: Boolean,
            default: false,
        },
        // 默认展开
        isDownUp: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            packUpswitch: true, // 收起切换
        };
    },
    watch: {
        isDownUp: {
            handler: function(val) {
                this.packUpswitch = val;
                this.reLayout(this.packUpswitch);
            },
            immediate: true,
        },
    },
    methods: {
        // 收起的时候重新对 搜索按钮 展开按钮进行布局
        reLayout(flag) {
            setTimeout(() => {
                // 容器
                // const formPanel = this.$refs.formPanel
                // 获取表单元素
                const formContainerEle = this.$refs.queryFormEle;
                const formEle = this.$refs.form.$el;
                // 收起
                if (!flag) {
                    if (formContainerEle) {
                        // 获取表单内的button 和 收起展开按钮 进行 布局
                        const documentFragment = document.createDocumentFragment();
                        const domPen = document.createElement("div");
                        domPen.setAttribute("class", "dom_pen");
                        let needLayoutDoms = [
                            ...Array.from(
                                formContainerEle.querySelectorAll(".el-button")
                            ),
                            ...Array.from(
                                formContainerEle.querySelectorAll(".icon")
                            ),
                        ];
                        needLayoutDoms.forEach((dom) => {
                            domPen.appendChild(dom);
                        });
                        documentFragment.appendChild(domPen);
                        formContainerEle.appendChild(domPen);
                        console.log(needLayoutDoms);
                        // 收起后 删除form下 dom操作后为空 el-form-item el-form-item--mini元素
                        const elFormItemContentElements = [...Array.from(formEle.querySelectorAll('.el-form-item__content'))]
                        elFormItemContentElements.forEach(item => {
                            // const filterChildNodeType =
                            let noChildNodes = !item.childNodes || item.childNodes.length === 0  || Array.from(item.childNodes).filter(node => node.nodeType == 1 || node.nodeType == 3 ).length === 0
                            if(noChildNodes){
                                item.parentNode.remove()
                            }
                        })
                    }
                } else {
                    // 展开
                    const hasDomPen = formContainerEle.querySelectorAll(
                        ".dom_pen"
                    ).length;
                    if (hasDomPen) {
                        const domPens = [
                            ...Array.from(
                                formContainerEle.querySelectorAll(".dom_pen")
                            ),
                        ];
                        domPens.forEach((domPen) => {
                            const domPenChildNodes =  [...Array.from(domPen.childNodes)]
                            const domPenChildNodesLength = domPenChildNodes.length
                            if (domPenChildNodesLength) {
                                for (
                                    let i = 0;
                                    i < domPenChildNodesLength;
                                    i++
                                ) {
                                    if(domPenChildNodes[i] && domPenChildNodes[i].className.includes('icon')){
                                        domPenChildNodes[i].style.marginLeft = '10px'
                                        formEle.appendChild(domPenChildNodes[i])
                                    }else{
                                        domPenChildNodes[i] && formEle.appendChild(domPenChildNodes[i]);
                                    }

                                }
                            }
                            domPen.remove();
                        });
                    }
                }
            }, 20);
        },
        // 收起切换
        packUpswitchFn() {
            this.packUpswitch = !this.packUpswitch;
            this.reLayout(this.packUpswitch);
        },
        // 查询事件回传
        queryBtn() {
            this.$emit("queryBtn");
        },
        // 新增事件回传
        addBtn() {
            this.$emit("addBtn");
        },
        // 初始化表单，并移除效果
        resetFields() {
            this.$refs["form"].resetFields();
            this.$emit("resetFields");
        },
        // 表单验证
        validateFn() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    this.$emit("validateFn");
                } else {
                    this.$emit("failFn");
                }
            });
        },
    },
};
</script>

<style lang="scss">
@import "index";
</style>
