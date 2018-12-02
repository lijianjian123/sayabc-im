import axios from 'axios'
import { session } from './_gateway.config'

//路径获取
function getBaseUrl(root) {
    if (root.indexOf('/teacher-acocunt') != -1) {
        return root.replace('/teacher-acocunt', accountRoot)
    }
    if (root.indexOf('/teacher-upload') != -1) {
        return root.replace('/teacher-upload', upload)
    }
    if (root.indexOf('management') != -1) {
        return root.replace('/management', management)
    }
}

export function callApi(apiRoot = '/') {
    var obj = {}
    if (cookie('abc-token')) {
        let authorization = decodeURIComponent(cookie('abc-token'));
        obj = axios.create({
            baseURL: getBaseUrl(apiRoot),
            timeout: 10000,
            headers: { 'Authorization': authorization }
        })
    } else {
        obj = axios.create({
            baseURL: getBaseUrl(apiRoot),
            timeout: 10000
        })
    }

    obj.interceptors.request.use(config => {
        cookie('abc-token') && (config.headers.Authorization = cookie('abc-token'))
        return config
    }, err => {
        return Promise.reject(err)
    })

    obj.interceptors.response.use(res => res, (err = {}) => {
        const { response = {} } = err
        const { status, data = {} } = response
        if (status === 401) {
            cookie('abc-token', null)
            location.href = '/recruit.html#/login'
        } else {
            let error = data.message ? new Error(data.message) : err
            if (~error.message.indexOf('timeout') || error.message === 'Network Error') {
                error = new Error('Network error, please check your network settings')
            }
            error.code = data.code
            return Promise.reject(error)
        }
    })

    return obj
}

export function createSearch(query) {
    if (typeof query !== 'object')
        return ''

    return Object
        .keys(query)
        .filter(key => {
            const value = query[key]
            if (typeof value === 'string')
                return value.trim() && value !== 'undefined'
            return value !== undefined && value !== null
        })
        .map(key => `${key}=${enc(query[key])}`)
        .join('&')
}

//使用async/await时处理报错的方法
export function to(promise) {
    if (!promise || !Promise.prototype.isPrototypeOf(promise)) {
        return new Promise((resolve, reject) => {
            reject(new Error("requires promises as the param"));
        }).catch((err) => {
            return [err, null];
        });
    }
    return promise.then(function () {
        return [null, ...arguments];
    }).catch(err => {
        return [err, null];
    });
}