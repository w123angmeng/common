export default {
    /**
     * 检测是否对象
     * @param {Object} obj
     */
    isObject: (obj) => {
        return Object.prototype.toString.call(obj) === '[object Object]'
    },
    /**
     * 检查是否数组
     * @param {Array} obj
     */
    isArray: (obj) => {
        return Object.prototype.toString.call(obj) === '[object Array]'
    },
    /**
     * 判断一个值是否为空
     * @param {v} any
     */
    isEmpty: (v) => {
        switch (typeof v) {
            case 'undefined':
                return true
                break;
            case 'string':
                if(v.replace(/(^[ \t\n\r]*) | [ \t\n\r]*$/g, '').length == 0) return true
                break;
            case 'boolean':
                if (!v) return true
                break;
            case 'number':
                if (0 === v || isNaN(v)) return true
                break;
            case 'object':
                if (null === v || v.length === 0) return true;
                for (var i in v) {
                    return false
                }
                return true
                break;
        }
        return false
    },
    /**
     * 判断是否是Json 字符窜
     * @param {*} JsonStr
     */
    isJsonString: (JsonStr= '{}') => {
        try {
            if (typeof JSON.parse(decodeURIComponent(JsonStr)) == 'object') {
                return true
            }
        } catch (e) {
            return false
        }
    },
    /**
     * 检测类型
     * @param {*} any
     */
    checkType: (any) => {
        return Object.prototype.toString.call(any).slice(8, -1)
    }
}
