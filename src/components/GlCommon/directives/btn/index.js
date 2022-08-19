// 组件选项指令

/*
* 指令
* 使用 v-btn={callBack: function(val) {}}
* 按钮3秒禁用
* */
export default {
    bind: function (el, binding, vnode) {
        let callBack = (binding.value && binding.value.callBack) || null
        let timeOut = binding.arg || 3000
        function handle() {
            el.disabled = true
            callBack && callBack(true)
            setTimeout(() => {
                el.disabled = false
                callBack && callBack(false)
            }, timeOut)
        }
        el.btnHandle = handle
        el.addEventListener('click', el.btnHandle)
    },
    unbind: function (el) {
        el.removeEventListener('click', el.btnHandle)
    }
}
