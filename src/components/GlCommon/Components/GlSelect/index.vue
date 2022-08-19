<template>
    <component ref="sel" v-on="$listeners" v-bind="$attrs" :is="types[modelType]">
        <slot></slot>
    </component>
</template>

<script>
    import selectById from './selectById'
    import selectByName from './selectByName'
    import selectByTable from './selectByTable'
    import selectByTablePage from './selectByTablePage'
    export default {
        components: {
            selectById,
            selectByName,
            selectByTable,
            selectByTablePage,
        },
        inheritAttrs: false,
        props: {
            // 决定model的值
            modelType: {
                type: String,
                default: "id"
            },
            // 是否调用接口获取option数据
            autoGetApiData: {
                type: Boolean,
                default: false
            }
        },
        name: "index",
        data() {
            return {
                types: {
                    id: 'selectById',
                    name: 'selectByName',
                    table: 'selectByTable',
                    tablePage: 'selectByTablePage'
                }
            }
        },
        created() {
        },
        mounted() {
            this.autoGetApiData && this.$refs['sel'].emitGetApiData()
        },
        methods: {
            emitGetApiData() {
                this.$refs['sel'].emitGetApiData()
            }
        }
    }
</script>

<style scoped>

</style>
