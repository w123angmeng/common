<template>
    <div class='orderComTmpl'>
        <div class="orderContentTmpl">
            <slot name="orderContentTmpl"></slot>
        </div>
        <div class="outpGroupBtn">
            <el-button v-show="outpOtherTpml" plain class='cancelOutpDocAdvice'  @click="goBackOutpDocAdvice">
                返回
            </el-button>
            <el-button plain class='cancelOutpDocAdvice' @click="cancelOutpDocAdvice">
                关闭
            </el-button>
            <el-button v-show="!outpOtherTpml" plain class='cancelOutpDocAdvice' @click="resetOutpDocAdvice">
                清空
            </el-button>
            <el-button type="primary" :loading="saveloading" @click="saveDocAdvice">
                确定
            </el-button>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";
    import {
        mapMutations
    } from 'vuex';
    export default {
        name: '',
        props: ["outpOtherTpml"],
        data() {
            return {
                saveloading: false,
            };
        },
        created() {

        },
        mounted() {},
        components: {

        },
        computed: {},
        methods: {
            ...mapMutations(['SET_DOCADSTATE', 'SET_DOCGOBACKSTATE']),
            // 关闭弹窗
            cancelOutpDocAdvice() {
                this.SET_DOCADSTATE(false);
            },
            //保存
            saveDocAdvice() {
                this.$emit('saveDocAdvice');
            },
            //返回
            goBackOutpDocAdvice() {
                this.SET_DOCGOBACKSTATE(true);
            },

            //清空
            resetOutpDocAdvice() {
                this.$emit('resetOutpDocAdvice');
            },

            clearHandle() {
                let setTimeData = this.API.api.setTime;
                this.setIntervalHand = setInterval(() => {
                    if (setTimeData <= 0) {
                        this.saveloading = false;
                        clearInterval(this.setIntervalHand)
                    } else {
                        setTimeData--;
                    }
                }, 1000)
            }
        },

        watch: {
            saveloading: {
                handler(val) {
                    if (val === true) {
                        this.clearHandle();
                    } else {
                        clearInterval(this.setIntervalHand)
                    }
                },
            }
        }

    };

</script>

<style lang="scss">
    .orderComTmpl {
        /* position: relative; */
        height: 75%;
    }

    .orderComTmpl .orderContentTmpl {
        /* height: 200px; */
        /* height:265px; */
        margin: 0 10px 0 16px;
        overflow: hidden;
        overflow-y: auto;
        /*火狐下隐藏滚动条*/
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    /*滚动条样式*/
    .orderComTmpl .orderContentTmpl::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    .orderComTmpl .orderContentTmpl::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background: rgba(80, 79, 79, 0.2);
    }

    .orderComTmpl .el-button {
        width: 65px;
        height: 25px;
        padding: 3px 5px;
    }

    .orderComTmpl .outpGroupBtn {
        position: fixed;
        right: 15px;
        bottom: 15px;
    }

    .orderComTmpl .cancelOutpDocAdvice {
        border: 1px solid #1890ff;
        color: #1890ff;
    }

</style>
