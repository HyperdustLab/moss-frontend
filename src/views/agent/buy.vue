<template>
  <div>
    <el-dialog v-model="dialogVisible" title="Buy Minner Product" width="50%">
      <section v-if="platformNft" class="py-24 relative dark:bg-black">
        <div class="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto ml-20">
          <div class="hidden lg:grid grid-cols-2 py-6 ml-3">
            <div class="font-normal text-xl leading-8 text-gray-500 dark:text-white">Product</div>
            <p class="font-normal text-xl leading-8 text-gray-500 flex items-center justify-between dark:text-white">
              <span class="w-full text-center">Quantity</span>
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 min-[550px]:gap-6 border-t border-gray-200 py-6">
            <div class="items-center flex gap-3 w-full max-xl:justify-center max-xl:max-w-xl max-xl:mx-auto">
              <div class="img-box"><img :src="platformNft.coverImage" alt="perfume bottle image" class="xl:w-[140px]" /></div>
              <div class="pro-data w-full max-w-sm">
                <h5 class="font-semibold text-xl leading-8 text-black max-[550px]:text-center dark:text-white">{{ platformNft.name }}</h5>
                <h6 class="font-medium text-lg leading-8 text-indigo-600 max-[550px]:text-center dark:text-white">HYPT&nbsp;{{ toAmount(platformNft.price) }}</h6>
              </div>
            </div>

            <div class="items-center ml-30% flex gap-3 w-full max-xl:justify-center max-xl:max-w-xl max-xl:mx-auto">
              <el-input-number v-model="formData.quantity" :min="1" :max="10" />
            </div>
          </div>
          <div class="rounded-xl p-6 w-20.6/21 mb-8 max-lg:max-w-xl max-lg:mx-auto">
            <div class="flex items-center justify-between w-full py-6">
              <p class="font-manrope font-medium text-2xl leading-9 text-gray-900 dark:text-white">Limit Num</p>
              <h6 class="font-manrope font-medium text-2xl leading-9 text-indigo-500 dark:text-white">{{ platformNft.allowBuyNum }}</h6>
            </div>

            <div class="flex items-center justify-between w-full py-6">
              <p class="font-manrope font-medium text-2xl leading-9 text-gray-900 dark:text-white">Blockchain Network</p>
              <h6 class="font-manrope font-medium text-2xl leading-9 text-indigo-500 dark:text-white">{{ platformNft.blockchainId_dictText }}</h6>
            </div>

            <div class="flex items-center justify-between w-full py-6">
              <p class="font-manrope font-medium text-2xl leading-9 text-gray-900 dark:text-white">Total</p>
              <h6 class="font-manrope font-medium text-2xl leading-9 text-indigo-500 dark:text-white">HYPT&nbsp;{{ toAmount(platformNft.price * formData.quantity) }}</h6>
            </div>
          </div>
          <div class="flex items-center flex-col sm:flex-row justify-center gap-3 mt-8" style="margin-top:">
            <el-button type="primary" @click="onSubmit">Continue to Payment</el-button>
          </div>

          <div style="text-align: center">
            {{ $t('selectSourceType.title1') }}

            <a style="margin-left: 5px; color: #409eff" :href="toGetHYPT()" target="_blank">{{ $t('selectSourceType.title2') }}</a>
          </div>
        </div>
      </section>
    </el-dialog>

    <el-dialog v-model="dialogFormVisible" width="700" style="height: 30rem">
      <div class="flex items-center justify-center w-full py-6 mt-30">
        <p class="font-manrope font-medium text-2xl leading-9 text" style="color: green">Mint Successful</p>
      </div>

      <div @click="startMine" style="cursor: pointer; margin-top: 10rem" class="btn flex-center ma">Start Mine</div>
    </el-dialog>

    <GlobeApp ref="globeApp"></GlobeApp>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onBeforeMount } from 'vue'

import { ethers } from 'ethers'

import { buildContract, toAmount, exceptionHandling, checkBalance } from '@/utils/index'

import { useI18n } from 'vue-i18n'

import { ElMessage, ElLoading } from 'element-plus'

import { metamaskLogin } from '@/api/login'

import { useRouter } from 'vue-router'

const dialogFormVisible = ref(false)

import GlobeApp from '@/components/GlobeApp.vue'

const globeApp = ref(null)

import api from '@/utils/api'

const { t } = useI18n()

import { useUserStore } from '@/store/modules/user'

const dialogVisible = ref(false)

const platformNft = ref(null)

const formData = reactive({
  quantity: 1,
  invitationCode: '',
})

function show(item) {
  platformNft.value = item
  dialogVisible.value = true
}

function toGetHYPT() {
  return location.origin + '/faucet/index'
}

async function onSubmit() {
  const user = useUserStore()

  if (!user.username) {
    await metamaskLogin()
  }

  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    console.info(platformNft.value.price)

    const payAmount = ethers.parseEther((platformNft.value.price * formData.quantity).toString())

    await checkBalance(payAmount)

    const HyperAGI_mNFT_Mint = await buildContract(platformNft.value.blockchainId, 'HyperAGI_mNFT_Mint')

    await (await HyperAGI_mNFT_Mint.mint(platformNft.value.nftId, formData.quantity, { value: payAmount })).wait()

    dialogVisible.value = false

    dialogFormVisible.value = true

    loading.close()
    dialogVisible.value = false
  } catch (e) {
    loading.close()
    exceptionHandling(e, t)
  }
}

async function startMine() {
  const MOSSAI_SID = await api.getDictText('sys_config', 'MOSSAI_SID')

  dialogFormVisible.value = false

  globeApp.value.openApp(MOSSAI_SID, null)
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
</style>
