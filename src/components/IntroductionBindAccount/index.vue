<template>
  <el-dialog v-model="dialogVisible" title="Bind Account" width="50%" @close="onClose">
    <!-- component -->
    <div class="relative py-16 bg-black">
      <div class="relative m-auto px-6 text-gray-300 md:px-12 xl:px-40 h-full">
        <div class="m-auto md:w-8/12 lg:w-6/12 xl:w-10/12 h-full">
          <div class="rounded-xl shadow-xl h-full">
            <div class="p-6 sm:p-16 h-full">
              <div class="space-y-4">
                <img src="../../assets/layouts/logo-text-4.png" loading="lazy" class="w-80" alt="tailus logo" />
                <h2 v-if="bindStatus === 'metamask'" class="mb-8 text-2xl font-bold" style="color: #4ceb75">To use the Hyperagi network, you need to use a crypto wallet. Please bind a wallet first.</h2>
                <h2 v-else class="mb-8 text-2xl font-bold" style="color: #4ceb75">To facilitate logging into the mobile app, please bind an email address first. We recommend using your Google account or other third-party accounts to enhance convenience.</h2>
              </div>

              <div class="mt-16 grid space-y-4">
                <button v-if="bindStatus === 'email'" @click="loginWithGoogle" class="group h-12 px-6 border-2 border-gray-600 rounded-full transition duration-300 hover:border-blue-400 focus:bg-blue-900 active:bg-blue-800">
                  <div class="relative flex items-center justify-center">
                    <img :src="googleIcon" class="w-5 mr-2" alt="google logo" />
                    <span class="block w-max font-semibold tracking-wide text-gray-300 text-sm transition duration-300 group-hover:text-blue-400 sm:text-base">Continue with Google</span>
                  </div>
                </button>
                <button v-if="bindStatus === 'metamask'" @click="handleMetamaskLogin" class="group h-12 px-6 border-2 border-gray-600 rounded-full transition duration-300 hover:border-blue-400 focus:bg-blue-900 active:bg-blue-800">
                  <div class="relative flex items-center space-x-4 justify-center">
                    <img :src="metamaskIcon" class="w-5 mr-2" alt="google logo" />
                    <span class="block w-max font-semibold tracking-wide text-gray-300 text-sm transition duration-300 group-hover:text-blue-400 sm:text-base">Continue with MetaMask</span>
                  </div>
                </button>
              </div>

              <template v-if="bindStatus === 'email'">
                <div class="flex items-center mb-3">
                  <hr class="h-0 border-b border-solid border-grey-500 grow" />
                  <p class="mx-4 text-grey-600">or</p>
                  <hr class="h-0 border-b border-solid border-grey-500 grow" />
                </div>

                <div class="mt-16 grid space-y-4">
                  <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="150px">
                    <el-form-item label="Email" prop="email">
                      <el-input v-model="form.email" :disabled="false" />
                    </el-form-item>
                    <el-form-item label="Verification Code" prop="code">
                      <el-input v-model="form.code">
                        <template #append>
                          <el-button :disabled="sendCodeDisabled" :loading="loading" @click="sendCode">{{ sendCodeTxt }}</el-button>
                        </template>
                      </el-input>
                    </el-form-item>

                    <el-form-item>
                      <el-button type="primary" @click="updateEmail" class="group h-12 w-full px-12 border-2 border-gray-600 rounded-full transition duration-300 hover:border-blue-400 focus:bg-blue-900 active:bg-blue-800">
                        <div class="relative flex items-center space-x-4 justify-center">
                          <span class="block w-max font-semibold tracking-wide text-gray-300 text-sm transition duration-300 group-hover:text-blue-400 sm:text-base">Bind with Email</span>
                        </div>
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </template>

              <template v-else>
                <div class="mt-16 grid space-y-4">
                  <p class="text-gray-300 text-sm">Don't have a MetaMask wallet? <a href="https://metamask.io/download.html" target="_blank" class="text-blue-400 hover:underline">Click here to register and download MetaMask wallet</a></p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import metamaskIcon from '@/assets/image/metamask.png'
import googleIcon from '@/assets/image/google.png'

import { ElMessage } from 'element-plus'

import { metamaskLogin } from '@/api/login'
import { useUserStore } from '@/store/modules/user'

import { ref, reactive, nextTick } from 'vue'

const dialogVisible = ref(false)

import api from '@/utils/api'

const userStore = useUserStore()

const loginWithGoogle = () => {
  window.open(import.meta.env.VITE_BASE_API + '/sys/thirdLogin/render/google?token=' + userStore.token, 'googleLogin', 'width=500,height=600')
}

const ruleFormRef = ref(null)

const sendCodeDisabled = ref(false)
const loading = ref(false)
const sendCodeTxt = ref('Send')

const bindStatus = ref('none')

let intervalId
const codeNum = ref(60)

const rules = ref({
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!isValidEmail(value)) {
          callback(new Error('Please enter a valid email address'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  code: [{ required: true, message: 'Please input code', trigger: 'blur' }],
})

const form = reactive({
  email: '',
  code: '',
})

function show(_bindStatus: string) {
  bindStatus.value = _bindStatus

  dialogVisible.value = true
  window.addEventListener('message', handleMessage, false)

  Object.assign(form, {
    email: '',
    code: '',
  })

  nextTick(() => {
    ruleFormRef.value.resetFields()
  })
}

function onClose() {
  dialogVisible.value = false
  window.removeEventListener('message', handleMessage, false)
}

async function handleMetamaskLogin() {
  await metamaskBind()
  dialogVisible.value = false
}

async function metamaskBind() {
  // @ts-ignore
  await window.ethereum.enable()
  // @ts-ignore
  const accounts = await ethereum.request({ method: 'eth_accounts' })

  const data = await api.get('/sys/getPersonalSignMessage', {
    address: accounts[0],
  })

  // @ts-ignore
  const signature = await ethereum.request({
    method: 'personal_sign',
    // @ts-ignore
    params: [data.result, accounts[0]],
  })

  // @ts-ignore
  const { result } = await api.post('/sys/bindMetaMask', {
    address: accounts[0],
    signature: signature,
  })

  await useUserStore().getInfo()
}

function isValidEmail(email: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

async function sendCode() {
  const valid = await ruleFormRef.value.validateField('email')
  if (!valid) {
    return
  }

  loading.value = true

  await api.get('/sys/sendEmailLoginCode', { email: form.email, type: 'bindEmail' })

  loading.value = false

  ElMessage.success('Verification code sent successfully')

  codeNum.value = 60
  sendCodeDisabled.value = true

  intervalId = window.setInterval(() => {
    if (codeNum.value === 0) {
      sendCodeDisabled.value = false
      sendCodeTxt.value = 'Send'
      clearInterval(intervalId)
    } else {
      codeNum.value--
      sendCodeTxt.value = codeNum.value.toString()
    }
  }, 1000)
}

async function updateEmail() {
  const valid = await ruleFormRef.value.validate()
  if (!valid) {
    return
  }

  await api.post('/sys/user/updateEmail', form)

  await useUserStore().getInfo()

  dialogVisible.value = false
}

defineExpose({
  show,
})

function handleMessage(event: any) {
  // 你可以根据 event.origin 判断消息的来源是否是你信任的源
  // 例如: if (event.origin !== "https://your-trusted-domain.com") return;

  // 接收父窗口传递的数据
  var receivedData = event.data

  console.info(import.meta.env.VITE_BASE_API)
  console.info(event.origin)

  // 判断receivedData是否为JSON字符串
  let isJsonString = false
  try {
    const json = JSON.parse(receivedData)

    if (json.token) {
      useUserStore().loginToken(json.token)
      location.href = '/'
    }
  } catch (e) {
    isJsonString = false
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-form-item__content {
  display: flex;
  flex-wrap: wrap;
  align-items: normal;
  flex: 1;
  line-height: 32px;
  position: relative;
  font-size: var(--font-size);
  min-width: 0;
}

.social-media-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.social-media-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.social-media-icon img {
  width: 30px; /* You can set this to the size you need */
  height: 30px; /* Make sure this is the same as the width for a circle */
}

.social-media-icon span {
  margin-top: 8px;
  font-size: 12px;
}
</style>
