<template>
  <el-dialog v-model="dialogVisible" title="Bind Email" width="30%">
    <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto" style="max-width: 600px">
      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email"/>
      </el-form-item>
      <el-form-item label="Verification Code" prop="code">
        <el-input v-model="form.code">
          <template #append>
            <el-button :disabled="sendCodeDisabled" :loading="loading" @click="sendCode">{{ sendCodeTxt }}</el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button :loading="loading" type="primary" @click="ok">{{ $t('confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup type="ts">
import {ref, reactive, nextTick} from 'vue'
import {ElMessage} from 'element-plus'
import api from '@/utils/api'
import {useUserStore} from "@/store/modules/user";

const ruleFormRef = ref(null)

const sendCodeTxt = ref("Send")
const sendCodeDisabled = ref(false)
let intervalId;
const codeNum = ref(60)

const loading = ref(false)

const rules = reactive({
  email: [
    {required: true, message: "Please enter your email", trigger: "blur"},
    {type: "email", message: "Please enter a valid email address", trigger: "blur"}
  ],
  code: [
    {required: true, message: "Please enter the verification code", trigger: "blur"}
  ]
})

const form = reactive({
  email: '',
  code: ''
})

const dialogVisible = ref(false)

function show() {


  sendCodeTxt.value = "Send"
  sendCodeDisabled.value = false

  if (intervalId) {
    clearInterval(intervalId)
  }


  Object.assign(form, {
    email: '',
    code: ''
  })
  dialogVisible.value = true

  nextTick(() => {
    ruleFormRef.value.resetFields()
  })
}

async function ok() {
  await ruleFormRef.value?.validate(async (valid, fields) => {
    if (valid) {
      await api.post("/sys/user/updateEmail", form)
      ElMessage.success("Bind email successfully")
      await useUserStore().getInfo();
      dialogVisible.value = false
    } else {
      console.log('error submit!', fields)
    }
  })
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

async function sendCode() {
  if (!form.email) {
    ElMessage.error("Please enter your email")
    return
  }

  if (!isValidEmail(form.email)) {
    ElMessage.error("Please enter a valid email address")
    return
  }


  loading.value = true


  await api.get("/sys/sendEmailLoginCode", {email: form.email, type: "bindEmail"})

  loading.value = false


  ElMessage.success("Verification code sent successfully")

  codeNum.value = 60
  sendCodeDisabled.value = true

  intervalId = window.setInterval(() => {
    if (codeNum.value === 0) {
      sendCodeDisabled.value = false
      sendCodeTxt.value = "Send"
      clearInterval(intervalId)
    } else {
      codeNum.value--
      sendCodeTxt.value = codeNum.value.toString()
    }
  }, 1000)
}

defineExpose({
  show,
})
</script>

<style></style>