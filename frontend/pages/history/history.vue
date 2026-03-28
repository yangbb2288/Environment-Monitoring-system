<template>
  <app-layout page-title="历史回溯">
    <view class="container">
      <view class="filter-section card">
        <sensor-selector-dialog 
          :sensors="sensors" 
          v-model="selectedSensorId" 
          :multiple="false" 
          @change="onSensorChange"
        />
      </view>
    
      <!-- 温度趋势图表组 -->
      <view class="chart-group card">
        <view class="section-header">
          <text class="section-title">历史温度趋势</text>
        </view>
        
        <view class="chart-tabs">
          <view 
            v-for="(range, index) in timeRanges" 
            :key="index"
            class="tab-item"
            :class="{ 'active': selectedTempTab === range.key }"
            @click="changeTab('temp', range.key)"
          >
            {{ range.name }}
          </view>
        </view>
        
        <view class="chart-container">
          <echarts 
            v-if="selectedTempTab === '1day'" 
            :option="temperatureChartOption1Day" 
            chart-id="temp-history-1day-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
          <echarts 
            v-if="selectedTempTab === '3days'" 
            :option="temperatureChartOption3Days" 
            chart-id="temp-history-3days-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
          <echarts 
            v-if="selectedTempTab === '1week'" 
            :option="temperatureChartOption1Week" 
            chart-id="temp-history-1week-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
        </view>
      </view>
    
      <!-- 湿度趋势图表组 -->
      <view class="chart-group card">
        <view class="section-header">
          <text class="section-title">历史湿度趋势</text>
        </view>
        
        <view class="chart-tabs">
          <view 
            v-for="(range, index) in timeRanges" 
            :key="index"
            class="tab-item"
            :class="{ 'active': selectedHumidityTab === range.key }"
            @click="changeTab('humidity', range.key)"
          >
            {{ range.name }}
          </view>
        </view>
        
        <view class="chart-container">
          <echarts 
            v-if="selectedHumidityTab === '1day'" 
            :option="humidityChartOption1Day" 
            chart-id="humidity-history-1day-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
          <echarts 
            v-if="selectedHumidityTab === '3days'" 
            :option="humidityChartOption3Days" 
            chart-id="humidity-history-3days-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
          <echarts 
            v-if="selectedHumidityTab === '1week'" 
            :option="humidityChartOption1Week" 
            chart-id="humidity-history-1week-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
        </view>
      </view>
    
      <!-- 可燃气体趋势图表组 -->
      <view class="chart-group card">
        <view class="section-header">
          <text class="section-title">可燃气体含量趋势</text>
        </view>
        
        <view class="chart-tabs">
          <view 
            v-for="(range, index) in timeRanges" 
            :key="index"
            class="tab-item"
            :class="{ 'active': selectedGasTab === range.key }"
            @click="changeTab('gas', range.key)"
          >
            {{ range.name }}
          </view>
        </view>
        
        <view class="chart-container">
          <echarts 
            v-if="selectedGasTab === '1day'" 
            :option="combustibleGasChartOption1Day" 
            chart-id="gas-history-1day-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
          <echarts 
            v-if="selectedGasTab === '3days'" 
            :option="combustibleGasChartOption3Days" 
            chart-id="gas-history-3days-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
          <echarts 
            v-if="selectedGasTab === '1week'" 
            :option="combustibleGasChartOption1Week" 
            chart-id="gas-history-1week-chart" 
            height="350px"
            @rendered="onChartRendered" 
          />
        </view>
      </view>
    
    <view class="data-table-section card">
      <view class="section-header">
        <text class="section-title">历史数据记录</text>
        <view class="section-actions">
          <button class="export-btn" @click="exportData">导出数据</button>
        </view>
      </view>
      <view class="table-container">
        <view class="table-header">
          <view class="header-cell">时间</view>
          <view class="header-cell">温度</view>
          <view class="header-cell">湿度</view>
          <view class="header-cell">可燃气体含量</view>
        </view>
        <scroll-view scroll-y style="height: 600rpx;">
          <view 
            v-for="(item, index) in paginatedData" 
            :key="index"
            class="table-row"
          >
            <view class="table-cell">{{ formatTime(item.recordTime) }}</view>
            <view class="table-cell">{{ item.temperature }}°C</view>
            <view class="table-cell">{{ item.humidity }}%</view>
            <view class="table-cell">{{ item.combustibleGas }}</view>
          </view>
        </scroll-view>
        <view class="pagination">
          <view class="page-size-selector">
            <text>每页显示：</text>
            <view class="page-size-options">
              <view 
                v-for="size in pageSizeOptions" 
                :key="size"
                class="page-size-option"
                :class="{ 'active': pageSize === size }"
                @click="setPageSize(size)"
              >
                {{ size }}
              </view>
            </view>
          </view>
          <view class="page-controls">
            <view class="page-btn" @click="prevPage" :class="{ 'disabled': currentPage === 1 }">上一页</view>
            <view class="page-number">{{ currentPage }} / {{ totalPages }}</view>
            <view class="page-btn" @click="nextPage" :class="{ 'disabled': currentPage === totalPages }">下一页</view>
          </view>
        </view>
      </view>
    </view>
  </view>
  </app-layout>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import SensorSelector from '../../components/SensorSelector.vue'
import SensorSelectorDialog from '../../components/SensorSelectorDialog.vue'
import AppLayout from '../../components/AppLayout.vue'
import ECharts from '../../components/ECharts.vue'
import { getLineChartOption } from '../../utils/chart'
import { formatDate } from '../../utils/date'
import api from '../../api/index'

export default {
  components: {
    SensorSelector,
    SensorSelectorDialog,
    AppLayout,
    ECharts
  },
  setup() {
    // 传感器数据
    const sensors = ref([])
    const selectedSensorId = ref([])
    const currentSensor = ref(null)
    
    // 时间范围选择
    const timeRanges = [
      { name: '最近一天', key: '1day' },
      { name: '最近三天', key: '3days' },
      { name: '最近一周', key: '1week' }
    ]
    
    // 选项卡状态
    const selectedTempTab = ref('1day')
    const selectedHumidityTab = ref('1day')
    const selectedGasTab = ref('1day')
    
    // 历史数据
    const historyData = ref([])
    
    // 分页设置
    const currentPage = ref(1)
    const pageSize = ref(10)
    const pageSizeOptions = [5, 10, 20, 50]
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(historyData.value.length / pageSize.value)
    })
    
    // 计算当前页的数据
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return historyData.value.slice(start, end)
    })
    
    // 图表数据
    const chartData = reactive({
      // 一天的数据
      day1: {
        times: [],
        temperature: [],
        humidity: [],
        combustibleGas: []
      },
      // 三天的数据
      day3: {
        times: [],
        temperature: [],
        humidity: [],
        combustibleGas: []
      },
      // 一周的数据
      week1: {
        times: [],
        temperature: [],
        humidity: [],
        combustibleGas: []
      }
    })
    
    // 处理历史数据，生成不同时间范围的图表数据
    const processChartData = (data) => {
      if (!data.length) return
      
      // 按记录时间升序排序
      const sortedData = [...data].sort((a, b) => 
        new Date(a.recordTime) - new Date(b.recordTime)
      )
      
      // 获取当前时间并向下取整到整小时
      const now = new Date()
      now.setMinutes(0, 0, 0)
      
      // 计算不同时间范围的起始时间
      const startTime1Day = new Date(now)
      startTime1Day.setDate(now.getDate() - 1)
      
      const startTime3Days = new Date(now)
      startTime3Days.setDate(now.getDate() - 3)
      
      const startTime1Week = new Date(now)
      startTime1Week.setDate(now.getDate() - 7)
      
      // 清空图表数据
      resetChartData()
      
      // 为不同时间范围生成数据点
      generateTimePoints(startTime1Day, now, 60 * 60 * 1000, 'HH:mm', chartData.day1) // 一天，每小时一个点
      generateTimePoints(startTime3Days, now, 3 * 60 * 60 * 1000, 'MM-DD HH:mm', chartData.day3) // 三天，每3小时一个点
      generateTimePoints(startTime1Week, now, 24 * 60 * 60 * 1000, 'MM-DD', chartData.week1) // 一周，每天一个点
      
      console.log('时间点生成完毕:', {
        day1: chartData.day1.times,
        day3: chartData.day3.times,
        week1: chartData.week1.times
      })
      
      // 将数据填充到时间点中
      aggregateDataByTimeRange(sortedData, startTime1Day, now, 60 * 60 * 1000, chartData.day1)
      aggregateDataByTimeRange(sortedData, startTime3Days, now, 3 * 60 * 60 * 1000, chartData.day3)
      aggregateDataByTimeRange(sortedData, startTime1Week, now, 24 * 60 * 60 * 1000, chartData.week1)
      
      console.log('数据聚合完毕:', {
        day1: {
          temperature: chartData.day1.temperature,
          humidity: chartData.day1.humidity,
          combustibleGas: chartData.day1.combustibleGas
        },
        day3: {
          temperature: chartData.day3.temperature,
          humidity: chartData.day3.humidity,
          combustibleGas: chartData.day3.combustibleGas
        },
        week1: {
          temperature: chartData.week1.temperature,
          humidity: chartData.week1.humidity,
          combustibleGas: chartData.week1.combustibleGas
        }
      })
    }
    
    // 重置图表数据
    const resetChartData = () => {
      chartData.day1.times = []
      chartData.day1.temperature = []
      chartData.day1.humidity = []
      chartData.day1.combustibleGas = []
      
      chartData.day3.times = []
      chartData.day3.temperature = []
      chartData.day3.humidity = []
      chartData.day3.combustibleGas = []
      
      chartData.week1.times = []
      chartData.week1.temperature = []
      chartData.week1.humidity = []
      chartData.week1.combustibleGas = []
    }
    
    // 生成时间点
    const generateTimePoints = (startTime, endTime, interval, format, targetData) => {
      let current = new Date(startTime)
      
      while (current <= endTime) {
        targetData.times.push(formatDate(current, format))
        targetData.temperature.push(null)
        targetData.humidity.push(null)
        targetData.combustibleGas.push(null)
        
        current = new Date(current.getTime() + interval)
      }
    }
    
    // 根据时间范围聚合数据
    const aggregateDataByTimeRange = (data, startTime, endTime, interval, targetData) => {
      // 创建聚合数据对象
      const aggregatedData = {}
      
      // 初始化所有时间点的聚合数据结构
      let current = new Date(startTime)
      while (current <= endTime) {
        const intervalKey = current.getTime()
        aggregatedData[intervalKey] = {
          count: 0,
          temperature: 0,
          humidity: 0,
          combustibleGas: 0
        }
        current = new Date(current.getTime() + interval)
      }
      
      // 聚合数据
      data.forEach(item => {
        const timestamp = new Date(item.recordTime).getTime()
        
        // 检查数据是否在时间范围内
        if (timestamp >= startTime.getTime() && timestamp <= endTime.getTime()) {
          // 确定数据落入哪个时间间隔
          const intervalKey = Math.floor((timestamp - startTime.getTime()) / interval) * interval + startTime.getTime()
          
          if (aggregatedData[intervalKey]) {
            aggregatedData[intervalKey].count++
            aggregatedData[intervalKey].temperature += item.temperature
            aggregatedData[intervalKey].humidity += item.humidity
            aggregatedData[intervalKey].combustibleGas += item.combustibleGas
          }
        }
      })
      
      // 填充到目标数据数组中
      current = new Date(startTime)
      let index = 0
      while (current <= endTime && index < targetData.times.length) {
        const intervalKey = current.getTime()
        const data = aggregatedData[intervalKey]
        
        if (data && data.count > 0) {
          targetData.temperature[index] = (data.temperature / data.count).toFixed(1)
          targetData.humidity[index] = (data.humidity / data.count).toFixed(1)
          targetData.combustibleGas[index] = (data.combustibleGas / data.count).toFixed(1)
        }
        
        current = new Date(current.getTime() + interval)
        index++
      }
    }
    
    // 温度图表配置 - 一天
    const temperatureChartOption1Day = computed(() => {
      return getLineChartOption(
        '最近一天温度趋势',
        chartData.day1.times,
        [
          { name: '温度', data: chartData.day1.temperature }
        ]
      )
    })
    
    // 温度图表配置 - 三天
    const temperatureChartOption3Days = computed(() => {
      return getLineChartOption(
        '最近三天温度趋势',
        chartData.day3.times,
        [
          { name: '温度', data: chartData.day3.temperature }
        ]
      )
    })
    
    // 温度图表配置 - 一周
    const temperatureChartOption1Week = computed(() => {
      return getLineChartOption(
        '最近一周温度趋势',
        chartData.week1.times,
        [
          { name: '温度', data: chartData.week1.temperature }
        ]
      )
    })
    
    // 湿度图表配置 - 一天
    const humidityChartOption1Day = computed(() => {
      return getLineChartOption(
        '最近一天湿度趋势',
        chartData.day1.times,
        [
          { name: '湿度', data: chartData.day1.humidity }
        ]
      )
    })
    
    // 湿度图表配置 - 三天
    const humidityChartOption3Days = computed(() => {
      return getLineChartOption(
        '最近三天湿度趋势',
        chartData.day3.times,
        [
          { name: '湿度', data: chartData.day3.humidity }
        ]
      )
    })
    
    // 湿度图表配置 - 一周
    const humidityChartOption1Week = computed(() => {
      return getLineChartOption(
        '最近一周湿度趋势',
        chartData.week1.times,
        [
          { name: '湿度', data: chartData.week1.humidity }
        ]
      )
    })
    
    // 可燃气体图表配置 - 一天
    const combustibleGasChartOption1Day = computed(() => {
      return getLineChartOption(
        '最近一天可燃气体含量趋势',
        chartData.day1.times,
        [
          { name: '可燃气体含量', data: chartData.day1.combustibleGas }
        ]
      )
    })
    
    // 可燃气体图表配置 - 三天
    const combustibleGasChartOption3Days = computed(() => {
      return getLineChartOption(
        '最近三天可燃气体含量趋势',
        chartData.day3.times,
        [
          { name: '可燃气体含量', data: chartData.day3.combustibleGas }
        ]
      )
    })
    
    // 可燃气体图表配置 - 一周
    const combustibleGasChartOption1Week = computed(() => {
      return getLineChartOption(
        '最近一周可燃气体含量趋势',
        chartData.week1.times,
        [
          { name: '可燃气体含量', data: chartData.week1.combustibleGas }
        ]
      )
    })
    
    // 加载传感器列表
    const loadSensors = async () => {
      try {
        const response = await api.sensor.getAllSensors()
        sensors.value = response.data
        
        if (sensors.value.length > 0) {
          selectedSensorId.value = [sensors.value[0].sensorId]
          currentSensor.value = sensors.value[0]
          loadHistoryData()
        }
      } catch (error) {
        console.error('Failed to load sensors', error)
        uni.showToast({
          title: '加载传感器列表失败',
          icon: 'none'
        })
      }
    }
    
    // 加载历史数据
    const loadHistoryData = async () => {
      try {
        uni.showLoading({
          title: '加载历史数据中...'
        })
        
        const response = await api.envData.getHistoryData()
        console.log(response)
        
        // 检查是否有数据返回
        if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
          historyData.value = response.data.data
          
          if (historyData.value.length === 0) {
            uni.showToast({
              title: '暂无历史数据',
              icon: 'none'
            })
          } else {
            console.log(`加载到${historyData.value.length}条历史数据`)
            // 处理图表数据
            processChartData(historyData.value)
          }
        } else {
          uni.showToast({
            title: '历史数据格式错误',
            icon: 'none'
          })
        }
        
        // 重置分页
        currentPage.value = 1
        
        uni.hideLoading()
      } catch (error) {
        console.error('Failed to load history data', error)
        uni.hideLoading()
        uni.showToast({
          title: '加载历史数据失败',
          icon: 'none'
        })
      }
    }
    
    // 传感器变化
    const onSensorChange = (ids) => {
      if (ids.length > 0) {
        const sensorId = ids[0]
        currentSensor.value = sensors.value.find(s => s.sensorId === sensorId)
        loadHistoryData()
      }
    }
    
    // 分页相关方法
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }
    
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }
    
    const setPageSize = (size) => {
      pageSize.value = size
      currentPage.value = 1 // 重置到第一页
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
    
    // 选项卡切换
    const changeTab = (type, key) => {
      switch(type) {
        case 'temp':
          selectedTempTab.value = key
          break
        case 'humidity':
          selectedHumidityTab.value = key
          break
        case 'gas':
          selectedGasTab.value = key
          break
      }
      
      // 在下一个渲染周期中确保图表正确重新渲染
      nextTick(() => {
        console.log(`切换到${type}图表的${key}选项卡`)
      })
    }
    
    // 图表渲染完成事件
    const onChartRendered = () => {
      console.log('图表渲染完成')
    }
    
    // 页面加载
    onMounted(() => {
      loadHistoryData()
    })
    
    return {
      sensors,
      selectedSensorId,
      timeRanges,
      selectedTempTab,
      selectedHumidityTab,
      selectedGasTab,
      historyData,
      paginatedData,
      currentPage,
      pageSize,
      pageSizeOptions,
      totalPages,
      temperatureChartOption1Day,
      temperatureChartOption3Days,
      temperatureChartOption1Week,
      humidityChartOption1Day,
      humidityChartOption3Days,
      humidityChartOption1Week,
      combustibleGasChartOption1Day,
      combustibleGasChartOption3Days,
      combustibleGasChartOption1Week,
      onSensorChange,
      nextPage,
      prevPage,
      setPageSize,
      formatTime,
      exportData,
      changeTab,
      onChartRendered
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.filter-section {
  margin-bottom: 20rpx;
}

.chart-group {
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
  
  .chart-tabs {
    display: flex;
    margin-bottom: 20rpx;
    border-bottom: 1px solid #eee;
    
    .tab-item {
      padding: 10rpx 30rpx;
      font-size: 26rpx;
      cursor: pointer;
      position: relative;
      
      &.active {
        color: $uni-color-primary;
        font-weight: bold;
        
        &:after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: $uni-color-primary;
        }
      }
    }
  }
  
  .chart-container {
    height: 350px;
    position: relative;
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
    
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      font-size: 24rpx;
      
      .page-size-selector {
        display: flex;
        align-items: center;
        
        .page-size-options {
          display: flex;
          margin-left: 10rpx;
          
          .page-size-option {
            padding: 4rpx 16rpx;
            margin: 0 6rpx;
            border: 1px solid #ddd;
            border-radius: 4rpx;
            
            &.active {
              background-color: $uni-color-primary;
              color: #fff;
              border-color: $uni-color-primary;
            }
          }
        }
      }
      
      .page-controls {
        display: flex;
        align-items: center;
        
        .page-btn {
          padding: 4rpx 16rpx;
          border: 1px solid #ddd;
          border-radius: 4rpx;
          margin: 0 10rpx;
          
          &.disabled {
            color: #ccc;
            cursor: not-allowed;
          }
        }
        
        .page-number {
          margin: 0 10rpx;
        }
      }
    }
  }
}
</style> 