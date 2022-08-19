<template>
    <el-dropdown v-if="columnJson.length > 0" trigger="click" @command="command" :hide-on-click="false" max-height="350px">
                                <span class="el-dropdown-link">
                                    <span style="color: #262626; font-size: 14px">操作</span>
                                    <i class="el-icon-setting" style="color: #1890FF"></i>
                                </span>
        <template #dropdown>
            <el-dropdown-menu class="columnJson-dropdown-menu">
                <el-dropdown-item v-for="item in columnJson" :key="item.prop">
                    <el-checkbox v-model="item.setting.visible" :disabled="item.setting.disabled">{{item.label}}</el-checkbox>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>
<script>
    export default {
        props: {
            columnJson: {
                type: Array,
                default: () => []
            }
        },
        methods: {
            command(val) {
                this.$emit('command', val)
            }
        }
    }
</script>
