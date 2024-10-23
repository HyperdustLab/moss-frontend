<script lang="ts" setup>
import { useTheme } from '@/hooks/useTheme'

// 将 Element Plus 的语言设置为中文
import en from 'element-plus/es/locale/lang/en'

const lang = localStorage.getItem('lang') || 'en-us'

import api from '@/utils/api'

import { onBeforeMount, ref } from 'vue'

const currBlockchainId = localStorage.getItem('currBlockchainId')

import { useUserStore } from '@/store/modules/user'

const isInitialized = ref(false)

onBeforeMount(async () => {
  await initBlockchain()
  await verificationToken()

  isInitialized.value = true
})

async function initBlockchain() {
  const { result } = await api.get('/mgn/blockchain/list', { pageSize: -1, status: 'Y' })

  const blockchainList = result.records

  if (currBlockchainId) {
    let len = blockchainList.filter((item) => item.id === currBlockchainId).length

    if (len === 0) {
      localStorage.setItem('currBlockchainId', blockchainList[0].id)
    }
  } else {
    localStorage.setItem('currBlockchainId', blockchainList[0].id)
  }
}

async function verificationToken() {
  if (!useUserStore().token) {
    return
  }

  const { result } = await api.get('/sys/verificationToken', {})

  if (result) {
    await useUserStore().getInfo()
  } else {
    useUserStore.logout()
  }
}

let locale = null

switch (lang) {
  case 'en-us':
    locale = en
    break
}

const { initTheme } = useTheme()

/** 初始化主题 */
initTheme()
</script>

<template>
  <ElConfigProvider v-if="isInitialized" :locale="locale">
    <router-view />

    <footer class="footer">
      <div class="footer-content">
        <a href="/privacyPolicy" target="_blank" class="footer-link">Privacy Policy</a>
        <span class="footer-copyright">&copy; 2024 HYPERDUST FOUNDATION LTD.. All rights reserved.</span>
      </div>
    </footer>
  </ElConfigProvider>
</template>
<style scoped>
.footer {
  background-color: #333; /* 更改为深色背景 */
  padding: 20px 0;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-link {
  color: #fff; /* 更改为浅色文字 */
  text-decoration: none;
  margin-right: 20px;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-copyright {
  color: #aaa; /* 更改为浅色文字 */
  font-size: 14px;
}
</style>
