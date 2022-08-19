<template>
    <!-- 体温单数据录入 -->
    <div class="tempInputDiv">
        <el-dialog
            title="体温单录入"
            width="810"
            ref="tempInputDialog"
            custom-class="tempInputDialog"
            :visible.sync="dialogClose"
            :close-on-click-modal="false"
            :before-close="beforeHideDialog"
            v-dialogDrag
            v-loading="dialogLoading"
            element-loading-text="加载中..."
        >
            <el-form :model="patEntryForm">
                <!-- <div class="mainData"> -->
                    <div class="searchCondition">
                        <div class="selectDate">
                            <el-form-item>
                                <el-date-picker
                                    v-model="patEntryForm.recordDt"
                                    type="date"
                                    placeholder="选择日期"
                                    value-format="yyyy-MM-dd"
                                    :picker-options="pickerOptions"
                                    :clearable="false"
                                    :editable="false"
                                ></el-date-picker>
                            </el-form-item>
                            <div>
                                <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="上一天"
                                    placement="top-start"
                                >
                                    <el-button @click="switchDate('up')">
                                        <i class="el-icon-arrow-left"></i>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip
                                    class="item"
                                    effect="dark"
                                    content="下一天"
                                    placement="top-start"
                                >
                                    <el-button :disabled="btnDisabled" @click="switchDate('next')">
                                        <i class="el-icon-arrow-right"></i>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </div>

                        <div
                            class="formType"
                            v-for="(
                                titleBarItem, index
                            ) in pageStructure.titleBarDataList"
                            :key="index"
                        >
                            <el-form-item
                                :label="titleBarItem.itemName"
                                v-for="(signItem, ind) in titleBarItem.signList"
                                :key="ind"
                            >
                                <el-input
                                    v-if="
                                        titleBarItem.itemCode ==
                                        selfTmpCode.OTDAYS
                                    "
                                    v-model="signItem.value"
                                ></el-input>
                                <el-input
                                    v-else
                                    @input="
                                        signItem.value = numCheck(
                                            signItem.value
                                        )
                                    "
                                    @keyup.enter.native="
                                        signItem.value = numCheck(
                                            signItem.value
                                        )
                                    "
                                    v-model="signItem.value"
                                ></el-input>
                            </el-form-item>
                        </div>
                        <!-- <div class="formType">
                            <el-form-item label="手术天数">
                                <el-input v-model="patEntryForm.operationDays" placeholder="手术天数"></el-input>
                            </el-form-item>
                        </div>-->
                    </div>
                    
                    <!-- <div class="radioBox">
                        <el-radio v-model="radio" label="1">1小时</el-radio>
                        <el-radio v-model="radio" label="2">2小时</el-radio>
                        <el-radio v-model="radio" label="3">4小时</el-radio>
                    </div>-->
                    
                <!-- </div> -->
                <div class="mainData">
                    <div class="titleP">
                        <p class="title-p">
                            主要护理项目
                            <span class="itemTip">（{{signInpTip}}）</span>
                        </p>
                        <p>
                            <el-button type="text" @click="tempShow = true">体温单</el-button>
                            <el-button type="text" @click="quoteSign">引用护理体征</el-button>
                            <el-button
                                type="text"
                                v-if="sysConfigData.showTemperatureVitalSet == 1"
                                @click="signProjectAdjust"
                            >体温单项目调整</el-button>
                        </p>
                    </div>
                    <div class="mainTable">
                        <div class="titleHeader bgColor">
                            <p class="item-title">护理项目</p>
                            <ul>
                                <li
                                    v-for="(
                                        hourItem, index
                                    ) in pageStructure.hourList"
                                    :key="index"
                                >{{ hourItem }}</li>
                            </ul>
                        </div>
                        <div
                            class="titleDiv"
                            v-for="(
                                parentItem, parentInd
                            ) in pageStructure.mainDataList"
                            :key="parentInd"
                        >
                            <!-- 血压 -->
                            <template
                                v-if="
                                    parentItem.itemCode ==
                                    selfTmpCode.BLOOD_PRESSURE
                                "
                            >
                                <p class="item-title">
                                    {{ parentItem.itemName }}
                                    {{
                                    parentItem.itemUnit
                                    ? parentItem.itemUnit
                                    : ""
                                    }}
                                </p>
                                <ul class="bloodPreUl">
                                    <li
                                        class="bloodPreLi tempWrap"
                                        v-for="(
                                            subItem, xyInd
                                        ) in parentItem.signList"
                                        :key="xyInd"
                                    >
                                        <el-popover
                                            placement="top"
                                            width="208"
                                            trigger="click"
                                            popper-class="elPopoverTmp"
                                        >
                                            <div class="tempDialog">
                                                <p class="tempDialog_tit">血压详情</p>
                                                <p class="tempDialog_con">
                                                    <el-input
                                                        type="text"
                                                        :class="
                                                            switchStyleFun(
                                                                subItem,
                                                                'g'
                                                            ).colorTip
                                                        "
                                                        @contextmenu.prevent.native="rowRightClick($event, subItem, 'g')"
                                                        @input="
                                                            subItem.g = bloodPreInpEvt(
                                                                subItem,
                                                                0
                                                            ),
                                                                subItem.g = numberCheck(
                                                                    subItem.g
                                                                )
                                                        "
                                                        @keyup.enter.native="
                                                            subItem.g = numberCheck(
                                                                subItem.g
                                                            )
                                                        "
                                                        placeholder="高压"
                                                        v-model="subItem.g"
                                                    ></el-input>
                                                    <span class="dividLineBd">/</span>
                                                    <el-input
                                                        type="text"
                                                        :class="
                                                            switchStyleFun(
                                                                subItem,
                                                                'd'
                                                            ).colorTip
                                                        "
                                                        @contextmenu.prevent.native="rowRightClick($event, subItem, 'd')"
                                                        v-model="subItem.d"
                                                        @input="
                                                            subItem.d = bloodPreInpEvt(
                                                                subItem,
                                                                1
                                                            ),
                                                                subItem.d = numberCheck(
                                                                    subItem.d
                                                                )
                                                        "
                                                        @keyup.enter.native="
                                                            subItem.d = numberCheck(
                                                                subItem.d
                                                            )
                                                        "
                                                        placeholder="低压"
                                                    ></el-input>
                                                </p>
                                            </div>
                                            <!-- <el-button slot="reference" class="opcHide"></el-button> -->
                                            <input
                                                :readonly="true"
                                                class="bloodPreInp"
                                                slot="reference"
                                                type="text"
                                                v-model="subItem.value"
                                                @click="
                                                bloodPreShowEvt(
                                                    parentItem.signList,
                                                    xyInd
                                                )
                                            "
                                                @contextmenu.prevent="rowRightClick($event, subItem, 'gd')"
                                            />
                                        </el-popover>
                                        <!-- <input class="bloodPreInp" type="text" v-model="subItem.value" @click="
                                                bloodPreShowEvt(
                                                    parentItem.signList,
                                                    xyInd
                                                )
                                        " @contextmenu.prevent="rowRightClick($event, subItem)"/>-->

                                        <div class="bloodPreTipBox">
                                            <p
                                                v-if="
                                                    switchStyleFun(
                                                        subItem,
                                                        'g'
                                                    )['rangeMsgTip']
                                                "
                                            >
                                                <span class="rangeMsgTip">
                                                    高压{{
                                                    switchStyleFun(
                                                    subItem,
                                                    "g"
                                                    )["rangeMsgTip"]
                                                    }}
                                                </span>
                                            </p>
                                            <p
                                                v-else-if="
                                                    switchStyleFun(
                                                        subItem,
                                                        'd'
                                                    )['rangeMsgTip']
                                                "
                                            >
                                                <span class="rangeMsgTip">
                                                    低压{{
                                                    switchStyleFun(
                                                    subItem,
                                                    "d"
                                                    )["rangeMsgTip"]
                                                    }}
                                                </span>
                                            </p>
                                            <div class="bloodValidValTip" v-else>
                                                <p class="validValTip">
                                                    {{
                                                    switchStyleFun(
                                                    subItem,
                                                    "g"
                                                    )["alertMsg"]
                                                    }}
                                                </p>
                                                <p class="validValTipd">
                                                    {{
                                                    switchStyleFun(
                                                    subItem,
                                                    "d"
                                                    )["alertMsg"]
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </template>
                            <!-- 体温 -->
                            <template
                                v-else-if="
                                    parentItem.itemCode == selfTmpCode.TMP_DATA
                                "
                            >
                                <p class="item-title">
                                    {{ parentItem.itemName }}
                                    {{
                                    parentItem.itemUnit
                                    ? parentItem.itemUnit
                                    : ""
                                    }}
                                </p>
                                <ul>
                                    <li
                                        v-for="(
                                            twItem, twInd
                                        ) in parentItem.signList"
                                        :key="twInd"
                                        class="tempWrap"
                                    >
                                        <el-popover
                                            placement="top"
                                            width="208"
                                            trigger="click"
                                            popper-class="elPopoverTmp"
                                        >
                                            <div class="tempDialog">
                                                <p class="tempDialog_tit">体温详情</p>
                                                <p class="tempDialog_con">
                                                    <el-select
                                                        v-model="wdType"
                                                        placeholder="体温类型"
                                                        class="tempDialog_sel"
                                                        @change="
                                                            tempTypeChange(
                                                                twItem
                                                            )
                                                        "
                                                    >
                                                        <el-option
                                                            v-for="item in wdTypeList"
                                                            :key="item.value"
                                                            :label="item.label"
                                                            :value="item.value"
                                                        ></el-option>
                                                    </el-select>
                                                    <el-input
                                                        type="text"
                                                        v-model="twItem.value"
                                                        @input="
                                                            twItem.value = numberCheck(
                                                                twItem.value
                                                            )
                                                        "
                                                        @contextmenu.prevent.native="rowRightClick($event, twItem)"
                                                        @keyup.enter.native="
                                                            twItem.value = numberCheck(
                                                                twItem.value
                                                            )
                                                        "
                                                    ></el-input>
                                                </p>
                                            </div>
                                            <el-input
                                                :class="
                                                    switchStyleFun(twItem)
                                                        .colorTip
                                                "
                                                ref="twInput"
                                                type="text"
                                                slot="reference"
                                                v-direction="{
                                                    x: twInd,
                                                    y: parentInd,
                                                }"
                                                v-model="twItem.value"
                                                @input="
                                                    twItem.value = numberCheck(
                                                        twItem.value
                                                    )
                                                "
                                                @contextmenu.prevent.native="rowRightClick($event, twItem)"
                                                @keyup.enter.native="
                                                    twItem.value = numberCheck(
                                                        twItem.value
                                                    )
                                                "
                                                @focus="
                                                    tempTypeShowEvt(
                                                        twItem,
                                                        twInd
                                                    )
                                                "
                                            ></el-input>
                                        </el-popover>
                                        <span class="tempTypeTip">
                                            {{
                                            twItem.itemName
                                            }}
                                        </span>
                                        <span class="rangeMsgTip">
                                            {{
                                            switchStyleFun(twItem)[
                                            "rangeMsgTip"
                                            ]
                                            }}
                                        </span>
                                        <span class="validValTip">
                                            {{
                                            switchStyleFun(twItem)["alertMsg"]
                                            }}
                                        </span>
                                    </li>
                                </ul>
                            </template>
                            <template
                                v-else-if="
                                    parentItem.itemCode ==
                                    selfTmpCode.PHYSICAL_COOLING_TMP
                                "
                            >
                                <p class="item-title">
                                    {{ parentItem.itemName }}
                                    {{
                                    parentItem.itemUnit
                                    ? parentItem.itemUnit
                                    : ""
                                    }}
                                </p>
                                <ul>
                                    <li
                                        v-for="(
                                            twItem, twInd
                                        ) in parentItem.signList"
                                        :key="twInd"
                                        class="tempWrap"
                                    >
                                        <el-input
                                            :class="
                                                switchStyleFun(twItem).colorTip
                                            "
                                            type="text"
                                            v-direction="{
                                                x: twInd,
                                                y: parentInd,
                                            }"
                                            v-model="twItem.value"
                                            @input="
                                                twItem.value = numberCheck(
                                                    twItem.value
                                                )
                                            "
                                            @keyup.enter.native="
                                                twItem.value = numberCheck(
                                                    twItem.value
                                                )
                                            "
                                            @contextmenu.prevent.native="rowRightClick($event, twItem)"
                                            @focus="
                                                tempTypeShowEvt(twItem, twInd)
                                            "
                                        ></el-input>
                                        <span class="rangeMsgTip">
                                            {{
                                            switchStyleFun(twItem)[
                                            "rangeMsgTip"
                                            ]
                                            }}
                                        </span>
                                        <span class="validValTip">
                                            {{
                                            switchStyleFun(twItem)["alertMsg"]
                                            }}
                                        </span>
                                    </li>
                                </ul>
                            </template>
                            <!-- 体温不升 -->
                            <template
                                v-else-if="
                                    parentItem.itemCode ==
                                    selfTmpCode.NORISE_TMP
                                "
                            >
                                <p class="item-title">{{ parentItem.itemName }}</p>
                                <ul>
                                    <li
                                        v-for="(
                                            twbsItem, twInd
                                        ) in parentItem.signList"
                                        :key="twInd"
                                        class="tempWrap"
                                    >
                                        <input
                                            type="checkbox"
                                            v-model="twbsItem.value"
                                            v-direction="{
                                                x: twInd,
                                                y: parentInd,
                                            }"
                                            class="checkboxTwbs"
                                        />
                                        <!-- <el-checkbox
                                            size="medium"
                                            v-model="twbsItem.value"
                                            value
                                            v-direction="{x: twInd, y: parentInd}"
                                            class="checkboxTwbs"
                                        ></el-checkbox>-->
                                    </li>
                                </ul>
                            </template>
                            <template v-else>
                                <div v-if="parentItem.times == 2">
                                    <p class="item-title">
                                        {{ parentItem.itemName }}
                                        {{
                                        parentItem.itemUnit
                                        ? parentItem.itemUnit
                                        : ""
                                        }}
                                    </p>
                                    <ul class="timesTwo">
                                        <li
                                            v-for="(
                                                subItem, index
                                            ) in parentItem.signList"
                                            :key="index"
                                        >
                                            <el-input
                                                class="timesInp"
                                                :class="
                                                    switchStyleFun(subItem)
                                                        .colorTip
                                                "
                                                type="text"
                                                v-direction="{
                                                    x: index,
                                                    y: parentInd,
                                                }"
                                                v-model="subItem.value"
                                                @input="
                                                    subItem.value = numCheck(
                                                        subItem.value
                                                    )
                                                "
                                                @contextmenu.prevent.native="rowRightClick($event, subItem)"
                                                @keyup.enter.native="
                                                    subItem.value = numCheck(
                                                        subItem.value
                                                    )
                                                "
                                            ></el-input>
                                            <span class="rangeMsgTip">
                                                {{
                                                switchStyleFun(subItem)[
                                                "rangeMsgTip"
                                                ]
                                                }}
                                            </span>
                                            <span class="validValTip">
                                                {{
                                                switchStyleFun(subItem)[
                                                "alertMsg"
                                                ]
                                                }}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                                <div v-else>
                                    <!-- 起搏器复选框按钮 -->
                                    <div v-if="parentItem.itemCode == selfTmpCode.PACEMAKER_TMP">
                                        <p class="item-title">
                                            {{ parentItem.itemName }}
                                            {{
                                                parentItem.itemUnit
                                                ? parentItem.itemUnit
                                                : ""
                                            }}
                                        </p>
                                        <ul>
                                            <li
                                                v-for="(
                                                    paceMarkItem, pm
                                                ) in parentItem.signList"
                                                :key="pm"
                                                class="tempWrap"
                                            >
                                                <input
                                                    type="checkbox"
                                                    v-model="paceMarkItem.value"
                                                    v-direction="{
                                                        x: pm,
                                                        y: parentInd,
                                                    }"
                                                    @change="checkBoxFn(paceMarkItem, pm, selfTmpCode.HEARTRATE_TMP)"
                                                    class="checkboxTwbs"
                                                />
                                            </li>
                                        </ul>
                                    </div>
                                    <!-- 呼吸机复选框按钮 -->
                                    <div v-else-if="parentItem.itemCode == selfTmpCode.RESPIRATOR_TMP">
                                        <p class="item-title">
                                            {{ parentItem.itemName }}
                                            {{
                                                parentItem.itemUnit
                                                ? parentItem.itemUnit
                                                : ""
                                            }}
                                        </p>
                                        <ul>
                                            <li
                                                v-for="(
                                                    respirat, pm
                                                ) in parentItem.signList"
                                                :key="pm"
                                                class="tempWrap"
                                            >
                                                <input
                                                    type="checkbox"
                                                    v-model="respirat.value"
                                                    v-direction="{
                                                        x: pm,
                                                        y: parentInd,
                                                    }"
                                                    @change="checkBoxFn(respirat,pm, selfTmpCode.BREATHING_TMP)"
                                                    class="checkboxTwbs"
                                                />
                                            </li>
                                        </ul>
                                    </div>
                                    <div v-else>
                                        <p class="item-title">
                                            {{ parentItem.itemName }}
                                            {{
                                            parentItem.itemUnit
                                            ? parentItem.itemUnit
                                            : ""
                                            }}
                                        </p>
                                        <ul>
                                            <li
                                                v-for="(
                                                    subItem, index
                                                ) in parentItem.signList"
                                                :key="index"
                                            >
                                                <el-input
                                                    :class="
                                                        switchStyleFun(subItem)
                                                            .colorTip
                                                    "
                                                    type="text"
                                                    v-direction="{
                                                        x: index,
                                                        y: parentInd,
                                                    }"
                                                    @contextmenu.prevent.native="rowRightClick($event, subItem)"
                                                    v-model="subItem.value"
                                                    @input="
                                                        subItem.value = numCheck(
                                                            subItem.value
                                                        )
                                                    "
                                                    @keyup.enter.native="
                                                        subItem.value = numCheck(
                                                            subItem.value
                                                        )
                                                    "
                                                ></el-input>
                                                <span class="rangeMsgTip">
                                                    {{
                                                    switchStyleFun(subItem)[
                                                    "rangeMsgTip"
                                                    ]
                                                    }}
                                                </span>
                                                <span class="validValTip">
                                                    {{
                                                    switchStyleFun(subItem)[
                                                    "alertMsg"
                                                    ]
                                                    }}
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                   
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="bottomDiv">
                        <!-- 其他护理项目 -->
                        <el-row>
                            <el-col :span="10" class="otherItems">
                                <p class="otherTitle">
                                    其他护理项目
                                    <span class="itemTip">（{{signInpTip}}）</span>
                                </p>
                                <p class="otherItemBox">
                                    <el-form-item class="demo-inline" :label="item.itemName+'：'"  v-for="(
                                        item, otherInd
                                    ) in pageStructure.footerDataList"
                                    :key="otherInd">
                                        <div
                                            class="otherInpBox"
                                            style="display: flex"
                                            v-for="(
                                                signItemIpt, signInd
                                            ) in item.signList"
                                            :key="signInd"
                                            @click="otherClickHandler(signItemIpt)"
                                        >
                                            <el-input
                                                @input="checkInputStyle(signItemIpt)"
                                                v-model="signItemIpt.value"
                                                :value="signItemIpt.value"
                                                :readonly="selfTmpCode.DRUGallERGY == signItemIpt.itemCode ? true : false"
                                                :placeholder="signItemIpt.itemName"
                                                @contextmenu.prevent.native="rowRightClick($event, signItemIpt)"
                                            >
                                                <template :slot="selfTmpCode.DRUGallERGY == signItemIpt.itemCode? '':'append'" >{{ item.itemUnit ? item.itemUnit : "" }}</template>
                                            </el-input>
                                            <span class="allergyTipBox" v-if="selfTmpCode.DRUGallERGY == signItemIpt.itemCode && pageStructure.allergyFlag == 1">(+)</span>
                                            <span class="rangeMsgTip">
                                                {{
                                                otherItemsValid(signItemIpt)[
                                                "rangeMsgTip"
                                                ]
                                                }}
                                            </span>
                                            <!-- <div
                                                class="otherItemUnit"
                                            >{{ item.itemUnit ? item.itemUnit : "" }}</div> -->
                                        </div>
                                    </el-form-item>
                                </p>
                            </el-col>
                            <el-col :span="14" class="eventsDiv">
                                <p class="otherTitle">护理事件</p>
                                <div class="eventBox">
                                    <div class="eventBoxTitle">
                                        <p>事件名称</p>
                                        <p>发生时间</p>
                                    </div>
                                    <div class="newOrtherItemBox">
                                        <div
                                            class="newOrtherItemsDiv"
                                            v-for="(item, index) in pageStructure.evtList"
                                            :key="index"
                                        >
                                            <el-select
                                                :editable="false"
                                                @clear="eventClear(item, index)"
                                                v-model="item.evtCode"
                                                placeholder="请选择"
                                                class="newotherItemsselect"
                                                @change="evtListChange(item)"
                                            >
                                                <el-option
                                                    v-for="items in eventsDataOpation"
                                                    :key="items.value"
                                                    :label="items.label"
                                                    :value="items.value"
                                                ></el-option>
                                            </el-select>
                                            <div class="newOrtherTimePicker">
                                                <el-time-picker
                                                    :class="warningBorderFn(item).borCol"
                                                    :editable="false"
                                                    :clearable="false"
                                                    v-model="item.dtHappenedStr"
                                                    class="newotherItemsInput"
                                                    type="datetime"
                                                    placeholder="选择时间"
                                                    value-format="HH:mm"
                                                    format="HH:mm"
                                                ></el-time-picker>
                                                <span class="newOrtherTimeTip">
                                                    {{
                                                    warningBorderFn(item).alertMsg
                                                    }}
                                                </span>
                                            </div>
                                            <template v-if="true">
                                               <div>
                                                    <img
                                                        class="deleteButton"
                                                        src="../tempImg/subtract.png"
                                                        @click="
                                                            deleteEventsData(item, index)
                                                        "
                                                    >
                                                    <img
                                                        class="addSave"
                                                        src="../tempImg/addItem.png"
                                                        @click="addEventsData(index)"
                                                    >
                                               </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                
            </el-form>
            
            <div class="tempBtn">
                <div slot="footer" class="tempFooter">
                    <el-button @click="hideDialog">取 消</el-button>
                    <el-button type="primary" :loading="saveLoading" @click="saveInfo()">确 定</el-button>
                </div>
            </div>
        </el-dialog>
        <!-- 引用护理体征 -->
        <el-dialog
            title="引用护理体征"
            custom-class="tempQuoteSignDialog"
            v-if="quoteSignShow"
            :visible.sync="quoteSignShow"
            :close-on-click-modal="false"
            width="70%"
            v-dialogDrag
        >
            <QuoteSign
                :pageStructure="pageStructure"
                :curDate="curDate"
                :hourList="pageStructure.hourList"
                :temParams="temParams"
                @addToTemp="addToTemp"
            ></QuoteSign>
        </el-dialog>

        <!-- 签名确认 -->
        <HeadNurse
            v-if="showSignName"
            :userInfo="userInfo"
            @hasPower="hasPower"
            :onlyHeadNurse="true"
        ></HeadNurse>
        <!-- <el-form v-if="showSignName" label-position="left" label-width="0" :model="signForm" ref="signForm">
            <el-dialog title="授权确认" custom-class="signNameDialog" :close-on-click-modal="false" :visible.sync="showSignName" width="480px">
                <p style="color:#FF9900; padding-left:8px">请录入护士长账号信息授权确认！</p>
                <signName :signForm="signForm"></signName>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="submitSignForm('signForm')">确 定</el-button>
                </span>
            </el-dialog>
        </el-form>-->
        <el-dialog
            custom-class="tempItemAdjust"
            title="体温单项目调整"
            :visible.sync="itemAdjustVisible"
            width="600px"
            v-dialogDrag
            :close-on-click-modal="false"
        >
            <el-table
                :header-cell-style="tableTitleStyle"
                :cell-style="cellStyle"
                ref="multipleTable"
                class="multipleTable"
                border
                :data="tableData"
                tooltip-effect="dark"
                style="width: 100%"
                height="600px"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" :selectable="selectEnable"></el-table-column>
                <el-table-column label="项目名称" prop="itemName"></el-table-column>
                <el-table-column prop="itemUnit" label="单位" width="130"></el-table-column>
                <el-table-column></el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="itemAdjustVisible = false">取 消</el-button>
                <el-button type="primary" @click="addTempItem">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog
            v-if="tempShow"
            custom-class="tempDialog"
            title="体温单"
            :visible.sync="tempShow"
            :fullscreen="true"
            :modal="false"
            :lock-scroll="true"
            v-dialogDrag
        >
            <TempMain
                :onlyRead="true"
                :scalableTemParam="scalableTemParam"
                :temParams="temParams"
                :key="currentDateTime"
                :showBtnMore="false"
                @afterPrint="afterPrint"
                ></TempMain>
        </el-dialog>
        <HisAddAllergy :allergyForm.sync="allergyForm" ref="HisAddAllergy"></HisAddAllergy>
    </div>
</template>
<script>
const tempUrl = window.globalUrl.tempUrl;
const hlwsSerUrl = window.globalUrl.hlwsServiceUrl;
const findVisitTemperatureVitalList =
    tempUrl + "/timeaxis/tpnew/findVisitTemperatureVitalList"; // 患者体温单体征list
const batchModifyVisitTemperatureVital =
    tempUrl + "/timeaxis/tpnew/batchModifyVisitTemperatureVital"; // 批量为患者增减体温单体征项
// const headNurseLogin = hlwsSerUrl + "emr/portal/headNurseLogin"; // 体温单项目调整护士长登录
const getVitalSignNoneKeysList =
    hlwsSerUrl + "emr/common/getVitalSignNoneKeysList"; // 获取体征未查快捷键标志
const getTemperatureControList =
    tempUrl + "/timeaxis/tpnew/getTemperatureControList"; // 获取体温控件下拉列表
const findEvtDictList = tempUrl + "/timeaxis/util/findEvtDictList"; // 事件列表
const modifyVisitVitalsign = tempUrl + "/timeaxis/tpnew/modifyVisitVitalsign"; // 保存患者体征和事件
const findVitalsignItemList = tempUrl + "/timeaxis/tpnew/findVitalsignItemList"; // 体征项目列表
const getVisitTemperatureDataByDay =
    tempUrl + "/timeaxis/tpnew/getVisitTemperatureDataByDay"; // 反显患者某一天的体温单数据
const getTemperatureControlListByIdDept =
    tempUrl + "/timeaxis/tpnew/getTemperatureControlListByIdDept"; // 获取部门权限下的体温控件列表

import { mapGetters } from "vuex";
import TMPCODE from "../tmpcode.js"; //引用模块进来
// import signName from "@/components/page/BaseService_WEB/signName/signName";
// import HeadNurse from "@/components/page/Common_WEB/temperature/tempLineChart/headNurseSignName";
import bus from "@/components/common/bus.js";
// import QuoteSign from "../quoteSign/quoteSign";
// import HisAddAllergy from '@/components/page/Common_WEB/hisAddAllergy/hisAddAllergy.vue';  //过敏史组件
export default {
    name: "tempInput",
    props: {
        tempInputShow: {
            type: Boolean
        },
        inpTemDate: {
            defalut: "",
            type: String
        },
        temParams: {
            defalut: {},
            type: Object
        },
        curDate: {
            defalut: "",
            type: String
        }
    },
    data() {
        return {
            //过敏史数据
            allergyForm: {
                allergyDialogVisible: false,
                idPat: '',
                ppatList: [],            //患者过敏列表
                allAllergyDataStr: '',   //过敏史页面展示字符串
                sdAllergyType: '',   //过敏类型
                allergyDate: '',     //过敏时间
                allergyName: '',     //过敏源名称
                sdAllergyDegree: '', //过敏程度
                allergyReaction: '', //过敏反应
                description: '',     //备注
                birthDay: ''
            },
            visibles: false,
            highLowIndex: null,
            xyIndex: null,
            twIndex: null,
            // 界面结构渲染
            pageStructure: {
                hourList: [], // 偏移量
                footerDataList: [], // 底部
                mainDataList: [], // 主要项目区域
                titleBarDataList: [], // 抬头区
                eventList: [
                    {
                        idEvtRecord: "",
                        evtCode: "",
                        dtHappenedStr: "",
                        evtName: ""
                    }
                ] // 事件列表
            },
            pageStructureCopy: {},
            eventsDataOpation: [], // 事件列表数据
            tempDialogShow: false, // 体温弹框显示与否
            bloodPreDiaShow: false, // 血压弹框显示与否
            bloodPreHigh: "", // 高压
            bloodPreLow: "", // 低压
            patEntryForm: {
                idVisit: "", //
                sdVisitType: "", // 标识01门诊还是03住院
                idPat: "", //
                deptName: "", // 科室名字
                idDept: "", // 科室id
                hisUserName: "", //
                hisUserId: "", //
                recordDt: "", //
                vitalsignList: [], // 体征项目数据
                eventList: [], // 护理事件数据
                eventRemoveList: [] // 事件删除数据主键
            }, // 单患者录入form
            selfTmpCode: {}, //体温单常量
            date: "",
            columns: 6, //代表几列
            radio: "3", //默认四小时输入
            wdType: "1", //温度选择默认值
            wdTypeList: [], // 温度类型
            originEvtLIst: [], // 存储原始护理事件
            dialogClose: this.tempInputShow,
            tempSignWarn: {
                highValue: null,
                lowValue: null
            }, // 体温输入限制提醒
            effectRangeFlag: false,
            saveLoading: false,
            // 时间校验
            pickerOptions: {
                disabledDate: time => {
                    var dateTimebegin = new Date(this.curDate);
                    return time.getTime() > dateTimebegin.getTime();
                },
                shortcuts: [
                    {
                        text: "今天",
                        onClick(picker) {
                            picker.$emit("pick", new Date());
                        }
                    },
                    {
                        text: "昨天",
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24);
                            picker.$emit("pick", date);
                        }
                    },
                    {
                        text: "一周前",
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit("pick", date);
                        }
                    }
                ]
            },
            quoteSignShow: false,
            dialogLoading: false,
            userInfo: this.getUserStorage(), //
            // 签名确认
            showSignName: false,
            signForm: {
                userName: "",
                password: ""
            },
            tableData: [], // 患者体温单体征list
            multipTabParams: {
                idVisit: "",
                addItemCodeList: [],
                removeItemCodeList: []
            },
            itemAdjustVisible: false,
            btnDisabled: false, // 前一天，后一天禁用
            tableTitleStyle: {
                fontSize: "14px",
                color: "#1F1F1F",
                padding: "7px 0",
                height: "45px",
                background: "#f5f5f5"
            },
            cellStyle: {
                fontSize: "14px",
                color: "#1F1F1F",
                height: "40px"
            },
            signShortcuts: [],
            signInpTip: "", // 录入数据提示文字
            dicDataObj: {},
            specKeysArr: [],
            otherKeysArr: [],
            dialogHeight: null,
            sysConfigData: {}, // 系统参数
            allergyFlag: "", // 过敏标识1 有药物过敏史记录  0 无药物过敏史记录 用于体温单录入页面过敏史的 (+) 标记
            checkedCodeArr: [TMPCODE.NORISE_TMP, TMPCODE.PACEMAKER_TMP, TMPCODE.RESPIRATOR_TMP],
            filterItem: [TMPCODE.PACEMAKER_TMP, TMPCODE.RESPIRATOR_TMP], // 过滤呼吸机、起搏器
            currentDateTime: new Date().getTime(),
            tempShow: false,
            scalableTemParam: {
                showTempInp: false,
            }
        };
    },
    computed: {
        // watchRecordDt() {
        //     return this.patEntryForm.recordDt;
        // }
    },
    watch: {
        //监听时间段选择
        radio: {
            handler: function(val, oldval) {
                if (val == "1") {
                    this.columns = 24;
                } else if (val == "2") {
                    this.columns = 12;
                } else if (val == "3") {
                    this.columns = 6;
                }
            },
            deep: true
        },
        "patEntryForm.recordDt": {
            handler: function(val, oldval) {
                this.patEntryForm.recordDt = val ? val : this.curDate;
                // 根据日期的变化重新获取体征信息数据
                this.getVisitTempDataByDay(this.patEntryForm.recordDt);
            },
            deep: true
        },
        "pageStructure.titleBarDataList": {
            handler: function(val, oldval) {
                if (this.pageStructure.newFlag == 0) {
                    this.comparDataModifi(val);
                }
            },
            deep: true
        },
        "pageStructure.mainDataList": {
            handler: function(val, oldval) {
                if (this.pageStructure.newFlag == 0) {
                    this.comparDataModifi(val);
                }
            },
            deep: true
        },
        "pageStructure.footerDataList": {
            handler: function(val, oldval) {
                if (this.pageStructure.newFlag == 0) {
                    this.comparDataModifi(val);
                }
                
            },
            deep: true
        }
    },
    // filters: {
    //     valueFormat: function(arg, ) {
    //         let value = "";
    //         value = this.negativeConversion(arg);
    //         return value;
    //     }
    // },
    created() {
        this.userInfo = this.getUserStorage();
        this.patEntryForm.idPat = this.temParams.idPat;
        this.patEntryForm.idVisit = this.temParams.idVisit;
        this.patEntryForm.sdVisitType = this.temParams.sdVisitType;
        this.patEntryForm.idDept = this.temParams.idDept;
        this.patEntryForm.deptName = this.temParams.deptName;
        this.patEntryForm.hisUserId = this.temParams.hisUserId;
        this.patEntryForm.hisUserName = this.temParams.hisUserName;
        this.patEntryForm.recordDt = this.inpTemDate;
        this.getDicData();
        this.getSpecKeysArr();
        this.getVitalSignKeysList();
        this.getTempControlListByIdDept();
        this.findNurseEvt();
        this.switchBtnDis();
        this.selfTmpCode = TMPCODE;
        bus.$off("initTempData");
        bus.$on("initTempData", obj => {
            this.patEntryForm.recordDt = obj.inpTemDate
                ? obj.inpTemDate
                : this.curDate;
            this.getVisitTempDataByDay(this.patEntryForm.recordDt);
        });
        this.findSignItemData();
        let direction = this.$getDirection();
        direction.on("keyup", function(e, val) {
            if (e.keyCode === 13 || e.keyCode === 39) {
                direction.next();
            }
            if (e.keyCode === 37) {
                direction.previous();
            }
            if (e.keyCode === 38) {
                direction.previousLine();
            }
            if (e.keyCode === 40) {
                direction.nextLine();
            }
        });
    },
    mounted() {
        this.$nextTick(()=> {
            this.addEventLisHeight();
            window.addEventListener("resize", this.addEventLisHeight);

        })
    },
    methods: {
        afterPrint() {
            this.currentDateTime = new Date().getTime();
        },
        // 起搏器、呼吸机选择事件
        checkBoxFn(item, ind, type) {
            // 起搏器
            let value = "";
            this.pageStructure.mainDataList.forEach(dataList=> {
                // 心率
                if (dataList.itemCode == type) {
                    value = item.value ? '1' : '0';
                    this.$set(dataList.signList[ind], 'equipFlag', value);
                } else if (dataList.itemCode == type) {
                    // 呼吸机
                    value = item.value ? '1' : '0';
                    this.$set(dataList.signList[ind], 'equipFlag', value);
                }
                
            })
        },
        // 监听窗口高度设置弹框的高度
        addEventLisHeight() {
            if (!document.documentElement.clientHeight) return;
            let clientHeight = document.documentElement.clientHeight;
            this.dialogHeight = clientHeight - 72;
            let elFormHeight = null;
            setTimeout(() => {
                elFormHeight = this.dialogHeight - 122;
                if (document.querySelector('.tempInputDialog')) {
                    document.querySelector('.tempInputDialog').style.height = this.dialogHeight + 'px';
                }
                if(document.querySelector('.el-form')) {
                    document.querySelector('.el-form').style.height = elFormHeight + 'px';
                }
                if(document.querySelector('.mainData')) {
                    document.querySelector('.mainData').style.height = elFormHeight - 51 + 'px';
                }
            }, 500)
        },
        // 对比数据变化
        isDataChange() {
            let res = false;
            if (
                Object.keys(this.pageStructureCopy).length > 0 &&
                JSON.stringify(this.pageStructureCopy) !=
                    JSON.stringify(this.pageStructure)
            ) {
                res = true
            }
            return res;
        },
        // 对比数据是否是修改
        comparDataModifi(val) {
            val.map(item=> {
                item.signList.map(li=> {
                    // li.edit = false;
                    this.$set(li, 'edit', false)
                    if (item.itemCode == this.selfTmpCode.HEARTRATE_TMP || item.itemCode == this.selfTmpCode.BREATHING_TMP) {
                        if (li.value !== li.oldValue || li.itemCode !== li.oldCode || li.oldEquipFlag != li.equipFlag) {
                            this.$set(li, 'edit', true)
                        }
                    }
                    if (li.value !== li.oldValue || li.itemCode !== li.oldCode) {
                        // li.edit = true;
                        this.$set(li, 'edit', true)
                        
                    }
                })
            })
        },
        // 引用护理体征
        quoteSign() {
            this.quoteSignShow = true;
        },
        /*项目调整
            如果当前登录人是病区护士长则默认打开项目调整弹框，否则弹出签名框进行签名
            showTemperatureVitalSet是否开启体温单加项 1 是 0 否
            userInfo  nurseManage
            如果不是护士长，需要弹窗登录
        */
        signProjectAdjust() {
            // this.showSignName = true;
            if (this.sysConfigData.showTemperatureVitalSet == 1) {
                if (
                    this.sysConfigData.nurseManage != 1
                ) {
                    this.showSignName = true;
                } else {
                    this.itemAdjustVisible = true;
                    this.findVisitTemperatureVitalList();
                }
            } else {
                this.$message({
                    type: "warning",
                    message: "您未开启体温单项目调整"
                });
            }
        },
        // 患者体温单的体征列表
        // tempUrl
        findVisitTemperatureVitalList() {
            let params = {
                idVisit: this.temParams.idVisit
            };
            this.$axios
                ._post(findVisitTemperatureVitalList, params)
                .then(res => {
                    if (res.success) {
                        this.tableData = res.data;
                        this.selectedTableItem();
                    }
                });
        },
        // 判断是否拥有编辑权限
        hasPower(info) {
            if (!info.show) {
                if (info.type == "cancel") {
                    this.showSignName = false;
                } else {
                    this.$message({
                        message: "您现在可以编辑了！",
                        type: "success"
                    });
                    setTimeout(() => {
                        this.showSignName = false;
                        this.itemAdjustVisible = true;
                        this.findVisitTemperatureVitalList();
                    }, 500);
                }
            } else {
                // 授权失败
            }
        },
        // 签名确认
        submitSignForm() {
            let params = {
                loginName: this.signForm.userName,
                password: this.$md5(this.signForm.password),
                idDept: this.userInfo.idDept
            };
            this.nurseLoginSub(params);
        },
        selectEnable(row, index) {
            if (row.readOnly == 1) {
                return false;
            } else {
                return true;
            }
        },
        handleSelectionChange(selctArr) {
            this.multipTabParams.addItemCodeList = [];
            let arr = selctArr.filter(item => item.readOnly != 1);
            arr.forEach(list => {
                this.multipTabParams.addItemCodeList.push(list.itemCode);
            });
        },
        // 根据数据返回结果展示体温单项目---title项目在”项目调整“中默认勾选，且不能去掉
        // readOnly = 1 只读体温单体征，不能改 只读的选中态
        // readOnly = 0 可修改的体温单体征 选中态，可以取消
        // readOnly = 3 额外体温单，不是患者的，但是是可以追加的 非选中态
        selectedTableItem() {
            this.$nextTick(() => {
                this.tableData.forEach(row => {
                    if (row.readOnly == 1 || row.readOnly == 0) {
                        this.$refs.multipleTable.toggleRowSelection(row, true);
                    }
                });
            });
        },
        // 批量为患者增减体温单体征项
        addTempItem() {
            let params = {};
            this.multipTabParams.removeItemCodeList = [];
            this.tableData.forEach(list => {
                if (list.readOnly != 1) {
                    if (
                        !this.multipTabParams.addItemCodeList.includes(
                            list.itemCode
                        )
                    ) {
                        this.multipTabParams.removeItemCodeList.push(
                            list.itemCode
                        );
                    }
                }
            });
            params = {
                idVisit: this.temParams.idVisit,
                addItemCodeList: this.multipTabParams.addItemCodeList,
                removeItemCodeList: this.multipTabParams.removeItemCodeList
            };
            this.$axios
                ._post(batchModifyVisitTemperatureVital, params)
                .then(res => {
                    this.$message({
                        type: `${res.success ? "success" : "warning"}`,
                        message: res.message
                    });
                    if (res.success) {
                        this.itemAdjustVisible = false;
                        this.getVisitTempDataByDay(this.patEntryForm.recordDt);
                    }
                });
        },
        // 移动端登录，体温单授权签名接口hlwsSerUrl
        nurseLoginSub(params) {
            this.$axios._post(headNurseLogin, params).then(res => {
                if (res.success) {
                    this.$message({
                        type: "success",
                        message: res.message
                    });
                    setTimeout(() => {
                        this.showSignName = false;
                        this.itemAdjustVisible = true;
                        this.findVisitTemperatureVitalList();
                    }, 500);
                } else {
                    this.$message({
                        type: "warning",
                        message: res.message
                    });
                }
            });
        },
        // 上一天/下一天时间切换
        async switchDate(type) {
            let newDate = "";
            if (type == "up") {
                newDate = this.getDateStr(this.patEntryForm.recordDt, -1);
            } else if (type == "next") {
                newDate = this.getDateStr(this.patEntryForm.recordDt, 1);
            }
            // 对比数据变化
            if (this.isDataChange() && newDate) {
                this.$confirm("数据发生变化，是否保存？", "提示", {
                    distinguishCancelAndClose: true,
                    confirmButtonText: "是",
                    cancelButtonText: "否"
                })
                    .then(async () => {
                        // 保存数据
                        await this.saveInfo(false)
                        this.patEntryForm.recordDt = newDate;
                        this.switchBtnDis();
                    })
                    .catch(action => {
                        // if (action === "cancel") {
                        //     this.$emit("closedown")
                        // }
                        this.patEntryForm.recordDt = newDate;
                        this.switchBtnDis();
                    });
            } else {
                this.patEntryForm.recordDt = newDate;
                this.switchBtnDis();
            }
            
        },
        // 切换上一天，下一天禁用状态
        switchBtnDis() {
            if (this.curDate == this.patEntryForm.recordDt) {
                this.btnDisabled = true;
            } else {
                this.btnDisabled = false;
            }
        },
        addToTemp(info) {
            // info = {
            //     "Temperature":[{
            //         index:1,
            //         value:36.5
            //     },{
            //         index:2,
            //         value:38.5
            //     }]
            // };
            this.quoteSignShow = false;
            for (let i in info) {
                // 主要护理项目
                this.pageStructure.mainDataList.forEach(list => {
                    // 对于体温项目单独处理,会包含多个类型
                    if (
                        list.itemCode.indexOf("Temperature") > -1 &&
                        i.indexOf("Temperature") > -1
                    ) {
                        let idx = JSON.stringify(this.wdTypeList).indexOf(i);
                        if (idx > -1) {
                            let label = "";
                            this.wdTypeList.forEach(v => {
                                if (i == v.value) {
                                    label = v.label;
                                }
                            });
                            // console.log(info[i]);
                            info[i].forEach(data => {
                                // console.log(list.signList[data.index]);
                                list.signList[data.index].itemCode = i;
                                list.signList[data.index].itemName = label;
                                list.signList[data.index].value = data.value;
                            });
                        }
                    } else if (
                        list.itemCode == "BloodPressure" &&
                        list.itemCode != i &&
                        (i == "SystolicPressure" || i == "SiastolicPressure")
                    ) {
                        info[i].forEach(data => {
                            list.signList[data.index].g = data.g;
                            list.signList[data.index].d = data.d;
                            list.signList[data.index].value = data.value;
                        });
                    } else if (list.itemCode == i) {
                        info[i].forEach(data => {
                            list.signList[data.index].value = data.value;
                        });
                    }
                });
                // 其他护理项目
                this.pageStructure.footerDataList.forEach(list => {
                    if (list.itemCode == i) {
                        let len = info[i].length - 1;
                        list.signList[0].value = info[i][len].value;
                    }
                });
            }
        },
        // 其他护理项目输入校验
        checkInputStyle(inputValue) {
            if (this.projectConfigList && this.projectConfigList.length) {
                this.projectConfigList.forEach(item => {
                    // 为数字类型进行校验
                    if (inputValue.itemCode == item.itemCode) {
                        this.checkInputData(inputValue, item);
                    }
                });
            }
        },
        // 其他护理项目非合法值提示
        otherItemsValid(inputValue) {
            let rangeMsgTip = "";
            if (this.projectConfigList && this.projectConfigList.length) {
                this.projectConfigList.forEach(item => {
                    // 为数字类型进行校验
                    if (item.dataType == 1) {
                        if (inputValue.itemCode == item.itemCode) {
                            inputValue.effectRangeFlag = false;
                            if (inputValue.value == "-") {
                                inputValue.effectRangeFlag = true;
                                rangeMsgTip = "请输入合法数值";
                            }
                        }
                    }
                });
            }
            return {
                rangeMsgTip: rangeMsgTip
            };
        },
        getCaption(obj) {
            var index = obj.lastIndexOf("-");
            if (index != -1) {
                return 1;
            }
        },
        // 限制数字位数不能超过20位
        checkInputData(inputValue, data) {
            if (data.dataTypeDesc == "数字" || data.dataType == 1) {
                let str = inputValue.value;
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
                str = str.match(/^\-?\d*(\.?\d{0,4})/g)[0] || null;
                //正则替换，保留数字和小数点
                // str = str.match(/^\d*(\.?\d{0,4})/g)[0] || null;
                // str = str.match(/^\-?\d*(\.?\d{0,4})/g)[0] || null;
                if (str && str.length > 20) {
                    inputValue.value = str.substr(0, 20);
                } else {
                    inputValue.value = str;
                }
            }
        },
        // 添加样式方法
        switchStyleFun(twItem, type) {
            let obj = [];
            if (type == "d") {
                if (this.projectConfigList && this.projectConfigList.length) {
                    this.projectConfigList.forEach(item => {
                        // 数据类型为1时（数字时）校验高低值。
                        if (item.dataType == 1) {
                            if (item.itemCode == twItem.dItemCode) {
                                obj = this.checkValidValueFun(
                                    twItem,
                                    item,
                                    type
                                );
                            }
                        }
                    });
                }
            } else if (type == "g") {
                if (this.projectConfigList && this.projectConfigList.length) {
                    this.projectConfigList.forEach(item => {
                        // 数据类型为1时（数字时）校验高低值。
                        if (item.dataType == 1) {
                            if (item.itemCode == twItem.gItemCode) {
                                obj = this.checkValidValueFun(
                                    twItem,
                                    item,
                                    type
                                );
                            }
                        }
                    });
                }
            } else {
                if (this.projectConfigList && this.projectConfigList.length) {
                    this.projectConfigList.forEach(item => {
                        // 数据类型为1时（数字时）校验高低值。
                        if (item.dataType == 1) {
                            if (item.itemCode == twItem.itemCode) {
                                obj = this.checkValidValueFun(twItem, item);
                            }
                        }
                    });
                }
            }
            return obj;
        },
        // 校验主要护理项目，根据输入的值先判断其是否在有效范围内，再判断其输入的值是否超过高值或低于低值。
        checkValidValueFun(twItem, vals, type) {
            let val = "";
            if (type == "g") {
                val = twItem.g;
            } else if (type == "d") {
                val = twItem.d;
            } else {
                val = twItem.value;
            }
            let effCoverageMin = null,
                effCoverageMax = null,
                highVal = null,
                lowVal = null;
            let obj = {
                alertMsg: "",
                rangeMsgTip: ""
            };
            effCoverageMin = vals.minValue ? vals.minValue : null;
            effCoverageMax = vals.maxValue ? vals.maxValue : null;
            lowVal = vals.lowValue ? vals.lowValue : null;
            highVal = vals.highValue ? vals.highValue : null;
            twItem.effectRangeFlag = false;
            if (val == "-") {
                twItem.effectRangeFlag = true;
                return {
                    rangeMsgTip: "请输入合法数值"
                };
            }
            if (
                val &&
                val.indexOf("-") < 0 &&
                !Object.keys(this.dicDataObj).includes(val)
            ) {
                if (effCoverageMax || effCoverageMin) {
                    if (
                        Number(val) >= Number(effCoverageMin) &&
                        Number(val) <= Number(effCoverageMax)
                    ) {
                        twItem.effectRangeFlag = false;
                        // 输入值大于高值则边框变红
                        if (Number(val) > Number(highVal)) {
                            obj.alertMsg = vals.highAlertMsg; // 添加颜色提示
                            return {
                                colorTip: ["fzColorHigh"],
                                alertMsg: obj.alertMsg
                            };
                        } else if (Number(val) < Number(lowVal)) {
                            obj.alertMsg = vals.lowAlertMsg; // // 添加颜色提示
                            return {
                                colorTip: ["fzColorlow"],
                                alertMsg: obj.alertMsg
                            };
                        }
                    } else {
                        // 提示具体有效范围，然后边框颜色有提示
                        obj.rangeMsgTip = vals.minMaxDesc
                            ? "有效范围" + vals.minMaxDesc
                            : "";
                        twItem.effectRangeFlag = true;
                        return {
                            colorTip: ["fzColF56C6C", "bgColF56C6C"],
                            rangeMsgTip: obj.rangeMsgTip
                        };
                    }
                } else {
                    // 输入值大于高值则边框变红
                    twItem.effectRangeFlag = false;
                    if (!highVal || !lowVal) {
                        return {
                            colorTip: [""],
                            alertMsg: ''
                        };
                    } else {
                        if (Number(val) > Number(highVal)) {
                            obj.alertMsg = vals.highAlertMsg; // 添加颜色提示
                            return {
                                colorTip: ["fzColorHigh"],
                                alertMsg: obj.alertMsg
                            };
                        } else if (Number(val) < Number(lowVal)) {
                            obj.alertMsg = vals.lowAlertMsg; // 添加颜色提示
                            return {
                                colorTip: ["fzColorlow"],
                                alertMsg: obj.alertMsg
                            };
                        }
                    }
                    
                }
            } else {
                twItem.effectRangeFlag = false;
            }
            return obj;
        },
        // 获取体征项目列表，设置体温上下限提醒，高低值，高红，低蓝
        findSignItemData() {
            let query = {
                itemCode: "",
                itemDesc: "",
                useRange: "",
                sdEntryFrequency: "",
                batchStatus: null,
                sdOwnerRightType: "",
                idDeptList: [],
                enabled: 1
            };
            this.$axios._post(findVitalsignItemList, query).then(res => {
                if (res.success) {
                    // 有效范围minMaxDesc、 高低值lowHighDesc
                    this.projectConfigList = res.data;
                }
            });
        },
        alertMessAge(msg, type) {
            this.$message({
                message: msg,
                type: type
            });
        },

        //主数据
        //其他项目操作
        addNewotherItems() {
            this.form.newOrtherItems.push({
                id: "",
                name: "",
                code: "",
                value: "",
                sdUnit: "",
                sdMrDataName: "",
                time: 0
            });
        },
        deleteNewOrtherItems(index) {
            this.form.newOrtherItems.splice(index, 1);
        },
        //提交
        /* newFlag 1 证明是第一次录。此时，全量保存。不存在修改标记。
        newFlag 0 不是第一次录入，保存之前需要判断，只保存有修改的数据
        修改的数据包括从空变成有值的，从有值变成空的，有值的值改变。 */
        async saveInfo(close = true) {
            this.patEntryForm.vitalsignList = [];
            let effectRangeFlag = false,
                evtFlag = false, gyFlag = false,dyFlag = false;
            let signList = [],
                xyArr = [],
                gArr = {
                    signList: []
                },
                dArr = {
                    signList: []
                };
            // 判断护理事件修改时根据主键id是否有删除项，有的话保存事件主键id，并传给后端。
            this.pageStructure.evtList.forEach((evtItem, evtInd) => {
                if (evtItem.evtCode && evtItem.dtHappenedStr == "") {
                    evtFlag = true;
                }
            });
            this.patEntryForm.eventList = this.pageStructure.evtList;
            this.pageStructure.mainDataList.map((v, ind) => {
                // 如果体征项目为体温不升（checkbox），数据需要处理
                if (this.checkedCodeArr.includes(v.itemCode)) {
                    v.signList.map((signItem, index) => {
                        signItem.value = signItem.value ? 1 : 0;
                    });
                } else if (v.itemCode == this.selfTmpCode.BLOOD_PRESSURE) {
                    v.signList.map((signItem, signInd) => {
                        if (signItem.effectRangeFlag) {
                            effectRangeFlag = true;
                        }
                        gArr.signList.push({
                            itemCode: signItem.gItemCode,
                            value: signItem.g,
                            edit: signItem.edit,
                            time: signItem.time,
                            idVisitElementDetailSync:
                                signItem.idVisitElementDetailSync
                        });
                        dArr.signList.push({
                            itemCode: signItem.dItemCode,
                            value: signItem.d,
                            time: signItem.time,
                            edit: signItem.edit,
                            idVisitElementDetailSync:
                                signItem.idVisitElementDetailSync
                        });
                        if (gArr.signList[signInd].value && !dArr.signList[signInd].value) {
                            dyFlag = true;
                        } else if (!gArr.signList[signInd].value && dArr.signList[signInd].value) {
                            gyFlag = true;
                        }
                    });                    
                }
                if (v.itemCode != this.selfTmpCode.BLOOD_PRESSURE && !this.filterItem.includes(v.itemCode)) {
                   let obj = this.dealEditData(this.filterProperty(v));
                    if (obj) {
                        this.patEntryForm.vitalsignList.push(obj);
                    }
                }
            });
            if (this.dealEditData(gArr)){
                this.patEntryForm.vitalsignList = [
                    ...this.patEntryForm.vitalsignList,
                    gArr
                ];
            }
            if (this.dealEditData(dArr)){
                this.patEntryForm.vitalsignList = [
                    ...this.patEntryForm.vitalsignList,
                    dArr
                ];
            }
            this.pageStructure.footerDataList.map((val, index) => {
                let obj = this.dealEditData(this.filterProperty(val));
                if (obj) {
                    this.patEntryForm.vitalsignList.push(obj);
                }
                
            });
            this.pageStructure.titleBarDataList.map((val, index) => {
                let obj = this.dealEditData(this.filterProperty(val));
                if (obj) {
                    this.patEntryForm.vitalsignList.push(obj);
                }
            });
            this.patEntryForm.vitalsignList.map((v, index) => {
                signList = v.signList.map((signItem, signInd) => {
                    if (signItem.effectRangeFlag) {
                        effectRangeFlag = true;
                    }
                    let { itemName, ...params } = signItem;
                    return params;
                });
                v.signList = signList;
            });
            if (dyFlag || gyFlag) {
               let tip =  dyFlag ? '请录入低压数据' : gyFlag ? '请录入高压数据' : '';
                this.$message({
                    type: "warning",
                    message: tip
                });
            } else if (effectRangeFlag) {
                this.$message({
                    type: "warning",
                    message: "数据录入有异常，请核对！"
                });
            } else if (evtFlag) {
                this.$message({
                    type: "warning",
                    message: "护理事件请选择时间！"
                });
            } else {
                this.patEntryForm.vitalsignList.map((v, index) => {
                    signList = v.signList.map((signItem, signInd) => {
                        let { effectRangeFlag, oldValue,oldCode, oldEquipFlag,edit,itemName, ...params } = signItem;
                        return params;
                    });
                    v.signList = signList;
                });
                this.saveLoading = true;
                // console.log(this.patEntryForm)
                return this.findModifyVisitsign(this.patEntryForm,close);
            }
        },
        // 处理只保存修改值，不包含新增
        dealEditData(dataObj) {
            let arr = [];
            if (this.pageStructure.newFlag == 0) {
                dataObj.signList.forEach(item=> {
                    if (item.edit) {
                        arr.push(item);
                    }
                    return arr;
                })
                dataObj.signList = arr;
                if (dataObj.signList.length) {
                    return dataObj;
                }
            } else {
                return dataObj;
            }
            
        },
        // 保存患者体征和事件
        async findModifyVisitsign(params, close) {
            return this.$axios._post(modifyVisitVitalsign, params).then(res => {
                if (res.success) {
                    this.$message({
                        type: "success",
                        message: res.message
                    });
                    this.saveLoading = false;
                    // if(close) {
                    //     this.$emit("closedown");
                    // }
                    // 保存成功后刷新数据
                    this.getVisitTempDataByDay(this.patEntryForm.recordDt);
                } else {
                    this.saveLoading = false;
                    this.$message({
                        type: "error",
                        message: res.message
                    });
                }
            });
        },
        beforeHideDialog(done) {
            // 对比数据变化
            if (this.isDataChange()) {
                this.$confirm("数据发生变化，是否保存？", "提示", {
                    distinguishCancelAndClose: true,
                    confirmButtonText: "是",
                    cancelButtonText: "否"
                })
                    .then(() => {
                        // 保存数据
                        this.saveInfo()
                        this.$emit("closedown")
                        done()
                    })
                    .catch(action => {
                        // if (action === "cancel") {
                        //     this.$emit("closedown")
                        // }
                        this.$emit("closedown")
                        done()
                    });
            } else {
                this.$emit("closedown")
                done()
            }
        },
        //关闭弹窗事件
        hideDialog() {
            // 对比数据变化
            if (this.isDataChange()) {
                this.$confirm("数据发生变化，是否保存？", "提示", {
                    distinguishCancelAndClose: true,
                    confirmButtonText: "是",
                    cancelButtonText: "否"
                })
                    .then(() => {
                        // 保存数据
                        this.saveInfo()
                        this.$emit("closedown")
                    })
                    .catch(action => {
                        // if (action === "cancel") {
                        //     this.$emit("closedown")
                        // }

                        this.$emit("closedown")
                    });
            } else {
                this.$emit("closedown")
            }

        },
        //清除空数据事件
        removeEmptyData(arr) {
            if (arr.length == 0) {
                return [];
            }
            let _arr = [];
            arr.map((item, index) => {
                if (item.value != "" && item.code != "") {
                    if (typeof item.value == "boolean") {
                        item.value = "1";
                        _arr.push(item);
                    } else {
                        _arr.push(item);
                    }
                }
            });
            return _arr;
        },
        // 体温点击弹出选择类型框
        tempTypeShowEvt(val, ind) {
            // this.twDialog = true;
            this.tempDialogShow = true;
            this.twIndex = ind;
            this.wdTypeList.map((v, index) => {
                if (val.itemCode == v.value) {
                    this.wdType = val.itemCode;
                }
            });
        },
        bloodPreShowEvt(val, ind) {
            this.visibles = true;
            this.xyIndex = ind;
            this.bloodPreDiaShow = true;
        },
        bloodPreInpEvt(e, ind) {
            let highValue = "",
                lowValue = "";
            // highValue = e.g ? e.g : "";
            // lowValue = e.d ? e.d : "";
            // if (!lowValue) {
            //     e.value = this.numberCheck(highValue);
            // } else {
            //     e.value = highValue + "/" + this.numberCheck(lowValue);
            // }
            if (ind == 0) {
                if (e.g < 0) {
                    e.d = e.g;
                }
                lowValue = e.d ? e.d : "";
                highValue = e.g ? e.g : "";
                if (!lowValue) {
                    e.value = this.numberCheck(highValue);
                } else {
                    e.value = this.numberCheck(highValue) + "/" + this.numberCheck(lowValue);
                }
                return highValue
            } else {
                if (e.d <0) {
                    e.g = e.d;
                }
                lowValue = e.d ? e.d : "";
                highValue = e.g ? e.g : "";
                if (!lowValue) {
                    e.value = this.numberCheck(highValue);
                } else {
                    e.value = this.numberCheck(highValue) + "/" + this.numberCheck(lowValue);
                }
                return lowValue
            }
        },
        // 温度弹框切换温度类型
        tempTypeChange(item) {
            item.itemCode = this.wdType;
            this.wdTypeList.map((v, index) => {
                if (item.itemCode == v.value) {
                    item.itemName = v.label;
                }
            });
        },
        // 护理事件
        findNurseEvt() {
            this.$axios.post(findEvtDictList, {}).then(res => {
                if (res.success) {
                    this.eventsDataOpation = res.data;
                }
            });
        },
        // 反显患者某一天的体温单数据
        getVisitTempDataByDay(inptDate) {
            this.patEntryForm.eventRemoveList = []
            this.dialogLoading = true;
            if (!inptDate) {
                this.$message({
                    type: "warning",
                    message: "体征采集时间不能为空！"
                });
                return;
            }
            let params = {
                    idVisit: this.patEntryForm.idVisit,
                    idDept: this.patEntryForm.idDept,
                    recordDt: inptDate,
                    hisUserId: this.patEntryForm.hisUserId
                },
                xyObj = {
                    itemCode: this.selfTmpCode.BLOOD_PRESSURE,
                    itemName: "血压",
                    signList: [],
                    times: 2
                },
                newArr = []; // 存储高压和低压数据
            this.$axios
                ._post(getVisitTemperatureDataByDay, params)
                .then(res => {
                    this.dialogLoading = false;
                    if (res.success) {
                        this.pageStructure = res.data;
                        let eventData = res.data.evtList;
                        this.eventsDataOpation.forEach(e=> {
                            eventData.map(li=> {
                                if (e.value == li.evtCode) {
                                    this.$set(li, 'evtName', e.label);
                                }
                            })
                        })
                        this.pageStructure.evtList = eventData;
                        this.originEvtLIst = JSON.parse(
                            JSON.stringify(eventData)
                        );
                        // 因为高压低压是两个体征项目，但是前端只展示血压（包含高压、低压）体征项目，所以需要处理一下。
                        if (this.pageStructure.mainDataList.length) {
                            let obj = {},
                                xyLen = 0,
                                gArr = [],
                                dArr = []; // 存储低压、高压的值
                            this.pageStructure.mainDataList.map((v, ind) => {
                                if (
                                    v.itemCode ==
                                    this.selfTmpCode.HYPOTENSION_TMP
                                ) {
                                    // 低压
                                    xyLen = v.signList.length;
                                    dArr = v.signList;
                                } else if (
                                    v.itemCode ==
                                    this.selfTmpCode.HYPERTENSION_TMP
                                ) {
                                    // 高压
                                    gArr = v.signList;
                                } else if (
                                    this.checkedCodeArr.includes(v.itemCode)
                                ) {
                                    // 体温不升 复选框反显
                                    v.signList.map((signItem, signIndex) => {
                                        signItem.value =
                                            signItem.value == "1"
                                                ? true
                                                : false;
                                    });
                                    newArr.push(v);
                                } else {
                                    newArr.push(v);
                                }
                            });
                            let resArr = [];
                            for (var i = 0; i < xyLen; i++) {
                                let item = {};
                                item.idVisitElementDetailSync =
                                    dArr[i].idVisitElementDetailSync;
                                item.g = this.negativeConversion(gArr[i].value);
                                // 血压添加时间一天两次 时间间隔取2，3项
                                item.times = this.pageStructure.hourList[i * 3];
                                item.d = this.negativeConversion(dArr[i].value);
                                item.dItemCode = dArr[i].itemCode;
                                item.gItemCode = gArr[i].itemCode;
                                item.value = item.g + "/" + item.d;
                                resArr.push(item);
                            }
                            // 判断一下是否有低压或者高压来展示血压体征项目,暂时注释202156
                            this.pageStructure.mainDataList.map((v, ind) => {
                                if (
                                    v.itemCode ==
                                    this.selfTmpCode.HYPOTENSION_TMP
                                ) {
                                    xyObj.signList = resArr;
                                    xyObj.itemUnit = v.itemUnit;
                                    xyObj.times = v.times;
                                    newArr.push(xyObj);
                                }
                            });
                            this.pageStructure.mainDataList = newArr;
                            this.addMainItemOther(); // 添加呼吸机、起搏器
                        }
                        // console.log(this.pageStructure.mainDataList, 'this.pageStructure.mainDataList')
                        // 没有返回护理事件列表时，前端需要新增一条空数据
                        if (this.pageStructure.evtList.length < 1) {
                            this.pageStructure.evtList.push({
                                idEvtRecord: "",
                                evtCode: "",
                                dtHappenedStr: "",
                                evtName: ""
                            });
                        }
                        // 根据后端获取到的护理时间（护理频率）给每一项体征项目添加对应的时间点
                        // 如果newFlag为1则是新增为0是修改 给每个项目添加是否编辑标识，如果是编辑值则只保存编辑修改的值，不包含新增
                        this.pageStructure.mainDataList.forEach((mainItem, mainInd) => {
                                if (mainItem.times == 2) {
                                    mainItem.signList.forEach(
                                        (signVal, signIdx) => {
                                            signVal.value = this.negativeConversion(
                                                signVal.value
                                            );
                                            let spaceIdx = signIdx == 0 ? 2 : 3;
                                            signVal.time = this.pageStructure.hourList[
                                                spaceIdx
                                            ];
                                            signVal.edit = false;
                                            signVal.oldValue = signVal.value;
                                            signVal.oldCode = signVal.itemCode;
                                            
                                        }
                                    );
                                } else {
                                    let assObj = {
                                        time: "",
                                        edit: false
                                    }
                                    mainItem.signList.forEach((v, ind) => {
                                        v.value = this.negativeConversion(
                                            v.value
                                        );
                                        assObj.time = this.pageStructure.hourList[ind];
                                        assObj.oldValue = v.value;
                                        assObj.oldCode = v.itemCode;
                                        Object.assign(v, assObj)
                                        // this.$set(
                                        //     v,
                                        //     "time",
                                        //     this.pageStructure.hourList[ind]
                                        // );
                                        // return v;
                                    });
                                    // console.log(mainItem.signList)
                                }
                            }
                        );
                        this.pageStructure.titleBarDataList.forEach(
                            (titItem, ind) => {
                                let assObj = {
                                    time: this.pageStructure.hourList[0],
                                    edit: false,
                                    oldValue: "",
                                    oldCode: ""
                                }
                                titItem.signList.forEach(v => {
                                    // this.$set(
                                    //     v,
                                    //     "time",
                                    //     this.pageStructure.hourList[0]
                                    // );
                                    // return v;
                                    assObj.oldValue = v.value;
                                    assObj.oldCode = v.itemCode;
                                    Object.assign(v, assObj)
                                });
                            }
                        );
                        this.pageStructure.footerDataList.forEach(
                            (footerItem, ind) => {
                                let assObj = {
                                    time: this.pageStructure.hourList[0],
                                    edit: false,
                                    oldValue: "",
                                    oldCode: ""
                                }
                                footerItem.signList.forEach(v => {
                                    // this.$set(
                                    //     v,
                                    //     "time",
                                    //     this.pageStructure.hourList[0]
                                    // );
                                    v.value = this.negativeConversion(v.value);
                                    assObj.oldValue = v.value;
                                    assObj.oldCode = v.itemCode;
                                    Object.assign(v, assObj)
                                    return v;
                                });
                            }
                        );
                        setTimeout(()=> {
                            this.pageStructureCopy = JSON.parse(
                            JSON.stringify(this.pageStructure)
                        );
                        // console.log(JSON.stringify(this.pageStructure) == JSON.stringify(this.pageStructureCopy))
                        },50)
                    } else {
                        this.$message({
                            type: "error",
                            message: res.message
                        });
                    }
                });
        },
        // 追加呼吸机和起搏器
        // 在主要体征项目里面添加
        addMainItemOther() {
            let arr = this.pageStructure.mainDataList;
            arr.forEach((mainItem, mainInd)=> {
                if (mainItem.itemCode == this.selfTmpCode.BREATHING_TMP) {
                    let info = this.addSignItem(this.selfTmpCode.RESPIRATOR_TMP, '呼吸机', mainItem);
                    this.pageStructure.mainDataList.splice(mainInd+1, 0, info)
                } else if (mainItem.itemCode == this.selfTmpCode.HEARTRATE_TMP) {
                    let info = this.addSignItem(this.selfTmpCode.PACEMAKER_TMP, '起搏器', mainItem);
                    this.pageStructure.mainDataList.splice(mainInd+1, 0, info)
                }
            })
            
        },
        // itemCode编码，itemName名称，频次times
        addSignItem(itemCode, itemName, mainItem) {
            let times = mainItem.times;
            let itemMap = new Map();
            itemMap.itemCode = itemCode;
            itemMap.itemName = itemName;
            itemMap.times = times;
            itemMap.keyName = `'{"name": ${itemName}}'`;
            itemMap.signList = [];
            for (let i=0;i<mainItem.signList.length;i++) {
                this.$set(mainItem.signList[i], 'oldEquipFlag', mainItem.signList[i].equipFlag)
                itemMap.signList.push({
                    edit: false,
                    itemCode:itemCode,
                    itemName:itemName,
                    time: mainItem.signList[i].time,
                    value: mainItem.signList[i].equipFlag ? true : false,
                    oldValue: mainItem.signList[i].equipFlag ? true : false
                })
            }
            return itemMap;
        },
        //事件操作
        addEventsData() {
            this.pageStructure.evtList.push({
                idEvtRecord: "",
                evtCode: "",
                dtHappenedStr: "",
                evtName: ""
            });
        },
        eventClear(item, index) {
            let arr = [];
            if (item.idEvtRecord) {
                arr.push(item.idEvtRecord);
            }
            arr = Array.from(new Set(arr));
            this.patEntryForm.eventRemoveList = arr;
        },
        deleteEventsData(item, index) {
            if (this.pageStructure.evtList.length <= 1) {
                // 清空
                if (this.pageStructure.evtList.length == 1) {
                    if (item.idEvtRecord) {
                        this.patEntryForm.eventRemoveList.push(item.idEvtRecord);
                    }
                    this.patEntryForm.eventRemoveList = Array.from(new Set(this.patEntryForm.eventRemoveList));
                    Object.assign(this.pageStructure.evtList[0], {
                        idEvtRecord: "",
                        evtCode: "",
                        dtHappenedStr: "",
                        evtName: ""
                    });
                }
                // 先注释
                // this.$message({
                //     type: "warning",
                //     message: "仅剩一条数据，不能再删除了哦"
                // });
            } else {
                if (item.idEvtRecord) {
                    this.patEntryForm.eventRemoveList.push(item.idEvtRecord);
                }
                this.patEntryForm.eventRemoveList = Array.from(new Set(this.patEntryForm.eventRemoveList));
                this.pageStructure.evtList.splice(index, 1);
            }
        },
        // 过滤不必要的属性
        filterProperty(item) {
            let { bdValue, itemCode, itemName, ...params } = item;
            return params;
        },
        // 护理事件列表更改事件
        evtListChange(item) {
            this.eventsDataOpation.map((v, ind) => {
                if (v.value == item.evtCode) {
                    item.evtName = v.label;
                }
            });
        },
        warningBorderFn(evtItem) {
            if (evtItem.evtCode && evtItem.dtHappenedStr == "") {
                return {
                    borCol: ["borColorWarn"],
                    alertMsg: "不能为空"
                };
            } else {
                return {
                    borCol: [""],
                    alertMsg: ""
                };
            }
        },
        // 获取体温控件下拉列表
        findTempControList() {
            this.$axios.post(getTemperatureControList, {}).then(res => {
                if (res.success) {
                    this.wdTypeList = res.data;
                }
            });
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
            str = str.match(/^\-?\d*(\.?\d{0,1})/g)[0] || '';

            //正则替换，保留数字和小数点
            // str = str.match(/^\d*(\.?\d{0,1})/g)[0] || null;
            // str = str.match(/^\-?\d*(\.?\d{0,1})/g)[0] || null;
            return str;
        },
        // 数字校验，只能输入数字
        numCheck(val) {
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
            // }
            //正则替换，保留数字和小数点
            str = str.match(/^\-?\d*/g)[0] || '';

            return str;
        },
        // 体温列表数据，
        getTempControlListByIdDept() {
            let params = {
                idDept: this.patEntryForm.idDept
            };
            this.$axios
                ._post(getTemperatureControlListByIdDept, params)
                .then(res => {
                    if (res.success) {
                        this.wdTypeList = res.data;
                    }
                })
                .catch(res => {
                    console.log(res);
                });
        },
        // 获取日期
        getDateStr(date, addDayCount) {
            let dd = new Date(date);
            dd.setDate(dd.getDate() + addDayCount); //获取addDayCount天后的日期
            let y = dd.getFullYear();
            let m =
                dd.getMonth() + 1 < 10
                    ? "0" + (dd.getMonth() + 1)
                    : dd.getMonth() + 1; //获取当前月份的日期，不足10补0
            let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0
            return y + "-" + m + "-" + d;
        },
        // 获取体征未查快捷键标志
        getVitalSignKeysList() {
            let titp = "";
            this.signInpTip = "特殊字符请使用右键菜单";
            this.$axios
                .get(getVitalSignNoneKeysList, {})
                .then(res => {
                    this.signShortcuts = res.data;
                    // this.signShortcuts.forEach(item => {
                    //     titp += item.name+"请录入 " +item.value+ ' '
                    // })
                    // this.signInpTip = titp;
                })
                .catch(err => {
                    console.log(err);
                });
        },
        // 获取特殊字符（包含所有系统参数配置数据）
        getSpecKeysArr() {
            this.$axios
                ._post(`${hlwsSerUrl}emr/common/getSystemConfigList`, {
                    empNo: this.userInfo.empNo
                })
                .then(res => {
                    if (res.success) {
                        this.sysConfigData = res.data;
                        this.specKeysArr = res.data.vitalsignSpecKeys;
                        res.data.vitalsignSpecKeys.forEach(item => {
                            this.dicDataObj[item.value] = item.name;
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        // 负数-1 拒测 -2 卧床
        negativeConversion(val) {
            let value = "";
            value = val;
            this.signShortcuts.forEach(item => {
                if (item.name == val) {
                    value = item.value;
                }
            });
            return value;
        },
        // 获取右键菜单列表
        getDicData() {
            this.$axios
                .get(`${hlwsSerUrl}emr/common/getVitalSignNoneKeysList`)
                .then(res => {
                    if (res.success) {
                        this.otherKeysArr = res.data;
                        res.data.forEach(item => {
                            this.dicDataObj[item.value] = item.name;
                        });
                        // console.log("组织数据：",this.dicDataObj)
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        //右键
        rowRightClick(event, item, type) {
            // console.log(event, item)
            event.preventDefault();
            let itemsArr = [];
            this.otherKeysArr.forEach((cItem, index) => {
                itemsArr.push({
                    label: cItem.name,
                    divided:
                        index == this.otherKeysArr.length - 1 ? true : false,
                    onClick: () => {
                        let key = cItem.value;
                        if (type && type == "g") {
                            item.g = key;
                            item.d = key;
                            if (item.d) {
                                item.value = key + "/" + item.d;
                            } else {
                                item.value = item.g;
                            }
                        } else if (type && type == "d") {
                            item.d = key;
                            item.g = key;
                            if (item.g) {
                                item.value = item.g + "/" + key;
                            } else {
                                item.value = key;
                            }
                        } else if (type && type == "gd") {
                            item.value = key;
                            item.g = key;
                            item.d = "";
                        } else {
                            item.value = key;
                        }
                    }
                });
            });
            this.specKeysArr.forEach((cItem, index) => {
                itemsArr.push({
                    label: cItem.name,
                    onClick: () => {
                        let key = cItem.value;
                        if (type && type == "g") {
                            item.g = key;
                            item.d = key;
                            if (item.d) {
                                item.value = key + "/" + item.d;
                            } else {
                                item.value = item.g;
                            }
                        } else if (type && type == "d") {
                            item.g = key;
                            item.d = key;
                            if (item.g) {
                                item.value = item.g + "/" + key;
                            } else {
                                item.value = key;
                            }
                        } else if (type && type == "gd") {
                            item.value = key;
                            item.g = key;
                            item.d = "";
                        } else {
                            item.value = key;
                        }
                    }
                });
            });
            // for(let key in this.dicDataObj) {
            //     itemsArr.push({
            //         label: this.dicDataObj[key],
            //         onClick: () => {
            //             //   Object.assign(row[column.property], {
            //             //       elementValue: key
            //             //   })
            //             if (type && type == 'g') {
            //                 item.g = key;
            //                 if (item.d) {
            //                     item.value = key + '/' +item.d ;
            //                 } else {
            //                     item.value = item.g;
            //                 }
            //             } else if (type && type == 'd') {
            //                 item.d = key;
            //                 if (item.g) {
            //                     item.value = item.g + '/' + key;
            //                 } else {
            //                     item.value = key;
            //                 }

            //             } else if (type && type == 'gd') {
            //                 item.value = key;
            //                 item.g = key;
            //                 item.d = "";
            //             } else {
            //                 item.value = key;
            //             }

            //         }
            //     })
            // }
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
        // 其他护理事件输入框点击事件（如果是药物过敏则输入框只读、且弹出护士站所封装的药物过敏弹框）
        otherClickHandler(item) {
            if (this.selfTmpCode.DRUGallERGY == item.itemCode) {
                this.allergyForm.allergyDialogVisible = true;
                this.allergyForm.idPat = this.temParams.idPat;
                this.$refs.HisAddAllergy.init();
            }
        }
    },
    components: {
        // QuoteSign,
        QuoteSign: () => import("../quoteSign/quoteSign"),
        // HeadNurse,
        HeadNurse: () => import("@/components/page/Common_WEB/temperature/tempLineChart/headNurseSignName"),
        HisAddAllergy: () => import("@/components/page/Common_WEB/hisAddAllergy/hisAddAllergy.vue"),
        TempMain: () =>
            import("@/components/page/Common_WEB/temperature/tempMain")
    }
};
</script>

<style lang="scss">
    @import './tempInput.scss';
</style>
