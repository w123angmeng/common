<template>
   <colgroup >
        <col v-for="item in createColgroup" :key="item.index" :width="item.width" />
   </colgroup >
</template>

<script>
import {mapMutations, mapGetters} from 'vuex'
export default {
    name:"myColgroup",
    props: [],
    data(){
        return{
            createColgroup:[],
            svgLeftWidth: "",
            tempTrCurWidth: ''
        }
    },
    created(){
        this.tempTrCurWidth = this.KDobj.trWidth;
    },
    watch: {
        tempTrHWidth: {
            handler: function(val) {
                this.tempTrCurWidth = val;
                this.createColgroup = this.doEachWidth()
            },
            deep: true
        }
    },
    computed: {
        ...mapGetters([
            'KDobj'
        ]),
        tempTrHWidth() {
            return this.KDobj.trWidth
        }
    },
    mounted() {
        this.evtListenrTempWidth();
        let that = this;
        this.$nextTick(() => {
            window.addEventListener("resize", function () {
                that.evtListenrTempWidth();
            })
        });
        this.createColgroup = this.doEachWidth();
    },
    methods:{
        doEachWidth(){
            let colArray = [];
            for (let i = 0; i < 43; i++) {
                let width = Number(this.tempTrCurWidth);
                if (i === 0) {
                    width = Number(this.svgLeftWidth) //105
                } else if (i === 43) {
                    width = 60;
                }
                let params = {
                    width:width,
                    index:i
                }
                colArray.push(params);
            }
            return colArray;
        },
        evtListenrTempWidth() {
            if (!document.querySelector('.temperature-chart')) return;
            let tempWidth = document.querySelector('.temperature-chart').clientWidth;
            // let svgWidth = document.querySelector('#msvg').clientWidth;
            if (!document.querySelector('#msvg')) return;
            let svgWidth = document.querySelector('#msvg').width.animVal.value;
            // 需要减去padding左右两边值 + 1px
            let widToFixed = (tempWidth - svgWidth - 42 + 2).toFixed(2);
            this.svgLeftWidth = Number(widToFixed);
            this.createColgroup = this.doEachWidth();
        }
    },
    destroyed() {
        window.removeEventListener("resize", this.evtListenrTempWidth);
    },
}
</script>
<style>

</style>


