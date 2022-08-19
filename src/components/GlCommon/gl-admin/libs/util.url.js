/*
 * @Author: changxy
 * @Date: 2022-01-07 11:10:33
 * @LastEditors: changxy
 * @LastEditTime: 2022-03-07 15:28:59
 * @Description: 请填写简介
 */
import validate from "./util.validate";

export default {
    /**
     * 获取url字符串参数
     * 注意：此方法为vue hash模式特定方法，不适用其他渠道，是解决兼容微信分享链接中取参错误的问题?from=singlemessage&isappinstalled=0
     */
    getQueryStr: (urls) => {
        let url = urls || (window.location.href.split('#')[1] || window.location.href)
        url = decodeURIComponent(url)
        const result = {}
        const arr = url.split('?')
        const params = arr[arr.length-1] && arr[arr.length-1].split('&')
        if (!params) return result
        for (let i = 0; i < params.length; i++) {
            const item = params[i].split('=')
            item[0] = decodeURIComponent(item[0])
            item[1] = decodeURIComponent(item[1])
            result[item[0]] = item[1]
        }
        return result
    },
    /**
     * 将json转换为url参数
     * @param {Object} queryObj 参数对象
     * @param {String} symbol 起始符号
     */
    createQueryStr: (queryObj, symbol = '') => {
        let queryStr = ''
        if (!validate.isObject(queryObj)) return queryStr
        queryStr += symbol
        for (const key in queryObj) {
            const item = queryObj[key]
            item && (queryStr += `${key}=${item}&`)
        }
        queryStr = queryStr.substring(0, queryStr.length - 1)
        return queryStr
    },
    /**
     * 使用H5的history Api 修改浏览器历史状态
     * @param {*} query 参数对象
     * @param {*} type replace || push
     */
    historyGoState: (query, type = 'replace') => {
        if (query instanceof Array) return
        if (query instanceof Object) {
            let pageUrl = location.href
            let queryStr = '?'
            for (const key in query) {
                const element = query[key]
                queryStr += `${key}=${element}&`
            }
            queryStr = queryStr.substring(0, queryStr.length - 1)
            // 兼容微信分享后 双问号? 的链接
            pageUrl = pageUrl.includes('?') ? pageUrl.slice(0, pageUrl.lastIndexOf('?')) : pageUrl
            pageUrl = pageUrl + queryStr
            if (type === 'replace') history.replaceState(query, '', pageUrl)
            else history.pushState(query, '', pageUrl)
        }
    },
    /**
     * 修改url参数值，若没有该参数则添加
     * @param {*} url url地址
     * @param {*} arg 参数名
     * @param {*} arg_val 新参数值
     */
    changeURLArg: (url, arg, argVal) => {
        const pattern = arg + '=([^&]*)'
        const replaceText = arg + '=' + argVal
        if (url.match(pattern)) {
            const reg = new RegExp('(' + arg + '=)([^&]*)', 'g')
            return url.replace(reg, replaceText)
        } else {
            if (url.match('[\?]')) {
                return url + '&' + replaceText
            } else {
                return url + '?' + replaceText
            }
        }
    },
    /**
     * url 参数编码
     * @param {*} url obj
     */
    urlParamsEncode: (obj = {}) => {
        if (!validate.isObject(obj)) return
        return encodeURIComponent(JSON.stringify(obj))
    },

    /**
     * url 参数解码
     * @param {*} url JsonStr
     */
    urlParamsDecode: (JsonStr= '{}') => {
        if (!validate.isJsonString(JsonStr)) return
        return JSON.parse(decodeURIComponent(JsonStr))
    }
}
