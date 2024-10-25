<template>
  <el-dialog v-model="visible" style="pointer-events: auto" width="35%">
    <div style="height: 300px">
      <el-image style="width: 100%; height: 100px" :src="logo" fit="contain" />

      <el-form label-width="120px" style="margin-top: 12%; margin-left: 10%">
        <el-form-item label-width="0px" style="margin-right: 6%; margin-top: 10%">
          <div style="cursor: pointer" @click="handleOK" class="btn flex-center ma">Launch</div>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { buildContract, exceptionHandling } from '@/utils/index'

import logo from '@/assets/layouts/logo-text-3.png?url'
import { ElLoading, ElMessage } from 'element-plus'

import { useUserStore } from '@/store/modules/user'

const visible = ref(false)

const balance = ref(null)

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const app = ref(null)

let gLoading = null

let parameter = null

async function show(item, _parameter) {
  parameter = _parameter
  gLoading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const user = useUserStore()
    const currBlockchainId = localStorage.getItem('currBlockchainId')

    app.value = item

    gLoading.close()

    visible.value = true
  } catch (e) {
    gLoading.close()
    exceptionHandling(e, t)
  }
}

async function handleOK() {
  location.href = `/Hyperdust/epoch/${app.value.sid}${parameter ? '?parameter=' + parameter : ''}`
}

defineExpose({
  show,
})
</script>

<style scoped lang="scss">
.btn {
  width: 198px;
  height: 42px;
  background: url('../../assets/image/btnBg.png') no-repeat center center;
  background-size: 100% 100%;
  font-size: 22px;
  font-family: Cabin, Cabin-SemiBold;
  font-weight: normal;
  text-align: LEFT;
  color: #ffffff;
}

.package {
  width: 1302px;

  .packageBox {
    .packageItem {
      background: url('../../assets/image/packageSelect.png') no-repeat center center;
      background-size: 100% 100%;
      width: 600px;

      &.active {
        background-image: url('../../assets/image/packageSelected.png');
      }

      .el-input-number {
        width: 100px;
      }

      p {
        font-size: 14px;
        font-family: Cabin, Cabin-Regular;
        font-weight: 400;
        text-align: LEFT;
        color: #ffffff;
        line-height: 16px;
      }

      h4 {
        font-size: 18px;
        font-family: Cabin, Cabin-Bold;
        font-weight: 700;
        text-align: LEFT;
        color: #ffffff;
        line-height: 21px;
      }

      .imageInfo {
        width: 312px;
        height: 242px;
        display: block;
      }
    }
  }

  .packageTitle {
    font-size: 32px;
    font-family: Cabin, Cabin-Bold;
    font-weight: 700;
    text-align: center;
    color: #ffffff;
    line-height: 38px;
  }
}
</style>
