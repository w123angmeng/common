// 组件选项指令

/*
* 组件引入 inputNumber
* arg 表示小数点的为数
* symbolStr 表示整数还是负数
* 使用 v-input-number:[arg]
* 解决input 输入效验
* */
export default {
    bind: function (el, binding, vnode) {
        let { arg } = binding
        let symbolStr = binding.value || '-'
        let reg = ''
        if (symbolStr == '+') {
            reg = new RegExp(`^(\\d*)\\.?\\d{0,${arg}}$`)
        } else {
            reg = new RegExp(`^(-?\\d*)\\.?\\d{0,${arg}}$`)
        }
        // let reg = /^(-?\d*)\.?\d{0,4}$/
        // 查找元素
        let findEle = (parent, type) => {
            return parent.tagName.toLocaleLowerCase() == type ? parent: parent.querySelector(type)
        }
        let trigger = (ele, type) => {
            // 创建的 event 实例
            const e = document.createEvent('HTMLEvents')
            // 初始化 创建的 event 实例
            e.initEvent(type, true, true)
            // 触发事件监听
            ele.dispatchEvent(e)
        }
        let $inp = findEle(el, 'input')
        el.$inp = $inp
        $inp.handle = function () {
            try {
                let val = $inp.value
                if (symbolStr == '+') {
                    val = val.replace(/[^\d.]/g,'')
                }
                if (!reg.test(val)) {
                    $inp.value = Number(val).toFixed(arg) || ''
                } else {
                    $inp.value = Number(val) || ''
                }
            } catch (e) {
                console.error(e)
            }
            trigger($inp, 'input')
        }
        $inp.addEventListener('keyup', $inp.handle)
    },
    unbind: function (el) {
        el.$inp.removeEventListener('keyup', el.$inp.handle)
    }
}
