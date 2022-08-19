<template>
    <el-form class="gl-form" size="mini" v-bind="$attrs" ref="elForm">
        <slot></slot>
    </el-form>
</template>

<script>
    export default {
        name: "index",
        methods: {
            validateFn() {
                this.$refs['elForm'].validate((valid) => {
                    if (valid) {
                        this.$emit('validateFn')
                    } else {
                        this.$emit('failFn')
                    }
                })
            },
            resetFields() {
                this.$refs['elForm'].resetFields()
            }
        }
    }
</script>

<style lang="scss">
    /*通用样式*/
    .gl-form{
        .el-input__inner{
            /*width: 228px;*/
        }
    }
</style>
