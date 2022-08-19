export const mixinCDR = {
    data () {
        return {
            CDRhref: '',
            cdrPatPrefix: process.env.cdrPatPrefix || '', //CDr患者前缀
        }
    },
    computed: {
        isAtmeng(){
            return this.$limits.isFun(this)
        },
        isOnlyBren(){
            return this.$limits.isDiffBren(this)
        },
        userCode() {
            let code = this.getUserStorage().userCode || '';
            // return window.globalUrl.cdrUserCode === 'SANFANG' ? 'SANFANG' : code
            return code
        },
        signKeyStr() {
            console.log('当前密钥',this.$t('config.sigCDRStr'));
            let key = this.$t('config.sigCDRStr') || '';
            return this.$md5(this.userCode + key)   //签名密钥
        },
        is404() {
            return window.globalUrl.CDRPageUrl === '404';
        },
    },
    methods: {

        /** 查看CDR病历  */
        async lookCDRRecord(item, isNew) {
            item.patCode = item.patCode || item.patId;

           await this.openCDRSig(item,isNew);
        },

        async openCDRSig(row, isNew = false) {
            if(this.is404) {
                console.log('404--');
                this.isGo404(isNew);
                return false
            }

            let cdrUrl = await this.getThirdConfigModule(row, isNew);
            console.log('cdr后端返回--',cdrUrl);
            if(!cdrUrl) {
                console.log('cdr后端返回无值0--');
                this.isGo404(isNew);
                return false
            }

            this.CDRhref = cdrUrl;   //后端接口返回cdr地址
            console.log('cdr展示接口--',this.CDRhref);

            if(isNew) {
                window.open(cdrUrl, "_blank");
            }
        },

        /** 获取CDR参数 */
        getCDRParmas(row, isNew) {
            let old_visitCode = row.visitCode ||  "";
            let visitCode = "";
            if (old_visitCode) {
                let spitDate = old_visitCode.substring(0, 8);
                let spitNum = old_visitCode.substring(8);
                if (spitDate && spitNum) visitCode = spitDate + "_" + spitNum;
            }

            let Obj = {
                userCode: this.userCode, //
                patId: `${this.cdrPatPrefix}${row.patCode }`,  //患者id
                src: 'SYS2',   //系统来源
                signKey:  this.signKeyStr   //签名密钥
            };

            if(isNew) Obj.visitId = visitCode;
            return Obj
        },

        /** 获取CDR接口 */
        async getThirdConfigModule(row, isNew) {
            let parmas = this.getCDRParmas(row, isNew);
            let resData = await this.$axios.get(`${window.globalUrl.CDRPageUrl}cdr/external/getThirdConfigModule`, parmas);
            if(resData.success) {
                let url =  resData.data.integrateUrl || '';
                let spUrls = url.split('?');
                if(spUrls.length) spUrls.splice(0, 1, `${window.globalUrl.CDRPageUrl}`);  //替换后端返回地址
                let nl = spUrls.join('?')
                return nl
            }
            this.$message.warning(resData.message);
            return false
        },

        /** 跳转404 */
        isGo404(isNew) {
            let queryObj = {
                noshowBtn: true
            }
            //新窗口404
            if(isNew) {
                const { href } = this.$router.resolve({
                    path: "/404",
                    query: { ... queryObj }
                });

                window.open(href, "_blank");
                return
            }
            //当前页404
            let CDRhref = this.objToUrl(queryObj);
            this.CDRhref = window.location.href.split("#")[0] + '#/404' + "?" + CDRhref;
        },

         //对象转 URL
        objToUrl(obj) {
            if (!obj && !Object.keys(obj).length) {
                return "";
            } else {
                var arr = [];
                for (var key in obj) {
                arr.push(key + "=" + obj[key]);
                }
                return arr.join("&");
            }
        },

        getNewTabParmas(row) {
            let obj = this.getCDRParmas(row);
            const { href } = this.$router.resolve({
                path: "/cdrPage",
                query: { ... obj }
            });

            window.open(href, "_blank");
        },

        getCDRInfo() {
        },





        //查看CDR 报告 新窗口
        createdCDRSigOld(patCode, isNew) {
            if(this.is404) {
                this.isGo404(isNew);
                return false
            }
            let Obj = {
                userCode: this.userCode,
                patId: `${this.cdrPatPrefix}${patCode }`,  //患者id
                signKey: this.signKeyStr,  //签名密钥
                headerModel: true,   //登录信息和logo等  默认显示，不显示为true
                callbackButton: true,  //返回患者列表
                // patientInfo: true,  //患者信息头部  默认显示，不显示为true
            };

            if(isNew) {
                this.lookCDRRecordOld(Obj);
            } else {
                Obj.patientInfo = true;   //不展示患者头部信息
                let CDRhref = this.objToUrl(Obj);
                this.CDRhref = window.globalUrl.CDRPageUrl + "?" + CDRhref;
            }
        },

        lookCDRRecordOld(obj) {

            const { href } = this.$router.resolve({
              path: "/cDRpage",
              query: {
                ...obj
              }
            });

            //埋点
            this.getBuryingPoint('接诊列表查阅病历', obj);

            window.open(href, "_blank");
        },
    }
}
