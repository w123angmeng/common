<template>
    <div id="isTable">
        <el-table
            class="gl-el-table"
            ref="elTable"
            v-bind="$attrs"
            v-on="$listeners"
            size="mini"
            :data="tc.list"
            style="width: 100%"
            stripe
            :border="true"
            @selection-change="selectionChange"
            v-loading="loading"
            element-loading-text="loading...">
            <!-- 提供默认插槽，允许你使用插槽的形式渲染模版 -->
            <slot name="column-before"></slot>
            <slot>
                <template v-for="(item,index) in tc.columnJson">
                    <el-table-column :align="item.align || 'center'" :key="index" v-bind="item" v-if="item.setting.visible">
                        <template slot-scope="scope">
                            <template v-if="item.render">
                                <!-- 通过render函数自定义content  v-if="scope._self.ctx" 解决fixed定位下重复渲染的问题 -->
                                <RenderColumnDom :column="scope.column" :row="scope.row" :index="scope.$index" :render="item.render"></RenderColumnDom>
                            </template>
                            <template v-else>
                                <div>{{scope.row[item.prop] | zeroPadding(item.setting.digits)}}</div>
                            </template>
                        </template>
                    </el-table-column>
                </template>

                <!-- **************************通过tableConfig配置按钮**********************按钮操作区*********************************************************** -->
                <el-table-column align="center" v-bind="tc.actionJson" v-if="tc.actionJson.label">
                    <!--操作列选项删选-->
                    <template slot="header"  slot-scope="scope">
                        <template v-if="tc.actionJson.screenItems" >
                            <glDropdownScreenItems @command="command" :columnJson="tc.columnJson"></glDropdownScreenItems>
                        </template>
                        <template v-else>
                            <span>{{tc.actionJson.label}}</span>
                        </template>
                    </template>
                    <template slot-scope="scope">
                        <template v-if="!scope.row.customAdd" v-for="(item,index) in tc.actionJson.btns">
                            <!-- 使用自定义函数配置按钮 注意：这里的 render渲染函数，当fxled有定位时会执行两次，原因见fxied实现原理，详情：https://github.com/ElemeFE/element/issues/12177 -->
                            <RenderColumnDom v-if="item.render" :column="scope.column" :row="scope.row" :index="scope.$index" :render="item.render"></RenderColumnDom>
                            <!-- 使用props配置按钮 -->
                            <el-button v-bind="item" size="mini" v-else @click="item.click && item.click({row:scope.row,index:scope.$index,event:$event})">{{item.text}}</el-button>
                        </template>
                    </template>
                </el-table-column>
            </slot>
            <!-- 提供默认插槽，允许你使用插槽的形式渲染模版 -->
            <slot name="column-after"></slot>
        </el-table>
        <template v-if="tc.isShowPagination">
            <div class="gl-el-pagination" ref="pagination">
                <el-pagination
                    size="mini"
                    @size-change="pageSizeChange"
                    @current-change="currentPageChange"
                    :current-page="query.pageIndex"
                    :page-sizes="query.pageSizes"
                    :page-size="query.pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="tc.total"
                    :hide-on-single-page="false"
                    background>
                </el-pagination>
            </div>
        </template>
    </div>

</template>

<script>
    import glDropdownScreenItems from '@/components/page/Common_WEB/GlCommon/Components/GlDropdownScreenItems'
    import glSelect from '@/components/page/Common_WEB/GlCommon/Components/GlSelect'
    import glDatePicker from '@/components/page/Common_WEB/GlCommon/Components/GlDatePicker'
    // 选项指令
    import inputNumber from '@/components/page/Common_WEB/GlCommon/directives/inputNumber'
    import inputNumber1 from '@/components/page/Common_WEB/GlCommon/directives/inputNumber1'
    import permission from '@/components/page/Common_WEB/GlCommon/directives/permission'
    import util from "@/components/page/Common_WEB/GlCommon/gl-admin/libs/util";
    import _ from "lodash";
    export default {
        name: "index",
        inheritAttrs: false,
        directives: {
            'input-number': inputNumber,
            'inputNumber1': inputNumber1,
            permission
        },
        //定义私用局部过滤器
        filters: {
            zeroPadding: (value, digits) => {
                if(!digits || !value && value != 0) return value
                return util.number.fomatFloat(value,12,digits);
            }
        },
        components: {
            RenderColumnDom: {
                functional: true,
                props: {
                    row: Object,
                    render: Function,
                    index: Number,
                    column: {
                        type: Object,
                        default: null
                    }
                },
                render: (h, ctx) => {
                    const params = {
                        row: ctx.props.row,
                        index: ctx.props.index
                    };
                    if (ctx.props.column) {params.column = ctx.props.column};
                    return ctx.props.render(h, params, ctx);
                }
            },
            glDropdownScreenItems,
            glSelect,
            glDatePicker
        },
        props: {
            tableConfig: {
                type: Object,
                default: () => { return {} }
            }
        },
        data() {
            return {
                // 是否显示删选项
                isScreenItems: false,
                // 是否显示loading
                loading: false,
                // 分页条件查询
                query: {
                    pageSize: 10,
                    pageSizes: [10, 20, 30, 40],
                    pageIndex: 0
                },
                // 默认配置项
                defaultTableConfig: {
                    // 表格数据列表
                    list: [],
                    // 表格数据总条数
                    total: 0,
                    // 起始pageSize 默认一页展示10条
                    pageSize: 10,
                    // 起始页码 默认第0页
                    pageNum: 0,
                    // 是否显示分页
                    isShowPagination: true,
                    // table 高度
                    tabelHeight: 200,
                    // 是否显示网格项
                    isShowGrid: true,
                    // 是否显示刷新按钮
                    isShowRefresh: true,
                    // table column配置json
                    columnJson: [],
                    // 按钮操作区配置
                    actionJson: {
                        label: "",
                        btns: []
                    },
                },
                // 和props 合并后的数据
                tc: {}
            }
        },
        created() {
            this.initData()
        },
        watch: {
            'tableConfig': {
                handler: function () {
                    // if(this.tableConfig.pageIndex) this.query.pageIndex = this.tableConfig.pageIndex
                    // if(this.tableConfig.pageSizes) this.query.pageSizes = this.tableConfig.pageSizes
                    // if(this.tableConfig.pageSize) this.query.pageSize = this.tableConfig.pageSize
                    this.initData()
                },
                deep: true
            }
        },
        methods: {
            initData() {
                this.tc = _.cloneDeep({...this.defaultTableConfig,...this.tableConfig})
                this.query.pageIndex = this.tc.pageIndex
                this.query.pageSizes = this.tc.pageSizes
                this.query.pageSize = this.tc.pageSize
                // 列配置
                this.tc.columnJson = this.tc.columnJson.map(item => {
                    item.setting = { visible: true, disabled: false, ...item && item.setting }
                    return item
                    // this.$set(this.tc.columnJson[i], 'setting', { visible: true, disabled: false, ...item.setting })
                })
            },
            // 派发事件
            emitGetApiData() {
                this.loading = true
                // 事件回调
                const callBack = (dataset = {}) => {
                    this.tc.list = dataset.list || []
                    this.tc.total = dataset.total || 0
                    setTimeout(() => {
                        this.loading = false
                        this.doLayout()
                    }, 100)
                }
                this.$emit('getApiData', {query: this.query, callBack})
            },
            toTablePage(page) {
                if (page) this.query.pageIndex = page;
                this.emitGetApiData();
            },
            // 筛选相关-点击查询 Boolean为false,默认加载第一页数据,为true,加载当前pageIndex
            startQueryBtn(Boolean) {
                if (!Boolean) {
                    this.toTablePage(1)
                } else {
                    this.toTablePage()
                }
            },
            // 页码变化时调用
            currentPageChange(pageNum) {
                this.toTablePage(pageNum);
            },
            // pageSize变化是，刷新
            pageSizeChange(pageSize) {
                this.query.pageSize = pageSize;
                this.toTablePage();
            },
            // 全选
            selectionChange(arr) {
                this.$emit('selectionChange', arr)
            },
            // 删选项发生变化重置table
            command(val) {
                setTimeout(() => {
                    this.doLayout()
                }, 200)
            },
            //用于单选表格，设定某一行为选中行，如果调用时不加参数，则会取消目前高亮行的选中状态。
            setCurrentRow(row) {
                this.$refs.elTable.setCurrentRow(row)
            },
            // 页面重新布局
            doLayout() {
                this.$refs.elTable.doLayout()
            },
            // 用于多选表格，切换所有行的选中状态
            toggleAllSelection() {
                this.$refs.elTable.toggleAllSelection()
            },
            // 用于多选表格，清空用户的选择
            clearSelection() {
                this.$refs.elTable.clearSelection()
            },
            // 用于多选表格，切换某一行的选中状态
            toggleRowSelection(row, selected) {
                this.$refs.elTable.toggleRowSelection(row, selected)
            }
        }
    }
</script>

<style lang="scss">
    @import "variable";
    @import "index";
</style>
