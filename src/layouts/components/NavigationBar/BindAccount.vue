<template>
  <el-dialog v-model="dialogVisible" title="Third-Party Login Management" @close="onClose" width="30%">
    <div class="flex items-center justify-center py-6">
      <div class="shadow-md rounded-lg w-full max-w-lg">
        <!-- Social Login Binding Section -->
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <img :src="googleIcon" alt="Google Logo" class="w-10 h-10 rounded-full mr-3" />
              <span class="text-lg font-medium text-gray-300">Google</span>
            </div>

            <button v-if="googleBound" @click="unBind('google')" class="bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none">Unbind</button>

            <button v-else @click="toBind('google')" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none">Bind</button>
          </div>

          <div class="flex items-center justify-between mt-20">
            <div class="flex items-center">
              <img :src="metamaskIcon" alt="Facebook Logo" class="w-10 h-10 rounded-full mr-3" />
              <span class="text-lg font-medium text-gray-300">MetaMask</span>
            </div>
            <button @click="unBind('metamask')" v-if="userStore.walletAddress" class="bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none">Unbind</button>

            <button v-else @click="toBind('metamask')" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none">Bind</button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup type="ts">
import { ref, reactive, nextTick, computed, onBeforeUnmount } from 'vue'

import metamaskIcon from '@/assets/image/metamask.png'
import googleIcon from '@/assets/image/google.png'

import { useUserStore } from '@/store/modules/user'

import { ElMessageBox } from 'element-plus'

import api from '@/utils/api'
const userStore = useUserStore()

const bindAccountList = ref([])

const googleBound = computed(() => bindAccountList.value.some((item) => item === 'google'))

const loading = ref(false)

const dialogVisible = ref(false)

function show() {
  dialogVisible.value = true

  listMyBindAccount()

  window.addEventListener('message', handleMessage, false)
}

async function listMyBindAccount() {
  const { result } = await api.get('/sys/user/listMyBindAccount')

  bindAccountList.value = result
}

function onClose() {
  dialogVisible.value = false
  window.removeEventListener('message', handleMessage, false)
}

function toBind(source) {
  if (source === 'metamask') {
    metamaskBind()
  } else {
    window.open(import.meta.env.VITE_BASE_API + '/sys/thirdLogin/render/' + source + '?token=' + userStore.token, source + 'Login', 'width=500,height=600')
  }
}

async function metamaskBind() {
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
  const { result } = await api.post('/sys/bindMetaMask', {
    address: accounts[0],
    signature: signature,
  })

  await useUserStore().getInfo()
}

async function unBind(source) {
  ElMessageBox.confirm('Are you sure you want to unbind this account?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      await api.get('/sys/user/unBind', { source })

      await useUserStore().getInfo()
      await listMyBindAccount()
    })
    .catch(() => {
      // Handle cancel action if needed
    })
}

function handleMessage(event) {
  // 你可以根据 event.origin 判断消息的来源是否是你信任的源
  // 例如: if (event.origin !== "https://your-trusted-domain.com") return;

  // 接收父窗口传递的数据
  var receivedData = event.data

  console.info(import.meta.env.VITE_BASE_API)
  console.info(event.origin)

  // 判断receivedData是否为JSON字符串
  let isJsonString = false
  try {
    const json = JSON.parse(receivedData)

    if (json.token) {
      listMyBindAccount()
    }
  } catch (e) {
    isJsonString = false
  }
}

defineExpose({
  show,
})
</script>

<style></style>
