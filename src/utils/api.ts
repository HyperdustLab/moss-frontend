//引入封装好的 axios
import { request } from '@/utils/service'

//创建需要的请求方法:get post put delete
//url:请求的接口地址
//params:请求参数
//headers:请求头
export default {
  get(url: string, params: Object) {
    return request({ url: url, method: 'get', params })
  },
  post(url: string, params: object) {
    return request({ url: url, method: 'post', data: params })
  },
  put(url: string, params: Object) {
    return request({ url: url, method: 'put', data: params })
  },
  delete(url: string, params: Object) {
    return request({ url: url, method: 'delete', params })
  },

  postForm(url: string, params: Object) {
    return request({ url: url, method: 'post', params })
  },

  async getDictItems(dictCode) {
    const { result } = await request({ url: '/sys/dict/getDictItems/' + dictCode, method: 'get' })
    return result
  },
  async getDictText(dictCode, key) {
    const { result } = await request({
      url: `/sys/dict/getDictText/${dictCode}/${key}`,
      method: 'get',
    })
    return result
  },
  async getSmartContractByCode(code: string, blockchainId?: undefined) {
    const blockchain = JSON.parse(localStorage.getItem('blockchain'))
    const { result } = await request({
      url: '/mgn/smartContract/getSmartContractByCode',
      method: 'get',
      params: { blockchainId: blockchainId || blockchain.id, code },
    })
    return result
  },
  getBaseURL() {
    return import.meta.env.VITE_BASE_API
  },
}
