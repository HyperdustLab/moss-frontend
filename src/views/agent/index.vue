<script lang="ts" setup>
import { onBeforeMount, reactive, ref, onMounted } from 'vue'

import { useI18n } from 'vue-i18n'

import { type GetTableData } from '@/api/table/types/table'
import { ElMessage, type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { toAmount } from '@/utils/index'
import Banner from '@/components/Banner.vue'
import FeaturedProduct from '@/components/FeaturedProduct.vue'

import { Search } from '@element-plus/icons-vue'

import Buy from './buy.vue'

const globeApp = ref(null)

const observerElement = ref(null)

const buy = ref(null)

const searchTxt = ref('')

let observer = null

const searchData = reactive({
  column: 'createTime',
  order: 'asc',
  type: '008003*',
  name: '',
})

const loading = ref<boolean>(false)

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

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

const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/platformNft/list', searchData)
  tableData.value.push(...result.records)
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
  searchData.name = ''

  if (searchTxt.value) {
    searchData.name = `*${searchTxt.value}*`
  }

  tableData.value = []

  paginationData.currentPage = 1

  getTableData()
}

function openBuy(item) {
  buy.value.show(item)
}

defineOptions({
  // 命名当前组件
  name: 'agent',
})
</script>

<template>
  <div class="app-container h-full">
    <Banner type="6"></Banner>
    <div class="flex items-center rounded w-full p-2">
      <div class="w-1.5/2 ml-0.2/2">
        <el-input v-model="searchTxt" :placeholder="$t('index.searchSpaceTxt')" clearable class="h-12 mt-11 rounded-search" size="large" @clear="handleSearch" @keyup.enter="handleSearch">
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
    </div>

    <section class="py-10 bg-gray-100 dark:bg-zinc-950 mt-30">
      <div class="mx-auto grid max-w-8xl grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <article class="rounded-xl dark:bg-black p-3 shadow-lg hover:shadow-xl hover:transform hover:scale-105 duration-300" v-for="(item, index) in tableData" :key="index">
          <div>
            <div class="relative flex items-end overflow-hidden rounded-xl">
              <img class="w-full h-120 object-cover" :src="item.coverImage" alt="Hotel Photo" />
            </div>

            <div class="mt-1 p-2">
              <h2 class="text-slate-700 dark:text-white">{{ item.name }}</h2>

              <div class="mt-3 flex items-end justify-between">
                <p class="text-lg font-bold text-[#4ceb75]">HYPT &nbsp;{{ toAmount(item.price) }}</p>

                <el-button type="primary" @click="openBuy(item)">Mint</el-button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <el-backtop :right="100" :bottom="100" />

    <Buy ref="buy"></Buy>
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
</style>
