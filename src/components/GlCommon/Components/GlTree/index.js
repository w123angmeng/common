import './style.scss'
import overflowShowtips from 'libs/directives/overflow-showtips'
import draggable from 'vuedraggable'
import util from '@/components/page/Common_WEB/GlCommon/gl-admin/libs/util'
import emptyImg from "@/assets/images/doctws/list_empty.svg"
const GlTree = {
    name: 'GlTree',
    data() {
        return {
            emptyImg,
            searchData: '',
            utils: util,
            clickItem: {},
            scrollTop: 0
        }
    },
    directives: {
        'overflow-showtips': overflowShowtips
    },
    watch: {
        // input 数据筛选
        searchData(val) {
            this.$refs["tree"].filter(val);
        }
    },
    computed: {
        currentIndex: {
            get() {
                return this.activeIndex
            },
            set() {}
        },
        expandedkeys() {
            let keys = []
            if (this.data.length) {
                keys.push(this.data[0][this.prop.value])
            }
            return keys
        },
        currentKey() {
            let key = this.activeIndex[this.prop.value]
            return key
        },
        overHideHeight() {
            const filterHeight = this.hasfilter ? 60 : 0
            const headerHeight = this.hasHeader ? 50 : 0
            return filterHeight + headerHeight
        }
    },
    props: {
        //模式 可选 list or tree
        mode: {
            type: String,
            default: 'list'
        },
        loading: {
            type: Boolean,
            default: false
        },
        //菜单默认选中的节点
        activeIndex: Object,
        //标题
        title: {
            type: String,
            default: ''
        },
        //是否显示头部
        hasHeader: {
            type: Boolean,
            default: true
        },
        // 头部按钮图标
        headerIcon: {
            type: String,
            default: 'el-icon-circle-plus-outline'
        },
        draggable: {
            type: Boolean,
            default: false
        },
        //数据
        data: {
            type: Array,
            default: () => {
                return []
            }
        },
        //键值对
        prop: {
            type: Object,
            default: () => {
                return {
                    label: 'label',
                    value: 'value'
                }
            }
        },
        //操作按钮
        dropMenu: Array,
        //搜索框提示文字
        placeholder: {
            type: String,
            default: '请输入关键字进行搜索'
        },
        //是否显示搜索框
        hasfilter: {
            type: Boolean,
            default: false
        },
        //是否显示操作按钮
        showHandle: {
            type: Boolean,
            default: true
        },
        //树模式下父节点是否存在点击事件
        canTreeNodeClick: {
            type: Boolean,
            default: false
        },
        //搜索按钮是否展示清除按钮
        clearable: { type: Boolean, default: true },
        //单字段添加模式，直接生成input,例子请查看cdc-角色管理
        isOneInput: { type: Boolean, default: false },
        //输入框最大字符
        maxLen: { type: Number, default: 10 },
        //开启提示
        tooltip: { type: Boolean, default: true },
        // 节点是否显示禁用和启用
        isShowAble: { type: Boolean, default: false },
        // 控制禁用启用节点的字段 id 是否编辑
        ableValueKey: { type: String, default: '' },
        // 控制禁用启用节点的字段 enabled 是否启禁用
        ableKey: { type: String, default: 'enabled' },
        // 是否控制滚动条到具体的位置
        isScrollTo: { type: Boolean, default: false }
    },
    mounted() {
        this.init()
        if (this.isScrollTo) this.$nextTick(() => { this.handleScroll() })
    },
    methods: {
        // 阻止默认事件
        stopProp(e) {
            // 获得event 对象. 并处理兼容
            var ev = e || window.event;
            if (ev.stopPropagation) {
                ev.stopPropagation()
            } else {
                // 兼容ie
                ev.cancelBubble = true
            }
           // 阻止系统默认行为
            ev.preventDefault()
        },
        // 禁用启用
        ableFn(event, data, type) {
            this.stopProp(event)
            this.$emit('able', { event, data, type })
        },
        // 设置高亮
        setCurrentKey(id) {
            this.$nextTick(() => {
                try {
                    setTimeout(() => {
                        this.$refs.tree && this.$refs.tree.setCurrentKey(id)
                        console.log('获取节点信息', this.$refs.tree.getNode(id))
                    }, 1000)
                } catch (e) {

                }

            })
        },
        // 记录滚动条
        handleScroll() {
            let scrollbarEl = this.$refs.scrollbar.wrap
            scrollbarEl.onscroll = () => {
                this.scrollTop = scrollbarEl.scrollTop
            }
        },
        // 设置到滚动条到的指定的位置
        setScroll() {
            let scrollbarEl = this.$refs.scrollbar.wrap
            this.utils.scroll.animateScroll(this.scrollTop, scrollbarEl)
        },


        init() {
            this.currentIndex = this.activeIndex
        },
        filterNode(value, data) {
            if (!value) return true;
            return data[this.prop.label].indexOf(value) !== -1;
        },
        headerClick() {
            this.$emit('header-click')
        },
        //操作按钮
        handleCommand(command, row) {
            this.$emit('handle-command', { command, row })
        },
        clickList(value, node, com) {
            if (this.mode == 'tree') {
                if (value.children) {
                    if (this.canTreeNodeClick) {
                        this.$emit('click-item', value)
                    }
                } else {
                    this.$emit('click-item', value)
                }
            } else {
                this.$emit('click-item', value)
            }
            this.clickItem = value
        },
        //input enter搜索
        keydown() {
            this.$emit('keydown', this.searchData)
        },
        // 实时输入
        inputFn(val) {
            this.$emit('input', val)
            this.searchData = val
            this.$refs['tree'] && this.$refs['tree'].filter(val)
        },
        getTree() {
            return this.$refs.tree
        },
        renderTree() {
            const data = {
                ref: 'tree',
                props: {
                    data: this.data,
                    props: this.prop,
                    'current-node-key': this.currentKey,
                    'default-expanded-keys': this.expandedkeys,
                    'node-key': this.prop['value'],
                    'filter-node-method': this.filterNode,
                    'render-content': (h, { node, data, store }) =>
                        this.renderContent(h, { node, data, store }),
                    ...this.$attrs
                },
                on: {
                    'node-click': (data, node, com) => this.clickList(data, node, com),
                    ...this.$listeners
                }
            }
            return (
                <el-tree class="nav-tree" highlight-current {...data}></el-tree>
            )
        },
        blurInput(item, e) {
            this.$emit('blur-input', item)
        },
        renderList() {
            const directives = this.tooltip
                ? [{ name: 'overflow-showtips' }]
                : []
            let list = this.data.map(item => {
                let html = null
                //新增展示输入框
                if (this.isOneInput) {
                    if (item.edit) {
                        html = (
                            <el-input
                                value={item[this.prop.label]}
                                onInput={val => (item[this.prop.label] = val)}
                                size="small"
                                class="editIpnut"
                                onBlur={e => this.blurInput(item, e)}
                                maxlength={this.maxLen}
                            ></el-input>
                        )
                    } else {
                        html = (
                            <div
                                class={[
                                    'gl-left-nav-list-item',
                                    this.currentIndex[this.prop.value] ==
                                    item[this.prop.value]
                                        ? 'gl-left-nav-list-listactive'
                                        : ''
                                ]}
                                onClick={() => this.clickList(item)}
                            >
                                <div
                                    class="gl-left-nav-list-item-left ellipsis tooltip"
                                    {...{ directives }}
                                >
                                    {item[this.prop.label]}
                                </div>
                                {this.dropMenu ? (
                                    <div class="item-right">
                                        <el-dropdown
                                            trigger="click"
                                            onCommand={command => {
                                                this.handleCommand(
                                                    command,
                                                    item
                                                )
                                            }}
                                        >
                                            <span class="el-dropdown-link">
                                                <i class="el-icon-more"></i>
                                            </span>
                                            <el-dropdown-menu slot="dropdown">
                                                {this.dropMenu.map(menu => {
                                                    return (
                                                        <el-dropdown-item
                                                            key={menu.command}
                                                            command={
                                                                menu.command
                                                            }
                                                        >
                                                            {menu.label}
                                                        </el-dropdown-item>
                                                    )
                                                })}
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </div>
                                ) : null}
                            </div>
                        )
                    }
                } else {
                    html = (
                        <div
                            class={[
                                'gl-left-nav-list-item',
                                this.currentIndex[this.prop.value] ==
                                item[this.prop.value]
                                    ? 'gl-left-nav-list-listactive'
                                    : ''
                            ]}
                            onClick={() => this.clickList(item)}
                        >
                            <div
                                class="gl-left-nav-list-item-left ellipsis tooltip"
                                {...{ directives }}
                            >
                                {item[this.prop.label]}
                            </div>
                            {this.dropMenu ? (
                                <div class="item-right">
                                    <el-dropdown
                                        trigger="click"
                                        onCommand={command => {
                                            this.handleCommand(command, item)
                                        }}
                                    >
                                        <span class="el-dropdown-link">
                                            <i class="el-icon-more"></i>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                            {this.dropMenu.map(menu => {
                                                return (
                                                    <el-dropdown-item
                                                        key={menu.command}
                                                        command={menu.command}
                                                    >
                                                        {menu.label}
                                                    </el-dropdown-item>
                                                )
                                            })}
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </div>
                            ) : null}
                        </div>
                    )
                }
                return html
            })
            return list
        },
        renderHeader() {
            return (
                this.hasHeader &&
                (this.$slots.header || (
                    <div class="gl-left-nav-header">
                        <span>{this.title}</span>
                        <div
                            class="gl-left-nav-header-icon"
                            onClick={() => this.headerClick()}
                        >
                            <i class={this.headerIcon}></i>
                        </div>
                    </div>
                ))
            )
        },
        renderSearch() {
            return (
                this.hasfilter &&
                (this.$slots.research || (
                    <div class="gl-left-nav-list-input">
                        <el-input
                            value={this.searchData}
                            clearable={this.clearable}
                            onInput={val => this.inputFn(val)}
                            nativeOn-keydown={arg =>
                                arg.keyCode == 13 && this.keydown()
                            }
                            size="small"
                            placeholder={this.placeholder}
                        ></el-input>
                    </div>
                ))
            )
        },
        renderContent(h, { node, data, store }) {
            let handleHtml = null,ableHtml=null
            if (this.dropMenu) {
                handleHtml = (
                    <div class="dropdown">
                        <el-dropdown
                            trigger="click"
                            onCommand={command => {
                                this.handleCommand(command, data)
                            }}
                        >
                            <span class="el-dropdown-link">
                                <i class="el-icon-more"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                {this.dropMenu.map(menu => {
                                    return (
                                        <el-dropdown-item
                                            key={menu.command}
                                            command={menu.command}
                                        >
                                            {menu.label}
                                        </el-dropdown-item>
                                    )
                                })}
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                )
            } else if (this.isShowAble){
                ableHtml = (
                    <span class="enableBtn">
                                    <el-button
                                        size="mini"
                                        type="text"
                                        class="disableBtn"
                                        style={`display:${data[this.ableKey] == 1 && !this.utils.validate.isEmpty(this.clickItem[this.ableValueKey]) && data[this.ableValueKey] == this.clickItem[this.ableValueKey] ? 'inline-block' : 'none'}`}
                                        onClick={($event) => { this.ableFn($event, data, 0)}}
                                    >
                                        禁用
                                    </el-button>
                                    <el-button
                                        type="text"
                                        size="mini"
                                        style={`display:${data[this.ableKey] == 0 && !this.utils.validate.isEmpty(this.clickItem[this.ableValueKey]) && data[this.ableValueKey] == this.clickItem[this.ableValueKey] ? 'inline-block' : 'none'}`}
                                        onClick={($event) => { this.ableFn($event, data, 1)}}
                                    >
                                        启用
                                    </el-button>
                            </span>
                )
            }
            if (node.level == 1) {
                return (
                    <span class="list-tree-node">
                        <span class={['pareent-label', data.enabled == '0' ? 'dis-color' : '']}>{node.label}</span>
                        {ableHtml}
                    </span>
                )
            } else {
                return (
                    <span class="list-tree-node">
                        <el-tooltip
                            content={node.label}
                            placement="top-start"
                            disabled={!this.tooltips}
                        >
                            <span class="label ellipsis">{node.label}</span>
                        </el-tooltip>
                        {handleHtml}
                    </span>
                )
            }
        },
        //顶部添加插槽
        renderTop() {
            return this.isOneInput && this.$slots.top
        },
        draggableEnd(e) {
            this.$emit('draggable-end', {
                newIndex: e.newIndex,
                oldIndex: e.oldIndex,
                list: this.data
            })
        }
    },
    render(h) {
        const renderHtml =
            this.mode == 'tree' ? (
                this.renderTree()
            ) : (
                <draggable
                    list={this.data}
                    animation="200"
                    onEnd={e => this.draggableEnd(e)}
                >
                    {this.renderList()}
                </draggable>
            )
        return (
            <div
                class="gl-left-nav"
                loading={this.loading}
                element-loading-text="数据加载中"
            >
                {this.renderHeader()}
                {this.renderSearch()}
                <el-scrollbar
                    ref="scrollbar"
                    style={{
                        height: `calc(100% - ${this.overHideHeight}px)`
                    }}
                >
                    <div class="gl-left-nav-list">
                        {this.renderTop()}
                        {this.data.length ? (
                            renderHtml
                        ) : (
                            <el-empty description="暂无数据" image={emptyImg}></el-empty>
                        )}
                    </div>
                </el-scrollbar>
            </div>
        )
    }
}

export default GlTree
