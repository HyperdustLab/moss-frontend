<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from 'vue'

import { useI18n } from 'vue-i18n'

import { type GetTableData } from '@/api/table/types/table'
import { ElMessage, type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import ServerRows from './serverRows.vue'

import GlobeApp from '@/components/GlobeApp.vue'
import Banner from '@/components/Banner.vue'
import FeaturedProduct from '@/components/FeaturedProduct.vue'
import TypeList from './TypeList.vue'
import Chat from './Chat.vue'
import Code from './Code.vue'

import { CirclePlus, Search } from '@element-plus/icons-vue'

const globeApp = ref(null)

defineOptions({
  // 命名当前组件
  name: 'AI LLM',
})

const { t } = useI18n()

const serverRows = ref(null)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const epoch2DRender = ref(null)

const selectModel = ref(null)

const modelKey = ref(0)

const askContent = ref('')

let sid

onBeforeMount(async () => {
  sid = await api.getDictText('sys_config', 'AI_SID')

  getTableData()
})

const searchData = reactive({
  type: '',
  name: '',
})
const getTableData = async () => {
  loading.value = true
  const { result } = await api.get('/mgn/petals/getHealthMonitor', searchData)
  const data = JSON.parse(result)

  if (searchData.name) {
    tableData.value = data.model_reports.filter(i => i.name.includes(searchData.name))
  } else {
    tableData.value = data.model_reports
  }

  tableData.value.sort((a, b) => {
    if (a.state === 'healthy' && b.state !== 'healthy') {
      return -1 // a 在 b 前面
    } else if (a.state !== 'healthy' && b.state === 'healthy') {
      return 1 // b 在 a 前面
    } else {
      return 0 // a 和 b 的 state 相同，保持原来的顺序
    }
  })

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

function openServerRows(row) {
  serverRows.value.show(row)
}

async function openEpoch2DRender(model) {
  globeApp.value.openApp(sid, model)
}

function handleFeaturedProduct(item) {
  handleSelectModel(item.parameter)
}

function loadProduct(data) {
  handleFeaturedProduct(data[0])
}

function openMiningByGenerate() {
  window.open('https://hyperdust-foundation.gitbook.io/run-a-hyperdust-node/')
}

function handleSelectModel(model) {
  modelKey.value++

  selectModel.value = model
}

function handleSend(text) {
  askContent.value = text
}
</script>

<template>
  <div class="app-container">
    <Banner type="1"></Banner>

    <FeaturedProduct type="1" style="margin-top: 20px" defaultOne @click="handleFeaturedProduct"> </FeaturedProduct>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="12">
          <Chat v-if="selectModel" @send="handleSend" :key="modelKey" :model="selectModel"></Chat>
        </el-col>
        <el-col :span="12">
          <Code v-if="selectModel" :model="selectModel" :ask-content="askContent"></Code>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-form ref="searchFormRef" :inline="true" :model="searchData">
            <!-- <el-form-item>
              <el-input v-model="searchData.name" :placeholder="t('placeholderTxt')" clearable style="width: 900px; margin-top: 20px; background-color: #1d1e1f" size="large" class="rounded-search" @clear="handleSearch" @keyup.enter="handleSearch">
                <template #append>
                  <el-button :icon="Search" @click="handleSearch" />
                </template>
              </el-input>
            </el-form-item> -->
          </el-form>
        </div>
      </div>

      <TypeList style="width: 500px; margin-top: 20px"></TypeList>

      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column prop="name" :label="$t('model_reports.name')" align="center" />
          <el-table-column prop="short_name" :label="$t('model_reports.short_name')" align="center" />
          <el-table-column prop="repository" :label="$t('model_reports.repository')" align="center" />
          <el-table-column :label="$t('model_reports.userAI')" align="center">
            <template #default="{ row }">
              <el-link :disabled="row.state !== 'healthy'" type="primary" @click="openEpoch2DRender(row.name)">
                {{ $t('model_reports.startAI') }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column prop="miningByGenerate" :label="$t('model_reports.miningByGenerate')" align="center">
            <template #default="{ row }">
              <el-link type="primary" @click="openMiningByGenerate">
                {{ $t('model_reports.miningByPurchaseTxt') }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column prop="dht_prefix" :label="$t('model_reports.dht_prefix')" align="center" />
          <el-table-column prop="state" :label="$t('model_reports.state')" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.state === 'healthy'" type="success">{{ row.state }}</el-tag>
              <el-tag v-else type="danger">{{ row.state }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="num_blocks" :label="$t('model_reports.num_blocks')" align="center" />

          <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
            <template #default="{ row }">
              <el-button type="primary" @click="openServerRows(row)" link>{{ t('model_reports.server_rows') }} </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <ServerRows ref="serverRows"></ServerRows>

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
</style>
