<template>
    <div>
        <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
        <div v-if="isShowBox">
            <el-button :disabled="disabled" :loading="loading" style="margin-left:16px;" size="mini" type="primary" @click="handleUpload">{{btnText}}</el-button>
        </div>
        <div v-else  class="drop" @drop="handleDrop" @dragover="handleDragover" @dragenter="handleDragover">
            {{dropBtnText}}
            <el-button :disabled="disabled" :loading="loading" style="margin-left:16px;" size="mini" type="primary" @click="handleUpload">{{btnText}}</el-button>
        </div>
    </div>
</template>

<script>
import XLSX from 'xlsx'
export default {
    props: {
        // 上传前效验
        beforeUpload: Function, // eslint-disable-line
        // 成功回调
        onSuccess: Function, // eslint-disable-line
        // xlsx 解析后
        parseAfter: Function, // eslint-disable-line
        // 是否展示拖转框
        isShowBox: {
            type: Boolean,
            default: false
        },
        // 按钮文案
        btnText: {
            type: String,
            default: '选择文件'
        },
        // 拖转框文案
        dropBtnText: {
            type: String,
            default: ' 拖动Excel文件到此处 或者'
        },
        disabled:{
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            loading: false,
            excelData: {
                header: null,
                results: null
            }
        }
    },
    methods: {
        // 回传数据
        generateData({ header, results, rawFile, XLSX }) {
            this.excelData.header = header
            this.excelData.results = results
            this.excelData.rawFile = rawFile
            this.excelData.XLSX = XLSX
            this.onSuccess && this.onSuccess(this.excelData)
        },
        // 移动拖动的元素到所选择的放置目标节点
        handleDrop(e) {
            // 阻止默认动作
            e.stopPropagation()
            e.preventDefault()
            if (this.loading) return
            const files = e.dataTransfer.files
            if (files.length !== 1) {
                this.$message.error('Only support uploading one file!')
                return
            }
            const rawFile = files[0] // only use files[0]
            // 判断是否是excel
            if (!this.isExcel(rawFile)) {
                this.$message.error('Only supports upload .xlsx, .xls, .csv suffix files')
                return false
            }
            // 触发上传动作
            this.upload(rawFile)
            // 阻止默认动作
            e.stopPropagation()
            e.preventDefault()
        },
        // 放下目标节点时触发事件 dragover
        // 当可拖动的元素进入可放置的目标高亮目标节点 dragenter
        handleDragover(e) {
            e.stopPropagation()
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
        },
        // 触发input事件
        handleUpload() {
            this.$refs['excel-upload-input'].click()
        },
        // 实际触发input上传
        handleClick(e) {
            const files = e.target.files
            const rawFile = files[0] // only use files[0]
            if (!rawFile) return
            this.upload(rawFile)
        },
        upload(rawFile) {
            this.$refs['excel-upload-input'].value = null // fix can't select the same excel
            if (!this.beforeUpload) {
                this.readerData(rawFile)
                return
            }
            const before = this.beforeUpload(rawFile)
            if (before) {
                this.readerData(rawFile)
            }
        },
        // 读取文件流
        readerData(rawFile) {
            this.loading = true
            return new Promise((resolve, reject) => {
                // 异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容，
                const reader = new FileReader()
                reader.onload = e => {
                    // 通用的、固定长度的原始二进制数据缓冲区
                    const data = e.target.result
                    // 转换原始二进制数据缓冲区的数据
                    const fixedData = this.fixData(data)
                    // 返回excel数据
                    const workbook = XLSX.read(btoa(fixedData), { type: 'base64' })
                    // 获取第一列title
                    const firstSheetName = workbook.SheetNames[0]
                    // 获取excel相关信息
                    const worksheet = workbook.Sheets[firstSheetName]
                    // 整合头相关
                    const header = this.getHeaderRow(worksheet)
                    if(!this.parseAfter) {
                        this.sheetToJson({header, worksheet, rawFile, XLSX})
                        resolve()
                    }
                    const {isPass,range} = this.parseAfter({worksheet, header, rawFile, XLSX})
                    if (isPass) {
                        this.sheetToJson({header, worksheet, range, rawFile, XLSX})
                        resolve()
                    } else {
                        this.loading = false
                    }
                }
                // 异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容，
                reader.readAsArrayBuffer(rawFile)
            })
        },
        sheetToJson({worksheet, header, range = 0, rawFile, XLSX}) {
            // 整合json,用于交互
            const results = XLSX.utils.sheet_to_json(worksheet, { range:range, defval: ''})
            // 回传数据
            this.generateData({ header, results, rawFile, XLSX })
            this.loading = false
        },
        // 文件流转 base64
        fixData(data) {
            let o = ''
            let l = 0
            const w = 10240
            for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
            return o
        },
        // 整合头相关
        getHeaderRow(sheet) {
            const headers = []
            const range = XLSX.utils.decode_range(sheet['!ref'])
            let C
            const R = range.s.r
            /* start in the first row */
            for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
                const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
                /* find the cell in the first row */
                let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
                if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
                headers.push(hdr)
            }
            return headers
        },
        // 判断是否是excel
        isExcel(file) {
            return /\.(xlsx|xls|csv)$/.test(file.name)
        }
    }
}
</script>

<style scoped>
.excel-upload-input{
    display: none;
    z-index: -9999;
}
.drop{
    border: 2px dashed #bbb;
    width: 600px;
    height: 160px;
    line-height: 160px;
    margin: 0 auto;
    font-size: 24px;
    border-radius: 5px;
    text-align: center;
    color: #bbb;
    position: relative;
}
</style>
