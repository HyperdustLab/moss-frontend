<template>
  <div v-if="images">

    <template v-if="images.length === 1">

      <img v-if="image" :src="showImage" @mouseenter="appMouseenter" @mouseleave="appMouseleave" style="width: 100%; height: 300px" class="image" />

      <img v-else :src="images[0]" style="width: 100%; height: 300px" class="image" />

    </template>

    <el-carousel v-else height="300px">
      <el-carousel-item v-for="(item, index) in images" :key="index">
        <img :src="item" style="width: 100%; height: 300px" class="image" />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount, watchEffect } from "vue"

const images = ref(null)

const image = ref(null)

const showImage = ref(null)

const props = defineProps({
  value: { type: String, required: true },
  image: { type: String, required: true }
})

onBeforeMount(async () => {
  images.value = props.value.split(",")
  image.value = props.image

  if (images.value.length === 1 && image.value) {
    showImage.value = images.value[0]
  }
})

watchEffect(() => {
  images.value = props.value.split(",")
  image.value = props.image

  if (images.value.length === 1 && image.value) {
    showImage.value = images.value[0]
  }
})

function appMouseenter() {
  showImage.value = image.value
  console.info("showImage.value", showImage.value)
}

function appMouseleave() {
  showImage.value = images.value[0]
  console.info("showImage.value", showImage.value)
}
</script>

<style lang="scss" scoped>
.image {
  width: 400px;
  height: 200px;
  display: block;
}
</style>
