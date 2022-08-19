<template>
    <el-tabs class="gl-tabs" v-bind="$attrs" v-on="$listeners">
        <el-tab-pane v-for="(item, index) in tabsList" :key="index" :label="item.label" :name="item.name">
            <template v-if="$slots" v-for="it in Object.keys($slots)">
                <slot  v-if="it == item.name"  :name="item.name"></slot>
            </template>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
    export default {
        name: "gl-tabs",
        props: {
            tabsList: {
                type: Array,
                default: () => []
            }
        }
    }
</script>

<style lang="scss">
    .radio-group.el-tabs--card > .el-tabs__header .el-tabs__item.is-active{
            background: #1890ff;
            color: #fff;
        }
    .radio-group.el-tabs--card > .el-tabs__header{
            border: none;
        }
    .radio-group.el-tabs--card > .el-tabs__header .el-tabs__nav{
            border-bottom: 1px solid #E4E7ED;
        }
    .radio-group.el-tabs--card>.el-tabs__header .el-tabs__item {
            border-bottom: none;
            height: 32px;
            line-height: 32px;
    }
</style>
