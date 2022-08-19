/*
  Explain
    post:
        url:请求地址  必填
        data:请求参数  必填
        jsonStr:是否需要转JSON.stringify 可选
*/
// 用于mock请求，不做他用
import axios from 'axios'
import qs from 'qs';
axios.defaults.timeout = 60000;
//需要手动配置域名或IP
axios.defaults.baseURL = 'https://mock.yonyoucloud.com/mock/22310/wuzi/';
axios.interceptors.request.use(config => {
    return config
}, error => {
    return Promise.reject(error)
})

axios.interceptors.response.use(response => {
    return Promise.resolve(response)
}, error => {
    return Promise.resolve(error.response);

})

function checkStatus(response) {
    // 如果状态码正常就直接返回数据,这里的状态码是htttp响应状态码有400，500等
    if (response && ((response.status === 200 || response.status === 304 || response.status === 400 || response.status === 403))) {
        return response.data // 直接返回http response响应的data

    } else {
        return { // 自定义网络异常对象
            code: '404',
            message: '网络异常'
        }
    }

}

function checkCode(res) {
    // 如果状态码正常就直接返回数据
    // console.log(res)
    if (res.code === -404) {
        alert(res.message)
        return {
            code: '',
            message: '网络错误'
        }
    } else {
        return res
    }
}

export default {
    post(url, data = {}) {

        // let jsonData = jsonStr ? qs.stringify(data) : data;
        return axios({
            method: 'post',
            url: url,
            data: qs.stringify(data), //qs.stringify(data)
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
        }).then((res) => {
            return checkStatus(res);
        }).then(
            (res) => {
                return checkCode(res);
            }
        )
    },

    get(url, params = {}, responseType = "") {
        let headParams = {
            method: 'get',
            url,
            params,
            headers: {
                'content-type': 'application/json',
            }
        }
        if (responseType) headParams.responseType = responseType
        return axios(headParams).then(
            (response) => {
                return checkStatus(response);
            }
        ).then(
            (res) => {
                return checkCode(res);
            }
        )
    },

    _post(url, data, jsonStr, responseType = "") {
        let jsonData = jsonStr ? qs.stringify(data) : data;
        // 因为要导出excel表格 通过'js-file-download'下载
        // 需要接收 {responseType:arraybuffer}参数
        let headParams = {
            method: 'post',
            url: url,
            data: jsonData,
            headers: {
                'content-type': 'application/json',
            }
        }
        if (responseType) headParams.responseType = responseType
        return axios(headParams).then((res) => {
            return checkStatus(res);
        }).then(
            (res) => {
                return checkCode(res);
            }
        )
        // return axios({
        //     method: 'post',
        //     url: url,
        //     data: jsonData, //qs.stringify(data)
        //     headers: {
        //         'content-type': 'application/json',
        //     },
        // }).then((res) => {
        //     return checkStatus(res);
        // }).then(
        //     (res) => {
        //         return checkCode(res);
        //     }
        // )
    }
}
