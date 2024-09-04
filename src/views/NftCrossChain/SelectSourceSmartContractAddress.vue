<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'SelectSourceSmartContractAddress',
})

import {onBeforeMount, reactive, ref, watch, onMounted} from 'vue'

import {useI18n} from 'vue-i18n'


import {type GetTableData} from '@/api/table/types/table'
import {ElMessage, type FormInstance} from 'element-plus'
import {usePagination} from '@/hooks/usePagination'
import api from '@/utils/api'

import {CirclePlus, Search} from '@element-plus/icons-vue'

import {useRouter} from 'vue-router'

const {t} = useI18n()

const router = useRouter()

const emit = defineEmits(['ok']);


const loading = ref<boolean>(false)
const {paginationData, handleCurrentChange, handleSizeChange} = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const dialogVisible = ref(false)


const searchData = reactive({
  column: 'createTime',
  order: 'desc',
  allowCrossChain: 'Y',
  blockchainId: ''

})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const {result} = await api.get('/mgn/smartContract/list', searchData)
  tableData.value = result.records
  paginationData.total = result.total
  paginationData.pageCount = result.pages
  loading.value = false
}


const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function show(targetBlockchainId) {
  dialogVisible.value = true
  searchData.blockchainId = targetBlockchainId
  getTableData()
}

function handleOK(row) {
  emit('ok', row.address)
  dialogVisible.value = false
}


defineExpose({
  show,
})


</script>

<template>

  <el-dialog v-model="dialogVisible" title="Select Target Smart Contract Address" width="65%">
    <div class="app-container">
      <el-card v-loading="loading" shadow="never" class="search-wrapper">
        <el-form ref="searchFormRef" :inline="true" :model="searchData">

          <el-form-item label="Smart Contract Name">
            <el-input v-model="searchData.name" :placeholder="t('placeholderTxt')"/>
          </el-form-item>

          <el-form-item label="Address">
            <el-input v-model="searchData.address" :placeholder="t('placeholderTxt')"/>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">{{ t('searchBtnTxt') }}</el-button>
            <!-- <el-button :icon="Refresh" @click="resetSearch">重置</el-button> -->
          </el-form-item>

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
            <el-table-column prop="name" label="Smart Contract Name" align="center"></el-table-column>
            <el-table-column prop="address" label="Address" align="center"></el-table-column>

            <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
              <template #default="{ row }">
                <el-button @click="handleOK(row)" type="primary" link>Confirm</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pager-wrapper">
            <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">Cancel</el-button>
      </span>
    </template>


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
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
