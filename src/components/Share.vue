<template>
  <div class="social-media-container">
    <div class="social-media-icon" @click="copyLink">
      <img :src="link" alt="social.name" />
      <span>{{ $t('appShare.copyLink') }}</span>
    </div>

    <div class="social-media-icon" @click="shareLinkedin">
      <img :src="linkedin" alt="social.name" />
      <span>{{ $t('appShare.Linkedin') }}</span>
    </div>

    <div class="social-media-icon" @click="shareTwitter">
      <img :src="Twitter" alt="social.name" />
      <span>{{ $t('appShare.Twitter') }}</span>
    </div>

    <div class="social-media-icon" @click="shareFacebook">
      <img :src="facebook" alt="social.name" />
      <span>{{ $t('appShare.Facebook') }}</span>
    </div>

    <div class="social-media-icon" @click="shareTelegram">
      <img :src="telegram" alt="social.name" />
      <span>{{ $t('appShare.telegram') }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import link from '@/assets/image/link.png'
import linkedin from '@/assets/image/linkedin.png'
import Twitter from '@/assets/image/Twitter.png'
import facebook from '@/assets/image/facebook.png'
import telegram from '@/assets/image/telegram.png'

import { ElMessage } from 'element-plus'

import useClipboard from 'vue-clipboard3'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { toClipboard } = useClipboard()

const props = defineProps({
  url: { type: String, reuqired: true },
  title: { type: String, reuqired: true },
  description: { type: String },
  image: { type: String },
})

async function copyLink() {
  // 复制
  await toClipboard(props.url)

  ElMessage.success(t('copiedSuccessfully'))
}

function shareFacebook() {
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(props.url))
}

function shareLinkedin() {
  window.open('http://www.linkedin.com/shareArticle?mini=true&amp;ro=true&amp;title=' + encodeURIComponent(props.title) + '&url=' + encodeURIComponent(props.url) + '&summary=' + encodeURIComponent(props.description) + '&source=' + encodeURIComponent(location.href) + '&armin=armin')
}

function shareTwitter() {
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(props.title) + '&url=' + encodeURIComponent(props.url) + '&via=' + encodeURIComponent(location.href))
}

function shareTelegram() {
  window.open(`https://t.me/share/url?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`)
}
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
