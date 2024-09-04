import { createI18n } from 'vue-i18n'
import en_us from './en-us.js'
export default createI18n({
  legacy: false, // 让 setup 函数可以通过 t 访问
  globalInjection: true, // 让 template 可以像 vue2 那样使用 $t 来访问
  locale: localStorage.getItem('lang') || 'en-us',
  fallbackLocale: 'en-us',
  messages: {
    'en-us': en_us,
  },
})
