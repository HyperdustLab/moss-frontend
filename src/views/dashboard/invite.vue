<template>
  <div>
    <div v-if="isPC" class="pcBG">
      <img class="image" @click="accept" src="../../assets/image/Accept.png" />
    </div>
    <div v-else class="mobileBG">
      <img class="mobileImage" @click="accept" src="../../assets/image/Accept.png" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount } from "vue"
import XEUtils from "xe-utils"

import { ElMessage, ElMessageBox } from "element-plus"

import { useRoute } from "vue-router"

const route = useRoute()

import api from "@/utils/api"

const isPC = ref(false)

isPC.value = !XEUtils.browse().isMobile

onBeforeMount(() => {
  if (typeof window.ethereum === "undefined") {
    ElMessageBox.alert(
      "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html'",
      "Warning Prompt"
    )
  }
})

async function getPersonalSignMessage(address) {
  const { result } = await api.get("/sys/getPersonalSignMessage", { address })

  return result
}

async function accept() {
  const walletAddress = route.params.walletAddress

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

  const signMessage = await getPersonalSignMessage(accounts[0])

  const signature = await ethereum.request({
    method: "personal_sign",
    // @ts-ignore
    params: [signMessage, accounts[0]]
  })

  await api.post("/mgn/inviteRecord/add", { address: accounts[0], signature, inviteAddress: walletAddress })

  location.href = "/inviteSuccess/" + walletAddress
}
</script>

<style lang="scss" scoped>
.pcBG {
  background-image: url("../../assets/image/web2.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

.mobileBG {
  background-image: url("../../assets/image/Mobile2.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

.image {
  width: 160px;
  height: 50px;
  top: 58%;
  left: 46%;
  cursor: pointer;
  position: absolute;
}

.mobileImage {
  width: 160px;
  height: 50px;
  top: 52%;
  left: 30%;

  cursor: pointer;
  position: absolute;
}
</style>
