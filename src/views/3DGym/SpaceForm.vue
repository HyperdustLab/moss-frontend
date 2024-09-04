<template>
  <el-dialog v-model="dialogVisible" :title="formData.id ? $t('space.updateSpace') : $t('space.addSpaceTitle')" width="50%">
    <el-form v-if="dialogVisible" ref="ruleFormRef" :model="formData" :rules="rules" label-width="200px" class="demo-ruleForm" status-icon>
      <el-form-item :label="$t('space.coverImage')" prop="coverImage">
        <UploadImage v-model="formData.coverImage" :limit="4" action="/sys/common/ipfsUpload"></UploadImage>
      </el-form-item>

      <el-form-item :label="$t('space.image')">
        <UploadImage v-model="formData.image" :limit="1" action="/sys/common/ipfsUpload"></UploadImage>
      </el-form-item>

      <el-form-item :label="$t('space.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="$t('placeholderTxt')" />
      </el-form-item>

      <el-form-item :label="$t('space.description')" prop="description">
        <el-input v-model="formData.description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" :placeholder="$t('placeholderTxt')" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="submitForm"> Confirm </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick, reactive, onBeforeMount } from 'vue'
import api from '@/utils/api'

import { ElMessage } from 'element-plus'

import UploadImage from '@/components/UploadImage/index.vue'

const dialogVisible = ref(false)

const confirmLoading = ref(false)

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const ruleFormRef = ref<FormInstance>(null)

import { exceptionHandling, buildContract } from '@/utils'

const emit = defineEmits(['ok'])

const formData = reactive<Record<string, any>>({
  name: '',
  sid: '',
  description: '',
  coverImage: '',
  image: '',
})

const rules = reactive<FormRules<RuleForm>>({
  name: [{ required: true, message: t('spaceForm.name'), trigger: 'blur' }],
  coverImage: [{ required: true, message: t('spaceForm.coverImage'), trigger: 'blur' }],
})

function close() {
  dialogVisible.value = false
}

function submitForm() {
  ruleFormRef.value.validate(async valid => {
    if (valid) {
      confirmLoading.value = true

      const currBlockchain = await api.getDictText('sys_config', 'curr_blockchain')

      const HyperAGI_GYM_Space = await buildContract(currBlockchain, 'HyperAGI_GYM_Space')

      try {
        if (formData.id) {
          await (await HyperAGI_GYM_Space.edit(formData.sid, formData.name, formData.coverImage, formData.image, formData.description)).wait()
        } else {
          await (await HyperAGI_GYM_Space.add(formData.name, formData.coverImage, formData.image, formData.description)).wait()
        }

        emit('ok')

        dialogVisible.value = false
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

function show(record) {
  confirmLoading.value = false

  if (record) {
    Object.assign(formData, record)

    console.info(formData)
  } else {
    Object.assign(formData, {
      name: '',
      sid: '',
      description: '',
      coverImage: '',
      image: '',
    })
  }

  dialogVisible.value = true

  nextTick(() => {
    ruleFormRef.value.resetFields()
  })
}

defineExpose({
  show,
})
</script>

<style></style>
