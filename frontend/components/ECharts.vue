<template>
  <view class="echart-container" :style="{ width: width, height: height }">
    <view :id="chartId" class="echart" :style="{ width: '100%', height: '100%' }">
      <!-- 加载中提示 -->
      <view v-if="!chartReady" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">图表加载中...</text>
      </view>
    </view>
    <view v-if="showLastUpdate && lastUpdateTime" class="update-info">
      最后更新: {{ formatLastUpdateTime }}
    </view>
  </view>
</template>

<script>
import { onMounted, onUnmounted, watch, ref, nextTick, computed } from 'vue'

// 定义组件
const EChartsComponent = {
  name: 'echarts',
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
    autoResize: {
      type: Boolean,
      default: true
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
  emits: ['chartClick', 'chartReady', 'chartError', 'dataLoaded', 'update'],
  setup(props, { emit, expose }) {
    const chartReady = ref(false)
    const initAttempts = ref(0)
    const maxAttempts = 5
    const lastUpdateTime = ref(null)
    const updateTimer = ref(null)
    const chartInstance = ref(null)
    
    // 格式化最后更新时间
    const formatLastUpdateTime = computed(() => {
      if (!lastUpdateTime.value) return '';
      
      const date = new Date(lastUpdateTime.value);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    });
    
    // 检查ECharts是否可用
    const checkEChartsAvailable = () => {
      if (window.echarts) {
        console.log('ECharts 已加载，版本:', window.echarts.version)
        return true
      }
      console.warn('ECharts 未加载')
      return false
    }
    
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
    
    // 通过事件通信与renderjs交互
    const updateChart = async () => {
      // 检查ECharts是否可用
      if (!checkEChartsAvailable() && initAttempts.value < maxAttempts) {
        console.log(`ECharts未加载，${500 * initAttempts.value}ms后重试...`)
        initAttempts.value++
        setTimeout(updateChart, 500 * initAttempts.value)
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
          emit('chartError', { message: '获取图表数据失败' })
          return
        }
      }
      
      // 更新最后更新时间
      lastUpdateTime.value = new Date()
      
      // 触发更新事件，传递数据给renderjs
      uni.$emit('updateEChart-' + props.chartId, {
        option: finalOption,
        autoResize: props.autoResize
      })
      
      // 触发更新事件
      emit('update', { time: lastUpdateTime.value })
    }
    
    // 监听图表点击事件
    uni.$on('chartClick-' + props.chartId, (params) => {
      emit('chartClick', params)
    })
    
    // 监听图表准备就绪事件
    uni.$on('chartReady-' + props.chartId, () => {
      chartReady.value = true
      emit('chartReady')
    })
    
    // 监听图表错误事件
    uni.$on('chartError-' + props.chartId, (error) => {
      emit('chartError', error)
    })
    
    // 监听图表实例事件
    uni.$on('chartInstance-' + props.chartId, (instance) => {
      chartInstance.value = instance
      console.log(`图表 ${props.chartId} 实例已保存`)
    })
    
    // 监听ECharts全局加载事件
    uni.$on('echarts-ready', () => {
      console.log('收到ECharts全局加载完成事件')
      nextTick(() => {
        updateChart()
      })
    })
    
    // 监听配置变化
    watch(() => props.option, () => {
      if (chartReady.value) {
        updateChart()
      } else if (window.echarts) {
        // 如果图表未准备好但ECharts已加载，尝试初始化
        updateChart()
      }
    }, { deep: true })
    
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
    
    // 在setup函数中添加直接渲染方法
    const directRender = async () => {
      console.log('尝试直接渲染图表:', props.chartId)
      
      // 确保DOM已渲染
      nextTick(async () => {
        try {
          // 检查echarts是否可用
          if (!window.echarts) {
            console.error('直接渲染: ECharts不可用')
            return
          }
          
          // 获取DOM元素
          const dom = document.getElementById(props.chartId)
          if (!dom) {
            console.error('直接渲染: 找不到DOM元素', props.chartId)
            return
          }
          
          // 检查DOM尺寸
          const width = dom.clientWidth
          const height = dom.clientHeight
          console.log('直接渲染: DOM尺寸', width, 'x', height)
          
          if (width === 0 || height === 0) {
            console.warn('直接渲染: DOM尺寸为0')
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
              emit('chartError', { message: '获取图表数据失败' })
              return
            }
          }
          
          // 创建图表实例
          console.log('直接渲染: 创建图表实例')
          const chart = window.echarts.init(dom)
          
          // 设置选项
          console.log('直接渲染: 设置图表选项')
          chart.setOption(finalOption)
          
          // 设置自适应
          if (props.autoResize) {
            window.addEventListener('resize', () => {
              chart.resize()
            })
          }
          
          // 更新最后更新时间
          lastUpdateTime.value = new Date()
          
          console.log('直接渲染: 图表渲染成功')
          chartReady.value = true
          emit('chartReady')
          emit('update', { time: lastUpdateTime.value })
          
          // 通知图表准备就绪
          uni.$emit('chartReady-' + props.chartId)
          
          // 传递图表实例给Vue组件
          uni.$emit('chartInstance-' + props.chartId, chart)
        } catch (error) {
          console.error('直接渲染: 图表渲染失败', error)
          emit('chartError', error)
        }
      })
    }
    
    // 直接更新图表数据的方法
    const updateChartData = (newOption) => {
      if (chartInstance.value && window.echarts) {
        try {
          // 使用merge模式更新，保持现有配置
          chartInstance.value.setOption(newOption, {
            notMerge: false,
            lazyUpdate: false,
            silent: false
          })
          lastUpdateTime.value = new Date()
          console.log(`图表 ${props.chartId} 数据已直接更新`)
        } catch (error) {
          console.error(`更新图表 ${props.chartId} 数据失败:`, error)
        }
      } else {
        console.warn(`图表 ${props.chartId} 实例不可用，无法直接更新`)
      }
    }
    
    onMounted(() => {
      // 存储选项到全局，以便本地脚本可以使用
      if (window.storeChartOption) {
        window.storeChartOption(props.chartId, props.option)
      }
      
      // 组件挂载后，延迟一段时间再初始化图表
      setTimeout(() => {
        updateChart()
      }, 300)
      
      // 额外的安全措施：如果常规初始化失败，尝试直接渲染
      setTimeout(() => {
        if (!chartReady.value) {
          console.log('常规初始化似乎失败，尝试直接渲染')
          directRender()
        }
      }, 2000)
      
      // 设置自动更新
      if (props.autoUpdate) {
        setupAutoUpdate()
      }
    })
    
    onUnmounted(() => {
      // 组件卸载时，触发销毁事件
      uni.$emit('disposeEChart-' + props.chartId)
      
      // 移除事件监听
      uni.$off('chartClick-' + props.chartId)
      uni.$off('chartReady-' + props.chartId)
      uni.$off('chartError-' + props.chartId)
      uni.$off('echarts-ready')
      
      // 清除定时更新
      clearAutoUpdate()
    })
    
    // 暴露方法给父组件
    expose({
      updateChartData
    })
    
    return {
      chartReady,
      lastUpdateTime,
      formatLastUpdateTime
    }
  }
}

// 导出组件
export default EChartsComponent
</script>

<!-- 使用renderjs处理浏览器端的DOM操作 -->
<script module="echarts" lang="renderjs">
// 用于在uni-app环境中渲染ECharts的renderjs模块
export const renderModule = {
  data() {
    return {
      chart: null,
      resizeObserver: null,
      initAttempts: 0,
      maxAttempts: 10
    }
  },
  mounted() {
    // 监听更新事件
    uni.$on('updateEChart-' + this.props.chartId, (data) => {
      this.initChart(data)
    })
    
    // 监听销毁事件
    uni.$on('disposeEChart-' + this.props.chartId, () => {
      this.disposeChart()
      uni.$off('updateEChart-' + this.props.chartId)
      uni.$off('disposeEChart-' + this.props.chartId)
    })
  },
  methods: {
    // 初始化或更新图表
    initChart(data) {
      console.log('Renderjs: 初始化图表', this.props.chartId, '数据:', JSON.stringify(data).substring(0, 100) + '...')
      
      try {
        // 确保echarts可用
        if (!window.echarts) {
          console.error('Renderjs: ECharts库不可用')
          // 延迟重试
          if (this.initAttempts < this.maxAttempts) {
            this.initAttempts++
            setTimeout(() => {
              this.initChart(data)
            }, 500 * this.initAttempts)
          } else {
            uni.$emit('chartError-' + this.props.chartId, { message: 'ECharts库不可用' })
          }
          return
        }
        
        // 获取DOM元素
        const dom = document.getElementById(this.props.chartId)
        console.log('Renderjs: 查找DOM元素', this.props.chartId, dom ? '找到' : '未找到')
        
        if (!dom) {
          console.error('Renderjs: 找不到图表DOM元素', this.props.chartId)
          // 延迟重试
          if (this.initAttempts < this.maxAttempts) {
            this.initAttempts++
            setTimeout(() => {
              this.initChart(data)
            }, 500 * this.initAttempts)
          } else {
            uni.$emit('chartError-' + this.props.chartId, { message: '找不到图表DOM元素' })
          }
          return
        }
        
        // 检查DOM尺寸
        const width = dom.clientWidth
        const height = dom.clientHeight
        
        if (width === 0 || height === 0) {
          console.warn('Renderjs: DOM尺寸为0, 延迟渲染')
          // 延迟重试
          if (this.initAttempts < this.maxAttempts) {
            this.initAttempts++
            setTimeout(() => {
              this.initChart(data)
            }, 500 * this.initAttempts)
          } else {
            uni.$emit('chartError-' + this.props.chartId, { message: 'DOM尺寸为0' })
          }
          return
        }
        
        // 如果已有图表实例，则更新
        if (this.chart) {
          console.log('Renderjs: 更新已有图表')
          // 使用merge模式更新，保持现有配置和状态
          this.chart.setOption(data.option, {
            notMerge: false,
            lazyUpdate: false,
            silent: false
          })
          this.chart.resize()
        } else {
          // 创建新的图表实例
          console.log('Renderjs: 创建新图表')
          this.chart = window.echarts.init(dom, null, {
            renderer: 'canvas',
            useDirtyRect: false,
            // 确保tooltip功能正常
            devicePixelRatio: window.devicePixelRatio || 1
          })
          
          // 设置选项
          this.chart.setOption(data.option, true)
          
          // 添加点击事件监听
          this.chart.on('click', (params) => {
            uni.$emit('chartClick-' + this.props.chartId, params)
          })
          
          // 添加悬浮事件监听，确保数值显示
          this.chart.on('mouseover', (params) => {
            if (params.componentType === 'series') {
              console.log('鼠标悬浮在数据点:', params.seriesName, params.value)
            }
          })
          
          // 添加图例点击事件监听，处理系列显示/隐藏
          this.chart.on('legendselectchanged', (params) => {
            console.log('图例状态改变:', params)
          })
          
          // 设置自适应
          if (data.autoResize) {
            this.setupResize()
          }
          
          // 通知图表准备就绪
          uni.$emit('chartReady-' + this.props.chartId)
          
          // 传递图表实例给Vue组件
          uni.$emit('chartInstance-' + this.props.chartId, this.chart)
        }
      } catch (error) {
        console.error('Renderjs: 图表初始化失败', error)
        uni.$emit('chartError-' + this.props.chartId, error)
      }
    },
    
    // 设置自适应
    setupResize() {
      // 使用ResizeObserver监听容器大小变化
      if (window.ResizeObserver && !this.resizeObserver) {
        const dom = document.getElementById(this.props.chartId)
        this.resizeObserver = new ResizeObserver(() => {
          if (this.chart) {
            this.chart.resize()
          }
        })
        this.resizeObserver.observe(dom)
      }
      
      // 同时监听窗口大小变化
      window.addEventListener('resize', this.handleResize)
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    // 销毁图表
    disposeChart() {
      // 移除窗口大小变化监听
      window.removeEventListener('resize', this.handleResize)
      
      // 移除ResizeObserver
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
      
      // 销毁图表实例
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
    }
  },
  beforeDestroy() {
    this.disposeChart()
  }
}
</script>

<style>
.echart-container {
  position: relative;
  box-sizing: border-box;
  padding-bottom: 10px;
}

.echart {
  width: 100%;
  height: 100%;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #666;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 强制tooltip显示在最上层 */
:deep(.echarts-tooltip) {
  z-index: 9999 !important;
  position: absolute !important;
}
</style> 