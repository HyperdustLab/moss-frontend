<template>
  <div class="flex flex-col items-center justify-center" v-if="show">
    <p class="text-center text-gray-400">© 2024 HYPERDUST FOUNDATION LTD. All rights reserved.</p>
    <a class="text-center text-gray-400 hover:text-gray-300" target="_blank" href="/privacyPolicy">Privacy Policy</a>
    <div class="flex items-center justify-center gap-4 mt-4">
      <a class="w-7 h-7" href="https://twitter.com/hyperdust" target="_blank"><img src="../assets/image/Twitter.png" alt="Twitter" /></a>
      <a class="w-6 h-6" href="https://t.me/hyperdust" target="_blank"><img src="../assets/image/telegram.png" alt="Telegram" /></a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createApp } from 'vue'

const show = ref(false)

// 等待主应用挂载完成
const waitForApp = () => {
  const checkApp = setInterval(() => {
    if (document.querySelector('#app').__vue_app__) {
      show.value = true
      clearInterval(checkApp)
    }
  }, 100)
}

waitForApp()
</script>
