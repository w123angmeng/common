<template>
    <div class="box-left leftTreeByProject commonTree">
        <el-tree
            v-show="showTree"
            class="filter-tree"
            highlight-current
            :data="treeData"
            :props="defaultProps"
            node-key="treeId"
            accordion
            auto-expand-parent  
            :default-expanded-keys="choosedArr"
            :current-node-key="choosedRole"
            @node-click="handleNodeClick"
            ref="tree"
        >
            <span class="spanEllipsis" slot-scope="{ node }">
                <span class="flexRow spanEllipsisSpan"  v-html="handlerTree(node.label)"></span>
            </span>
        </el-tree>
        <div v-show="!showTree" class="nodata el-table__empty-text">
            <div class="empty_list_block">
                <img src="@/assets/images/doctws/list_empty.png" alt="" />
                <div class="empty_txt">
                    暂无数据
                </div>
            </div>
        </div>
    </div>
</template>

<script>
let that;
export default {
    name: "leftTreeByType",
    props:{
        reGetFlag:{
            type:Boolean,
            default:false
        },
        relaParam:{
            type:Object,
            default(){
                return {}
            }
        }
    },
    data() {
        return {
            choosedRole: "",
            choosedArr: [],
            treeData:[],
            defaultProps: {
                children: "visitChildren",
                label(val) {
                    if (val.visitChildren) {
                        return val.visitDate;
                    }
                    return val;
                },
            }
        };
    },
    computed: {
        showTree(){
            return !!this.treeData.length
        },
        getInpatient(){ // 住院标识
            let type = this.relaParam ? this.relaParam.type : '';
            return type === 'inPatient' 
        },
    },
    methods: {
        handlerTree(val){
            if(typeof val === 'string'){
                return `<span title="${val}">就诊：${val}</span>`
            }
            let leftTitle = `${val.reportDateTime ? '报告：'+ val.reportDateTime : '申请：'+ val.applyDate}`
            let flag = !val.reportDateTime
            if(val.statusDesc){ // 检查检验
                return `<span class="cont ${flag? 'gray': ''}" title="${val.itemName}">${leftTitle} ${val.itemName}</span>
                        <span class="statusDesc ${flag? 'gray': ''}">${val.statusDesc}</span>`
            }
            // 病理
            return `<span class="cont noStatusDesc ${flag? 'gray': ''}" title="${val.itemName}">${leftTitle} ${val.itemName}</span>`
        },
        handleNodeClick(val,node) {
            if (!val.visitChildren) {
                this.$emit("setCurrentRow", val);
            } else {
                if(node&&!node.expanded){
                    this.$emit("setCurrentRow", {});
                    return 
                }
                this.selectNode('tree',val)
            }
        },
         selectNode(dataName,currPat){
            this.choosedArr = []
            this.handleNodeClick({})
            this.$nextTick(() => {
                let current = currPat
                let currChild = current.visitChildren[0]
                this.choosedRole = currChild.treeId
                this.$refs[dataName].setCurrentKey(this.choosedRole);
                this.choosedArr.push(current.treeId)
                this.handleNodeClick(currChild)
            });
        },
        async getData() {
            let receivePatientParams = JSON.parse(
                sessionStorage.getItem("receivePatientParams")
            ); //缓存里患者基本信息
            let Obj = {
                patientId: receivePatientParams
                    ? receivePatientParams.patCode
                    : this.relaParam.docPatientParams.patCode,
                idPat: receivePatientParams
                    ? receivePatientParams.idPat
                    : this.relaParam.docPatientParams.idPat,  
                sdClinicTypeList: this.relaParam.sdClinicTypeList,
                beginDate: this.relaParam.beginDate,
                endDate: this.relaParam.endDate,
                pageSize: 9999,
            };
            let url = "/outpdr/report/visitAll";
            if(this.relaParam.type === 'inPatient'){
                url = '/doctws/applyReport/visitAll';
            }
            // url = window.globalUrl.baseURL11 + url;
            await this.$axios
                ._post(url, Obj)
                .then((res) => {
                    let data = res.data;
                    if (res.success) {
                        this.treeData = data
                        console.log(this.treeData);
                        if(this.treeData.length){
                            this.handleNodeClick(this.treeData[0])
                        }
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning",
                        });
                    }
                });
        },
    },
    watch:{
        reGetFlag(val){
            if(this.getInpatient){ // 住院默认展示就诊
                !val && this.getData()
            }else{
                val && this.getData()
            }
        },
    }
};
</script>
<style lang="scss">
    @import './leftTree.scss';
</style>