import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useUserStoreHook } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { get, merge } from 'lodash-es'
import { getToken } from './cache/cookies'
import { metamaskLogin } from '@/api/login'

/** 退出登录并强制刷新页面（会重定向到登录页） */
function logout() {
  useUserStoreHook().logout()
  location.reload()
}

/** 创建请求实例 */
function createService() {
  // 创建一个 axios 实例命名为 service
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    config => config,
    // 发送失败
    error => Promise.reject(error)
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    async response => {
      // apiData 是 api 返回的数据
      const apiData = response.data
      // 二进制数据则直接返回
      const responseType = response.request?.responseType
      if (responseType === 'blob' || responseType === 'arraybuffer') return apiData

      console.info(apiData)
      // 这个 code 是和后端约定的业务 code
      const code = apiData.code
      // 如果没有 code, 代表这不是项目后端开发的 api
      if (code === undefined) {
        ElMessage.error('Interfaces other than this system')
        return Promise.reject(new Error('Interfaces other than this system'))
      }
      switch (code) {
        case 200:
        case 0:
          // 本系统采用 code === 0 来表示没有业务错误
          return apiData
        case 401:
          // Token 过期时
          await metamaskLogin()

        default:
          // 不是正确的 code
          ElMessage.error(apiData.message || 'Error')
          return Promise.reject(new Error('Error'))
      }
    },
    async error => {
      // status 是 HTTP 状态码
      const status = get(error, 'response.status')
      switch (status) {
        case 400:
          error.message = 'Request error'
          break
        case 401:
          await metamaskLogin()
          break
        case 403:
          error.message = 'access denied'
          break
        case 404:
          error.message = 'Error requesting address'
          break
        case 408:
          error.message = 'Request timed out'
          break
        case 500:
          error.message = 'opps！please refresh'
          break
        case 501:
          error.message = 'Service not implemented'
          break
        case 502:
          error.message = 'Gateway error'
          break
        case 503:
          error.message = 'service is not available'
          break
        case 504:
          error.message = 'Gateway timeout'
          break
        case 505:
          error.message = 'HTTP version is not supported'
          break
        default:
          break
      }
      ElMessage.error(error.message)
      return Promise.reject(error)
    }
  )
  return service
}

/** 创建请求方法 */
function createRequest(service: AxiosInstance) {
  return function <T>(config: AxiosRequestConfig): Promise<T> {
    const token = getToken()
    const defaultConfig = {
      headers: {
        // 携带 Token
        'X-Access-Token': token,
        'Content-Type': 'application/json',
      },
      timeout: 50000,
      baseURL: import.meta.env.VITE_BASE_API,
      data: {},
    }
    // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
    const mergeConfig = merge(defaultConfig, config)
    return service(mergeConfig)
  }
}

/** 用于网络请求的实例 */
const service = createService()
/** 用于网络请求的方法 */
export const request = createRequest(service)
