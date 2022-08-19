export default {
    /**
     * 深拷贝
     * @param {*} obj
     */
    cloneDeep: (obj) => {
        // 1.判断是否为null 或undefined
        if (typeof obj == null ) return obj;
        // 2.判断是否为日期Date
        if (obj instanceof Date) return new Date(obj);
        // 3.判断是否为正则 typeof /\d+/ === 'object'
        if (obj instanceof RegExp) return new RegExp(obj);
        // 4.如果不是数组或对象，返回该值
        if (typeof obj !== 'object') return obj;
        // 接下来，要么是对象，要么是数组 可以用 new obj.constructor得到它类型的空值
        let cloneObj = new obj.constructor;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 递归深拷贝
                cloneObj[key] = cloneDeep(obj[key]);
            }
        }
        return cloneObj;
    },
    /**
     * 配置节流函数
     * 应用场景:
     * window.onscroll = throttle(testFn, 200);
     * window.onscroll = throttle(testFn, 100, 100);
     * @param  {[Function]}  fn     [要执行的函数]
     * @param  {[Number]}  delay    [延迟执行的毫秒数]
     * @return {[Function]}         [节流函数]
     */
    throttle(fn, delay) {
        let now, lastExec, timer, context, args
        const execute = function() {
            fn.apply(context, args)
            lastExec = now
        }
        return function(...arg) {
            context = this
            args = arg
            now = Date.now()
            if (timer) {
                clearTimeout(timer)
                timer = null
            }
            if (lastExec) {
                const diff = delay - (now - lastExec)
                if (diff < 0) {
                    execute()
                } else {
                    timer = setTimeout(() => {
                        execute()
                    }, diff)
                }
            } else {
                execute()
            }
        }
    },

    /**
     * 防抖函数
     * @param {*} func
     * @param {*} wait
     * @param {*} immediate
     */
    debounce(func, wait, immediate = true) {
        let timeout, result
        // 延迟执行函数
        const later = (context, args) => setTimeout(() => {
            timeout = null // 倒计时结束
            if (!immediate) {
                result = func.apply(context, args) // 执行回调
                context = args = null
            }
        }, wait)
        const debounced = function(...params) {
            if (!timeout) {
                timeout = later(this, params)
                if (immediate) {
                    result = func.apply(this, params) // 立即执行
                }
            } else {
                clearTimeout(timeout)
                timeout = later(this, params) // 函数在每个等待时延的结束被调用
            }
            return result
        }
        // 提供在外部清空定时器的方法
        debounced.cancel = function() {
            clearTimeout(timeout)
            timeout = null
        }
        return debounced
    },
}
