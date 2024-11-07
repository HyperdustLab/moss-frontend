<script lang="ts" setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'
import { useUserStore } from '@/store/modules/user'
import Hamburger from '../Hamburger/index.vue'
import Share from '../Share/index.vue'
import Breadcrumb from '../Breadcrumb/index.vue'
import Sidebar from '../Sidebar/index.vue'
import ThemeSwitch from '@/components/ThemeSwitch/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import Notify from '@/components/Notify/index.vue'
import { DeviceEnum } from '@/constants/app-key'
import UploadAvatar from './uploadAvatar.vue'
import BindEmail from './BindEmail.vue'
import IntroductionBindAccount from '@/components/IntroductionBindAccount/index.vue'

import { getBindStatus } from '@/api/login'

import Login from '@/components/login/index.vue'

import api from '@/utils/api'

import Substring from '@/components/substring.vue'

import BindAccount from './BindAccount.vue'

import logoutPng from '@/assets/image/logout.png?url'

const introductionBindAccountRef = ref(null)

const router = useRouter()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const bindAccountRef = ref(null)

const loginRef = ref(null)

const bindEmail = ref(null)

const uploadAvatar = ref(null)

const { sidebar, device } = storeToRefs(appStore)
const { layoutMode, showNotify, showThemeSwitch, showScreenfull } = storeToRefs(settingsStore)

const isTop = computed(() => layoutMode.value === 'top')
const isMobile = computed(() => device.value === DeviceEnum.Mobile)

const blockchainList = ref([])

const currBlockchainId = ref(localStorage.getItem('currBlockchainId'))

const currBlockchain = ref({})

/** 切换侧边栏 */
const toggleSidebar = () => {
  appStore.toggleSidebar(false)
}

function disconnect() {
  userStore.logout()
}

function goHome() {
  location.href = import.meta.env.VITE_USER + '/login?token=' + userStore.token
}

async function getBlockchainList() {
  const { result } = await api.get('/mgn/blockchain/list', { pageSize: -1, status: 'Y' })
  blockchainList.value = result.records
}

function showBindAccount() {
  introductionBindAccountRef.value.show('metamask')
}

onMounted(async () => {
  await getBlockchainList()

  currBlockchain.value = blockchainList.value.filter((item) => item.id === currBlockchainId.value)[0]

  nextTick(async () => {
    if (userStore.token) {
      const bindStatus = await getBindStatus()

      console.info('bindStatus:', bindStatus)

      if (bindStatus !== 'none') {
        introductionBindAccountRef.value.show(bindStatus)
      }
    }
  })
})

function handleCommand(command) {
  localStorage.setItem('currBlockchainId', command)
  currBlockchainId.value = command

  currBlockchain.value = blockchainList.value.filter((item) => item.id === currBlockchainId.value)[0]
}

function showUploadAvatar() {
  uploadAvatar.value.show()
}

function showBindEmail() {
  introductionBindAccountRef.value.show('email')
}

function showLogin() {
  loginRef.value.show()
}
</script>

<template>
  <div class="navigation-bar flex justify-between items-center bg-gray-800 h-16">
    <Hamburger v-if="!isTop || isMobile" :is-active="sidebar.opened" class="hamburger" @toggle-click="toggleSidebar" />
    <Breadcrumb v-if="!isTop || isMobile" class="breadcrumb" />
    <Sidebar v-if="isTop && !isMobile" class="sidebar" />
    <div class="right-menu flex items-center space-x-4">
      <Screenfull v-if="showScreenfull" class="right-menu-item" />
      <ThemeSwitch v-if="showThemeSwitch" class="right-menu-item" />
      <Notify v-if="showNotify" class="right-menu-item" />

      <div class="w-52">
        <el-dropdown @command="handleCommand" class="bg-[#303133] rounded-full h-7 w-40">
          <span class="el-dropdown-link flex items-center justify-center">
            <el-avatar :size="20" :src="currBlockchain.icon" />
            <span class="ml-2 w-full text-center">{{ currBlockchain.name }}</span>
            <el-icon size="13" class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(item, index) in blockchainList" :command="item.id" :style="{ 'margin-top': index === 0 ? '5px' : '10px' }" :key="index">
                <el-avatar :size="25" :src="item.icon" />
                <span class="text-sm ml-2.5 w-full text-center"> {{ item.name }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-dropdown v-if="userStore.token" class="bg-gray-800 rounded-full w-52 h-7">
        <span class="el-dropdown-link mt-[-5px] flex items-center ml-5">
          <el-avatar :size="16" :src="userStore.avatar" />
          <span class="ml-1.25">
            <Substring :copys="false" color="#ffffff" fontSize="13px" :value="userStore.walletAddress || userStore.email"></Substring>
          </span>
          <el-icon size="13" class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-card class="w-75">
            <template #header>
              <div class="card-header flex items-center">
                <el-avatar :size="25" :src="userStore.avatar" />
                <span class="ml-3.75">
                  <Substring color="#ffffff" fontSize="12px" :value="userStore.walletAddress || userStore.email"></Substring>
                </span>
              </div>
            </template>

            <p class="ml-1.25 flex items-center">
              <el-icon size="20">
                <User />
              </el-icon>
              <el-button type="plain" @click="goHome" class="text-xs" link>{{ $t('index.dashboard') }}</el-button>
            </p>

            <!-- <p class="ml-1.25 flex items-center mt-7.5">
              <SvgIcon width="1.5em" height="1.5em" name="email" />
              <el-button type="plain" @click="showBindAccount" class="text-xs" link> Bind / Unbind </el-button>
            </p> -->

            <p class="ml-1.25 flex items-center mt-7.5">
              <SvgIcon width="1.5em" height="1.5em" name="email" />
              <el-button type="plain" @click="showBindEmail" class="text-xs" link>
                {{ userStore.email || 'Bind Email' }}
              </el-button>
            </p>

            <p v-if="!userStore.walletAddress" class="ml-1.25 flex items-center mt-7.5">
              <el-icon size="20">
                <SvgIcon width="1.5em" height="1.5em" name="metamask" />
              </el-icon>
              <el-button type="plain" @click="showBindAccount" class="text-xs" link> Bind Wallet </el-button>
            </p>

            <p class="ml-1.25 flex items-center mt-7.5">
              <el-icon size="20">
                <Edit />
              </el-icon>
              <el-button type="plain" @click="showUploadAvatar" class="text-xs" link>
                {{ $t('index.uploadAvatar') }}
              </el-button>
            </p>

            <p v-if="userStore.invitationCode" class="ml-1.25 flex items-center mt-7.5">
              <el-icon :size="20">
                <Share />
              </el-icon>
              <text class="ml-0.5">Invitation Code：</text>
              <Substring :sub="false" :value="userStore.invitationCode"></Substring>
            </p>

            <p class="ml-1.25 flex items-center mt-7.5">
              <el-image :src="logoutPng" class="w-5 h-5"></el-image>
              <el-button type="plain" @click="disconnect" class="text-xs" link>
                {{ $t('index.disconnect') }}
              </el-button>
            </p>
          </el-card>
        </template>
      </el-dropdown>

      <el-dropdown v-else class="bg-[#303133] rounded-full w-30 h-7" trigger="contextmenu">
        <span class="el-dropdown-link mt-1 flex items-center text-center ml-20%" @click="showLogin">
          <span class="ml-1.5 text-center">Login</span>
        </span>
      </el-dropdown>
    </div>

    <UploadAvatar ref="uploadAvatar"></UploadAvatar>
    <Login ref="loginRef"></Login>
    <BindAccount ref="bindAccountRef"></BindAccount>
    <IntroductionBindAccount ref="introductionBindAccountRef"></IntroductionBindAccount>
  </div>
</template>

<style lang="scss" scoped>
::v-deep .el-dropdown-link--active,
::v-deep .el-dropdown-link:active,
::v-deep .el-dropdown-link:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

::v-deep .el-avatar {
  --el-avatar-text-color: var(--el-color-white);
  --el-avatar-bg-color: var(--el-text-color-disabled);
  --el-avatar-text-size: 14px;
  --el-avatar-icon-size: 18px;
  --el-avatar-border-radius: var(--el-border-radius-base);
  --el-avatar-size-large: 56px;
  --el-avatar-size-small: 24px;
  --el-avatar-size: 40px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  color: var(--el-avatar-text-color);
  background: var(--el-avatar-bg-color);
  width: var(--el-avatar-size);
  /* height: var(--el-avatar-size); */
}

.el-dropdown-link {
  font-size: 14px;
  padding-top: 2%;
}

.el-dropdown-link {
  font-size: 14px;
  padding-top: 2%;
  padding-left: 10%;
  cursor: pointer;
}

.custom-dropdown {
  background-color: #303133;
  border-radius: 9999px;
  width: 260px;
  height: 30px;
}

.navigation-bar {
  height: var(--v3-navigationbar-height);
  overflow: hidden;
  background: var(--v3-header-bg-color);
  display: flex;
  justify-content: space-between;

  .hamburger {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 15px;
    cursor: pointer;
  }

  .breadcrumb {
    flex: 1;
    // 参考 Bootstrap 的响应式设计将宽度设置为 576
    @media screen and (max-width: 576px) {
      display: none;
    }
  }

  .sidebar {
    flex: 1;
    // 设置 min-width 是为了让 Sidebar 里的 el-menu 宽度自适应
    min-width: 0px;

    :deep(.el-menu) {
      background-color: transparent;
    }

    :deep(.el-sub-menu) {
      &.is-active {
        .el-sub-menu__title {
          color: var(--el-menu-active-color) !important;
        }
      }
    }
  }

  .right-menu {
    margin-right: 10px;
    height: 100%;
    display: flex;
    align-items: center;
    color: #606266;

    .right-menu-item {
      padding: 0 10px;
      cursor: pointer;

      .right-menu-avatar {
        display: flex;
        align-items: center;

        .el-avatar {
          margin-right: 10px;
        }

        span {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
