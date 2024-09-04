<script lang="ts" setup>
import { ref } from "vue"

import QRCodeVue3 from "qrcode-vue3"

import useClipboard from "vue-clipboard3"

import { Share } from "@element-plus/icons-vue"

const baseURI = import.meta.env.VITE_BASE_API

import { useUserStore } from "@/store/modules/user"

const userStore = useUserStore()

const dialogVisible = ref(false)

const shareUrl = `${baseURI}/mgn/invite/${userStore.username}`
</script>

<template>
  <div>
    <el-tooltip effect="dark" content="Share" placement="bottom">
      <el-icon @click="dialogVisible = true" :size="20">
        <Share />
      </el-icon>
    </el-tooltip>

    <el-drawer v-model="dialogVisible" size="50%" :title="$t('share.title')">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="bg">
            <div class="qrCode">
              <QRCodeVue3 :width="100" :height="100" :value="shareUrl" />
            </div>
          </div>
        </el-col>
      </el-row>

      <template #footer> </template>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.bg {
  width: 100%;
  height: 800px;
  margin-top: 20px;
  background-image: url("../../../assets/image/Share_bg.png");
  background-size: 100% 100%;
  margin-left: 100px;
}

.qrCode {
  padding-left: 40%;
  padding-top: 75%;
}
</style>
