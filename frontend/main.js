import App from './App'
import { createSSRApp } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import ECharts from './components/ECharts.vue'
import { routeInterceptor } from './utils/permission'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './theme/element-plus-theme.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Make echarts and axios available globally for debugging and chart data simulation
window.echarts = echarts
window.axios = axios

// API base URL configuration
axios.defaults.baseURL = 'http://localhost:8080/api'
axios.defaults.timeout = 10000

// 路由拦截器
uni.addInterceptor('navigateTo', {
  invoke(options) {
    return routeInterceptor(options)
  }
})

uni.addInterceptor('redirectTo', {
  invoke(options) {
    return routeInterceptor(options)
  }
})

uni.addInterceptor('switchTab', {
  invoke(options) {
    return routeInterceptor(options)
  }
})

uni.addInterceptor('reLaunch', {
  invoke(options) {
    return routeInterceptor(options)
  }
})

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.component('echarts', ECharts)
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
export function createApp() {
  const app = createSSRApp(App)
  
  // 注册Element Plus
  app.use(ElementPlus)
  
  // 注册所有Element Plus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  // 全局注册ECharts组件
  app.component('echarts', ECharts)
  
  // Add global properties
  app.config.globalProperties.$echarts = echarts
  app.config.globalProperties.$http = axios
  
  // For debugging
  console.log('Vue app created with echarts:', !!echarts)
  
  // 注册布局组件
  app.component('AppLayout', AppLayout)
  app.component('AppSidebar', AppSidebar)
  app.component('AppTopBar', AppTopBar)
  
  return {
    app
  }
}
// #endif

// 导入新的布局组件
import AppLayout from './components/AppLayout.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppTopBar from './components/AppTopBar.vue'