<template>
    <div class="drawer-box">
        <div class="drawer-box__tab" v-if="$slots.tabs">
           <slot name="tabs"></slot>
        </div>
        <div class="drawer-box__content">
            <slot></slot>
        </div>
        <div class="drawer-box__btns" v-if="$slots.btns">
            <slot name="btns"></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "index.vue"
    }
</script>

<style lang="scss">
    .drawer-box{
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        &__tab{
            overflow: auto;
        }
        &__content{
            flex-grow: 1;
            background: #fff;
            overflow: auto;
        }
        &__btns {
            height: 56px;
            line-height: 56px;
            padding: 0 24px;
            background-color: #fff;
            text-align: right;
            box-shadow: rgba(150, 150, 150, 0.3) 0px -5px 10px -5px;
        }
    }
</style>
