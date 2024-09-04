<template>
  <div>
    <el-tabs type="card" class="demo-tabs">
      <el-tab-pane label="nodejs">
        <VCodeBlock style="height: 40rem; overflow-y: auto" :code="nodeJS" highlightjs lang="javascript" theme="neon-bunny"> </VCodeBlock>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import VCodeBlock from '@wdns/vue-code-block'

import { ref, onBeforeMount, watch } from 'vue'

const props = defineProps({
  model: { type: String, required: true },
  askContent: { type: String, required: true },
})

watch(
  () => props.model,
  (newValue, oldValue) => {
    setNodeJS(newValue, props.askContent)
  }
)

watch(
  () => props.askContent,
  (newValue, oldValue) => {
    setNodeJS(props.model, newValue)
  }
)

const nodeJS = ref(null)

function setNodeJS(model, askContent) {
  console.info(model, askContent)

  nodeJS.value = `
const sep_token = '###'
const stop_token = '###'
const extra_stop_sequences = ['</s>']
const falconModel = 'tiiuae/falcon-180B-chat'
function generate() {
  loading.value = true

  if (ws) {
    generate(askContent)
  } else {
     ws = new WebSocket('wss://chatai.hyperagi.network/api/v2/generate')
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'open_inference_session',
           model: '${model}',
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


function generate(askContent) {
  loading.value = true

  if (isFirst.value) {
    isFirst.value = false
    prompt = 'A chat between a curious human and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.###Assistant: Hi! How can I help you?###your:${askContent}###hyper AI:'
  } else {
    prompt = 'your:${askContent}###hyper AI:'
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
`
}

onBeforeMount(async () => {
  setNodeJS(props.model, props.askContent)
})
</script>

<style lang="scss" scoped>
::v-deep .v-code-block--code .v-code-block--tab-highlightjs-neon-bunny-icon {
  color: #4ceb75;
  fill: #4ceb75;
}
</style>
