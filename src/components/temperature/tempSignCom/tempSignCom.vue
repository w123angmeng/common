<template>
    <div class="tempSignCom">
         <!-- 体温 -->
        <div class="tempDialog" v-if="list.sdElementDataTypePc == 1">
            <p class="tempDialog_tit">体温详情</p>
            <p class="tempDialog_con">
                <el-select
                    v-model="dataItem.twType"
                    placeholder="体温类型"
                    class="tempDialog_sel"
                    @change="tempTypeChange($event, list)"
                    
                >
                    <el-option
                        v-for="item in wdTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
                <el-input
                    type="text"
                    v-model="list.elementValue"
                    @input="handleSignInput($event,list)"
                    @keyup.enter.native="handleSignInput($event,list)"
                ></el-input>
            </p>
        </div>
        <!-- 血压 -->
        <div class="tempDialog" v-if="list.sdElementDataTypePc == 2">
            <p class="tempDialog_tit">血压详情</p>
            <p class="tempDialog_con">
                <el-input
                    type="text"
                    ref="gyInput"
                    v-model="dataItem.g"
                    @contextmenu.prevent.native="rowRightClick($event, list, 'g')"
                    @input="handleSignInput($event,list, 'g')"
                    placeholder="高压"
                >
                </el-input>
                <span class="dividLineBd">/</span>
                <el-input
                    type="text"
                    v-model="dataItem.d"
                    @contextmenu.prevent.native="rowRightClick($event, list, 'd')"
                    @input="handleSignInput($event,list, 'd')"
                    placeholder="低压"
                >
                </el-input>
            </p>
        </div>
    </div>
</template>
<script>
// const tempUrl = window.globalUrl.tempUrl;
// const getTemperatureControList =
//         tempUrl + "/timeaxis/tpnew/getTemperatureControList"; // 获取体温控件下拉列表
        // sdElementDataTypePc 1体温，2血压，3血糖 ，4体温不升，99其他 
const hlwsSerUrl = window.globalUrl.hlwsServiceUrl;
export default {
    props: {
        list: {
            default: {},
            type: Object
        },
        id: {
            default:"",
            type: String
        },
        tempSignComShow: {
            default: false,
            type: Boolean
        },
        wdTypeList: {
            default: [],
            type: Array
        }
    },
    data() {
        return {
            wdType: "",
            dataItem: {
                g: "",
                d: "",
                gdValue: "",
                twType: "",
                twCode: "",
                tempValue: ""
            },
            dicDataObj: {}
        };
    },
    watch: {
        // tempSignComShow:{
        //     handler: function(val) {
        //         if (val && this.list[this.id].sdElementDataTypePc == 1) {
        //             this.findTempControList();
        //         }
        //     },deep: true
        // },
        list: {
            handler: function(val) {
                if (val.sdElementDataTypePc == 2) {
                    this.reShowData(val);
                }
            },
            deep: true
        }
    },
    created() {
        
        
    },
    mounted() {
        // 默认第一个体温类型
        // if (this.wdTypeList.length && this.list[this.id].sdElementDataTypePc == 1) {
        //     this.dataItem.twType = this.wdTypeList[0].value;
        //     this.list[this.id].signCode = this.wdTypeList[0].value;
        //     this.list[this.id].signDesc = this.wdTypeList[0].label;
        // }
        // this.getDicData();
    },
    methods: {
        // 回显血压数据
        reShowData(data) {
            let list = JSON.parse(JSON.stringify(data))
            if (list.elementValue) {
                if (list.elementValue.indexOf('/') > 0) {
                    let arr = list.elementValue.split('/');
                    this.dataItem.g = arr[0] ? arr[0] : '';
                    this.dataItem.d = arr[1] ? arr[1] : '';
                } else {
                    // 暂时这样处理
                    if (!this.dataItem.d) {
                        this.dataItem.g = list.elementValue;
                        this.dataItem.d = '';
                    } else if (this.dataItem.g && this.dataItem.d) {
                        this.dataItem.g = list.elementValue;
                        this.dataItem.d = '';
                    }
                    
                }
            }
        },
        getValueChange() {
            this.dataItem.id = this.id;
            this.$emit('signTypeValChange', this.dataItem);
        },
        tempTypeChange(e, item) {
            this.wdTypeList.forEach((li,idx) => {
                if (li.value == e) {
                    this.twCode = li.label;
                    item.signCode = li.value;
                    item.signDesc = li.label;
                }
            })
            this.dataItem.twType = e;
            this.getValueChange();
        },
         // 获取右键菜单列表
        async getDicData() {
            await this.$axios.get(`${hlwsSerUrl}emr/common/getVitalSignNoneKeysList`).then(res => {
                if (res.success) {
                res.data.forEach(item=> {
                    this.dicDataObj[item.value] = item.name
                })
                // console.log("组织数据：",this.dicDataObj)
                }
            }).catch(err=> {
                console.log(err)
            })
        },
        //右键
        async rowRightClick(event,item, type) {
            if (!Object.keys(this.dicDataObj).length) {
                await this.getDicData();
            }
            event.preventDefault();
            let itemsArr = []
            for(let key in this.dicDataObj) {
                itemsArr.push({
                    label: this.dicDataObj[key],
                    onClick: () => {
                        //   Object.assign(row[column.property], {
                        //       elementValue: key
                        //   })
                        if (type && type == 'g') {
                            this.dataItem.g = key;
                            if (this.dataItem.d) {
                                item.elementValue = key + '/' +this.dataItem.d ;
                            } else {
                                item.elementValue = this.dataItem.g;
                            }
                        } else if (type && type == 'd') {
                            this.dataItem.d = key;
                            if (this.dataItem.g) {
                                item.elementValue = this.dataItem.g + '/' + key;
                            } else {
                                item.elementValue = key;
                            }
                            
                        } else {
                            item.elementValue = key;
                        }
                        
                    }
                })
            }
            this.$contextmenu({
                items: itemsArr,
                event,
                //x: event.clientX,
                //y: event.clientY,
                customClass: "rightClick",
                zIndex: 9999,
                minWidth: 150
            });
            return false;
        },
        handleSignInput(e, item, gdType) {
            if (item.sdElementDataTypePc == 1) {
                this.dataItem.tempValue = e;
                item.elementValue = e;
            } else if (item.sdElementDataTypePc == 2 && gdType == 'g') {
                let val =  this.numberCheck(e) ? this.numberCheck(e) : '';
                this.dataItem.g = val;
                this.dataItem.gdValue = val;
                let dVal = this.dataItem.d ? '/'+this.numberCheck(this.dataItem.d) : '';
                item.elementValue = this.dataItem.g + dVal;
            }else if (item.sdElementDataTypePc == 2 && gdType == 'd') {
                this.dataItem.d = this.numberCheck(e) ? this.numberCheck(e) : '';
                let gVal = this.dataItem.g ? this.dataItem.g : '';
                let dVal = this.dataItem.d ? '/' +this.dataItem.d  : '';
                item.elementValue = gVal + dVal;
            }
            this.getValueChange();
        },
        popoverTitle(type) {
            let tit = ""
            if (type == 1){
                tit="体温详情"
            } else if (type == 2) {
                tit="血压详情"
            }
            return tit;
        },
        numberCheck(val) {
            var str = val;
            var len1 = str.substr(0, 1);
            var len2 = str.substr(1, 1);
            // 如果第一位是-，第二位不是1，则用1替换
            // if (str.length > 1 && len1 == '-' && len2 != '-') {
            //     str = len1 + this.getCaption(str);
            // } else {
                //如果第一位是0，第二位不是点，就用数字把点替换掉
                if (str.length > 1 && len1 == 0 && len2 != ".") {
                    str = str.substr(1, 1);
                }
                //第一位不能是.
                if (len1 == ".") {
                    str = "";
                }
                //限制只能输入一个小数点
                if (str.indexOf(".") != -1) {
                    var str_ = str.substr(str.indexOf(".") + 1);
                    if (str_.indexOf(".") != -1) {
                        str = str.substr(
                            0,
                            str.indexOf(".") + str_.indexOf(".") + 1
                        );
                    }
                }
            // }
            str = str.match(/^\-?\d*(\.?\d{0,1})/g)[0] || null;
            
            //正则替换，保留数字和小数点
            // str = str.match(/^\d*(\.?\d{0,1})/g)[0] || null;
            // str = str.match(/^\-?\d*(\.?\d{0,1})/g)[0] || null;
            return str;
        },
        // 获取体温控件下拉列表
        // findTempControList() {
        //     this.$axios.post(getTemperatureControList, {}).then((res) => {
        //         if (res.success) {
        //             this.wdTypeList = res.data;
        //         }
        //     });
        // },
    }
};
</script>
<style lang="scss" src="./tempSignCom.scss">