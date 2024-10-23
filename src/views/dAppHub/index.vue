<template>
  <div>
    <div style="position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; background-color: #141414">
      <div style="display: flex; justify-content: space-between">
        <img @click="href('https://www.hyperagi.network/')" style="width: 240px; height: 60px" :src="logo" />

        <el-dropdown @command="handleCommand" class="custom-dropdown w-50 ml-330">
          <span class="el-dropdown-link" style="margin-top: -5px; display: flex; align-items: center; margin-left: 20px">
            <el-avatar :size="13" :src="currBlockchain.icon" />

            <span style="margin-left: 10px">{{ currBlockchain.name }}</span>

            <el-icon size="13" class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(item, index) in blockchainList" :command="item.id" :style="{ 'margin-top': index === 0 ? '5px' : '10px' }" :key="index">
                <el-avatar :size="25" :src="item.icon" />

                <span style="font-size: 13px; margin-left: 10px"> {{ item.name }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown v-if="user.token" style="margin-left: 10px; width: 200px" class="custom-dropdown">
          <span class="el-dropdown-link" style="margin-top: -5px; display: flex; align-items: center; margin-left: 20px">
            <el-avatar :size="16" :src="user.avatar" />

            <span style="margin-left: 5px">
              <Substring :copys="false" color="#ffffff" fontSize="13px" :value="user.walletAddress || user.username"></Substring>
            </span>

            <el-icon size="13" class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-card style="width: 200px">
              <template #header>
                <div class="card-header" style="display: flex; align-items: center">
                  <el-avatar :size="25" :src="user.avatar" />

                  <span style="margin-left: 15px">
                    <Substring color="#ffffff" fontSize="12px" :value="user.walletAddress || user.username"></Substring>
                  </span>
                </div>
              </template>

              <p style="margin-left: 5px; display: flex; align-items: center">
                <el-icon size="20">
                  <User />
                </el-icon>

                <el-button type="plain" @click="goHome" style="font-size: 12px" link>{{ $t('index.dashboard') }}</el-button>
              </p>

              <p style="margin-left: 5px; display: flex; align-items: center; margin-top: 30px">
                <SvgIcon width="1.5em" height="1.5em" name="email" />

                <el-button type="plain" @click="showBindEmail" style="font-size: 12px" link>
                  {{ user.email || 'Bind Email' }}
                </el-button>
              </p>

              <p style="margin-left: 5px; display: flex; align-items: center; margin-top: 30px">
                <el-image :src="logoutPng" style="width: 20px; height: 20px"></el-image>

                <el-button type="plain" @click="disconnect" style="font-size: 12px" link>{{ $t('index.disconnect') }}</el-button>
              </p>
            </el-card>
          </template>
        </el-dropdown>

        <el-dropdown v-else style="margin-left: 10px; width: 160px; float: right" trigger="contextmenu" class="custom-dropdown">
          <span class="el-dropdown-link" @click="metamaskLogin" style="margin-top: -5px; display: flex; align-items: center; margin-left: 20px">
            <el-avatar :size="16" :src="metamask" />

            <span style="margin-left: 6px">{{ $t('index.connectWallet') }}</span>
          </span>
        </el-dropdown>
      </div>
    </div>

    <div class="app-container">
      <el-carousel indicator-position="none" height="600px" :interval="5000">
        <el-carousel-item v-for="(item, index) in bannerList" :key="index">
          <div style="width: 100%">
            <video @click="handleBanner(item)" loop :src="item.text.split(',')[0]" muted style="width: 100%" autoplay />
          </div>
        </el-carousel-item>
      </el-carousel>

      <el-card v-loading="loading" shadow="never" style="background-color: #010001">
        <div class="toolbar-wrapper">
          <div>
            <el-row style="margin-top: 40px">
              <el-col :span="24">
                <div style="margin-left: 13%">
                  <span style="font-size: 20px; font-weight: 100; margin-left: 30%">Hyperspace Scan</span>
                  <br />
                  <el-input v-model="searchData.searchTxt" :placeholder="$t('index.searchSpaceTxt')" clearable style="width: 1300px; height: 50px; margin-left: 10px; margin-top: 20px; background-color: #1d1e1f" size="large" class="rounded-search" @clear="handleSearch" @keyup.enter="handleSearch">
                    <template #append>
                      <el-button :icon="Search" @click="handleSearch" />
                    </template>
                  </el-input>
                </div>
              </el-col>
            </el-row>

            <el-row style="margin-top: 60px">
              <el-col :span="24">
                <AppTypeList @open="handleSelectAppType"></AppTypeList>
              </el-col>
            </el-row>

            <el-row style="margin-top: 20px">
              <el-col v-for="(item, index) in tableData" :span="8" :key="index">
                <el-card style="width: 97%; margin-top: 20px" :body-style="{ padding: '0px' }" @click="openApp(item.sid)">
                  <GlobeAppImage :value="item.coverImage" :image="item.image" :key="index"></GlobeAppImage>
                  <div style="padding: 14px">
                    <span style="font-size: 20px; font-weight: 1000"
                      >{{ item.name }}

                      <el-popover placement="right" :width="400" trigger="hover">
                        <template #reference>
                          <el-icon style="cursor: pointer; float: right"><Share /></el-icon>
                        </template>

                        <HShare :url="getHyperdustEpoch(item)" :title="item.name" :image="item.coverImage.split(',')[0]"></HShare>
                      </el-popover>
                    </span>

                    <div class="bottom">
                      <time class="time"
                        >SID：
                        <Substring :value="item.sid"></Substring>
                      </time>
                    </div>

                    <div class="bottom">
                      <time class="time"> {{ item.description }}</time>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <div ref="observerElement" class="observer"></div>

            <div v-if="loading" class="loading-indicator">{{ $t('loadingTxt') }}</div>
          </div>
          <div>
            <el-tooltip content="下载">
              <!-- <el-button type="primary" :icon="Download" circle /> -->
            </el-tooltip>
            <el-tooltip content="刷新当前页">
              <!-- <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" /> -->
            </el-tooltip>
          </div>
        </div>
        <div class="table-wrapper"></div>
      </el-card>
    </div>

    <GlobeApp ref="globeApp"></GlobeApp>

    <BindEmail ref="bindEmail"></BindEmail>

    <el-backtop :right="100" :bottom="100" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref, watch, onMounted } from 'vue'

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'

import { useUserStore } from '@/store/modules/user'

import api from '@/utils/api'

import logo from '@/assets/layouts/logo-text-1.png?url'

import { Search } from '@element-plus/icons-vue'

import AppTypeList from './appTypeList.vue'

import Substring from '@/components/substring.vue'

import GlobeAppImage from '../../../globeAppImage.vue'

import BindEmail from '@/layouts/components/NavigationBar/BindEmail.vue'

import logoutPng from '@/assets/image/logout.png?url'

import metamask from '@/assets/image/metamask.png?url'

import HShare from '@/components/Share.vue'
import GlobeApp from '@/components/GlobeApp.vue'

let observer = null

const observerElement = ref(null)

const bannerList = ref([])

import { metamaskLogin } from '@/api/login'

const searchData = reactive({
  status: 'Y',
  column: 'orderNum',
  order: 'asc',
  appTypeId: '',
  active: true,
  searchTxt: '',
})

const bindEmail = ref(null)

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        loadMoreItems()
      }
    },
    {
      root: null, // 视口作为滚动容器
      rootMargin: '0px',
      threshold: 0.1, // 当底部元素露出10%时触发
    }
  )

  if (observerElement.value) {
    observer.observe(observerElement.value)
  }

  getTableData()
})

const user = useUserStore()

const blockchainList = ref([])

const currBlockchainId = ref(localStorage.getItem('currBlockchainId'))

const currBlockchain = ref({})

const globeApp = ref(null)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

paginationData.pageSize = 6

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

onBeforeMount(async () => {
  bannerList.value = await api.getDictItems('banner_list')
  await getBlockchainList()
  handleCommand(currBlockchainId.value)
})

function handleFeaturedProduct(item) {
  openApp(item.parameter)
}

function goHome() {
  location.href = import.meta.env.VITE_USER + '/login?token=' + user.token
}

async function handleBanner(item) {
  const array = item.text.split(',')

  if (array.length < 2) {
    return
  }

  await openApp(array[1])
}

function handleCommand(command) {
  localStorage.setItem('currBlockchainId', command)
  currBlockchainId.value = command

  currBlockchain.value = blockchainList.value.filter((item) => item.id === currBlockchainId.value)[0]
}

async function loadMoreItems() {
  if (loading.value) {
    return
  }

  if (paginationData.pageCount < paginationData.currentPage + 1) {
    return
  }

  paginationData.currentPage++
  await getTableData()
}

const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/globeApp/list', searchData)
  tableData.value.push(...result.records)
  paginationData.total = result.total
  paginationData.pageCount = result.pages
  loading.value = false
}
const handleSearch = () => {
  if (searchData.searchTxt) {
    searchData.status = ''
  } else {
    searchData.status = 'Y'
  }

  tableData.value = []

  paginationData.currentPage = 1

  getTableData()
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function getHyperdustEpoch(record) {
  return location.origin + `/Hyperdust/epoch/${record.sid}`
}

function handleSelectAppType(index) {
  console.info(index)
  searchData.appTypeId = index
  handleSearch()
}

function openApp(sid) {
  globeApp.value.openApp(sid)
}

async function getBlockchainList() {
  const { result } = await api.get('/mgn/blockchain/list', { pageSize: -1, status: 'Y' })
  blockchainList.value = result.records
}

function disconnect() {
  user.logout()
}

function href(url) {
  location.href = url
}

function showBindEmail() {
  bindEmail.value.show()
}

//#endregion

/** 监听分页参数的变化 */
</script>

<style lang="scss" scoped>
:deep .el-input-group__append {
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  box-shadow:
    0 0 0 0 var(--el-input-border-color) inset,
    0 0 0 0 var(--el-input-border-color) inset,
    0 0 0 0 var(--el-input-border-color) inset;
}

:deep .el-input__wrapper {
  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 1px 11px;
  background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
  background-image: none;
  border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
  cursor: text;
  transition: var(--el-transition-box-shadow);
  transform: translate3d(0, 0, 0);
  //  box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
}

:deep .el-card {
  border-radius: var(--el-card-border-radius);
  border: 0px solid var(--el-card-border-color);
  background-color: var(--el-card-bg-color);
  overflow: hidden;
  color: var(--el-text-color-primary);
  transition: var(--el-transition-duration);
}

:deep .el-menu--horizontal {
  display: flex;
  flex-wrap: nowrap;
  border-bottom: solid 0px var(--el-menu-border-color);
  border-right: none;
}

.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
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

.time {
  font-size: 12px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button {
  padding: 0;
  min-height: auto;
}

.image {
  width: 400px;
  height: 200px;
  display: block;
}

::v-deep .el-dropdown-link--active,
::v-deep .el-dropdown-link:active,
::v-deep .el-dropdown-link:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.el-dropdown-link {
  font-size: 14px;

  padding-left: 6%;
}

.custom-dropdown {
  background-color: #303133;
  border-radius: 9999px;
  margin-top: 15px;
  height: 30px;
}

.loading-indicator {
  text-align: center;
  padding: 10px;
  font-size: 16px;
  color: white;
}
</style>
