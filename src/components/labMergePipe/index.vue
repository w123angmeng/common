<template>
    <div class="testMergePipe_Box">
        <el-dialog 
            title="申请单合并" 
            :visible.sync="mergePipeForm.visible" 
            :close-on-click-modal="false" 
            :close-on-press-escape="false"
            class="mergePipeDialog" 
            width="1080px">
            <el-table
                height="100%"
                class="table-fixed"
                :cell-style="cellStyle"
                :header-cell-style="tableTitleStyle"
                ref="tableData"
                border
                :data="tableData"
                :row-class-name="showBChildrenBg"
                style="width: 100%">
                <el-table-column prop="sdOrderStatusName" label="状态" width="70" align="left" show-overflow-tooltip>
                    <template slot-scope="scope" v-if="isGroup(scope.row,'idFormFontRange')">
                        {{scope.row.sdOrderStatusName}}
                    </template>
                </el-table-column>
                <el-table-column prop="applyLabCode" label="申请单号" width="170" align="left" show-overflow-tooltip>
                    <template slot-scope="scope" v-if="isGroup(scope.row,'idFormFontRange') && !saveStatus(scope.row)">
                        {{scope.row.applyLabCode }}
                    </template>
                </el-table-column>
                <el-table-column prop="ordersName" label="检验项目"  align="left" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="dtCreate" label="下达时间" width="160" align="left" show-overflow-tooltip>
                    <template slot-scope="scope" v-if="isGroup(scope.row,'idFormFontRange')">
                        {{scope.row.dtCreate}}
                    </template>
                </el-table-column>
                <el-table-column prop="applyEmpName" label="下达医生" width="80" align="left" show-overflow-tooltip>
                    <template slot-scope="scope" v-if="isGroup(scope.row,'idFormFontRange')">
                        {{scope.row.applyEmpName}}
                    </template>
                </el-table-column>
                <el-table-column prop="dtOrderStart" label="首次执行时间" width="160" align="left" show-overflow-tooltip>
                    <template slot-scope="scope" v-if="isGroup(scope.row,'idFormFontRange')">
                        {{scope.row.dtOrderStart}}
                    </template>
                </el-table-column>
                <el-table-column label="合并" width="50" align="left">
                    <template slot-scope="scope" v-if="isGroup(scope.row,'idFormFontRange')">
                        <el-checkbox v-model="scope.row.checked" @change="changeRowCheck(scope.row)"></el-checkbox>
                    </template>
                </el-table-column>
            </el-table>    
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancel()">忽略</el-button>
                <el-button :loading="saveloading" :disabled="!filterCheckedArray.length" type="primary" @click="submitMerge">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import { mixinSaveLoading } from "@/components/page/Common_WEB/mixins/mixinSaveLoading";
export default {
    props: {
        mergePipeForm: {
            type: Object,
            default: () => {
                return {}
            }
        },
    },
    mixins:[mixinSaveLoading],
    data () {
        return {
            tableData: [],

            idFormObj:{},

            tableTitleStyle: {
                fontSize: "14px",
                color: "#000",
                padding: "0px",
                height: "32px",
                lineHeight: "32px",
                background: "#f5f5f5",
            },
            cellStyle: {
                fontSize: "14px",
                height: "32px",
                lineHeight: "32px",
                color: "#333",
                padding: "0px",
            },
        }
    },
    computed: {
        ...mapGetters(["docPatientParams"]),
        isMergeFromApply() {
            return this.mergePipeForm.isFromApply || false
        },
        sameGroupObj() {
            return this.mergePipeForm.mergeObj;
        },
        filterCheckedArray() {
            let rows = this.tableData.filter( item => {
                if(item.checked) return item
            })
            // console.log(rows);
            return rows
        },
        filterSaveCheckedArray() {
            let checkRows = this.filterCheckedArray.filter( v => this.saveStatus(v))
            return checkRows
        },

        filterCheckedObj() {
            let obj = {};
            this.filterCheckedArray.map(row => {
                if(!obj[row.sameGourp]){
                    obj[row.sameGourp] = [row]
                }else{
                    obj[row.sameGourp].push(row) 
                }
            })
            return obj
        },
        filterApplyMapData() {
            let map = new Map();
            this.mergePipeForm.applyCommitList.forEach((item) => {
                let row = item.rows[0];
                map.set(this.rowKey(row), JSON.stringify(item));
            });
            return map;
        },
        filterCurIndexsApply() {
            let indexs = this.filterSaveCheckedArray.map( item => {
                return Number(item.curIndex)
            })
            return indexs
        },
    },
    created () {
        this.handerAssignMergeData();
        console.log(this.mergePipeForm);
    },
    methods: {

        rowKey(item) {
            let num = item.curIndex || ''
            return `${item.sdSubClinicType}_${item.idSpecimen}_${item.idClinicItem}_${item.idDept}*_${num}`
        },

        handerAssignMergeData() {
            this.tableData = [];
            for (let key in this.sameGroupObj) {
                let oneGroup = this.sameGroupObj[key];
                oneGroup.map( item => {
                    this.$set(item, 'cellRowBg', false);
                    this.$set(item, 'checked', false);
                    this.$set(item, 'sameGourp', key);
                    this.$set(item, 'idForm', item.idApplyLab);

                    if(item.dtOrderStart) item.dtOrderStart = item.dtOrderStart.substring(0, 16)
                    if(item.dtCreate) item.dtCreate = item.dtCreate.substring(0, 16)
                   
                    if(this.saveStatus(item)) {
                         //如果是检验申请单， 自定义组装 idApplyLab 唯一性
                        if(this.isMergeFromApply) {
                            let m = this.filterApplyMapData.get(this.rowKey(item));
                            item.idApplyLab = item.idForm = `${m}`
                        }
                    }
                    this.tableData.push(item);
                })
            }
            this.handerSameGroupColor();
            this.$nextTick(()=> {
                this.tableData.map(item => {
                    this.defaultCheckNewTimeApply(item);
                    this.saveDefaultChecked(item);
                })
                console.log("组装渲染---", this.tableData);
            })
        },
        //处理不同组颜色
        handerSameGroupColor() {
            let arr =  Object.keys(this.sameGroupObj);
            arr.forEach((item, index) => {
                if(index % 2 !== 0) {
                    let sameGroupRows = this.sameGroupObj[item]
                    sameGroupRows.forEach( v => {
                        v.cellRowBg = true;
                    })
                }
            })
             this.mergePipeForm.mergeObj = this.sameGroupObj
        },
        //已保存状态
        saveStatus(row) {
            return row.sdOrderStatus === '0';
        },

        showBChildrenBg({ row, rowIndex }) {
            if(row.cellRowBg) {
                return "BChildrenBg";
            }
        },

        //勾选状态
        selectableHandler(row){
            let group = this.idFormObj[row.idForm]
            if(group){
                let flags = group.some(item=>{
                    return item.checkMessage
                })
                return !flags
            }
            return !row.checkMessage
        },

        idFormObjHandler(row){
            return this.idFormObj[row.idForm]
        },
        //校验一组已提交/已审核状态下医嘱有无选中
        validitSubmitChecked(row) {
            
            let sameArr = this.sameGroupObj[row.sameGourp];
            let st = sameArr.some( item => {
                return item.checked && !this.saveStatus(item)
            })
            return st
        },

         //一个申请单默认全选
        applyDefaultChecked(row) {
            
            let rows = this.idFormObjHandler(row);
            rows.map( item => {
                item.checked = true
            })
        },

         //多个申请单互斥
        moreApplyChecked(row) {
            
            let moreRows = this.sameGroupObj[row.sameGourp];
            moreRows.map( item => {
                if(this.saveStatus(item)) return //不考虑保存状态
                item.checked = item.idForm === row.idForm
            })
        },

        //校验一组保存状态下医嘱有无选中
        validitSaveChecked(row) {
            
            let sameArr = this.sameGroupObj[row.sameGourp];
            let st = sameArr.some( item => {
                return item.checked && this.saveStatus(item)
            })
            return st
        },
        //一组保存状态下医嘱默认选中
        saveDefaultChecked(row) {
            
            let sameArr = this.sameGroupObj[row.sameGourp];
            sameArr.map( item => {
                if(this.saveStatus(item)) item.checked = true
            })
        },

        //一组下医嘱所有医嘱取消选中
        oneGroupCancelChecked(row) {
            
            let sameArr = this.sameGroupObj[row.sameGourp];
            sameArr.map( item => {
                item.checked = false
            })
        },
        //已提交和已审核 默认选中最新时间节点
        defaultCheckNewTimeApply(row) {
            let sameArr = this.sameGroupObj[row.sameGourp];
            let subArr = sameArr.filter( item => !this.saveStatus(item) )
            subArr.find((item, index) => {
                if(item.idForm === subArr[subArr.length -1].idForm) {
                    this.applyDefaultChecked(item);
                    return true
                }
            })
        },
        changeRowCheck(row) {
            let saveFs = this.validitSaveChecked(row);
            //勾选的是申请单
            if(!this.saveStatus(row)) {
                this.$nextTick(()=> {
                    //互斥选中
                    if(row.checked) {
                        this.moreApplyChecked(row);
                        //第一次选中已提交或者已审核的申请单  默认全选保存状态下的医嘱
                        if(!saveFs) this.saveDefaultChecked(row);
                    } else {
                        //取消选中 （同一组的所有保存状态下医嘱都取消勾选了，申请单才可以取消）
                        // let rows = this.idFormObjHandler(row);
                        // rows.map( v => v.checked =  saveFs);
                        this.oneGroupCancelChecked(row); 
                        
                    }
                    this.$forceUpdate();
                })
                return 
            }

            //处理已保存状态勾选 
            //选中
            if(row.checked) {
                let subSt = this.validitSubmitChecked(row);
                if(!subSt) this.defaultCheckNewTimeApply(row);

            } 
            //取消选中
            if(!row.checked) {
                //如果一组中保存状态下所有医嘱都取消勾选了，那么一组所有医嘱都取消选中 包括 已提交的
                if(!saveFs) this.oneGroupCancelChecked(row);
            } 
        },
        /**忽略 */
        cancel() {
            this.$emit('mergeCancel', this.mergePipeForm.applyCommitList)
            this.mergePipeForm.visible = false;
        },
        /**组装传给后端的数据 */
        handerMergeSubmitData() {
            let mergeObj = {
                idDeptSign: this.docPatientParams.idDeptAdmit,  //患者所在科室id
                signDeptName: this.docPatientParams.idDeptAdmitName,  //患者所在科室名字
                idPat: this.docPatientParams.idPat,
                idVisit: this.docPatientParams.idVisit,
                item: [],
                submitFlag: 'false',   //给后端标识，如果是true，后端需要自动调用未保存检验类统一提交，
            }
            if(this.isMergeFromApply) {
                if(this.filterSaveCheckedArray.length === this.mergePipeForm.applyCommitList.length) mergeObj.submitFlag = 'true'
            }
            for (let key in this.filterCheckedObj) {
                let oneGroup = this.filterCheckedObj[key];

                let toLab = oneGroup.filter( v => !this.saveStatus(v)).map( item => item.idApplyLab);  // 已提交  目标合并
                toLab = Array.from(new Set( toLab ))

                //医嘱录入提交  
                let fromLabArr = oneGroup.filter( v => this.saveStatus(v));  //保存
                
                let Obj = {
                    idApplyLab: toLab[0],  //目标合并 申请单
                    item: []
                }

                fromLabArr.map( v => {
                    Obj.item.push({
                        idApplyLab: v.idApplyLab,
                        ordersName: v.ordersName,
                    })
                })

                mergeObj.item.push(Obj)
            }

            console.log(mergeObj);
            return mergeObj
        },

        commitRemainApplySubmitList() {

            let remainList = [];
            this.mergePipeForm.applyCommitList.forEach((item) => {
                if(!this.filterCurIndexsApply.includes(item.curIndex)) remainList.push(item)
            });

            console.log('申请单剩余保存并提交数据-------', remainList);

            return remainList
           
        },

        /** 合管操作 */
        submitMerge() {
            this.saveloading = true;
            let parmas = this.handerMergeSubmitData();
            this.$axios._post("/doctws/inspect/togetherApplyLab", parmas).then(res => {
                if (res.success) {
                    let remainList = [];
                    //合管成功之后， 保存并提交剩余检验医嘱
                    if(this.isMergeFromApply) remainList = this.commitRemainApplySubmitList();

                    this.$emit('mergeOk', remainList, this.filterCurIndexsApply)
                    this.mergePipeForm.visible = false;
                    this.saveloading = false;
                } else {
                   this.$message.warning(res.message);
                   this.saveloading = false;
                }
            }); 
        },
    },
    watch: {
        tableData(val){
            if(val.length){
                this.idFormObj = this.idFormDataHandler(val)
            }
        },
    }
}

</script>
<style lang='scss' src='./index.scss'>
</style>