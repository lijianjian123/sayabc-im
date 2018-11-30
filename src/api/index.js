import { callApi, creatSearch } from './util.js'

export function searchTeacher(data) {
    return callApi.get(`?${creatSearch(data)}`)
}