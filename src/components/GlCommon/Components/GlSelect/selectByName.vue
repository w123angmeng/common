<template>
    <el-select
            v-on="$listeners"
            v-bind="$attrs"
            :clearable="clearable"
            :placeholder="placeholder"
            :loading="loading"
            :remote-method="$attrs.remote ? remoteMethod : null"
            @visible-change="visibleChange"
    >
        <slot></slot>
        <el-option
            :disabled="isItemEnabled && item[itemEnabledKey] == itemEnabledValue"
            v-for="(item, key) in dataset.list"
            :value="item[itemNameKey]"
            :key="itemKey ? item[itemKey] : key"
            :label="item[itemNameKey]"
        >
        </el-option>
    </el-select>
</template>

<script>
    import mixins from './mixins'
    export default {
        name: "index",
        mixins: [mixins],
        data() {
            return {
            }
        }
    }
</script>

<style scoped>

</style>
