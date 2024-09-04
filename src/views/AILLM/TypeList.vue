<template>
  <div>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleOpen">
      <el-menu-item index="1">Public</el-menu-item>
      <el-menu-item index="2">Private</el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, onBeforeMount, ref } from 'vue'

const emit = defineEmits(['open'])

const activeIndex = ref('1')

function handleOpen(index) {
  emit('open', index)
}
</script>

<style lang="scss" scoped>
::v-deep .el-menu--horizontal > .el-menu-item.is-active {
  border-bottom: 0px solid var(--el-menu-active-color);
  color: var(--el-menu-active-color) !important;
}

::v-deep .el-menu--horizontal {
  display: flex;
  flex-wrap: nowrap;
  border-bottom: solid 0px var(--el-menu-border-color);
  border-right: none;
}

::v-deep .el-menu--horizontal > .el-menu-item.is-active {
  border-bottom: #39b357c4;
  color: #39b357c4 !important;
}
</style>
