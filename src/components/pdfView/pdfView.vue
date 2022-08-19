<template>
    <div class="iframeDiv" :class="{print_iframeMaskDiv: !iframeMaskDivStatus,isPrescription:isPrescription, isA4Page:isA4Page}">
        <div class="maskDiv"></div>
        <div class="maskbefore"></div>
        <div class="maskAfter"></div>
        <div class="allPage" ></div>
        <iframe class="iframeArea" @load="load" :src="currSrc"></iframe>
    </div>
</template>

<script>
export default {
    name:'pdfViewer',
    props:{
        src:{
            type:String,
            default:''
        },
        isPrescription:{
            default:false
        },
        isA4Page:{
            default:false
        },
    },
    data(){
        return {
            iframeMaskDivStatus:false,
            currSrc:''
        }
    },
    methods:{
        load(){
            setTimeout(() => {
                this.iframeMaskDivStatus = true
            }, 500);
        }
    },
    mounted(){
    },
    watch:{
        src:{
            handler(val){
                console.log(val);
                if(val){
                    this.currSrc = `${val}#toolbar=0`
                }
            },
            immediate:true
        }
    }
}
</script>

<style lang="scss">
    .iframeDiv.print_iframeMaskDiv .maskDiv{
            height: 100%;
        }
        .iframeDiv{
            .allPage{
                position: absolute;
                top: 0;
                left: 0;
                z-index: 10;
                width: 100%;
                height: 100%;
                background-color: transparent;
            }
            position: relative;
            height: 705px;
            &.isPrescription{
                height: 1085px;
            }
            &.isA4Page {
                height: 1484px;
            }
            width: 790px;
            overflow: hidden;
            .maskbefore,.maskAfter,.maskDiv{
                content: '';
                position: absolute;
                width: 7px;
                height: 100%;
                background-color: #fff;
                top: 0;
                left: 0;
                z-index: 10;
            }
            .maskAfter{
                left: auto;
                right: 0;
            }
            .maskDiv{
                width: 100%;
                height: 20px;
                bottom: 0;
                top: auto;
            }
            .iframeArea{
                position: absolute;
                top: -6px;
                height: calc(100% + 6px);
                width: 1200px;
                left: 50%;
                transform: translate(-50%) scaleX(.76);
            }
        }
</style>