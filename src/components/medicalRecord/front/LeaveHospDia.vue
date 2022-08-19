<template>
    <div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="0" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia"></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="11" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia"></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="1" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="12" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="2" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="13" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="3" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="14" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="4" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="15" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="5" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="16" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="6" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="17" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="7" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="18" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="8" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="19" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="9" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="20" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
        <div class="contentInfoTable">
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="10" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
            <DiaCom :diagnosisRow="diagnosisRow" :curIndex="21" :diaDicLists="diaDicLists" @leaveHospDia="leaveHospDia" ></DiaCom>
        </div>
    </div>
</template>

<script>
    import DiaCom from './DiaCom.vue';
    export default {
        props: {
            diaDicLists: {
                type: Array,
                default: () => {
                    return []
                }
            },
            diagnosisRow: {
                type: Array,
                default: () => {
                    return []
                }
            },
        },   
        data() {
            return {
            };
        },
        created() {
            // console.log(this.diagnosisRow);
        },
        mounted() {
        },
        components: {
            DiaCom
        },
        computed: {},
        methods: {

            leaveHospDia(data) {
                this.$emit('leaveHospDia',data);
            },
          
        },
    };

</script>

<style lang="scss" src='./index.scss'>

</style>
