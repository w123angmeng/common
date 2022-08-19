const hlwsServiceUrl = globalUrl.hlwsServiceUrl;

export const leaveMark = {
    methods: {
        // post请求留痕接口
        _operatelogs(param) {
            this.$axios._post(hlwsServiceUrl + "/operatelogs", param).then(res => { });
        }
    },
}