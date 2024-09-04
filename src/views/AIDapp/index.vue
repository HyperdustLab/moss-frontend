<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'AIDapp',
})

import { reactive, ref, watch, onMounted } from 'vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import Banner from '@/components/Banner.vue'
import FeaturedProduct from '@/components/FeaturedProduct.vue'

import Substring from '@/components/Substring.vue'

import GlobeApp from '@/components/GlobeApp.vue'

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

import { buildContract, toLocalTime } from '@/utils/index.ts'

import { CirclePlus, Search } from '@element-plus/icons-vue'

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const name = ref(null)

const spaceForm = ref(null)

const globeApp = ref(null)

let observer = null

const observerElement = ref(null)

onMounted(() => {
  observer = new IntersectionObserver(
    entries => {
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

const searchData = reactive({
  appTypeCode: 'AI',
  searchTxt: '',
})

const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function openSpace(sid) {
  globeApp.value.openApp(sid)
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

function handleFeaturedProduct(item) {
  openSpace(item.parameter)
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
  if (name.value) {
    searchData.name = `*${name.value}*`
  } else {
    delete searchData.name
  }
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

function showSpaceForm(record) {
  spaceForm.value.show(record)
}

//#endregion
</script>

<template>
  <div class="app-container">
    <Banner type="2"></Banner>

    <FeaturedProduct type="2" style="margin-top: 20px" @click="handleFeaturedProduct"> </FeaturedProduct>

    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item>
          <el-input v-model="searchData.searchTxt" :placeholder="$t('index.searchSpaceTxt')" clearable style="width: 900px; margin-top: 20px; background-color: #1d1e1f" size="large" class="rounded-search" @clear="handleSearch" @keyup.enter="handleSearch">
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div></div>
        <div>
          <el-tooltip content="下载">
            <!-- <el-button type="primary" :icon="Download" circle /> -->
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <!-- <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" /> -->
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column :label="t('space.coverImage')" align="center">
            <template #default="{ row }">
              <el-image style="width: 100px; height: 100px" :src="row.coverImage.split(',')[0]" fit="contain" />
            </template>
          </el-table-column>

          <el-table-column :label="t('space.image')" align="center">
            <template #default="{ row }">
              <el-image v-if="row.image" style="width: 100px; height: 100px" :src="row.image" fit="contain" />
            </template>
          </el-table-column>

          <el-table-column prop="sid" :label="t('space.sid')" align="center">
            <template #default="{ row }">
              <Substring :value="row.sid" />
            </template>
          </el-table-column>

          <el-table-column prop="name" :label="t('space.name')" align="center" />

          <el-table-column prop="transactionHash" :label="t('space.transactionHash')" align="center">
            <template #default="{ row }">
              <Substring :value="row.transactionHash"></Substring>
            </template>
          </el-table-column>

          <el-table-column prop="blockchainId_dictText" :label="t('space.blockchainNetwork')" align="center" />

          <el-table-column prop="createTime" :label="t('createTime')" align="center">
            <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
            <template #default="{ row }">
              <el-button type="text" @click="openSpace(row.sid)">{{ t('space.start') }}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div ref="observerElement" class="observer"></div>

        <div v-if="loading" class="loading-indicator">{{ $t('loadingTxt') }}</div>
      </div>
    </el-card>

    <SpaceForm @ok="resetSearch" ref="spaceForm"> </SpaceForm>

    <GlobeApp ref="globeApp"></GlobeApp>
  </div>
</template>

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

::v-deep .el-card {
  border-radius: var(--el-card-border-radius);
  border: 0px solid var(--el-card-border-color);
  background-color: black;
  overflow: hidden;
  color: var(--el-text-color-primary);
  transition: var(--el-transition-duration);
}

.loading-indicator {
  text-align: center;
  padding: 10px;
  font-size: 16px;
  color: white;
}
</style>
