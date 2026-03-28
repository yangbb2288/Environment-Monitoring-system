<template>
  <view class="echart-container" :style="{ width: width, height: height }">
    <view :id="chartId" class="echart" :style="{ width: '100%', height: '100%' }">
      <!-- 加载占位图 -->
      <img v-if="!chartReady" src="/static/images/placeholder.svg" class="placeholder-image" alt="图表加载中" />
    </view>
    <view v-if="showLastUpdate && lastUpdateTime" class="update-info">
      最后更新: {{ formatLastUpdateTime }}
    </view>
  </view>
</template>

<script>
import { onMounted, onUnmounted, watch, getCurrentInstance, ref, computed } from 'vue'

export default {
  name: 'SimpleECharts',
  props: {
    chartId: {
      type: String,
      default: 'echart'
    },
    option: {
      type: Object,
      required: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    simulateApiCall: {
      type: Boolean,
      default: true
    },
    apiDelay: {
      type: Number,
      default: 300
    },
    // 新增属性：自动更新
    autoUpdate: {
      type: Boolean,
      default: false
    },
    // 更新间隔（毫秒）
    updateInterval: {
      type: Number,
      default: 60000 // 默认1分钟
    },
    // 显示最后更新时间
    showLastUpdate: {
      type: Boolean,
      default: false
    }
  },
  emits: ['chartReady', 'chartError', 'dataLoaded', 'update'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance()
    let chart = null
    let initAttempts = 0
    const maxAttempts = 5
    const chartReady = ref(false)
    const lastUpdateTime = ref(null)
    const updateTimer = ref(null)
    
    // 格式化最后更新时间
    const formatLastUpdateTime = computed(() => {
      if (!lastUpdateTime.value) return '';
      
      const date = new Date(lastUpdateTime.value);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    });
    
    // 模拟API调用
    const simulateApiCall = (option) => {
      return new Promise((resolve) => {
        console.log(`模拟API调用获取图表数据: ${props.chartId}`)
        setTimeout(() => {
          // 处理日期格式问题
          if (option && option.xAxis && option.xAxis.data) {
            // 如果x轴数据包含日期对象，确保转换为字符串
            if (option.xAxis.data.length > 0 && option.xAxis.data[0] instanceof Date) {
              option.xAxis.data = option.xAxis.data.map(date => {
                if (date instanceof Date) {
                  return date.toISOString()
                }
                return date
              })
            }
          }
          resolve(option)
        }, props.apiDelay)
      })
    }
    
    // 初始化图表
    const initChart = async () => {
      try {
        console.log(`尝试初始化图表 ${props.chartId}，第 ${initAttempts + 1} 次尝试`)
        
        // 确保DOM元素存在
        const dom = document.getElementById(props.chartId)
        if (!dom) {
          console.error(`找不到图表元素: ${props.chartId}`)
          retryInit()
          return
        }
        
        // 确保echarts可用
        const echarts = window.echarts
        if (!echarts) {
          console.error('找不到ECharts库')
          retryInit()
          return
        }
        
        // 检查DOM尺寸
        const width = dom.clientWidth
        const height = dom.clientHeight
        console.log(`图表容器尺寸: ${width}x${height}`)
        
        if (width === 0 || height === 0) {
          console.warn(`图表容器尺寸为零: ${width}x${height}`)
          retryInit()
          return
        }
        
        let finalOption = props.option
        
        // 如果需要模拟API调用
        if (props.simulateApiCall) {
          try {
            finalOption = await simulateApiCall(props.option)
            emit('dataLoaded', finalOption)
          } catch (error) {
            console.error('获取图表数据失败', error)
            retryInit()
            return
          }
        }
        
        // 创建图表实例
        try {
          // 如果已有实例，先销毁
          if (chart) {
            chart.dispose()
            chart = null
          }
          
          // 创建新实例
          chart = echarts.init(dom)
          console.log(`图表 ${props.chartId} 初始化成功`)
          
          // 设置图表选项
          chart.setOption(finalOption)
          console.log(`图表 ${props.chartId} 选项已设置`)
          
          // 添加窗口大小变化监听
          window.addEventListener('resize', handleResize)
          
          // 更新最后更新时间
          lastUpdateTime.value = new Date()
          
          // 标记图表已准备就绪
          chartReady.value = true
          
          // 触发准备就绪事件
          emit('chartReady')
          
          // 触发更新事件
          emit('update', { time: lastUpdateTime.value })
        } catch (error) {
          console.error(`创建图表实例失败: ${error.message}`)
          retryInit()
        }
      } catch (error) {
        console.error(`图表初始化错误: ${error.message}`)
        retryInit()
      }
    }
    
    // 重试初始化
    const retryInit = () => {
      initAttempts++
      if (initAttempts < maxAttempts) {
        console.log(`将在 ${initAttempts * 500}ms 后重试初始化图表`)
        setTimeout(initChart, initAttempts * 500)
      } else {
        console.error(`达到最大尝试次数 (${maxAttempts})，停止尝试初始化图表`)
        // 显示错误信息
        try {
          const dom = document.getElementById(props.chartId)
          if (dom) {
            dom.innerHTML = `
              <div style="padding: 20px; text-align: center; color: #f56c6c; background: #fef0f0; height: 100%;">
                <p style="margin: 0; padding-top: 50px;">图表加载失败</p>
                <p style="margin: 10px 0; font-size: 12px;">请尝试刷新页面</p>
              </div>
            `
          }
        } catch (e) {
          console.error('无法显示错误信息', e)
        }
      }
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (chart) {
        chart.resize()
      }
    }
    
    // 销毁图表
    const destroyChart = () => {
      if (chart) {
        try {
          chart.dispose()
        } catch (e) {
          console.error(`销毁图表错误: ${e.message}`)
        }
        chart = null
      }
      
      // 移除事件监听
      window.removeEventListener('resize', handleResize)
      
      // 重置状态
      chartReady.value = false
    }
    
    // 设置定时更新
    const setupAutoUpdate = () => {
      // 清除现有定时器
      clearAutoUpdate()
      
      // 如果启用自动更新，设置新的定时器
      if (props.autoUpdate && props.updateInterval > 0) {
        console.log(`为图表 ${props.chartId} 设置定时更新，间隔 ${props.updateInterval}ms`)
        updateTimer.value = setInterval(() => {
          updateChart()
        }, props.updateInterval)
      }
    }
    
    // 清除定时更新
    const clearAutoUpdate = () => {
      if (updateTimer.value) {
        clearInterval(updateTimer.value)
        updateTimer.value = null
      }
    }
    
    // 更新图表数据
    const updateChart = async () => {
      if (!chart) {
        console.warn(`更新图表 ${props.chartId} 失败: 图表实例不存在`)
        return
      }
      
      try {
        let finalOption = props.option
        
        // 如果需要模拟API调用
        if (props.simulateApiCall) {
          try {
            finalOption = await simulateApiCall(props.option)
            emit('dataLoaded', finalOption)
          } catch (error) {
            console.error('获取图表数据失败', error)
            return
          }
        }
        
        // 更新图表选项
        chart.setOption(finalOption)
        
        // 更新最后更新时间
        lastUpdateTime.value = new Date()
        
        // 触发更新事件
        emit('update', { time: lastUpdateTime.value })
      } catch (error) {
        console.error(`更新图表 ${props.chartId} 失败: ${error.message}`)
      }
    }
    
    // 直接渲染方法 - 使用原生DOM操作
    const directRender = async () => {
      console.log(`尝试直接渲染图表 ${props.chartId}`)
      
      try {
        // 获取DOM元素
        const dom = document.getElementById(props.chartId)
        if (!dom) {
          console.error(`直接渲染: 找不到图表元素 ${props.chartId}`)
          return
        }
        
        // 检查是否有原生echarts对象
        if (!window.echarts) {
          console.error('直接渲染: 找不到全局ECharts对象')
          return
        }
        
        let finalOption = props.option
        
        // 如果需要模拟API调用
        if (props.simulateApiCall) {
          try {
            finalOption = await simulateApiCall(props.option)
            emit('dataLoaded', finalOption)
          } catch (error) {
            console.error('获取图表数据失败', error)
            return
          }
        }
        
        // 创建图表实例
        const directChart = window.echarts.init(dom)
        
        // 设置选项
        directChart.setOption(finalOption)
        
        // 更新最后更新时间
        lastUpdateTime.value = new Date()
        
        console.log(`直接渲染图表 ${props.chartId} 成功`)
        
        // 标记图表已准备就绪
        chartReady.value = true
        
        // 触发准备就绪事件
        emit('chartReady')
        
        // 触发更新事件
        emit('update', { time: lastUpdateTime.value })
      } catch (error) {
        console.error(`直接渲染图表失败: ${error.message}`)
      }
    }
    
    // 监听选项变化
    watch(() => props.option, (newVal) => {
      // 存储选项到全局，以便本地脚本可以使用
      if (window.storeChartOption) {
        window.storeChartOption(props.chartId, newVal);
      }
      
      if (chart) {
        try {
          chart.setOption(newVal)
          // 更新最后更新时间
          lastUpdateTime.value = new Date()
          // 触发更新事件
          emit('update', { time: lastUpdateTime.value })
        } catch (error) {
          console.error(`更新图表选项失败: ${error.message}`)
          // 如果更新失败，尝试重新初始化
          initAttempts = 0
          initChart()
        }
      } else {
        // 如果图表实例不存在，尝试初始化
        initAttempts = 0
        initChart()
      }
    }, { deep: true })
    
    // 监听自动更新属性变化
    watch(() => props.autoUpdate, (newVal) => {
      if (newVal) {
        setupAutoUpdate()
      } else {
        clearAutoUpdate()
      }
    })
    
    // 监听更新间隔变化
    watch(() => props.updateInterval, () => {
      if (props.autoUpdate) {
        setupAutoUpdate()
      }
    })
    
    onMounted(() => {
      // 立即存储选项到全局
      if (window.storeChartOption) {
        window.storeChartOption(props.chartId, props.option);
      }
      
      // 延迟初始化以确保DOM已渲染
      setTimeout(initChart, 500)
      
      // 额外的安全措施：如果常规初始化失败，尝试直接渲染
      setTimeout(directRender, 2000)
      
      // 设置自动更新
      if (props.autoUpdate) {
        setupAutoUpdate()
      }
    })
    
    onUnmounted(() => {
      destroyChart()
      clearAutoUpdate()
    })
    
    return {
      chartReady,
      lastUpdateTime,
      formatLastUpdateTime
    }
  }
}
</script>

<style scoped>
.echart-container {
  position: relative;
}

.echart {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.update-info {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 12px;
  color: #999;
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px 0 0 0;
}
</style> 