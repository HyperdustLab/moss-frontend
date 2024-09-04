<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'MinerNode',
})

import { onBeforeMount, reactive, ref, watch, onMounted } from 'vue'

import { useI18n } from 'vue-i18n'
import { ethers } from 'ethers'

import { toAmount } from '@/utils/index'

import { type GetTableData } from '@/api/table/types/table'
import { ElMessage, type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { CirclePlus, Search } from '@element-plus/icons-vue'

import Banner from '@/components/Banner.vue'
import FeaturedProduct from '@/components/FeaturedProduct.vue'

import { useRouter } from 'vue-router'

const { t } = useI18n()

const router = useRouter()

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const contractDeployment = ref(null)

const status = ref([])
const networkStatus = ref([])
const serviceStatus = ref([])

let observer = null

const observerElement = ref(null)

onBeforeMount(async () => {
  status.value = await api.getDictItems('MinerNode_status')
  networkStatus.value = await api.getDictItems('network_status')
  serviceStatus.value = await api.getDictItems('serviceStatus')
})

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
  column: 'createTime',
  order: 'desc',
})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/minerNode/list', searchData)
  tableData.value = result.records
  paginationData.total = result.total
  paginationData.pageCount = result.pages
  loading.value = false
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

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function handleFeaturedProduct(item) {
  window.open(item.parameter)
}
</script>

<template>
  <div class="app-container">
    <Banner type="4"></Banner>

    <FeaturedProduct type="4" style="margin-top: 20px" @click="handleFeaturedProduct"> </FeaturedProduct>

    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item>
          <el-input v-model="searchData.minerNodeId" :placeholder="t('placeholderTxt')" clearable style="width: 900px; margin-top: 20px; background-color: #1d1e1f" size="large" class="rounded-search" @clear="handleSearch" @keyup.enter="handleSearch">
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
          <el-table-column prop="minerNodeId" :label="t('minerNode.nodeId')" align="center"> </el-table-column>

          <el-table-column prop="networkStatus_dictText" :label="t('minerNode.networkStatus')" align="center"> </el-table-column>

          <el-table-column width="200" prop="hardwareinformation" :label="t('minerNode.hardwareinformation')" align="center">
            <template #default="{ row }">
              <p>CPU：{{ row.cpuNum }}{{ $t('selectreSourceType.core') }}</p>
              <p>{{ $t('selectreSourceType.memory') }}：{{ row.memoryNum }} MB</p>
              <p>{{ $t('selectreSourceType.hardDisk') }}{{ row.diskNum }} GB</p>
              <p>CUDA：{{ row.cudaNum }}</p>
              <p>{{ $t('selectreSourceType.videoMemory') }}：{{ row.videoMemory }} MB</p>
            </template>
          </el-table-column>

          <el-table-column prop="blockchain.name" :label="t('minerNode.blockchainNetwork')" align="center"> </el-table-column>

          <el-table-column prop="serviceStatus_dictText" :label="t('minerNode.serviceStatus')" align="center"> </el-table-column>
        </el-table>

        <div ref="observerElement" class="observer"></div>

        <div v-if="loading" class="loading-indicator">{{ $t('loadingTxt') }}</div>
      </div>
    </el-card>
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
