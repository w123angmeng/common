<template>
  <div  class='medicalRecord'>
    <!-- 切换板 -->
    <el-tabs v-model="activeTab">
      <!-- 病案首页正面 -->
      <el-tab-pane label="正面" name="1">
        <Front ></Front>
      </el-tab-pane>
      <!-- 病案首页反面 -->
      <el-tab-pane label="反面" name="2">
        <Back></Back>
      </el-tab-pane>
    </el-tabs>
    <!-- <el-row :gutter="10">
        <el-col :span="24">
            <Front></Front>
        </el-col>
        <el-col :span="24">
            <Back></Back>
        </el-col>
    </el-row>  -->
  </div>
</template>

<script>
import Front from "./front/index.vue";
import Back from "./back/index.vue";
export default {
  props: {
     isReadOnly: {
       type: Boolean,
       default: false
     }
  },
  data () {
    return {
      activeTab: '1' 
    }
  },
  components: {
        Front,
        Back
    },
  computed: {},
  created () {},
  mounted () {},
  methods: {}
}

</script>
<style lang='scss' src='./index.scss'>
</style>