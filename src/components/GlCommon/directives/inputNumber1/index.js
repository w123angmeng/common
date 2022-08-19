
// 组件选项指令

/*
* 组件引入 inputNumber
* arg 表示小数点的为数
* symbolStr 表示整数还是负数
* 使用 v-input-number:[arg]
* 解决input 输入效验
* isInt 是否只输入整数
* */
import util from '../../gl-admin/libs/util'
export default {
    bind: function (el, binding, vnode) {
        let { arg } = binding
        let {integerStep, symbol, pointStep,mathType,isInt} = binding.value || '-'
        isInt = isInt? isInt: false;
        // 控制整数和负数
        let symbolStr = symbol || '-'
        // 小数部分
        let pointStepStr = util.validate.isEmpty(pointStep) ? 0 : pointStep
        // 整数部分
        let integerStepStr = integerStep || 8
        let reg = ''
        if (symbolStr == '+') {
            reg = new RegExp(`^(\\d*)\\.?\\d{0,${pointStepStr}}$`)
        } else {
            reg = new RegExp(`^(-?\\d*)\\.?\\d{0,${pointStepStr}}$`)
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
                // 格式化数字
                if(isInt) {
                    val = util.number.fomatInt(val,integerStepStr,pointStepStr,mathType)
                }else {
                    val = util.number.fomatFloat(val,integerStepStr,pointStepStr)
                }
                if (symbolStr == '+') {
                    val = val.replace(/[^\d.]/g,'')
                }
                if (isNaN(val)) {
                    $inp.value = parseInt(val) || 0
                } else {
                    $inp.value = val || 0
                }
            } catch (e) {
                console.error(e)
            }
            trigger($inp, 'input')
        }
        $inp.addEventListener('blur', $inp.handle)
    },
    unbind: function (el) {
        el.$inp.removeEventListener('blur', el.$inp.handle)
    }
}
