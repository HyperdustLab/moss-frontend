<template>
  <div>
    <div class="chat-card">
      <div class="chat-header">
        <div class="h2">Hyperdust AI</div>
      </div>
      <div ref="chatDetails" class="chat-body">
        <template v-for="(item, index) in chatRecordList" :key="index">
          <div style="display: flex">
            <div><el-avatar :src="user.avatar || userLog" /></div>
            <div style="margin-left: 1rem" class="message incoming">
              <p>{{ item.ask }}</p>
            </div>
          </div>

          <div style="display: flex">
            <div><el-avatar :src="logo" /></div>
            <div style="margin-left: 1rem" class="message outgoing">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </template>
      </div>
      <div class="chat-footer">
        <input v-model="textarea" placeholder="Type your message" @keyup.enter="handleSend" type="text" />
        <button @click="handleSend">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Your script setup code here

import { useUserStore } from '@/store/modules/user'

const user = useUserStore()

const emit = defineEmits(['send'])

import logo from '../../assets/layouts/Logo.png'
import userLog from '../../assets/image/user.png'

import { ElMessage } from 'element-plus'
import { ref, nextTick } from 'vue'

const props = defineProps({
  model: { type: String, required: true },
})

const loading = ref(false)

const isFirst = ref(true)

const chatDetails = ref(null)
const chatRecordList = ref([
  {
    ask: "A chat between a curious human and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.",
    answer: 'Hi! How can I help you?',
  },
])

const sep_token = '###'

const stop_token = '###'

const textarea = ref(null)

const extra_stop_sequences = ['</s>']

const falconModel = 'tiiuae/falcon-180B-chat'

const maxLength = 512

let prompt = null

let ws

function handleSend() {
  console.info(textarea.value)

  if (!textarea.value) {
    ElMessage.warning('Please input')
    return
  }

  if (loading.value) {
    return
  }

  chatRecordList.value.push({ ask: textarea.value })
  const askContent = textarea.value
  textarea.value = ''

  if (ws) {
    generate(askContent)
  } else {
    ws = new WebSocket(`${import.meta.env.VITE_AI_API}/api/v2/generate`)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'open_inference_session',
          model: props.model,
          max_length: maxLength,
        })
      )

      generate(askContent)
    }

    ws.onmessage = event => {
      const response = JSON.parse(event.data)
      console.info(response)
      if (response.ok) {
        if (response.outputs === undefined) {
          console.log('Session opened, generating...')
        } else {
          console.log('Generated: ' + prompt + response.outputs)

          let answer = chatRecordList.value[chatRecordList.value.length - 1].answer

          var newText = (answer === undefined ? '' : answer) + response.outputs

          if (props.model !== falconModel) {
            newText = newText.replace(stop_token, '')
          }
          if (extra_stop_sequences !== null) {
            for (const seq of extra_stop_sequences) {
              newText = newText.replace(seq, '')
            }
          }
          chatRecordList.value[chatRecordList.value.length - 1].answer = newText

          if (response.stop) {
            loading.value = false
          }
        }
      } else {
        console.log('Error: ' + response.traceback)
        ws.close()

        const answer = 'Error: Reasoning error occurred. Please refresh!'

        loading.value = false

        chatRecordList.value[chatRecordList.value.length - 1].answer = answer
        chatRecordList.value[chatRecordList.value.length - 1].error = true
      }
    }
  }
}

function generate(askContent) {
  loading.value = true

  if (isFirst.value) {
    isFirst.value = false
    prompt = `A chat between a curious human and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.###Assistant: Hi! How can I help you?###your:${askContent}###hyper AI:`
  } else {
    prompt = `your:${askContent}${sep_token}hyper AI:`
  }

  ws.send(
    JSON.stringify({
      type: 'generate',
      inputs: prompt,
      max_new_tokens: 1,
      stop_sequence: '###',
      extra_stop_sequences: ['</s>'],
      do_sample: 1,
      temperature: 0.6,
      top_p: 0.9,
    })
  )

  emit('send', askContent)

  nextTick(() => {
    chatDetails.value.scrollTo(0, chatDetails.value.scrollHeight)
  })
}
</script>

<style scoped>
.chat-card {
  width: 50rem;
  height: 43rem;
  background-color: #141414;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  padding: 10px;
  background-color: #141414;
  display: flex;
  align-items: center;
}

.chat-header .h2 {
  font-size: 16px;
  color: white;
}

.chat-body {
  padding: 20px;
  height: 35rem;
  overflow-y: auto;
}

.message {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  text-align: left;
  word-wrap: break-word;
}

.incoming {
  background-color: #181717;
  color: white;
}

.outgoing {
  background-color: #110c0c;
  text-align: left;
  color: white;
}

.message p {
  font-size: 14px;
  margin: 0;
}

.chat-footer {
  padding: 10px;
  background-color: #000;
  display: flex;
}

.chat-footer input[type='text'] {
  flex-grow: 1;
  padding: 1rem;

  border: none;
  border-radius: 3px;
  background-color: #1d1e1f; /* 修改输入框背景颜色为黑色 */
  color: #fff; /* 修改输入框文字颜色为白色 */
}

.chat-footer button {
  padding: 5px 10px;
  border: none;
  background-color: #0f9d58;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-footer button:hover {
  background-color: #0f9d58;
}

@keyframes chatAnimation {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-card .message {
  animation: chatAnimation 0.3s ease-in-out;
  animation-fill-mode: both;
  animation-delay: 0.1s;
}

.chat-card .message:nth-child(even) {
  animation-delay: 0.2s;
}

.chat-card .message:nth-child(odd) {
  animation-delay: 0.3s;
}
</style>
