<template>
    <el-empty class="gl-empty" :image-size="Number(imageSize)" v-bind="$attrs">
        <template
            v-if="Object.keys($slots).length"
            :slot="it"
            v-for="it in Object.keys($slots)"
        >
            <slot :name="it"></slot>
        </template>
    </el-empty>
</template>

<script>
export default {
    name: "index",
    props: {
        imageSize: {
            type: [Number, String],
            default: 150,
        },
    },
    created() {
        console.log("this.", this);
    },
};
</script>

<style lang="scss">
.gl-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .el-empty__image {
        text-align: center;
        img {
            width: 100%;
        }
    }
    .el-empty__description {
        margin-top: 8px;
        color: #b6c9db;
        font-size: 14px;
        line-height: 22px;
        text-align: center;
    }
}
</style>
