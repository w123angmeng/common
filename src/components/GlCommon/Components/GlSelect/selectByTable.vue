<template>
    <el-select
        :class="{'auto-w':isAutoWidth}"
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
        <!--头部label-->
        <el-option class="theader" value="" disabled>
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
        @click.native="clickFn(item1[itemNameKey])"
        :disabled="isItemEnabled && item1[itemEnabledKey] == itemEnabledValue"
        class="tbody"
        v-for="(item1, index) in dataset.list"
        :key="itemKey ? item1[itemKey] : index"
        :value="item1[itemValueKey]"
        :label="item1[itemNameKey]"
        >
            <div class="tbody-box">
                <div v-if="col.selction" :style="{flex: col.wflex}" class="tbody-box__item selction" v-for="(col,colIndex) in tableConfig.columnJson" :key="colIndex">
                    <span class="checkbox el-icon-check">
                    </span>
                </div>
                <div v-if="!col.selction" :style="{flex: col.wflex}" :class="[col.selction ? 'selction' : 'no-selction', 'tbody-box__item']" v-for="(col,colIndex) in tableConfig.columnJson" :key="colIndex">
                    <span :title="item1[col.prop]">{{ item1[col.prop] | zeroPadding(col.digits) }}</span>
                </div>
            </div>
        </el-option>

    </el-select>
</template>

<script>
    import mixins from './mixins'
    import util from "@/components/page/Common_WEB/GlCommon/gl-admin/libs/util";
    export default {
        name: "index",
        mixins: [mixins],
        //定义私用局部过滤器
        filters: {
            zeroPadding: (value, digits) => {
                if(!digits || !value && value != 0) return value
                return util.number.fomatFloat(value,12,digits);
            }
        },
        data() {
            return {
            }
        }
    }
</script>

<style lang="scss">
    @import "table";
</style>
