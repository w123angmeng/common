/*
 * @Author: changxy
 * @Date: 2022-02-09 16:39:18
 * @LastEditors: changxy
 * @LastEditTime: 2022-03-16 16:00:43
 * @Description: 请填写简介
 */
import _ from 'lodash';
import { saveMaterialPlan } from '../api';
import util from '@/components/page/Common_WEB/GlCommon/gl-admin/libs/util'
export default {
    methods: {
        async validateFn() {},
        //获取下拉数据
        async selectDataFn({ $event, type, field, detail }) {
            const keys = ['idEmpPRepared', 'idEmpSign', 'idEmpPreparedList', 'idEmpSignList'];
            let data = {};
            //请求的参数
            let params = _.get(detail, 'params', {});
            //请求的路径
            let url = _.get(detail, 'url');
            let method = _.get(detail, 'method','get');
            //是否存在下拉的数据
            let selectData = _.get(detail, 'inputConfig.list',[]);
            const { callBack, query } = $event
            let beforeGetData = _.get(detail, 'beforeGetData', '');
            if(beforeGetData && typeof beforeGetData == 'function') {
                params = await beforeGetData(this.form);
            }
            //人员统一设置参数
            if(keys.includes(type)) {
                params.idOrg = JSON.parse(sessionStorage.getItem('user')).idOrg;
            }
            //下拉数据统一设置参数
            params.isAll = 1;
            if(url) {
                data = await this.getDataFun({ vm: this, data: params, url, method, })
                callBack({ list: data && data.data });
                this.selectData[`${type}List`] = data && data.data;
                return Promise.resolve(data && data.data);
            }else {
                callBack({ list: selectData });
                this.selectData[`${type}List`] = selectData;
                return Promise.resolve(data && data.data);
            }
        },
        //格式化数据
        formatData() {
            let remarks = "";
            for(let item in this.formItems) {
                if(!item.hidden) {
                    if(this.form[`${item}Sign`] && this.form[`${item}Value`].length) {
                        let type = _.get(this.formItems[item], 'type', 'input');
                        if(type == 'date') {
                            // let sign = this.form[`${item}Sign`];
                            // let startDate = this.form[`${item}Start`];
                            // let endDate = this.form[`${item}End`];
                            // remarks += `${item}Start_${sign}_${startDate}_${type}&`;
                            // remarks += `${item}End_${sign}_${endDate}_${type}&`;
                            let sign = this.form[`${item}Sign`];
                            let value =  this.form[`${item}Value`];
                            remarks += `${item}_${sign}_${value}_${type}&`;
                        }else {
                            let sign = this.form[`${item}Sign`];
                            let value =  this.form[`${item}Value`];
                            remarks += `${item}_${sign}_${value}_${type}&`;
                        }
                    }
                }
            }
            return remarks;
        },
        formatDateRange(date,startDt,endDt){
            if(date && date.length){
                this.form[startDt] = date[0];
                this.form[endDt] = date[1];
            }else {
                this.form[startDt] = '';
                this.form[endDt] = '';
            }
        },
        // form 验证失败
        failFn() {

        },
        // 取消
        cancel() {
            this.componentConfig.cancel && this.componentConfig.cancel()
        },
        // 确定
        sure(next) {
            let planDetail = this.formatData();
            this.$refs['form'].$refs['elForm'].validate(async (valid) => {
                if(valid) {
                    if(!planDetail) {
                        this.$message({
                            message: '请至少添加一个查询条件',
                            type: 'warning'
                          });
                        next && next();
                        return;
                    }
                    let user = this.getUserStorage();
                    let params = {
                        empName: user.empName,
                        enabled: 0,
                        idEmp: user.idEmp,
                        idPlan: _.get(this.formData, 'idPlan',''),
                        planDetail: planDetail,
                        planName: this.form.name,
                        transCode: _.get(this.componentConfig, 'data.pageKey', ''),
                    }

                    let res = await saveMaterialPlan({vm: this, data: params});
                    if(res.success) {
                        this.componentConfig.sure && this.componentConfig.sure(this.form.submitInstructions,next)
                    }else {
                        if(res) {
                            this.$message.warning(res.message);
                            next && next();
                        }
                    }
                }else {
                    next && next();
                    return;
                }
            })
        },
        getDataFun({vm, data, url,method}){
            if(method == 'post') {
                return vm.$axios.post(url, data);
            }else {
                return vm.$axios.get(url, data);
            }
        },
        //查询方法
        selectChange(val, item, index) {
            if(item.inputConfig.change && typeof item.inputConfig.change == 'function') {
                item.inputConfig.change(this.form);
            }
        },
        //获取日期数据字典
        async caseDictionaryFn () {
            const data = await util.api.caseDictionary({vm: this, params: {
                    dataClassCodes: 'SD_SELECT_PLAN_TIME'
                }})
            this.selectList = data
        },
    }
}
