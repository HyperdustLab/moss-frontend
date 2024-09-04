<template>
  <div style="background-color: black; height: 1000px">
    <div class="package ma" style="margin-left: 20px">
      <div class="packageBox flex-between">
        <div class="packageItem border-box" style="margin-top: 30px" v-for="(item, index) in nodeProductList" :key="index" :class="{ active: index == 1 }">
          <el-image :src="item.coverImage" class="imageInfo ma" style="margin-top: 30px"></el-image>

          <div class="flex-between" style="margin-top: 20px">
            <h4 style="margin-left: 10px">{{ item.name }}</h4>
            <div class="flex-start" style="padding-right: 10px">
              <p>{{ $t('buyMinner.num') }}：</p>
              <el-input-number v-model="item.num" :min="1" :step="1" step-strictly size="small" class="el-input-number" />
            </div>
          </div>

          <p style="margin-top: 20px; margin-left: 20px">{{ item.remark }}</p>

          <div>
            <p v-if="item.num" style="margin-top: 20px; float: left; margin-left: 20px">
              <span> {{ $t('buyMinner.payAmount') }}&nbsp;{{ toAmount(item.num * item.price) }} USDT</span>
            </p>

            <div style="cursor: pointer; float: right; margin-bottom: 20px" class="btn flex-center ma" @click="onSubmit(item)">
              {{ $t('buyMinner.buyBtnTxt') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="$t('buyMinner.buySuccess')" width="30%">
      <span>{{ $t('buyMinner.becomeMiner') }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="goHome">{{ $t('buyMinner.goHome') }}</el-button>
          <el-button @click="goNodeService" type="primary"> {{ $t('buyMinner.goNodeService') }} </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onBeforeMount } from 'vue'

import { ethers } from 'ethers'

import { buildContract, toAmount, exceptionHandling } from '@/utils/index'

import { useI18n } from 'vue-i18n'

import { useRouter } from 'vue-router'

const router = useRouter()

const dialogVisible = ref(false)

let blockchainId

onBeforeMount(async () => {
  blockchainId = await api.getDictText('sys_config', 'node_service_blockchain')
  getNodeProductList(blockchainId)
})

import api from '@/utils/api'

import { ElMessage, ElLoading } from 'element-plus'

const nodeProductList = ref([])
const nodeProduct = ref(null)

async function getNodeProductList(blockchainId) {
  const { result } = await api.get('/mgn/nodeProduct/list', { pageSize: -1, blockchainId })
  nodeProductList.value = result.records
}

async function handleAuthorized(address, amount) {
  const { result } = await api.get('/mgn/smartContract/list', { code: 'USDT', pageSize: 1 })

  const provider = new ethers.BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()

  console.info(blockchainId)

  const USDT = await buildContract(blockchainId, 'USDT')

  const allowance = await USDT.allowance(signer.getAddress(), address)

  if (allowance >= ethers.parseEther(amount.toString())) {
    return
  }

  await (await USDT.approve(address, ethers.parseEther('9999999999'))).wait()
}

function goHome() {
  location.href = '/'
}

function goNodeService() {
  router.push('/modeService/index')
}

// do not use same name with ref
const form = reactive({
  nodeProductId: null,
  num: 1,
})

async function onSubmit(item) {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const Hyperdust_Node_Service = await buildContract(item.blockchainId, 'Hyperdust_Node_Service')

    await handleAuthorized(Hyperdust_Node_Service.target, item.num * item.price)

    await (await Hyperdust_Node_Service.buy(item.nodeProductId, item.num)).wait()
    loading.close()
    dialogVisible.value = true
  } catch (e) {
    loading.close()
    exceptionHandling(e, t)
  }
}
</script>

<style scoped lang="scss">
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

      .btn {
        width: 148px;
        height: 42px;
        background: url('../../assets/image/btnBg.png') no-repeat center center;
        background-size: 100% 100%;
        font-size: 22px;
        font-family: Cabin, Cabin-SemiBold;
        font-weight: normal;
        text-align: LEFT;
        color: #ffffff;
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
