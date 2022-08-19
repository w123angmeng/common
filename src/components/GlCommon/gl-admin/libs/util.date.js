export default {
    /**
     *   desc   判断当前时间是否在是否在指定的时间内
     *   start  开始日期
     *   end    结束日期
     *   return Boolean
     */
    isDruingDate: (start = '', end = '') => {
        let now = new Date().getTime(),
            startDate = null,
            endDate = null
        if (!isNaN(start)) {
            startDate = new Date(`${start} 00:00:00`).getTime()
        } else {
            startDate = new Date(`${start.replace(/\-/g, '/')} 00:00:00`).getTime()
        }
        if (!isNaN(end)) {
            endDate = new Date(`${end} 23:59:59`).getTime()
        } else {
            endDate = new Date(`${end.replace(/\-/g, '/')} 23:59:59`).getTime()
        }
        if (now >= startDate && now <= endDate) {
            return true
        } else {
            return false
        }
    },
    // 开始时间和结束时间校验
    compareTime: (start = '', end = '') => {
        let startTime = null, endTime = null
        if (!isNaN(start)) {
            startTime = new Date(start).getTime()
        } else {
            startTime = new Date(start.replace(/\-/g, '/')).getTime()
        }
        if (!isNaN(end)) {
            endTime = new Date(end).getTime()
        } else {
            endTime = new Date(end.replace(/\-/g, '/')).getTime()
        }
        if (startTime > endTime) {
            return true
        } else {
            return false
        }
    },
    /**
     *   desc   获取当前日期
     *   return 2021-01-09
     */
    currentDateformat:  () => {
        let str = new Date().toLocaleDateString().split('/').map((v) => {
            if (v < 10) {
                return '0' + v
            } else {
                return v
            }
        }).join('-')
        return str
    }
}
