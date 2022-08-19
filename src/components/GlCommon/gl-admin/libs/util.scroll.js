export default {
    /**
     * 滚动条平滑滚动到指定位置
     * @param {*} pos 位置
     * @param {*} seep 速度
     * @param {*} seep el 指定的元素
     */
    animateScroll (pos, el, seep = 20) {
        if (isNaN(pos)) {
            throw "Position must be a number";
        }
        if (pos < 0) {
            throw "Position can not be negative";
        }
        if (el) {
            var currentPos = el.scrollTop
        } else {
            var currentPos = document.documentElement.scrollTop || window.scrollY || window.screenTop;
        }

        if (currentPos < pos) {
            let time = 0;
            for (let i = currentPos; i <= pos; i += seep) {
                time += 4;
                setTimeout(function () {
                    window.scrollTo(0, i);
                }, time / 2);
            }
        } else {
            let time = 0;
            for (let i = currentPos; i >= pos; i -= seep) {
                time += 4;
                setTimeout(function () {
                    window.scrollTo(0, i);
                }, time / 2);
            }
        }
    }
}
