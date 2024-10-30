<template>
  <el-dialog v-model="dialogVisible" title="NFT Cross Chain" width="70%">
    <div>
      <div class="w-200 mx-auto mt-45">
        <el-button class="w-80 ml-72%" style="font-size: 20px" @click="nftCrossChainList.show()"
          >See transaction history
          <el-icon class="el-icon--right">
            <ArrowRightBold />
          </el-icon>
        </el-button>
      </div>
      <el-card class="w-250 mx-auto h-150 mt-10">
        <el-form ref="ruleFormRef" label-position="top" :model="formData" :rules="rules" label-width="200px" class="demo-ruleForm w-200 ml-9% mt-10%" status-icon>
          <el-form-item label="Step1 Source Blockchain" prop="sourceBlockchainId">
            <el-input v-model="formData.sourceSmartContractAddress" readonly style="height: 80px; font-size: 20px" placeholder="Source SmartContract Address" class="input-with-select">
              <template #prepend>
                <el-select v-model="formData.sourceBlockchainId" class="class_blockchain" placeholder="Select" style="width: 200px">
                  <el-option v-for="(item, index) in blockchainList" :key="index" :label="item.name" :value="item.id" />
                </el-select>
              </template>
              <template #append>
                <el-button @click="openSelectTargetSmartContractAddress"> Select </el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item class="mt-50" label="Step2 Source NFT Token Id" prop="sourceTokenId">
            <el-input v-model="formData.sourceTokenId" style="max-width: 800px; height: 80px; font-size: 20px" readonly placeholder="Source NFT Token Id" class="input-with-select">
              <template #append>
                <el-button @click="openSelectTargetNFTToken"> Select </el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item class="w-200 mt-40 ml-30%">
            <el-button style="font-size: 20px; height: 60px" type="primary" :loading="confirmLoading" @click="submitForm">Move funds to HyperAGI Network</el-button>
          </el-form-item>
        </el-form>

        <SelectTargetSmartContractAddress @ok="handleSelectSourceSmartContractAddress" ref="selectTargetSmartContractAddress"></SelectTargetSmartContractAddress>
        <SelectTargetNFTToken @ok="handleSelectTargetNFTToken" ref="selectTargetNFTToken"></SelectTargetNFTToken>
        <NftCrossChainList ref="nftCrossChainList"></NftCrossChainList>
      </el-card>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick, reactive, onBeforeMount } from 'vue'
import api from '@/utils/api'

import SelectTargetSmartContractAddress from '@/views/NftCrossChain/SelectSourceSmartContractAddress.vue'

import SelectTargetNFTToken from '@/views/NftCrossChain/SelectSourceNFTToken.vue'

import NftCrossChainList from './index.vue'

import { ElMessage } from 'element-plus'

const selectTargetSmartContractAddress = ref(null)

const selectTargetNFTToken = ref(null)

import { useUserStore } from '@/store/modules/user'

const dialogVisible = ref(false)

const confirmLoading = ref(false)

import { useI18n } from 'vue-i18n'

const nftCrossChainList = ref(null)

const { t } = useI18n()

const ruleFormRef = ref<FormInstance>(null)

import { exceptionHandling, buildContract, buildContractAddress } from '@/utils'
import { ArrowRightBold } from '@element-plus/icons-vue'

const emit = defineEmits(['ok'])

const blockchainList = ref([])

const user = useUserStore()

onBeforeMount(() => {
  getBlockchainList()
})

const formData = reactive<Record<string, any>>({
  sourceBlockchainId: '',
  sourceSmartContractAddress: '',
  sourceTokenId: null,
})

const rules = reactive<FormRules<RuleForm>>({
  name: [{ required: true, message: t('spaceForm.name'), trigger: 'blur' }],
  coverImage: [{ required: true, message: t('spaceForm.coverImage'), trigger: 'blur' }],
})

function close() {
  dialogVisible.value = false
}

async function getBlockchainList() {
  const { result } = await api.get('/mgn/blockchain/list', { allowCrossChain: 'Y', pageSize: -1 })

  blockchainList.value = result.records

  formData.sourceBlockchainId = blockchainList.value[0].id
}

function openSelectTargetSmartContractAddress() {
  selectTargetSmartContractAddress.value.show(formData.sourceBlockchainId)
}

function openSelectTargetNFTToken() {
  selectTargetNFTToken.value.show(formData.sourceBlockchainId, formData.sourceSmartContractAddress)
}

function submitForm() {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      confirmLoading.value = true

      const NFT_Receiving_Address = await api.getDictText('sys_config', 'NFT_Receiving_Address')

      const contract = await buildContractAddress(formData.sourceBlockchainId, formData.sourceSmartContractAddress)

      try {
        await contract.safeTransferFrom(user.walletAddress, NFT_Receiving_Address, formData.sourceTokenId)
        ElMessage.success('Transfer successful')
        confirmLoading.value = false
      } catch (e) {
        exceptionHandling(e, t)
        confirmLoading.value = false
      }
    } else {
      return false
    }
  })
}

function handleSelectSourceSmartContractAddress(sourceSmartContractAddress) {
  formData.sourceSmartContractAddress = sourceSmartContractAddress
}

function handleSelectTargetNFTToken(row) {
  formData.sourceTokenId = row.tokenId
}

function show() {
  dialogVisible.value = true
}

defineExpose({ show })
</script>

<style lang="scss" scoped>
::v-deep .class_blockchain .el-input__inner {
  height: 80px;
}

::v-deep .el-form-item__label {
  font-size: 20px;
}
</style>
