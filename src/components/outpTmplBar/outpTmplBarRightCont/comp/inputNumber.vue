<template>
    <div class="inputNumModel">
        <span :class="['reduceBtn',{'isDisabled': amount == 1}]" @click="onreduce">-</span>
        <el-input v-model="amount" @change="amountChange" onkeyup="this.value=this.value.replace(/\D/g,'')"  />
        <span class="addBtn" @click="onAdd">+</span>
    </div>
</template>
<script>
export default {
    props:['num','currentIndex',"row"],
    data () {
        return {
          amount: 1,
          copyNum: null
        }
    },
    mounted () {
        this.amount = +this.num
        this.copyNum = +this.num
    },
    watch:{
        num (cur) {
           this.amount = +this.num
        }
    },
    methods: {
        onAdd(){
          this.amount = this.amount + 1
          this.$emit("changeHandle", this.amount, this.currentIndex, this.row)
        }, 
        onreduce(){
          if (this.amount == 1) return;
          this.amount = this.amount - 1;
          this.$emit("changeHandle", this.amount, this.currentIndex, this.row)
        },
        amountChange (val) {
          if (!val) {
            val = this.copyNum
          } else if (val == 0) {
            val = 1
          }
          if (/^\d+$/g.test(val)) {
            this.$emit("changeHandle", val, this.currentIndex, this.row)
          }
        }
    }
}
</script>
<style  lang="scss" src="./inputNumber.scss"></style>