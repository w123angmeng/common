<template>
    <div class="inspectCon flexColumn">
        <p class="f16 c26 title">检查申请</p>
        <!-- 隐藏模糊搜索：因为涉及同一个项目在不同的部位下 -->
        <!-- <div class="changeBox">
            <el-select
                v-model="selectedClinicItem"
                @change="changeClinicItem"
                filterable
                clearable
                value-key="idClinicItem"
                remote
                reserve-keyword
                placeholder="请输入"
                :remote-method="remoteClinicItem"
                @focus="remoteClinicItem('')"
                :loading="loading">
                <el-option
                    v-for="(item, index) in clinicItemList"
                    :key="'item.dataCode' + index"
                    :label="item.clinicItemName"
                    :value="item">
                </el-option>
            </el-select>
        </div> -->
        <div class="inspectTree">
            <el-tree
                class="inspectTreeDatas hisCommonTree modifiedLevel3"
                ref="clinicTypeTree"
                :data="treeList"
                :props="defaultProps"
                node-key="idData"
                current-node-key
                highlight-current
                :default-expand-all="false"
                :expand-on-click-node="true"
                :default-expanded-keys="defaultExpandedKeys"
                :load="queryLoad" lazy
                accordion>
                <span class="span-ellipsis" slot-scope="{node, data}"
                    @dblclick="handleNodeDblClick(node, data)">
                    <span :title="data.name">{{data.name}}</span>
                </span>
            </el-tree>
        </div>
    </div>
</template>
<script>
import bus from "@/components/common/bus.js";

export default {
    props:{
        inspectData:{
            type: Object,
            default: ()=>({})
        }
    },
    data(){
        return {
            options: [],
            treeList:[],
            defaultProps: {
                children: 'childVOList',
                label: 'name',
                isLeaf: 'leaf'
            },
            loading: false,         //搜索加载状态
            clinicItemList: [],    //检查项目列表（模糊搜索select）//暂时弃用
            selectedClinicItem: [], // 选中的检查项目（模糊搜索select）//暂时弃用
            defaultExpandedKeys: [], //默认展开的树节点
           
        }
    },
    async created(){
        await this.remoteClinicTypeTree();
        this.initTreeExpandedAndSelected();
    },
    methods:{

        //获取检查类型、部位的树形数据
        remoteClinicTypeTree() {
            return this.$axios.get("dict/data/listParentAndChildData", {
                dataClassCode: "SD_CLINIC_TYPE",
                dataCode: this.CONSTANT.INSPECT_TYPE, //检查
            }).then(res => {
                if (res.success) {
                    this.treeList = res.data || [];
                } else {
                    this.$message({
                        message: res.message,
                        type: "warning"
                    });
                }
            });
        },

        //默认展开第一个检查类型、选中第一个检查类型
        initTreeExpandedAndSelected() {
            //默认展开第一个检查类型、选中第一个检查类型
            let defaultExpandedKeys = [];
            if(this.treeList[0]){
                defaultExpandedKeys.push(this.treeList[0].idData);
                this.$nextTick(()=>{
                    this.$refs.clinicTypeTree.setCurrentKey(this.treeList[0].idData);
                })
            }
            this.defaultExpandedKeys = defaultExpandedKeys;
        },

        //重置为页面初始选中状态
        resetPageState(){
            for(let k in this.$refs.clinicTypeTree.store.nodesMap){
                this.$refs.clinicTypeTree.store.nodesMap[k].expanded = false;
            }
            if(this.treeList.length) {
                this.$refs.clinicTypeTree.store.nodesMap[this.treeList[0].idData].expanded = true;
                this.$refs.clinicTypeTree.setCurrentKey(this.treeList[0].idData);
            }
        },

        //双击树节点（检查项目），添加到已选列表
        handleNodeDblClick(node, data) {
            // 类型是 检查项目
            if(data.idClinicItem){
                bus.$emit('inspectListInsert', data);
            }
        },

        //查询检查项目，添加到树节点的childVOList
        async queryLoad(node, resolve) {
            if(node.level == 1){ //检查类型
                return resolve(node.data.childVOList || []);
            }
            if(node.level == 2){ //检查部位
                if(node.data.loadChildren){
                    return resolve(node.data.childVOList || []);
                }else{
                    let resData = await this.getClinicItem({
                        sdSubExamType: node.data.code,     //部位
                        sdSubClinicType: node.parent.data.code, //检查类型
                    });
                    if (resData.success) {
                        let dataArr = resData.data;
                        dataArr = this.repeatArrayElements(dataArr, 'idClinicItem');
                        dataArr = dataArr.map((item, index) => {
                            item.idData = `lx_${node.parent.data.idData}_bw_${node.data.idData}_index_${index}`;
                            //处理部位、部位str
                            item.sdSubExamType = node.data.code;
                            item.sdSubExamTypeStr = node.data.name;
                            item.sdSubExamId = node.data.idData;
                            item.name = item.clinicItemName;
                            item.leaf = true;
                            return item;
                        });
                        node.data.childVOList = dataArr;
                        node.data.loadChildren = true; //标记：该部位的检查项目-加载完成
                        return resolve(dataArr)
                    } else {
                        this.$message({
                            type: 'error',
                            message: resData.message
                        })
                        return resolve([])
                    }
                }
            }
            return resolve([]);
        },

        //根据类型和部分查询到检查项目
        getClinicItem(data) {
            let params = {
                idDept: '',           //执行科室
                clinicItemName: '',   //项目名称
                sdSubExamType: '',    //部位
                sdSubClinicType: '', //检查类型
                gcpFlag: this.inspectData.isGcpPropertyStatus ? 1 : 0, //是否是GCP  是 1 否 0
                chargeTypeCode: this.inspectData.chargeTypeCode,   //费别
            };
            Object.assign(params, data);
            return this.$axios.post('dict/clinicExam/findListByQuery', params)
        },

        //检查项目 -- 模糊查询
        async remoteClinicItem(query = '') {
            let resData = await this.getClinicItem({
                clinicItemName: query,                          //项目名称
            });
            if (resData.success) {
                let dataArr = resData.data;
                dataArr = this.repeatArrayElements(dataArr, 'idClinicItem');
                this.clinicItemList = dataArr;
            } else {
                this.$message({
                    type: 'error',
                    message: resData.message
                })
            }
        },

        //切换检查项目
        changeClinicItem(item) {
            bus.$emit('inspectListInsert', item);
            this.$nextTick(()=>{
                this.selectedClinicItem = null;
            })
        },

    },
    watch: {
    },
}
</script>
<style src='./inspectCon.scss' lang="scss" scoped>
</style>
