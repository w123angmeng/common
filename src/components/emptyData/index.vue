<template>
    <div class="flex flex-col h-center v-center">
        <div class="empty-data__container">
            <img src="@/assets/images/doctws/list_empty.svg" alt="" width="60px">
            <div class="empty-data__text">{{text}}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'emptyData',
    props: {
        text: {
            type: String,
            default: '暂无数据'
        },
    }
}
</script>
<style lang="scss" scope>
.empty-data__container {
    min-width: 60px;
    text-align: center;
}
.empty-data__text {
    margin-top: 8px;
    color: #B6C9DB;
    font-size: 14px;
    line-height: 22px;
}
</style>