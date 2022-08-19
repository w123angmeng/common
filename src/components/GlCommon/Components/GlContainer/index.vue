<!--
 * @Author: changxy
 * @Date: 2022-01-07 11:10:33
 * @LastEditors: changxy
 * @LastEditTime: 2022-02-14 11:58:20
 * @Description: 请填写简介
-->
<template>
    <div class="gl-container">
        <div v-if="$slots.header" class="gl-container__header" ref="header">
            <slot name="header"/>
        </div>
        <div v-if="$slots.search" class="gl-container__search" ref="search">
            <slot name="search"/>
        </div>
        <div v-if="$slots.action" class="gl-container__action" ref="action">
            <slot name="action"/>
        </div>
        <div class="gl-container__body" ref="ContentMainRefDom">
            <slot/>
        </div>
        <div v-if="$slots.footer" class="gl-container__footer" ref="footer">
            <slot name="footer"/>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'gl-container-full',
        props: {
            isFill: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {

            }
        },
        methods: {
            // 动态计算table高度
            setTableHeight() {
                this.$nextTick(() => {
                    let height = document.documentElement.clientHeight - (this.$refs['ContentMainRefDom'] && this.$refs['ContentMainRefDom'].getBoundingClientRect && this.$refs['ContentMainRefDom'].getBoundingClientRect().top || 150);
                    this.$emit("height", height)
                })
            }
        },
        mounted() {
            if (this.isFill) {
                this.setTableHeight();
                window.addEventListener("resize", this.setTableHeight)
            }
        },
    }
</script>
<style lang="scss" scoped>
    @import "index";
</style>
