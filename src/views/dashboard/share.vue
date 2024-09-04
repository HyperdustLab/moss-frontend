<template>
  <div>
    <div v-if="isPC" class="app-container">
      <el-card shadow="never" class="bg">
        <div class="qrCode">
          <QRCodeVue3 :width="100" :height="100" :value="shareUrl" />
        </div>

        <div class="shareUrl">
          <el-input v-model="shareUrl" style="width: 800px" @click="copy" class="my-input" readonly>
            <template #suffix>
              <el-icon style="cursor: pointer; color: white" @click="copy" class="el-input__icon"><DocumentCopy /></el-icon>
            </template>
          </el-input>
        </div>
      </el-card>
    </div>

    <div v-else class="app-mobile-container">
      <el-card shadow="never" class="mobileBG">
        <div class="mobileQRCode">
          <QRCodeVue3 :width="100" :height="100" :value="shareUrl" />
        </div>

        <div class="mobileShareUrl">
          <el-input v-model="shareUrl" style="width: 300px" @click="copy" class="my-mobile-input" readonly>
            <template #suffix>
              <el-icon style="cursor: pointer; color: white" @click="copy" class="el-input__icon"><DocumentCopy /></el-icon>
            </template>
          </el-input>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import QRCodeVue3 from 'qrcode-vue3'

import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

import { useRoute } from 'vue-router'

const route = useRoute()

import { ElMessage } from 'element-plus'

import { DocumentCopy } from '@element-plus/icons-vue'

const baseURI = window.origin

import { useI18n } from 'vue-i18n'

import XEUtils from 'xe-utils'
import { ref } from 'vue'

const isPC = ref(false)

isPC.value = !XEUtils.browse().isMobile

const { t } = useI18n()

const shareUrl = `${baseURI}/invite/${route.params.walletAddress}`

async function copy() {
  await toClipboard(shareUrl)
  ElMessage.success(t('share.copySuccess'))
}
</script>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.bg {
  background-image: url('../../assets/image/web1.png');
  background-size: contain;
  height: 700px;
  margin-left: 10%;
  background-position: center; /* 添加这一行 */
  width: 80%;
}

.qrCode {
  top: 42%;
  left: 46%;
  cursor: pointer;
  position: absolute;
}

.shareUrl {
  top: 68%;
  left: 30%;
  cursor: pointer;
  position: absolute;
}
.my-input ::v-deep .el-input__inner {
  font-size: 26px;
  color: #ff9900;
  font-weight: 700;
}

.app-container {
  padding: 20px;
  height: 900px;
  background-color: black;
}

.mobileBG {
  background-image: url('../../assets/image/Mobile1.png');
  background-size: cover;
  height: 850px;
  background-position: center;
  width: 100%;
}

.mobileQRCode {
  top: 70%;
  left: 40%;
  cursor: pointer;
  position: absolute;
}

.app-mobile-container {
  padding: 0px;
  height: 800px;
  background-color: black;
}
.mobileShareUrl {
  top: 100%;
  left: 10%;
  cursor: pointer;
  position: absolute;
}

.my-mobile-input ::v-deep .el-input__inner {
  font-size: 16px;
  width: 100px;
  color: #ff9900;
  font-weight: 900;
  padding-left: 20%;
}
</style>
