import store from '@/store';
import axios from 'axios'
export const mixinWebPrint = {
    data () {
        return {
            isNewWebPrint: false,  //是否web打印  false lodop    true web
            isLodopDrawPrint: false, //输液卡手画模板
            isLodopPagePrint: false, //输液卡分页pdf
        }
    },
    computed: {
        webPrintUrl() {
            return `${window.globalUrl.emrPrintUrl}/PrintControl/PrintFile`;
        },
        cardServersUrl() {
            return `${window.globalUrl.printUrl}/card?type=3`;
        },
        fromInfusion() {
            return '输液卡'
        },
        fromTreatment() {
            return '治疗单'
        },
    },

    methods: {
         //默认web打印的科室
         async getWebPrintDept(idDept){
            let obj = {
                systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                paramTypeCode: 'Print_Control_ByDept'
            }
            let res = await this.listBySystemIdAndParamTypeCodeForDefaultValue(obj);

            if(res.success){
                let list = res.data || [];
                let curIdept = idDept || this.getUserStorage().idDept
                if(list.length)  this.isNewWebPrint = list.includes(curIdept)
                return true
            }
            this.$message.warning(res.message)
            return false
        },

        //默认输液卡前端打印的科室 --- 永帅
        async getLodopDrawPrint(idDept){
            let obj = {
                systemId: this.CONSTANT.INP_NURSE_SYSTEM_FLAG,  //住院
                paramTypeCode: 'INFUSION_PRINT_TYPE_WEBPRO'
            }
            let res = await this.listBySystemIdAndParamTypeCodeForDefaultValue(obj);

            if(res.success){
                let list = res.data || [];
                let curIdept = idDept || this.getUserStorage().idDept
                if(list.length)  this.isLodopDrawPrint = list.includes(curIdept)
                return true
            }
            this.$message.warning(res.message)
            return false
        },

        //默认输液卡分页打印的科室
        async getLodopPagePrint(idDept){
            let obj = {
                systemId: this.CONSTANT.INP_NURSE_SYSTEM_FLAG,  //住院
                paramTypeCode: 'INFUSION_PRINT_TYPE_PDF'
            }
            let res = await this.listBySystemIdAndParamTypeCodeForDefaultValue(obj);

            if(res.success){
                let list = res.data || [];
                let curIdept = idDept || this.getUserStorage().idDept
                if(list.length)  this.isLodopPagePrint = list.includes(curIdept)
                return true
            }
            this.$message.warning(res.message)
            return false
        },

         //默认哪些单据类型采用web打印
         async getNewWebPrintType(from){
            let obj = {
                systemId: this.CONSTANT.INP_SYSTEM_FLAG,  //住院
                paramTypeCode: 'NEW_WEB_PRINT_TYPE'
            }
            let res = await this.listBySystemIdAndParamTypeCodeForDefaultValue(obj);

            if(res.success){
                let list = res.data || [];

                if(from && list.includes(from)) this.isNewWebPrint = true;
                
                return true
            }
            this.$message.warning(res.message)
            return false
        },

        async validateWebPrintRules(from, idDept = '') {
            store.commit('SET_GETPRINTNAMEMESSAGE',false)
            this.isNewWebPrint = false;
            this.isLodopPagePrint = false;
            this.isLodopDrawPrint = false;
            await this.getWebPrintDept(idDept);
            //输液卡
            if(from === this.fromInfusion) {
                await this.getLodopDrawPrint();
                await this.getLodopPagePrint();
            }
            // 哪些类型单据采用web打印
            await this.getNewWebPrintType(from);
          
            //web打印
            if(this.isNewWebPrint) {
                //校验是否开启 cardServers
                if(!sessionStorage.COMPUTER_INFO) {
                    let res = await this.checkStartupCardServers();
                    if(!res) return false
                }
                //web打印服务
                let webRes = await this.WebPrintServerOptions();
                if(!webRes) return false
                //客服端配置
                let mac = await this.getMacPrintByCard();
                if(!mac) return false
            }
           
            return true
        },

        //校验是否开启cardServers 服务
        async checkStartupCardServers() {
            const [err, res] = await this.awaitWrap(this.$axios.get(this.cardServersUrl));
            if(err){
                this.$message.warning('请启动cardServers服务');
                return;
            }
            let hostName = res.hostName || '';
            if(!hostName) {
                this.$message.warning('请启动cardServers服务');
                return false
            }

            sessionStorage.COMPUTER_INFO = JSON.stringify(res);   //储存本机mac、ip信息
            return true
        },

        //web打印预请求
        async WebPrintServerOptions(ser = 'card') {

            let headParams = {
                method: 'options',
                url: this.webPrintUrl,
                data: {},
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                }
            }

            const [err, res] = await this.awaitWrap(axios(headParams))
            if(err){
                store.commit('SET_GETPRINTNAMEMESSAGE',true);
                this.$message.warning('请启动本地web打印管理服务');
                return false;
            }
            console.log('预请求---', 'err', err, 'res--', res);
            return true
        },

        //获取客户端配置打印机
        async getMacPrintByCard () {

            let hostName = '';
            //校验是否开启 cardServers
            if(sessionStorage.COMPUTER_INFO) {
                let macinfo = JSON.parse(sessionStorage.COMPUTER_INFO);
                hostName = macinfo.hostName
            } else {
                let res = await this.checkStartupCardServers();
                if(!res) return false
                hostName = res.hostName;
            }

            let param = {
                clientScopeCode: hostName, // 0为主机名；1为用户编码 ,
                sdClientConfigScope: "0", // 0-本机；1-用户
            };

            const [err, printInfo] = await this.awaitWrap(this.$axios._post("/dict/sClientConfig/page", param)); 

            if(err){
                this.$message.warning('请配置打印机');
                return;
            }

            let printerNameObj = {
                medicalRecordPrintName: '', //病历打印机
                printerName: '',            //其他打印机
            }
            
            if(printInfo.success) {

                let recordList = printInfo.data.records;
                
                if (recordList.length == 2) {
        
                    printerNameObj.medicalRecordPrintName = recordList[0].clientConfigName;
                    printerNameObj.printerName = recordList[1].clientConfigName;

                }
                sessionStorage.PRINTER_INFO = JSON.stringify(printerNameObj);  // 客户端打印机信息
            } 
            if( printerNameObj.printerName )  {
                return true
            }
            this.$message.warning('请配置打印机');
            return false
        },

        //住院/护士站打印封住维护参数
        async PrintTemptBasicsData(obj={}){
            /**打印配置分类 1-病历 2-处方 3-申请单 4-处置单 5-其他 6-同意书 7-医嘱单 8-领药单 9-病案首页  21-出院通知*/
            /*护士站*10- 输液卡 11-治疗单  12-巡回卡 13-费用 14-退药 15-腕带 16-病理标签 17-病理标签条码 */
            /*18-床位卡 19-变动长期医嘱 20-变动临时医嘱*/
            //纸张映射
            
            //主机信息
            let ipInfo = sessionStorage.getItem('COMPUTER_INFO') ? JSON.parse(sessionStorage.getItem('COMPUTER_INFO')) : '';
            let hostName = ipInfo ? ipInfo.hostName : '';
            
            let printObj = {
                deptCode: "",//科室
                // ip: '',
                hostName: "",//主机名
                idOrg: "",//机构
                printDTO: {},//本次打印单据数据
                sdPrintClass: "",//打印分类
                systemId: "",//系统 1门诊  2 住院  4护士站
                wardCode: ""//病区
            }
            let printParams = {
                isPrint:true,//打印 
                noPrint:false//预览 
            }
            Object.keys(printObj).map((key,index)=>{
                if(obj[key]) printObj[key] = obj[key];
                printObj.hostName = hostName;   //主机名字
            })

            let resData = await this.$axios._post('/print/common/commonPrint',printObj);
            if(resData.success){
                let printPDFData = resData.data;

                // if(printParams[obj.type]) this.LodopPrintOriginal(printPDFData);   //直接打印

                //打印
                if(printParams[obj.type]) {
                    //腕带打印目前只能用lodop打印，后续调整
                    if(printObj.sdPrintClass == '15') {
                        this.LodopPrintOriginal(printPDFData);
                        return true
                    }
                    //web直接打印
                    if(this.isNewWebPrint) {
                        let pdfArr = printPDFData.pdf || [];
                        //腕带 15  输液卡 10  输液卡多患者 31  病理标签 17
                        let specClass = ['15', '10', '31', '17'];
                        let Rotate = void 0;
                        let Scaling = specClass.includes(printObj.sdPrintClass) ? 'ShrinkOversized' : void 0;
                        let Successively = void 0;
                        //输液卡纸张打印速度
                        if(printObj.sdPrintClass == '10' || printObj.sdPrintClass == '31') {
                            Successively = true;
                        }
                        //A5纸张
                        if(printPDFData.paperHeight == '1485')  {
                            Scaling = '75'; //A5特殊处理百分比缩放
                            //处方栈
                            if(printPDFData.paperDirectionDesc === '2') {
                                Scaling = '50'; //A5横向 特殊处理百分比缩放
                                Rotate = 90;    //A5横向 旋转90度
                            }
                            //巡回卡
                            if(printObj.sdPrintClass == '12') {
                                Scaling = '88'; //A5横向 特殊处理百分比缩放
                            }
                        }
                        pdfArr.forEach((item, index) =>{
                            setTimeout(()=> {
                                var objs = {
                                    FileFormat: 'pdfUrl',  //默认 pdfUrl
                                    FileStream: item,  //默认 pdf地址
                                    Scaling: Scaling,
                                    Rotate: Rotate,
                                    Successively: Successively,
                                    ...printPDFData,
                                }  
                                this.PDFNewPrint(objs)
                            }, 3000 * index)
                        })
                    }
                    //lodop直接打印
                    if(!this.isNewWebPrint) {
                        let copyPrintPDFData = this.copyObject(printPDFData)
                        
                        this.LodopPrintOriginal({
                            ...copyPrintPDFData,
                            sdPrintClass: printObj.sdPrintClass
                        });
                    }
                }

                return printPDFData;
                
            }else{
                this.$message({
                    type:'error',
                    message:resData.message
                })
                return false
            }
        },

        //护士站调用web打印方式
        PDFNewPrint(obj = {}) {
            console.log("测试新的----obj", obj);
            store.commit('SET_GETPRINTNAMEMESSAGE',false)
            let printerObj = {};
            if(sessionStorage.PRINTER_INFO) {
                printerObj = JSON.parse(sessionStorage.PRINTER_INFO)
            }
        
            //优先读取后端返回的打印机名字，其次读取客户端配置打印机 
            let PrintName = obj.printerName || printerObj.printerName || '';

            //w 2100  h 2970  默认a4纸张大小
            //w 2100  h 1485  默认a5纸张大小
            let Scaling = obj.Scaling || void 0;
            let Rotate = obj.Rotate || void 0;
            let size = obj.paperSizeDesc || 'A4';  //纸张大小
            let W = obj.paperWidth ? obj.paperWidth : '2100';    //纸张宽度
            let H = obj.paperHeight ? obj.paperHeight : '2970';  //纸张高度

            if(H == '1485') size = 'A5'
            //非A4或者A5 纸张， 传给后端参数纸张大小为空 自适应
            if(W !==  '2100') size = 'Custom';
            
            if(size == 'A5')  size = 'A4';   //A5纸打印默认A4

            W = W.slice(0, W.length -1); 
            H = H.slice(0, H.length -1);
            
            let param = {
                FileFormat: obj.FileFormat,  //默认 pdfUrl
                FileStream: obj.FileStream,  //默认 pdf地址
                PrintSettings: {
                    PrintName: PrintName,
                    PrintNum: 1,
                    Duplex: "Simplex", // Default 打印机默认双面打印设置；Horizontal 水平双面打印;Vertical 双面垂直打印 ; Simplex 单面打印
                    Landscape: obj.paperDirectionDesc === '2' || false,   //是否横向，默认是 false
                    Scaling: Scaling,  //四种值 FitSize自适应（默认值）  ActualActualSize实际大小   ShrinkOversized缩小  百分比如 75、80.5
                    Rotate: Rotate,
                    Successively: obj.Successively,
                    PaperSize: {
                        RawKind: size,      //纸张大小，留空或者给AUTO
                        Height: Number(H),  //纸张高度 毫米
                        Width: Number(W),   //纸张宽度 毫米
                    }
                },
            };

            console.log("对接新的pdf打印---参数 --", param);

            if(obj.FileFormat === 'html') {
                this.WebHtmlNewPrint(param);
                return
            }

            this.WebPDFNewPrint(param);
        },


        //PDF web打印
        async WebPDFNewPrint(param = {}){
            
            // store.commit('SET_GETPRINTNAMEMESSAGE',false);
            const [err, res] = await this.awaitWrap(this.$axios._post(this.webPrintUrl, param));
            if(err){
                store.commit('SET_GETPRINTNAMEMESSAGE',true);
                this.$message.warning('请启动本地web打印管理服务');
                return;
            }

            if (res.Success) {
                return true
            } else {
                if(res.Message) this.$message.warning(res.Message)
                return false
            }
        },

        //HTML web打印
        async WebHtmlNewPrint(param = {}){

            const [err, res] = await this.awaitWrap(axios.post(this.webPrintUrl, param));
            if(err){
                this.$message.warning('请启动本地web打印管理服务');
                return;
            }
            if (res.data.Success) {
                return true
            } else {
                this.$message.warning(res.data.Message)
                return false
            }
        }, 

        // 输液单(瓶贴)
        infusionListStartPrint(vm,listArr, printerName){
            let line = vm.PrintTmptData.bottleLabel.tabelContentLine;
            let contentStrList = vm.PrintTmptData.bottleLabel.tabelContentStr;
            LODOP = getLodop();//实例化lodop
            vm.Watermark(LODOP);//配置企业信息
            LODOP.SET_PRINT_PAGESIZE(2,800,600,'CreateCustomPage');
            LODOP.SET_PRINT_STYLE("FontSize",6);
            let strTop = 0;//开始位置
            let interval = 4;//间隔
            let psLeft = 5;
            let psWidth = 56;
            let psHeight = 6;
            // 页数
            for (let index = 0; index < listArr.length; index++) {
                const element = listArr[index];
                for (let i = 0; i < line.length; i++) {
                    const element = line[i];
                    LODOP.ADD_PRINT_LINE(`${element.startTop}mm`,`${element.startLeft}mm`,`${element.endTop}mm`,`${element.endLeft}mm`);
                }
                //固定模板
                element.by ='摆药';
                element.hd ='核对';
                element.jy ='加药';
                element.hd1 ='核对';
                strTop = 16;
                this.mergeData(contentStrList,element).map((item,oIndex)=>{
                    this.setTmp(item);
                });
                // 医嘱列表
                element.orderName.map((item,oIndex)=>{
                    LODOP.SET_PRINT_STYLE("FontSize",9);
                    LODOP.ADD_PRINT_TEXT(`${strTop}mm`,`${psLeft}mm`,`${psWidth}mm`,`${psHeight}mm`,`${item}`);
                    LODOP.SET_PRINT_STYLE("FontSize",9);
                    // LODOP.SET_PRINT_STYLE("Bold",item.bold);
                    strTop += interval;
                });
                LODOP.NewPage();
            }
            // LODOP.PRINT_SETUP();
            // LODOP.PREVIEW();
            console.log("输液卡 -- 前端lodop模板--传过来的打印机名字--", printerName);
            LODOP.SET_PRINTER_INDEX(printerName);   //指定打印机
            LODOP.PRINT(false, true, printerName);
        },

          //映射
          mergeData(positionData,data){
            let arr = [];
            for (let i = 0; i < positionData.length; i++) {
                const element = positionData[i];
                element[element.str] = data[element.str];
                arr.push(element);
            }
            return arr;
        },
        // 设置
        setTmp(item){
            LODOP.ADD_PRINT_TEXT(`${item.top}mm`,`${item.left}mm`,`${item.width}mm`,`${item.height}mm`,`${item[item.str]}`);
            LODOP.SET_PRINT_STYLE("Bold",item.bold);
            LODOP.SET_PRINT_STYLE("FontSize",item.fontSize);
            LODOP.SET_PRINT_STYLE("Alignment",item.alignment);
        },

    }
}