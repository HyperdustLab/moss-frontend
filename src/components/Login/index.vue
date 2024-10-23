<template>
  <el-dialog v-model="dialogVisible" title="Login" width="500">
    <div class="social-media-container">
      <div class="social-media-icon" @click="handleMetamaskLogin">
        <img :src="metamaskIcon" alt="social.name" />
        <span>Metamask Login</span>
      </div>

      <div class="social-media-icon" @click="loginWithGoogle">
        <img :src="googleIcon" alt="social.name" />
        <span>Google Login</span>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import metamaskIcon from '@/assets/image/metamask.png'
import googleIcon from '@/assets/image/google.png'

import { metamaskLogin } from '@/api/login'
import { useUserStore } from '@/store/modules/user'

import { ref } from 'vue'

const dialogVisible = ref(false)

const loginWithGoogle = () => {
  window.open(import.meta.env.VITE_BASE_API + '/sys/thirdLogin/render/google', 'googleLogin', 'width=500,height=600')
}

function show() {
  dialogVisible.value = true
}

async function handleMetamaskLogin() {
  await metamaskLogin()
  dialogVisible.value = false
}

defineExpose({
  show,
})

window.addEventListener(
  'message',
  (event) => {
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
        useUserStore().loginToken(json.token)
        location.href = '/'
      }
    } catch (e) {
      isJsonString = false
    }
  },
  false
)
</script>

<style scoped>
.social-media-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.social-media-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.social-media-icon img {
  width: 30px; /* You can set this to the size you need */
  height: 30px; /* Make sure this is the same as the width for a circle */
}

.social-media-icon span {
  margin-top: 8px;
  font-size: 12px;
}
</style>
