<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/store/modules/settings'
import logo from '@/assets/layouts/logo.png?url'
import logoText1 from '@/assets/layouts/logo-text-1.png?url'
import logoText2 from '@/assets/layouts/logo-text-2.png?url'

interface Props {
  collapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapse: true,
})

const settingsStore = useSettingsStore()
const { layoutMode } = storeToRefs(settingsStore)

function href() {
  location.href = 'https://www.hyperagi.network/'
}
</script>

<template>
  <div class="layout-logo-container" :class="{ collapse: props.collapse, 'layout-mode-top': layoutMode === 'top' }">
    <transition name="layout-logo-fade">
      <img v-if="props.collapse" :src="logo" @click="href" style="width: 47px; height: 50px" class="layout-logo" />

      <img v-else @click="href" :src="layoutMode !== 'left' ? logoText2 : logoText1" class="layout-logo-text" />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.layout-logo-container {
  position: relative;
  width: 100%;
  height: var(--v3-header-height);
  line-height: var(--v3-header-height);
  background-color: transparent;
  text-align: center;
  overflow: hidden;
  .layout-logo {
    display: none;
    height: 59px;
    width: 47px;
  }
  .layout-logo-text {
    height: 50px;
    vertical-align: middle;
  }
}

.layout-mode-top {
  height: var(--v3-navigationbar-height);
  line-height: var(--v3-navigationbar-height);
}

.collapse {
  .layout-logo {
    width: 47px;
    height: 59px;
    vertical-align: middle;
    display: inline-block;
  }
  .layout-logo-text {
    display: none;
  }
}
</style>
