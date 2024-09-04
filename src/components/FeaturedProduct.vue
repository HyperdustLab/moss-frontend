<template>
  <div class="scroll-wrapper" v-if="featuredProductList.length > 0">
    <el-icon style="cursor: pointer" @click="scrollLeft"><ArrowLeft /></el-icon>
    <!-- <button class="arrow left" @click="scrollLeft">&#9664;</button> -->
    <div class="horizontal-scroll-container" ref="scrollContainer">
      <div class="content-item" v-for="(item, index) in featuredProductList" :key="index" @click="handleClick(item)">
        <label v-if="item.id === selectItemId" class="container">
          <input type="checkbox" checked="checked" />
          <div class="checkmark"></div>
        </label>

        <el-image style="width: 32vh; height: 18vh" :src="item.coverImage" fit="fill" />
      </div>
    </div>

    <el-icon style="cursor: pointer" @click="scrollRight"><ArrowRight /></el-icon>

    <!-- <button class="arrow right" @click="scrollRight">&#9654;</button> -->
  </div>
</template>

<script setup lang="ts">
import api from '@/utils/api'

import { ref, onUnmounted, onBeforeMount, defineEmits } from 'vue'

const emit = defineEmits(['click', 'load'])

const props = defineProps({
  type: { type: String, reuqired: true },
  defaultOne: { type: Boolean, default: false },
})

const featuredProductList = ref([])

const selectItemId = ref('')

async function getFeaturedProductList() {
  const { result } = await api.get('/mgn/featuredProduct/list', { type: props.type, column: 'orderNum', order: 'asc', pageSize: -1 })

  featuredProductList.value = result.records

  if (props.defaultOne) {
    console.info(props.defaultOne)
    handleClick(result.records[0])
  }

  emit('load', result.records)
}

onBeforeMount(() => {
  getFeaturedProductList()
})

const scrollContainer = ref<HTMLElement | null>(null)

const scrollAmount = 200 // Adjust this value based on your item width or desired scroll amount

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft -= scrollAmount
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += scrollAmount
  }
}

function handleClick(item) {
  selectItemId.value = item.id
  emit('click', item)
}
</script>

<style>
.scroll-wrapper {
  display: flex;
  align-items: center;
  user-select: none;
}

.horizontal-scroll-container {
  display: flex;
  overflow-y: hidden; /* Hide horizontal scrollbar */
  overflow-x: hidden; /* Hide horizontal scrollbar */
  white-space: nowrap;
  background: #1a1a1a;
  flex: 1;
  height: 200px;
  min-width: 0; /* Prevent flexbox from growing beyond the bounds of parent */
  position: relative;
  scroll-behavior: smooth; /* Smooth scrolling */
}

.content-item {
  display: inline-block;
  width: 32vh;
  height: 20vh;
  position: relative;
  margin-top: 19px;
  line-height: 100px;
  background: #1a1a1a;
  text-align: center;
  margin-left: 20px;
  cursor: pointer;
}

.arrow {
  cursor: pointer;
  user-select: none;
  padding: 10px 20px;
  font-size: 24px;
  background: none;
  border: none;
  color: #333;
}

.arrow:hover {
  background-color: #f0f0f0;
}

/* Hide the default checkbox */
.container input {
  opacity: 0;
  cursor: pointer;
  position: absolute;
  width: 0;
  height: 0;
  top: 0;
}

.container {
  display: block;
  position: absolute;
  cursor: pointer;
  z-index: 1000;
  top: 1rem; /* 添加这一行 */
  font-size: 0.8rem;
  left: 1rem;
  user-select: none;
}

/* Create a custom checkbox */
.checkmark {
  position: relative;
  top: 0;
  left: 0;
  height: 2.3em;
  width: 2.3em;
  background-color: #ccc;
  border-radius: 50%;
  transition: 0.4s;
}

.checkmark:hover {
  box-shadow:
    inset 17px 17px 16px #b3b3b3,
    inset -17px -17px 16px #ffffff;
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  box-shadow: none;
  background-color: limegreen;
  transform: rotateX(360deg);
}

.container input:checked ~ .checkmark:hover {
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2);
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 0.96em;
  top: 0.4em;
  width: 0.5em;
  height: 1em;
  border: solid white;
  border-width: 0 0.15em 0.15em 0;
  box-shadow: 0.1em 0.1em 0em 0 rgba(0, 0, 0, 0.3);
  transform: rotate(45deg);
}
</style>
