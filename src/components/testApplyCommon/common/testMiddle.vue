<template>
    <div class="testApplyContent_wrap">
        <div class='testMiddleCommon'>
            <div class="testTitle">检验申请</div>
            <div class="searchArea">
                <div class="searchTestName">
                    <el-select
                        filterable 
                        remote 
                        class="diagnosisNamesw" 
                        reserve-keyword
                        :disabled="isDisabled"
                        :remote-method="remoteTestMethod"
                        @focus="remoteTestMethod('')"
                        v-model="searchName" 
                        placeholder="请输入"
                        @change="changeTest">
                        <el-option 
                            v-for="(item, index) in cliNameLabList" 
                            :key="index" 
                            :label="item.clinicItemName" 
                            :value="item.idClinicItem">
                        </el-option>
                    </el-select>
                </div>
                <div class="inspectCheckbox">
                    <template v-if="isFromInpDoctor">
                        <el-checkbox 
                            :disabled="isDisabled"
                            v-model="urgentFlag"
                            class="urgentFlag" 
                            @change="changeUrgentFlag">
                            加急
                        </el-checkbox>
                    </template>
                    <template v-else>
                        <el-checkbox
                            :disabled="isDisabled || inspectData.specialDisease !== 1 && inspectData.chargeTypeCode != CONSTANT.OUTPEXCESS_CHARGETYPECODE" 
                            v-model="insuranceFlag" 
                            @change="changeInuranceFlag">
                            自费
                        </el-checkbox>
                        <el-checkbox 
                            :disabled="isDisabled"
                            v-model="urgentFlag"
                            class="urgentFlag" 
                            @change="changeUrgentFlag">
                            加急
                        </el-checkbox>
                        <el-checkbox 
                            :disabled="isDisabled"
                            v-model="isoutSend"
                            class="outSend" 
                            @change="changOutSend">
                            外送
                        </el-checkbox>
                    </template>
                    <el-checkbox
                        v-if="isShowGcpBtn()"
                        v-model="isGcpCheckBox"
                        :disabled="isDisabled"
                        class="gcpIcon">
                        GCP
                    </el-checkbox>
                </div>
            </div>
            <div class="outpTestContent">
                <div class="outpTestTree">
                    <el-tree
                        class="testTreeDatas hisCommonTree"
                        :data="treeData"
                        :props="defaultProps"
                        node-key="idData"
                        accordion
                        current-node-key
                        highlight-current
                        :expand-on-click-node="true"
                        @node-click="handleNodeClick"
                        :default-expand-all="false"
                        ref="numberTree">
                        <span class="span-ellipsis" slot-scope="{ node }">
                            <span >{{ node.label }}</span>
                        </span>
                    </el-tree>
                </div>
                <div class="outpApplytableCont_wrap">
                    <div class="outpApplytable_wrap">
                        <TableCom 
                            :isEdit="isEdit" 
                            :tableData="tableData" 
                            :inspectData="inspectData"
                            :form="formData" 
                            @appendTest="appendTest" 
                            :isFromInpDoctor="isFromInpDoctor"
                            :isGcpPat="isGcpPat"></TableCom>
                        <!-- <IndicationsCom style="margin-top: 20px" :IndicationsForm="IndicationsForm"></IndicationsCom> -->
                    </div>
                </div>
            </div>
        </div>
        <div class='testRightCommon'>
            <div class="testTitle">
                已选项目
            </div>
            <div class="testSroll_wrap" :style="{height: '85%'}">
                <div v-for="(item, index) in alreadyAddItems" :key="index" class="itemTags">
                    <el-tag
                        class="itemTests"
                        :key="item.clinicItemName"
                        type=""
                        :closable="!isDisabled"
                        :disable-transitions="true"
                        @close="deleteItemTest(index)">
                        <el-tooltip  
                            effect="dark" 
                            :content="showTitle(item)"
                            :disabled='showTitle(item, true)'
                            placement="right-end">
                            <span class="ellipsis1 ellipsis">
                                
                                <span v-if="item.isGcp" style="padding-left: 16px"></span>
                                <span style="padding-left: 10px">{{item.clinicItemName}}</span>
                                <span>({{item.specimenName}})</span>
                            </span>
                        </el-tooltip>
                    </el-tag>
                    <img v-if="item.isGcp" src="@/assets/images/outpDoctor/outp_gcp.svg" class="outp_gcp" alt="">
                </div>
                <IndicationsCom v-if="alreadyAddItems.length" :fromWidth="200" style="margin-top: 30px" :IndicationsForm="IndicationsForm"></IndicationsCom>
            </div>
            <div class="testApply_btns">
                <el-button 
                    type="primary" 
                    :disabled="isDisabled"
                    :loading="saveloading" 
                    @click="handleSubmit" 
                    class="submit_custom">
                    提交
                </el-button>
                <el-button 
                    plain 
                    :disabled="isDisabled"
                    class="resetBtn" 
                    @click="handleReset">
                    清空
                </el-button>
            </div>

             <!-- 检验合管弹窗 -->
            <LabMergePipe v-if="mergePipeForm.visible" :mergePipeForm="mergePipeForm" ref="LabMergePipe"></LabMergePipe>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    import IndicationsCom from '@/components/page/Common_WEB/outpIndicationsCom/indicationsCom.vue';//适应症组件
    import TableCom from './tableCom.vue'
    import mixinsGcpAtm from "@/components/page/Common_WEB/mixins/mixinsGcpAtm.js";
    import { mixinSaveLoading } from "@/components/page/Common_WEB/mixins/mixinSaveLoading";
    import { mixinAuthLabMergePipe } from "@/components/page/Common_WEB/labMergePipe/index.js"; //检验合管业务
    import bus from '@/components/common/bus.js';
    const SPECIAL_DISEASE = 1;   //特病

    export default {
        mixins:[mixinsGcpAtm, mixinSaveLoading, mixinAuthLabMergePipe],
        props: {
            inspectData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            isEdit: {
                type: Boolean,
                default: () => {
                    return false
                }
            },
            isFromInpDoctor: {
                type: Boolean,
                default: () => {
                    return false
                }
            },
            tabCommonParmas: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data() {
         
            return {
                curIndex: 0,
                isGcpCheckBox: false,    //gcp
                searchName: '',
                insuranceFlag: false,
                urgentFlag: false,
                isoutSend: false, 
                cliNameLabList: [],
                treeData: [],    //tree数据
                defaultProps: {
                    children: 'childVOList',
                    label: 'name'
                },
                curTreeKey: '',  //当前tree某一节点选中
                treeLevel_1: '',
                treeLevel_2: '',

                tableData: [],

                alreadyAddItems: [],   //已添加数据

                formData: {
                    idPat: this.$route.query.idPat,     //患者id
                    idVisit: this.$route.query.idVisit, //就诊id
                    sdVisitType: '', //就诊类型
                    attention: "",                      //备注
                    urgentIndicator: 0,  //加急
                    insuranceIndicator: 0,   //自费
                    outSend: 0,          //外送标识
                    chargeTypeCode:'',                  //费别
                    diagnosisName: '',                  //诊断名字

                    sdSubClinicType: "",                //检验分类
                    idSpecimen: "",                     //标本
                    idDept: "",                         //执行科室
                    specimenName: "",                   //标本名字
                },
                backupsForm: {},   //备份数据
               
                //适应症弹窗
                IndicationsForm: {
                    IndicationsVisible: false,  //弹窗
                    IndicationInfoList: [],     //适应症数据
                },
            };
        },
        components: {
            IndicationsCom,
            TableCom,
        },
        computed: {
            ...mapGetters(["docCloseVisitState", 'docPatientParams', 'routerPath']),
            isAtmeng(){
                return this.$limits.isFun(this)
            },
            userParmas() {
                return this.getUserStorage();
            },
            idClinicItemsList() {
                let arr = this.alreadyAddItems.map( v => v.idClinicItem).filter(item => item);
                return arr
            },
            filterNoIdDept() {
                let arr = this.alreadyAddItems.filter(item => !item.idDept);
                let str = arr.map( v => v.clinicItemName).filter(item => item).join(",");
                return str
            },
            filterNoIdSpecimen() {
                let arr = this.alreadyAddItems.filter(item => !item.idSpecimen);
                let str = arr.map( v => v.clinicItemName).filter(item => item).join(",");
                return str
            },
            isSaveStatus() {
                if(!this.isEdit && this.alreadyAddItems.length)  return true
                return false
            },
            isDisabled() {
                return this.docCloseVisitState || this.isEdit
            },
            submitApplyUrl() {
                let url = this.isFromInpDoctor ? '/doctws/inspect/saveInspectBatch' : '/outpdr/inspect/saveInspectBatch';
                return url
            },
            filterVisitType() {
                if(this.isFromInpDoctor) return this.CONSTANT.INPA_VISIT_TYPE;
                return this.CONSTANT.OUTP_VISIT_TYPE;
            },
            //gcp 患者
            isGcpPat() {
                if(this.isFromInpDoctor) {
                    return this.tabCommonParmas.isGcpPat || false
                }
                return !!this.inspectData.isGcpPropertyStatus
            },
        },
        created() {
            this.formData.sdVisitType = this.filterVisitType;
            this.backupsForm = this.copyObject(this.formData);   //备份数据
            this.init();
        },
        methods: {
            init() {
                this.curIndex = 0;
                if(this.isGcpPat) this.isGcpCheckBox = true;
                this.formData = this.copyObject(this.backupsForm);  //清空数据
                this.formData.chargeTypeCode = this.inspectData.chargeTypeCode; //费别
                this.isoutSend = false;
                this.handlerInsuranceIndicator();   
                this.getDiagnoseInfo();  //诊断记录列表
                this.$nextTick(()=> {
                    if(!this.isFromInpDoctor){ //住院，没有外送
                        if(!this.isEdit) this.isScCodeByIdVisit(); 
                    }
                    this.findTreeList();
                })
            },

            //清空
            handleReset() {
                this.urgentFlag = false;
                this.formData.urgentIndicator = 0;
                this.alreadyAddItems = [];
                this.init();
            },

            //处理提交数据
           async commitData() {
                let sendFormData = [];
                this.alreadyAddItems.map( v => {
                    let copyObj = this.copyObject(this.formData);
                    copyObj.attention = v.attention;

                    if(this.isFromInpDoctor){
                        // 住院只展示加急，不需要展示自费、外送
                        delete copyObj.insuranceIndicator;
                        delete copyObj.outSend;
                    }

                    this.listAssign(copyObj, v);

                    let row = {
                        idClinicItem: v.idClinicItem,         //项目id
                        clinicItemCode: v.clinicItemCode,     //项目编码
                        clinicItemName: v.clinicItemName,     //项目名称
                        idDept: copyObj.idDept,         //执行科室
                        idSpecimen: copyObj.idSpecimen, //标本
                        specimenName: copyObj.specimenName, //标本
                        sdSubClinicType: copyObj.sdSubClinicType, //类型
                        isGcp: v.isGcp,
                        curIndex: v.curIndex,
                    }

                    let idDeptCreate = '';
                    let createDeptName = '';
                    if(this.isFromInpDoctor) {
                        //患者所在科室id
                        idDeptCreate = this.docPatientParams.idDeptAdmit;
                        //患者所在科室名字
                        createDeptName = this.docPatientParams.idDeptAdmitName;
                    } else {
                        idDeptCreate = this.userParmas.idDept;    //当前登录科室id
                        createDeptName = this.userParmas.deptName;//当前登录科室名字
                    }
                    sendFormData.push({
                        ...copyObj,
                        rows: [row],
                        idDeptCreate: idDeptCreate,    
                        createDeptName: createDeptName,
                        curIndex: v.curIndex,
                    })
                })

                sendFormData.forEach(ele => {
                    let itemRow = ele.rows[0];
                    itemRow.gcpIdentification = itemRow.isGcp ? this.CONSTANT.GCP_FLAG_ATM : this.CONSTANT.UN_GCP_FLAG_ATM
                });

                if(this.filterNoIdSpecimen) {
                    return this.$message.warning(`${this.filterNoIdSpecimen}没有标本！`)
                }

                if(this.filterNoIdDept && this.isAtmeng) {
                    return this.$message.warning(`${this.filterNoIdDept}没有维护科室！`)
                }
                this.beforeSaveInfo(sendFormData);

            },
            
            //删除已合单的检验项目
            handleDeleteMergeOkList(list) {
                console.log(list);
                let cp = this.copyObject(list)
                cp.map( v => {
                    this.alreadyAddItems.map( (item, index) => {
                        if(Number(v) === item.curIndex) this.alreadyAddItems.splice(index, 1)
                    })
                })
            },

            handleSubmit() {
                if(!this.alreadyAddItems.length) {
                    return this.$message.warning('请选择检验项目提交！')
                }
                this.commitData();
            },

            async beforeSaveInfo(sendFormData) {
                if(this.isFromInpDoctor) {
                    this.saveloading = true;
                    let isMerge = await this.isMergeTestApply('apply', sendFormData);
                    if(isMerge) {
                        this.$nextTick(()=> {
                            //合管成功
                            this.$refs.LabMergePipe.$on('mergeOk', (list, mergeList)=> {
                                this.handleDeleteMergeOkList(mergeList)
                                if(list.length) {
                                    this.saveInfo(list);
                                }else {
                                    this.$emit('getTestApplyList')
                                }
                            })
                            //取消合管
                            this.$refs.LabMergePipe.$on('mergeCancel', (list)=> {
                                this.saveInfo(list);
                            })
                        })
                       return
                    } 
                     //正常提交
                    this.saveInfo(sendFormData)
                } else {
                    //正常提交
                    this.saveInfo(sendFormData)
                }
            },


            //提交申请单
            saveInfo(sendFormData) {
                
                return new Promise( async(re, rj)=>{
                    this.saveloading = true; 
                    this.$axios._post(this.submitApplyUrl, sendFormData).then(res => {
                        if (res.success) {
                            this.$message({
                                message: res.message,
                                type: "success"
                            });
                        
                            this.$emit('getTestApplyList')
                            this.saveloading = false;
                            //埋点
                            this.getBuryingPoint('检验申请单提交')
                            return re(true)

                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            });
                            this.saveloading = false;
                            return re(false)
                        }
                    });
                })
            },

            //编辑数据
            async  handlerMiddleEdit(data, Obj) {
                this.formData.insuranceIndicator = data.insuranceIndicator;
                this.insuranceFlag = data.insuranceIndicator === 0 ? true : false;
                this.formData.outSend = data.outSend;
                this.isoutSend = data.outSend === 1 ? true : false;
                this.formData.urgentIndicator = data.urgentIndicator;
                this.urgentFlag = data.urgentIndicator === 1 ? true : false;

                this.alreadyAddItems = []
                data.rows.map( v => {
                    this.alreadyAddItems.push({
                        ...v,
                        gcpIdentificationCopy: v.gcpIdentification || this.CONSTANT.GCP_FLAG_ATM,
                        specimenName: Obj.specimenName || ''
                    })
                })
                
                let idList =  this.alreadyAddItems.map(v => v.idClinicItem).filter( item => item)
                let gcpObj = {
                    idList: idList,
                    gcpOrders: this.alreadyAddItems,
                    isEditFlag: true,
                }
                let commitGcp = await this.getDocGcpOrders (gcpObj);
                if(!commitGcp) return
                this.alreadyAddItems = this.copyObject(commitGcp)
            },

       
            //添加项目
            appendTest(row) {
                this.curIndex ++;
                row.curIndex = this.curIndex;
                console.log(row);
                this.alreadyAddItems.push({...row})
            },

            //自费处理 --- 特病、医保、自费
            handlerInsuranceIndicator() {
                if(this.inspectData.specialDisease === SPECIAL_DISEASE) {
                    this.insuranceFlag = false;
                    this.formData.insuranceIndicator = 2;   //特病
                } else {
                    if(this.inspectData.chargeTypeCode == this.CONSTANT.OUTPEXCESS_CHARGETYPECODE) {
                        this.insuranceFlag = false;
                        this.formData.insuranceIndicator = 1;   //医保
                    } else {
                        // 费别值是02的时候为医保，其余值全为自费  自费患者不能取消勾选
                        this.insuranceFlag = true;
                        this.formData.insuranceIndicator = 0;   //自费
                    }
                }
            },

            remoteTestMethod(query = '') {
                // 请求接口之前先打标记  -- 随机码
                this.randomNum = Math.random().toString(36).substr(2);
                if(query == '') return this.cliNameLabList = [];

                this.remoteSearchHanlde(query,  this.randomNum)
            },

            async remoteSearchHanlde(query, num) {
                 let params = {
                    idDept: '',         //检验科室
                    clinicItemName: query, //项目名称
                    idSpecimen: '',   //标本 
                    sdSubClinicType: '', //检验分类
                    gcpFlag: this.inspectData.isGcpPropertyStatus ? 1 : 0, //是否是GCP  是 1 否 0
                    chargeTypeCode: this.inspectData.chargeTypeCode,   //费别
                }

                const resData = await this.$axios._post('/dict/inspect/listClinicItemLab',params)

                if(resData.success) {
                     // 随机码校验是否一致
                    if(this.randomNum == num || num == undefined) {
                        let commitData = resData.data || [];   //项目集合
                        this.cliNameLabList = this.repeatArrayElements(commitData, 'idClinicItem');
                      
                    }
                } else {
                    this.$message({
                        message: resData.message,
                        type: "warning"
                    });
                }
            },

            changeTest(e) {
                this.cliNameLabList.map( v => {
                    if( v.idClinicItem === e) {
                        // 住院医生不查关联价表
                        if(this.isFromInpDoctor){
                            return this.findInspectInfoById(v);
                        }
                        this.getClinicPriceRela(v)
                    }
                })
            },

              //查询项目是否关联价表
            getClinicPriceRela(row) {
                this.$axios
                    .get('/dict/clinicItem/countClinicPriceRela', {
                        idClinicItem: row.idClinicItem,
                    })
                    .then(res => {
                        if (res.success) {
                            
                           // 新增项目 反查标本和科室 
                            this.findInspectInfoById(row);
                        } else {
                            this.$message.warning(res.message);
                            this.searchName = '';
                        }
                    })
            },

             //根据检验项目id查询检验项目相关信息/执行科室/标本等信息
            findInspectInfoById(row){
                this.$axios.post("/dict/inspect/findConListByClinicItemId", {
                    idClinicItem: row.idClinicItem,
                }).then(async (res) => {
                    if (res.success) {

                        let curRow = this.copyObject(row);

                        // 检验分类
                        if(res.data.clinicItem && res.data.clinicItem.sdSubClinicType)  curRow.sdSubClinicType = res.data.clinicItem.sdSubClinicType;
                       
                        // 科室
                        if(res.data.deptList.length) {
                            curRow.idDept = res.data.deptList[0].value;  
                            curRow.deptName = res.data.deptList[0].label;  
                        }

                         // 标本
                        if(res.data.specimenList.length) {
                            curRow.idSpecimen = res.data.specimenList[0].idSpecimen;  
                            curRow.specimenName = res.data.specimenList[0].specimenName;  
                        }

            
                        let gcpObj = {
                            idList: [row.idClinicItem],
                            gcpOrders: [curRow],
                        }
                        let commitGcp = await this.getDocGcpOrders (gcpObj);
                        if(!commitGcp) return  this.searchName = '';
                        curRow = this.copyObject(commitGcp)[0];
                        curRow.isGcp = this.isGcpCheckBox ? curRow.isGcp : false
                        this.curIndex ++;
                        curRow.curIndex = this.curIndex;
                        this.alreadyAddItems.push({
                            ...curRow
                        })
                        this.cliNameLabList = [];
                        this.searchName = '';
                       
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            //切换加急
            changeUrgentFlag(e) {
                this.formData.urgentIndicator = e ? 1 : 0;
            },

            //切换自费
            changeInuranceFlag(e) {
                 if(this.inspectData.specialDisease === SPECIAL_DISEASE) {

                    this.formData.insuranceIndicator = e ? 0 : 2;
                } else {

                    this.formData.insuranceIndicator = e ? 0 : 1;
                }
            },

            //患者是否为指定号别 --- 外送
            isScCodeByIdVisit() {
                this.isoutSend = false;
                this.$axios.post("/reg/visitSc/isScCodeByIdVisit", {
                    idVisit: this.$route.query.idVisit,
                }).then(res => {
                    if (res.success) {
                        this.isoutSend = res.data ? true : false;
                        this.formData.outSend = res.data ? 1 : 0;

                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            }, 

             //获取诊断信息
            getDiagnoseInfo(){
                let idPat = this.$route.query.idPat;
                let idVisit = this.$route.query.idVisit;
                this.selectCiDiaRecord(idPat, idVisit, this.CONSTANT.OUTP_DIAGNOSIS_FLAG ).then( data => {
                    //新增状态下默认取诊断记录第一条数据
                    if(data.length > 0) {
                        let nameArr = [];
                        data.map( v => {
                            nameArr.push(v.diagnosisName);
                        })
                        this.formData.diagnosisName = nameArr.join(',')
                    }
                })
            }, 

            //切换外送
            changOutSend(e) {
                this.formData.outSend = e ? 1 : 0;
            },

             //查询树结构列表 
            findTreeList() {
                this.$axios.get("/dict/data/listParentAndChildData", {
                    dataCode: '',
                    dataClassCode: 'SD_VIEW_TYPE'
                }).then(res => {
                    if (res.success) {
                        this.treeData = this.copyObject(res.data);
                        
                        if(!res.data.length) return
                        this.curTreeKey = '';

                        //  初始界面默认tree第一条底部颜色选中
                        if(res.data[0].childVOList.length) {
                            this.curTreeKey = res.data[0].childVOList[0].idData;
                            this.$nextTick(() => {
                                this.$refs.numberTree.setCurrentKey(this.curTreeKey);
                                this.$refs.numberTree.store.nodesMap[res.data[0].idData].expanded = true;
                                this.treeLevel_1 = res.data[0].code;
                                this.treeLevel_2 = res.data[0].childVOList[0].code;
                                this.getClinicItemListByTree();
                            })
                        }
                        
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                })
            },
            //获取项目列表
            getClinicItemListByTree() {
               
                this.searchHanlde('', this.treeLevel_1, this.treeLevel_2).then( async(data) =>{
                     // 随机码校验是否一致
                    // if(this.randomNum == num || num == undefined) {
                        let commitData = data || [];   //项目集合
                        let idList = [];
                        commitData.map( v => {
                            if(v.csClinicItemLab.idClinicItem) {
                                v.idClinicItem = v.csClinicItemLab.idClinicItem
                                idList.push(v.idClinicItem)
                            }
                        })
                        
                        let gcpObj = {
                            idList: idList,
                            gcpOrders: commitData,
                        }
                        let commitGcp = await this.getDocGcpOrders (gcpObj);
                        if(!commitGcp) return
                        commitData = this.copyObject(commitGcp)

                        this.tableData = [];
                        commitData.map( v => {
                            let deptName = '';
                            let idDept = '';
                            let idSpecimen = '';
                            let specimenName = '';
                            if(v.deptList&& v.deptList.length) {
                                idDept = v.deptList[0].idDept
                                deptName = v.deptList[0].deptName
                            }
                            if(v.specimenList&& v.specimenList.length) {
                                idSpecimen = v.specimenList[0].idSpecimen
                                specimenName = v.specimenList[0].specimenName
                            }
                            this.tableData.push({
                                row_id: Math.random().toString(36).substr(2),
                                gcpIdentification: v.gcpIdentification,
                                gcpIdentificationCopy: v.gcpIdentificationCopy,
                                isGcp: v.isGcp,
                                hasChildren: v.isPackage === '1' ? true: false,
                                ...v.csClinicItemLab,
                                idDept,
                                deptName,
                                idSpecimen,
                                specimenName,
                                priceAmount: v.priceAmount,
                                attention: '',
                            })
                        })
                })
            },

            async getDocGcpOrders(gcpParmas) {
                let Obj = {
                    index: 0,
                    isEditFlag: false,
                    isForm: 'apply',
                    sdVisitType: this.filterVisitType,
                    ...gcpParmas,
                }
                let gcpOrders =  await this.commitGcpOrders(Obj);
                if(!gcpOrders) return false
                return gcpOrders
            },
            
            async searchHanlde(query = '', t1 = '', t2 = '') {
                let params = {
                    clinicItemName: query,
                    sdSubViewType: t2,
                    sdViewType: t1,
                    gcpFlag: this.inspectData.isGcpPropertyStatus ? 1 : 0,  //是否是GCP  是 1 否 0 
                    chargeTypeCode: this.inspectData.chargeTypeCode,   //费别
                }
                const resData = await this.$axios._post('/dict/inspect/listClinicItemLabForInsepect',params)
                if(resData.success) {
                    return resData.data;
                } else {
                    this.$message({
                        message: resData.message,
                        type: "warning"
                    });
                }
            },

            //tree  Node点击
            handleNodeClick(data, Node) {
                // 分类大类  点击大类不高亮
                if(Node.level === 1) {
                    this.treeLevel_1 = data.code;
                    if(data.childVOList && data.childVOList.length) {
                        this.curTreeKey = data.childVOList[0].idData;
                        this.$refs.numberTree.setCurrentKey(this.curTreeKey);
                        this.treeLevel_2 = data.childVOList[0].code;
                        this.getClinicItemListByTree();
                    }
                }

                // 分类小类
                if(Node.level === 2) {
                    this.treeLevel_1 = Node.parent.data.code;
                    this.treeLevel_2 = data.code;
                    this.curTreeKey = data.idData;
                    this.getClinicItemListByTree();
                }

            },

            //查询项目是否关联适应症  
            async getInsByIdClinicItem(list) {
                this.IndicationsForm.IndicationInfoList = [];
                if(!list.length) return 
                let result = await this.getIndicationsBrOrATM(list);
                this.$nextTick(()=> {
                    this.IndicationsForm.IndicationInfoList = result;
                })
            },

            //删除检验项目
            deleteItemTest(index) {
                if(this.isDisabled) return
                this.alreadyAddItems.splice(index, 1);
            },

            showTitle(item, flag) {
                let clinicItemName = item.clinicItemName || '';
                let specimenName = item.specimenName ?  '(' + item.specimenName + ')' :'';
                let sum = clinicItemName + specimenName
               
                if(flag ) {
                    return sum.length < 16 ? true : false
                } else {
                    return clinicItemName + ' ' + specimenName
                }
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
                    title: '医嘱录入',   //模块
                    subTitle: '申请单提交', //子模块
                    url: this.routerPath,
                }]
                this.buryingPoint(parame, 'hospitalDoctor');
            },

        },
        watch: {
            'idClinicItemsList': {
                handler(newName, oldName) {
                    // console.log('监听---',newName, oldName);
                    this.$nextTick(()=> {
                        this.getInsByIdClinicItem(newName);
                    })
                },
                deep: true,
            },
        }
    };

</script>

<style lang="scss" src="../index.scss"></style>
