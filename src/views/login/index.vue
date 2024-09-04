<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import api from '@/utils/api'
import { onBeforeMount } from 'vue'

import { metamaskLogin } from '@/api/login'

const router = useRouter()

const route = useRoute()

onBeforeMount(async () => {
  const token = route.query.token

  if (token) {
    useUserStore().loginToken(token)
    location.href = '/'
  } else {
    if (useUserStore().token) {
      location.href = '/'
    } else {
      await metamaskLogin()
    }
  }
})
</script>
