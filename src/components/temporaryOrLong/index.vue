<template>
      <el-radio-group class="common_radio_group flexRow" v-model="radio" size="small" :disabled="disabled">
        <el-radio-button :label="1">长期</el-radio-button>
        <el-radio-button :label="0">临时</el-radio-button>
    </el-radio-group>
</template>

<script>
export default {
    name:'temporaryOrLong',
    props:{
        disabled: {
            default: () => false
        },
        value:{
            default:1
        }
    },
    model:{
        prop:'value',
        event:'change'
    },
    data(){
        return {
            radio:''
        }
    },
    methods:{
    },
    watch:{
        value:{
            handler(val){
                this.radio = val
            },
            immediate:true
        },
        radio(val){
            this.$emit('change',val)
        }
    }
}
</script>

