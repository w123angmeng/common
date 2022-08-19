<template>
    <div class='outpMedDetail_js'>
        <div class="mrQuoteModelBarContent">
            <el-scrollbar style="height: 100%">
                <template v-if="isFreeLoginJshun">
                    <div v-for="(item, index) in tpData.mrCiMr" :key="index">
                        <el-row class="itemMrElement">
                            <el-col class="mrlEleLabel">
                                {{item.mrTemplateElementName}}:
                            </el-col>
                            <el-col class="mrlEleContent">
                                <div v-html="item.value"></div>
                            </el-col>
                        </el-row>
                    </div>
                    <el-row class="itemMrElement">
                        <el-col class="mrlEleLabel"> 诊断:</el-col>
                        <el-col class="mrlEleContent" v-if="tpData.mrDians.length">
                            <div v-for="(item, index) in tpData.mrDians" :key="index"> {{index + 1}}. {{item.diagnosisName}}</div>
                        </el-col>
                        <el-col class="mrlEleContent" v-else>
                            无
                        </el-col>
                    </el-row>
                </template>
                <div v-else v-html="content"></div>
            </el-scrollbar>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        curVisitObj: {
            type: Object,
            default: () => {
                return {}
            },
        },
    }, 
    data() {
        return {
            tpData: {
                mrCiMr: [], //模版内容
                mrDians: [], //诊断内容
            },
            content:'',
        }
    },
    computed: {
        isShowContnet() {
            return !this.tpData.mrCiMr.length && !this.tpData.mrDians.length
        },
        idPatStr() {
            return this.$route.query.idPat || '';
        },
        mainDians() {
            if(this.tpData.mrDians.length) {
                return  this.tpData.mrDians[0].diagnosisName
            }
            return ''
        },
        //京顺免密病历
        isFreeLoginJshun() {
            return this.$route.query.accountName || ''
        },
    },
    methods: {
        init() {
            this.$nextTick(()=> {
                    
                if(this.isFreeLoginJshun) {
                    this.getFreeCiMr();
                    this.getDiaData();
                    return
                }

                this.getUnFreeCiMr();
            })
        },

         /**门诊 -- 病历信息    免密 */
        async getUnFreeCiMr() {
            this.content = ''
            let resData = await this.unFreeLookCiMrAsync();
            if(!resData) return
            let ct = resData.mrContent || ''
            this.content = ct.replace(/\\n/g, '<br/ >'); // 处理回车换行
        },

        /**门诊 -- 查阅京顺病历信息    非免密 */
        async unFreeLookCiMrAsync() {
            let axiosUrl = "outpdr/ciMrItem/otherSystemCiMrItem";
            let parmas = {
                idVisit: this.curVisitObj.idVisit,
                idPat: this.idPatStr,
            }

            console.log('查阅京顺病历信息 参数 ---', parmas);

            let resData = await this.$axios.post(axiosUrl, parmas);
            if(resData.success) {
                return resData.data
            } 
            this.$message.warning(resData.message)
            return false
        },

        /**门诊 -- 病历信息    免密 */
        async getFreeCiMr() {
            this.tpData.mrCiMr = []
            let resData = await this.freeLookCiMrAsync();

            if(!resData) return
            if(resData instanceof Array) {

                let copyTpl =  resData || [];
                copyTpl.map( v => {
                    v.value = v.value || '无'
                    v.value = v.value.replace(/\n/g, '<br/ >'); // 处理回车换行
                })
                this.tpData.mrCiMr = this.copyObject(copyTpl);
            }
        },

        /**获取患者就诊记录列表  免密  */
        async freeLookCiMrAsync() {
            let axiosUrl = "/outpdr/ciMrItem/listCiMrItemByIdVisit";
            let parmas = {
                idVisit: this.curVisitObj.idVisit,
                idPat: this.idPatStr,
            }

            let resData = await this.$axios.post(axiosUrl, parmas);
            if(resData.success) {
                return resData.data
            } 
            this.$message.warning(resData.message)
            return false
        },

        /**诊断回显数据  免密 */
        getDiaData() {
            this.tpData.mrDians = [];
            this.selectCiDiaRecord(this.idPatStr, this.curVisitObj.idVisit, this.CONSTANT.OUTP_DIAGNOSIS_FLAG).then(data => {
                this.tpData.mrDians = data;
                this.$emit('curMrDians', this.mainDians)
            })
        },
    },
}
</script>
<style lang="scss" scoped>
.outpMedDetail_js {
    font-size: 14px;
    font-family:PingFangSC-Regular,PingFang SC;
    position: relative;
    height: 100%;
   
    .mrQuoteModelBarContent { 
        height: 100%;

        .el-scrollbar__wrap {
            margin-bottom: 0 !important;
            overflow-x: hidden !important;
        }

        .contentSimpleImgSvg {
            margin-left: 500px;
            margin-top: 250px;
        }

        .itemMrElement {
            display: flex;
            margin-bottom: 12px;
            font-family: PingFang SC;
            font-style: normal;
            font-weight: normal;
            font-size: 14px;
            line-height: 22px;

            .mrlEleLabel {
                width: 100px;
                text-align: left;
                font-weight: 500;
                padding-right: 12px;
                color: #262626;
            }

            .mrlEleContent {
                color: #595959;
            }
        }
    }
}
</style>