import { request } from '@/utils/service'
import type * as Login from './types/login'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: 'login/code',
    method: 'get',
  })
}

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: 'users/login',
    method: 'post',
    data,
  })
}

/** 获取用户详情 */
export function getUserInfoApi() {
  return request<Login.UserInfoResponseData>({
    url: '/sys/getCurrUser',
    method: 'get',
  })
}

export async function metamaskLogin() {
  if (typeof window.ethereum === 'undefined') {
    ElMessage.error('Please install a wallet to use this feature.')
    throw new Error('Please install a wallet to use this feature.')
  }

  // @ts-ignore
  await window.ethereum.enable()
  // @ts-ignore
  const accounts = await ethereum.request({ method: 'eth_accounts' })

  const data = await api.get('/sys/getPersonalSignMessage', {
    address: accounts[0],
  })

  // @ts-ignore
  const signature = await ethereum.request({
    method: 'personal_sign',
    // @ts-ignore
    params: [data.result, accounts[0]],
  })

  // @ts-ignore
  const { result } = await api.post('/sys/metaMaskLogin', {
    address: accounts[0],
    signature: signature,
    role: 'user',
  })

  await useUserStore().loginToken(result.token)

  await useUserStore().getInfo()
}

export async function getBindStatus() {
  const userStore = useUserStore()

  if (!userStore.walletAddress) {
    return 'metamask'
  }

  const { result } = await api.get('/sys/user/listMyBindAccount', {})

  if (!userStore.email && !result.some((item) => item === 'google')) {
    return 'email'
  }

  return 'none'
}
