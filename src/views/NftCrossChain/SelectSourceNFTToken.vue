<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'SelectSourceNFTToken',
})

import { onBeforeMount, reactive, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import { type GetTableData } from '@/api/table/types/table'
import { ElMessage, type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { toAmount, toLocalTime, toServerTime } from '@/utils/index'

import Substring from '@/components/Substring.vue'

const emit = defineEmits(['ok'])

const { t } = useI18n()

const drawer = ref(false)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const searchData = reactive({
  owner: useUserStore().walletAddress || useUserStore().username,
  blockchainId: '',
  column: 'createTime',
  order: 'desc',
  contractAddress: '',
})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/nft/list', searchData)
  tableData.value = result.records
  paginationData.total = result.total
  loading.value = false
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

async function show(blockchainId, contractAddress) {
  drawer.value = true
  searchData.contractAddress = contractAddress
  searchData.blockchainId = blockchainId
  getTableData()
}

function ok(row) {
  emit('ok', row)
  drawer.value = false
}

defineExpose({
  show,
})

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: false })
</script>

<template>
  <el-dialog v-model="drawer" :title="$t('minerNode.minerNftPledge')" width="60%">
    <div class="app-container">
      <el-card v-loading="loading" shadow="never" class="search-wrapper">
        <el-form ref="searchFormRef" :inline="true" :model="searchData"></el-form>
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
            <el-table-column prop="coverImage" label="Cover Image" align="center">
              <template #default="{ row }">
                <el-image class="w-full h-[100px] object-cover" :src="row.coverImage"></el-image>
              </template>
            </el-table-column>

            <el-table-column width="160" label="Contract Address" align="center">
              <template #default="{ row }">
                <Substring :value="row.contractAddress"></Substring>
              </template>
            </el-table-column>

            <el-table-column prop="name" label="Name" align="center"></el-table-column>

            <el-table-column prop="tokenId" label="TokenId" align="center"></el-table-column>

            <el-table-column prop="blockchainId_dictText" label="Blockchain" align="center"></el-table-column>
            <el-table-column prop="createTime" :label="t('createTime')" align="center">
              <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>
            </el-table-column>

            <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
              <template #default="{ row }">
                <el-button @click="ok(row)" type="primary" link>Confirm</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pager-wrapper">
          <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </el-card>
    </div>
  </el-dialog>
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
</style>
