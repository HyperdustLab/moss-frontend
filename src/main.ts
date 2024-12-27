// core
import { createApp } from 'vue'

import './assets/tailwind.css'

import App from '@/App.vue'
import store from '@/store'
import router from '@/router'
import '@/router/permission'
import i18n from '@/lang/'
// load
import { loadSvg } from '@/icons'
import { loadPlugins } from '@/plugins'
import { loadDirectives } from '@/directives'
// css

import 'uno.css'
import 'normalize.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'vxe-table/lib/style.css'
import 'vxe-table-plugin-element/dist/style.css'
import '@/styles/index.scss'

import './assets/main.css'

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import PageFooter from './components/PageFooter.vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(i18n)

/** 加载插件 */
loadPlugins(app)
/** 加载全局 SVG */
loadSvg(app)
/** 加载自定义指令 */
loadDirectives(app)

app.use(store).use(router)
router.isReady().then(() => {
  app.mount('#app')
})

// 单独挂载页脚
createApp(PageFooter).mount('#page-footer')
