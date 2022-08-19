<template>
    <div class='AddAllergy'>
        <div v-for="(item, index) in formData.ppatList">
            <el-row class="allergyItemRow">
                <span class="allergyRow allergyName" style="width: 20%">
                    <el-autocomplete 
                        class="allergyName" 
                        v-model="item.allergyName" 
                        :fetch-suggestions="findAllergyList"
                        placeholder="过敏源">
                    </el-autocomplete>
                    <!-- :title="showTitle(item.allergyName, 14)" -->
                </span>
                <span class="allergyRow" style="width: 17%">
                    <el-input 
                        class="reaction" 
                        v-model="item.allergyReaction" 
                        placeholder="过敏反应">
                    </el-input>
                    <!-- :title="showTitle(item.allergyReaction, 8)" -->
                </span>
                <span class="allergyRow"  style="width: 16%">
                    <el-select v-model="item.sdAllergyDegree" placeholder="过敏程度">
                        <el-option 
                            v-for="itm in levelList" 
                            :key="itm.dataCode" 
                            :label="itm.dataName" 
                            :value="itm.dataCode">
                        </el-option>
                    </el-select>
                </span>
                <span class="allergyRow rowTime"  style="width: 17%">
                    <el-date-picker 
                        v-model="item.allergyDate" 
                        type="datetime" 
                        format="yyyy-MM-dd HH:mm:ss"
                        value-format="yyyy-MM-dd HH:mm:ss" 
                        placeholder="过敏时间">
                    </el-date-picker>
                </span>
                <span class="allergyRow"  style="width: 17%">
                    <el-input 
                        class="reaction" 
                        v-model.trim="item.description" 
                        placeholder="备注">
                    </el-input>
                    <!-- :title="showTitle(item.description, 8)" -->
                </span>
                <span style="width: 100px;">
                    <span class="allergyRow-groupBtn" >
                        <el-button 
                            type="text" 
                            class="ciDiagnBtn" 
                            :disabled="index === 0 ? true : false">
                            <img 
                                src="@/assets/images/outpDoctor/outp_up.svg" 
                                alt="" 
                                style="width:10px;"
                                @click="upAllergy(index, item)">
                        </el-button>
                        <el-button 
                            type="text" 
                            class="ciDiagnBtn" 
                            :disabled="index === formData.ppatList.length - 1 ? true : false">
                            <img 
                                src="@/assets/images/outpDoctor/outp_down.svg" 
                                alt="" 
                                style="width:10px;"
                                @click="downAllergy(index, item)">
                        </el-button>
                        <el-button type="text" class="ciDiagnBtn">
                            <img 
                                src="@/assets/images/outpDoctor/outp_add.svg" 
                                alt="" 
                                style="width:16px;"
                                @click="addBtnAllergy">
                        </el-button>
                        <el-button type="text" class="ciDiagnBtn" v-show="formData.ppatList.length != 1">
                            <img 
                                src="@/assets/images/outpDoctor/outp_delete.svg" 
                                alt="" 
                                style="width:16px;"
                                @click="deleteAllergy(index)">
                        </el-button>
                    </span>
                </span>
                
            </el-row>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
        },

        data() {
            return {
                allergyList: [], //过敏列表
                levelList: [], //程度等级
            };
        },
        created() {
            this.getAllergyDegreeList();   //获取过敏程度下拉列表
            this.getAllergyData();         //初始化过敏源数据
            console.log("nav-router");
        },
        mounted() {},
        components: {

        },
        computed: {},
        methods: {

            //获取过敏程度下拉列表
            getAllergyDegreeList(){
                this.findSdData('SD_ALLERGY_DEGREE').then(data => {
                    this.levelList = data.SD_ALLERGY_DEGREE;
                    this.$emit("getAllergyDegreeList", data.SD_ALLERGY_DEGREE)
                })
            },

            //查看过敏源数据
            getAllergyList(name = ''){
                return this.$axios.get('/dict/allergen/pageAllergen', {
                    pageIndex: 1,
                    pageSize: 100,
                    selCondition: name,
                    enabled: 1,
                }).then(res => {
                    if (res.success) {
                        let arr = res.data.records;
                        let obj = [];
                        arr.map(v => {
                            obj.push({
                                value: v.allergyName, //过敏原名称
                                allergyName: v.allergyName, //过敏原名称
                                allergyCode: v.allergyCode, //过敏原代码
                                idAllergy: v.idAllergy, //过敏原id
                                idPatAllergy: v.idPatAllergy, //主键
                                sdAllergyType: v.sdAllergyType, //过敏原分类
                            });
                        })
                        return obj
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                })
            },

            //初始化过敏源数据
            getAllergyData(){
                this.getAllergyList('').then( data => {
                    this.formData.allergensDic = data;   //全部过敏源字典数据
                    data.map( v => {
                        this.formData.allergyNames.push(v.allergyName);  //全部过敏源名称集合
                    })
                })
            },

            // 过敏史联想搜索
            findAllergyList(name, callback) {
                this.allergyList = [];
                this.getAllergyList(name).then( data => {
                    this.allergyList = data;
                    callback(this.allergyList)
                })
            },

            //添加过敏史
            addBtnAllergy() {
                this.formData.ppatList.push({
                    allergyDate: '',        //过敏时间
                    allergyName: '',      //过敏源名称
                    sdAllergyDegree: '',  //过敏程度
                    allergyReaction: '',  //过敏反应
                    description: '',      //备注
                });
            },

            //删除过敏史
            deleteAllergy(index) {
                this.formData.ppatList.splice(index, 1);
            },

            //上移过敏史
            upAllergy(index, row) {
                if (index === 0) return
                this.formData.ppatList.splice(index - 1, 0, row);
                this.formData.ppatList.splice(index + 1, 1);
            },

            //下移过敏史
            downAllergy(index, row) {
                if (index === this.formData.ppatList.length - 1) return
                this.formData.ppatList.splice(index + 2, 0, row)
                this.formData.ppatList.splice(index, 1)
            },

            //鼠标悬浮显示文字
            showTitle(str, num) {
                if(str && str.length > num) {
                   return str
                }
                return ''
            },

        },
    };

</script>

<style lang="scss" src="./addAllergy.scss"></style>
 