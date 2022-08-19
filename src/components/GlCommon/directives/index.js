
import { kebabCase } from 'lodash'
export default function registeGlobalDirectives(Vue) {
    const files = require.context('./', true, /([a-zA-Z0-9-_]+)\/index\.(js)$/)
    console.log('files', files.keys)
    files.keys().forEach((key) => {
        console.log('keys', key)
        const config = files(key)
        const name = kebabCase(key.replace(/^\.\//, '').replace(/\.\w+$/, '').replace(/\/.\w+$/, ''))
        console.log('name', name)
        Vue.directive(name, config.default || config)
    })
}
