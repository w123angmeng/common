<template>
<!--    <el-drawer

        :visible.sync="visible"
        direction="ltr"
        :size="1231"
        custom-class="gl-drawer"
        :destroy-on-close="true"
        :append-to-body="true"
        :close-on-press-escape="false"
        :wrapperClosable="false"
        :show-close="false"
        v-bind="$attrs"
        v-on="$listeners"
      >
        <slot></slot>
    </el-drawer>-->
    <el-drawer
        :visible.sync="visible"
        :title="title"
        :withHeader="withHeader"
        :direction="direction"
        :size="size"
        custom-class="gl-drawer"
        :destroy-on-close="true"
        :append-to-body="true"
        :close-on-press-escape="false"
        :wrapperClosable="false"
        :show-close="showClose"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <slot></slot>
    </el-drawer>
</template>

<script>
    export default {
        name: "index",
        props: {
            tableConfig: {
                type: Object,
                default: () => { return {} }
            },
            showClose:{
                type: Boolean,
                default: () => false
            },
            size:{
                type: Number,
                default: () => 1231
            },
            direction:{
                type: String,
                default: () => 'ltr'
            },
            title:{
                type: String,
                default: () => ''
            },
            withHeader:{
                type: Boolean,
                default: () => false
            },
        },
        data() {
            return {
                visible: true
            }
        },
    }
</script>

<style lang="scss">
    .gl-drawer {
        max-width: 1231px; //兼容1366px的屏幕
       .el-drawer__header {
            padding: 24px 24px 0 24px;
            margin: 0;
            color: #595959;
       }
    .el-drawer__body {
        background-color: #F0F2F5;
        display: inherit;
        flex: inherit;
        width: 100%;
        height: 100%;
    }
 }

</style>
