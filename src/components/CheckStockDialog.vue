<template>
    <el-dialog
        title="药品库存提示"
        :visible="drugData.show"
        width="464px"
        custom-class="drugStockWrap"
        :before-close="()=> {$emit('close')}"
        modal-append-to-body
    >
        <span class="tip"
            ><img
                src="@/assets/images/inpDoctor/warningIcon.png"
                alt=""
                srcset=""
            />
            以下药品库存不足，医嘱无法被提交，请确认！</span
        >
        <div class="wrap">
            <div class="item" v-for="(item, ind) in drugData.data" :key="ind">
                {{ ind + 1 }}. {{ item }}
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="$emit('close')"
                >确 定</el-button
            >
        </span>
    </el-dialog>
</template>

<script>
export default {
    props: {
        drugData: {
            type: Object,
            default: () => ({
                show: false,
                data: [],
            }),
        },
    },
    data: function () {
        return {};
    },
    methods: {
        // handleClose() {
        //     before-close
        // }
    }
};
</script>

<style lang="scss">
.drugStockWrap {
    .el-dialog__header {
        // padding: 16px 24px;
        border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
        padding: 16px 24px;
    }
    .tip {
        color: #212121;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
        img {
            width: 24px;
            height: 24px;
            vertical-align: middle;
        }
    }
    .wrap {
        font-size: 14px;
        color: #8c8c8c;
        line-height: 22px;
        padding: 8px 0 0 34px;
    }
}
</style>