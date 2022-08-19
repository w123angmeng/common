<template>
    <el-card v-bind="$attrs" class="gl-card">
        <div v-if="title" class="title">
            {{title}}
        </div>
        <div class="content">
            <slot></slot>
        </div>
    </el-card>
</template>

<script>
    export default {
        name: "index",
        props: {
            title: String,
            default: ''
        },
        created() {
            console.log('card,', this)
        }
    }
</script>

<style lang="scss">
    .gl-card {
        margin-bottom: 5px;
        .title{
            height: 40px;
            line-height: 40px;
            padding: 0 24px;
            background-color: #FAFAFA;
            color: #262626;
            font-weight: bolder;
            font-size: 14px;
        }
        .el-card__body{
            padding: 0px;
        }
        .content{
            /*padding: 12px 24px 0;*/
            background-color: #fff;
            border-left: none;
        }
    }
</style>
