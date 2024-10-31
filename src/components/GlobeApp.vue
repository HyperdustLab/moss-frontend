<template>
  <div>
    <CreateEpochTransaction ref="createEpochTransaction"></CreateEpochTransaction>

    <Epoch2DRender ref="epoch2DRender"></Epoch2DRender>

    <IntroductionBindAccount ref="introductionBindAccountRef"></IntroductionBindAccount>

    <Login ref="loginRef"></Login>
  </div>
</template>

<script lang="ts" setup>
import CreateEpochTransaction from '@/views/dashboard/CreateEpochTransaction.vue'
import Epoch2DRender from '@/views/dashboard/Epoch2DRender.vue'

import { metamaskLogin } from '@/api/login'

import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import api from '@/utils/api'
import { ElLoading } from 'element-plus'

import { getBindStatus } from '@/api/login'

import IntroductionBindAccount from '@/components/IntroductionBindAccount/index.vue'

import Login from '@/components/login/index.vue'

const createEpochTransaction = ref(null)

const epoch2DRender = ref(null)

const introductionBindAccountRef = ref(null)
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const loginRef = ref(null)

let gLoading = null

const { t } = useI18n()

async function openApp(sid, parameter) {
  gLoading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  const item = await getApp(sid)

  gLoading.close()

  if (userStore.token) {
    const bindStatus = await getBindStatus()

    console.info('bindStatus:', bindStatus)

    if (bindStatus !== 'none') {
      introductionBindAccountRef.value.show(bindStatus)
      return
    }
  } else {
    loginRef.value.show()
    return
  }

  if (item.type === '1') {
    epoch2DRender.value.show(item, parameter)
  } else {
    const ip = await getTargetIP()

    if (ip) {
      location.href = `/Hyperdust/epoch/${item.sid}${parameter ? '?parameter=' + parameter : ''}`
    } else {
      createEpochTransaction.value.show(item, parameter)
    }
  }
}

async function getTargetIP() {
  const { result } = await api.get('/mgn/order/getTargetIP', {})
  return result
}

async function getApp(sid) {
  const { result } = await api.get('/mgn/globeApp/list', { sid })

  const app = result.records[0]

  return app
}

defineExpose({
  openApp,
})
</script>

<style></style>
