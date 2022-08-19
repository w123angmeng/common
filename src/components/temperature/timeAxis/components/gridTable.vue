<template>
    <tbody id="mtbody">
        <tr
            v-for="(item, pindex) in gridArray"
            :style="styleObj"
            :key="pindex"
            :class="doTrBorder(item.className, pindex)"
        >
            <td
                v-for="(childitem, cindex) in item"
                :key="cindex"
                :rowSpan="doCheckIndex(pindex, cindex, childitem.type, childitem.rowSpan)"
                :style="
                    doVerticalAlign(
                        childitem.styleAlin,
                        pindex,
                        cindex,
                        childitem.title
                    )
                "
                :class="doTdBorder(childitem.className, pindex, cindex, childitem.colSpan, childitem.type)"
                :colSpan="childitem.colSpan"
            >
                <div v-if="doSvgLeftShow(pindex, cindex)" className="svgLeft" >
                    <div class="kdTitle">
                        <!-- 倒序排列 -->
                        <!-- <p v-for="(item, index) in KDobj.leftScaleData" :key="index" style="text-align: center;flex: 1;">
                            {{item.name}}
                        </p> -->
                        <p v-if="showScaleHX">
                            {{ title3[0] }}<br />{{ title3[1] }}
                        </p>
                        <p v-if="showScaleMB">
                            {{ title2[0] }}<br />{{ title2[1] }}
                        </p>
                        <p v-if="showScaleTW">
                            {{ title1[0] }}<br />{{ title1[1] }}
                        </p>
                    </div>
                    <SvgLeft />
                </div>
                {{ childitem.text }}
            </td>
        </tr>
        <tr
            v-for="(item, pindex) in painArray"
            :style="'height:'+styleObj.ttTrH"
            :key="gridArray.length + pindex"
            :class="doTrBorder('', pindex)"
        >
            <td
                v-for="(childitem, cindex) in item"
                :key="cindex"
                :rowSpan="doCheckIndex(pindex, cindex, childitem.type, childitem.rowSpan)"
                :style="
                    doVerticalAlign(
                        childitem.styleAlin,
                        pindex,
                        cindex,
                        childitem.title
                    )
                "
                :class="doTdBorder(childitem.className, pindex, cindex, childitem.colSpan, childitem.type)"
                :colSpan="childitem.colSpan"
            >
            <div v-if="doSvgLeftShow(pindex, cindex)">
                <span v-html="childitem.text" class="painTrCss"></span>
                <SvgLeft :isPainCurve="isPainCurve"/>
            </div>
            </td>
        </tr>
        <tr
            v-for="(item, pindex) in everyDayMapArray"
            :style="styleObj"
            :key="painArray.length + gridArray.length  + pindex"
            :class="doTrBorder('', painArray.length + gridArray.length  + pindex)"
        >
            <td
                v-for="(childitem, cindex) in item"
                :key="cindex"
                :rowSpan="doCheckIndex(painArray.length + gridArray.length  + pindex, cindex, childitem.type, childitem.rowSpan)"
                :style="doVerticalAlign(
                        childitem.styleAlin,
                        painArray.length + gridArray.length  + pindex,
                        cindex,
                        childitem.title
                    )
                    "
                :class="[doTdBorder(childitem.className, painArray.length + gridArray.length  + pindex, cindex, childitem.colSpan, childitem.type), childitem.addClass]"
                :colSpan="childitem.colSpan"
            >
                <span class="fontSizeChange" v-html="childitem.text"></span>
            </td>
        </tr>
    </tbody>
</template>

<script>
import bus from "@/components/common/bus.js";
import SvgLeft from "./svgLeft";
import SvgRight from "./svgRight";
import { mapMutations, mapGetters } from "vuex";
import TMPCODE from "../../tmpcode.js"; //引用模块进来
export default {
    name: "gridTable",
    props: ["beginDate", "breathingList", "dayMap", "tempTrH", "tempStrucItem", 'pointTime', 'isPrint'],
    data() {
        return {
            selBreathingList: [], //呼吸数据
            selDayMap: [], //下方可扩展项目
            gridArray: [], //网格数组
            painArray: [], // 疼痛曲线网格数组
            everyDayMapArray: [], // 底部每日可扩展的项目
            styleObj: {
                height: "",
                ttTrH: "",
            },
            title1: ["体温", "℃"],
            title2: ["脉搏", "次/分"],
            title3: ["呼吸", "次/分"],
            leftScaleData: [],
            lastTr: 0,
            trLines: 5,
            //获取标尺禁用与启用
            showScaleTW: false,
            showScaleMB: false,
            showScaleHX: false,
            selTempTrH: this.tempTrH,
            isPainCurve: false,
            firstTd:{
                className: "every borderVL",
                colSpan: 0,
                key: 0,
                rowSpan: 0,
                styleAlin: "",
                text: "",
                title: "",
            },
            otherTd:{
                className: "every borderVL",
                colSpan: 6,
                key: 0,
                rowSpan: 0,
                styleAlin: "",
                text: "",
                title: "",
            },
            addRows: 0,
            seltempStrucItem: this.tempStrucItem,
            firstLoad: true,
            isPrintWatch: this.isPrint,
        };
    },
    components: {
        SvgLeft,
        SvgRight,
    },
    computed: {
        ...mapGetters(["KDobj"]),
    },
    created() {
        // this.selBreathingList = this.breathingList;
        // this.selTempTrH = this.tempTrH;
        // this.seltempStrucItem = this.tempStrucItem;
        // this.selDayMap = this.dayMap;
        // this.WDLastTr = Number(this.KDobj.lastTr + 1);
        // this.trLines = Number(this.KDobj.trLines);
        // this.styleObj.height = 15 + "px";
        //画网格
        // console.log(this.dayMap)
        // this.gridArray = this.createTable(this.breathingList, this.selDayMap);
        this.initData();
        //获取标尺禁用与启用
        this.showScaleTW = this.KDobj.scaleDisplayObj.showScaleTW;
        this.showScaleMB = this.KDobj.scaleDisplayObj.showScaleMB;
        this.showScaleHX = this.KDobj.scaleDisplayObj.showScaleHX;
        this.isPainCurve = this.KDobj.scaleDisplayObj.showScaleTT;
        // console.log(this.gridArray);
        // 绘制空表格
        // if (Number(this.addRows) !== 0) {

            // this.getAddRows();
        // }
    },
    mounted() {
        // 打印的话不需要重新计算绘制表格数据
        if (!this.isPrintWatch) {
            this.$nextTick(()=>{
                let headerHeight = document.querySelector('.hospitalTitle').getBoundingClientRect().height;
                let tempCartSvg = document.querySelector('.tempCartSvg').getBoundingClientRect().height;
                let pageFooter = document.querySelector('.pageFooter').getBoundingClientRect().height;
                let rowNum = Math.floor((1122 - headerHeight - tempCartSvg - pageFooter - 100) / 15);
                    sessionStorage.setItem("addRows", rowNum);
                    this.getAddRows();
                
            })
        } else {
            this.getAddRows();
        }
        
    },
    watch: {
        isPrint: {
            handler(val) {
                this.isPrintWatch = val;
            },
            deep: true
        },
        beginDate: {
            handler(newVal, oldVal) {
                // console.log(newVal, this.addRows)
                // this.selBreathingList = this.breathingList;
                // this.selTempTrH = this.tempTrH;
                // this.selDayMap = this.dayMap;
                // this.WDLastTr = Number(this.KDobj.lastTr + 1);
                // this.trLines = Number(this.KDobj.trLines);
                // this.seltempStrucItem = this.tempStrucItem;
                // this.styleObj.height = 15 + "px";
                // //画网格
                // this.gridArray = this.createTable(
                //     this.breathingList,
                //     this.selDayMap
                // );
                this.initData();
                this.renderEmptyData(this.addRows);
            },
            deep: true,
        },
        dayMap: {
            handler(newV, oldV) {},
            deep: true,
        },
        tempTrH: {
            handler(newV, oldV) {
                this.selTempTrH = newV;
            },
            deep: true,
        },
        addRows(newVal){
            // if(newVal){
            //     let info = new Array(8);
            //     info.fill(this.otherTd);
            //     info.shift();
            //     info.unshift(this.firstTd);
            //     // console.log(info);
            //     for(let i=0;i<newVal;i++){
            //         this.gridArray.push(info);
            //     }
            // }
            this.renderEmptyData(newVal);
        }
    },
    methods: {
        // 初始化数据
        initData() {
            this.selBreathingList = this.breathingList;
            this.selTempTrH = this.tempTrH;
            this.selDayMap = this.dayMap;
            this.WDLastTr = Number(this.KDobj.lastTr + 1);
            this.trLines = Number(this.KDobj.trLines);
            this.seltempStrucItem = this.tempStrucItem;
            this.styleObj.height = 15 + "px";
            this.styleObj.ttTrH = 8 + 'px';
            //画网格
            this.gridArray = this.createTable(
                this.breathingList,
                this.selDayMap
            );
            // 添加疼痛曲线
            if (this.KDobj.scaleDisplayObj.showScaleTT) {
                this.painArray = this.drawPainCurve();
            }
            // 绘制底部每日录入可扩展项目
            this.everyDayMapArray = this.scalbleForm(this.selDayMap);
        },
        // 拿到格子数值，创建空数据
        renderEmptyData(row) {
            if(row){
                let info = new Array(8);
                info.fill(this.otherTd);
                info.shift();
                info.unshift(this.firstTd);
                // console.log(info);
                // 如果每天录入数据长度大于创建的格子数则隐藏表格线条，如果小于则创建新表格
                // 通过添加class控制样式，先清空样式再追加
                if (row < 0) {
                    let splIndx = this.everyDayMapArray.length - Math.abs(row);
                    this.everyDayMapArray.forEach((item, index)=> {
                        item.forEach(li=> {
                            this.$set(li, 'addClass', '');
                            if (index>=splIndx) {
                                this.$set(li, 'addClass', 'hideBorder');
                            }
                        })
                    })
                    // this.everyDayMapArray.splice(splIndx)
                } else {
                    for(let i=0;i<row;i++){
                        this.everyDayMapArray.push(info);
                    }
                }
                // for(let i=0;i<row;i++){
                //     this.everyDayMapArray.push(info);
                // }
                
            }
        },
        // 获取需要添加几个格子
        getAddRows(){
            let timer=setInterval(() => {
                let addRows = sessionStorage.getItem("addRows");
                // let dayDateMapLen = Object.keys(this.dayMap).length;
                if(addRows){
                    // if (addRows >= 0) {
                    //     this.addRows = addRows;
                    // } else {
                    //     this.addRows = dayDateMapLen - Number(addRows);
                    // }
                    this.addRows = addRows;
                    clearInterval(timer);
                }
            }, 30);
        },
        returnParams(
            key = "",
            rowSpan,
            colSpan,
            className = "",
            text = "",
            styleAlin = "",
            title = "",
            type = ""
        ) {
            let params = {
                key: key,
                rowSpan: rowSpan || 0,
                colSpan: colSpan || 0,
                className: className || "",
                text: text || "",
                styleAlin: styleAlin || "",
                title: title,
                type: type
            };
            return params;
        },
        //首行首各 跨行处理
        doCheckIndex(pindex, cindex, type, rowSpan) {
            if (type == 'pain' && type) {
                return rowSpan;
            } else {
                if (pindex == 0 && cindex == 0) {
                    return this.WDLastTr;
                }
            }
            
        },
        //每五行 加粗
        doTrBorder(className, index) {
            if (index == Number(this.KDobj.trLittleCounts) - 1) {
                return ["borderB"];
            } else {
                index = index - Number(this.KDobj.trLittleCounts);
                if ((index + 1) % this.trLines === 0 && index < this.WDLastTr) {
                    return ["borderB"];
                } else {
                    return [""];
                }
            }
        },
        //每六列标红
        doTdBorder(border, pindex, cindex, colSpan, type) {
            if (pindex < this.WDLastTr) {
                return [border];
            } else {
                if (colSpan == 6 && colSpan % 6 == 0) {
                    return [border];
                } else if (colSpan == 3 && cindex % 2 == 0) {
                    return [border];
                } else if (colSpan == 0 && cindex % 6 == 0) {
                    return [border];
                } else {
                    if (type == 'painD') {
                        return [border]
                    }
                }
                
            }
        },
        //处理呼吸 奇偶列上下显示
        doVerticalAlign(styleAlin, pindex, cindex, val) {
            if (val == "呼吸") {
                return {
                    "vertical-align": styleAlin,
                    "height": "30px",
                    "font-size": "12px",
                };
            } else if (val == "血压") {
                return {
                    "font-size": "12px",
                };
            }
        },
        //展示左侧刻度线
        doSvgLeftShow(pindex, cindex) {
            if (pindex === 0 && cindex === 0) {
                return true;
            } else {
                return false;
            }
        },
        // 画疼痛曲线表格
        drawPainCurve() {
            // 添加疼痛曲线
            let painInputArr = [];
            for(let p=0; p<5; p++) {
                painInputArr[p] = [];
                if (p==0) {
                    painInputArr[p].push(
                        this.returnParams(
                            0,
                            p == 0 ? 5 : 0,
                            "",
                            "painCss borderVL",
                            '<span>（P）</span><span> 0-10</span>',
                            "",
                            "",
                            "pain"
                        )
                    );
                }
                for (let k = 0; k<42;k++) {
                    if ((k + 1) % 6 === 0) {
                        painInputArr[p].push(
                            this.returnParams(
                                k+1,
                                "",
                                "",
                                "borderR painCss",
                                '',
                                "",
                                "",
                                "painD"
                            )
                        );
                    } else {
                        painInputArr[p].push(this.returnParams(
                            k+1,
                            "",
                            "",
                            "11",
                            '',
                            ""
                        ));
                    }
                    
                }
            }
            return painInputArr;
        },
        //画表格
        createTable(breathingList, selDayMap) {
            let gridArray = [];
            //中间41行
            for (let i = 0; i < this.WDLastTr; i++) {
                //每一列41个格子 循环41遍 这里要写活 写成可配置的
                gridArray[i] = [];
                if (i === 0) {
                    //第一行
                    gridArray[i].push(this.returnParams(0, this.WDLastTr));
                    for (let j = 0; j < 42; j++) {
                        //中间42个格子
                        if ((j + 1) % 6 === 0) {
                            gridArray[i].push(
                                this.returnParams(j + 1, 0, "", "borderR")
                            );
                        } else {
                            gridArray[i].push(this.returnParams(j + 1, 0));
                        }
                    }
                } else {
                    //非第一行
                    for (let j = 0; j < 42; j++) {
                        if ((j + 1) % 6 === 0) {
                            gridArray[i].push(
                                this.returnParams(j + 1, 0, "", "borderR")
                            );
                        } else {
                            gridArray[i].push(this.returnParams(j + 1, 0));
                        }
                    }
                }
            }
            // //下方 生成呼吸信息
            // let hxData = breathingList;
            // let len = gridArray.length;
            // gridArray[len] = [];
            // gridArray[len].push(this.returnParams(0, 0, "", "hx", "呼吸"));
            // let align = "bottom";
            // for (let i = 0; i < 41; i++) {
            //     if (align == "bottom" && hxData[i] !== "") {
            //         align = "top";
            //     } else if (align == "top" && hxData[i] !== "") {
            //         align = "bottom";
            //     }
            //     gridArray[len].push(
            //         this.returnParams(
            //             i + 1,
            //             0,
            //             "",
            //             "hx",
            //             hxData[i],
            //             align,
            //             "呼吸"
            //         )
            //     );
            // }
            // gridArray[len].push(this.returnParams(42, 0, "", "hx", "", ""));
            // // 添加疼痛曲线
            // this.painArray = this.drawPainCurve(gridArray);
            // this.scalbleForm(selDayMap, gridArray);
            return gridArray;
        },
        // 绘制底部每日录入可扩展项目表格
        scalbleForm(selDayMap) {
            //生成每日录入信息
            let everyDayMapArray = [];
            let dayInput = this.parseMapData(selDayMap); //获取每日录入数据 排序
            let title = dayInput.titleArray;
            let value = dayInput.valueArray;
            for (let i = 0; i < title.length; i++) {
                if (title[i]) {
                    if (value[i].length == 0) {
                        //无值则不展示
                        continue;
                    }
                    everyDayMapArray[i] = [];
                    let unitData = title[i].units ? "(" + title[i].units + ")" : ''
                    everyDayMapArray[i].push(
                        this.returnParams(
                            0,
                            0,
                            "",
                            "every borderVL",
                            title[i].name +  unitData,
                            ""
                        )
                    );
                    if (title[i].name == "呼吸") {
                        let align = "bottom";
                        let len = this.fequencyTimesDrawTable(TMPCODE.BREATHING_TMP), merSpan=null;
                        merSpan = len == 7 ? 6 : len == 42 ? "" : 3
                        for (let j = 0; j < len; j++) {
                            if (align == "bottom" && value[i][j] !== "") {
                                align = "top";
                            } else if (align == "top" && value[i][j] !== "") {
                                align = "bottom";
                            }
                            everyDayMapArray[i].push(
                                this.returnParams(
                                    j + 1,
                                    0,
                                    merSpan,
                                    "hx borderVL",
                                    value[i][j],
                                    align,
                                    "呼吸"
                                )
                            );
                        }
                    } else if (title[i].name == "血压") {
                        let len = this.fequencyTimesDrawTable(TMPCODE.HYPERTENSION_TMP), merSpan=null;
                        merSpan = len == 7 ? 6 : len == 42 ? "" : 3
                        for (let j = 0; j < len; j++) {
                            everyDayMapArray[i].push(
                                this.returnParams(
                                    1 + j,
                                    0,
                                    merSpan,
                                    "every borderVL",
                                    value[i][j],
                                    "",
                                    "血压"
                                )
                            );
                        }
                    } else {
                        // 后期优化汉字判断，需要后端返回对应的编码
                        let cssName = title[i].name.indexOf('药物过敏') !== -1 ? 'redLight every borderVL' : 'every borderVL';
                        let otherLen = this.fequencyTimesDrawTable('', title[i].name), merSpan=null;
                        merSpan = otherLen == 7 ? 6 : otherLen == 42 ? "" : 3
                        for (let j = 0; j < otherLen; j++) {
                            everyDayMapArray[i].push(
                                this.returnParams(
                                    1 + j,
                                    0,
                                    merSpan,
                                    cssName,
                                    value[i][j],
                                    ""
                                )
                            );
                        }
                    }
                    // 下面代码添加之后多加了一列，导致上面的表格格子有问题
                    // gridArray[length].push(this.returnParams(value[i].length + 1,0,0,'every'))
                }
            }
            return everyDayMapArray;
        },
        fequencyTimesDrawTable(itemCodeType, text) {
            let len = null;
            this.seltempStrucItem.footerList.map(item=> {
                if (item.itemCode == itemCodeType || item.itemDesc == text){
                    if (item.times == 1) {
                        len = 7;
                    } else if (item.times == 2) {
                        len = 14
                    } else if (item.times == 6) {
                        len = 42;
                    }
                }
            })
            return len;
        }

    },
};
</script>
<style lang="scss">
  @import '../assets/styles/app.scss';
    
</style>


