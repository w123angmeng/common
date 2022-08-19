import registeGlobalComponent from '../Components'
import registeGlobalDirectives from '../directives'
import * as api from '../api'
export default function install(Vue) {
    // 注册全局组件
    registeGlobalComponent(Vue)
    // 注册全局指令
    registeGlobalDirectives(Vue)
    // 注册全局api
    Vue.prototype['$CommonApi'] = api
}
