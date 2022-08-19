// 下拉框 药品类别
export const selectDrugSort = ({vm, data}) => {
    return vm.$axios.get('dict/data/findListByChildData', data)
}

// 下拉框 药品类别
export const findListByNameAndClassCode = ({vm, data}) => {
    return vm.$axios.get('dict/data/findListByNameAndClassCode', data)
}

// 下拉厂商列表
export const firmList = ({vm, data}) => {
    return vm.$axios._post('dict/firm/pageMmFirm', data)
}

// 下拉厂商列表 无分页
export const listFirmByFirmType = ({vm, data}) => {
    // sdFirmType=1 --> sdFirmType=1,3 sdSupplyScope=1,3
    // sdFirmType=2 --> sdFirmType=1,3 sdSupplyScope=2,3
    // sdFirmType=3 --> sdFirmType=2,3
    // sdFirmType=4 --> sdFirmType=2,3 sdSupplyScope=1,3
    // sdFirmType=5 --> sdFirmType=2,3 sdSupplyScope=2,3
    // 对sdFirmType 进行参数修改

    const sdFirmTypeMap = new Map()
    sdFirmTypeMap.set('1', '{"sdFirmType":"1,3","sdSupplyScope":"1,3"}');
    sdFirmTypeMap.set('2', '{"sdFirmType":"1,3","sdSupplyScope":"2,3"}');
    sdFirmTypeMap.set('3', '{"sdFirmType":"2,3"}');
    sdFirmTypeMap.set('4', '{"sdFirmType":"2,3","sdSupplyScope":"1,3"}');
    sdFirmTypeMap.set('5', '{"sdFirmType":"2,3","sdSupplyScope":"2,3"}');
    console.log(sdFirmTypeMap.get(data.sdFirmType ? data.sdFirmType+'' : data.sdFirmType))
    const normalizedSdFirmType = sdFirmTypeMap.get(data.sdFirmType ? data.sdFirmType+'' : data.sdFirmType)
    let afterObj =  normalizedSdFirmType ? JSON.parse(normalizedSdFirmType) : {}
    let sendData = {...data,...afterObj}
    return vm.$axios.post('dict/firm/listFirmByFirmType', sendData)
    // return vm.$axios.post('http://10.95.103.24:16000/dict/firm/listFirmByFirmType', sendData)
}

// 新增字典值
export const saveDict = ({vm, data}) => {
    return vm.$axios._post('dict/data/save', data)
}

// 中文转换五笔、拼音码
export const chineseSearch = ({vm, data}) => {
    return vm.$axios._post('dict/chinese/search', data)
}

// 获取仓库树
export const getStorageTree = ({vm, data}) => {
    return vm.$axios.get('hispres/restorage/getStorageTree', data)
}


// 通过字典编码获取启用和禁用字典值 - 物资域使用
export const selectSdDataByCodes = ({vm, data}) => {
    return vm.$axios.get('dict/data/selectSdDataByCodes', data)
}

// 通过字典编码和字典值名称模糊查询下拉列表-物资域使用
export const findListByNameAndClassCodeAndEnabled = ({vm, data}) => {
    return vm.$axios.get('dict/data/findListByNameAndClassCodeAndEnabled', data)
}
// 通过字典编码和字典值名称模糊查询下拉列表-物资域使用-支持多参数
export const findListByNameAndClassCodeList = ({vm, data}) => {
    return vm.$axios.get('dict/data/findListByNameAndClassCodeList', data)
}


// 查询所有工作组科室
export const listAllDeptMaterialGroup = ({vm, data}) => {
    return vm.$axios.get('org/dept/listAllDeptMaterialGroup', data)
}

// 根据当前登录科室查询全部库房
export const listReStorageBySearch = ({vm, data}) => {
    return vm.$axios.get('hispres/restorage/listReStorageBySearch', data)
}

// 根据当前登录科室查询全部库房 月娥写
export const listReStorageAndDeptBySearch = ({vm, data}) => {
    return vm.$axios.get('hispres/restorage/listReStorageAndDeptBySearch', data)
}


// 查询所有用法
export const findRouteAll= ({vm, data}) => {
    return vm.$axios._post('dict/route/findAll', data)
}

// 查询药房关联全部在用的科室
export const listDeptByType= ({vm, data}) => {
    return vm.$axios.post('org/dept/listDeptByType', data)
}


/**
 * GET 查询集团/机构下所有人员信息 下拉框
 * @param {*} vm   vue 实例
 * @param {*} data selCondition (Array[string], optional): 查询条件
 * @param {*} data idGroup (string, optional): 集团id
 * @param {*} data idOrg (string, optional): 机构id
 */
export const listEmpInfo = ({vm, data}) => {
    return vm.$axios.get('org/emp/listEmpInfoForMaterial', data)
}

/**
 * 新人员-查询集团/机构下所有人员信息 下拉框
 * @param {*} data selCondition (Array[string], optional): 查询条件
 * @param {*} data idGroup (string, optional): 集团id
 * @param {*} data idOrg (string, optional): 机构id
 * @param {*} data isAll (string, optional): 默认全部,传1显示启用状态
 */
export const listEmpInfoForMaterial= ({vm, data}) => {
    return vm.$axios.get('org/emp/listEmpInfoForMaterial', data)
}

/**
 * @param vm
 * @param data
 * @returns {Promise<{code: string, message: string}>}
 */
export const listReStorageLocationByIdStorage= ({vm, data}) => {
    return vm.$axios.get('hispres/restorage/listReStorageLocationByIdStorage', data)
}


/* --------------------------material 物资域相关接口 ----------------------------*/

// 根据仓库ID和物品ID生成采购计划数量
export const listMaterialSuggestQuantity= ({vm, data}) => {
    return vm.$axios._post('material/material/listMaterialSuggestQuantity', data)
}

// 分类列表 - 最末级列表
export const listMmTransTypeByTransCode= ({vm, data}) => {
    return vm.$axios.get('material/transType/listMmTransTypeByTransCode', data)
}

// 校验物品仓库权限
export const checkMaterialStorageAuth= ({vm, data}) => {
    return vm.$axios._post('material/material/checkMaterialStorageAuth', data)
}

// 查询医嘱摆药类别列表
export const listOrderIssueType= ({vm, data}) => {
    return vm.$axios.post('material/orderIssueType/listOrderIssueType', data)
}

// 根据护理单元ID和床号/患者ID/患者姓名查询患者信息
export const inpIssueRecordListPat= ({vm, data}) => {
    return vm.$axios.post('material/inpIssueRecord/ListPat', data)
}


// 查询物品基本分类树
export const getStorageMaterTree = ({vm, data}) => {
    return vm.$axios.get('material/storageMaterAuth/getStorageMaterTree', data)
}

// 保存物品基本分类树
export const saveStorageMaterTree = ({vm, data}) => {
    return vm.$axios._post('material/storageMaterAuth/saveStorageMaterTree', data)
}

// 查询基本分类叶子节点下拉列表
export const listMmMaterTypeSelect = ({vm, data}) => {
    return vm.$axios.post('material/storageMaterAuth/listMmMaterTypeSelect', data)
}

/**
 * 分类tree结构
 * @param {*} vm   vue 实例
 * @param {*} data sdTransType 标识：1 采购计划；2 采购业务 3请领业务 4入库业务 5出库业务 6库存调整
 */
export const listMmTransTypeBySdTransType = ({vm, data}) => {
    return vm.$axios.get('material/transType/listMmTransTypeBySdTransType', data)
}

/**
 * 根据仓库id,物品名称/编码/五笔码/拼音码(模糊)查询物品列表
 * @param {*} vm   vue 实例
 * @param {*} data condition 物品查询条件
 * @param {*} data idStorage 仓库id
 */
export const listMaterialByIdStorageAndLike = ({vm, data}) => {
    return vm.$axios._post('material/material/listMaterialByIdStorageAndLike', data)
}

/**
 * 根据仓库id和物品ids查询物品列表
 * @param {*} vm   vue 实例
 * @param {*} data idMaterials (Array[string], optional): 物品ids
 * @param {*} data idStorage (string, optional): 仓库id
 */
export const listMaterialByIdMaterialsAndIdStorage = ({vm, data}) => {
    return vm.$axios._post('material/material/listMaterialByIdMaterialsAndIdStorage', data)
}
/**
 * 查询物品全部数据 ----入库
 ** @param {*} vm   vue 实例
 * @param {*} data condition 物品查询条件
 * @param {*} data idMaterTypes  基本分类
 * @param {*} data idStorage 仓库id
 * @param {*} data idFirm :string 供应商
 * */
export const listMaterialStockByIdStorageAndLike = ({vm, data}) => {
    return vm.$axios._post('material/material/listMaterialStockByIdStorageAndLike', data)
}

/**
 * 根据仓库id、物品类型、物品名称/编码/五笔码/拼音码(模糊)分页查询物品列表
 * @param {*} vm   vue 实例
 * @param {*} data condition (string, optional): 物品查询条件 ,
 * @param {*} data idMaterTypes (Array[string], optional): 基本分类 ,
 * @param {*} data idStorage (string, optional): 仓库id ,
 * @param {*} data lowLimit (integer, optional): 是否低于下限：0-否(查询全部)，1-是，默认0 ,
 * @param {*} data idStorage (string, optional): 仓库id
 * @param {*} data lowSafe (integer, optional): 是否低于安全库存：0-否(查询全部)，1-是，默认0 ,
 * @param {*} data pageIndex (integer, optional): 当前页，默认第一页 ,
 * @param {*} data pageSize (integer, optional): 每页记录数，默认全局变量
 */
export const pageMaterialByIdStorageOrIdMaterTypeOrLike = ({vm, data}) => {
    return vm.$axios._post('material/material/pageMaterialByIdStorageOrIdMaterTypeOrLike', data)
}

export const listMaterialByIdStorageOrIdMaterTypeOrLike = ({vm, data}) => {
    return vm.$axios._post('material/material/listMaterialByIdStorageOrIdMaterTypeOrLike', data)
}

// 树接口
export const treeList = ({vm, data}) => {
    return vm.$axios.get('material/materType/listMmMaterType', data)
}
// 树接口
export const getTreeNode = ({vm, data}) => {
    return vm.$axios.get('material/materType/findMmMaterType', data)
}

// 判断基本分类是否在医保范围
export const isMasterTypCoverage = ({vm, data}) => {
    return vm.$axios.get('material/materType/isMasterTypCoverage', data)
}

// 获取批号
export const  listBatchFile= ({vm, data}) => {
    return vm.$axios.post('material/materialStock/listBatchFile', data)
}

/* --------------------------material 物资域相关接口 ----------------------------*/
//获取系统配置
export const  getSystemConfig = ({vm, data}) => {
    return vm.$axios.get('dict/conf/findConfigerByCode',data);
}

//基本分类平铺
export const allMmMaterType = ({vm, data}) => {
    return vm.$axios.get('material/materType/allMmMaterType',data);
}

// 领药单-批号
export const listMmBatchFileForMedicineReceipt = ({vm, data}) => {
    return vm.$axios.post('material/materialStock/listMmBatchFileForMedicineReceipt',data);
}

