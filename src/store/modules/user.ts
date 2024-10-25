import { ref } from 'vue'
import store from '@/store'
import { defineStore } from 'pinia'
import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tags-view'
import { useSettingsStore } from './settings'
import { getToken, removeToken, setToken } from '@/utils/cache/cookies'
import router, { resetRouter } from '@/router'
import { loginApi, getUserInfoApi } from '@/api/login'
import { type LoginRequestData } from '@/api/login/types/login'
import { type RouteRecordRaw } from 'vue-router'
import asyncRouteSettings from '@/config/async-route'
import api from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const roles = ref<string[]>([])
  const username = ref<string>('')
  const email = ref<string>('')
  const avatar = ref<string>('')
  const invitationCode = ref<string>('')
  const walletAddress = ref<string>('')

  const permissionStore = usePermissionStore()
  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** 设置角色数组 */
  const setRoles = (value: string[]) => {
    roles.value = value
  }
  /** 登录 */
  const login = async ({ username, password, code }: LoginRequestData) => {
    const { data } = await loginApi({ username, password, code })
    setToken(data.token)
    token.value = data.token
  }

  const loginToken = async (_token: string) => {
    setToken(_token)
    token.value = _token
  }

  /** 获取用户详情 */
  const getInfo = async () => {
    const { result } = await getUserInfoApi()
    username.value = result.username
    avatar.value = result.avatar
    email.value = result.email
    walletAddress.value = result.walletAddress
    invitationCode.value = result.invitationCode
    // 验证返回的 roles 是否为一个非空数组，否则塞入一个没有任何作用的默认角色，防止路由守卫逻辑进入无限循环
    roles.value = ['user']
  }
  /** 切换角色 */
  const changeRoles = async (role: string) => {
    const newToken = 'token-' + role
    token.value = newToken
    setToken(newToken)
    await getInfo()
    permissionStore.setRoutes(roles.value)
    resetRouter()
    permissionStore.dynamicRoutes.forEach((item: RouteRecordRaw) => {
      router.addRoute(item)
    })
    _resetTagsView()
  }
  /** 登出 */
  const logout = async () => {
    try {
      await api.get('/sys/logout', {})
    } catch (error) {
      console.log(error)
    }

    removeToken()
    token.value = ''
    roles.value = []
    resetRouter()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    removeToken()
    token.value = ''
    roles.value = []
  }
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return { token, roles, username, setRoles, login, getInfo, changeRoles, logout, resetToken, loginToken, avatar, invitationCode, email, walletAddress }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
