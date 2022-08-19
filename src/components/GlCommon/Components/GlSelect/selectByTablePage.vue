<template>
    <!-- value-key如果为id 因为有重复的产品id，会导致回显的输入框显示错误 -->
    <el-select
        :class="{'auto-w':isAutoWidth}"
        :value-key="itemNameKey"
        popper-class="gl-common-select-table"
        ref="SelectRefComponent"
        v-on="$listeners"
        v-bind="$attrs"
        :clearable="clearable"
        :placeholder="placeholder"
        :loading="loading"
        :remote-method="$attrs.remote ? remoteMethod : null"
        @visible-change="visibleChange"
    >
        <slot></slot>

        <!-- 特殊处理，隐藏域，解决回显的数据在list列表中不存在，导致回显失败的问题 -->
        <!-- 多选时回显未知v-model值 -->
        <template v-if="$attrs.multiple">
            <!--<div v-if="item[itemValueKey]">-->
                <el-option v-for="(item,inx) in modelValue" :key="item[itemValueKey]" :value="item" :label="item[itemNameKey]" class="default-option-hide"></el-option>
            <!--</div>-->
        </template>
        <!-- 特殊处理，隐藏域，解决回显的数据在list列表中不存在，导致回显失败的问题 -->
        <!-- 单选时回显未知v-model值 -->
        <template v-else>
            <el-option v-if="modelValue[itemValueKey]" class="default-option-hide" :key="modelValue[itemValueKey]" :value="modelValue" :label="modelValue[itemNameKey]"></el-option>
        </template>

        <!--头部label-->
        <el-option class="theader"
                   value="auto" disabled>
            <div class="theader-box" :style="theaderBoxStyle">
                <div
                    v-if="it.selction"
                    class="theader-box__item selction"
                    :style="{flex: it.wflex}"
                    v-for="(it, inx) in tableConfig.columnJson"
                    :key="inx"
                >
                    <span :title="it.label">{{ it.label }}</span>
                </div>
                <div
                    v-if="!it.selction"
                    :class="[it.selction ? 'selction' : 'no-selction', 'theader-box__item']"
                    :style="{flex: it.wflex}"
                    v-for="(it, inx) in tableConfig.columnJson"
                    :key="inx"
                >
                    <span>{{ it.label }}</span>
                </div>
            </div>
        </el-option>

        <el-option
        class="tbody"
        v-for="(item1, index) in dataset.list"
        :key="itemKey ? item1[itemKey] : index"
        :value="item1"
        :disabled="isItemEnabled && item1[itemEnabledKey] == itemEnabledValue"
        :label="item1[itemNameKey]"
        >
            <div class="tbody-box">
                <div v-if="col.selction" :style="{flex: col.wflex}" class="theader-box__item selction" v-for="(col,colIndex) in tableConfig.columnJson" :key="colIndex">
                    <span class="checkbox el-icon-check">
                    </span>
                </div>
                <div v-if="!col.selction" :style="{flex: col.wflex}" :class="[col.selction ? 'selction' : 'no-selction', 'theader-box__item']" v-for="(col,colIndex) in tableConfig.columnJson" :key="colIndex">
                    <span :title="item1[col.prop]">{{ item1[col.prop] }}</span>
                </div>
            </div>
        </el-option>

        <!-- 数据分页 -->
        <div class="gl-el-pagination" v-if="tableConfig.isShowPagination">
            <el-pagination
                @current-change="currentPageChange"
                :current-page="query.pageIndex"
                :hide-on-single-page="true"
                small
                layout="prev, pager, next"
                prev-text="上一页"
                next-text="下一页"
                :total="dataset.total"
            ></el-pagination>
        </div>
    </el-select>
</template>

<script>
    import mixins from './mixins'
    export default {
        name: "index",
        mixins: [mixins],
        data() {
            return {
                modelValue: {}
            }
        },
        created() {
            this.modelValue = this.$attrs.value || {}
        }
    }
</script>

<style lang="scss">
    @import "table";
</style>
