<template>
    <div class="phySignTable">
        <div class="phySignTable_wrap">
            <div class="phyHandleBox">
                <div class="search-row">
                    <div class="search-input-item">
                        <span class="labelTitle">编码</span>
                        <el-input
                            class="phyInputCss"
                            v-model="phySignForm.itemCode"
                            placeholder="请输入编码"
                            @keyup.enter.native="searchHandle"
                        ></el-input>
                    </div>
                    <div class="search-input-item">
                        <span class="labelTitle">描 述</span>
                        <el-input
                            class="phyInputCss"
                            v-model="phySignForm.itemDesc"
                            placeholder="请输入描述"
                            @keyup.enter.native="searchHandle"
                        ></el-input>
                    </div>
                    <div class="search-input-item">
                        <span class="labelTitle">使用范围</span>
                        <el-select
                            class="phyInputCss"
                            v-model="phySignForm.useRange"
                            @change="findVitalsignList()"
                            placeholder="请选择使用范围"
                            clearable
                        >
                            <el-option
                                v-for="item in comDataObj.useRangeData"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            ></el-option>
                        </el-select>
                    </div>
                    <div class="search-input-item">
                        <span class="labelTitle">录入频率</span>
                        <el-select
                            class="phyInputCss"
                            v-model="phySignForm.sdEntryFrequency"
                            placeholder="请选择录入频率"
                            clearable
                        >
                            <el-option
                                v-for="item in comDataObj.freqList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            ></el-option>
                        </el-select>
                    </div>
                    <div class="search-input-item">
                        <el-checkbox @change="batchStatusChange" v-model="batchStatus">批量录入</el-checkbox>
                    </div>
                    <div class="search-input-item">
                        <el-radio v-model="phySignForm.sdOwnerRightType" label="0">全院默认</el-radio>
                        <el-radio v-model="phySignForm.sdOwnerRightType" label="1">科室默认</el-radio>
                        <el-select class="phyInputCss" multiple collapse-tags v-model="phySignForm.idDeptList" placeholder="请选择科室" clearable>
                            <el-option
                                v-for="item in comDataObj.deptList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            ></el-option>
                        </el-select>
                    </div>
                    <div class="search-input-item">
                        <span class="labelTitle">状态</span>
                        <el-select v-model="phySignForm.enabled" placeholder="请选择状态" clearable>
                            <el-option
                                v-for="(item,index) in comDataObj.enabledList"
                                :key="index"
                                :label="item.label"
                                :value="item.value"
                            ></el-option>
                        </el-select>
                    </div>
                    <div class="search-input-item">
                        <el-button type="text" class="fz14 fontLine" @click="baseConfigHandle">公共基础配置</el-button>
                    </div>
                    <div class="search-input-item">
                        <el-button @click="searchHandle" @keyup.enter.native="searchHandle">查询</el-button>
                    </div>
                    <div class="searchBtn">
                        <el-button type="primary" @click="addPhySign">添加</el-button>
                    </div>
                </div>
            </div>

            <!-- 列表 -->
            <el-table
                :data="tableData"
                border
                class="phySignTable"
                style="width: 100%;"
                :height="tableHeight"
                highlight-current-row
                :header-cell-style="tableTitleStyle"
                :cell-style="cellStyle"
            >
                <el-table-column prop="itemCode" label="编码" align="center"></el-table-column>
                <el-table-column prop="itemDesc" label="描述" align="center"></el-table-column>
                <el-table-column prop="minMaxDesc" label="有效范围" align="center"></el-table-column>
                <el-table-column prop="lowHighDesc" label="高低值" align="center"></el-table-column>
                <el-table-column prop="itemUnit" label="单位" align="center"></el-table-column>
                <el-table-column prop="useRangeDesc" label="使用范围" align="center"></el-table-column>
                <el-table-column prop="sdOwnerRightType" label="全院" align="center">
                    <template slot-scope="scope">
                        <i :class="scope.row.sdOwnerRightType == 0 ? 'el-icon-check' : ''" ></i>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="deptNames"
                    :show-overflow-tooltip="true"
                    label="科室"
                    align="center"
                ></el-table-column>
                <el-table-column prop="serialNo" label="序号" align="center"></el-table-column>
                <el-table-column prop label="状态" align="center">
                    <template slot-scope="scope">{{scope.row.enabled ? '启用' : '禁用'}}</template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                    <template slot-scope="scope">
                        <el-button class="operBtnCss" type="text" @click="editorHandle(scope.$index, scope.row)">编辑</el-button>
                        <span class="btnRightLine">|</span>
                        <el-button
                            v-if="!scope.row.newRowFlag"
                            class="operBtnCss"
                            type="text"
                            @click="enabledHandle(scope.$index, scope.row)"
                        >{{scope.row.enabled ? '禁用' : '启用'}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="phySignPagination" >
                <el-pagination v-show="totalPages!=0" background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="phySignForm.page" :page-sizes="pageSizes"
                    :page-size="phySignForm.limit" layout="total, sizes, prev, pager, next, jumper"
                    :total="totalPages">
                </el-pagination>
            </div>
        </div>
        <el-dialog title="体温单公共基础配置" width="872px" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
            <TempComInfrast ref="tempComInfrast" @cancleTempConfig="cancleTempConfig"></TempComInfrast>
        </el-dialog>
        <el-dialog title="体温单项目维护" width="852px" :visible.sync="phySignMainVisible" @close="closePhySignMainDia"  :close-on-click-modal="false" :close-on-press-escape="false">
            <PhySignMaintain :comDataObj="comDataObj" :phySignMainForm="phySignMainForm" ref="phySignMaintain" @canclePhySignDia="canclePhySignDia" @findVitalsignList="findVitalsignList"></PhySignMaintain>
        </el-dialog>
    </div>
</template>
<script>
let tempUrl = window.globalUrl.tempUrl;
const findVitalsignItemList = tempUrl + "/timeaxis/tpnew/findVitalsignItemPageList"; // 体征项目列表
const switchVitalsignStatus = tempUrl + "/timeaxis/tpnew/switchVitalsignStatus"; // 禁用启用
const getUniqueCiVitalsignItem = tempUrl + "/timeaxis/tpnew/getUniqueCiVitalsignItem"; // 根据ID获取唯一体征项目
import { mapGetters } from "vuex";
import bus from "@/components/common/bus.js";
import PhySignMaintain from '../phySignMaintain/phySignMaintain.vue'; // 体征项目维护
import TempComInfrast from '../tempBaseConfig/tempBaseConfig.vue'; // 公共基础配置
export default {
    props:{
        comDataObj: {
            type: Object
        }
    },
    data() {
        return {
            dialogFormVisible: false, // 体温单公共基础配置
            phySignMainVisible: false, // 体征项目维护
            phySignForm: {
                useRange: "", // 使用范围
                enabled: null, // 状态
                itemCode: "", // 编码
                itemDesc: "", // 描述
                sdEntryFrequency: "", // 录入频率
                idDeptList: [], // 科室
                sdOwnerRightType: "", // 全院，科室
                batchStatus: false, // 批量录入,
                page: 1, // 页数
                limit: 10, // 每页几条数据
            },
            batchStatus: false,
            tempComInfrastForm: {},
            tableData: [],
            dataElement: [],
            editorData: {}, // 点击编辑获取当前的信息
            phySignMainForm: {
                idCiVitalsignItem: "",
                itemCode: "",
                itemDesc: "",
                dataType: "",
                dataFormat: "",
                itemUnit: "",
                minValue: "",
                maxValue: "",
                lowValue: "",
                highValue: "",
                lowAlertMsg: "",
                highAlertMsg: "",
                useRange: 0, // 0通用 1 成人 2 婴儿
                serialNo: null,
                sdOwnerRightType: "0", // 0 为全院， 1为科室
                batchStatus: false, // 批量录入
                sdShapeSign: "",
                sdEntryFrequency: "",
                mrElementId: "",
                mrElementName: "",
                hisUserId: "",
                enabled: 1, // 0禁用 1启用
                idDeptList: [],
            },
            totalPages: 0,
            pageSizes: [10],
            tableHeight: null,
            tableTitleStyle: {
                fontSize: "14px",
                color: "#000",
                padding: "10px 0",
                background: "#f5f5f5",
            },
            cellStyle: {
                fontSize: "14px",
                height: "50px",
                color: "#333",
                padding: "0",
            },
            clientHeight: null,
        };
    },
    created() {
        // this.findVitalsignList();
    },
    watch: {},
    components: {
        PhySignMaintain,
        TempComInfrast
    },
    mounted() {
        console.log(this.comDataObj)
        this.$nextTick((_) => {
            this.findVitalsignList();
            this.getTableHeight();
            window.addEventListener("resize", this.getTableHeight);
        });
    },
    destroyed() {
        window.removeEventListener("resize", this.getTableHeight);
    },
    methods: {
        // 获取体征项目列表数据
        findVitalsignList() {
            let params = this.phySignForm;
            params.batchStatus = this.phySignForm.batchStatus ? 1 : 0;
            this.$axios._post(findVitalsignItemList, params).then((res) => {
                if (res.success) {
                    this.tableData = res.data.records;
                    this.totalPages = res.data.total;
                } else {
                    this.$message({
                        message: res.message,
                        type: "error",
                    });
                }
            });
        },
        // 根据ID获取唯一体征项目
        getUniqueCiVitalsignItem(id) {
            this.$axios._post(getUniqueCiVitalsignItem, {idCiVitalsignItem: id}).then(res=>{
                if (res.success) {
                    this.phySignMainForm = res.data;
                }
            })
        },
        // 查询
        searchHandle() {
            this.findVitalsignList();
        },
        // 状态更改1:启用，0：禁用，3：删除
        enabledHandle(index, row) {
            // console.log(index, row)
            let action = row.enabled == 0 ? "启用" : "禁用";
            let content = `您确定${action}${row.itemDesc}吗？`;
            this.$confirm(content, "提示", {
                closeOnClickModal: false,
                distinguishCancelAndClose: true,
                confirmButtonText: "确定",
                cancelButtonText: "取消"
            }).then(() => {
                let enabled = row.enabled == 1 ? 0 : 1;
                let params = {
                    idCiVitalsignItem: row.idCiVitalsignItem,
                    enabled: enabled
                }
                this.$axios._post(switchVitalsignStatus, params).then((res) => {
                    if (res.success) {
                        this.$message({
                            message: res.message,
                            type: "success",
                        });
                        this.findVitalsignList();
                    } else {
                        this.$message({
                            message: res.message,
                            type: "error",
                        });
                    }
                });
            });
        },
        // 新增体征项目
        addPhySign() {
            this.phySignMainVisible = true;
            this.$emit('phySignMainVisible', true);
        },
        editorHandle(index, row) {
            this.editorData = row;
            this.getUniqueCiVitalsignItem(row.idCiVitalsignItem);
            this.phySignMainVisible = true;
        },
        closePhySignMainDia() {
            this.$refs.phySignMaintain.resetPhySignForm('phySignMainForm');
        },
        // 关闭体征项目弹框
        canclePhySignDia() {
            this.phySignMainVisible = false;
        },
        cancleTempConfig(){
            this.dialogFormVisible = false
        },
        baseConfigHandle() {
            this.dialogFormVisible = true;
            bus.$emit("tempBaseConfigData");
        },
        // 批量录入change事件
        batchStatusChange(val) {
            this.phySignForm.batchStatus = val ? 1 : 0;
            this.findVitalsignList();
        },
        // 分页导航
        handleCurrentChange(index) {
            this.phySignForm.page = index;
            this.findVitalsignList();
        },

        //单页条数
        handleSizeChange(val) {
            this.phySignForm.limit = val;
            this.findVitalsignList();
        },
        getTableHeight() {
            if(!document.documentElement.clientHeight) return
            this.clientHeight = document.documentElement.clientHeight;
            if(!document.querySelector('.phyHandleBox')) return;
            let phyHandleBox = document.querySelector('.phyHandleBox').offsetHeight;
            this.tableHeight = (this.clientHeight - phyHandleBox - 225) + 'px'
        },
    },
};
</script>

<style lang="scss" src="./phySignTable.scss">
</style>
