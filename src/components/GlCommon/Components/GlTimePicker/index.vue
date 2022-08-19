<template>
    <el-time-picker
        clearable
        size="mini"
        v-on="$listeners"
        v-bind="$attrs"
        range-separator="至"
        :start-placeholder="startPlaceholder"
        :end-placeholder="endPlaceholder">
    </el-time-picker>
</template>

<script>
    export default {
        name: "index",
        props: {
            startPlaceholder: {
                type: String,
                default: '开始时间'
            },
            endPlaceholder: {
                type: String,
                default: '结束时间'
            },
        }
    }
</script>

<style scoped>

</style>
