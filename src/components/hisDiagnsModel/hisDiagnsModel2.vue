<template>
    <div class='HisDiagnsModel2'>
        <div>
            <el-form ref="diagnosForm" :model="diagnosForm" label-width="0px">
                <el-table :data="diagnosForm.ciDiagnosisRecordsList" max-height="250" style="width: 100%;" :header-cell-style="nursingDocFlag ? {} : tableTitleStyle"
                    :cell-style="cellStyle"
                    @selection-change="handleSelectionChange"
                    :border="nursingDocFlag ? true : false"
                    ref="hisDiagnsModel"
                    >
                    <el-table-column
                        type="selection"
                        width="55"
                        v-if="nursingDocFlag"
                        >
                    </el-table-column>
                    <el-table-column prop="sdDiagnosisType" label="诊断类别" align="left" width="140px">
                        <template slot-scope="scope">
                            <el-form-item :prop="'ciDiagnosisRecordsList.' + scope.$index + '.sdDiagnosisType'" :rules="rules.sdDiagnosisType"
                                class="sdDiagnosisType">
                                <el-select class="item" v-model="scope.row.sdDiagnosisType" placeholder="诊断类别" @change="changeSdDiagnosisType(scope.row, scope.$index)">
                                    <el-option 
                                        v-for=" itm in diagTypelist" 
                                        :key="itm.diagnosisTypeCode"
                                        :label="itm.diagnosisTypeName" 
                                        :value="itm.diagnosisTypeCode">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column prop="diagnosisName" label="诊断名称" align="left" width="260px">
                        <template slot-scope="scope">
                            <el-form-item :prop="'ciDiagnosisRecordsList.' + scope.$index + '.diagnosisName'" :rules="rules.diagnosisName" class="diagnosisname">
                                <el-autocomplete 
                                    class="inline-input" 
                                    placeholder="诊断名称" 
                                    v-model="scope.row.diagnosisName"
                                    :fetch-suggestions="findDiagnosisList" 
                                    @select="nameDocNumFocus"
                                    @focus="nameDocNumFocus(scope.row, scope.$index)" 
                                    @blur="blurDiagnosisEvent(scope.row, scope.$index)"
                                    :title="showTitle(scope.row.diagnosisName, 17)">
                                </el-autocomplete>
                                <img 
                                    v-show="scope.row.showImg" 
                                    class="specImgSvg" 
                                    src="@/assets/images/outpDoctor/outp_special.svg"
                                    alt="">
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column prop="diagnosisStdCode" label="icd编码" align="left" width="130px">
                        <template slot-scope="scope">
                            <el-form-item labelWidth="0px" class="diagnosisStdCode" :prop="'ciDiagnosisRecordsList.' + scope.$index + '.diagnosisStdCode'">
                                <el-input 
                                    placeholder="icd编码" 
                                    readonly="readonly" 
                                    v-model.trim="scope.row.diagnosisStdCode">
                                </el-input>
                            </el-form-item>
                        </template>
                    </el-table-column> -->
                    <el-table-column prop="dator" label="是否待查" align="left" width="80px">
                        <template slot-scope="scope">
                            <el-form-item labelWidth="27px" class="dator">
                                <input 
                                    type="checkbox" 
                                    style="-webkit-appearance: checkbox;"
                                    v-model="scope.row.dator" 
                                    @change="changeDistor(scope.row)" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column prop="supplement" label="备注" align="left" width="180px">
                        <template slot-scope="scope">
                            <el-form-item :prop="'ciDiagnosisRecordsList.' + scope.$index + '.supplement'">
                                <el-input
                                    class="supplement"
                                    placeholder="备注" 
                                    v-model.trim="scope.row.supplement"
                                    :title="showTitle(scope.row.supplement, 8)">
                                </el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column  label="" align="left" width="95px">
                        <template slot-scope="scope">
                            <span class="groupBtnCiDiagn">
                                <el-button 
                                    type="text" 
                                    class="ciDiagnBtn" 
                                    :disabled="scope.$index === 0 ? true : false">
                                    <img 
                                        src="@/assets/images/outpDoctor/outp_up.svg" 
                                        alt="" 
                                        style="width:10px;"
                                        @click="upDiag(scope.$index, scope.row)">
                                </el-button>
                                <el-button 
                                    type="text" 
                                    class="ciDiagnBtn"
                                    :disabled="scope.$index === diagnosForm.ciDiagnosisRecordsList.length - 1 ? true : false">
                                    <img 
                                        src="@/assets/images/outpDoctor/outp_down.svg" 
                                        alt="" 
                                        style="width:10px;"
                                        @click="downDiag(scope.$index, scope.row)">
                                </el-button>
                                <el-button type="text" class="ciDiagnBtn">
                                    <img 
                                        src="@/assets/images/outpDoctor/outp_add.svg" 
                                        alt="" 
                                        style="width:16px;"
                                        @click="addBtnDiagnosis">
                                </el-button>
                                <el-button 
                                    type="text" 
                                    class="ciDiagnBtn"
                                    v-show="diagnosForm.ciDiagnosisRecordsList.length != 1">
                                    <img 
                                        src="@/assets/images/outpDoctor/outp_delete.svg" 
                                        alt="" 
                                        style="width:16px;"
                                        @click="deleteDiagnosis(scope.$index)">
                                </el-button>
                            </span>
                        </template>
                    </el-table-column>
                </el-table> 
                <div class="hisDiagnsModelBtns">
                    <!-- 通用按钮 -->
                    <template v-if="!nursingDocFlag">
                        <el-button @click="cancelDiagns">取 消</el-button>
                        <el-button type="primary" @click="submitDiagnsForm('diagnosForm')" :loading="saveFlag" :disabled="saveFlag">确 定</el-button>
                    </template>

                    <!-- 护理文书按钮 --> 
                    <template v-else>
                        <el-button @click="submitQuote">引 用</el-button>
                        <el-button @click="submitDiagnsForm('diagnosForm')" :loading="saveFlag" :disabled="saveFlag">确 定</el-button>
                        <el-button type="primary" :disabled="multipleSelection.length < 1 || saveAndQuoteFlag ? true : false" :loading="saveAndQuoteFlag" @click="submitDiagnsForm('diagnosForm',true)">确定并引用</el-button>
                    </template>
                    
                </div>
            </el-form>   
        </div>
    </div>
</template>

<script>
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
        name: '',
        data() {
            let checkType = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入诊断类别！'));
                }
                callback()
            };
            let checkName = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入诊断名称！'));
                }
                callback()
            };
            return {

                 // 诊断组件所需数据
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
                        isDiagnFlag: true}
                    ],
                    diagDic: [], //诊断字典数组集合
                    diasNames: [], //诊断名称集合
                    idDiagnosisClassPat: "", //诊断疾病分类id
                    specialDiseasePat: false, //特病标识
                },
                searchDiagnsList: [],  //诊断下拉列表数据

                diagTypelist: [],
                selectDiaghoStatus: false,
                idx: 0,
                curDiagName: "",
                curIndex: 0,
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
                }, //校验规则
               //表格样式
               tableTitleStyle: {
                    fontSize: "14px",
                    color: "#000",
                    padding: "0",
                    height: "30px",
                    background: "#f5f5f5"
                },
                cellStyle: {
                    fontSize: "14px",
                    color: "#333",
                    height: "35px",
                    padding: "0px"
                }, // 表格样式
                multipleSelection: [],
                saveFlag: false,
                saveAndQuoteFlag: false,
            };
        },
        created() {
            this.initData();
        },
        mounted() {},
        components: {
           
        },
        computed: {},
        methods: {
            //初始数据
            initData() {
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
                this.$axios
                    .post( window.globalUrl.diagnosisWebUrl + 'doctws/ciDiaRecord/listDiaRecords', {
                        idVisit: this.diagnosComParmas.idVisit,
                    })
                    .then(res => {
                        if (res.success) {
                            this.handleriDiagnosisEvent(res.data)
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning'
                            })
                        }
                    })
            },

            handleriDiagnosisEvent(list) {
               
                this.diagnosForm.ciDiagnosisRecordsList = [];
                this.diagnosForm.diagDic = []; //保存对比诊断字典列表
                // 缓存保存诊断反显数据
                if (list.length == 0) {
                    // this.findDiagnosisStatus = true;
                    // 默认取诊断类型的第一条
                    this.diagnosForm.ciDiagnosisRecordsList = [{
                        dator: false,
                        showImg: false,
                        supplement: "",
                        diagnosisName: "",
                        sdDiagnosisType: '', //诊断类型
                        sdDiagnosisTypeStr: '', //诊断类型中文
                        diagnosisExaminedIndicator: 0,
                        idDiagnosisRecord: "", //诊断记录id
                        isDiagnFlag: true,
                    }]

                    // setTimeout(()=> {
                    //     this.findDiagnosisStatus = false;
                    // },100)

                } else {
                    let specialDiseaseStatus = false;
                    let idDiagnosisClass = '';
                    list.map((v, i) => {
                        let falg = Number(v.diagnosisExaminedIndicator);
                        //判断诊断是否在诊断字典
                        if (v.approvedIndicator === '1') {
                            v.isDiagnFlag = true; //诊断列表
                            this.diagnosForm.diagDic.push(v); //保存对比诊断字典列表
                        } else {
                            v.isDiagnFlag = false; //非诊断列表
                        }

                        // 特病是否展示  疾病分类 + 患者特病标识 true  + 患者诊断特病病种 编码一致
                        if (v.sdDiagnosisClassType == this.CONSTANT.OUTP_SPECIAL_TYPE && this
                            .isSpecialDiseasePat === true && this.sdSpecialDiseasePat == v.diagnosisClassCode) {
                            v.showImg = true;
                            specialDiseaseStatus = true;
                            idDiagnosisClass = v.idDiagnosisClass; //保存给开药品
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
                            isDiagnFlag: v.isDiagnFlag
                        })
                    })
                    //如果页面中有特病  要传给 开药品  ?? 住院不确定
               
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

            //切换待查
            changeDistor(itm) {
                itm.diagnosisExaminedIndicator = itm.dator ? 1 : 0;
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
                        this.diagTypelist = res.data;
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            // 查看诊断字典下拉
            getDiagNameList(name = '') {
                this.searchDiagnsList = [];
                return this.querySearchDiaByName(name).then((data)=> {
                    let arr = data;
                    let obj = [];
                    arr.map(v => {
                        obj.push({
                            value: v.diagnosisName,
                            approvedIndicator: 1, //标准化标志 0为非标准化，1为标准化
                            idDiagnosis: v.idDiagnosis, //诊断id
                            diagnosisName: v.diagnosisName, //诊断名称
                            diagnosisCode: v.diagnosisCode, //诊断编码
                            diagnosisClassCode: v.diagnosisClassCode, //疾病分类编码
                            diagnosisClassName: v.diagnosisClassName, //疾病分类名称
                            euDiagnosisSystem: v.euDiagnosisSystem, //诊断体系 1-中医 2-西医
                            idDiagnosisClass: v.idDiagnosisClass, //疾病诊断基本分类主键ID
                            sdDiagnosisSystemType: v.sdDiagnosisSystemType, //ICD10、ICD11
                            diagnosisStdCode: v.diagnosisStdCode, //诊断标准编码3
                            sdDiagnosisClassType: v
                                .sdDiagnosisClassType, //疾病分类 1-大病 2-传染病 3-特病
                        });
                    })
                    this.searchDiagnsList = this.copyObject(obj);
                    return obj
                })
            },

            // 诊断联想搜索
            findDiagnosisList(name, callback) {
                this.curIndex++;
                if (this.curIndex == 1) {
                    this.curDiagName = '';
                    this.curDiagName = name; //备份第一次Focus的诊断名称值
                }
                // console.log("联想",this.curIndex,name);
                if (this.curDiagName != name || !name) {
                    //聚焦时的Name 不等于 联想的名称时 清空特病和ICD、待查 、备注
                    this.resetCurDiagn();
                }
                this.getDiagNameList(name).then(data => {
                    callback(data);
                })
            },

            resetCurDiagn(Row) {
                this.diagnosForm.ciDiagnosisRecordsList[this.idx].diagnosisExaminedIndicator = 0;
                this.diagnosForm.ciDiagnosisRecordsList[this.idx].dator = false;
                this.diagnosForm.ciDiagnosisRecordsList[this.idx].supplement = '';
                //选中
                if (Row) {
                    //在诊断列表
                    this.diagnosForm.diagDic.push(Row);
                    this.diagnosForm.ciDiagnosisRecordsList[this.idx].isDiagnFlag = true;
                    this.diagnosForm.ciDiagnosisRecordsList[this.idx].diagnosisStdCode = Row.diagnosisStdCode; //iCD 10 具体编码
                    //特病是否展示  
                    if (Row.sdDiagnosisClassType == this.CONSTANT.OUTP_SPECIAL_TYPE && this.diagnosForm.specialDiseasePat === true && this.diagnosForm.idDiagnosisClassPat == Row.diagnosisClassCode) {
                        
                        this.diagnosForm.ciDiagnosisRecordsList[this.idx].showImg = true;
                    } else {
                        this.diagnosForm.ciDiagnosisRecordsList[this.idx].showImg = false;
                    }
                    //聚焦
                } else {
                    // console.log("进来，聚焦");
                    this.diagnosForm.ciDiagnosisRecordsList[this.idx].showImg = false;
                    this.diagnosForm.ciDiagnosisRecordsList[this.idx].diagnosisStdCode = "";
                    //不在诊断列表
                    this.diagnosForm.ciDiagnosisRecordsList[this.idx].isDiagnFlag = false;
                }

            },

            // 诊断聚焦 -- 选择诊断
            nameDocNumFocus(item, index) {
                this.selectDiaghoStatus = false
                setTimeout(() => {
                    this.selectDiaghoStatus = true
                }, 1000)

                if (index != undefined) {
                    // 当前table数组 item  index有值
                    this.curIndex = 0;
                    this.idx = index;
                } else {
                    //选中一项诊断item   index无值
                    this.resetCurDiagn(item);
                }
            },

            //诊断失焦 处理手写诊断和标准诊断同名处理
            blurDiagnosisEvent(item, index) {
                let ciDRow = this.diagnosForm.ciDiagnosisRecordsList[this.idx];

                this.searchDiagnsList.map( v => {
                    if(v.diagnosisName == item.diagnosisName) {
                        // ciDRow.diagnosisExaminedIndicator = 0;
                        // ciDRow.dator = false;
                        // ciDRow.supplement = '';
                        //在诊断列表
                        this.diagnosForm.diagDic.push(v);
                        ciDRow.isDiagnFlag = true;
                        ciDRow.diagnosisStdCode = v.diagnosisStdCode; //iCD 10 具体编码
                        //特病是否展示  
                        if (v.sdDiagnosisClassType == this.CONSTANT.OUTP_SPECIAL_TYPE && this.diagnosForm.specialDiseasePat === true && this.diagnosForm.idDiagnosisClassPat == v.diagnosisClassCode) {
                            ciDRow.showImg = true;
                        } else {
                            ciDRow.showImg = false;
                        }
                    }
                })
            },

            //添加诊断
            addBtnDiagnosis() {
                let list = this.diagnosForm.ciDiagnosisRecordsList;
                let len = list.length;
                let obj = {
                        sdDiagnosisType: '',   //诊断类型
                        sdDiagnosisTypeStr: '',//诊断类型中文
                        diagnosisName: "",     //诊断名称
                        diagnosisExaminedIndicator: 0, //是否待查 后端数据
                        dator: false,          //是否待查 前端展示
                        supplement: "",        //备注
                        showImg: false,        //展示特病
                        idDiagnosisRecord: '', //诊断记录id
                    }
                    // 连续录入时，自动带入下一个诊断类型
                if(len >= 1){
                    let type = list[len-1].sdDiagnosisType;
                    obj.sdDiagnosisType = type;
                }
                this.diagnosForm.ciDiagnosisRecordsList.push(obj);
                // 滚动条置底
                this.$nextTick(() => {
                    this.$refs.hisDiagnsModel.bodyWrapper.scrollTop = this.$refs.hisDiagnsModel.bodyWrapper.scrollHeight;
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
                    if (v.diagnosisName) diangsNameArr.push(v.diagnosisName);
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
                    //诊断名称在诊断列表字典
                    if (v.isDiagnFlag === true) {
                        newSetDic.map((itm, idx) => {
                            if (v.diagnosisName == itm.diagnosisName) {
                                diangs.push({
                                    serialNo: i + 1,
                                    approvedIndicator: 1, //标准化标志 0为非标准化，1为标准化
                                    idPat: this.diagnosComParmas.idPat,
                                    idVisit: this.diagnosComParmas.idVisit,
                                    diagnosisName: v.diagnosisName, //诊断名称  row
                                    idDeptCreate: userInfo.idDept,
                                    sdVisitType: this.diagnosComParmas.sdVisitType,
                                    diagnosisExaminedIndicator: v.diagnosisExaminedIndicator, //诊断待查标志 0为非待查，1为待查   row
                                    supplement: v.supplement, //补充说明   row
                                    idDiagnosis: itm.idDiagnosis, //诊断id
                                    diagnosisCode: itm.diagnosisCode, //诊断编码  
                                    // sdDiagnosisType: this.diagnosComParmas.diagnsTypeFlag, //诊断类型  row
                                    sdDiagnosisType: v.sdDiagnosisType, //诊断类型  row
                                    // diagnosisStdCode: v.diagnosisStdCode, //诊断标准编码  
                                    diagnosisStdCode: '', //诊断标准编码    //目前传空
                                    idDiagnosisClass: itm.idDiagnosisClass, //疾病诊断基本分类主键ID
                                    euDiagnosisSystem: itm.euDiagnosisSystem, //诊断体系 1-中医 2-西医
                                    diagnosisClassName: itm.diagnosisClassName, //疾病分类名称
                                    diagnosisClassCode: itm.diagnosisClassCode, //疾病分类编码
                                    sdDiagnosisSystemType: itm.sdDiagnosisSystemType, //ICD10...  row
                                    sdDiagnosisClassType: itm.sdDiagnosisClassType, //疾病分类 1-大病 2-传染病 3-特病
                                    idDiagnosisRecord: v.idDiagnosisRecord, //诊断记录id
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
                            diagnosisName: v.diagnosisName, //诊断名称
                            idDeptCreate: userInfo.idDept,
                            sdVisitType: this.diagnosComParmas.sdVisitType,
                            diagnosisExaminedIndicator: v.diagnosisExaminedIndicator, //诊断待查标志 0为非待查，1为待查

                            // sdDiagnosisType: this.diagnosComParmas.diagnsTypeFlag, //诊断类型  row
                            sdDiagnosisType: v.sdDiagnosisType, //诊断类型  row
                            //不在诊断标准字典中以下字段为空
                            idDiagnosis: '', //诊断id
                            diagnosisCode: '', //诊断编码
                            idDiagnosisClass: '', //疾病诊断基本分类主键ID
                            euDiagnosisSystem: '', //诊断体系 1-中医 2-西医
                            diagnosisClassCode: '', //疾病分类编码
                            diagnosisClassName: '', //疾病分类名称
                            sdDiagnosisClassType: '', //疾病分类 1-大病 2-传染病 3-特病
                            sdDiagnosisSystemType: '', //ICD10...  row
                            diagnosisStdCode: '', //诊断标准编码 ... row 
                            idDiagnosisRecord: v.idDiagnosisRecord, //诊断记录id
                        })
                    }
                })

                return diangs
            },

            //诊断保存
            submitDiagnsForm(formName, quoteFlag = false) {
                 this.$refs[formName].validate(valid => {
                    if (valid) {
                         //拦截重复诊断 -- 出院入院诊断名称可以一致
                        // let isRepeat = this.preRepeatDiagns();
                        // if (isRepeat) return

                        //拦截重复特病诊断  
                        let isSpecRepeat = this.preRepeatSpecDiagns();
                        if (isSpecRepeat) return

                        //保存对比诊断字典去重
                        let newSetDic = [];
                        let nameArr = [];
                        this.diagnosForm.diagDic.map(v => {
                            if (!nameArr.includes(v.diagnosisName)) {
                                nameArr.push(v.diagnosisName);
                                newSetDic.push(v);
                            }
                        })

                        if(!quoteFlag) this.saveFlag = true 
                        else this.saveAndQuoteFlag = true
                       let sendForm = this.handerDiagnsData(newSetDic);
                    //    console.log("保存给后端的数据",sendForm)

                        this.$axios._post(window.globalUrl.diagnosisWebUrl + "doctws/ciDiaRecord/saveDiaRecords",sendForm)
                            .then(res => {
                            this.saveFlag = false
                            this.saveAndQuoteFlag = false
                            if (res.success) {
                                this.getDiaData();  //反显诊断数据
                                this.$emit('submitDocDiagnsForm', sendForm);
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
                        this.saveFlag = false
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
            
        }
    };

</script>

<style lang="scss" src="./hisDiagnsModel2.scss"></style>
