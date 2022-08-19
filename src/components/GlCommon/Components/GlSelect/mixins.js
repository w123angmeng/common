import util from '../../gl-admin/libs/util'
export default {
  props: {
    /**
         * options列表
         */
    list: {
      type: Array,
      default: () => []
    },

    /**
     * item项禁用 key 键名
    */
    itemEnabledKey: {
      type: String,
      default: 'enabled'
    },
    /**
     * item项禁用 value
     */
    itemEnabledValue: {
       type: Number,
       default: 0
    },
    /**
      * item项是否禁用 value
    */
    isItemEnabled: {
      type: Boolean,
      default: false
    },

    /**
         * item label 键名
         */
    itemNameKey: {
      type: String,
      default: 'name'
    },

    /**
      * item key
    */
    itemKey: {
      type: String,
      default: ''
    },

    /**
         * item value 键名
         */
    itemValueKey: {
      type: String,
      default: 'id'
    },
    /**
       * item placeholder
       */
    placeholder: {
      type: String,
      default: '请选择'
    },
    /**
     * 分页最大条数大小
    */
    pageSize: {
      type: Number,
      default: 10
    },
    /**
     * options总条数 可显示分页
    */
    total: {
      type: Number,
      default: 0
    },
    /**
      * table 列配置项
    */
    tableConfig: {
      type: Object,
      default: () =>  {
          return {
              columnJson: [],
              isShowPagination: true
          }
      }
    },
    /**
     * 是否设置为自适应宽度
    */
    isAutoWidth: {
      type: Boolean,
      default: true
    },
    /*
    * 是否可清空select
    */
    clearable: {
      type: Boolean,
      default: true
    },
    /*
    *table tablePage 类型传入
    *theaderBoxStyle 支持内联表格header css
    */
    theaderBoxStyle:{
        type: Object,
        default: ()=>{}
    }
  },
  inheritAttrs: false,
  data () {
    return {
      loading: false,
      dataset: {
        list: [],
        total: 0
      },
      // 异步时的查询条件
      query: {
        pageSize: 10,
        pageIndex: 1,
        keywords: ""
      },
      oldVal: '',
    }
  },
  mounted () {
  },
  watch: {
      'list': {
          handler: function (val) {
              this.$set(this.dataset, 'list', val);
          },
          deep: true
      },
      '$attrs.value': function (val,oldVal) {
        this.oldVal = oldVal
          if (util.validate.isEmpty(val)) {
              this.$emit("changeName", '')
          }
      }
  },
  created () {
    // this.value = this.currentValue
    this.dataset.list = this.list
    this.dataset.total = this.total
    this.query.pageSize = this.pageSize
  },
  methods: {
    // 增加blur方法
    blur(){
        this.$refs['SelectRefComponent'].blur();
    },
    /**
      * 当开启远程搜索时，关键字输入时触发事件通知接口调用
    */
    remoteMethod (queryValue) {
      this.loading = true;
      // 输入时 将分页重置第一页
      this.query.pageIndex = 1;
      // 记录关键字
      this.query.keywords = queryValue;
      // 触发事件去 - 发起请求
      this.emitGetApiData();
    },
    // 点击某一项，回传name
    clickFn(name) {
        this.$emit("changeName", name, this.oldVal);
    },
    change(val) {
        this.$emit("change", val)
        if(!val) this.$emit("changeName", '')
    },
    // 当前页发生变化时调用
    currentPageChange (pageNum) {
      this.query.pageIndex = pageNum
      console.log('pageNum', pageNum)
      // 1、这里由 focus 代替 getCommmonSelectList执行
      // 2、解决切换页码关键字消失的问题
      this.$refs['SelectRefComponent'].focus();
      this.emitGetApiData();
      // 派发到父级使用，父级需要的话
      this.$emit("current-change", pageNum)
    },
    // 派发事件
    emitGetApiData () {
      this.loading = true
      // 事件回调
      const callBack = (dataset = {}) => {
        this.dataset.list = dataset.list || []
        this.dataset.total = dataset.total || 0
        setTimeout(() => {
          this.loading = false
        }, 100)
      }
      this.$emit('getApiData', { callBack, query: this.query })
    },
    // 下拉框出现/隐藏时触发
    visibleChange ($event) {
      // 以备父级调用
      this.$emit('visibleChange', $event)
      // 每次展开时 列表为空时--调用数据
      if ($event === true && this.dataset.list.length === 0) {
        this.emitGetApiData()
      }

      // 每当收起时 处理关键字
      if ($event === false) {
          // 收起时 如果有关键字同时清空列表，避免展开时显示旧数据
          if (this.query.keywords != "") {
              this.dataset.list = []
              this.dataset.total = 0
          }

          // 收起时清空关键字
          this.query.keywords = ""
      }
    }
  }
}
