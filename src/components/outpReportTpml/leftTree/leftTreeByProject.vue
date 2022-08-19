<template>
    <div class="box-left leftTreeByProject commonTree">
        <el-collapse v-model="activeName" accordion v-show="showCollapse">
            <el-collapse-item
                :disabled="collapseDisable(item)"
                :title="item.title"
                :name="item.id"
                v-for="(item, index) in treeList "
                :key="index"
            >
            <template slot="title" v-if="collapseDisable(item)">
                {{item.title}} <span class="noCheckData">{{noCheckData}}</span> 
            </template>
                <el-tree
                    class="filter-tree"
                    highlight-current
                    :data="dataObj[item.dataName]"
                    :props="defaultProps"
                    node-key="treeId"
                    accordion
                    render-after-expand
                    auto-expand-parent  
                    :default-expanded-keys="choosedArr"
                    :current-node-key="choosedRole"
                    @node-click="handleNodeClick"
                    :ref="item.dataName"
                >
                    <span class="spanEllipsis" slot-scope="{ node }">
                        <span class="flexRow spanEllipsisSpan" v-html="handlerTree(node.label)"></span>
                    </span>
                </el-tree>
            </el-collapse-item>
        </el-collapse>
        <div v-show="!showCollapse" class="nodata el-table__empty-text">
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
export default {
    name: "leftTreeByProject",
    props: {
        reGetFlag:{
            type:Boolean,
            default:false
        },
        relaParam: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            activeName: "0",
            choosedRole: "",
            noCheckData: "[暂无报告]",
            currNode: {},
            choosedArr: [],
            treeList: [
                {
                    title: "检查报告",
                    id: "1",
                    include: [this.CONSTANT.INSPECT_TYPE],
                    dataName: "checkTreeData",
                },
                {
                    title: "检验报告",
                    id: "2",
                    include: [
                        this.CONSTANT.TEST_TYPE,
                        this.CONSTANT.SPECIAL_INSPECT_TYPE,
                    ],
                    dataName: "testTreeData",
                },
                 
                {
                    title: "病理报告",
                    id: "3",
                    include: [this.CONSTANT.PATHOL0GY_TYPE],
                    dataName: "pathTreeData",
                },
            ],
            dataObj: {
                checkTreeData: [], //检查报告数据
                testTreeData: [], //检验报告数据
                pathTreeData: [], //病理报告数据
            },
            defaultProps:{
                children: "children",
                label(val) {
                    return val;
                    // if (val.children) {
                    //     return val
                    // }
                    // return val.reportDateTime;
                }
            }
        };
    },
    computed: {
        treeMap() {
            let map = new Map();
            this.treeList.forEach((item) => {
                item.include.forEach((it) => {
                    map.set(it, item);
                });
            });
            return map;
        },
        showCollapse(){
            return this.activeName !== '0'
        },
        getInpatient(){ // 住院标识
            return this.relaParam.type === 'inPatient' 
        },
    },
    methods: {
        handlerTree(val){
            if(val.children){
                return `<span class="line_clamp" title="${val.itemName}">${val.itemName}</span><span>【最新：${val.reportDateTime}】</span>`
            }
            let leftTitle = `${+val.isApply ? '申请：'+val.visitDate : '报告：'+ val.reportDateTime}`
            let flag = +val.isApply? 'gray': ''
            if(val.statusDesc){
                return `<span class="line_clamp ${flag}" title="${leftTitle + val.statusDesc}">${leftTitle} &ensp;</span><span class="${flag}">${val.statusDesc}</span>`
            }
            return `<span class="cont noStatusDesc ${flag}" title="${leftTitle}">${leftTitle}</span>`
        },
        collapseDisable(item){
            return !this.dataObj[item.dataName].length
        },
        handleNodeClick(val,node) {
            if (!val.children) {
                this.$emit("setCurrentRow", val);
            } else {
                if(node&&!node.expanded){
                    this.$emit("setCurrentRow", {});
                    return 
                }
                if(node){
                    this.currNode = node
                }
                let dataName = this.treeList[this.activeName-1].dataName
                this.selectNode(dataName,val)
            }
        },
        selectNode(dataName,currPat){
            this.handleNodeClick({})
            this.$nextTick(() => {
                if(!this.dataObj[dataName].length){
                    return
                }
                let current = currPat||this.dataObj[dataName][0]
                let currChild = current.children[0]
                this.choosedRole = currChild.treeId
                this.$refs[dataName][0].setCurrentKey(this.choosedRole);
                this.choosedArr=[current.treeId]
                this.handleNodeClick(currChild)
            });
        },
        init() {},
    },
    created() {
        // this.init();
    },
    watch: {
        "relaParam.treeDataOptions": {
            handler(val) {
                if(this.reGetFlag){
                    return
                }
                if (val.length) {
                    this.activeName = "";
                    Object.keys(this.dataObj).forEach((item) => {
                        this.dataObj[item] = [];
                    });
                    val.forEach((item) => {
                        let currTree = this.treeMap.get(item.sdClinicType)
                        let dataName = currTree.dataName;
                        this.dataObj[dataName].push(item);
                    });
                    // 展开第一项的第一列
                    this.treeList.forEach(item=>{
                        let dataName = item.dataName;
                        let currPat = this.dataObj[dataName][0]
                        if(currPat && !this.activeName){
                            let curr = currPat.children[0]
                            if(curr){
                                this.$nextTick(()=>{
                                    this.activeName = item.id;
                                })
                            }
                        }
                    })
                }else{
                    this.activeName = '0'
                    this.handleNodeClick({})
                }
            },
        },
        activeName(val){
            if(val && val !=="0"){
                let dataName = this.treeList[val-1].dataName
                if(this.currNode.expanded){
                    this.currNode.expanded = false
                }
                this.selectNode(dataName)
            }else{
                this.handleNodeClick({})
            }
        }
    },
};
</script>

<style lang="scss">
    @import './leftTree.scss';
</style>