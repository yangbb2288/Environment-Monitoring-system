// EChartsRender.js
// 用于在uni-app环境中渲染ECharts的renderjs模块

export default {
  data() {
    return {
      chart: null,
      resizeObserver: null
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
      console.log('Renderjs: 初始化图表', this.props.chartId)
      
      // 获取DOM元素
      const dom = document.getElementById(this.props.chartId)
      if (!dom) {
        console.error('Renderjs: 找不到图表DOM元素', this.props.chartId)
        // 延迟重试
        setTimeout(() => {
          this.initChart(data)
        }, 300)
        return
      }
      
      try {
        // 确保echarts可用
        if (!window.echarts) {
          console.error('Renderjs: ECharts库不可用')
          return
        }
        
        // 如果已有实例，则销毁
        if (this.chart) {
          this.chart.dispose()
          this.chart = null
        }
        
        // 创建新实例
        this.chart = window.echarts.init(dom)
        
        // 设置选项
        if (data && data.option) {
          this.chart.setOption(data.option)
        }
        
        // 添加点击事件
        this.chart.on('click', (params) => {
          uni.$emit('chartClick-' + this.props.chartId, params)
        })
        
        // 通知图表已准备就绪
        uni.$emit('chartReady-' + this.props.chartId)
        
        // 处理自动调整大小
        if (data && data.autoResize) {
          // 使用ResizeObserver监听容器大小变化
          if (window.ResizeObserver && !this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
              if (this.chart) {
                this.chart.resize()
              }
            })
            this.resizeObserver.observe(dom)
          } else {
            // 回退到window.resize
            window.addEventListener('resize', this.handleResize)
          }
        }
        
        console.log('Renderjs: 图表初始化成功', this.props.chartId)
      } catch (error) {
        console.error('Renderjs: 图表初始化错误', error)
        
        // 尝试显示错误信息
        try {
          dom.innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
              <p>图表加载失败</p>
              <p>${error.message || '未知错误'}</p>
            </div>
          `
        } catch (e) {
          console.error('无法显示错误信息', e)
        }
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    // 销毁图表
    disposeChart() {
      console.log('Renderjs: 销毁图表', this.props.chartId)
      
      // 移除ResizeObserver
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
      
      // 移除resize事件监听
      window.removeEventListener('resize', this.handleResize)
      
      // 销毁图表实例
      if (this.chart) {
        try {
          this.chart.dispose()
        } catch (e) {
          console.error('Renderjs: 销毁图表错误', e)
        }
        this.chart = null
      }
    }
  },
  beforeDestroy() {
    this.disposeChart()
  }
} 