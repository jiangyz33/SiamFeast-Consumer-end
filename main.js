import App from './App'
import { startLoading, finishLoading, injectLoadingBarCSS } from './utils/loading.js'

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

// 拦截页面跳转 — 显示顶部加载条
const navMethods = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']
navMethods.forEach(method => {
  uni.addInterceptor(method, {
    invoke() {
      startLoading()
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
// #endif