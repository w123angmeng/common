import { selectSdDataByCodes, findListByNameAndClassCodeAndEnabled, getSystemConfig} from '../../api'
export default {
    /**
     * 获取下拉项数据 自定义编码
     * @param {*} dataClassCodes 自定义编码类型
     * @param {*} enabled 0-禁用，1-启用，2-查全部
     */
    caseDictionary: async ({vm, params}) => {
        let { dataClassCodes, enabled = 2 } = params
        const { data } = await selectSdDataByCodes({
            vm: vm,
            data: {
                enabled: enabled,
                dataClassCodes: dataClassCodes
            }
        })
        return Promise.resolve(data)
    },
    /**
     * 根据编码code和关键字条件模糊查询列表
     * @param {*} dataClassCode 自定义编码类型
     * @param {*} keywords      关键词
     * @param {*} enabled       0-禁用，1-启用，2-查全部
     */
    findListByNameAndClassCodeFn: async ({vm, params}) => {
        let { dataClassCode, keywords, enabled=2 } = params
        const {data} = await findListByNameAndClassCodeAndEnabled({vm: vm, data: {
                dataClassCode: dataClassCode || '',
                dataName: keywords || '',
                enabled: enabled
            }})
        return Promise.resolve(data)
    },
     /**
     * 获取系统配置
     * @param {*} configerCode 自定义编码类型
     * @param {*} idConfigerControl 当前登录人的机构id
     */
    findSystemConfig: async ({vm, params}) => {
        let { configerCode,  idConfigerControl } = params;
        const { data } = await getSystemConfig({
            vm: vm,
            data: {
                configerCode,
                idConfigerControl
            }
        })
        return Promise.resolve(data)
    },
}
