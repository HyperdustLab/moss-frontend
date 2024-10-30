<template>
  <el-dialog v-model="visible" class="pointer-events-auto" width="35%" title="Play from cloud of HyperAGI">
    <div class="h-120">
      <el-image class="w-full h-25" :src="logo" fit="contain" />

      <el-form :model="form" class="mt-50 ml-10">
        <el-form-item class="ml-51" label="Epoch">
          <template #label>
            <el-tooltip class="box-item" effect="dark" :content="$t('selectSourceType.epochTxt')" placement="top-start">
              <span>
                Epoch
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </span>
            </el-tooltip>
          </template>
          <el-input-number v-if="epochMaxNum" v-model="form.epoch" @change="calculateCommission" :min="1" :max="epochMaxNum" />
        </el-form-item>

        <el-form-item class="ml-51 mt-5" label="Est HyperGas Fee：">
          <el-tooltip class="box-item" effect="dark" content="The actual payment amount is based on the current network difficulty" placement="top-start">
            <span>
              {{ toAccountAmount(totalPrice) }}HYPT
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </span>
          </el-tooltip>
        </el-form-item>

        <el-form-item label-width="0px" class="mr-6 mt-50">
          <div class="cursor-pointer btn flex-center ma" @click="handleOK">
            {{ $t('selectSourceType.browseMap') }}
          </div>
        </el-form-item>

        <el-form-item label-width="0px" class="ml-51">
          <div class="text-center mt-5">
            Need assistance? Click
            <a class="ml-2 text-blue-500 underline" href="https://hyperdust-foundation.gitbook.io/hyperagi-docs-and-guides" target="_blank">here</a>
            for help.
          </div>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeMount } from 'vue'
import api from '@/utils/api'
import { ElLoading, ElMessage } from 'element-plus'
import { buildContract, exceptionHandling, checkBalance, toAccountAmount, secondsToMinutesAndSeconds } from '@/utils/index'

import { ethers } from 'ethers'

import logo from '@/assets/layouts/logo.gif?url'

import { useI18n } from 'vue-i18n'

const visible = ref(false)

const maxCommission = ref(null)

const { t } = useI18n()

const epochMaxNum = ref(null)

const app = ref(null)

const currBlockchainId = ref(localStorage.getItem('currBlockchainId'))

let gLoading = null

let commission = null

const form = reactive({
  epoch: 1,
})

const totalPrice = ref(null)

let parameter

onBeforeMount(async () => {
  const { result } = await api.get('/mgn/transactionCfg/getMaxTransactionFee', {
    key: 'epoch',
    blockchainId: currBlockchainId.value,
  })

  maxCommission.value = result
})

async function show(item, _parameter) {
  parameter = _parameter
  currBlockchainId.value = localStorage.getItem('currBlockchainId')

  const { result } = await api.get('/mgn/transactionCfg/getTransactionFee', {
    key: 'epoch',
    blockchainId: currBlockchainId.value,
  })

  commission = result

  calculateCommission(1)

  app.value = item

  visible.value = true

  const _epochMaxNum = await getEpochMaxNum()

  epochMaxNum.value = _epochMaxNum
}

async function getMinerNode() {
  // @ts-ignore
  const { result } = await api.get('/mgn/minerNode/preemption', {})

  return result
}

async function handleOK() {
  try {
    gLoading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    await createOrder(form)
  } catch (e) {
    gLoading.close()

    console.info(e)
    exceptionHandling(e, t)
  }
}

function toGetHYPT() {
  return location.origin + '/faucet/index'
}

async function createOrder(item) {
  if (!item.epoch) {
    ElMessage.warning(t('selectSourceType.durationRuleTxt'))
    return
  }
  const result = await getMinerNode()

  if (!result.node) {
    const time = secondsToMinutesAndSeconds(result.waitingTime)

    ElMessage.warning(`The local network is busy. Estimated waiting time: ${time}`)

    gLoading.close()

    return
  }

  const minerNode = result.node

  const HyperAGI_Epoch_Transaction = await buildContract(currBlockchainId.value, 'HyperAGI_Epoch_Transaction')

  // 确保 maxCommission.value 和 item.epoch 是数字或可以转换为数字的字符串
  const maxCommissionValue = maxCommission.value.toString()
  const epochValue = BigInt(item.epoch.toString())

  // 计算 ETH 数量（以 wei 为单位）
  const ethAmountWei = ethers.parseEther(maxCommissionValue)

  // 使用 BigInt 进行乘法计算
  const ethAmount = ethAmountWei * epochValue

  await checkBalance(ethAmount)

  await (await HyperAGI_Epoch_Transaction.createEpochTransaction(minerNode.minerNodeId, item.epoch, { value: ethAmount })).wait()

  gLoading.close()

  location.href = `/Hyperdust/epoch/${app.value.sid}${parameter ? '?parameter=' + parameter : ''}`
}

async function getEpochMaxNum() {
  const HyperAGI_Epoch_Transaction = await buildContract(currBlockchainId.value, 'HyperAGI_Epoch_Transaction')

  const epochMaxNum = await HyperAGI_Epoch_Transaction.getEpochMaxNum()

  return epochMaxNum
}

async function calculateCommission(epoch) {
  // 确保 commission 和 epoch 是字符串并转换为适当的类型
  const commissionValue = commission.toString()
  const epochValue = BigInt(epoch)

  // 将 commission 从以太币单位转换为 Wei 单位
  const commissionWei = ethers.parseEther(commissionValue)

  // 使用 BigInt 进行乘法计算
  const totalPriceWei = commissionWei * epochValue

  totalPrice.value = ethers.formatEther(totalPriceWei).toString()

  console.info(totalPrice.value)
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
