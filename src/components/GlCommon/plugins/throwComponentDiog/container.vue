<!--  -->
<template>
    <el-dialog
        v-bind="dialogConfig"
        v-on="$listeners"
        @open="open"
        @opened="opened"
        @close="close"
        @closed="closed"
        :visible.sync="visible"
        :before-close="beforeClose">
        <div class="container">
            <slot></slot>
        </div>
        <span slot="footer" class="dialog-footer" v-if="!dialogConfig.isCustomDlalogFooter">
            <el-button size="mini" @click="cancel">取 消</el-button>
            <el-button size="mini" type="primary" @click="sure">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>

export default {
  props: {
    // model 值
    visible: {
      type: Boolean,
      default: false
    },
    // dialog 配置
    dialogConfig: {
      type: Object,
      default () {
          return {
              // 是否自定义dialogFooter
              isCustomDlalogFooter: false,
          }
      }
    }
  },
  data() {
      return {
          // 鉴定是否是第一次显示
          key: true
      }
  },
  watch: {
    visible (val) {
        if (val) {
            // 配发给子组件用
            this.$emit("onShow");
        }
        if (val && this.key) {
            this.key = false;
            // 配发给子组件用
            this.$emit("once-visible", val);
        }
    }
  },
  //方法集合
  methods: {
    // 取消
    cancel() {
        this.visible = false
        // 配发给子组件用
        this.$emit("onCancel");
    },
    // 确定按钮
    sure() {
        // this.visible = false
        // 配发给子组件用
        if (this.dialogConfig.isCustomDlalogFooter) {
            this.$emit("onSure", 'onSure');
        } else {
            this.visible = false;
            this.$emit("onSure", 'onSure');
        }
    },
    // 关闭前
    beforeClose (done) {
        if (this.dialogConfig.hideOnBlur) this.visible = false;
        this.$emit("onHide",done);
    },
    // 打开动画结束回调
    opened() {
        this.dialogConfig.on && this.dialogConfig.on.opened && this.dialogConfig.on.opened('opened')
    },
    // 关闭动画结束回调
    closed() {
      this.dialogConfig.on && this.dialogConfig.on.closed && this.dialogConfig.on.closed('closed')
    },
    // 打开回调
    open() {
      this.dialogConfig.on && this.dialogConfig.on.open && this.dialogConfig.on.open('open')
    },
    // 打开动画结束回调
    close() {
      this.dialogConfig.on && this.dialogConfig.on.close && this.dialogConfig.on.close('close')
    }
  },
}
</script>
<style lang='scss' scoped>
</style>
