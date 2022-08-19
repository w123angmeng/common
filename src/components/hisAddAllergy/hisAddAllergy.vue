<template>
    <div class='HisAddAllergy'>
        <!-- 过敏史弹窗 -->
        <el-dialog 
            v-dialogDrag
            custom-class="addAllergyDialog" 
            title="过敏史" 
            :visible.sync="allergyForm.allergyDialogVisible" 
            width="1082px"
            :close-on-press-escape="false"
            :close-on-click-modal="false" 
            :before-close="handleAllergyClose"
            append-to-body>
            <div>
                <div class="addItemWarnTip">{{addItemtip}}</div>
                <el-table 
                    :data="allergyForm.ppatList" 
                    style="width: 100%;" 
                    :header-cell-style="tableTitleStyle" 
                    height="160"
                    :cell-style="cellStyle">
                    <el-table-column prop="sdAllergyTypeDesc" label="过敏类型" align="left" width="130">
                    </el-table-column>
                    <el-table-column prop="allergyName" label="过敏物" align="left" width="150" show-overflow-tooltip>
                    </el-table-column>
                     <el-table-column prop="allergyReaction" label="症状" align="left" width="" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column prop="sdAllergyDegreeDesc" label="过敏程度" align="left" width="120">
                    </el-table-column>
                    <el-table-column prop="allergyDate" label="过敏日期" align="left" width="160">
                        <template slot-scope="scope">
                            <span>{{scope.row.allergyDate? scope.row.allergyDate.substring(0, 10) : ''}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createDt" label="创建日期" align="left" width="160">
                        <template slot-scope="scope">
                            {{isShowTime(scope.row)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="50">
                        <template slot-scope="scope">
                            <div>
                                <el-button 
                                    type="text" 
                                    :disabled="docCloseVisitState" 
                                    @click="deleteAllergy(scope.row,scope.$index)">
                                    删除
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="allergyFormContent">
                <el-form 
                    label-position="right" 
                    label-width="0px" 
                    :rules="rules" 
                    :model="allergyForm"
                    ref="allergyForm">
                    <div class="allergyFormList">
                        <div class="allergyFormLeft sdAllergyDegreeType">
                            <el-form-item label="" prop="sdAllergyType">
                                <span class="requiredStr">*</span>
                                <el-select 
                                    v-model="allergyForm.sdAllergyType" 
                                    @change="changeAllergyType()"
                                    placeholder="过敏类型">
                                    <el-option 
                                        v-for="itm in allergyTypeList" 
                                        :key="itm.dataCode" 
                                        :label="itm.dataName"
                                        :value="itm.dataCode">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                        <div class="allergyFormLeft allergyNamess">
                            <el-form-item label="" prop="allergyName" ref="allergyName">
                                 <span class="requiredStr">*</span>
                                <el-autocomplete 
                                    class="allergyName"
                                    :title="showTitle(allergyForm.allergyName, 8)" 
                                    v-model="allergyForm.allergyName"
                                    :fetch-suggestions="findAllergyList" 
                                    :placeholder="isDenyAllergy ? '请进行描述' : '请描述过敏物'">
                                </el-autocomplete>
                            </el-form-item>
                        </div>
                        <template v-if="!isDenyAllergy">
                            <div class="allergyFormLeft allergyReaction">
                                <el-form-item label="" prop="allergyReaction">
                                    <el-input 
                                        class="reaction"
                                        :title="showTitle(allergyForm.allergyReaction, 23)" 
                                        v-model="allergyForm.allergyReaction" 
                                        placeholder="请描述过敏症状">
                                    </el-input>
                                </el-form-item>
                            </div>
                            <div class="allergyFormLeft sdAllergyDegree">
                                <el-form-item label="" prop="sdAllergyDegree">
                                    <el-radio-group class="alleryRadioGroup" v-model="allergyForm.sdAllergyDegree" size="small">
                                        <el-radio-button v-for="item in levelList" :key="item.dataCode" :label="item.dataCode">{{item.dataName}}</el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </div>
                            <div class="allergyFormLeft">
                                <el-form-item label="" prop="allergyDate">
                                    <el-date-picker 
                                        v-model="allergyForm.allergyDate" 
                                        type="date"
                                        format="yyyy-MM-dd" 
                                        value-format="yyyy-MM-dd" 
                                        :picker-options="pickerOptions1"
                                        placeholder="过敏时间">
                                    </el-date-picker>
                                </el-form-item>
                            </div>
                        </template>
                        <div>
                            <el-button 
                                type="primary"
                                :disabled="docCloseVisitState"
                                :loading="saveloading" 
                                @click="submitAllergyEvent('allergyForm')">
                                添 加
                            </el-button>
                        </div>
                    </div>
                </el-form>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    export default {
        props: {
            allergyForm: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            params: {
                type: Object,
                default: () => {
                    return {}
                }
            },
        },
        data() {
            let checkName = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('必填项不能为空！'));
                }
                callback()
            };
            let requireTrue = (rules, value, callback) => {
                this.$store.dispatch("isStrLength", {
                    rules,
                    value,
                    callback,
                    require: true,
                    strEnd: 25
                });
            };

            let allergyReaction = (rules, value, callback) => {
                if (value) {
                    this.$store.dispatch("isStrLength", {
                        rules,
                        value,
                        callback,
                        strEnd: 120
                    });
                } else {
                    callback();
                }
            };
            return {
                addItemtip: '体温单仅能打印前两项药物过敏，请合理安排顺序，将最重要的青霉素，头孢等排前!', // 提示
                saveloading: false,
                allergyList: [], //过敏列表
                allergyTypeList: [], //过敏类型列表
                levelList: [],   //程度等级
                // 表格样式
                tableTitleStyle: {
                    fontSize: '14px',
                    color: '#1F1F1F',
                    height: '38px',
                    padding: '0',
                    background: '#f5f5f5',
                    border: 'none'
                },
                cellStyle: {
                    fontSize: '14px',
                    color: '#1F1F1F',
                    padding: '0',
                    height: '38px',
                },
                 // 时间校验
                pickerOptions1: {
                    disabledDate: time => {
                        if(!this.allergyForm.birthDay) return
                        var dateTime = new Date(this.allergyForm.birthDay);
                        dateTime = dateTime.setDate(dateTime.getDate() - 1);
                        dateTime = new Date(dateTime);
                        return time.getTime() < dateTime.getTime();
                    }
                },

                rules: {
                    sdAllergyType: [{
                        required: true,
                        validator: checkName,
                        trigger: "change"
                    }],
                    sdAllergyDegree: [{
                        required: true,
                        validator: checkName,
                        trigger: "change"
                    }],
                    // allergyDate: [{
                    //     required: true,
                    //     validator: checkName,
                    //     trigger: "change"
                    // }],
                    allergyName: [{
                        required: true,
                        validator: requireTrue,
                        trigger: "change"
                    }],
                    allergyReaction: [{
                        validator: allergyReaction,
                        trigger: "blur"
                    }]
                }
            };
        },
        computed: {
            ...mapGetters(["docCloseVisitState", "routerPath", "docPatientParams"]),

            idPatStr() {
                return this.allergyForm.idPat || this.params.idPat || this.$route.query.idPat
            },
            isFromDoctws() {
                return !!this.allergyForm.isFromInp;
            },
            isShowTime() {
                return function(row) {
                    let dt = this.formatDate(new Date(row.createDt))
                    return dt
                }
            },
            filterDenyAllergyByList() {
              let arr = this.allergyForm.ppatList.filter( v => v.sdAllergyType == this.CONSTANT.DENY_ALLERGY_TYPE);
              return arr.length
            },
            isDenyAllergy() {
                return this.allergyForm.sdAllergyType == this.CONSTANT.DENY_ALLERGY_TYPE;
            },
        },
        methods: {
            //初始数据
            init() {
                this.getAllergyDegreeList(); //获取过敏程度下拉列表
            },

            //根据患者id查过敏史
            findAllergyByIdPat(idPat = '', isDel) {
                //过敏史点有
                if (!this.idPatStr && !idPat) return
                
                this.$axios.post("/reg/allergy/findByIPat", {
                    idPat: idPat || this.idPatStr
                }).then(res => {
                    if (res.success) {
                        this.allergyForm.ppatList = res.data;
                        this.allergyForm.allAllergyDataStr = '';
                        this.$nextTick(()=> {
                            if (res.data.length == 0) {
                                this.allergyForm.allAllergyDataStr = '无';
                            } else {
                                let allVatMrData = [];
                                res.data.map((c, m) => {
                                    let itmStr = c.allergyReaction ?  c.allergyName + '[' + c.allergyReaction + ']' :  c.allergyName;
                                    allVatMrData.push(itmStr);
                                })
                                this.allergyForm.allAllergyDataStr = allVatMrData.join('、')
                            }

                            if(!isDel) {
                                this.resetAllergyType();
                            }
                        })
                        
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            //获取过敏程度下拉列表
            getAllergyDegreeList() {
                this.findSdData('SD_ALLERGY_DEGREE,SD_ALLERGY_TYPE').then(data => {
                    this.levelList = data.SD_ALLERGY_DEGREE;     //过敏程度
                    this.allergyTypeList = data.SD_ALLERGY_TYPE; //过敏类型
                    if(this.levelList.length > 0) {
                        this.levelList = this.levelList.sort((a, b) => b.dataCode > a.dataCode ? -1 : 1)
                    }
                    this.findAllergyByIdPat();   //根据患者id查过敏史
                })
            },

            //切换过敏类型
            changeAllergyType() {
                //否认过敏
                if(this.isDenyAllergy) {
                    this.allergyList = [];
                    this.allergyForm.allergyDate = ''
                    this.allergyForm.allergyReaction = '';
                    this.allergyForm.sdAllergyDegree = '';
                    this.allergyForm.allergyName = this.CONSTANT.DENY_ALLERGY_DESC;
                } else {
                    this.allergyForm.allergyName = '';
                    this.$nextTick(()=> {
                        this.clearValidate(this.allergyForm.allergyName,this.$refs.allergyName);
                    })
                    this.resetLevel();
                }
            },

            //查看过敏源数据
            getAllergyList(name = '') {
                return this.$axios.get('/dict/allergen/pageAllergen', {
                    pageIndex: 1,
                    pageSize: 100,
                    selCondition: name,
                    enabled: 1,
                }).then(res => {
                    if (res.success) {
                        let arr = res.data.records;
                        let obj = [];
                        arr.map(v => {
                            obj.push({
                                value: v.allergyName, //过敏原名称
                                allergyName: v.allergyName, //过敏原名称
                                allergyCode: v.allergyCode, //过敏原代码
                                idAllergy: v.idAllergy, //过敏原id
                                idPatAllergy: v.idPatAllergy, //主键
                                sdAllergyType: v.sdAllergyType, //过敏原分类
                            });
                        })
                        return obj
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                })
            },

            // 过敏史联想搜索
            findAllergyList(name, callback) {
                this.allergyList = [];
                this.getAllergyList(name).then(data => {
                    this.allergyList = data || [];
                    callback(this.allergyList)
                })
            },

            //删除过敏史 
            deleteAllergy(row, index) {
                this.$axios.post("/reg/allergy/deleteByIds", {
                    ids: row.idPatAllergy
                }).then(res => {
                    if (res.success) {
                        this.findAllergyByIdPat('', 'del');
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            handleAllergyData(){
                let ppatList = [];
                if(this.allergyList.length == 0) {
                    ppatList.push({
                        allergyDate: this.allergyForm.allergyDate,
                        allergyName: this.allergyForm.allergyName,
                        allergyReaction: this.allergyForm.allergyReaction,
                        sdAllergyDegree: this.allergyForm.sdAllergyDegree,
                        sdAllergyType: this.allergyForm.sdAllergyType, //过敏源分类
                        description: '',
                        idPatAllergy: '',
                        //不在字典以下值为空
                        allergyCode: '', // 过敏原代码
                        idAllergy: '', // 过敏id
                        idPat: this.idPatStr,
                        serialNo: 1,
                    })
                } else {
                    this.allergyList.map((v, i) => {
                        if (this.allergyForm.allergyName == v.allergyName) {
                            ppatList.push({
                                allergyDate: this.allergyForm.allergyDate,
                                allergyName: this.allergyForm.allergyName,
                                allergyReaction: this.allergyForm.allergyReaction,
                                sdAllergyDegree: this.allergyForm.sdAllergyDegree,
                                sdAllergyType: this.allergyForm.sdAllergyType, //过敏源分类
                                allergyCode: v.allergyCode,     //过敏原代码
                                idAllergy: v.idAllergy,         //过敏id
                                description: '',
                                idPatAllergy: '',
                                idPat: this.idPatStr,
                                serialNo: 1,
                            })
                        }
                    })
                }
                return ppatList
            },

            //拦截重复过敏史
            preRepeatAllergys(ppatList){
                let allergyStatus = false;
                let currentRow = ppatList[0];
                let names = this.allergyForm.ppatList.map(v => v.allergyName).filter(item => item);
                if(this.filterDenyAllergyByList) {
                    if(currentRow.sdAllergyType == this.CONSTANT.DENY_ALLERGY_TYPE) {
                        this.$message.warning('否认过敏史已录入，不能重复录入')
                        allergyStatus = true;
                    }
                } else {
                    if(names.includes(currentRow.allergyName)) {
                        this.$message.warning('不能有重复过敏史，请重新填写')
                        allergyStatus = true;
                    }
                }
                return allergyStatus
            },


            //提交过敏史 
            submitAllergyEvent(formName) {
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        let ppatList = this.handleAllergyData();
                        this.saveAllergy(ppatList);
                    } else {
                        console.log("error submit!!");
                        return false;
                    }
                });
            },
            //保存过敏史
            saveAllergy(ppatList, isAuto) {
                let st = this.preRepeatAllergys(ppatList);
                if(st) return
                this.saveloading = true;
                this.$axios._post('/reg/allergy/save', ppatList).then(res => {
                    if (res.success) {
                        if(!isAuto) {
                            this.$message({
                                message: "保存成功",
                                type: "success"
                            });
                            this.resetForm('allergyForm'); //清空表单
                        }
                        this.findAllergyByIdPat();     //过敏史列表
                        if(this.isFromDoctws) this.getBuryingPoint('过敏史保存') ;
                        
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                    this.saveloading = false;
                })
            },

            //自动保存 否认过敏史
            autoSaveDenyAllergy() {
                let ppatList = [];
                ppatList.push({
                    allergyDate: '',
                    allergyName: this.CONSTANT.DENY_ALLERGY_DESC,
                    allergyReaction: '',
                    sdAllergyDegree: '',
                    sdAllergyType: this.CONSTANT.DENY_ALLERGY_TYPE, //否认过敏类型 
                    description: '',
                    idPatAllergy: '',
                    //不在字典以下值为空
                    allergyCode: '', // 过敏原代码
                    idAllergy: '', // 过敏id
                    idPat: this.idPatStr,
                    serialNo: 1,
                })
                this.saveAllergy(ppatList, true);
            },

            //取消
            closeAllergyEvent() {
                this.handleAllergyClose();
            },

            //清空表单
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.resetAllergyType();
                this.resetLevel();

            },
            //重置过敏程度
            resetLevel() {
                if(this.levelList.length > 0) {
                    this.levelList.map( v => {
                        // 轻度过敏
                        if(v.dataCode == this.CONSTANT.MILD_ALLERGY) {
                            this.allergyForm.sdAllergyDegree = v.dataCode;
                        }
                    })
                }
            },

            //重置过敏类型
            resetAllergyType() {
                if(this.allergyTypeList.length) {
                    this.allergyTypeList.map( v => {
                        // this.filterDenyAllergyByList ||
                        if(!this.allergyForm.ppatList.length ) {
                            if(v.dataCode === this.CONSTANT.DENY_ALLERGY_TYPE) this.allergyForm.sdAllergyType = this.CONSTANT.DENY_ALLERGY_TYPE;  //否认过敏
                        } else {
                            if(v.dataCode === this.CONSTANT.DRUG_ALLERGY_TYPE) this.allergyForm.sdAllergyType = this.CONSTANT.DRUG_ALLERGY_TYPE;  //药物过敏
                        }
                    })
                    this.changeAllergyType();
                }
            },

            //关闭过敏史弹窗
            handleAllergyClose(){
                this.resetForm('allergyForm');
                this.allergyForm.allergyDialogVisible = false;
            },

            //鼠标悬浮显示文字
            showTitle(str, num) {
                if (str && str.length > num) {
                    return str
                }
                return ''
            },

            clearHandle() {
                let setTimeData = this.API.api.setTime;
                this.setIntervalHand = setInterval(() => {
                    if (setTimeData <= 0) {
                        this.saveloading = false;
                        clearInterval(this.setIntervalHand)
                    } else {
                        setTimeData--;
                    }
                }, 1000)
            },

            //埋点处理
            getBuryingPoint(eventName, parmas = {}) {
                let obj = {
                    idPat: this.docPatientParams.idPat || this.$route.query.idPat,
                    idVisit: this.docPatientParams.idVisit || this.$route.query.idVisit,
                    ...parmas
                }
                //埋点
                let parame = [{
                    eventDescription: eventName, //事件名字
                    properties:[obj],   //参数
                    title: '患者导航',   //模块
                    subTitle: '功能操作', //子模块
                    url: this.routerPath,
                }]
                this.buryingPoint(parame, 'hospitalDoctor');
            },

        },
        watch: {
            saveloading: {
                handler(val) {
                    if (val === true) {
                        this.clearHandle();
                    } else {
                        clearInterval(this.setIntervalHand)
                    }
                },
            }
        }
    };

</script>

<style lang="scss" src="./hisAddAllergy.scss"></style>
