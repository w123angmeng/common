<!--
 * @Author: changxy
 * @Date: 2022-02-09 16:23:31
 * @LastEditors: changxy
 * @LastEditTime: 2022-03-16 16:12:06
 * @Description: 请填写简介
-->
<template>
    <glForm
        :inline="true"
        @validateFn="validateFn"
        @failFn="failFn"
        :model="form"
        ref="form"
        label-width="120px"
        size="mini"
        label-position="left"
        class="submit-form"
    >
    <el-row>
        <el-form-item label="方案名称" prop="name" :rules="rules.name">
            <el-input v-model.trim="form.name"></el-input>
        </el-form-item>
    </el-row>
    <el-row v-for="(item,key) in formItems"
            :key="key">
        <el-form-item :label="item.label" v-if="!item.hidden">
            <!--符号选择器-->
                <glSelect
                    v-model="form[`${key}Sign`]"
                    clearable
                    collapse-tags
                    itemValueKey="value"
                    itemNameKey="text"
                    :list="charSelectList(item.type,item.signType)"
                ></glSelect>
        </el-form-item>
        <el-form-item class="input-form-item"
                     :prop="`${key}Value`"
                     v-if="!item.type || item.type=='input'"
                     :rules="[
                        { min: 0, max: 50, message: `${item.label}超长，最多50个字，请修改`, trigger: 'blur' }
                     ]">
                <!--值选择器-->
                      <el-input v-model.trim="form[`${key}Value`]"
                          v-bind="$childAttr(item,key)"
                          v-on="$childListeners(item)"
                        >
                    </el-input>
       </el-form-item>
        <el-form-item v-if="item.type=='select'">
                <glSelect
                    v-model="form[`${key}Value`]"
                    clearable
                    collapse-tags
                    v-bind="$childAttr(item,key)"
                    v-on="$childListeners(item)"
                    autoGetApiData
                    filterable
                    :isAutoWidth="false"
                    :list="getSelectData(item,key)"
                    @getApiData="($event) => {selectDataFn({$event, type: key, detail:item})}"
                    @change="(val)=>selectChange(val,item,key)"
                ></glSelect>
        </el-form-item>
         <el-form-item v-if="item.type=='date'">
                    <!-- <glDatePicker
                        type="daterange"
                        v-model="form[`${key}Value`]"
                        value-format="yyyy-MM-dd"
                        :picker-options="pickerOptions"
                        @change="(val)=>formatDateRange(val,`${key}Start`,`${key}End`)"
                    ></glDatePicker> -->
                    <glSelect
                        v-model="form[`${key}Value`]"
                            clearable
                            collapse-tags
                            filterable
                            itemValueKey="dataCode"
                            itemNameKey="dataName"
                            :list="selectList['SD_SELECT_PLAN_TIME']"
                    ></glSelect>
         </el-form-item>
    </el-row>
        <div class="footer">
            <el-button @click="cancel" size="mini">取消</el-button>
            <gl-button @click="(next) => sure(next)" size="mini" isPrevent type="primary">确定</gl-button>
        </div>
    </glForm>
</template>

<script>
import glForm from '@/components/page/Common_WEB/GlCommon/Components/GlForm'
import glButton from '@/components/page/Common_WEB/GlCommon/Components/GlButton'
import glSelect from "@/components/page/Common_WEB/GlCommon/Components/GlSelect";
import glDatePicker from "@/components/page/Common_WEB/GlCommon/Components/GlDatePicker";
import searchForm from './searchForm.js';
import _ from 'lodash';
export default {
    name: "submitInstructions",
    components: { glForm,
                glButton,
                glSelect,
                glDatePicker},
    mixins: [searchForm],
    props: {
        componentConfig: {
            type: Object,
            default: () => {
                return {
                }
            }
        }
    },
    data() {
        return {
            formData: null,
            formItems: {},
            rules: {
                name: [
                    { required: true, message: '请输入查询方案名称', trigger: 'blur' },
                    { min: 1, max: 20, message: '方案名称超长，最多20个字，请修改', trigger: 'blur' }],
            },
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit('pick', [start, end]);
                    }
                }]
            },
            //下拉框数据
            selectData: {
                transCodeList: [],
            },
            //表单数据
            form: {
                name: '',
            },
            selectList:{},
            //简化版的标识符号
            normalCharts: [{
                value: '0',
                text: '等于',
            },{
                value: '5',
                text:　'包含',
            },{
                value: '6',
                text:　'不包含',
            }
            ],
            //全部的标识符号
            plusCharts: [
                {
                value: '0',
                text: '等于',
            }],
        }
    },

    mounted() {
        this.caseDictionaryFn();
    },
    computed: {
        $childAttr(item,key) {
            return function(item,key) {
                const keys = ['idEmpPRepared', 'idEmpSign', 'idEmpPreparedList', 'idEmpSignList'];
                let inputConfig  =  _.get(item, 'inputConfig', {});
                //人员统一配置
                if(keys.includes(key)) {
                    inputConfig.modelType = 'table';
                    inputConfig.tableConfig = {
                            columnJson: [
                                {
                                    label: '编码',
                                    prop: 'code',
                                    wflex: 1,
                                }, {
                                    label: '人员名称',
                                    prop: 'label',
                                    wflex: 1,
                                }]
                    }
                }
                return inputConfig;
            }
        },
        $childListeners() {
             return function(item) {
                return _.get(item, 'inputConfig', {});
            }
        },
    },
    watch: {
        componentConfig:{
            deep: true,
            handler(val) {
                //第一层元素合并，第二层元素同时有的进行合并
                let commonItems = _.cloneDeep(_.get(val,'data.commonItems',{}));
                for(let item in commonItems) {
                    if(!item.hidden) {
                        //设置表单input值
                        this.$set(this.form,`${item}Sign`,'0');
                        this.$set(this.form,`${item}Value`,'');
                        //设置下拉框数据的值
                        if(commonItems[item].type == 'select') {
                        this.$set(this.selectData, `${item}List`, []);
                        }
                        //设置日期数据的值
                        if(commonItems[item].type == 'date') {
                            this.$set(this.form,`${item}Start`,'');
                            this.$set(this.form,`${item}End`,'');
                        }
                    }
                }
                let formData = _.get(val,'data.param',{});
                if(formData) {
                    this.formData = formData;
                    //方案名称
                    this.form.name = formData.planName;
                    //编辑进行赋值操作
                    if(formData.planDetail) {
                        this.$nextTick(() => {
                            this.strTransObj(formData.planDetail);
                        })
                    }
                }
                this.formItems = commonItems;
            },
        },
    },
    methods: {
        charSelectList(type,signType) {
           if(type == 'date' || signType == 'boolean') {
               return this.plusCharts;
           }else {
               return this.normalCharts;
           }
        },
        getSelectData(data,key) {
            if(_.get(data, 'inputConfig.list')) {
                return _.get(data, 'inputConfig.list',[])
            }else {
                return this.selectData[`${key}List`];
            }
        },
        strTransObj(remark) {
            let dataArray = remark.split('&');
            let formObj = {};
            for(let i = 0; i <　dataArray.length; i++) {
                let itemArray = dataArray[i].split('_');
                //项目
                let label = _.get(itemArray,'0','');
                if(!label) { continue };
                //符号
                let sign = _.get(itemArray,'1','0');
                //值
                let value = _.get(itemArray,'2','');
                let type = _.get(itemArray,'3','');

                switch(type) {
                    case 'date':
                        // if(label.endWith('Start')) {
                        //      label = label.substr(0,label.length-5);
                        //     formObj[`${label}Sign`] = sign;
                        //     if(!formObj[`${label}Value`]) formObj[`${label}Value`] = [];
                        //     formObj[`${label}Value`].push(value);
                        //     this.form[`${label}`] = value;
                        // }
                        // if(label.endWith('End')) {
                        //     //结束时间
                        //     label = label.substr(0,label.length-3);
                        //     formObj[`${label}Sign`] = sign;
                        //     if(!formObj[`${label}Value`]) formObj[`${label}Value`] = [];
                        //     formObj[`${label}Value`].push(value);
                        //     this.form[`${label}`] = value;
                        // }
                        formObj[`${label}Sign`] = sign;
                        formObj[`${label}Value`] = value;
                        break;
                    case 'input':
                        formObj[`${label}Sign`] = sign;
                        formObj[`${label}Value`] = value;
                        break;
                    case 'select':
                        formObj[`${label}Sign`] = sign;
                        if(value) {
                            let valueArr = value.split(',');
                            if(label == 'isReturn') {
                                let  newValueList = valueArr.map((item,index) => {
                                    return Number(item);
                                })
                                formObj[`${label}Value`] =  newValueList;
                            }else {
                                formObj[`${label}Value`] =  valueArr;
                            }
                        }else {
                            formObj[`${label}Value`] = [];
                        }
                        break;
                }

            }
            this.form = Object.assign(this.form, formObj);
            console.log(this.form);
        },
    }
}
</script>

<style lang="scss" scoped>
    .submit-form{
        /deep/ .el-form-item{
            // width: 100%;
        }
        /deep/ .el-form-item__content{
            // width: calc(100% - 130px);

            > .el-input {
                // width:35%;
            }

            > div {
                margin-right:30px;
            }
        }
        .footer{
            display: flex;
            justify-content: flex-end;
        }

        .input-form-item {
            width:40%;

            /deep/ .el-form-item__content {
                width:100%;
            }
        }
    }
</style>
