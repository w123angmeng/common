
export default {
    /**
     * 将树形数据向下递归为一维数组
     * @param {*} arr 数据源
     * @param {*} childs  子集key
     */
    flattenDeep: () => {
        var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var childs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Children";
        return arr.reduce(function (flat, item) {
            return flat.concat(item, item[childs] ? flattenDeep(item[childs], childs) : []);
        }, []);
    }
}
