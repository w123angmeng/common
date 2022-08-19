import { kebabCase } from 'lodash'
export default function registeGlobalComponent(Vue) {
    const files = require.context('./', true, /([a-zA-Z0-9-_]+)\/index\.(js|vue)$/)
    files.keys().forEach((key) => {
        const config = files(key)
        const name = key.replace(/^\.\//, '').replace(/\.\w+$/, '').replace(/\/.\w+$/, '')
        Vue.component(name, config.default || config)
    })
}
