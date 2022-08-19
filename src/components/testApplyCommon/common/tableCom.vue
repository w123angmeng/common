<template>
    <div class='tableComs'>
        <el-table 
            :data="tableData"
            style="width: 100%" 
            :header-cell-style="tableTitleStyle" 
            highlight-current-row
            row-key="row_id"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            lazy
            :load="load"
            stripe
            :show-header="false"
            :cell-style="cellStyle">
            <el-table-column prop="clinicItemName" label="项目名字" width="" align="left" show-overflow-tooltip>
                 <template slot-scope="scope">
                     <span v-if="!scope.row.isChildren">{{scope.row.clinicItemName}}</span>
                     <span v-else>
                        <el-checkbox :disabled="isDisabled" v-model="scope.row.ischecked"></el-checkbox>
                        <span>{{scope.row.clinicItemName}}</span>
                     </span>
                 </template>    
            </el-table-column>
            <el-table-column prop="specimenName" label="标本"  align="center" width="260">
                <template slot-scope="scope" >
                    <el-select
                        class="idSpecimen" 
                        v-model="scope.row.specimenName" 
                        @change="(e)=> {changeIdSpecimen(e,scope.row, scope.$index)}"
                        filterable 
                        :clearable="false"
                        :disabled="isDisabled"
                        remote
                        :remote-method="(query) =>{remoteSample(query, scope.row, scope.$index)}"
                        @focus="(query) =>{remoteSample('', scope.row, scope.$index)}"
                        reserve-keyword 
                        placeholder="请选择" 
                        ref="idSpecimenRef">
                        <el-option 
                            v-for="(item, index) in sampleList" 
                            :key="'item.idSpecimen' + index"
                            :label="item.specimenName" 
                            :value="item.specimenName">
                        </el-option>
                    </el-select>
                    <el-input style="width: 140px;" v-model="scope.row.attention" placeholder="备注"></el-input>
                    
                </template>
            </el-table-column>
            <el-table-column  width="90" align="left">
                <template slot-scope="scope">
                    <template v-if="isShowGcpBtn(scope.row, scope.$index) && scope.row.gcpIdentification=== CONSTANT.GCP_FLAG_ATM">
                        <span  
                            class="showGcp" 
                            :class="showGcpFlagClass(scope.row, scope.$index)"
                            @click="changeCurGcp(scope.row, scope.$index)">
                            GCP
                        </span>
                    </template>
                </template>
            </el-table-column>
            <el-table-column prop="priceAmount" label="金额" width="90" align="right" show-overflow-tooltip>
                <template slot-scope="scope">
                    {{scope.row.priceAmount ? Number(scope.row.priceAmount).toFixed(2) : ""}}
                </template>
            </el-table-column>
            <el-table-column width="20px"></el-table-column>
            <el-table-column label="操作" width="50" align="left">
                <template slot-scope="scope">
                    <el-button 
                        v-if="!scope.row.isChildren"
                        type="text"
                        :disabled="isDisabled"
                        @click="handlerAddClinicItem(scope.row, scope.$index)">
                        添加
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    import mixinsGcpAtm from "@/components/page/Common_WEB/mixins/mixinsGcpAtm.js";
 
    export default {
        mixins:[mixinsGcpAtm],
        props: {
            tableData: {
                type: Array,
                default: () => {
                    return []
                }
            },
            inspectData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            form: {
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
            isGcpPat: {
                type: Boolean,
                default: () => {
                    return false
                }
            },
            isFromInpDoctor: {
                type: Boolean,
                default: false
            },
        },
        data() {
         
            return {
                sampleList: [],
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
            };
        },
        computed: {
            ...mapGetters(["docCloseVisitState"]),
            isDisabled() {
                return this.docCloseVisitState || this.isEdit
            },
        },
        methods: {
            load(tree, treeNode, resolve) {
               
                this.$axios._post("/dict/inspect/listPackageItemByIdClinicItem", {
                    idClinicItem: tree.idClinicItem,
                    gcpFlag: this.inspectData.isGcpPropertyStatus ? 1 : 0, //是否是GCP  是 1 否 0
                    chargeTypeCode: this.inspectData.chargeTypeCode,   //费别
                })
                .then(async(res) => {
                    if (res.success) {
                        let commitData = res.data || [];   //项目集合

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


                        let childrenTableData = [];
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
                            childrenTableData.push({
                                row_id: Math.random().toString(36).substr(2),
                                parent_id: tree.idClinicItem,
                                gcpIdentification: v.gcpIdentification,
                                gcpIdentificationCopy: v.gcpIdentificationCopy,
                                isGcp: v.isGcp,
                                ischecked: true,
                                isChildren: true,
                                ...v.csClinicItemLab,
                                idDept,
                                deptName,
                                idSpecimen,
                                specimenName,
                                priceAmount: v.priceAmount,
                                attention: '',
                            })
                        })

                        this.tableData.map( v => {
                            if(tree.idClinicItem === v.idClinicItem) {
                                v.children = childrenTableData;
                            }
                        })

                        setTimeout(()=> {
                            resolve(childrenTableData)
                        },700)

                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

             async getDocGcpOrders(gcpParmas) {
                let Obj = {
                    index: 0,
                    isEditFlag: false,
                    isForm: 'apply',
                    sdVisitType: this.form.sdVisitType,
                    ...gcpParmas,
                }
                let gcpOrders =  await this.commitGcpOrders(Obj);
                if(!gcpOrders) return false
                return gcpOrders
            },
            

            // 标本 -- 模糊查询
            remoteSample(query = '', row, index) {
                let queryStr = query ?  query : row.specimenName;

                this.$axios.post("/dict/inspect/listSpecimen", {
                        specimenName: queryStr,
                        sdClinicType: this.CONSTANT.TEST_TYPE,   //检验3
                    })
                    .then(res => {
                        if (res.success) {

                            this.sampleList = res.data;

                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            });
                        }
                    });
            },

            //切换标本
            changeIdSpecimen(e, row, index) {
                let Row;
                if(row.isChildren) {
                    this.tableData.map( v => {
                        if(row.parent_id === v.idClinicItem) {
                            v.children.map( (item, index)=> {
                                if(item.idClinicItem === row.idClinicItem) {
                                    Row = v.children[index];
                                }
                            });
                        }
                    })

                } else {
                    Row = this.tableData[index];
                }
                Row.idSpecimen = "";
                this.sampleList.map( v => {
                    if(v.specimenName ===e) {
                        Row.specimenName = v.specimenName;
                        Row.idSpecimen = v.idSpecimen;
                    }
                })
            },

            //新增项目
            handlerAddClinicItem(row, index) {

                if(row.children && row.children.length) {
                    let checkRow = []
                    row.children.map( v => {
                        if(v.ischecked) {
                            checkRow.push(v)
                        }
                    })
                    if(checkRow.length === row.children.length) {
                        this.getClinicPriceRela(row, index);
                    } else {
                        checkRow.map( v =>{
                            this.getClinicPriceRela(v);
                        })
                    }
                } else {
                    //关联价表
                    this.getClinicPriceRela(row, index);
                }
            },

             //查询项目是否关联价表
            getClinicPriceRela(row, index) {
                // 住院医生不查价表
                if(this.isFromInpDoctor){
                    this.$emit('appendTest', row, false)
                    return;
                }
                this.$axios
                    .get('/dict/clinicItem/countClinicPriceRela', {
                        idClinicItem: row.idClinicItem,
                    })
                    .then(res => {
                        if (res.success) {
                           // 新增项目 反查标本和科室 
                            // this.findInspectInfoById(row, index);
                             this.$emit('appendTest', row, false)
                        } else {
                            this.$message.warning(res.message);
                        }
                    })
            },

             //展示gcp样式
            showGcpFlagClass(item, index) {
                if(item.gcpIdentificationCopy == this.CONSTANT.GCP_FLAG_ATM) {
                    return 'gcpFlagAtm'
                }
                
                return 'unGcpFlagAtm'
            },

            changeCurGcp(item, index) {
                if(this.isDisabled) return
                item.isGcp = item.gcpIdentificationCopy == this.CONSTANT.GCP_FLAG_ATM;
                item.isGcp = !item.isGcp;
                item.gcpIdentificationCopy = item.isGcp ? this.CONSTANT.GCP_FLAG_ATM : this.CONSTANT.UN_GCP_FLAG_ATM;
            },

        },
        watch: {
            
        }
    };

</script>

<style lang="scss" src="../index.scss"></style>
