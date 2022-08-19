/*
 * @Author: changxy
 * @Date: 2022-02-14 09:58:20
 * @LastEditors: changxy
 * @LastEditTime: 2022-03-01 19:39:35
 * @Description: 请填写简介
 */
let testIp = "material/";
// let testIp = "http://10.95.103.216:16601/material/";
export const listMaterialSelectPlan = ({vm, data}) => {

    return vm.$axios._post(testIp +'selectPlan/listMaterialSelectPlan', data)
}

export const saveMaterialPlan = ({vm, data}) => {
    return vm.$axios._post(testIp+'selectPlan/saveMaterialPlan', data)
}

export const selectPlanResult = ({vm, data}) => {
    return vm.$axios._post(testIp+'selectPlan/selectPlanResult', data)
}

export const updateEnabled = ({vm, data}) => {
    return vm.$axios.get(testIp+'selectPlan/updateEnabled', data)
}
