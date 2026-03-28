<template>
  <view class="container">
    <view class="header-section card">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <view class="sensor-info" v-if="sensor">
        <view class="sensor-name">{{ sensor.name }}</view>
        <view class="sensor-meta">
          <text class="sensor-id">ID: {{ sensor.sensorId }}</text>
          <text class="sensor-status" :class="{ 'online': sensor.status === 'online' }">
            {{ sensor.status === 'online' ? '在线' : '离线' }}
          </text>
        </view>
        <view class="sensor-location">位置: {{ sensor.location }}</view>
      </view>
    </view>
    
    <view class="filter-section card">
      <date-range-picker 
        v-model:startDate="startDate" 
        v-model:endDate="endDate" 
        @change="onDateRangeChange"
      />
    </view>
    
    <view class="data-cards">
      <data-card 
        title="温度" 
        :value="latestData.temperature" 
        unit="°C"
        :warning-threshold="30"
        :danger-threshold="35"
        :trend="temperatureTrend"
      />
      <data-card 
        title="湿度" 
        :value="latestData.humidity" 
        unit="%"
        :warning-threshold="80"
        :danger-threshold="90"
        :trend="humidityTrend"
      />
      <data-card 
        title="空气质量" 
        :value="latestData.airQuality" 
        unit="AQI"
        :warning-threshold="100"
        :danger-threshold="150"
        :trend="airQualityTrend"
      />
      <data-card 
        title="PM2.5" 
        :value="latestData.pm25" 
        unit="μg/m³"
        :warning-threshold="75"
        :danger-threshold="150"
        :trend="pm25Trend"
      />
    </view>
    
    <view class="chart-section card">
      <view class="section-header">
        <text class="section-title">温湿度详细数据</text>
      </view>
      <view class="chart-container">
        <echarts :option="tempHumidityChartOption" chart-id="temp-humidity-detail-chart" height="350px" />
      </view>
    </view>
    
    <view class="chart-section card">
      <view class="section-header">
        <text class="section-title">空气质量详细数据</text>
      </view>
      <view class="chart-container">
        <echarts :option="airQualityChartOption" chart-id="air-quality-detail-chart" height="350px" />
      </view>
    </view>
    
    <view class="data-table-section card">
      <view class="section-header">
        <text class="section-title">原始数据记录</text>
        <view class="section-actions">
          <button class="export-btn" @click="exportData">导出数据</button>
        </view>
      </view>
      <view class="table-container">
        <view class="table-header">
          <view class="header-cell">时间</view>
          <view class="header-cell">温度</view>
          <view class="header-cell">湿度</view>
          <view class="header-cell">空气质量</view>
          <view class="header-cell">PM2.5</view>
        </view>
        <scroll-view scroll-y style="height: 600rpx;">
          <view 
            v-for="(item, index) in detailData" 
            :key="index"
            class="table-row"
          >
            <view class="table-cell">{{ formatTime(item.timestamp) }}</view>
            <view class="table-cell">{{ item.temperature }}°C</view>
            <view class="table-cell">{{ item.humidity }}%</view>
            <view class="table-cell">{{ item.airQuality }}</view>
            <view class="table-cell">{{ item.pm25 }}</view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import DataCard from '../../components/DataCard.vue'
import DateRangePicker from '../../components/DateRangePicker.vue'
import ECharts from '../../components/ECharts.vue'
import { getLineChartOption } from '../../utils/chart'
import { formatDate, getPastDate } from '../../utils/date'
import api from '../../api/index'

export default {
  components: {
    DataCard,
    DateRangePicker,
    ECharts
  },
  setup() {
    const sensorId = ref('')
    const sensor = ref(null)
    
    // 日期范围
    const startDate = ref(getPastDate(7))
    const endDate = ref(new Date())
    
    // 详细数据
    const detailData = ref([])
    
    // 最新数据
    const latestData = reactive({
      temperature: 0,
      humidity: 0,
      airQuality: 0,
      pm25: 0,
      pm10: 0,
      co2: 0,
      noise: 0,
      light: 0
    })
    
    // 趋势数据
    const temperatureTrend = ref(0)
    const humidityTrend = ref(0)
    const airQualityTrend = ref(0)
    const pm25Trend = ref(0)
    
    // 图表数据
    const chartData = reactive({
      times: [],
      temperature: [],
      humidity: [],
      airQuality: [],
      pm25: [],
      pm10: [],
      co2: []
    })
    
    // 温湿度图表配置
    const tempHumidityChartOption = computed(() => {
      return getLineChartOption(
        '温湿度趋势',
        chartData.times,
        [
          { name: '温度', data: chartData.temperature },
          { name: '湿度', data: chartData.humidity }
        ]
      )
    })
    
    // 空气质量图表配置
    const airQualityChartOption = computed(() => {
      return getLineChartOption(
        '空气质量趋势',
        chartData.times,
        [
          { name: '空气质量', data: chartData.airQuality },
          { name: 'PM2.5', data: chartData.pm25 },
          { name: 'PM10', data: chartData.pm10 },
          { name: 'CO2', data: chartData.co2 }
        ]
      )
    })
    
    // 获取传感器信息
    const loadSensorInfo = async () => {
      try {
        const response = await api.sensor.getSensorById(sensorId.value)
        sensor.value = response.data
      } catch (error) {
        console.error('Failed to load sensor info', error)
        uni.showToast({
          title: '加载传感器信息失败',
          icon: 'none'
        })
      }
    }
    
    // 加载最新数据
    const loadLatestData = async () => {
      try {
        const response = await api.envData.getLatestData(sensorId.value, 2)
        const data = response.data
        
        if (data.length > 0) {
          const latest = data[0]
          const previous = data.length > 1 ? data[1] : null
          
          // 更新最新数据
          latestData.temperature = latest.temperature
          latestData.humidity = latest.humidity
          latestData.airQuality = latest.airQuality
          latestData.pm25 = latest.pm25
          latestData.pm10 = latest.pm10
          latestData.co2 = latest.co2
          latestData.noise = latest.noise
          latestData.light = latest.light
          
          // 计算趋势
          if (previous) {
            temperatureTrend.value = latest.temperature - previous.temperature
            humidityTrend.value = latest.humidity - previous.humidity
            airQualityTrend.value = latest.airQuality - previous.airQuality
            pm25Trend.value = latest.pm25 - previous.pm25
          }
        }
      } catch (error) {
        console.error('Failed to load latest data', error)
      }
    }
    
    // 加载详细数据
    const loadDetailData = async () => {
      try {
        uni.showLoading({
          title: '加载数据中...'
        })
        
        const response = await api.envData.getDataByTimeRange(
          sensorId.value,
          startDate.value,
          endDate.value
        )
        
        detailData.value = response.data
        
        // 清空图表数据
        chartData.times = []
        chartData.temperature = []
        chartData.humidity = []
        chartData.airQuality = []
        chartData.pm25 = []
        chartData.pm10 = []
        chartData.co2 = []
        
        // 填充图表数据
        detailData.value.forEach(item => {
          chartData.times.push(formatDate(item.timestamp, 'MM-DD HH:mm'))
          chartData.temperature.push(item.temperature)
          chartData.humidity.push(item.humidity)
          chartData.airQuality.push(item.airQuality)
          chartData.pm25.push(item.pm25)
          chartData.pm10.push(item.pm10)
          chartData.co2.push(item.co2)
        })
        
        uni.hideLoading()
      } catch (error) {
        console.error('Failed to load detail data', error)
        uni.hideLoading()
        uni.showToast({
          title: '加载详细数据失败',
          icon: 'none'
        })
      }
    }
    
    // 日期范围变化
    const onDateRangeChange = () => {
      loadDetailData()
    }
    
    // 格式化时间
    const formatTime = (timestamp) => {
      return formatDate(timestamp, 'YYYY-MM-DD HH:mm')
    }
    
    // 导出数据
    const exportData = () => {
      uni.showToast({
        title: '数据导出功能开发中',
        icon: 'none'
      })
    }
    
    // 返回上一页
    const goBack = () => {
      uni.navigateBack()
    }
    
    // 页面加载
    onMounted(() => {
      // 获取路由参数
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = currentPage.$page.options
      
      if (options.sensorId) {
        sensorId.value = options.sensorId
        loadSensorInfo()
        loadLatestData()
        loadDetailData()
      } else {
        uni.showToast({
          title: '参数错误',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    })
    
    return {
      sensor,
      startDate,
      endDate,
      detailData,
      latestData,
      temperatureTrend,
      humidityTrend,
      airQualityTrend,
      pm25Trend,
      tempHumidityChartOption,
      airQualityChartOption,
      onDateRangeChange,
      formatTime,
      exportData,
      goBack
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.header-section {
  margin-bottom: 20rpx;
  
  .back-btn {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .back-icon {
      font-size: 32rpx;
      margin-right: 10rpx;
    }
    
    .back-text {
      font-size: 28rpx;
    }
  }
  
  .sensor-info {
    .sensor-name {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    
    .sensor-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10rpx;
      
      .sensor-id {
        font-size: 24rpx;
        color: #666;
      }
      
      .sensor-status {
        font-size: 24rpx;
        padding: 6rpx 20rpx;
        background-color: #f56c6c;
        color: #fff;
        border-radius: 30rpx;
        
        &.online {
          background-color: #67c23a;
        }
      }
    }
    
    .sensor-location {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.filter-section {
  margin-bottom: 20rpx;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.chart-section {
  margin-bottom: 20rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
    }
  }
  
  .chart-container {
    height: 350px;
  }
}

.data-table-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
    }
    
    .export-btn {
      font-size: 24rpx;
      padding: 6rpx 20rpx;
      background-color: $uni-color-primary;
      color: #fff;
      border-radius: 30rpx;
      line-height: 1.5;
    }
  }
  
  .table-container {
    .table-header {
      display: flex;
      background-color: #f5f5f5;
      font-weight: bold;
      
      .header-cell {
        flex: 1;
        padding: 20rpx;
        text-align: center;
        font-size: 26rpx;
        
        &:first-child {
          flex: 2;
        }
      }
    }
    
    .table-row {
      display: flex;
      border-bottom: 1px solid #eee;
      
      &:nth-child(even) {
        background-color: #fafafa;
      }
      
      .table-cell {
        flex: 1;
        padding: 20rpx;
        text-align: center;
        font-size: 26rpx;
        
        &:first-child {
          flex: 2;
        }
      }
    }
  }
}
</style> 