<template>
    <div class='medicalRecordFront'>
        <div class="printBtn">
            <el-button type="primary">打印</el-button>
            <el-button type="primary" @click='handleSubmit'>保存</el-button>
        </div>
        <div class="medicalRecordOuter" id="outPrint">
            <div class="firstTitle">
                <h3>{{ orgName }}</h3>
                <h4>住院病案首页</h4>
                <div class='organizationalCode'>(组织机构代码: 12345678)</div>
            </div>
            <div class="baseInfo">
                <div class="baseInfoUp">
                    <div>
                        医疗付费方式:<el-select v-model="contentInfoTop.chargeTypeCode" placeholder='' class="minnWidth">
                            <el-option v-for="item in payMethodOptions" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                    <div>
                        第<el-input v-model="contentInfoTop.visitTimes" placeholder="--" class="inHospitalWidth"
                            @blur='emitVisitTimes'>
                        </el-input>
                        次住院
                    </div>
                    <div>
                        病案号<el-input v-model="contentInfoTop.visitCode" placeholder="--" class="recordNumWidth">
                        </el-input>
                    </div>
                </div>
                <div class="baseInfoUp">
                    <div>
                        健康卡号<el-input v-model="contentInfoTop.healthCardNo" placeholder="--" class="cardNumWidth">
                        </el-input>
                    </div>
                    <div>
                        识别号(ID)<el-input v-model="contentInfoTop.patCode" placeholder="--" class="IDWidth"></el-input>
                    </div>
                </div>
            </div>
            <div class="contentInfo">
                <div class="contentInfoTop">
                    <div>
                        姓名<el-input v-model="contentInfoTop.patName" placeholder="--" class="nameWidth"
                            readonly="readonly">
                        </el-input>
                    </div>
                    <div>
                        性别
                        <!-- <el-input v-model="contentInfoTop.sdSex" placeholder="" class="nameWidth" readonly="readonly"></el-input>1.男2.女 -->
                        <el-select v-model="contentInfoTop.sdSex" placeholder="" minnWidthreadonly="readonly"
                            class="minnWidth">
                            <el-option v-for="item in sexLists" :key="item.dataCode" :label="item.index"
                                :value="item.dataCode">
                                <span style="float: left; font-size: 13px" >{{ item.index }} .</span>
                            <span style=" float: left; font-size: 13px">{{ item.dataName }}</span>
                            </el-option>
                        </el-select>1.男2.女
                    </div>
                    <div>
                        出生日期<el-date-picker v-model="contentInfoTop.dtBirth" clearable type="date" placeholder="--"
                            format='yyyy年MM月dd日' value-format='yyyy-MM-dd HH:mm:ss' @change="handleChangeDate"
                            class="birthDateWidth" readonly="readonly">
                        </el-date-picker>
                    </div>
                    <div>
                        年龄<el-input v-model="contentInfoTop.ageYear" placeholder="--" class="nameWidth"
                            readonly="readonly">
                        </el-input>
                    </div>
                    <div class="noThreeBorder">
                        国籍
                        <el-select v-model="contentInfoTop.sdCounty" placeholder="--" class="birthPlaceWidth"
                            :disabled="true">
                            <el-option v-for="item in countryLists" :key="item.idArea" :label="item.areaName"
                                :value="item.idArea">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        (年龄不足一周岁)年龄<el-input v-model="contentInfoTop.ageDay" placeholder="--" class="newChildWidth"
                            readonly="readonly"></el-input>月
                    </div>
                    <div>
                        新生儿出生体重<el-input v-model="contentInfoTop.weightNbBirth" placeholder="--" class="newChildWidth">
                        </el-input>克
                    </div>
                    <div>
                        新生儿入院体重<el-input v-model="contentInfoTop.weightNbAdmit" placeholder="--" class="newChildWidth">
                        </el-input>克
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        出生地<el-input v-model="contentInfoTop.birthPlace" placeholder="--" class="householdPlaceWidth"
                            readonly="readonly"  @focus="showModal('出生地')"></el-input>
                    </div>
                    <div>
                        籍贯<el-input v-model="contentInfoTop.nativePlace" placeholder="--" class="householdPlaceWidth"
                            readonly="readonly" @focus="showModal('籍贯')"></el-input>
                    </div>
                    <div class="noThreeBorder">
                        民族
                        <!-- <el-input v-model="contentInfoTop.nationName" placeholder="--" class="nameWidth">
                    </el-input> -->
                        <el-select v-model="contentInfoTop.nationName" placeholder="--" class="birthPlaceWidth"
                            :disabled="true">
                            <el-option v-for="item in nationLists" :key="item.dataCode" :label="item.dataName"
                                :value="item.dataCode">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        身份证号<el-input v-model="contentInfoTop.idNo" placeholder="--" class="birthPlaceWidth"></el-input>
                    </div>
                    <div class="noThreeBorder">
                        职业
                        <!-- <el-input v-model="contentInfoTop.occupationName" placeholder="--" class="birthPlaceWidth"></el-input> -->
                        <el-select v-model="contentInfoTop.occupationName" placeholder="--" class="birthPlaceWidth">
                            <el-option v-for="item in careerLists" :key="item.dataCode" :label="item.dataName"
                                :value="item.dataCode">
                            </el-option>
                        </el-select>
                    </div>
                    <div>
                        婚姻<el-select v-model="contentInfoTop.sdMarry" placeholder="" class="minnWidth">
                            <el-option v-for=' item in marryLists' :label="item.index" :value="item.dataCode"
                                :key='item.dataCode'>
                                <span style="float: left; font-size: 13px" >{{ item.index }} .</span>
                            <span style=" float: left; font-size: 13px">{{ item.dataName }}</span>
                            </el-option>
                        </el-select>1.未婚2.已婚3.丧偶4.离婚9.其他
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        现住址<el-input v-model="contentInfoTop.currentPlace" placeholder="--" class="householdPlaceWidth" @focus="showModal('现住址')">
                        </el-input>
                    </div>
                    <div>
                        电话<el-input v-model="contentInfoTop.currentTel" placeholder="--" class="birthDateWidth">
                        </el-input>
                    </div>
                    <div>
                        邮编<el-input v-model="contentInfoTop.currentZip" placeholder="--" class="nameWidth">
                        </el-input>
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        户口地址<el-input v-model="contentInfoTop.registPlace" placeholder="--" class="householdPlaceWidth" @focus="showModal('户口地址')">
                        </el-input>
                    </div>
                    <div>
                        邮编<el-input v-model="contentInfoTop.registZip" placeholder="--" class="nameWidth">
                        </el-input>
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        工作单位及地址<el-input v-model="contentInfoTop.workPlace" placeholder="--"
                            class="householdPlaceWidth" @focus="showModal('工作单位地址')">
                        </el-input>
                    </div>
                    <div>
                        电话<el-input v-model="contentInfoTop.workTel" placeholder="--" class="birthDateWidth"></el-input>
                    </div>
                    <div>
                        邮编<el-input v-model="contentInfoTop.workZip" placeholder="--" class="nameWidth">
                        </el-input>
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        联系人姓名<el-input v-model="contentInfoTop.contactName" placeholder="--" class="nameWidth">
                        </el-input>
                    </div>
                    <div>
                        关系
                        <!-- <el-input v-model="contentInfoTop.contactTypeName" placeholder="" class="birthPlaceWidth"></el-input> -->
                        <el-select v-model="contentInfoTop.contactTypeName" placeholder="" class="minnWidth">
                            <el-option v-for="item in generationals" :key="item.dataCode" :label="item.index"
                                :value="item.dataCode">
                                <span style="float: left; font-size: 13px" >{{ item.index }} .</span>
                            <span style=" float: left; font-size: 13px">{{ item.dataName }}</span>
                            </el-option>
                        </el-select>
                    </div>
                    <div>
                        地址<el-input v-model="contentInfoTop.contactAddress" placeholder="--"
                            class="householdPlaceWidth" @focus="showModal('联系人地址')">
                        </el-input>
                    </div>
                    <div>
                        电话<el-input v-model="contentInfoTop.contactTel" placeholder="--" class="birthPlaceWidth">
                        </el-input>
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        入院途径<el-select v-model="contentInfoTop.sdAdmitWay" placeholder="" class="minnWidth">
                            <el-option v-for='item in hospitalWayList' :value="item.dataCode" :key='item.dataCode'>
                                {{item.dataCode}}.{{item.dataName}}
                            </el-option>
                        </el-select>
                        <span v-for="(item, index) in hospitalWayList" :key='index'>
                            &emsp;{{item.dataCode}}. {{item.dataName}}
                        </span>
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        入院日期<el-date-picker readonly="readonly" type="datetime" v-model="contentInfoTop.dtEntry"
                            placeholder="--" format='yyyy年MM月dd日 HH时' value-format='yyyy-MM-dd HH:mm:ss'
                            class="inHospitalDateWidth">
                        </el-date-picker>
                    </div>
                    <div>
                        入院科别<el-input v-model="contentInfoTop.deptAdmitName" placeholder="--" class="birthPlaceWidth">
                        </el-input>
                    </div>
                    <div>
                        病床<el-input v-model="contentInfoTop.stickBedCodeAdmit" placeholder="--" class="birthPlaceWidth">
                        </el-input>
                    </div>
                    <div>
                        转科科别<el-input v-model="contentInfoTop.strDept" placeholder="--" class="birthPlaceWidth">
                        </el-input>
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div>
                        出院日期<el-date-picker readonly="readonly" type="datetime" v-model="contentInfoTop.dtEnd"
                            placeholder="--" format='yyyy年MM月dd日 HH时' value-format='yyyy-MM-dd HH:mm:ss'
                            class="inHospitalDateWidth">
                        </el-date-picker>
                    </div>
                    <div>
                        出院科别<el-input v-model="contentInfoTop.deptDischargeName" placeholder="--"
                            class="birthPlaceWidth">
                        </el-input>
                    </div>
                    <div>
                        病床<el-input v-model="contentInfoTop.stickBedCodeDischarge" placeholder="--"
                            class="birthPlaceWidth">
                        </el-input>
                    </div>
                    <div>
                        实际住院<el-input v-model="contentInfoTop.actualAdmitDay" placeholder="--" class="birthPlaceWidth">
                        </el-input>天
                    </div>
                </div>
                <div class="contentInfoTop">
                    <div class="noThreeBorder">
                        门(急)诊诊断
                        <el-select v-model="contentInfoTop.nameDiOut" placeholder='--' class="birthPlaceWidth"
                            @change='changeNameDiOut'>
                            <el-option v-for="item in diagnosisOptions" :key="item.diagnosisCode"
                                :label="item.diagnosisName" :value="item.diagnosisCode">
                            </el-option>
                        </el-select>
                    </div>
                    <div>
                        疾病编码<el-input v-model="contentInfoTop.cdDiOut" placeholder="--" class="nameWidth" readonly>
                        </el-input>
                    </div>
                    <div>
                        确诊日期<el-date-picker v-model="contentInfoTop.dateDiOut" type="date" placeholder="--"
                            format='yyyy年MM月dd日' value-format='yyyy-MM-dd HH:mm:ss'
                            :picker-options="dialogPickerOptions" class="birthDateWidth">
                        </el-date-picker>
                    </div>
                </div>
                <div class="contentInfoTable">
                    <div class="contentInfoTableMax contentInfoTableTitle">
                        <div>出院诊断</div>
                    </div>
                    <div class="contentInfoTableMid contentInfoTableTitle">
                        <p>疾病编码</p>
                        <p>M码</p>
                    </div>
                    <div class="contentInfoTableMin contentInfoTableTitle">
                        <div>入院病情</div>
                    </div>
                    <div class="contentInfoTableMin contentInfoTableTitle">
                        <div>疗效</div>
                    </div>
                    <div class="contentInfoTableMax contentInfoTableTitle">
                        <div>出院诊断</div>
                    </div>
                    <div class="contentInfoTableMid contentInfoTableTitle">
                        <p>疾病编码</p>
                        <p>M码</p>
                    </div>
                    <div class="contentInfoTableMin contentInfoTableTitle">
                        <div>入院病情</div>
                    </div>
                    <div class="contentInfoTableMin noBorder contentInfoTableTitle">
                        <div>疗效</div>
                    </div>
                </div>

                <LeaveHospDia :diagnosisRow="contentInfoTop.diagnosisList" :diaDicLists="diaDicLists" ref="LeaveHospDia"
                    @leaveHospDia="leaveHospDia"></LeaveHospDia>

                <div class="contentInfoTable">
                    <div class="contentInfoTableMax transparentBorder contentInfoTableHeight">
                        <p>入院病情:
                        1.有2.临床未确定3.情况不明4.无</p>
                    </div>
                    <div class="contentInfoTableMid transparentBorder contentInfoTableHeight">
                    </div>
                    <div class="contentInfoTableMin transparentBorder contentInfoTableHeight">
                    </div>
                    <div class="contentInfoTableMin contentInfoTableHeight">
                    </div>
                    <div class="contentInfoTableMax contentInfoTableHeight">
                        <!-- <el-input v-model="contentInfoTop.otherDiagnosis22" placeholder="--" class="maxWidth"></el-input> -->
                    </div>
                    <div class="contentInfoTableMid contentInfoTableHeight">
                        <!-- <el-input v-model="contentInfoTop.otherDiseaseCode22" placeholder="--" class="midWidth"></el-input> -->
                    </div>
                    <div class="contentInfoTableMin contentInfoTableHeight">
                        <!-- <el-input v-model="contentInfoTop.otherDiseaseOnAdmission22" placeholder="--" class="minWidth"></el-input> -->
                    </div>
                    <div class="contentInfoTableMin noBorder contentInfoTableHeight">
                        <!-- <el-input v-model="contentInfoTop.otherDiseaseCurativeEffect22" placeholder="--" class="minWidth">
                    </el-input> -->
                    </div>
                </div>
                <div class="contentInfoTableAcores">
                    <div class="contentInfoTableHeight noThreeBorder">
                        损伤、中毒的外部原因
                        <el-select v-model="contentInfoTop.reasonHarmPois" filterable remote reserve-keyword
                            :remote-method="getDiaDicData" @focus="getDiaDicData('')" placeholder="--"
                            @change="changeReasonHarmPois" class="birthPlaceWidth">
                            <el-option v-for='(item,index) in diaDicLists' :label="item.diagnosisName"
                                :value="item.diagnosisName" :key='index'></el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight">
                        疾病编码<el-input v-model="contentInfoTop.cdDiHarmPois" placeholder="--" class="midWidth">
                        </el-input>
                    </div>
                </div>
                <div class="contentInfoTableAcores">
                    <div class="contentInfoTableHeight noThreeBorder">
                        病理诊断
                        <el-select v-model="contentInfoTop.desDiPathgy" filterable remote reserve-keyword
                            :remote-method="getDiaDicData" @focus="getDiaDicData('')" placeholder="--"
                            @change="changeDesDiPathgy" class="birthPlaceWidth">
                            <el-option v-for='(item,index) in diaDicLists' :label="item.diagnosisName"
                                :value="item.diagnosisName" :key='index'></el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight">
                        疾病编码<el-input v-model="contentInfoTop.cdDiPathgy" placeholder="--" class="midWidth"></el-input>
                    </div>
                </div>
                <div class="contentInfoTableAcores borderTopNone">
                    <div class="contentInfoTableHeight">
                    </div>
                    <div class="contentInfoTableHeight">
                        病理号<el-input v-model="contentInfoTop.noPathgy" placeholder="--" class="midWidth"></el-input>
                    </div>
                </div>
                <div class="contentInfoTableAcores">
                    <div class="contentInfoTableHeight">
                        药物过敏<el-select v-model="contentInfoTop.fgAllergy" placeholder='' class="minnWidth"
                            @change="changeAllergy">
                            <el-option v-for="item in drugAllergyOptions" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>1.无2.有
                    </div>
                    <div class="contentInfoTableHeight" v-show="isAllergy">
                        过敏药物
                        <el-autocomplete class="midWidth" v-model="contentInfoTop.desAllergy"
                            :fetch-suggestions="findAllergyList" @select="nameDocNumFocus" @focus="nameDocNumFocus"
                            placeholder="--">
                        </el-autocomplete>
                    </div>
                    <div class="contentInfoTableHeight">
                        死亡患者尸检
                        <el-select v-model="contentInfoTop.fgAutopsy" placeholder='' class="minnWidth">
                            <el-option v-for="item in autopsyOptions" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>1.是2.否
                    </div>
                </div>
                <div class="contentInfoTableAcores">
                    <div class="contentInfoTableHeight">
                        血型<el-select v-model="contentInfoTop.sdAbo" placeholder='' class="minnWidth">
                            <el-option v-for="item in bloodTypeOptions" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>1.A2.B3.O4.AB5.不详6.未查
                    </div>
                    <div class="contentInfoTableHeight">
                        Rh
                        <el-select v-model="contentInfoTop.sdRh" placeholder='' class="minnWidth">
                            <el-option v-for="item in bloodRhOptions" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>1.阳2.阴3.不详4.未查
                    </div>
                    <div class="contentInfoTableHeight">
                        抢救<el-input v-model="contentInfoTop.rescueNo" placeholder="--" class="minnWidth"></el-input>次
                    </div>
                    <div class="contentInfoTableHeight">
                        成功<el-input v-model="contentInfoTop.rescueSucNo" placeholder="--" class="minnWidth"></el-input>次
                    </div>
                </div>
                <div class="contentInfoTableAcores">
                    <div class="contentInfoTableHeight noThreeBorder">
                        科主任
                        <el-select v-model="contentInfoTop.nameEmpDirector" filterable remote reserve-keyword
                            :remote-method="getDoctorList" @focus="getDoctorList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in doctorList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        主(副主)任医师
                        <el-select v-model="contentInfoTop.nameEmpMajor" filterable remote reserve-keyword
                            :remote-method="getDoctorList" @focus="getDoctorList('')" placeholder="--" class="minWidth">
                            <el-option v-for='item in doctorList' :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        主治医师
                        <el-select v-model="contentInfoTop.nameEmpAdmin" filterable remote reserve-keyword
                            :remote-method="getDoctorList" @focus="getDoctorList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in doctorList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        住院医师
                        <el-select v-model="contentInfoTop.nameEmpIp" filterable remote reserve-keyword
                            :remote-method="getDoctorList" @focus="getDoctorList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in doctorList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="contentInfoTableAcores borderTopNone">
                    <div class="contentInfoTableHeight noThreeBorder">
                        责任护士
                        <el-select v-model="contentInfoTop.nameEmpNur" filterable remote reserve-keyword
                            :remote-method="getNurseList" @focus="getNurseList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in nurseList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        进修医师
                        <el-select v-model="contentInfoTop.nameEmpStudy" filterable remote reserve-keyword
                            :remote-method="getDoctorList" @focus="getDoctorList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in doctorList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                        </el-input>
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        实习医师
                        <el-select v-model="contentInfoTop.nameEmpPrac" filterable remote reserve-keyword
                            :remote-method="getDoctorList" @focus="getDoctorList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in doctorList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        编码员
                        <el-select v-model="contentInfoTop.nameEmpCd" filterable remote reserve-keyword
                            :remote-method="getDoctorList" @focus="getDoctorList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in doctorList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="contentInfoTableAcores">
                    <div class="contentInfoTableHeight">
                        病案质量
                        <el-select v-model="contentInfoTop.sdEmrlvl" placeholder='' class="minnWidth">
                            <el-option v-for="item in qualitymedicalRecordsOptions" :key="item.value"
                                :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>1.甲2.乙3.丙
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        质控医师
                        <el-select v-model="contentInfoTop.nameEmpPhyQa" filterable remote reserve-keyword
                            :remote-method="getDoctorList" @focus="getDoctorList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in doctorList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        质控护士
                        <el-select v-model="contentInfoTop.nameEmpNurQa" filterable remote reserve-keyword
                            :remote-method="getNurseList" @focus="getNurseList('')" placeholder="--" class="minWidth">
                            <el-option v-for="item in nurseList" :key="item.value" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="contentInfoTableHeight noThreeBorder">
                        质控日期
                        <el-date-picker v-model="contentInfoTop.dtQa" type="date" placeholder="" format='yyyy年MM月dd日'
                            value-format='yyyy-MM-dd HH:mm:ss' class="midWidth">
                        </el-date-picker>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog :title="title" class="addDialog dialog" :visible.sync="newlyBuild" width="70%"
            :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form :inline="true" :model="formInline" class="demo-form-inline" ref="formInline">
                <el-form-item>
                    <el-select v-model="formInline.province" @change="handleAddressCheck($event,1)" placeholder="请选择">
                        <el-option v-for="item in provinceLists" :key="item.idArea" :label="item.areaName"
                            :value="item.idArea">
                        </el-option>
                    </el-select>
                    <el-select v-model="formInline.city" @change="handleAddressCheck($event,2)" placeholder="请选择" :disabled="!formInline.province">
                        <el-option v-for="item in cityLists" :key="item.idArea" :label="item.areaName"
                            :value="item.idArea">
                        </el-option>
                    </el-select>
                    <el-select v-model="formInline.sdArea" placeholder="请选择" @change="handleAddressCheck($event,3)"  :disabled="!formInline.city">
                        <el-option v-for="item in directLists" :key="item.idArea" :label="item.areaName"
                            :value="item.areaCode">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="">
                    <el-input v-model="formInline.address" placeholder="请输入详细地址"></el-input>
                </el-form-item>
                <br>
                <el-form-item class="dialogBtn">
                    <el-button type="primary" @click="onAddressSubmit">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    import LeaveHospDia from './LeaveHospDia.vue';
    import bus from '@/components/common/bus.js';
    export default {
        data() {
            return {
                formInline: {
                    province: '',
                    provinceStr: '',
                    city: '',
                    cityStr: '',
                    sdArea: '',
                    sdAreaStr: '',
                    address: ''
                }, //地址弹窗省市区详细地址
                provinceLists: [],   // 省列表
                cityLists: [],       //市列表
                directLists: [],     //区列表
                title: '',       //地址弹窗标题名称
                newlyBuild: false,
                orgName: '博仁医院',
                nativePlaceCode: "1", //籍贯字典
                currentPlaceCode: "99", //现住址字典
                isAllergy: false,    //是否展示过敏
                sexLists: [],        //性别列表 
                countryLists: [],    // 国家列表
                generationals: [],   //关系列表
                marryLists: [],      //婚姻列表
                nationLists: [],     //民族列表
                hospitalWayList: [], //入院途径列表
                careerLists: [],     //职业列表
                diaDicLists: [],     //诊断字典列表
                payMethodOptions: [  // 付费方式选择框数据
                    {
                        value: '1',
                        label: '1'
                    },
                    {
                        value: '2',
                        label: '2'
                    },
                    {
                        value: '3',
                        label: '3'
                    },
                    {
                        value: '4',
                        label: '4'
                    },
                    {
                        value: '5',
                        label: '5'
                    },
                    {
                        value: '6',
                        label: '6'
                    },
                    {
                        value: '7',
                        label: '7'
                    },
                    {
                        value: '8',
                        label: '8'
                    },
                    {
                        value: '9',
                        label: '9'
                    }
                ],
                contentInfoTop: {
                    chargeTypeCode: '', // 付费方式
                    visitTimes: '', // 第几次住院
                    visitCode: '', // 病案号
                    healthCardNo: '', // 健康卡号
                    patCode: '', // 识别号
                    patName: '', // 姓名
                    sdSex: '', // 性别
                    dtBirth: '', // 出生日期
                    ageYear: '', // 年龄
                    sdCounty: '', // 国籍
                    ageDay: '', // 新生儿月数
                    weightNbBirth: '', // 新生儿体重
                    weightNbAdmit: '', // 新生儿入院体重
                    birthPlace: '', // 出生地
                    birthPlaceSdArea: '', // 出生地--区编码
                    nativePlace: '', // 籍贯
                    nativePlaceSdArea: '', // 籍贯----区编码
                    nationName: '', // 民族
                    idNo: '', //身份证号
                    occupationName: '', // 职业
                    sdMarry: '', // 婚姻
                    currentPlace: '', // 现住址
                    currentPlaceSdArea: '', // 现住址--区编码
                    currentTel: '', // 手机号
                    currentZip: '', // 邮编
                    registPlace: '', // 户口地址
                    registPlaceSdArea: '', // 户口地址----区编码
                    registZip: '', // 户口所在地邮编
                    workPlace: '', // 工作单位及地址
                    workPlaceSdArea: '', // 工作单位及地址--区编码
                    workTel: '', // 工作单位电话
                    workZip: '', // 工作单位邮编
                    contactName: '', // 联系人姓名
                    contactTypeName: '', // 联系人关系
                    contactAddress: '', // 联系人地址
                    sdArea: '', // 联系人地址--区编码
                    contactTel: '', // 联系人电话
                    sdAdmitWay: '', // 入院途径
                    dtEntry: '', // 入院日期
                    deptAdmitName: '', // 入院科别
                    stickBedCodeAdmit: '', // 病床
                    strDept: '', // 转科科别
                    dtEnd: "", // 出院日期
                    deptDischargeName: '', // 出院科别
                    stickBedCodeDischarge: '', // 出院病床
                    actualAdmitDay: '', // 实际住院天数
                    nameDiOut: '', // 诊断
                    cdDiOut: '', // 病区编号
                    dateDiOut: '', // 确诊日期
                    diagnosisList: [
                        {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 0,
                            fgMajIndicator: 1,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 1,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 2,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 3,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 4,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 5,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 6,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 7,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 8,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 9,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 10,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 11,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 12,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 13,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 14,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 15,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 16,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 17,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 18,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 19,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 20,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }, {
                            cdDiagnosis: "",
                            nameDiagnosis: "",
                            effect: "",
                            sdDislvlInp: "",
                            sortNo: 21,
                            fgMajIndicator: 0,
                            desDiagnosis: '',
                            idDiagnosis: '',
                            idFrontDiagnosis: '', // 住院病历首页诊断ID
                            idFrontSheet: '' // 住院病历首页
                        }
                    ], //诊断类表
                    reasonHarmPois: '', // 受伤原因
                    cdDiHarmPois: '', // 疾病编码
                    desDiPathgy: '', // 病理诊断
                    cdDiPathgy: '', // 疾病编码
                    noPathgy: '', // 病理号
                    fgAllergy: '1', // 药物过敏--是否
                    desAllergy: '', // 药物过敏
                    fgAutopsy: '', // 死亡患者尸检
                    sdAbo: '', // 血型
                    sdRh: '', // 阴性阳性
                    rescueNo: '', // 抢救次数
                    rescueSucNo: '', // 成功次数
                    nameEmpDirector: '', // 科主任
                    nameEmpMajor: '', // 主(副主)任医师
                    nameEmpAdmin: '', // 主治医师
                    nameEmpIp: '', // 住院医师
                    nameEmpNur: '', // 责任护士
                    nameEmpStudy: '', // 进修医师
                    nameEmpPrac: '', // 实习医师
                    nameEmpCd: '', // 编码员
                    sdEmrlvl: '', // 病案质量
                    nameEmpPhyQa: '', // 质控医师
                    nameEmpNurQa: '', // 质控护士
                    dtQa: '' // 质控日期
                },
                drugAllergyOptions: [{
                    value: 1,
                    label: '1'
                },
                {
                    value: 2,
                    label: '2'
                }
                ],  //有无过敏史
                autopsyOptions: [{
                    value: 1,
                    label: '1'
                },
                {
                    value: 2,
                    label: '2'
                }
                ], //死亡患者尸检
                bloodTypeOptions: [{
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
                },
                {
                    value: 6,
                    label: '6'
                }
                ],  //血型列表
                bloodRhOptions: [{
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
                ], //Rh
                qualitymedicalRecordsOptions: [{
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
                }
                ], //病案质量
                doctorList: [],
                nurseList: [],
                idFrontSheet: '', // 判断是新增还是修改
                medicalRecordData: {},
                //确诊日期校验
                dialogPickerOptions: {
                    disabledDate: time => {
                        var dateTime = new Date(this.contentInfoTop.dtEntry);
                        dateTime = dateTime.setDate(dateTime.getDate() - 1);
                        dateTime = new Date(dateTime);
                        if (this.contentInfoTop.dtEnd) {
                            var dateTimebegin = new Date(this.contentInfoTop.dtEnd);
                            return time.getTime() > dateTimebegin.getTime() || time.getTime() < dateTime.getTime()
                        } else {
                            return time.getTime() < dateTime.getTime();
                        }
                    }
                },
                idVisit: '',
                idPat: '',
                diagnosisOptions: [], // 门急诊诊断
                province: '',
                city: '',
                area: ''         
            }
        },
        components: {
            LeaveHospDia
        },
        computed: {},
        created() {
            let vm = this
            vm.getIdVisit() // 获取idVisit
            vm.findADTInfoById() //患者入转出信息接口
            vm.getMedicalRecord()
            vm.getpatInfo()
            vm.initDicInfo()
            vm.getDiaDicData();  //获取诊断列表
            vm.getDoctorList(); // 医生列表
            vm.getNurseList() // 护士列表
            bus.$off('submitBack')
            bus.$on('submitBack', (msg) => {
                msg.dtCtcPreIp = vm.traversalObject(msg.comaDay1) + '-' + vm.traversalObject(msg.comaHours1) + '-' + vm.traversalObject(msg.comaMinute1)
                msg.dtCtcLatIp = vm.traversalObject(msg.comaDay2) + '-' + vm.traversalObject(msg.comaHours2) + '-' + vm.traversalObject(msg.comaMinute2)
                delete msg.comaDay1
                delete msg.comaDay2
                delete msg.comaHours1
                delete msg.comaHours2
                delete msg.comaMinute1
                delete msg.comaMinute2
                vm.medicalRecordData = msg
            })
        },
        mounted() {},
        methods: {
            //根据ID查询患者入转出信息
            findADTInfoById() {
                this.$axios
                    .post('/nurse/adt/findADTInfoById', {
                        idVisit: this.$route.query.idVisit
                    })
                    .then(res => {
                        if (res.success) {
                            console.log(res.data)
                            this.contentInfoTop.dtEntry = res.data.dtAccept //入院日期
                            this.contentInfoTop.dtEnd = res.data.dtEnd //出院日期
                            this.contentInfoTop.deptAdmitName = res.data.deptName //入院科室
                            this.contentInfoTop.deptDischargeName = res.data.deptNameDis //出院科室名称
                            this.contentInfoTop.stickBedCodeAdmit = res.data.bedCode //入院病床
                            this.contentInfoTop.stickBedCodeDischarge = res.data.bedCodeDis //出院病床
                            this.contentInfoTop.strDept = res.data.deptNameTra //转科科室
                            this.contentInfoTop.actualAdmitDay = res.data.inDays //实际住院天数

                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
                    })
            },
            //根据数组中对象的某个属性值进行排序
            propertyCompare(property) {
                return ((a, b) => {
                    var value1 = a[property]
                    var value2 = b[property]
                    return value1 - value2
                })
            },
            initDicInfo() {
                let str = 'SD_CONTACT_TYPE,SD_SEX,SD_MARRY,SD_NATION,SD_ADMIT_WAY,SD_OCCUPATION';
                this.findSdData(str).then(data => {
                    this.concatSexList(data.SD_SEX);      //性别列表
                    this.concatMarryList(data.SD_MARRY);  //婚姻列表
                    this.nationLists = data.SD_NATION;    //民族列表
                    this.hospitalWayList = data.SD_ADMIT_WAY //入院途径列表
                    this.hospitalWayList.sort(this.propertyCompare('dataCode')) //按照dataCode进行升序排序
                    this.careerLists = data.SD_OCCUPATION; //职业列表
                    this.concatCareerList(data.SD_CONTACT_TYPE); //关系列表

                });

                this._initCity(0).then(data => {
                    this.countryLists = data; //国籍列表
                });
            },

            //拼装 -- 性别
            concatSexList(sex) {
                var idx = 2;
                sex.map(v => {
                    if (v.dataName == '男') {
                        v.index = 1;
                        this.sexLists.unshift(v);
                    } else if (v.dataName == '女') {
                        v.index = 2;
                        this.sexLists.unshift(v);
                    } else {
                        idx++;
                        v.index = idx;
                        this.sexLists.push(v);
                    }
                })
            },

            //拼装 -- 关系
            concatCareerList(career) {
                career.map((v, i) => {
                    v.index = i;
                    this.generationals.push(v);
                })
            },

            //拼装 -- 婚姻
            concatMarryList(marry) {
                var idx = 4;
                marry.map(v => {
                    if (v.dataName == '未婚') {
                        v.index = 1;
                        this.marryLists.unshift(v);
                    } else if (v.dataName == '已婚') {
                        v.index = 2;
                        this.marryLists.unshift(v);
                    } else if (v.dataName == '丧偶') {
                        v.index = 3;
                        this.marryLists.unshift(v);
                    } else if (v.dataName == '离婚') {
                        v.index = 4;
                        this.marryLists.unshift(v);
                    } else {
                        idx++;
                        v.index = idx;
                        this.marryLists.push(v);
                    }
                })
            },
            getMedicalRecord() {
                // 回显数据
                let vm = this
                vm.$axios
                    .post('mrm/ciFrontSheet/findSheetByIdVisit', {
                        idVisit: vm.$route.query.idVisit
                    })
                    .then(res => {
                        if (res.success) {
                            // vm.getpatInfo();
                            // return   //测试
                            vm.idFrontSheet = res.data.idFrontSheet
                            vm.$root.Bus.$emit('idFrontSheet', res.data.idFrontSheet)
                            if (vm.idFrontSheet) { //编辑
                                bus.$emit('allData', res.data)
                                vm.contentInfoTop = vm.traversalObject(res.data)
                                vm.changeAllergy(res.data.fgAllergy);  //编辑 --有无过敏史
                                vm.listAssign(vm.contentInfoTop.diagnosisList, res.data.diagnosisList);  //对象赋值
                                vm.$root.Bus.$emit('aaaa', vm.contentInfoTop.diagnosisList)
                                console.log('vm.idPat:', vm.idPat)
                                vm.getOutDiaData(vm.idPat) // 门急诊诊断接口
                            } else { //新增
                                vm.getpatInfo();
                            }
                        } else {
                            vm.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
                    })
            },
            isEmptyObject(obj) { // 判断对象是否为空对象
                for (var name in obj) {
                    return false // 返回false，不为空对象
                }
                return true // 返回true，为空对象
            },
            //获取患者基本信息
            getpatInfo() {
                // 回显数据
                let vm = this
                vm.$axios
                    .post('/reg/visit/findVisitById', {
                        idVisit: vm.$route.query.idVisit
                    })
                    .then(res => {
                        if (res.success) {
                            let patInfo = res.data.pat;
                            let visit = res.data.visit;
                            vm.idPat = res.data.pat.idPat
                            // console.log('保存了idpat', vm.idPat)
                            if (!vm.idFrontSheet) {
                                bus.$emit('patInfo', res.data)
                                vm.listAssign(vm.contentInfoTop, patInfo);  //对象赋值
                                if (patInfo.sdIdType != '01') {
                                    vm.contentInfoTop.idNo = ''
                                }
                                vm.contentInfoTop.nationName = patInfo.sdNation; //民族
                                vm.contentInfoTop.workTel = patInfo.mobile; //工作单位电话
                                vm.contentInfoTop.currentTel = patInfo.mobile; //现住址电话
                                vm.contentInfoTop.workPlace = patInfo.workUnit; //工作单位
                                vm.contentInfoTop.occupationName = patInfo.sdOccupation; //职业


                                vm.listAssign(vm.contentInfoTop, visit);  //对象赋值
                                vm.handleChangeDate(patInfo.dtBirth); //日期 -- 计算年龄
                                vm.getOutDiaData(patInfo.idPat); //门诊诊断
                                vm.findAllergyByIdPat(patInfo.idPat); //查患者过敏原

                                // 联系人信息
                                if (patInfo.patContactList) {
                                    if (patInfo.patContactList.length > 0) {
                                        let pCList = patInfo.patContactList[0];
                                        vm.contentInfoTop.contactTel = pCList.contactTel; //联系电话
                                        vm.contentInfoTop.contactName = pCList.contactName; //联系人
                                        vm.contentInfoTop.contactTypeName = pCList.sdContactType; //关系
                                    }
                                }
                                //地址回显
                                if (patInfo.patAddressList) {
                                    if (patInfo.patAddressList.length > 0) {
                                        patInfo.patAddressList.map(v => {
                                            this.traversalObject(v)
                                            // 籍贯
                                            if (v.sdAddressType == vm.nativePlaceCode) {
                                                vm.nativeAndCurrentAddress(v.sdArea, v.address, '籍贯');
                                            }
                                            // 现住址
                                            if (v.sdAddressType == vm.currentPlaceCode) {
                                                vm.nativeAndCurrentAddress(v.sdArea, v.address, '现住址')
                                            }
                                        })
                                    }
                                }
                            }

                        } else {
                            vm.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
                    })
            },

            // 日期 -- 计算年龄 几岁几月几天
            handleChangeDate(e) {
                let vm = this;
                if (e) {
                    vm.getAge(e).then(data => {
                        // y --岁  m -- 月  d -- 天
                        if (data.y > 0) {
                            vm.contentInfoTop.ageYear = data.y.toString(); //年龄
                            vm.contentInfoTop.ageDay = ''; //月
                        } else {
                            if (data.m > 0) {
                                vm.contentInfoTop.ageYear = '0'; //年龄
                                vm.contentInfoTop.ageDay = data.m.toString(); //月
                            } else {
                                vm.contentInfoTop.ageYear = '0'; //年龄
                                vm.contentInfoTop.ageDay = '0'; //月
                            }
                        }
                    })
                } else {
                    vm.contentInfoTop.ageYear = ''; //年龄
                    vm.contentInfoTop.ageDay = ''; //月
                }
            },

            // 回显籍贯和当前地址--新增根据区code码反显地址拼接
            nativeAndCurrentAddress(sdArea, address, str) {
                let vm = this;
                vm.$axios
                    .get("/dict/area/findAreaByAreaCode", {
                        areaCode: sdArea
                    })
                    .then(res => {
                        if (res.success) {
                            let provinceName = res.data.provinceName || ''; //省
                            let cityName = res.data.cityName || ''; //市
                            let districtName = res.data.districtName || ''; //区
                            let addressConcatStr = provinceName + cityName + districtName +
                                this.traversalObject(address);  //地区拼接
                            // 籍贯
                            if (str == '籍贯') {
                                vm.contentInfoTop.nativePlace = addressConcatStr; // 籍贯      
                                vm.contentInfoTop.nativePlaceSdArea = sdArea; // 籍贯-- 区编码     
                                vm.contentInfoTop.birthPlace = addressConcatStr; //出生地
                                vm.contentInfoTop.birthPlaceSdArea = sdArea; //出生地-- 区编码 
                            }
                            // 现住址
                            if (str == '现住址') {
                                vm.contentInfoTop.currentPlace = addressConcatStr; // 现住址
                                vm.contentInfoTop.currentPlaceSdArea = sdArea; // 现住址 -- 区Code
                                vm.contentInfoTop.currentZip = '';
                            }

                        } else {
                            vm.$message({
                                message: res.message,
                                type: "type"
                            });
                        }
                    });
            },
            // 根据idVisit获取idVisit
            getIdVisit() {
                let vm = this
                vm.$axios
                    .post('/reg/visit/findIdVisitByInIdVisit', {
                        idVisit: this.$route.query.idVisit
                    })
                    .then(res => {
                        if (res.success) {
                            if (res.data) {
                                vm.idVisit = res.data
                            }
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning'
                            })
                        }
                    })
            },
            // 获取门诊诊断信息
            getOutDiaData(idPat) {
                let vm = this
                vm.selectCiDiaRecord(idPat,vm.idVisit, vm.CONSTANT.OUTP_DIAGNOSIS_FLAG).then( data => {
                    if (data && data.length > 0) {
                        vm.diagnosisOptions = data
                    } else {
                        vm.querySearchDiaByName('').then( data => {
                            vm.diagnosisOptions = [];
                            vm.diagnosisOptions = data; //诊断列表
                        })
                    }
                })
            },
            changeNameDiOut(val) {
                this.diagnosisOptions && this.diagnosisOptions.map(item => {
                    if (val == item.diagnosisCode) {
                        this.contentInfoTop.cdDiOut = item.diagnosisStdCode
                    }
                })
            },
            //获取诊断字典下拉列表
            getDiaDicData(name = '') {
                this.querySearchDiaByName(name).then( data => {
                    this.diaDicLists = [];
                    this.diaDicLists = data; //诊断列表
                })
            },

            //改变病历诊断
            changeDesDiPathgy(e) {
                this.diaDicLists.map(v => {
                    if (v.diagnosisName == e) {
                        this.contentInfoTop.cdDiPathgy = v.diagnosisStdCode;   //疾病编码
                    }
                })
            },

            //改变损伤、中毒的外部原因
            changeReasonHarmPois(e) {
                this.diaDicLists.map(v => {
                    if (v.diagnosisName == e) {
                        this.contentInfoTop.cdDiHarmPois = v.diagnosisStdCode;   //疾病编码
                    }
                })
            },

            //出院诊断子组件传递参数
            leaveHospDia(data) {
                this.contentInfoTop.diagnosisList = data;
            },

            //切换选中是否有过敏药物
            changeAllergy(e) {
                console.log(e);
                if (e == 2) {
                    this.isAllergy = true;
                } else {
                    this.isAllergy = false;
                }
            },

            //查看过敏源数据
            getAllergyList(name = '') {
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

            // 过敏史联想搜索
            findAllergyList(name, callback) {
                this.getAllergyList(name).then(data => {
                    callback(data)
                })
            },

            // 过敏源聚焦 -- 选择过敏源
            nameDocNumFocus() { },

            //根据患者id查过敏史
            findAllergyByIdPat(idPat) {
                this.$axios.post("/reg/allergy/findByIPat", {
                    idPat: idPat
                }).then(res => {
                    if (res.success) {
                        if (res.data.length > 0) {
                            this.contentInfoTop.fgAllergy = 2;
                            this.isAllergy = true;
                            this.contentInfoTop.desAllergy = res.data[0].allergyName;
                        }
                    } else {
                        this.$message({
                            message: res.message,
                            type: "warning"
                        });
                    }
                });
            },
            getDoctorList(name = '') { // 医生列表
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
                            vm.doctorList = res.data
                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            })
                        }
                    })
            },
            getNurseList(name = '') { // 护士列表
                let vm = this
                vm.$axios
                    .get('/org/emp/listAssignEmpInfo', {
                        idOrg: this.getUserStorage().idOrg,
                        deptType: 'nursing',
                        empType: 'nurse',
                        selCondition: name
                    })
                    .then(res => {
                        if (res.success) {
                            vm.nurseList = res.data
                        } else {
                            this.$message({
                                message: res.message,
                                type: "warning"
                            })
                        }
                    })
            },
            handleSubmit() {
                bus.$emit('submitEvent', '点击保存了')
                // 保存
                let vm = this
                if (vm.idFrontSheet) {
                    // 修改
                    vm.edit()
                } else {
                    // 新增
                    vm.add()
                }
            },
            add() {
                // 新增
                let vm = this
                let param = {
                    idVisit: vm.$route.query.idVisit,
                    idPat: vm.$route.query.idPat,
                    ...vm.contentInfoTop,
                    ...vm.medicalRecordData,
                    dtBirth: vm.contentInfoTop.dtBirth + ' ' + '00:00:00'
                }
                let reg = /^\d{0,}$/
                if (param.weightNbBirth != '' && !reg.test(param.weightNbBirth)) {
                    this.$message({
                        message: '新生儿体重必须为数字',
                        type: 'warning',
                    })
                    return
                }
                if (param.weightNbAdmit != '' && !reg.test(param.weightNbAdmit)) {
                    this.$message({
                        message: '新生儿入院体重必须为数字',
                        type: 'warning',
                    })
                    return
                }
                if (param.rescueNo != '' && !reg.test(param.rescueNo)) {
                    console.log()
                    this.$message({
                        message: '抢救次数必须为数字',
                        type: 'warning',
                    })
                    return
                }
                if (param.rescueSucNo != '' && !reg.test(param.rescueSucNo)) {
                    this.$message({
                        message: '抢救成功次数必须为数字',
                        type: 'warning',
                    })
                    return
                }
                if (parseInt(param.rescueSucNo) > parseInt(param.rescueNo)) {
                    this.$message({
                        message: '抢救成功次数不能大于抢救次数',
                        type: 'warning',
                    })
                    return
                }
                vm.$axios
                    ._post('mrm/ciFrontSheet/saveSheet', param)
                    .then(res => {
                        if (res.success) {
                            vm.$message({
                                message: res.message,
                                type: 'success',
                            })
                            this.getMedicalRecord()
                        } else {
                            vm.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
                    })
            },
            edit() {
                // 修改
                let vm = this
                let param = {
                    idVisit: vm.$route.query.idVisit,
                    idPat: vm.$route.query.idPat,
                    ...vm.contentInfoTop,
                    ...vm.medicalRecordData,
                    dtBirth: vm.contentInfoTop.dtBirth + ' ' + '00:00:00'
                }
                param = vm.traversalObject(param)
                let reg = /^\d{0,}$/
                if (param.weightNbBirth != '' && !reg.test(param.weightNbBirth)) {
                    this.$message({
                        message: '新生儿体重必须为数字',
                        type: 'warning',
                    })
                    return
                }
                if (param.weightNbAdmit != '' && !reg.test(param.weightNbAdmit)) {
                    this.$message({
                        message: '新生儿入院体重必须为数字',
                        type: 'warning',
                    })
                    return
                }
                if (param.rescueNo != '' && !reg.test(param.rescueNo)) {
                    this.$message({
                        message: '抢救次数必须为数字',
                        type: 'warning',
                    })
                    return
                }
                if (param.rescueSucNo != '' && !reg.test(param.rescueSucNo)) {
                    this.$message({
                        message: '抢救成功次数必须为数字',
                        type: 'warning',
                    })
                    return
                }
                if (parseInt(param.rescueSucNo) > parseInt(param.rescueNo)) {
                    this.$message({
                        message: '抢救成功次数不能大于抢救次数',
                        type: 'warning',
                    })
                    return
                }
                console.log("修改", param)
                vm.$axios
                    ._post('mrm/ciFrontSheet/updateSheet', param)
                    .then(res => {
                        if (res.success) {
                            vm.$message({
                                message: res.message,
                                type: 'success',
                            })
                            this.getMedicalRecord()
                        } else {
                            vm.$message({
                                message: res.message,
                                type: 'warning',
                            })
                        }
                    })
            },
            //打开地址弹窗
            showModal(str) {
                let vm = this
                vm.newlyBuild = true
                vm.title = str;
                this.getCityLists(); //省列表
                switch (vm.title) {
                    case '籍贯':
                        this.getProCity(this.contentInfoTop.nativePlaceSdArea, this.contentInfoTop.nativePlace)
                        break;
                    case '出生地':
                        this.getProCity(this.contentInfoTop.birthPlaceSdArea, this.contentInfoTop.birthPlace)
                        break;
                    case '现住址':
                        this.getProCity(this.contentInfoTop.currentPlaceSdArea, this.contentInfoTop.currentPlace)
                        break;
                    case '户口地址':
                        this.getProCity(this.contentInfoTop.registPlaceSdArea, this.contentInfoTop.registPlace)
                        break;
                    case '工作单位地址':
                        this.getProCity(this.contentInfoTop.workPlaceSdArea, this.contentInfoTop.workPlace)
                        break;
                    case '联系人地址':
                        this.getProCity(this.contentInfoTop.sdArea, this.contentInfoTop.contactAddress)
                        break;
                }
            },
            // 根据区code,查询省市区
            getProCity (sdArea, str) {
                let vm = this
               
                vm.$axios
                .get("/dict/area/findAreaByAreaCode", {
                    areaCode: sdArea
                })
                .then(res => {
                    if (res.success) {
                        console.log(sdArea)
                        
                        let provinceId = res.data.provinceId || ''
                        let cityId = res.data.cityId || ''
                        let districtId = res.data.districtId || ''
                        this._initCity(provinceId).then(data => {
                            this.cityLists = data
                        })
                        this._initCity(cityId).then(data => {
                            this.directLists = data
                        })
                        let provinceName = res.data.provinceName || ''; //省
                        let cityName = res.data.cityName || ''; //市
                        let districtName = res.data.districtName || ''; //区
                        let allAddress = provinceName + cityName + districtName
                        // vm.formInline.province = provinceName
                        // vm.formInline.city = cityName
                        vm.formInline.province = provinceId
                        vm.formInline.city = cityId
                        vm.formInline.sdArea = districtId
                        vm.province = provinceName,
                        vm.city = cityName,
                        vm.area = districtName  
                        this.formInline.provinceStr = vm.province
                        this.formInline.cityStr = vm.city
                        this.formInline.sdAreaStr = vm.area
                        vm.formInline.address = str.replace(allAddress, '')
                    } else {
                        vm.$message({
                            message: res.message,
                            type: 'warning',
                        })
                    }
                })
            },
            //点击地址确定
            onAddressSubmit() {
                // console.log(this.formInline);
                this.getCityLists(); //省列表
                this._initCity(this.formInline.province).then(data => {
                    this.cityLists = data
                })
                this._initCity(this.formInline.city).then(data => {
                    this.directLists = data
                })

                this.provinceLists.map(v => {
                    if (v.idArea == this.formInline.province) {
                        this.formInline.provinceStr = v.areaName;   //省名称
                    }
                })
                this.cityLists.map(v => {
                    if (v.idArea == this.formInline.city) {
                        this.formInline.cityStr = v.areaName;   //市名称
                    }
                })
                this.directLists.map(v => {
                    if (v.areaCode == this.formInline.sdArea) {
                        this.formInline.sdAreaStr = v.areaName;   //市名称
                    }
                })
                let docAddressStr = this.formInline.provinceStr + this.formInline.cityStr + this.formInline.sdAreaStr + this.formInline.address;
                switch (this.title) {
                    case '籍贯':
                        this.contentInfoTop.nativePlace = docAddressStr;
                        this.contentInfoTop.nativePlaceSdArea = this.formInline.sdArea;
                        break;
                    case '出生地':
                        this.contentInfoTop.birthPlace = docAddressStr;
                        this.contentInfoTop.birthPlaceSdArea = this.formInline.sdArea;
                        break;
                    case '现住址':
                        this.contentInfoTop.currentPlace = docAddressStr;
                        this.contentInfoTop.currentPlaceSdArea = this.formInline.sdArea;
                        break;
                    case '户口地址':
                        this.contentInfoTop.registPlace = docAddressStr;
                        this.contentInfoTop.registPlaceSdArea = this.formInline.sdArea;
                        break;
                    case '工作单位地址':
                        this.contentInfoTop.workPlace = docAddressStr;
                        this.contentInfoTop.workPlaceSdArea = this.formInline.sdArea;
                        break;
                    case '联系人地址':
                        this.contentInfoTop.contactAddress = docAddressStr;
                        this.contentInfoTop.sdArea = this.formInline.sdArea;
                        break;
                }
                this.newlyBuild = false
                // this.resetForm('formInline')
                this.formInline.province = ''
                this.formInline.city = ''
                this.formInline.sdArea = ''
                this.formInline.address = ''
            },
            //获取省市区接口
            getCityLists() {
                // 省
                this._initCity().then(data => {
                    this.provinceLists = data;
                });
            },

            //地区 -- 下拉事件 -- 三级联动
            handleAddressCheck(value, type) {
                switch (type) {
                    case 1:
                        this.formInline.address = "";
                        this._initCity(value).then(data => {
                            this.cityLists = data;
                            this.formInline.city = "";
                            this.formInline.sdArea = "";
                            // 默认第一个
                            // this.formInline.city = this.cityLists[0].idArea;
                            this.handleAddressCheck(this.formInline.city, 2);
                            this.provinceLists.map(v => {
                                if (v.idArea == value) {
                                    this.formInline.provinceStr = v.areaName;   //省名称
                                    // this.formInline.province = v.areaName;   //省名称
                                }
                            })
                        });
                        break;
                    case 2:
                        this._initCity(value).then(data => {
                            this.formInline.sdArea = "";
                            this.directLists = data;
                            // 默认第一个
                            // this.formInline.sdArea = this.directLists[0].areaCode;
                            this.cityLists.map(v => {
                                if (v.idArea == value) {
                                    this.formInline.cityStr = v.areaName;   //市名称
                                    // this.formInline.city = v.areaName;   //市名称
                                }
                            })
                        });
                        break;
                    case 3:
                        // this.formInline.address = "";
                        this.directLists.map(v => {
                            if (v.areaCode == value) {
                                this.formInline.sdAreaStr = v.areaName;   //市名称
                                // this.formInline.sdArea = v.areaName;   //市名称
                            }
                        })
                        break;
                }
            },
            emitVisitTimes() {
                this.$root.Bus.$emit('visitTimes', this.contentInfoTop.visitTimes)
            }
        }
    }

</script>
<style lang='scss' src='./index.scss'>
</style>