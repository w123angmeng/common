<template>
    <div class="tdCon">
        <div class="tdTop">
            <p class="left">
                <span>{{tdInfo.elementValue}}</span>
                <!-- <span v-if="tdInfo.position">{{tdInfo.position}}</span> -->
            </p>
            <p v-if="isSign&&tdInfo.measureEmpName">
                <el-checkbox v-model="value" :true-label="1" :false-label="0" @change="checkboxChg"></el-checkbox>
            </p>
        </div>
        <div class="tdBottom">
            <span>{{tdInfo.measureTime}}</span>
            <span>{{tdInfo.measureEmpName}}</span>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        tdInfo: {
            type: Object,
            default() {
                return {};
            }
        },
        isSign: {
            type: String,
            default() {
                return "";
            }
        },
        selected: {
            type: Boolean,
            default() {
                return false;
            }
        }
    },
    data() {
        return {
            value: 0
        };
    },
    watch: {
        selected(newVal) {
            if (newVal) {
                this.value = 1;
            } else {
                this.value = 0;
            }
            // this.checkboxChg();
        }
    },
    methods: {
        checkboxChg() {
            this.$emit("checkboxChg", this.tdInfo, this.value);
        }
    }
};
</script>
<style lang="scss">
.tdCon {
    .tdTop {
        display: flex;
    }
    .left {
        flex: 1;
    }
    .tdBottom {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
    }
}
</style>