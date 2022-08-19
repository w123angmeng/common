<template>
    <div class="historyVisitPage_Js">
        <div class="container">
            <div class="titleSpan">病历浏览</div>

            <HisTCom></HisTCom>
        </div>
    </div>
</template>
<script>
import HisTCom from "../common/index.vue";

export default {
    components: {
        HisTCom
    },
    data() {
        return {

        };
    },
    methods: {
       
    }
  };

</script>

<style lang="scss" scoped>
.historyVisitPage_Js {
    background: #fff;
    min-height: 98% !important;
    height: 98%;
    padding-bottom: 50px;
    box-sizing: border-box;
    .container {
        height: 96% !important;
        overflow-y: hidden;
    }

    .titleSpan {
        padding:14px 0px;
        margin-left: 17px;
        font-size:14px;
        font-family:PingFangSC-Medium,PingFang SC;
        font-weight:500;
        color:rgba(0,0,0,0.85);
        border-bottom: 1px solid #E9E9E9;
    }
}
</style>