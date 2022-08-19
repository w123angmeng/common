<template>
    <el-date-picker
        clearable
        size="mini"
        v-on="$listeners"
        v-bind="$attrs"
        range-separator="至"
        :start-placeholder="startPlaceholder"
        :end-placeholder="endPlaceholder">
    </el-date-picker>
</template>

<script>
    export default {
        name: "index",
        props: {
            startPlaceholder: {
                type: String,
                default: '开始日期'
            },
            endPlaceholder: {
                type: String,
                default: '结束日期'
            },
        }
    }
</script>

<style scoped>

</style>
