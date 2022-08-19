<template>
    <tbody class="tableInfoTbody">
        <tr id="dateTR">
            <td>日期</td>
            <td v-for="(item, index) in daysArray" :key="index" colSpan="6" :class="doTdBorder( index, 6)">
                {{ item }}
            </td>
        </tr>
        <tr v-for="(item, ind) in titleBarItem" :key="ind">
            <td
                v-for="(childitem, cindex) in item"
                :key="cindex"
                :colSpan="childitem.colSpan"
                :class="doTdBorder( cindex, childitem.colSpan)"
            >
                {{ childitem.text ? childitem.text : "" }}
            </td>
        </tr>
        <!-- <tr id="hospDaysTr">
            <td>住院日数</td>
            <td v-for="(item, index) in dayList" :key="index" colSpan="6">
                {{ item }}
            </td>
        </tr>
        <tr id="operaDaysTr">
            <td>手术后天数</td>
            <td v-for="(item, index) in dayOps" :key="index" colSpan="6">
                {{ item }}
            </td>
        </tr> -->
        <tr id="timeTr">
            <td>时间</td>
            <td
                v-for="(item, index) in timesArray"
                :key="index"
                :class="doTdBorder( index, 0)"
            >
                {{ item.num }}
            </td>
        </tr>
    </tbody>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";

export default {
    name: "tableInfo",
    props: ["beginDate", "titleBarMap", "dayOps", "dayList"],
    data() {
        return {
            selBeginDate: "",
            selDayOps: [],
            selDayList: [],
            daysArray: [], //
            timesArray: [], //
            titleBarItem: [],
        };
    },
    computed: {
        ...mapGetters(["KDobj"]),
    },
    created() {
        this.selBeginDate = this.beginDate;
        this.selDayOps = this.dayOps;
        this.selDayList = this.dayList;
        this.WDLastTr = Number(this.KDobj.lastTr + 1);
        this.daysArray = this.getDaysArray(this.beginDate);
        this.titleBarItem = this.createTable(this.titleBarMap);
        this.timesArray = this.getTimes();
    },
    watch: {
        beginDate: {
            handler(newValue, OldValue) {
                this.selBeginDate = newValue;
                this.selDayOps = this.dayOps;
                this.selDayList = this.dayList;
                this.daysArray = this.getDaysArray(newValue);
                this.titleBarItem = this.createTable(this.titleBarMap);
            },
            deep: true,
        },
    },
    methods: {
        //每六列标红
        doTdBorder(cindex, colSpan) {
            if (colSpan == 6 && colSpan % 6 == 0) {
                return ['borderVL'];
            } else if (colSpan == 0 && (cindex+1) % 6 == 0) {
                return ['borderVL'];
            }
        },
        // @method getDaysArray 生成显示天数
        // @param {String} beginDate 开始时间
        getDaysArray(beginDate) {
            const showDays = 7;
            //根据当前日期和显示天数生成日期数组
            let daysArray = [];
            let years = []; //定义跨年数据
            let monthes = []; //定义跨月数据
            for (let i = 0; i < showDays; i++) {
                let newDate = this.getNewDate(beginDate, i);
                let newARR = newDate.split("-");
                years.push(newARR[0]);
                monthes.push(newARR[1]);
                if (i == 0) {
                    daysArray.push(newDate);
                } else {
                    //跨年处理
                    if (years[i] !== years[i - 1]) {
                        daysArray.push(newDate);
                    } else {
                        //跨月处理
                        if (monthes[i] !== monthes[i - 1]) {
                            let monDys =
                                String(newARR[1]) + "-" + String(newARR[2]);
                            daysArray.push(monDys);
                        } else {
                            daysArray.push(newARR[2]);
                        }
                    }
                }
            }
            return daysArray;
        },
        // @method getTimes 生成每天的时刻 2-6-10-14-18-22
        getTimes() {
            //生成timesArray
            let timesArray = [];
            let beginTime = Number(this.KDobj.beginTime); // Number(this.KDobj.beginTime) == 2 ? 2 : 3;
            // 2 - 6 - 10 - 14 - 18 - 22
            // 1 - 5 - 9 - 13 - 17 - 21
            // 3 - 7 - 11 - 15 - 19 - 23
            for (let i = 0; i < 42; i++) {
                let num = beginTime + (i % 6) * 4;
                let params = {
                    border: "",
                    num: "",
                    index: "",
                };
                params.border = "";
                params.num = num;
                params.index = i;
                if (num === 22) {
                    params.border = "borderR";
                }
                timesArray.push(params);
            }
            return timesArray;
        },
        returnParams(
            key = "",
            rowSpan,
            colSpan,
            className = "",
            text = "",
            styleAlin = "",
            title = ""
        ) {
            let params = {
                key: key,
                rowSpan: rowSpan || 0,
                colSpan: colSpan || 0,
                className: className || "",
                text: text || "",
                styleAlin: styleAlin || "",
                title: title,
            };
            return params;
        },
        //画表格
        createTable(selDayMap) {
            let gridArray = [];
            let dayInput = this.parseMapData(selDayMap); //获取每日录入数据 排序
            let title = dayInput.titleArray;
            let value = dayInput.valueArray;
            for (let i = 0; i < title.length; i++) {
                if (value[i].length == 0) {
                    //无值则不展示
                    continue;
                }
                let length = gridArray.length;
                gridArray[length] = [];
                gridArray[length].push(
                    this.returnParams(0, 0, "", "every", title[i].name, "")
                );

                // value[i]为体征项目的值如住院天数[28, 29, 30, 31, 32, 33, 34]
                for (let j = 0; j < value[i].length; j++) {
                    gridArray[length].push(
                        this.returnParams(
                            1 + j,
                            0,
                            6,
                            "every borderR",
                            value[i][j],
                            ""
                        )
                    );
                }
                // 下面代码添加之后多加了一列，导致上面的表格格子有问题
                // gridArray[length].push(this.returnParams(value[i].length + 1,0,0,'every'))
            }
            return gridArray;
        },
    },
};
</script>
<style lang="scss">
// @import '../assets/styles/app.scss';

//   .tableInfoTbody tr td:last-child{
//       border-right: 1px solid #333;
//   }
</style>


