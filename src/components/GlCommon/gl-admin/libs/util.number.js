import validate from './util.validate'
export default {
    /**
     * 限制n位小数
     */
    limitDigits:function(val,n=2){
        let value = val
        value = value.replace(/[^\d.]/g,"");  //清除“数字”和“.”以外的字符
        value =  value.replace(/^\./g,""); //验证第一个字符是数字
        value = value.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的
        value = value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
        //借助RegExp构造函数 动态创建正则 RegExp函数会将转义字符进行处理 转义字符\前，再加一层\
        let digitsReg = RegExp(`^(\\-)*(\\d+)\\.(\\d{${n}}).*$`);// 输出=>  /^(\-)*(\d+)\.(\d{2}}).*$/
        console.log(digitsReg)
        value = value.replace(digitsReg,'$1$2.$3');//只能输入两个小数
        if(value.indexOf(".")< 0 && value !=""){//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
           console.log('---',value)
           value= parseFloat(value);
        }
        return value
    },
    /**
     * 数字乘以100 或者 数字除以100 解决精度问题
     * accMul(number,100) //乘以100
     * accMul(number,1) // 除以100
     * @param {*} arg1
     * @param {*} arg2
     */
    accMul: (arg1, arg2) => {
        arg1 = arg1 || 0;
        var m = 0,
            s1 = arg1.toString(),
            s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length
        } catch (e) { }
        try {
            m += s2.split(".")[1].length
        } catch (e) { }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    },
    /**
     * 金额格式化小数点
     * toFixed(0) 0.00
     * toFixed(12.2) 12.20
     * toFixed(12.22) 12.22
     * @param {*} s
     *  @param {*} pointStep
     *  @param {*} point
     *  toFixed(str, 10000, 4)
     */
    toFixed: (s, pointStep, point) => {
        let a = this.accMul(s, pointStep);
        let _a = s * pointStep;
        // console.log("直接乘以 * 100", _a)
        // console.log("accMul * 100", a)
        let b = Math.round(a);
        let _b = Math.round(_a);

        // console.log("直接乘以-round", _b)
        // console.log("accMul-round", b)
        let c = this.accMul(b, 1/pointStep);
        // console.log("accMul * 0.01", c)

        return c.toFixed(point)
        // (Math.round((cart.billAmount) * 100) / 100).toFixed(2)
    },
    /**
     * 金额格式化小数点
     * fomatFloat(123456789.12345, 8, 4)  => 12345678.1235
     * @param {*} integerStep 截取整数部分位数
     *  @param {*} pointStep  截取小数部分位数
     *  保留n位小数并格式化输出（不足的部分补0）
     */
    fomatFloat: (value, integerStep = 8, pointStep = 4) => {
        var f = Math.round(value*Math.pow(10,pointStep))/Math.pow(10,pointStep);
        var s = f.toString();
        var rs = s.indexOf('.');
        let startStr = ''
        let endStr = ''
        if (rs < 0) {
            if (validate.isEmpty(pointStep)) {
                s = s.slice(0,integerStep)
            } else {
                s = s.slice(0,integerStep)
                s += '.';
            }
        } else {
            startStr = s.split('.')[0].slice(0,integerStep)
            endStr = s.split('.')[1].slice(0,pointStep)
            s = startStr + '.' + endStr
        }
        for(var i = s.length - s.indexOf('.'); i <= pointStep; i++){
            s += "0";
        }
        return s;
    },
    /**
     * 数量格式化小数点
     * formatInt(123456789.12345, 8, 4, ceil)  => 12345678.1235
     * @param {*} integerStep 截取整数部分位数
     *  @param {*} pointStep  补零位数
     * @param {*} type 取整类型，向上取值，向下取值，四舍五入取值
     *  保留n位小数并格式化输出（不足的部分补0）
     */
    fomatInt: (value, integerStep = 8, pointStep = 4, type = 'ceil') => {
            const mathMethods = ['ceil','floor','round'];
            if(!mathMethods.includes(type)) {
                type = 'ceil';
            }
            value  = Math[type](value);
            return Number(value).toFixed(pointStep);
    },
    /**
     *
     * @param {*} val 录入数值
     * @param {*} isDecPoint  是否可以录入小数点
     * @param {*} negativeNum  是否可以录入负数
     * @returns
     */
    inputCheckNum: (val, isDecPoint = false, negativeNum=false)=> {
        var str = val;
        var len1 = str.substr(0, 1);
        var len2 = str.substr(1, 1);
        //如果第一位是0，第二位不是点，就用数字把点替换掉
        if (str.length > 1 && len1 == 0 && len2 != ".") {
            str = str.substr(1, 1);
        }
        //第一位不能是.
        if (len1 == ".") {
            str = "";
        }
        //限制只能输入一个小数点
        if (str.indexOf(".") != -1) {
            var str_ = str.substr(str.indexOf(".") + 1);
            if (str_.indexOf(".") != -1) {
                str = str.substr(
                    0,
                    str.indexOf(".") + str_.indexOf(".") + 1
                );
            }
        }
        //正则替换，保留数字和小数点
        if (isDecPoint && negativeNum) {
            str = str.match(/^\-?\d*(\.?\d{0,1})/g)[0] || '';
        } else {
            if (isDecPoint) {
                str = str.match(/^\d*(\.?\d{0,1})/g)[0] || null;
            } else if (negativeNum) {
                str = str.match(/^\-?\d*/g)[0] || '';
            } else {
                str = str.match(/^\d*/g)[0] || '';
            }
        }
        return str;
    },
}
