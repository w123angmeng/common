<template>
    <span>
        <el-time-picker style="width:139px" :clearable="clearable" v-model="time[0]" placeholder="开始时间" prefix-icon="none" format="HH:mm"
            value-format="HH:mm">
        </el-time-picker>
        至
        <el-time-picker style="width:139px" :clearable="clearable" v-model="time[1]" placeholder="结束时间" prefix-icon="none" format="HH:mm"
            value-format="HH:mm">
        </el-time-picker>
    </span>
</template>
<script>
    export default {
        name: "timeRange",
        props: {
            value: {
                type: Array,
                default: () => {
                    return []
                }
            }
        },
        data(){
            return {
                clearable: false,
                time: []
            }
        },
        watch: {
            value(value) {
                this.time = value;
            },
            time(value){
                this.$emit("input", value);
            }
        } 
    };

</script>
