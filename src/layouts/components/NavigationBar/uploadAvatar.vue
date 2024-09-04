<template>
  <el-dialog v-model="dialogVisible" :title="$t('uploadAvatar.title')" width="30%">
    <UploadImage v-model="avatar"></UploadImage>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="ok"> {{ $t('confirm') }} </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup type="ts">

import UploadImage from '@/components/UploadImage/index.vue'

import { ref } from "vue"

import { useUserStore} from "@/store/modules/user"

import api from '@/utils/api'

const avatar =  ref(useUserStore().avatar)


function show(){
  dialogVisible.value = true
  avatar.value = useUserStore().avatar
}


async function ok(){

  await api.put('/sys/user/appEdit',{avatar:avatar.value})
  await useUserStore().getInfo();
  dialogVisible.value = false
}

 const dialogVisible = ref(false)
 defineExpose({
  show
})
</script>

<style></style>
