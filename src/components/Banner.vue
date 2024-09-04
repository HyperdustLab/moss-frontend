<template>
  <div>
    <el-carousel indicator-position="none" :height="height" :interval="5000">
      <el-carousel-item v-for="(item, index) in bannerList" :key="index">
        <div style="width: 100%">
          <el-image :src="item.file" :style="{ height }" />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script lang="ts" setup>
import api from '@/utils/api'
import { ref, onBeforeMount } from 'vue'
const props = defineProps({
  type: { type: String, reuqired: true },
  height: { type: String, default: '300px' },
})

const bannerList = ref([])

onBeforeMount(() => {
  getBannerList()
})

async function getBannerList() {
  const { result } = await api.get('/mgn/banner/list', { type: props.type, column: 'orderNum', order: 'asc', pageSize: -1 })

  bannerList.value = result.records
}
</script>

<style></style>
