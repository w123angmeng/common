<!--
 * @Author: changxy
 * @Date: 2022-01-07 11:10:33
 * @LastEditors: changxy
 * @LastEditTime: 2022-03-07 15:50:06
 * @Description: 请填写简介
-->
<template>
    <!-- 封装了 统一loading效果的按钮
        使用方式：<glButton type="primary" @click="(next) => saveUpdate(0, next)">保存</glButton>
                  在saveUpdate方法的接口请求完成后，手动调用next() 即可取消loading状态
                  this.simplePost(api, params,(data) => {
                    next()
                  })
    -->
    <el-button
        v-bind="$attrs"
        @click="handleClick($event)"
        :loading='loading'>
        <slot></slot>
    </el-button>
</template>

<script>
export default {
    name: 'glButton',
    props: {
        isPrevent:Boolean
    },
    data() {
        return {
            loading: false
        }
    },
    methods:{
        handleClick(event) {
            if(this.isPrevent) {
                event.preventDefault();
            }
            this.loading = true
            new Promise((resolve) => {
                // 向父组件暴露一个resolve，用于父组件中调用 next()取消loading状态
                this.$emit('click', resolve)
            }).then(() => {
                this.loading = false
            })
        }
    }
}
</script>
