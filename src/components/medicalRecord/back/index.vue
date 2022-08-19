<template>
    <div class='medicalRecordBack'>
        <div class="medicalRecordOuter">
        <div class="firstTitle">
            <h3>{{ orgName }}</h3>
            <h4>住院病案首页(二)</h4>
            <div class='organizationalCode'>(组织机构代码: 12345678)</div>
        </div>
        <div class="baseInfo">
            <div class="baseInfoUp">
                <div>
                    姓名:
                    <el-input v-model="outHospital.patName" placeholder="--" class="recordNumWidth"></el-input>
                </div>
                <div>
                    第<el-input readonly v-model="outHospital.visitTimes" placeholder="--" class="inHospitalWidth"></el-input>次住院
                </div>
                <div>
                    病案号<el-input v-model="outHospital.visitCode" placeholder="--" class="recordNumWidth"></el-input>
                </div>
            </div>
            <div class="baseInfoUp">
                <div>
                </div>
                <div>
                    识别号(ID)<el-input v-model="outHospital.patCode" placeholder="--" class="IDWidth"></el-input>
                </div>
            </div>
        </div>
        <div class="contentInfo">
            <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableMid contentInfoTableTitle">
                    <div>手术操作编码</div>
                </div>
                <div class="contentInfoTableMidd contentInfoTableTitle">
                    <div class="maxxWidth">手术及操作日期</div>
                </div>
                <div class="contentInfoTableMin contentInfoTableTitle">
                    <div>手术级别</div>
                </div>
                <div class="contentInfoTableMax contentInfoTableTitle">
                    <div>手术及操作名称</div>
                </div>
                <!-- <div class="contentInfoTableMax contentInfoTableMaxLineHeight contentInfoTableTitle">
                    <div>手术及操作医师</div>
                    <div class="contentInfoTableInnerFlex">
                        <div>术者</div>
                        <div>Ⅰ助</div>
                        <div>Ⅱ助理</div>
                    </div>
                </div> -->
                <!-- 下面是删除contentInfoTableMaxLineHeight这个类 -->
                <div class="contentInfoTableMax contentInfoTableTitle">
                    <div>手术及操作医师</div>
                    <div class="contentInfoTableInnerFlex">
                        <div>术者</div>
                        <div>Ⅰ助</div>
                        <div>Ⅱ助理</div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableTitle">
                    <div>切口愈合等级</div>
                </div>
                <div class="contentInfoTableMid contentInfoTableTitle">
                    <div>麻醉方式</div>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableTitle">
                    <div>麻醉医师</div>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <el-input readonly v-model="outHospital.ciFrontOpList[0].operationCode" placeholder="">
                        <!-- :disabled="true" -->
                    </el-input>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontOpList[0].dtOp" clearable type="date" placeholder=""
                        value-format='yyyy-MM-dd HH:mm:ss' class="maxxWidth">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight" style="color: #606266;font-size: 12px;">

                    <!-- <el-select class="disabledSelect" :disabled="selectState"
                        v-model="outHospital.ciFrontOpList[0].sdOperationLevel" placeholder="">
                        <el-option v-for="item in operationList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select> -->
                    <span v-if="outHospital.ciFrontOpList[0].sdOperationLevelName">{{outHospital.ciFrontOpList[0].sdOperationLevelName}}</span>
                    <span v-else>{{operationList[0]}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[0].operationName" placeholder=""></el-input> -->
                    <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[0].operationName"
                        placeholder="" @change="operationChange($event,0)">
                        <el-option v-for="item in findNameAndCodeList" :key="item.operationCode"
                            :label="item.operationName" :value="item.operationCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight contentInfoTableHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div>
                            <el-select v-model="outHospital.ciFrontOpList[0].empOpName" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <el-select v-model="outHospital.ciFrontOpList[0].empAsst1Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <el-select v-model="outHospital.ciFrontOpList[0].empAsst2Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[0].sdIncitpName" placeholder="">
                        <el-option v-for="item in sdIncitpNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                    /
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[0].sdIncihgName" placeholder="">
                        <el-option v-for="item in sdIncihgNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[0].sdNarcosisModeName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[0].sdNarcosisModeName" placeholder="">
                        <el-option v-for="item in narcosisModeOptions" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <el-select v-model="outHospital.ciFrontOpList[0].empAnesName" filterable remote reserve-keyword
                        :remote-method="getDocDicData" @focus="getDocDicData('')" placeholder="">
                        <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                            :key='index'>
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <el-input readonly v-model="outHospital.ciFrontOpList[1].operationCode" placeholder="">
                    </el-input>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontOpList[1].dtOp" clearable type="date" placeholder=""
                        value-format='yyyy-MM-dd HH:mm:ss' class="maxxWidth">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight" style="color: #606266;font-size: 12px;">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[1].sdOperationLevel" placeholder=""></el-input> -->
                    <!-- <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[1].sdOperationLevel"
                        :disabled="true" placeholder="">
                        <el-option v-for="item in operationList" :key="item.operationCode" :label="item.operationName"
                            :value="item.operationCode">
                        </el-option>
                    </el-select> -->
                    <span v-if="outHospital.ciFrontOpList[1].sdOperationLevelName">{{outHospital.ciFrontOpList[1].sdOperationLevelName}}</span>
                    <span v-else>{{operationList[1]}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[1].operationName" placeholder=""></el-input> -->
                    <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[1].operationName"
                        placeholder="" @change="operationChange($event,1)">
                        <el-option v-for="item in findNameAndCodeList" :key="item.operationCode"
                            :label="item.operationName" :value="item.operationCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight contentInfoTableHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[1].empOpName" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[1].empOpName" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[1].empAsst1Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[1].empAsst1Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[1].empAsst2Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[1].empAsst2Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[1].sdIncitpName" placeholder="">
                        <el-option v-for="item in sdIncitpNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                    /
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[1].sdIncihgName" placeholder="">
                        <el-option v-for="item in sdIncihgNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[1].sdNarcosisModeName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[1].sdNarcosisModeName" placeholder="">
                        <el-option v-for="item in narcosisModeOptions" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[1].empAnesName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[1].empAnesName" filterable remote reserve-keyword
                        :remote-method="getDocDicData" @focus="getDocDicData('')" placeholder="">
                        <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                            :key='index'>
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <el-input readonly v-model="outHospital.ciFrontOpList[2].operationCode" placeholder="">
                    </el-input>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontOpList[2].dtOp" clearable type="date" placeholder=""
                        value-format='yyyy-MM-dd HH:mm:ss' class="maxxWidth">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight" style="color: #606266;font-size: 12px;">
                    <!-- <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[2].sdOperationLevel"
                        :disabled="true" placeholder="">
                        <el-option v-for="item in operationList" :key="item.operationCode" :label="item.operationName"
                            :value="item.operationCode">
                        </el-option>
                    </el-select> -->
                    <span v-if='outHospital.ciFrontOpList[2].sdOperationLevelName'>{{outHospital.ciFrontOpList[2].sdOperationLevelName}}</span>
                    <span v-else>{{operationList[2]}}</span>

                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[2].operationName" placeholder=""></el-input> -->
                    <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[2].operationName"
                        placeholder="" @change="operationChange($event,2)">
                        <el-option v-for="item in findNameAndCodeList" :key="item.operationCode"
                            :label="item.operationName" :value="item.operationCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight contentInfoTableHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[2].empOpName" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[2].empOpName" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[2].empAsst1Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[2].empAsst1Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[2].empAsst2Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[2].empAsst2Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[2].sdIncitpName" placeholder="">
                        <el-option v-for="item in sdIncitpNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                    /
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[2].sdIncihgName" placeholder="">
                        <el-option v-for="item in sdIncihgNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[2].sdNarcosisModeName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[2].sdNarcosisModeName" placeholder="">
                        <el-option v-for="item in narcosisModeOptions" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[2].empAnesName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[2].empAnesName" filterable remote reserve-keyword
                        :remote-method="getDocDicData" @focus="getDocDicData('')" placeholder="">
                        <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                            :key='index'>
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <el-input readonly v-model="outHospital.ciFrontOpList[3].operationCode" placeholder="">
                    </el-input>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontOpList[3].dtOp" clearable type="date" placeholder=""
                        value-format='yyyy-MM-dd HH:mm:ss' class="maxxWidth">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight" style="color: #606266;font-size: 12px;">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[3].sdOperationLevel" placeholder=""></el-input> -->
                    <!-- <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[3].sdOperationLevel"
                        :disabled="true" placeholder="">
                        <el-option v-for="item in operationList" :key="item.operationCode" :label="item.operationName"
                            :value="item.operationCode">
                        </el-option>
                    </el-select> -->
                    <span v-if='outHospital.ciFrontOpList[3].sdOperationLevelName'>{{outHospital.ciFrontOpList[3].sdOperationLevelName}}</span>
                    <span v-else>{{operationList[3]}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[3].operationName" placeholder=""></el-input> -->
                    <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[3].operationName"
                        placeholder="" @change="operationChange($event,3)">
                        <el-option v-for="item in findNameAndCodeList" :key="item.operationCode"
                            :label="item.operationName" :value="item.operationCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight contentInfoTableHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[3].empOpName" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[3].empOpName" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[3].empAsst1Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[3].empAsst1Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[3].empAsst2Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[3].empAsst2Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[3].sdIncitpName" placeholder="">
                        <el-option v-for="item in sdIncitpNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                    /
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[3].sdIncihgName" placeholder="">
                        <el-option v-for="item in sdIncihgNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[3].sdNarcosisModeName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[3].sdNarcosisModeName" placeholder="">
                        <el-option v-for="item in narcosisModeOptions" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[3].empAnesName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[3].empAnesName" filterable remote reserve-keyword
                        :remote-method="getDocDicData" @focus="getDocDicData('')" placeholder="">
                        <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                            :key='index'>
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <el-input readonly v-model="outHospital.ciFrontOpList[4].operationCode" placeholder="">
                    </el-input>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontOpList[4].dtOp" clearable type="date" placeholder=""
                        value-format='yyyy-MM-dd HH:mm:ss' class="maxxWidth">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight" style="color: #606266;font-size: 12px;">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[4].sdOperationLevel" placeholder=""></el-input> -->
                    <!-- <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[4].sdOperationLevel"
                        :disabled="true" placeholder="">
                        <el-option v-for="item in operationList" :key="item.operationCode" :label="item.operationName"
                            :value="item.operationCode">
                        </el-option>
                    </el-select> -->
                    <span v-if='outHospital.ciFrontOpList[4].sdOperationLevelName'>{{outHospital.ciFrontOpList[4].sdOperationLevelName}}</span>
                    <span v-else>{{operationList[4]}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[4].operationName" placeholder=""></el-input> -->
                    <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[4].operationName"
                        placeholder="" @change="operationChange($event,4)">
                        <el-option v-for="item in findNameAndCodeList" :key="item.operationCode"
                            :label="item.operationName" :value="item.operationCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight contentInfoTableHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[4].empOpName" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[4].empOpName" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[4].empAsst1Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[4].empAsst1Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[4].empAsst2Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[4].empAsst2Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[4].sdIncitpName" placeholder="">
                        <el-option v-for="item in sdIncitpNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                    /
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[4].sdIncihgName" placeholder="">
                        <el-option v-for="item in sdIncihgNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[4].sdNarcosisModeName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[4].sdNarcosisModeName" placeholder="">
                        <el-option v-for="item in narcosisModeOptions" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[4].empAnesName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[4].empAnesName" filterable remote reserve-keyword
                        :remote-method="getDocDicData" @focus="getDocDicData('')" placeholder="">
                        <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                            :key='index'>
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <el-input readonly v-model="outHospital.ciFrontOpList[5].operationCode" placeholder="">
                    </el-input>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontOpList[5].dtOp" clearable type="date" placeholder=""
                        value-format='yyyy-MM-dd HH:mm:ss' class="maxxWidth">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight" style="color: #606266;font-size: 12px;">
                    <!-- <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[5].sdOperationLevel"
                        :disabled="true" placeholder="">
                        <el-option v-for="item in operationList" :key="item.operationCode" :label="item.operationName"
                            :value="item.operationCode">
                        </el-option>
                    </el-select> -->
                    <span v-if='outHospital.ciFrontOpList[5].sdOperationLevelName'>{{outHospital.ciFrontOpList[5].sdOperationLevelName}}</span>
                    <span v-else>{{operationList[5]}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[5].operationName" placeholder=""></el-input> -->
                    <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[5].operationName"
                        placeholder="" @change="operationChange($event,5)">
                        <el-option v-for="item in findNameAndCodeList" :key="item.operationCode"
                            :label="item.operationName" :value="item.operationCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight contentInfoTableHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[5].empOpName" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[5].empOpName" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[5].empAsst1Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[5].empAsst1Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[5].empAsst2Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[5].empAsst2Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[5].sdIncitpName" placeholder="">
                        <el-option v-for="item in sdIncitpNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                    /
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[5].sdIncihgName" placeholder="">
                        <el-option v-for="item in sdIncihgNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[5].sdNarcosisModeName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[5].sdNarcosisModeName" placeholder="">
                        <el-option v-for="item in narcosisModeOptions" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[5].empAnesName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[5].empAnesName" filterable remote reserve-keyword
                        :remote-method="getDocDicData" @focus="getDocDicData('')" placeholder="">
                        <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                            :key='index'>
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <el-input readonly v-model="outHospital.ciFrontOpList[6].operationCode" placeholder="">
                    </el-input>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontOpList[6].dtOp" clearable type="date" placeholder=""
                        value-format='yyyy-MM-dd HH:mm:ss' class="maxxWidth">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight" style="color: #606266;font-size: 12px;">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[6].sdOperationLevel" placeholder=""></el-input> -->
                    <!-- <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[6].sdOperationLevel"
                        :disabled="true" placeholder="">
                        <el-option v-for="item in operationList" :key="item.operationCode" :label="item.operationName"
                            :value="item.operationCode">
                        </el-option>
                    </el-select> -->
                    <span v-if='outHospital.ciFrontOpList[6].sdOperationLevelName'>{{outHospital.ciFrontOpList[6].sdOperationLevelName}}</span>
                    <span v-else>{{operationList[6]}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[6].operationName" placeholder=""></el-input> -->
                    <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[6].operationName"
                        placeholder="" @change="operationChange($event,6)">
                        <el-option v-for="item in findNameAndCodeList" :key="item.operationCode"
                            :label="item.operationName" :value="item.operationCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight contentInfoTableHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[6].empOpName" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[6].empOpName" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[6].empAsst1Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[6].empAsst1Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div>
                            <!-- <el-input v-model="outHospital.ciFrontOpList[6].empAsst2Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[6].empAsst2Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[6].sdIncitpName" placeholder="">
                        <el-option v-for="item in sdIncitpNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                    /
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[6].sdIncihgName" placeholder="">
                        <el-option v-for="item in sdIncihgNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[6].sdNarcosisModeName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[6].sdNarcosisModeName" placeholder="">
                        <el-option v-for="item in narcosisModeOptions" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[6].empAnesName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[6].empAnesName" filterable remote reserve-keyword
                        :remote-method="getDocDicData" @focus="getDocDicData('')" placeholder="">
                        <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                            :key='index'>
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <el-input readonly v-model="outHospital.ciFrontOpList[7].operationCode" placeholder="">
                    </el-input>
                </div>
                <div class="contentInfoTableMidd contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontOpList[7].dtOp" clearable type="date" placeholder=""
                        value-format='yyyy-MM-dd HH:mm:ss' class="maxxWidth">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMin contentInfoTableHeight" style="color: #606266;font-size: 12px;">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[7].sdOperationLevel" placeholder=""></el-input> -->
                    <!-- <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[7].sdOperationLevel"
                        :disabled="true" placeholder="">
                        <el-option v-for="item in operationList" :key="item.operationCode" :label="item.operationName"
                            :value="item.operationCode">
                        </el-option>
                    </el-select> -->
                    <span v-if='outHospital.ciFrontOpList[6].sdOperationLevelName'>{{outHospital.ciFrontOpList[7].sdOperationLevelName}}</span>
                    <span v-else>{{operationList[7]}}</span>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[7].operationName" placeholder=""></el-input> -->
                    <el-select class="disabledSelect" v-model="outHospital.ciFrontOpList[7].operationName"
                        placeholder="" @change="operationChange($event,7)">
                        <el-option v-for="item in findNameAndCodeList" :key="item.operationCode"
                            :label="item.operationName" :value="item.operationCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableLineHeight contentInfoTableHeight">
                    <div class="contentInfoTableInnerFlex contentInfoTableInnerFlexNoBorderTop">
                        <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                            <!-- <el-input v-model="outHospital.ciFrontOpList[7].empOpName" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[7].empOpName" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                            <!-- <el-input v-model="outHospital.ciFrontOpList[7].empAsst1Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[7].empAsst1Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                        <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                            <!-- <el-input v-model="outHospital.ciFrontOpList[7].empAsst2Name" placeholder=""></el-input> -->
                            <el-select v-model="outHospital.ciFrontOpList[7].empAsst2Name" filterable remote
                                reserve-keyword :remote-method="getDocDicData" @focus="getDocDicData('')"
                                placeholder="">
                                <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                                    :key='index'>
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight" style="text-align: center;">
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[7].sdIncitpName" placeholder="">
                        <el-option v-for="item in sdIncitpNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                    /
                    <el-select class="selectConcat2" v-model="outHospital.ciFrontOpList[7].sdIncihgName" placeholder="">
                        <el-option v-for="item in sdIncihgNameList" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[7].sdNarcosisModeName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[7].sdNarcosisModeName" placeholder="">
                        <el-option v-for="item in narcosisModeOptions" :key="item.dataCode" :label="item.dataName"
                            :value="item.dataCode">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMid noBorder contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontOpList[7].empAnesName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontOpList[7].empAnesName" filterable remote reserve-keyword
                        :remote-method="getDocDicData" @focus="getDocDicData('')" placeholder="">
                        <el-option v-for='(item,index) in docDicLists' :label="item.label" :value="item.value"
                            :key='index'>
                        </el-option>
                    </el-select>
                </div>
            </div>
            <div class="contentInfoTable">
                <div class="contentInfoTableHeight positionSpan">
                    离院方式<el-select v-model="outHospital.sdDischargeWay" placeholder="" class="minnWidth">
                        <el-option v-for='item in outHospitalMethod' :label="item.label" :value="item.value"
                            :key='item.value'>
                        </el-option>
                    </el-select>1.医嘱离院 2.医嘱转院，拟接收医疗机构名称:<el-input v-model="outHospital.nameOrgRec2" placeholder="--"
                        :readonly='outHospital.sdDischargeWay != 2' class="bigWidth"></el-input>
                    <!-- <span v-if='!outHospital.nameOrgRec2'>--</span> -->
                </div>
            </div>
            <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableHeight positionSpan">
                    3.医嘱转社区卫生服务机构/乡镇卫生院，拟接收医疗机构名称:<el-input v-model="outHospital.nameOrgRec3"
                        :readonly='outHospital.sdDischargeWay != 3' placeholder="--" class="bigWidth"></el-input>
                    <!-- <span v-if='!outHospital.nameOrgRec3'>--</span> -->
                </div>
            </div>
            <div class="contentInfoTable noBorderTop">
                <div class="contentInfoTableHeight">
                    4.非医嘱离院 5.死亡 9.其他
                </div>
            </div>
            <div class="contentInfoTable">
                <div class="contentInfoTableHeight">
                    是否有出院31天内再住院计划<el-select v-model="outHospital.fgAgain31" placeholder="" class="minnWidth">
                        <el-option v-for='item in outHospitalInPlanOption' :label="item.label" :value="item.value"
                            :key='item.value'></el-option>
                    </el-select>1.无 2.有
                </div>
                <div class="contentInfoTableHeight positionSpan">
                    目的:<el-input v-model="outHospital.desAgainPps" placeholder="--" class="bigWidth"></el-input>
                </div>
            </div>
            <div class="contentInfoTable">
                <div class="contentInfoTableHeight">
                    颅脑损伤患者昏迷时间:入院前<el-input v-model="outHospital.comaDay1" placeholder="" class="minWidth"></el-input>天
                    <el-input v-model="outHospital.comaHours1" placeholder="" class="minWidth"></el-input>小时<el-input
                        v-model="outHospital.comaMinute1" placeholder="" class="minWidth"></el-input>分钟<el-input
                        v-model="outHospital.comaDay2" placeholder="" class="minWidth"></el-input>天<el-input
                        v-model="outHospital.comaHours2" placeholder="" class="minWidth"></el-input>小时<el-input
                        v-model="outHospital.comaMinute2" placeholder="" class="minWidth"></el-input>分钟
                </div>
            </div>
            <div class="contentInfoTable">
                <div class="contentInfoTableMaxx contentInfoTableHeight">
                    重症监护室名称
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    进入重症监护室时间(_年_月_日_时_分_秒)
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight noBorder">
                    转出重症监护室时间(_年_月_日_时_分_秒)
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMaxx contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontIcuList[0].deptName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontIcuList[0].deptName" filterable remote reserve-keyword
                        placeholder="" :remote-method="remoteMethod" @focus="remoteMethod('')">
                        <el-option v-for="item in department" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontIcuList[0].changeOverTime"
                        value-format='yyyy-MM-dd HH:mm:ss' type="datetime" placeholder="">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight noBorder">
                    <el-date-picker v-model="outHospital.ciFrontIcuList[0].rollOutTime"
                        value-format='yyyy-MM-dd HH:mm:ss' type="datetime" placeholder="">
                    </el-date-picker>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMaxx contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontIcuList[1].deptName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontIcuList[1].deptName" filterable remote reserve-keyword
                        placeholder="" :remote-method="remoteMethod" @focus="remoteMethod('')">
                        <el-option v-for="item in department" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontIcuList[1].changeOverTime"
                        value-format='yyyy-MM-dd HH:mm:ss' type="datetime" placeholder="">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight noBorder">
                    <el-date-picker v-model="outHospital.ciFrontIcuList[1].rollOutTime"
                        value-format='yyyy-MM-dd HH:mm:ss' type="datetime" placeholder="">
                    </el-date-picker>
                </div>
            </div>
            <div class="contentInfoTable contentInfoTableNoOutline">
                <div class="contentInfoTableMaxx contentInfoTableHeight">
                    <!-- <el-input v-model="outHospital.ciFrontIcuList[2].deptName" placeholder=""></el-input> -->
                    <el-select v-model="outHospital.ciFrontIcuList[2].deptName" filterable remote reserve-keyword
                        placeholder="" :remote-method="remoteMethod" @focus="remoteMethod('')">
                        <el-option v-for="item in department" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight">
                    <el-date-picker v-model="outHospital.ciFrontIcuList[2].changeOverTime"
                        value-format='yyyy-MM-dd HH:mm:ss' type="datetime" placeholder="">
                    </el-date-picker>
                </div>
                <div class="contentInfoTableMax contentInfoTableHeight noBorder">
                    <el-date-picker v-model="outHospital.ciFrontIcuList[2].rollOutTime"
                        value-format='yyyy-MM-dd HH:mm:ss' type="datetime" placeholder="">
                    </el-date-picker>
                </div>
            </div>
            <div class="contentInfoTable" style='margin-bottom: 10px;'>
                <div class="contentInfoTableMaxx noBorder">
                    输血:
                    <el-radio v-model="outHospital.bloodTrans" label='1'>无</el-radio>
                    <el-radio v-model="outHospital.bloodTrans" label='2'>有</el-radio>
                </div>
            </div>
            <div class="contentInfoTable noBorderTop" style='margin-bottom: 10px;'>
                <div class="contentInfoTableMaxx noBorder">
                    红细胞:<el-input :readonly='outHospital.bloodTrans==1' v-model="outHospital.redBloodCell"
                        placeholder="--" class="minWidth"></el-input>单位 血小板<el-input
                        :readonly='outHospital.bloodTrans==1' v-model="outHospital.bloodCells" placeholder="--"
                        class="minWidth"></el-input>人份 血浆<el-input :readonly='outHospital.bloodTrans==1'
                        v-model="outHospital.bloodPlasma" placeholder="--" class="minWidth">
                    </el-input>ml 全血:<el-input :readonly='outHospital.bloodTrans==1' v-model="outHospital.wholeBlood"
                        placeholder="--" class="minWidth"></el-input>ml 自体血回输:<el-input
                        :readonly='outHospital.bloodTrans==1' v-model="outHospital.ioatBlood" placeholder="--"
                        class="minWidth"></el-input>ml 其他<el-input :readonly='outHospital.bloodTrans==1'
                        v-model="outHospital.elseBlood" placeholder="--" class="minWidth">
                    </el-input>
                </div>
            </div>
            <div class="contentInfoTable noBorderTop" style='margin-bottom: 10px;'>
                <div class="contentInfoTableMaxx noBorder">
                    呼吸机使用时间:
                    <el-input v-model="outHospital.ventilatorUse" placeholder="--" class="midWidth">
                    </el-input>小时
                </div>
            </div>
            <div class="contentInfoTable noBorderTop" style='margin-bottom: 10px;'>
                <div class="contentInfoTableMaxx noBorder">
                    肿瘤分期:
                    T<el-input v-model="outHospital.tnmT" placeholder="--" class="midWidth">
                    </el-input>N<el-input v-model="outHospital.tnmN" placeholder="--" class="midWidth">
                    </el-input>M<el-input v-model="outHospital.tnmM" placeholder="--" class="midWidth">
                    </el-input>临床分期:<el-input v-model="outHospital.figo" placeholder="--" class="midWidth">
                    </el-input>期
                </div>
            </div>
            <div class="contentInfoTable noBorderTop" style='margin-bottom: 10px;'>
                <div class="contentInfoTableMaxx noBorder">
                    日常生活能力评定量表得分:&emsp;
                    入院<el-input v-model="outHospital.adlpiScoreAdmit" placeholder="--" class="midWidth">
                    </el-input> &emsp; 出院<el-input v-model="outHospital.adlpiScoreDischarge" placeholder="--"
                        class="midWidth">
                    </el-input>
                </div>
            </div>
            <div class="contentInfoTable">
                <div class="contentInfoTableMaxx contentInfoTableHeight noBorder">
                    住院费用(元):&emsp;
                    总费用:
                    <!-- <el-input v-model="outHospital.totalAmount" readonly placeholder="" class="maxWidth">
          </el-input> &emsp;  -->
                    其中自付金额
                    <!-- <el-input v-model="outHospital.selfPaymentAmount" readonly placeholder="" class="maxWidth">
          </el-input> -->
                </div>
            </div>
        </div>
        <div class="detail">
            <p>说明:&emsp;(一) 医疗付费方式&emsp;1.城镇职工基本医疗保险&emsp;2.城镇居民基本医疗保险&emsp;3.新型农村合作医疗</p>
            <p>4.贫苦救助&emsp;5.商业医疗保险&emsp;6.全公费&emsp;7.全自费&emsp;8其他社会保险&emsp;9其他</p>
            <p>(二)&emsp;凡可由医院信息系统提供住院费用清单的，住院病案首页中可不填写"住院费用"</p>
            <p>(三)&emsp;入院病情&emsp;1.有，&emsp;2.临床未确定，&emsp;3.情况不明，&emsp;4.无</p>
            <p>(四)&emsp;出生地、现住址、户口地址；详细填写；籍贯填写到市、县级</p>
            <p>(五)&emsp;疗效&emsp;1.治疗，&emsp;2.好转，&emsp;3.未愈，&emsp;4.死亡，&emsp;5.其他</p>
        </div>
        </div>
    </div>
</template>

<script>
    import bus from '@/components/common/bus.js';
    export default {
        data() {
            return {
                orgName: '博仁医院',
                outHospital: {
                    patName: '', // 患者姓名
                    visitTimes: '', // 第几次住院
                    visitCode: '', // 病案号
                    patCode: '', // 识别号
                    ciFrontOpList: [{
                            dtOp: '',
                            empAnesName: '',
                            empAsst1Name: '',
                            empAsst2Name: '',
                            empOpName: '',
                            idEmpAnes: '',
                            idEmpAsst1: '',
                            idEmpAsst2: '',
                            idEmpOp: '',
                            idFrontOperation: '',
                            idFrontSheet: '',
                            operationCode: '',
                            operationName: '',
                            sdIncihg: '',
                            sdIncihgName: '',
                            sdIncitp: '',
                            sdIncitpName: '',
                            sdNarcosisMode: '',
                            sdNarcosisModeName: '',
                            sdOperationLevel: '',
                            sdOperationLevelName: '',
                            sortNo: 0
                        },
                        {
                            dtOp: '',
                            empAnesName: '',
                            empAsst1Name: '',
                            empAsst2Name: '',
                            empOpName: '',
                            idEmpAnes: '',
                            idEmpAsst1: '',
                            idEmpAsst2: '',
                            idEmpOp: '',
                            idFrontOperation: '',
                            idFrontSheet: '',
                            operationCode: '',
                            operationName: '',
                            sdIncihg: '',
                            sdIncihgName: '',
                            sdIncitp: '',
                            sdIncitpName: '',
                            sdNarcosisMode: '',
                            sdNarcosisModeName: '',
                            sdOperationLevel: '',
                            sdOperationLevelName: '',
                            sortNo: 1
                        },
                        {
                            dtOp: '',
                            empAnesName: '',
                            empAsst1Name: '',
                            empAsst2Name: '',
                            empOpName: '',
                            idEmpAnes: '',
                            idEmpAsst1: '',
                            idEmpAsst2: '',
                            idEmpOp: '',
                            idFrontOperation: '',
                            idFrontSheet: '',
                            operationCode: '',
                            operationName: '',
                            sdIncihg: '',
                            sdIncihgName: '',
                            sdIncitp: '',
                            sdIncitpName: '',
                            sdNarcosisMode: '',
                            sdNarcosisModeName: '',
                            sdOperationLevel: '',
                            sdOperationLevelName: '',
                            sortNo: 2
                        },
                        {
                            dtOp: '',
                            empAnesName: '',
                            empAsst1Name: '',
                            empAsst2Name: '',
                            empOpName: '',
                            idEmpAnes: '',
                            idEmpAsst1: '',
                            idEmpAsst2: '',
                            idEmpOp: '',
                            idFrontOperation: '',
                            idFrontSheet: '',
                            operationCode: '',
                            operationName: '',
                            sdIncihg: '',
                            sdIncihgName: '',
                            sdIncitp: '',
                            sdIncitpName: '',
                            sdNarcosisMode: '',
                            sdNarcosisModeName: '',
                            sdOperationLevel: '',
                            sdOperationLevelName: '',
                            sortNo: 3
                        },
                        {
                            dtOp: '',
                            empAnesName: '',
                            empAsst1Name: '',
                            empAsst2Name: '',
                            empOpName: '',
                            idEmpAnes: '',
                            idEmpAsst1: '',
                            idEmpAsst2: '',
                            idEmpOp: '',
                            idFrontOperation: '',
                            idFrontSheet: '',
                            operationCode: '',
                            operationName: '',
                            sdIncihg: '',
                            sdIncihgName: '',
                            sdIncitp: '',
                            sdIncitpName: '',
                            sdNarcosisMode: '',
                            sdNarcosisModeName: '',
                            sdOperationLevel: '',
                            sdOperationLevelName: '',
                            sortNo: 4
                        },
                        {
                            dtOp: '',
                            empAnesName: '',
                            empAsst1Name: '',
                            empAsst2Name: '',
                            empOpName: '',
                            idEmpAnes: '',
                            idEmpAsst1: '',
                            idEmpAsst2: '',
                            idEmpOp: '',
                            idFrontOperation: '',
                            idFrontSheet: '',
                            operationCode: '',
                            operationName: '',
                            sdIncihg: '',
                            sdIncihgName: '',
                            sdIncitp: '',
                            sdIncitpName: '',
                            sdNarcosisMode: '',
                            sdNarcosisModeName: '',
                            sdOperationLevel: '',
                            sdOperationLevelName: '',
                            sortNo: 5
                        },
                        {
                            dtOp: '',
                            empAnesName: '',
                            empAsst1Name: '',
                            empAsst2Name: '',
                            empOpName: '',
                            idEmpAnes: '',
                            idEmpAsst1: '',
                            idEmpAsst2: '',
                            idEmpOp: '',
                            idFrontOperation: '',
                            idFrontSheet: '',
                            operationCode: '',
                            operationName: '',
                            sdIncihg: '',
                            sdIncihgName: '',
                            sdIncitp: '',
                            sdIncitpName: '',
                            sdNarcosisMode: '',
                            sdNarcosisModeName: '',
                            sdOperationLevel: '',
                            sdOperationLevelName: '',
                            sortNo: 6
                        },
                        {
                            dtOp: '',
                            empAnesName: '',
                            empAsst1Name: '',
                            empAsst2Name: '',
                            empOpName: '',
                            idEmpAnes: '',
                            idEmpAsst1: '',
                            idEmpAsst2: '',
                            idEmpOp: '',
                            idFrontOperation: '',
                            idFrontSheet: '',
                            operationCode: '',
                            operationName: '',
                            sdIncihg: '',
                            sdIncihgName: '',
                            sdIncitp: '',
                            sdIncitpName: '',
                            sdNarcosisMode: '',
                            sdNarcosisModeName: '',
                            sdOperationLevel: '',
                            sdOperationLevelName: '',
                            sortNo: 7
                        }
                    ],
                    sdDischargeWay: '', // 离院方式值
                    nameOrgRec2: '', // 医嘱转院,拟接收机构
                    nameOrgRec3: '', // 医嘱转社区卫生服务机构,拟接收医疗机构名称
                    nameOrgRec: '', // 接收机构最终字段
                    fgAgain31: '', // 是否有出院31天再住院计划
                    desAgainPps: '', // 目的
                    ciFrontIcuList: [{
                            changeOverTime: '',
                            deptCode: '',
                            deptName: '',
                            idDept: '',
                            idFrontIcu: '',
                            idFrontSheet: '',
                            rollOutTime: '',
                            sortNo: 0 // 序号
                        },
                        {
                            changeOverTime: '',
                            deptCode: '',
                            deptName: '',
                            idDept: '',
                            idFrontIcu: '',
                            idFrontSheet: '',
                            rollOutTime: '',
                            sortNo: 1 // 序号
                        },
                        {
                            changeOverTime: '',
                            deptCode: '',
                            deptName: '',
                            idDept: '',
                            idFrontIcu: '',
                            idFrontSheet: '',
                            rollOutTime: '',
                            sortNo: 2 // 序号
                        }
                    ],
                    comaDay1: '', // 入院前昏迷天数
                    comaHours1: '', // 小时数
                    comaMinute1: '', // 分钟数
                    comaDay2: '', // 入院前昏迷天数
                    comaHours2: '', // 小时数
                    comaMinute2: '', // 分钟数
                    // dtCtcPreIp: '', // 入院前昏迷时间
                    // dtCtcLatIp: '', // 入院后昏迷时间
                    // ICUName1: '', // 重症监护室名称
                    // ICUName2: '', // 重症监护室名称
                    // ICUName3: '', // 重症监护室名称
                    // ICUTime1: '', // 进入重症监护室时间
                    // ICUTime2: '', // 进入重症监护室时间
                    // ICUTime3: '', // 进入重症监护室时间
                    // ICUTime4: '', // 进入重症监护室时间
                    // ICUTime5: '', // 进入重症监护室时间
                    // ICUTime6: '', // 进入重症监护室时间
                    bloodTrans: '1', // 是否有输血
                    redBloodCell: '', // 红细胞
                    bloodCells: '', // 血小板
                    bloodPlasma: '', // 血浆
                    wholeBlood: '', // 全血
                    ioatBlood: '', // 自体血回输
                    elseBlood: '', // 其他
                    ventilatorUse: '', // 呼吸机使用时间
                    tnmT: '', // 肿瘤分期
                    tnmN: '', // 肿瘤分期
                    tnmM: '', // 肿瘤分期
                    figo: '', // 临床分期
                    adlpiScoreAdmit: '', // 入院得分
                    adlpiScoreDischarge: '', // 出院得分
                    // totalAmount: '', // 总金额
                    // selfPaymentAmount: '' // 自付金额
                },
                sdIncihgNameList: [], //愈合等级
                sdIncitpNameList: [], //切口等级
                outHospitalMethod: [{
                        label: '1',
                        value: '1'
                    },
                    {
                        label: '2',
                        value: '2'
                    },
                    {
                        label: '3',
                        value: '3'
                    },
                    {
                        label: '4',
                        value: '4'
                    },
                    {
                        label: '5',
                        value: '5'
                    },
                    {
                        label: '9',
                        value: '9'
                    }
                ],
                outHospitalInPlanOption: [{
                        label: '1',
                        value: '1'
                    },
                    {
                        label: '2',
                        value: '2'
                    }
                ],
                department: [],
                docDicLists: [], // 医生列表
                findNameAndCodeList: [], //手术名称列表
                operationList: ['', '', '', '', '', '', '', ''], //手术级别名称列表
                narcosisModeOptions: [], // 麻醉方式
            }
        },
        components: {},
        computed: {
            // dtCtcPreIp: '', // 入院前昏迷时间
            // dtCtcLatIp: '', // 入院后昏迷时间
            // dtCtcPreIp() {
            //   return this.outHospital.comaDay1 + '-' + this.outHospital.comaHours1 + '-' + this.outHospital.comaMinute1
            // },
            // dtCtcLatIp() {
            //   return this.outHospital.comaDay2 + '-' + this.outHospital.comaHours2 + '-' + this.outHospital.comaMinute2
            // }
        },
        watch: {
            'outHospital.bloodTrans': {
                handler: function (val, oldVal) {
                    // console.log(val)
                    if (val == '1') {
                        this.outHospital.redBloodCell = ''
                        this.outHospital.bloodCells = ''
                        this.outHospital.bloodPlasma = ''
                        this.outHospital.wholeBlood = ''
                        this.outHospital.ioatBlood = ''
                        this.outHospital.elseBlood = ''
                    }
                }
            },
            'outHospital.sdDischargeWay': {
                handler: function (val) {
                    if (val == '2') {
                        this.outHospital.nameOrgRec3 = ''
                    } else if (val == '3') {
                        this.outHospital.nameOrgRec2 = ''
                    } else {
                        this.outHospital.nameOrgRec2 = ''
                        this.outHospital.nameOrgRec3 = ''
                    }
                }
            }
        },
        created() {
            let vm = this
            vm.$root.Bus.$off('visitTimes')
            vm.$root.Bus.$on('visitTimes', data => {
                vm.outHospital.visitTimes = data
            })
            vm.getDocDicData()
            vm.initDicInfo()
            vm.remoteMethod('');
            this.findNameAndCode(); //查手术名称列表
            // this.operationListHandle(); //手术等级列表
            bus.$off('submitEvent')
            bus.$on('submitEvent', (msg) => {
                // console.log(msg)
                if (vm.outHospital.sdDischargeWay == '2') {
                    vm.outHospital.nameOrgRec = vm.outHospital.nameOrgRec2
                } else if (vm.outHospital.sdDischargeWay == '3') {
                    vm.outHospital.nameOrgRec = vm.outHospital.nameOrgRec3
                } else {
                    vm.outHospital.nameOrgRec = ''
                }
                delete vm.outHospital.nameOrgRec2
                delete vm.outHospital.nameOrgRec3
                bus.$emit('submitBack', vm.outHospital)
            })
            bus.$off('allData')
            bus.$on('allData', msg => {
                console.log(msg)
                vm.outHospital = msg
                if (msg.dtCtcPreIp) {
                    vm.outHospital.comaDay1 = msg.dtCtcPreIp.split('-')[0]
                    vm.outHospital.comaHours1 = msg.dtCtcPreIp.split('-')[1]
                    vm.outHospital.comaMinute1 = msg.dtCtcPreIp.split('-')[2]
                }
                if (msg.dtCtcLatIp) {
                    vm.outHospital.comaDay2 = msg.dtCtcLatIp.split('-')[0]
                    vm.outHospital.comaHours2 = msg.dtCtcLatIp.split('-')[1]
                    vm.outHospital.comaMinute2 = msg.dtCtcLatIp.split('-')[2]
                }
                if (msg.sdDischargeWay == '2') {
                    vm.outHospital.nameOrgRec2 = msg.nameOrgRec
                }
                if (msg.sdDischargeWay == '3') {
                    vm.outHospital.nameOrgRec3 = msg.nameOrgRec
                }
                vm.outHospital.bloodTrans = vm.outHospital.bloodTrans + ''
            })
            bus.$off('patInfo')
            bus.$on('patInfo', msg => {
                vm.outHospital.patName = msg.pat.patName
                vm.outHospital.patCode = msg.pat.patCode
                vm.outHospital.visitCode = msg.visit.visitCode
            })
        },
        mounted() {},
        methods: {
            //查询手术字典编码
            async findNameAndCode() {
                let ajaxUrl = "dict/ciOperationDict/findNameAndCode";
                let resData = await this.$axios.post(ajaxUrl, {});
                if (resData.success) {
                    this.findNameAndCodeList = resData.data;
                } else {
                    this.$message({
                        type: 'error',
                        message: resData.message
                    })
                }
            },
            //切换手术操作
            async operationChange(e, index) {
                console.log('下标:', index);
                // this.findNameAndCodeList.map((item) => {
                //     if (item.operationCode == e) {
                //         // this.formData.operationCode = item.operationCode;
                //         // this.formData.stdCodeSystem = item.stdCodeSystem;
                //         this.outHospital.ciFrontOpList[index].operationCode = item.operationCode
                //         // this.outHospital.ciFrontOpList[index].sdOperationLevel=
                //     }
                // })
                let ajaxUrl = 'dict/ciOperationDict/findOperationCode';
                let params = {
                    operationCode: e
                };
                let resData = await this.$axios.post(ajaxUrl, params);
                if (resData.success) {
                    console.log('详情信息：', resData.data);
                    let ObjStr = this.copyObject(this.outHospital.ciFrontOpList[index]);
                    ObjStr.operationCode = resData.data.operationCode;
                    ObjStr.sdOperationLevel = resData.data.sdOperationLevel;
                    ObjStr.sdOperationLevelName = resData.data.sdOperationLevelName;
                    this.$set(this.outHospital.ciFrontOpList, index, ObjStr)
                    this.$set(this.operationList, index, resData.data.sdOperationLevelName)
                    // this.selectState = false;
                    // this.$nextTick(() => {
                    //     this.$set(this.outHospital.ciFrontOpList, index, ObjStr);
                    //     this.selectState = true;
                    // })
                    // this.outHospital.ciFrontOpList[index].operationCode = resData.data.OPERATION_CODE;
                    // this.outHospital.ciFrontOpList[index].sdOperationLevel = resData.data.SD_OPERATION_LEVEL;
                    // console.log('赋值后1：', this.outHospital.ciFrontOpList[index].operationCode);
                    // console.log('赋值后2：', this.outHospital.ciFrontOpList[index].sdOperationLevel)
                    // 
                } else {
                    this.$message({
                        type: 'error',
                        message: resData.message
                    })
                }


                // console.log('接收:', this.outHospital.ciFrontOpList[index].operationCode)
            },
            //手术等级列表
            // async operationListHandle() {
            //     // this.operationList = this.findNameAndCodeList; //测试数据
            //     let SD_OPERATION_LEVEL = 'SD_OPERATION_LEVEL';
            //     let resData = await this.findSdData(SD_OPERATION_LEVEL);
            //     this.operationList = resData.SD_OPERATION_LEVEL;
            // },
            remoteMethod(query = '') { // 科室的远程搜索
                this.selectDepartment(this.getUserStorage().idOrg, '', 'INS', '', query).then(data => {
                    this.department = data
                })
            },
            getDocDicData(name = '') {
                let vm = this
                vm.$axios
                    .get('/org/emp/listAssignEmpInfo', {
                        idOrg: this.getUserStorage().idOrg,
                        deptType: 'clinical',
                        empType: 'doctor',
                        selCondition: name
                    })
                    .then(res => {
                        if (res.success) {
                            vm.docDicLists = res.data
                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            })
                        }
                    })
            },
            async initDicInfo() { // 通用字典
                let vm = this
                let str = 'SD_NARCOSIS_MODE'; // 麻醉方式, 隔离标志
                let SD_INCIHG = 'SD_INCIHG'; //愈合情况
                let SD_INCITP = 'SD_INCITP'; //切口等级
                vm.findSdData(str).then(data => {
                    vm.narcosisModeOptions = data.SD_NARCOSIS_MODE
                })
                // sdIncihgNameList: [], //愈合等级
                //     sdIncitpNameList: [], //切口等级

                let resData1 = await this.findSdData(SD_INCIHG);
                let resData2 = await this.findSdData(SD_INCITP);
                this.sdIncihgNameList = resData1.SD_INCIHG;
                this.sdIncitpNameList = resData2.SD_INCITP;


            }
        }
    }

</script>
<style lang='scss' src='./index.scss'>
</style>
