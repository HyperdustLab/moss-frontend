<template>
  <div>
    <div v-if="isPC" class="pcBG">
      <img class="image" @click="toShare" src="../../assets/image/ToShare.png" />
    </div>

    <div v-else class="mobileBG">
      <img class="mobileImage" @click="toShare" src="../../assets/image/ToShare.png" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount } from "vue"
import XEUtils from "xe-utils"

import { useRoute } from "vue-router"

const route = useRoute()

const isPC = ref(false)

isPC.value = !XEUtils.browse().isMobile

function toShare() {
  location.href = "/share/" + route.params.walletAddress
}
</script>

<style lang="scss" scoped>
.pcBG {
  background-image: url("../../assets/image/web3.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

.mobileBG {
  background-image: url("../../assets/image/Mobile3.png");
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
  top: 58%;
  left: 30%;
  cursor: pointer;
  position: absolute;
}
</style>
