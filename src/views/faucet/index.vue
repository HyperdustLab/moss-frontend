<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <div style="text-align: center"><el-text style="font-size: 40px" class="mx-1"> HYPERAGI $HYPT FAUCET</el-text></div>

          <div style="text-align: center"><el-text style="font-size: 20px" class="mx-1"> Get 0.5 $HYPT for free </el-text></div>

          <div style="margin-left: 15%; margin-top: 10px">
            <el-input v-model="address" style="width: 55%; height: 50px" placeholder="Enter Your Wallet Address (0x...) or ETH Mainnet ENS Domain"> </el-input>

            <el-button style="margin-left: 20px; height: 50px; width: 200px" round type="primary" @click="send">Send ME $HYPT</el-button>
          </div>
        </div>

        <div style="margin-top: 50px; border-radius: 20px; background-color: #303133; width: 100%; height: auto">
          <div v-html="faucetFAQS" style="margin-left: 20px"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount } from 'vue'
import api from '@/utils/api'
const address = ref(null)
import { ElMessage } from 'element-plus'
import { ethers } from 'ethers'

const faucetFAQS = ref(null)

onBeforeMount(async () => {
  faucetFAQS.value = await api.getDictText('sys_config', 'faucetFAQS')
})

async function send() {
  if (!address.value) {
    ElMessage.error('Please enter your wallet address')
    return
  }

  let account

  try {
    account = ethers.getAddress(address.value)
  } catch (e) {
    ElMessage.error('Invalid wallet address')
  }

  if (account) {
    await api.post('/mgn/faucetRecord/add', { account, blockchainId: localStorage.getItem('currBlockchainId') })
    ElMessage.success('Success')
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-card {
  border-radius: var(--el-card-border-radius);
  border: 0px solid var(--el-card-border-color);
  background-color: black;
  overflow: hidden;
  color: var(--el-text-color-primary);
  transition: var(--el-transition-duration);
}
</style>
