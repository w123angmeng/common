<template>
    <div class="TmpMainPhySigns">
        <el-tabs class="tabs" v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="体温单项目列表" name="1">
                <PhySignTable v-if="curIndex == 1" @changeTab="changeTab" :comDataObj="comDataObj"></PhySignTable>
            </el-tab-pane>
            <!-- <el-tab-pane label="体征项目维护" name="2">
                <PhySignMaintain v-if="curIndex == 2" @changeTab="changeTab"></PhySignMaintain>
            </el-tab-pane> -->
        </el-tabs>
    </div>
</template>
<script>
    const tempUrl = window.globalUrl.tempUrl;
    const findFrequencyList = tempUrl + "/timeaxis/util/findFrequencyList"; // 查询录入频率列表
    const findEnabledList = tempUrl + "/timeaxis/util/findEnabledList"; // 查询状态列表
    const findDeptList = tempUrl + "/timeaxis/util/findDeptList"; // 查询部门列表
    const findUseRangeList = tempUrl + "/timeaxis/util/findUseRangeList"; // 查询使用范围列表
    import { mapGetters } from 'vuex';
    import PhySignMaintain from './phySignMaintain/phySignMaintain.vue';
    import PhySignTable from './phySignTable/phySignTable.vue';
    export default {
        data() {
            return {
                activeName: '1',
                curIndex: 1,
                comDataObj: {
                    useRangeData: [], // 使用范围数据
                    freqList: [], // 录入频率
                    deptList: [], // 科室列表
                    enabledList: [], // 状态
                }
            };
        },
        created() {
            this.findUseRangeData();
            this.findfreqData();
            this.findDeptData();
            this.findEnabledData();
        },
        watch: {

        },
        components: {
            PhySignMaintain,
            PhySignTable
        },
        mounted() {

        },
        methods: {
            // 使用范围
            findUseRangeData() {
                this.$axios.post(findUseRangeList, {}).then(res=>{
                    if (res.success){
                        this.comDataObj.useRangeData = res.data;
                    }
                })
            },
            // 录入频率
            findfreqData() {
                this.$axios.post(findFrequencyList, {}).then(res=>{
                    if (res.success) {
                        this.comDataObj.freqList = res.data;
                    }
                })
            },
            // 科室列表
           findDeptData() {
                this.$axios.post(findDeptList, {}).then(res=>{
                    if (res.success) {
                        this.comDataObj.deptList = res.data;
                    }
                })
            },
            // 状态
            findEnabledData() {
                this.$axios.post(findEnabledList, {}).then(res=>{
                    if (res.success) {
                        this.comDataObj.enabledList = res.data;
                    }
                })
            },
            //切换tab
            handleClick(tab) {
                this.curIndex = tab.name;
            },
            changeTab(obj) {
                console.log(obj)
                this.curIndex = Number(obj.activeName);
                this.activeName = obj.activeName.toString();
            }
        }
    }

</script>

<style lang="scss" src="./tmpMainPhySigns.scss">

</style>
