import App from './App'
import { startLoading, finishLoading, injectLoadingBarCSS } from './utils/loading.js'
import { autoSetPageTitle, setI18nInstance } from './utils/setPageTitle.js'
import i18n from './i18n/index.js'

// 注入 i18n 实例给 setPageTitle 使用
setI18nInstance(i18n)

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif

// H5 环境：注入加载条 CSS + 路由拦截器
// #ifdef H5
injectLoadingBarCSS()

// 拦截页面跳转 — 显示顶部加载条 + 自动设置页面标题
const navMethods = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']
navMethods.forEach(method => {
  uni.addInterceptor(method, {
    invoke(args) {
      startLoading()
      // 提取目标 URL 中的页面路径
      try {
        const url = (args && (args.url || args.path)) || ''
        const path = url.split('?')[0].replace(/^\//, '')
        if (path) {
          setTimeout(() => autoSetPageTitle(path), 100)
        }
      } catch (e) {}
    },
    success() {
      // 给页面一点渲染时间再结束
      setTimeout(() => finishLoading(), 300)
    },
    fail() {
      finishLoading()
    }
  })
})

// 首次加载时也设置一次标题
try { autoSetPageTitle() } catch (e) {}
// #endif