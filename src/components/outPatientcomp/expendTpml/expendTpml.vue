<template>
    <div class="expendTpml" ref="ExpendTpml">
        <el-dialog 
            :visible.sync="expendForm.dialogVisible" 
            width="624px"
            title="项目明细" 
            custom-class="expendDialog" 
            :show-close='false' 
            :close-on-click-modal="false" 
            :close-on-press-escape="false"
            append-to-body>
            <div class="expendtableList">
                <el-table class="" :data="tableData" stripe  style="width: 100%;"
                    :header-cell-style="tableTitleStyle" :cell-style="cellStyle">
                    <el-table-column prop="priceItemName" label="项目名称" align="left" width="">
                    </el-table-column>
                    <el-table-column prop="amount" label="数量" align="center" width="55">
                    </el-table-column>
                    <el-table-column prop="sdUnitStr" label="单位" align="left"width="75">
                    </el-table-column>
                    <el-table-column prop="totalCosts" label="金额" align="left" width="90">
                        <template slot-scope="scope">
                            {{scope.row.priceStd ? floatNumber(scope.row.amount, scope.row.priceStd, 'mul') : ""}}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="65">
                        <template slot-scope="scope">
                            <el-button type="text" :disabled="scope.row.appendIndicator==1 ? false : true" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="addExpend">
                <div class="addexpendtitle">添加收费项目</div>
                <el-form :model="expendForm" class="expendForm" ref="expendForm">
                    <div v-for="(itm, idx) in expendForm.expendList">
                        <div class="formList">
                            <el-form-item class="expendName" :prop="'expendList.' + idx + '.priceItemName'">
                                <el-select 
                                    v-model="itm.priceItemName" 
                                    clearable
                                    class="itemName" 
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="项目名称"
                                    :remote-method="remoteItemsMethod"
                                    @focus="remoteItemsMethod(itm.priceItemName)"
                                    @change="changeChargeItem(itm, idx)"
                                    :loading="loading">
                                    <el-option 
                                        v-for="item in chargeItemList" 
                                        :key="item.priceItemCode" 
                                        :label="item.priceItemName"
                                        :value="item.priceItemName">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item :prop="'expendList.' + idx + '.amount'">
                                <el-input 
                                    class="expendNum" 
                                    v-model="itm.amount" 
                                    placeholder="数量"
                                    @change="changeAmount(itm, idx)">
                                </el-input>
                                <span v-if="expendForm.expendList.length == 1">
                                    <i class="el-icon-plus" @click="addExpend"></i>
                                </span>
                                <span v-else>
                                    <span v-if="idx == expendForm.expendList.length-1">
                                        <i class="el-icon-plus" @click="addExpend"></i>
                                        <i class="el-icon-delete"  @click="deleteExpend(itm, idx)"></i>
                                    </span>
                                    <span v-else>
                                        <i class="el-icon-delete"  @click="deleteExpend(itm, idx)"></i>
                                    </span>
                                </span>
                            </el-form-item>
                        </div> 
                    </div>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <div class="groupBtn">
                    <el-button @click="closeDialog">取 消</el-button>
                    <el-button :loading="saveLoading" type="primary" @click="submitExpend('expendForm')">确 定</el-button>
                </div>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        props: ['expendForm'],
        data(){
            let checkName = (rules, value, callback) => {
                if (value == "") {
                    return callback(new Error("项目不能为空！"));
                } else {
                    callback();
                }    
            };
            let checkNum = (rules, value, callback) => {
                if (value == "") {
                    return callback(new Error("数量不能为空！"));
                } else {
                    if(!/^\+?[1-9][0-9]*$/.test(value)) {
                        callback(new Error("填写正确的数字！"));
                    }
                    callback();
                } 
                callback();   
            };
            return {
                loading: false,     //加载状态
                saveLoading: false, //保存状态
                chargeItemList: [], //费用列表
                tableData: [],      //表格数据

                chargeList: [],     //缓存数据

                //表格样式
                tableTitleStyle: {
                    fontSize: "14px",
                    color: "#000",
                    padding: "0 10px",
                    height:" 35px",
                    padding: "0px",
                    background: "#f5f5f5"
                },
                cellStyle: {
                    fontSize: "14px",
                    color: "#333",
                    height: "35px",
                    padding: "0px"
                }, // 表格样式

                rules: {
                    priceItemName: [{ validator: checkName, trigger: "change"}], 
                    amount: [{ validator: checkNum, trigger: "blur"}], 
                } //校验规则
            }
        },
        created() {},
        mounted() {},
        methods: {

            //获取收费列表数据
            getChargeList() {
                this.$axios.get("/outpdr/CiOrdersPriceItem/listCiOrdersPriceItem", {
                    idOrders: this.expendForm.idOrders,
                    idForm: this.expendForm.idForm
                }).then(res => {
                    if (res.success) {
                        this.tableData = res.data;
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },
            
            //项目远程搜索
            remoteItemsMethod(query = ''){
                this.chargeItemList = [];
                this.$axios.post("/dict/price/findPriceList", {
                        pageIndex: 1,
                        pageSize: 20,
                        selCodition: query,
                        priceFlag: '2',  //1-查询所有 2-查询当前生效
                    }).then(res => {
                        if (res.success) {
                            this.chargeItemList = res.data.records;
                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            });
                        }
                    });
            },

            //切换项目名称
            changeChargeItem(item, index) {
                this.chargeItemList.find( m => {
                    if(m.priceItemName == item.priceItemName) {
                        let RowIndex =  this.expendForm.expendList[index];
                        RowIndex.sdUnit = m.sdUnit;              //单位
                        RowIndex.sdUnitStr = m.sdUnitStr;        //单位名称
                        RowIndex.priceStd = m.priceStd;          //价格
                        RowIndex.sdPriceItem = m.sdPriceItem;    //价表项目类型
                        RowIndex.priceItemName = m.priceItemName;//项目名称
                        RowIndex.priceItemCode = m.priceItemCode;//项目编码
                        //总价计算
                        this.changeAmount(item, index);
                    }
                })
            },

            //切换 数量
            changeAmount(item, index) {
                //总价计算
                if(/^\+?[1-9][0-9]*$/.test(item.amount)) {
                    this.expendForm.expendList[index].totalCosts = this.floatNumber(item.amount, item.priceStd, 'mul');
                }
            },
            
            //删除费用信息
            handleDelete(index, row){
                this.$confirm('是否删除这条项目', '提示', {
                    confirmButtonText: '否',
                    cancelButtonText: '是',
                    distinguishCancelAndClose: true, //区分取消按钮和关闭按钮
                    type: 'warning'
                }).then(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                }).catch((action) => {
                    if(action == 'close') return
                    this.deleteCharge(index, row);
                });
            },

            //删除医嘱相关费用项目
            deleteCharge(index, row) {
                this.$axios.get("/outpdr/CiOrdersPriceItem/deleteCiOrdersPriceItem", {
                    idOrdersPriceItem: row.idOrdersPriceItem
                }).then(res => {
                    if (res.success) {
                        this.$message({
                            message: '删除成功',
                            type: "success"
                        });
                        this.getChargeList();
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },

            // 添加费用
            addExpend(){
                let expendItemsObj =  this.expendItem();
                this.expendForm.expendList.push({
                    ...expendItemsObj
                })
            },

            //删除费用
            deleteExpend(itm, idx){
                this.expendForm.expendList.splice(idx, 1);
            },

            expendItem() {
                let Obj = {
                    amount: '',           //数量
                    idForm: '',           //表单id
                    idOrders: '',         //医嘱id 
                    priceItemCode: '',    //价表项目编码
                    priceItemName: '',    //价表项目名称
                    priceStd: 0,          //标准价格
                    sdPriceItem: '',      //价表项目类型
                    sdUnit: '',           //计价单位
                    sdVisitType: '01',    //就诊类型
                    totalCosts: 0,        //累计费用
                    idPat: this.$route.query.idPat,     //患者id
                    idVisit: this.$route.query.idVisit, //就诊id
                }
                return Obj
            },

            //暂存费用列表
            submitExpend(formName){
                let status = false;
                this.chargeList = [];
                let Obj = JSON.parse(JSON.stringify(this.expendForm.expendList)); //备份收费项目
                Obj.find( v => {
                    if(v.priceItemName && v.amount) this.chargeList.push(v);
                    if(v.priceItemName && !v.amount || !v.priceItemName && v.amount) {
                        this.$message.warning('请检查项目名称和数量是否填写完整！');
                        return status = true;
                    } 
                    if(v.amount && !/^\+?[1-9][0-9]*$/.test(v.amount)) {
                        this.$message.warning('填写正确的数字！');
                        return status = true;
                    }
                })

                if(!status) this.closeDialog();
                // let Obj = JSON.parse(JSON.stringify(this.expendForm.expendList)); //备份收费项目
                // this.$refs[formName].validate(valid => {
                //     if (valid) {
                //         this.chargeList = Obj;
                //         this.expendForm.dialogVisible = false;
                //     } else {
                //         console.log("error submit!!");
                //         return false;
                //     }
                // });
            },

            // 重置
            resetForm(formName) {
                this.$refs[formName].resetFields()
            },

            //点击取消按钮 -- 关闭弹窗
            closeDialog(){
                this.resetForm('expendForm');
                this.expendForm.dialogVisible = false;
                let Arr = JSON.parse(JSON.stringify(this.chargeList)); //备份缓存数据
                if(!this.chargeList.length) {
                    let expendItemsObj = this.expendItem();
                    this.expendForm.expendList = [expendItemsObj]; //初始数据展示
                } else {
                    this.expendForm.expendList = Arr;              //缓存数据
                }
            },
        },
    }
</script>
<style lang="scss" src="./expendTpml.scss">
    
</style>
        