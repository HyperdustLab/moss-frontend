<script lang="ts" setup>
import Substring from "@/components/Substring.vue";

defineOptions({
  // 命名当前组件
  name: 'NftCrossChain',
})

import {onBeforeMount, reactive, ref, watch, onMounted} from 'vue'

import {useI18n} from 'vue-i18n'


import {type GetTableData} from '@/api/table/types/table'
import {ElMessage, type FormInstance} from 'element-plus'
import {usePagination} from '@/hooks/usePagination'
import api from '@/utils/api'
import {useUserStore} from '@/store/modules/user'

import {CirclePlus, Search} from '@element-plus/icons-vue'

import {useRouter} from 'vue-router'
import {toLocalTime} from "@/utils";

const {t} = useI18n()

const router = useRouter()

const drawer = ref(false)


const loading = ref<boolean>(false)
const {paginationData, handleCurrentChange, handleSizeChange} = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const user = useUserStore();


const searchData = reactive({
  column: 'createTime',
  order: 'desc',
  account: user.username

})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const {result} = await api.get('/mgn/nftCrossChainRecord/list', searchData)
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


function show() {
  drawer.value = true
  getTableData()
}

defineExpose({show})


</script>

<template>


  <el-drawer
      v-model="drawer"
      size="80%"
      title="Transaction History"
  >

    <div class="app-container">


      <el-card v-loading="loading" shadow="never" class="search-wrapper">
        <el-form ref="searchFormRef" :inline="true" :model="searchData">
        </el-form>
      </el-card>
      <el-card v-loading="loading" shadow="never">
        <div class="toolbar-wrapper">
          <div>
            <div>
            </div>
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
        <div class="table-wrapper">
          <el-table :data="tableData">
            <el-table-column prop="sourceBlockchainId_dictText" label="Source Blockchain" align="center"></el-table-column>
            <el-table-column prop="sourceSmartContractAddress" label="Source Smart Contract Address" align="center">

              <template #default="{ row }">
                <Substring :value="row.sourceSmartContractAddress"></Substring>
              </template>

            </el-table-column>
            <el-table-column prop="sourceTokenId" label="Source Token Id" align="center"></el-table-column>
            <el-table-column prop="num" label="Num" align="center"></el-table-column>
            <el-table-column prop="targetBlockchainId_dictText" label="Target Blockchain" align="center"></el-table-column>
            <el-table-column prop="targetSmartContractAddress" label="Target Smart Contract Address" align="center">

              <template #default="{ row }">
                <Substring :value="row.targetSmartContractAddress"></Substring>
              </template>
            </el-table-column>
            <el-table-column prop="targetTokenId" label="Target Token Id" align="center"></el-table-column>
            <el-table-column prop="status_dictText" label="Status" align="center"></el-table-column>

            <el-table-column prop="transactionHash" label="Transaction Hash" align="center">

              <template #default="{ row }">
                <Substring :value="row.transactionHash"></Substring>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="CreateTime" align="center">

              <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>

            </el-table-column>
          </el-table>

          <div class="pager-wrapper mt-20">
            <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
          </div>

        </div>
      </el-card>


    </div>
  </el-drawer>
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
