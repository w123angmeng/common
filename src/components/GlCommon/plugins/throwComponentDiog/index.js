import Vue from "vue"
import container from "./container.vue"

export default class ThrowComponent {

    constructor() {

        // 子组件
        this.componentInstance = null;

        const Constructor = Vue.extend(container);

        this.dialogInstance = new Constructor({
            el: document.createElement('div')
        });

        // 监听打开事件
        this.dialogInstance.$on("onShow", () => {
            this.componentInstance.$emit("onShow");
        });
        // 监听关闭事件
        this.dialogInstance.$on("onHide", async (done) => {
            this.componentInstance.$emit("onHide");
            //验证判断
            this.dialogInstance.isRemoveDom && this.dialogInstance.$el.remove();
            }
        );

        // 监听确定按钮事件
        this.dialogInstance.$on("onSure", () => {
            this.componentInstance.$emit("onSure");
        });
        // 监听取消按钮事件
        this.dialogInstance.$on("onCancel", () => {
            this.componentInstance.$emit("onCancel");
        });
    }

    // 打开方法
    throw (options = {}) {
        // 组件选项
        let component = options.component;
        // 组件创建后插入的dom
        let targetMountDom = options.targetMountDom;
        // el-dialog Config蒙层配置选项,详情先去了解el-dialog支持的功能
        let dialogConfig = options.dialogConfig || {};

        let targetDom = targetMountDom || document.body;
        targetDom.appendChild(this.dialogInstance.$el);

        this.dialogInstance.$props.visible = true;
        // 是否销毁dom
        this.dialogInstance.isRemoveDom = dialogConfig.isRemoveDom || false;
        this.dialogInstance.$props.dialogConfig = dialogConfig || {};


        if (!component) return;
        // 获取子组件实例
        this.componentInstance = this.getComponentInstance(component);
        this.componentInstance.$props.componentConfig = options.componentConfig || {}
        this.dialogInstance.$nextTick(() => {
            let mountEle = this.dialogInstance.$el.querySelector(".container");
            mountEle.innerHTML = "";
            mountEle.appendChild(this.componentInstance.$el);
        })
        return this.componentInstance;
    }
    // 关闭弹窗，并销毁实例
    close () {
        if (this.dialogInstance.isRemoveDom) {
            this.dialogInstance.$props.visible = false;
            this.dialogInstance.$el.remove()
        } else {
            this.dialogInstance.$props.visible = false;
        }
    }

    // 获取子组件实例
    getComponentInstance (component) {

        let ComponentConstructor = Vue.extend(component);
        return new ComponentConstructor({
            el: document.createElement('div')
        });
    }

}

