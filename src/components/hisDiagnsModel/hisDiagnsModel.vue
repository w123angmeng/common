<template>
    <div class='HisDiagnsModels' :class="{isFromLeaveHeight: !isFromLeave}">
        <div class="hisDiagnsModelWrap">
             <el-form ref="diagnosForm" :model="diagnosForm" label-width="75px">
                <div v-for="(daItem, daIndex) in diagnosForm.ciDiagnosisRecordsList" :key="daIndex" class="diagnosFormContent">
                    <el-form-item 
                        v-if="!isFromLeave"
                        label="诊断类别:" 
                        :prop="'ciDiagnosisRecordsList.' + daIndex + '.sdDiagnosisType'" 
                        :rules="rules.sdDiagnosisType"
                        class="sdDiagnosisType">
                        <el-select class="item" v-model="daItem.sdDiagnosisType" placeholder="诊断类别" @change="changeSdDiagnosisType(daItem, daIndex)">
                            <el-option 
                                v-for="itm in diagTypelist" 
                                :key="itm.diagnosisTypeCode"
                                :label="itm.diagnosisTypeName" 
                                :value="itm.diagnosisTypeCode">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label-width="20px">
                        <el-radio-group class="common_radio_group" v-model="daItem.daType" size="small" @change="changeDaType(daItem, daIndex)">
                            <el-radio-button :disabled="!isAtmeng" label="2">西医</el-radio-button>
                            <el-radio-button :disabled="!isAtmeng" label="1">中医</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item 
                        label="诊断名称:" 
                        label-width="85px"
                        :prop="'ciDiagnosisRecordsList.' + daIndex + '.diagnosisName'" 
                        :rules="rules.diagnosisName"
                        class="diagnosisnamess">
                        <el-select 
                            v-model="daItem.diagnosisName" 
                            filterable 
                            remote 
                            reserve-keyword
                            :ref="'diagnosisName'+ daIndex"
                            :remote-method="(query) =>{remoteDians(query, daItem, daIndex)}" 
                            @focus="() =>{remoteDians('', daItem, daIndex)}" 
                            placeholder=""
                            @change="changeLDians(daItem, daIndex)">
                            <el-option 
                                v-for='(item,index) in searchDiagnsList' 
                                :label="item.diagnosisName"
                                :value="item.diagnosisName" 
                                :key='index'>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item 
                        label="诊断描述" 
                        label-width="80px"
                        :prop="'ciDiagnosisRecordsList.' + daIndex + '.supplement'">
                        <el-input
                            class="supplement"
                            placeholder="诊断描述" 
                            v-model.trim="daItem.supplement">
                        </el-input>
                    </el-form-item>
                    <el-form-item labelWidth="18px" class="dator" v-if="!isFromLeave">
                        <el-checkbox 
                            v-model="daItem.dator"
                            @change="changeDistor(daItem)">
                            待查
                        </el-checkbox>
                    </el-form-item>
                    <el-form-item 
                        label="入院病情:"
                        label-width="85px" 
                        :prop="'ciDiagnosisRecordsList.' + daIndex + '.sdHpmrAdminCondition'" 
                        :rules="rules.sdHpmrAdminCondition"
                        class="sdDislvlInpss">
                        <el-select 
                            v-model="daItem.sdHpmrAdminCondition"
                            class="sdDislvlInp"
                            placeholder="">
                            <el-option 
                                v-for="(item, index) in hosIllnessList" 
                                :key="'item.dataCode' + index" 
                                :label="item.dataName"
                                :value="item.dataCode">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item 
                        label="出院病情:" 
                        label-width="85px" 
                         class="sdDislvlInpss"
                        :prop="'ciDiagnosisRecordsList.' + daIndex + '.sdHpmrDischargeStatus'" 
                        :rules="rules.sdHpmrDischargeStatus">
                        <el-select 
                            v-model="daItem.sdHpmrDischargeStatus" 
                            class="sdDislvlInp"
                            placeholder="">
                            <el-option 
                                v-for="(item, index) in cursdHpmrDischargeStatusList" 
                                :key="'item.dataCode' + index" 
                                :label="item.dataName"
                                :value="item.dataCode">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label-width="10px">
                        <span class="groupBtnCiDiagn">
                            <el-button 
                                type="text" 
                                class="ciDiagnBtn" 
                                :disabled="daIndex === 0 ? true : false">
                                <img 
                                    src="@/assets/images/outpDoctor/outp_up.svg" 
                                    alt="" 
                                    style="width:9px;"
                                    @click="upDiag(daIndex, daItem)">
                            </el-button>
                            <el-button 
                                type="text" 
                                class="ciDiagnBtn"
                                :disabled="daIndex === diagnosForm.ciDiagnosisRecordsList.length - 1 ? true : false">
                                <img 
                                    src="@/assets/images/outpDoctor/outp_down.svg" 
                                    alt="" 
                                    style="width:9px;"
                                    @click="downDiag(daIndex, daItem)">
                            </el-button>
                            <el-button 
                                type="text" 
                                class="ciDelBtn"
                                v-show="diagnosForm.ciDiagnosisRecordsList.length != 1">
                                <img 
                                    src="@/assets/images/doctws/doctw_delete.svg"  
                                    alt="" 
                                    style="width:18px;"
                                    @click="deleteDiagnosis(daIndex)">
                            </el-button>
                            <el-button type="text" class="ciAddBtn">
                                <img 
                                   src="@/assets/images/doctws/doctw_add.svg"
                                    alt="" 
                                    style="width:18px;"
                                    @click="addBtnDiagnosis">
                            </el-button>
                        </span>
                    </el-form-item>
                </div>
             </el-form>
        </div>
         <div class="hisDiagnsModelBtns" v-if="!isFromLeave">
            <!-- 通用按钮 -->
            <template v-if="!nursingDocFlag">
                <el-button @click="cancelDiagns">取 消</el-button>
                <el-button type="primary" @click="submitDiagnsForm('diagnosForm')" :loading="saveloading" :disabled="saveloading">确 定</el-button>
            </template>

            <!-- 护理文书按钮 --> 
            <template v-else>
                <el-button @click="submitQuote">引 用</el-button>
                <el-button @click="submitDiagnsForm('diagnosForm')" :loading="saveloading" :disabled="saveloading">确 定</el-button>
                <el-button type="primary" :disabled="multipleSelection.length < 1 || saveAndQuoteFlag ? true : false" :loading="saveAndQuoteFlag" @click="submitDiagnsForm('diagnosForm',true)">确定并引用</el-button>
            </template>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import { mixinSaveLoading } from "@/components/page/Common_WEB/mixins/mixinSaveLoading";

    const DAHER_TYPE = '1';   //中医诊断
    const DADRUG_TYPE = '2';  //西医诊断
    const FIRST_VISIT_TYPE = '2';  //入院初诊
    const OUT_VISIT_TYPE = '3';    //出院诊断
    const DEATH_FLAG =  '4';

    export default {
        props: {
            diagnosComParmas: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            nursingDocFlag: {
                type: Boolean,
                default: false
            }
        },
        mixins: [mixinSaveLoading],
        data() {
            let checkType = (rule, value, callback) => {
                if (!value) {
                    // callback(new Error('请输入诊断类别！'));
                }
                callback()
            };
            let checkName = (rule, value, callback) => {
                if (!value) {
                    // callback(new Error('请输入诊断名称！'));
                }
                callback()
            };
            let nameDiagnosis = (rule, value, callback) => {
                let arr = rule.fullField.split('.');
                let dom = this.diagnosForm.ciDiagnosisRecordsList[arr[1]];
                if (!value) {
                    if(this.isFromLeave && dom.diagnosisName)  return callback(new Error('必填项不能为空！'));
                   
                }
                callback()
            };
            return {

                 // 诊断组件所需数据
                currentInpViewDiagnosisTypeArr: [],
               
                diagnosForm: {
                    ciDiagnosisRecordsList: [
                      {
                        dator: false,
                        showImg: false,
                        supplement: "",
                        diagnosisName: "",
                        sdDiagnosisType: "", //诊断类型
                        sdDiagnosisTypeStr: "", //诊断类型中文
                        diagnosisExaminedIndicator: 0,
                        idDiagnosisRecord: "", //诊断记录id
                        isDiagnFlag: true,
                        sdHpmrAdminCondition: '',       //入院病情
                        sdHpmrDischargeStatus: '',            //出院病情 
                        }
                    ],
                    diagDic: [], //诊断字典数组集合
                    diasNames: [], //诊断名称集合
                    idDiagnosisClassPat: "", //诊断疾病分类id
                    specialDiseasePat: false, //特病标识
                },
                searchDiagnsList: [],  //诊断下拉列表数据

                diagTypelist: [],
                rules: {
                    sdDiagnosisType: [{
                        required: false,
                        validator: checkType,
                        trigger: "change"
                    }],
                    diagnosisName: [{
                        required: false,
                        validator: checkName,
                        trigger: "change"
                    }],
                    sdHpmrAdminCondition: [{ required: false,  validator: nameDiagnosis, trigger: "change" }],
                    sdHpmrDischargeStatus: [{ required: false,  validator: nameDiagnosis, trigger: "change" }],
                }, //校验规则
                multipleSelection: [],
                saveAndQuoteFlag: false,
                isBreakStatus: false,   //中断操作
                saveSendForm: {},  //保存数据
                hosIllnessList: [],  //入院病情列表
                cursdHpmrDischargeStatusList: [],   //出院病情列表
                deathPlaceList: [],  //死亡地点列表
                isFinalSaveDiagnsStatus: true,
            };
        },
        created() {
            this.getBasicDic();
            this.getCurrentInpViewDiagnosisType();
        },
        computed: {
            isAtmeng() {
                return this.$limits.isFun(this)
            },
            isFromLeave() {
                return this.diagnosComParmas.isFormLeave || false
            },
            firstDiagnsSystemType() {
                return DADRUG_TYPE   //默认是 西医
            },
            preDaSystemType() {
                let lg =  this.diagnosForm.ciDiagnosisRecordsList.length -1;
                return this.diagnosForm.ciDiagnosisRecordsList[lg].daType;
            },
            continuityDaSystemType() {
                return this.isBreakStatus ? this.firstDiagnsSystemType : this.preDaSystemType;
            },
            filterDiangsLg() {
                return this.diagnosForm.ciDiagnosisRecordsList.map( v => v.diagnosisName).filter(item => item)
            },
            filterSameDiangsLg() {
                let ar = [];
                this.diagnosForm.ciDiagnosisRecordsList.map( v =>{
                    if(v.sdDiagnosisType && v.diagnosisName) ar.push(v.sdDiagnosisType + v.diagnosisName)
                })
                return  new Set( ar ).size !== ar.length
            },
            filterInpDiangsType() {
                let arr = this.saveSendForm.filter(v => v.sdDiagnosisType == FIRST_VISIT_TYPE)
                return arr.length
            },
        },
        methods: {
            ...mapMutations(["SET_ISHAVEINPDIANGSTYPE"]),

              //获取当前诊断类型下拉
            getCurrentInpViewDiagnosisType() {
                let Obj = {
                    systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                    paramTypeCode: 'Inp_View_Diagnosis_Type'
                }

                this.getDefaultValueBySystemParamCode(Obj).then((data)=> {
                    this.currentInpViewDiagnosisTypeArr = data || [];

                    this.initData();
    
                })
            },

               //获取基础字典
            getBasicDic() {
                let str = 'SD_HPMR_ADMIN_CONDITION,SD_HPMR_DISCHARGE_STATUS, SD_HPMR_DEATH_PLACE';
                this.findSdData(str).then(data => {
                    this.hosIllnessList = data.SD_HPMR_ADMIN_CONDITION;    //入院病情列表
                    this.cursdHpmrDischargeStatusList = data.SD_HPMR_DISCHARGE_STATUS;    //出院病情列表
                    this.deathPlaceList = data.SD_HPMR_DEATH_PLACE;    //死亡地点列表
                });
            },

            //初始数据
            initData() {
                this.isBreakStatus = false;
                this.getDiagTypeData();
                this.judgeSpecialByIdPat();  //判断患者是否有备案
                this.getDiaData();   //反显诊断数据
            },

            //判断患者是否有备案
            judgeSpecialByIdPat() {

                this.$axios.post( window.globalUrl.diagnosisWebUrl + "reg/special/findByIdPat", {
                    idPat: this.diagnosComParmas.idPat,
                }).then(res => {
                    if (res.success) {
                        if (res.data.valid) {
                            this.diagnosForm.specialDiseasePat = res.data.valid; //特病标识
                            this.diagnosForm.idDiagnosisClassPat = res.data.sdSpecialDisease; //病种编码
                        } else {
                            this.diagnosForm.specialDiseasePat = false; //特病标识
                            this.diagnosForm.idDiagnosisClassPat = ''; //病种编码
                        }
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            //诊断回显数据
            getDiaData() {
                this.$axios.post( window.globalUrl.diagnosisWebUrl + 'doctws/ciDiaRecord/listDiaRecords', {
                        idVisit: this.diagnosComParmas.idVisit,
                    }).then(res => {
                        if (res.success) {
                            let arr = res.data || [];
                            let newArr = [];
                            arr.map( v => {

                                if(!this.currentInpViewDiagnosisTypeArr.includes(v.sdDiagnosisType)) return
                                if(this.isFromLeave && v.sdDiagnosisType !== OUT_VISIT_TYPE) return  //出院通知诊断
                                newArr.push(v)
                            })

                            this.handleriDiagnosisEvent(newArr)
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning'
                            })
                        }
                    })
            },

            handleriDiagnosisEvent(list = []) {
                this.diagnosForm.diagDic = []; //保存对比诊断字典列表
                // 缓存保存诊断反显数据
                if (list.length == 0) {
                    // 默认取诊断类型的第一条
                   
                    this.diagnosForm.ciDiagnosisRecordsList = [{
                        dator: false,
                        showImg: false,
                        supplement: "",
                        diagnosisName: "",
                        sdDiagnosisType: this.isFromLeave ? OUT_VISIT_TYPE : '', //诊断类型
                        sdDiagnosisTypeStr: '', //诊断类型中文
                        diagnosisExaminedIndicator: 0,
                        idDiagnosisRecord: "", //诊断记录id
                        isDiagnFlag: true,
                        daType: this.firstDiagnsSystemType,   //默认诊断类型
                        sdHpmrAdminCondition: '',       //入院病情
                        sdHpmrDischargeStatus: '',            //出院病情 
                    }]

                } else {
                    this.diagnosForm.ciDiagnosisRecordsList = [];
                    list.map((v, i) => {

                        if(!this.isFromLeave && !this.currentInpViewDiagnosisTypeArr.includes(v.sdDiagnosisType)) return

                        if(this.isFromLeave && v.sdDiagnosisType !== OUT_VISIT_TYPE) return  //出院通知诊断

                        var falg = v.diagnosisExaminedIndicator ? Number(v.diagnosisExaminedIndicator) : 0;

                        //判断诊断是否在诊断字典
                        if (v.idDiagnosis) {
                            v.isDiagnFlag = true; //诊断列表
                            this.diagnosForm.diagDic.push(v); //保存对比诊断字典列表
                        } else {
                            v.isDiagnFlag = false; //非诊断列表
                        }

                        // 特病是否展示  疾病分类 + 患者特病标识 true  + 患者诊断特病病种 编码一致
                        if (v.sdDiagnosisClassType == this.CONSTANT.OUTP_SPECIAL_TYPE && this
                            .isSpecialDiseasePat === true && this.sdSpecialDiseasePat == v.diagnosisClassCode) {
                            v.showImg = true;
                        } else {
                            v.showImg = false;
                        }
                        v.dator = falg ? true : false;

                        this.diagnosForm.ciDiagnosisRecordsList.push({
                            dator: v.dator,
                            supplement: v.supplement || '',
                            diagnosisName: v.diagnosisName || '',
                            diagnosisExaminedIndicator: falg,
                            idDiagnosis: v.idDiagnosis,
                            sdDiagnosisType: v.sdDiagnosisType, //诊断类型
                            sdDiagnosisTypeStr: v.sdDiagnosisTypeStr, //诊断类型中文
                            diagnosisStdCode: v.diagnosisStdCode, //标准编码
                            showImg: v.showImg,
                            idDiagnosisRecord: v.idDiagnosisRecord, //诊断记录id
                            isDiagnFlag: v.isDiagnFlag,
                            daType: v.euDiagnosisSystem || DADRUG_TYPE,   //诊断类型 中医或者西医
                            sdHpmrAdminCondition: v.sdHpmrAdminCondition,
                            sdHpmrDischargeStatus: v.sdHpmrDischargeStatus,

                        })
                    })
                }
            },


            //切换分类
            changeSdDiagnosisType(item, index){
                this.diagTypelist.map(v => {
                    if(item.sdDiagnosisType == v.diagnosisTypeCode) {
                        item.sdDiagnosisTypeStr = v.diagnosisTypeName;
                    }
                })
            },

              //切换诊断类型
            changeDaType(item, index) {
                let Row = this.diagnosForm.ciDiagnosisRecordsList[index];
                 
                Row.diagnosisName = '';       //诊断名称
                Row.dator = false;            //是否待查 前端展示
                Row.supplement = '';          //备注
                Row.showImg = false;          //展示特病
                Row.idDiagnosisRecord = '';   //诊断记录id
                Row.isDiagnFlag = true;
                Row.diagnosisExaminedIndicator = 0; //是否待查 后端数据
            },

            //切换待查
            changeDistor(itm) {
                itm.diagnosisExaminedIndicator = itm.dator ? 1 : 0;
            },

             //切换入/出院病情
            changeSdHpmrDischarge(arr, item, index, code,  name) {
                
                arr.map(v => {
                    if (v.dataCode == item[code]) {
                        this.diagnosForm.ciDiagnosisRecordsList[index][name] = v.dataName; 
                    }
                })
            },

            //切换诊断名称
            changeDataList(itm) {},

            //获取诊断类别数据
            getDiagTypeData() {
                let Obj= {
                    diagnosisTypeCode: "",
                    diagnosisTypeName: "",
                    enabled: 1,
                }
                // 门诊诊断类别
                if(this.diagnosComParmas.flag == '门诊诊断') {
                    Obj.visitOpIndicator = 1
                }else {
                    Obj.visitIpIndicator = 1
                }
                this.$axios.post(window.globalUrl.diagnosisWebUrl + "dict/diagType/findList", Obj).then(res => {
                    if (res.success) {
                        let arr = res.data || [];
                        
                        this.diagTypelist = arr.filter( v => this.currentInpViewDiagnosisTypeArr.includes(v.diagnosisTypeCode))

                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            // 查看诊断字典下拉
            getDiagNameList(name = '',type, isOnline) {
                this.searchDiagnsList = [];
                return this.querySearchDiaByName(name, type, isOnline).then((data)=> {
                    let arr = data || [];
                    this.searchDiagnsList = this.copyObject(arr);
                    return arr;
                })
            },

            // 查看出院诊断字典下拉
            getLeaveDiagNameList(name = '',type, isOnline) {
                this.searchDiagnsList = [];
                let params = {
                    diagnosisName: name,
                    isOnline: isOnline,
                    euDiagnosisSystem: type,
                    approvedIndicator: 1
                }
                return this.$axios.post('/dict/diag/findListByNameForDischarge', params).then(res => {
                    if (res.success) {
                        
                        let arr = res.data || [];
                        this.searchDiagnsList = this.copyObject(arr);
                        return arr;

                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            remoteDians(query = '', item, index) {
                let euDiagnosisSystem = !this.isAtmeng ? '' : item.daType;

                let queryStr = query ? query : item.diagnosisName 
                if(queryStr == '') return this.searchDiagnsList = [];

                if(item.sdDiagnosisType === OUT_VISIT_TYPE) {
                    this.getLeaveDiagNameList(queryStr, euDiagnosisSystem,  '').then(data => {
                        this.searchDiagnsList = data;
                    })
                } else {
                    this.getDiagNameList(queryStr, euDiagnosisSystem,  '').then(data => {
                        this.searchDiagnsList = data;
                    })
                }
            },

            changeLDians(item, index) {
                let Row =  this.diagnosForm.ciDiagnosisRecordsList[index];
                this.searchDiagnsList.map( v => {
                    if(v.diagnosisName === item.diagnosisName) {
                        this.diagnosForm.diagDic.push(v);
                        Row.isDiagnFlag = true;
                        Row.diagnosisStdCode =  v.diagnosisStdCode; //iCD 10 具体编码
                        Row.diagnosisCode =  v.diagnosisCode; //iCD 10 具体编码
                    }
                })
            },

            //添加诊断
            addBtnDiagnosis() {
                let list = this.diagnosForm.ciDiagnosisRecordsList;
                let len = list.length;
                let obj = {
                    sdDiagnosisType: this.isFromLeave ? OUT_VISIT_TYPE : '',   //诊断类型
                    sdDiagnosisTypeStr: '',//诊断类型中文
                    diagnosisName: "",     //诊断名称
                    diagnosisExaminedIndicator: 0, //是否待查 后端数据
                    dator: false,          //是否待查 前端展示
                    supplement: "",        //备注
                    showImg: false,        //展示特病
                    idDiagnosisRecord: '', //诊断记录id
                    daType: this.continuityDaSystemType,   //诊断类型，默认西医
                    sdHpmrAdminCondition: '',       //入院病情
                    sdHpmrDischargeStatus: '',            //出院病情 
                }
                // 连续录入时，自动带入下一个诊断类型
                if(len >= 1){
                    let type = list[len-1].sdDiagnosisType;
                    obj.sdDiagnosisType = type;
                }
                this.diagnosForm.ciDiagnosisRecordsList.push(obj);

                this.isBreakStatus = false;
                // 滚动条置底
                //光标定位到诊断最后一行 input
                this.$nextTick(()=> {
                    let endRef = 'diagnosisName' + (this.diagnosForm.ciDiagnosisRecordsList.length -1);
                    this.$refs[endRef][0].focus();
                })
           
                //默认到底部 
                this.$nextTick(()=> {
                    let doms = document.querySelector('.hisDiagnsModelWrap');
                    doms.scrollTop = doms.scrollHeight;
                })
              
            },

            //删除诊断
            deleteDiagnosis(index) {
                this.diagnosForm.ciDiagnosisRecordsList.splice(index, 1);
            },

            //上移诊断
            upDiag(index, row) {
                if (index === 0) return
                this.diagnosForm.ciDiagnosisRecordsList.splice(index - 1, 0, row);
                this.diagnosForm.ciDiagnosisRecordsList.splice(index + 1, 1);
            },

            //下移诊断
            downDiag(index, row) {
                if (index === this.diagnosForm.ciDiagnosisRecordsList.length - 1) return
                this.diagnosForm.ciDiagnosisRecordsList.splice(index + 2, 0, row)
                this.diagnosForm.ciDiagnosisRecordsList.splice(index, 1)
            },

            //取消保存
            cancelDiagns() {
                this.$emit('cancelDiagnsEvent')
            },


            //拦截重复诊断
            preRepeatDiagns() {
                let diangsNameArr = []; //诊断名称集合
                this.diagnosForm.ciDiagnosisRecordsList.map(v => {
                    if (v.diagnosisName.trim()) diangsNameArr.push(v.diagnosisName.trim());
                })

                let ciDiagStatus = false;
                let diangsNameArr1 = diangsNameArr.sort(); //数组排序
                diangsNameArr1.map((v, i) => {
                    if (diangsNameArr1[i] == diangsNameArr1[i + 1]) {
                        return ciDiagStatus = true;
                    }
                })
                if (ciDiagStatus) {
                    this.$message({
                        message: "不能有重复诊断，请重新填写",
                        type: "warning"
                    });
                }
                return ciDiagStatus
            },

            //拦截重复特病诊断
            preRepeatSpecDiagns() {
                let specDiangsFlag = 0; //重复诊断名称集合
                let specDiangStatus = false;
                this.diagnosForm.ciDiagnosisRecordsList.map(v => {
                    if (v.showImg) specDiangsFlag++;
                })

                if (specDiangsFlag > 1) {
                    specDiangStatus = true;
                    this.$message({
                        message: "只能录入一条特病诊断，请重新填写",
                        type: "warning"
                    });
                } else {
                    specDiangStatus = false;
                }
                return specDiangStatus
            },

            //诊断保存数据
            handerDiagnsData(newSetDic) {
                 let userInfo = this.getUserStorage();

                let diangs = [];
                this.diagnosForm.ciDiagnosisRecordsList.map((v, i) => {
                    if(!v.diagnosisName.trim()) return 
                    //诊断名称在诊断列表字典
                    if (v.isDiagnFlag === true) {
                        newSetDic.map((itm, idx) => {
                            if (v.diagnosisName.trim() == itm.diagnosisName.trim()) {
                                diangs.push({
                                    serialNo: i + 1,
                                    approvedIndicator: 1, //标准化标志 0为非标准化，1为标准化
                                    idPat: this.diagnosComParmas.idPat,
                                    idVisit: this.diagnosComParmas.idVisit,
                                    diagnosisName: v.diagnosisName.trim(), //诊断名称  row
                                    idDeptCreate: userInfo.idDept,
                                    sdVisitType: this.diagnosComParmas.sdVisitType,
                                    diagnosisExaminedIndicator: v.diagnosisExaminedIndicator, //诊断待查标志 0为非待查，1为待查   row
                                    supplement: v.supplement, //补充说明   row
                                    idDiagnosis: itm.idDiagnosis, //诊断id
                                    diagnosisCode: itm.diagnosisCode, //诊断编码  
                                    sdDiagnosisType: v.sdDiagnosisType, //诊断类型  row
                                    diagnosisStdCode: '', //诊断标准编码    //目前传空
                                    idDiagnosisClass: itm.idDiagnosisClass, //疾病诊断基本分类主键ID
                                    euDiagnosisSystem: itm.euDiagnosisSystem, //诊断体系 1-中医 2-西医
                                    diagnosisClassName: itm.diagnosisClassName, //疾病分类名称
                                    diagnosisClassCode: itm.diagnosisClassCode, //疾病分类编码
                                    sdDiagnosisSystemType: itm.sdDiagnosisSystemType, //ICD10...  row
                                    sdDiagnosisClassType: itm.sdDiagnosisClassType, //疾病分类 1-大病 2-传染病 3-特病
                                    idDiagnosisRecord: v.idDiagnosisRecord, //诊断记录id
                                    sdHpmrAdminCondition: v.sdHpmrAdminCondition,
                                    sdHpmrDischargeStatus: v.sdHpmrDischargeStatus,
                                })
                            }
                        })
                    } else {
                        // 非诊断列表字典
                        diangs.push({
                            serialNo: i + 1,
                            approvedIndicator: 0, //标准化标志 0为非标准化，1为标准化
                            idPat: this.diagnosComParmas.idPat,
                            supplement: v.supplement, //补充说明
                            idVisit: this.diagnosComParmas.idVisit,
                            diagnosisName: v.diagnosisName.trim(), //诊断名称
                            idDeptCreate: userInfo.idDept,
                            sdVisitType: this.diagnosComParmas.sdVisitType,
                            diagnosisExaminedIndicator: v.diagnosisExaminedIndicator, //诊断待查标志 0为非待查，1为待查

                            sdDiagnosisType: v.sdDiagnosisType, //诊断类型  row
                            //不在诊断标准字典中以下字段为空
                            idDiagnosis: '', //诊断id
                            diagnosisCode: '', //诊断编码
                            idDiagnosisClass: '', //疾病诊断基本分类主键ID
                            euDiagnosisSystem: v.daType, //诊断体系 1-中医 2-西医
                            diagnosisClassCode: '', //疾病分类编码
                            diagnosisClassName: '', //疾病分类名称
                            sdDiagnosisClassType: '', //疾病分类 1-大病 2-传染病 3-特病
                            sdDiagnosisSystemType: '', //ICD10...  row
                            diagnosisStdCode: '', //诊断标准编码 ... row 
                            idDiagnosisRecord: v.idDiagnosisRecord, //诊断记录id
                            sdHpmrAdminCondition: v.sdHpmrAdminCondition,
                            sdHpmrDischargeStatus: v.sdHpmrDischargeStatus,
                        })
                    }
                })

                return diangs
            },

            finalSaveDiagns() {
                
                //拦截诊断为空
                if(!this.filterDiangsLg.length) {
                    this.isFinalSaveDiagnsStatus = false;
                    return this.$message.warning('请录入一条诊断！')
                }

                //拦截重复特病诊断  
                let isSpecRepeat = this.preRepeatSpecDiagns();
                if (isSpecRepeat) return this.isFinalSaveDiagnsStatus = false;

                //保存对比诊断字典去重
                let newSetDic = [];
                let nameArr = [];
                this.diagnosForm.diagDic.map(v => {
                    if (!nameArr.includes(v.diagnosisName.trim())) {
                        nameArr.push(v.diagnosisName.trim());
                        newSetDic.push(v);
                    }
                })

                let sendForm = this.handerDiagnsData(newSetDic);
                this.saveSendForm = this.copyObject(sendForm);

                //出院通知不走这个校验
                if(!this.filterInpDiangsType && !this.isFromLeave) {
                    this.isFinalSaveDiagnsStatus = false;
                    return this.$message.warning('请录入入院初诊诊断！')
                }

                if(this.filterSameDiangsLg) {
                    this.isFinalSaveDiagnsStatus = false;
                    return this.$message.warning('诊断重复录入，请核对！')
                }
            },

            leaveSubmitDiagnsForm(){
                this.$refs['diagnosForm'].validate(valid => {
                    if (valid) {

                        this.isFinalSaveDiagnsStatus = true;

                        this.finalSaveDiagns();

                        if(!this.isFinalSaveDiagnsStatus) return false
      
                    } else {
                        this.isFinalSaveDiagnsStatus = false;
                        console.log("error submit!!");
                        return false
                    }
                });
            },

            //诊断保存
            submitDiagnsForm(formName, quoteFlag = false) {
                 this.$refs[formName].validate(valid => {
                    if (valid) {

                        this.isFinalSaveDiagnsStatus = true;

                        this.finalSaveDiagns();

                        if(!this.isFinalSaveDiagnsStatus) return

                        if(!quoteFlag) {
                            this.saveloading = true 
                        } else {
                            this.saveAndQuoteFlag = true
                        }

                        this.$axios._post(window.globalUrl.diagnosisWebUrl + "doctws/ciDiaRecord/saveDiaRecords",this.saveSendForm)
                            .then(res => {

                            if(this.filterInpDiangsType)  this.SET_ISHAVEINPDIANGSTYPE(true)   //入院初诊
                            
                            this.saveloading = false
                            this.saveAndQuoteFlag = false
                            if (res.success) {
                                this.isBreakStatus = true;
                                this.getDiaData();  //反显诊断数据
                                this.$emit('submitDocDiagnsForm', this.saveSendForm);
                                // 处理护理文书 保存并提交
                                if(quoteFlag) this.$emit('submitQuote', this.multipleSelection);
                            } else {
                                this.$message({
                                    message: res.message,
                                    type: "warning"
                                });
                            }
                        });
                    } else {
                        console.log("error submit!!");
                        this.saveloading = false
                        this.saveAndQuoteFlag = false
                        return false
                    }
                });
            },


            //鼠标悬浮显示文字
            showTitle(str, num) {
                if(str && str.length > num) {
                   return str
                }
                return ''
            },

            // 多选
            handleSelectionChange(val) {
                // 是否未保存
                // if(val.some(item => {
                //     if (!item.idDiagnosisRecord) this.$refs.hisDiagnsModel.toggleRowSelection(item);
                //     return !item.idDiagnosisRecord})) {
                //     this.$message({
                //         message: '请先保存该数据',
                //         type: "warning"
                //     });
                //     return false
                // }
                this.multipleSelection = val;
            },

            // 引用
            submitQuote() {
                if(this.multipleSelection.length == 0) {
                    this.$message({
                        message: '请先勾选要引用的内容',
                        type: "warning"
                    });
                    return false
                }
                if(this.multipleSelection.some(item => {
                    return !item.idDiagnosisRecord})) {
                    this.$message({
                        message: '有未保存数据，请先保存再引用',
                        type: "warning"
                    });
                    return false
                }
                this.$emit('submitQuote', this.multipleSelection);
            }
            
        },
        watch: {
            'diagnosForm.ciDiagnosisRecordsList': {
                 handler(newVal, oldVal) {
                    let arr = this.diagnosForm.ciDiagnosisRecordsList.filter(v => v.sdHpmrDischargeStatus == DEATH_FLAG)
                    this.$emit('isFilterDeathType', !!arr.length)
                },
                deep: true
            },
            'diagnosComParmas.changeSdHpmrDischargeStatus':{
                handler(val){ // 出院通知诊断 可修改出院病情状态
                    if(val && this.isFromLeave){
                        this.diagnosForm.ciDiagnosisRecordsList.forEach(v => {
                            if(v.sdHpmrDischargeStatus == DEATH_FLAG) v.sdHpmrDischargeStatus = ''
                        });
                    }
                }
            }
        }
    };

</script>

<style lang="scss" src="./hisDiagnsModel.scss"></style>
