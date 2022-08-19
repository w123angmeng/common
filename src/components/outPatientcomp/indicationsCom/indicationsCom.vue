<template>
    <div class='IndicationsCom'>
        <div v-if="IndicationsForm.IndicationsVisible" class="isModal"></div>
        <el-dialog
            class="IndicationsComDiaglog"
            title="医保项目目录说明"
            :visible.sync="IndicationsForm.IndicationsVisible"
            width="665px"
            :modal="false"
            :close-on-press-escape="false"  
            :close-on-click-modal="false">
            <div>
                <div v-for='(item, index) in IndicationsForm.IndicationInfoList'>
                    <div v-for='(pr, prIndex) in item.prPriceItemVsInsuranceVOList' style="margin-bottom: 7px;">
                        <span class="" v-show="pr.priceItemName">【{{pr.priceItemName}}】</span>&nbsp;
                        <span class="">{{pr.sdConstrainedLevelDataName ? pr.sdConstrainedLevelDataName : ''}}</span>&nbsp;
                        <span class="">【适】</span>
                        <span class="">{{pr.description ? pr.description : '无'}}</span>&nbsp;
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="IndicationsForm.IndicationsVisible = false">取 消</el-button>
            </span>
        </el-dialog>    
    </div>
</template>

<script>
    export default {
        name: '',
        props: ["IndicationsForm"],
        data() {
            return {
            };
        },
        created() {

        },
        mounted() { },
        components: {

        },
        computed: {
        },
        methods: {

        },

    };

</script>

<style lang="scss" src="./indicationsCom.scss">

</style>