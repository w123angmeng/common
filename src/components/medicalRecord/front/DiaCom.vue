<template>
    <div class="diagnosisRow">
        <div class="contentInfoTableMax contentInfoTableHeight">
            <span v-if="curIndex==0">主要诊断</span>
            <span v-if="curIndex==1 || curIndex==11">其他诊断</span>
           <!-- 主要诊断 -->
           <el-select 
                v-model="diagnosisItem.desDiagnosis" 
                filterable
                remote
                reserve-keyword
                :remote-method="getDiaDicData"
                @focus="getDiaDicData('')"
                placeholder=""
                @change="changeDiaRow" 
                class="maxWidth">
                <el-option v-for='(item,index) in diaDicLists' :label="item.diagnosisName" :value="item.diagnosisName" :key='index'></el-option>
            </el-select>
        </div>
        <div class="contentInfoTableMid contentInfoTableHeight">
             <!-- 主要诊断疾病编码 -->
            <el-input v-model="diagnosisItem.cdDiagnosis" placeholder="" class="midWidth"></el-input>
        </div>
        <div class="contentInfoTableMin contentInfoTableHeight">
            <!-- 主要诊断入院病情 -->
            <el-select v-model="diagnosisItem.sdDislvlInp" placeholder='' class="minWidth">
                <el-option v-for="item in onAdmissionOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
        </div>
        <div class="contentInfoTableMin contentInfoTableHeight" :class="[curIndex > 10? 'noBorder' : '']">
             <!-- 主要诊断疗效 -->
            <el-select v-model="diagnosisItem.effect" placeholder='' class="minWidth">
                <el-option v-for="item in curativeEffectOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
        </div>
    </div>
</template>

<script>
    export default {
        props:['diagnosisRow', 'curIndex', 'diaDicLists'],
        data() {
            return {
                onAdmissionOptions: [{
                        value: 1,
                        label: '1'
                    },
                    {
                        value: 2,
                        label: '2'
                    },
                    {
                        value: 3,
                        label: '3'
                    },
                    {
                        value: 4,
                        label: '4'
                    }
                ], //入院病情
                curativeEffectOptions: [{
                        value: 1,
                        label: '1'
                    },
                    {
                        value: 2,
                        label: '2'
                    },
                    {
                        value: 3,
                        label: '3'
                    },
                    {
                        value: 4,
                        label: '4'
                    },
                    {
                        value: 5,
                        label: '5'
                }], //出院诊断疗效列表
                allDiagnosisComs: {},  //全部的出院诊断组件
                diagnosisItem:{}, //出院诊断单个组件
                
            };
        },
        created() {
            // console.log(99,this.diagnosisRow);
            this.$root.Bus.$on('idFrontSheet', data => {
                if (data) {
                    var _this = this;
                    _this.$root.Bus.$on('aaaa', data => {
                        _this.allDiagnosisComs = data;
                        // console.log("编辑诊断", _this.curIndex)
                        _this.diagnosisItem = _this.allDiagnosisComs[_this.curIndex];
                    })
                } else {
                    this.allDiagnosisComs = this.diagnosisRow; //接父组件值赋给本地变量 --全部的出院诊断组件
                    this.diagnosisItem = this.diagnosisRow[this.curIndex];  //接父组件值赋给本地变量--单组件
                    // console.log("新增诊断", this.curIndex)
                }
            })
        },
        mounted() {
           
        },
        components: {
            

        },
        computed: {},
        methods: {
             //获取诊断字典下拉列表
             getDiaDicData(name = '') {
                 this.querySearchDiaByName(name).then( data => {
                      this.diaDicLists = data; //诊断列表
                 })
            },

            //选中每个诊断
            changeDiaRow(e) {
                this.diaDicLists.map( v => {
                    if(e == v.diagnosisName) {
                        this.diagnosisItem.cdDiagnosis = v.diagnosisStdCode;
                    }
                })
            },

        },
        watch: {
            allDiagnosisComs: {
                handler(newName, oldName) {
                    // console.log(newName);
                    this.$emit('leaveHospDia', newName);
                },
                deep: true
            }
        }
    };

</script>

<style lang="scss" src='./index.scss'>

</style>
