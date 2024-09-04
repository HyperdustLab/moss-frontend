<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from 'vue'

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance } from 'element-plus'

defineOptions({
  // 命名当前组件
  name: 'ServerRows',
})

const loading = ref<boolean>(false)

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

import api from '@/utils/api'

const drawer = ref(false)

const record = ref({})

const coverImage = ref(null)

function show(_record) {
  console.log(_record)

  tableData.value = _record.server_rows
  drawer.value = true

  getCoverImage(_record.name)
}

async function getCoverImage(name) {
  const { result } = await api.get('/mgn/featuredProduct/list', { parameter: name, pageSize: -1 })

  coverImage.value = result.records[0].coverImage
}

defineExpose({
  show,
})
</script>

<template>
  <el-drawer v-model="drawer" size="80%" :title="$t('server_rows.title')">
    <template #header="{ close, titleId, titleClass }">
      <h1 :id="titleId" style="font-size: 2rem; color: #4ceb75">{{ $t('server_rows.title') }}</h1>
    </template>

    <div class="app-container">
      <el-card>
        <div style="display: flex; align-items: center">
          <el-image :src="coverImage" style="width: 10rem; height: 6rem"></el-image>

          <el-text class="mx-1" style="font-size: 1.5rem; margin-left: 1rem" size="large">{{ record.name }}</el-text>
        </div>
      </el-card>

      <!-- <el-card v-loading="loading" shadow="never" class="search-wrapper">
        <el-form ref="searchFormRef" :inline="true" :model="searchData"></el-form>
      </el-card> -->

      <el-card>
        <div class="table-wrapper">
          <el-table :data="tableData">
            <el-table-column prop="short_peer_id" :label="$t('server_rows.short_peer_id')" align="center" />
            <el-table-column prop="peer_id" :label="$t('server_rows.peer_id')" align="center" />
            <el-table-column prop="state" :label="$t('server_rows.state')" align="center" />
            <el-table-column prop="throughput" :label="$t('server_rows.throughput')" align="center">
              <template #default="{ row }"> {{ row.span.server_info.throughput }} tok/s</template>
            </el-table-column>

            <el-table-column :label="$t('server_rows.servedBlocks')" align="center">
              <template #default="{ row }"> {{ row.span.start }}-{{ row.span.end }}</template>
            </el-table-column>
          </el-table>
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
</style>
