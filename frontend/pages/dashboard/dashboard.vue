<template>
  <app-layout page-title="数据看板">
    <page-container v-if="hasPermission" title="数据看板">
      <template #actions>
        <el-button @click="loadTestData" type="primary">加载测试数据</el-button>
        <el-switch
          v-model="autoRefresh"
          active-text="实时更新"
          inactive-text="停止更新"
          @change="handleAutoRefreshChange"
        />
      </template>
      
      <el-row :gutter="16" class="mb-4">
        <el-col :span="24">
          <el-card shadow="never" class="filter-card">
            <el-row :gutter="16" class="filter-row">
              <el-col :xs="24" :sm="24" :md="8" :lg="8" class="filter-col">
                <div class="filter-label">选择传感器：</div>
                <sensor-selector-dialog 
                  :sensors="sensors" 
                  v-model="selectedSensorId" 
                  :multiple="false" 
                  @change="onSensorChange"
                  class="filter-component"
                />
              </el-col>
              
              <el-col :xs="24" :sm="24" :md="10" :lg="10" class="filter-col">
                <div class="filter-label">选择日期范围：</div>
                <date-range-picker-dialog
                  v-model:startDate="startDate" 
                  v-model:endDate="endDate" 
                  @change="onDateRangeChange"
                  class="filter-component"
                />
              </el-col>
              
              <el-col :xs="24" :sm="24" :md="6" :lg="6" class="filter-col">
                <div class="filter-label">数据粒度：</div>
                <data-granularity-dialog
                  v-model="groupBy"
                  :options="groupByOptions"
                  :values="groupByValues"
                  @change="loadChartData"
                  class="filter-component"
                />
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="16" class="mb-4" v-if="currentSensor">
        <el-col :xs="24" :sm="12" :md="6" :lg="6">
          <stat-card 
            title="传感器状态" 
            :value="currentSensor.status === 'online' ? '在线' : '离线'"
            :icon="currentSensor.status === 'online' ? 'CircleCheckFilled' : 'CircleCloseFilled'"
            :icon-color="currentSensor.status === 'online' ? 'success' : 'danger'"
            :value-color="currentSensor.status === 'online' ? 'success' : 'danger'"
          >
            <template #footer>
              <div class="sensor-info-footer">
                位置: {{ currentSensor.location }}
              </div>
            </template>
          </stat-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6">
          <stat-card 
            title="平均温度" 
            :value="avgTemperature" 
            unit="°C"
            icon="Sunrise"
            icon-color="warning"
            :warning-threshold="30"
            :danger-threshold="35"
            :trend="tempTrend"
          />
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6">
          <stat-card 
            title="平均湿度" 
            :value="avgHumidity" 
            unit="%"
            icon="Cloudy"
            icon-color="primary"
            :warning-threshold="80"
            :danger-threshold="90"
            :trend="humidityTrend"
          />
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6">
          <stat-card 
            title="可燃气体含量" 
            :value="avgCombustibleGas" 
            unit="ppm"
            icon="Warning"
            icon-color="danger"
            :warning-threshold="1000"
            :danger-threshold="2000"
            :trend="combustibleGasTrend"
            :progress-value="combustibleGasScore"
            progress-color="#67c23a"
          />
        </el-col>
      </el-row>
      
      <el-row :gutter="16">
        <el-col :xs="24" :lg="12" class="mb-4">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>温湿度趋势</span>
                <el-tooltip content="显示所选时间段内温湿度变化趋势" placement="top">
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="chart-container">
              <echarts 
                ref="tempHumidityChartRef"
                :option="tempHumidityChartOption" 
                chart-id="dashboard-temp-humidity-chart" 
                height="350px" 
                show-last-update="true"
                :simulate-api-call="false"
              />
            </div>
            <div class="update-time" v-if="lastUpdateTime">
              最后更新时间: {{ formatDate(lastUpdateTime, 'YYYY-MM-DD HH:mm:ss') }}
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12" class="mb-4">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>可燃气体含量</span>
                <el-tooltip content="显示所选时间段内可燃气体含量变化" placement="top">
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="chart-container">
              <echarts 
                ref="combustibleGasChartRef"
                :option="combustibleGasChartOption" 
                chart-id="dashboard-combustible-gas-chart" 
                height="350px"
                show-last-update="true"
                :simulate-api-call="false"
              />
            </div>
            <div class="update-time" v-if="lastUpdateTime">
              最后更新时间: {{ formatDate(lastUpdateTime, 'YYYY-MM-DD HH:mm:ss') }}
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="16">
        <el-col :xs="24" :lg="12" class="mb-4">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>环境综合评分</span>
                <el-tooltip content="多维度环境指标评分雷达图" placement="top">
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="chart-container">
              <echarts 
                ref="radarChartRef"
                :option="radarChartOption" 
                chart-id="dashboard-radar-chart" 
                height="350px"
                show-last-update="true"
                :simulate-api-call="false"
              />
            </div>
            <div class="update-time" v-if="lastUpdateTime">
              最后更新时间: {{ formatDate(lastUpdateTime, 'YYYY-MM-DD HH:mm:ss') }}
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12" class="mb-4">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>数据热力分布</span>
                <el-tooltip content="时间-日期的温度分布热力图" placement="top">
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="chart-container">
              <echarts 
                ref="heatmapChartRef"
                :option="heatmapOption" 
                chart-id="dashboard-heatmap-chart" 
                height="350px"
                show-last-update="true"
                :simulate-api-call="false"
              />
            </div>
            <div class="update-time" v-if="lastUpdateTime">
              最后更新时间: {{ formatDate(lastUpdateTime, 'YYYY-MM-DD HH:mm:ss') }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </page-container>
    
    <el-empty v-else description="您没有权限访问此页面"></el-empty>
  </app-layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import PageContainer from '../../components/PageContainer.vue'
import SensorSelector from '../../components/SensorSelector.vue'
import DateRangePicker from '../../components/DateRangePicker.vue'
import ECharts from '../../components/ECharts.vue'
import StatCard from '../../components/StatCard.vue'
import SensorSelectorDialog from '../../components/SensorSelectorDialog.vue'
import DateRangePickerDialog from '../../components/DateRangePickerDialog.vue'
import DataGranularityDialog from '../../components/DataGranularityDialog.vue'
import { getLineChartOption, getBarChartOption, getRadarChartOption, getHeatmapOption } from '../../utils/chart'
import { formatDate, getPastDate, getDateRange } from '../../utils/date'
import api from '../../api/index'
import { generateEnvData, generateSensors } from '../../utils/mockData'
import { getRolePermissions, checkFeaturePermission } from '../../utils/permission'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'

// 权限检查
const userInfo = ref(uni.getStorageSync('userInfo') || { role: 'public' })
const userPermissions = ref(getRolePermissions(userInfo.value.role))
const hasPermission = ref(checkFeaturePermission('realtime_monitoring', userPermissions.value))

// 传感器数据
const sensors = ref([])
const selectedSensorId = ref([])
const currentSensor = ref(null)

// 日期范围
const startDate = ref(getPastDate(7))
const endDate = ref(new Date())

// 分组方式
const groupBy = ref('daily')
const groupByOptions = ['小时', '天', '周', '月']
const groupByValues = ['hourly', 'daily', 'weekly', 'monthly']

// 自动刷新控制
const autoRefresh = ref(true)
const updateInterval = ref(10000) // 10秒更新一次
const lastUpdateTime = ref(null)
const dataUpdateTimer = ref(null)

// 图表数据
const chartData = reactive({
  times: [],
  temperature: [],
  humidity: [],
  combustibleGas: []
})

// 图表组件引用
const tempHumidityChartRef = ref(null)
const combustibleGasChartRef = ref(null)
const radarChartRef = ref(null)
const heatmapChartRef = ref(null)

// 计算平均值和趋势
const avgTemperature = computed(() => {
  if (chartData.temperature.length === 0) return 0
  const avg = chartData.temperature.reduce((a, b) => a + b, 0) / chartData.temperature.length
  return Number(avg.toFixed(1))
})

const avgHumidity = computed(() => {
  if (chartData.humidity.length === 0) return 0
  const avg = chartData.humidity.reduce((a, b) => a + b, 0) / chartData.humidity.length
  return Number(avg.toFixed(1))
})

const avgCombustibleGas = computed(() => {
  if (chartData.combustibleGas.length === 0) return 0
  const avg = chartData.combustibleGas.reduce((a, b) => a + b, 0) / chartData.combustibleGas.length
  return Number(avg.toFixed(1))
})

// 计算趋势（与前一时间段相比）
const tempTrend = computed(() => {
  if (chartData.temperature.length < 2) return 0
  const current = chartData.temperature[chartData.temperature.length - 1]
  const previous = chartData.temperature[0]
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
})

const humidityTrend = computed(() => {
  if (chartData.humidity.length < 2) return 0
  const current = chartData.humidity[chartData.humidity.length - 1]
  const previous = chartData.humidity[0]
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
})

const combustibleGasTrend = computed(() => {
  if (chartData.combustibleGas.length < 2) return 0
  const current = chartData.combustibleGas[chartData.combustibleGas.length - 1]
  const previous = chartData.combustibleGas[0]
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
})

// 可燃气体评分（0-100，数值越高越危险）
const combustibleGasScore = computed(() => {
  const gas = avgCombustibleGas.value
  return Math.max(0, Math.min(100, 100 - gas / 2))
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

// 可燃气体图表配置
const combustibleGasChartOption = computed(() => {
  return getLineChartOption(
    '可燃气体含量',
    chartData.times,
    [
      { name: '可燃气体', data: chartData.combustibleGas }
    ]
  )
})

// 雷达图配置
const radarChartOption = computed(() => {
  // 基于当前图表数据计算雷达图数据
  const tempScore = chartData.temperature.length > 0 
    ? Math.max(0, 100 - Math.abs(avgTemperature.value - 22) * 5)
    : 0
  const humidityScore = chartData.humidity.length > 0
    ? Math.max(0, 100 - Math.abs(avgHumidity.value - 50) * 2)
    : 0
  
  // 可燃气体安全度计算 - 假设正常范围是0-100，值越大越危险
  // 安全度得分：0-20的气体浓度对应100-80的安全度，20-100的浓度对应80-0的安全度
  const gasValue = avgCombustibleGas.value;
  let gasScore = 50; // 默认值设为中等水平
  
  if (chartData.combustibleGas.length > 0) {
    const minSafe = 300;  // 安全下限(ppm)
    const maxSafe = 1000; // 安全上限(ppm)
    const dangerThreshold = 2000; // 危险阈值(ppm)
    
    // 安全度计算
    if (gasValue <= minSafe) {
      // 低于安全下限：线性计算（300ppm时100分，0ppm时80分）
      gasScore = 100 - ((minSafe - gasValue) / minSafe) * 20;
    } else if (gasValue <= maxSafe) {
      // 安全范围内：恒定满分
      gasScore = 100;
    } else if (gasValue <= dangerThreshold) {
      // 超过安全上限但未达危险阈值：线性衰减（1000ppm时100分，2000ppm时60分）
      gasScore = 100 - ((gasValue - maxSafe) / (dangerThreshold - maxSafe)) * 40;
    } else {
      // 超过危险阈值：指数衰减
      const excessRatio = (gasValue - dangerThreshold) / dangerThreshold;
      gasScore = 60 * Math.pow(0.5, excessRatio); // 每超出一倍危险值分数减半
    }
    
    // 确保分数在0-100范围内
    gasScore = Math.max(0, Math.min(100, Math.round(gasScore)));
    
    console.log(`可燃气体值: ${gasValue}ppm, 安全度: ${gasScore}`);
  }
  
  console.log('更新雷达图 - 可燃气体原始值:', gasValue, '安全度分数:', gasScore);
  
  return getRadarChartOption(
    '环境综合评分',
    [
      { name: '温度舒适度', max: 100 },
      { name: '湿度舒适度', max: 100 },
      { name: '可燃气体安全度', max: 100 }
    ],
    [
      {
        name: '当前环境',
        value: [tempScore, humidityScore, gasScore]
      }
    ]
  )
})

// 热力图配置
const heatmapOption = computed(() => {
  // 基于当前图表数据生成热力图数据
  if (chartData.temperature.length === 0) {
    return getHeatmapOption('温度热力分布', [], [], [])
  }

  // 使用实际获取的热力图数据
  return getHeatmapOption('温度热力分布', heatmapData.value, heatmapHours.value, heatmapDays.value)
})

// 热力图数据
const heatmapData = ref([])
const heatmapHours = ref(Array.from({length: 24}, (_, i) => `${i}:00`))
const heatmapDays = ref(['今天', '昨天', '前天'])

// 获取热力图历史数据
const loadHeatmapData = async () => {
  try {
    console.log('加载热力图历史数据')
    const response = await api.envData.getHeatmapData()
    
    if (response && response.data && response.data.code === 1 && Array.isArray(response.data.data)) {
      const historicalData = response.data.data
      console.log('获取到的历史数据:', historicalData.length, '条')
      
      // 创建三天内每个小时的数据容器
      const hourlyData = {}
      const hourlyCount = {}
      const now = new Date()
      
      // 计算三天前的起始时间
      const threeDaysAgo = new Date(now)
      threeDaysAgo.setDate(now.getDate() - 2)
      threeDaysAgo.setHours(0, 0, 0, 0)
      
      // 处理历史数据
      historicalData.forEach(record => {
        const recordTime = new Date(record.recordTime)
        
        // 只处理三天内的数据
        if (recordTime >= threeDaysAgo) {
          // 计算这条记录是今天(0)、昨天(1)还是前天(2)
          const recordDate = new Date(recordTime)
          recordDate.setHours(0, 0, 0, 0)
          
          const nowDate = new Date(now)
          nowDate.setHours(0, 0, 0, 0)
          
          const dayDiff = Math.floor((nowDate - recordDate) / (1000 * 60 * 60 * 24))
          
          // 只处理0-2天内的数据
          if (dayDiff >= 0 && dayDiff <= 2) {
            const hour = recordTime.getHours()
            const key = `${dayDiff}_${hour}`
            
            if (!hourlyData[key]) {
              hourlyData[key] = 0
              hourlyCount[key] = 0
            }
            
            // 累加温度数据
            hourlyData[key] += record.temperature
            hourlyCount[key]++
          }
        }
      })
      
      // 生成热图数据
      const newHeatmapData = []
      
      // 计算每小时平均温度并生成数据
      for (let day = 0; day < 3; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const key = `${day}_${hour}`
          
          if (hourlyData[key] && hourlyCount[key] > 0) {
            // 有数据时计算平均温度
            const avgTemp = hourlyData[key] / hourlyCount[key]
            newHeatmapData.push([hour, day, Number(avgTemp.toFixed(1))])
          } else {
            // 无数据时设置为null (ECharts会显示为空白)
            newHeatmapData.push([hour, day, null])
          }
        }
      }
      
      heatmapData.value = newHeatmapData
      console.log('热力图数据生成完成，共', newHeatmapData.length, '个数据点')
    } else {
      console.warn('热力图历史数据格式不正确:', response)
      generateDefaultHeatmapData() // 使用默认数据
    }
  } catch (error) {
    console.error('获取热力图历史数据失败', error)
    generateDefaultHeatmapData() // 使用默认数据
  }
}

// 生成默认热力图数据
const generateDefaultHeatmapData = () => {
  console.log('生成默认热力图数据')
  const newHeatmapData = []
  
  // 基于当前温度数据生成热力图
  const baseTemp = avgTemperature.value || 25
  for (let day = 0; day < 3; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // 确保温度在-10°C到50°C之间
      let temp = baseTemp + (Math.random() - 0.5) * 15
      temp = Math.max(-10, Math.min(50, temp))
      newHeatmapData.push([hour, day, temp])
    }
  }
  
  heatmapData.value = newHeatmapData
}

// 更新热力图数据 (只更新当天数据)
const updateHeatmapData = async () => {
  try {
    console.log('更新当天热力图数据')
    const response = await api.envData.getHeatmapData()
    
    if (response && response.data && response.data.code === 1 && Array.isArray(response.data.data)) {
      const historicalData = response.data.data
      
      // 找出当天的数据
      const now = new Date()
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      
      // 过滤出当天数据
      const todayData = historicalData.filter(record => {
        const recordTime = new Date(record.recordTime)
        const recordDate = new Date(recordTime)
        recordDate.setHours(0, 0, 0, 0)
        
        return recordDate.getTime() === today.getTime()
      })
      
      // 按小时分组
      const hourlyData = {}
      const hourlyCount = {}
      
      todayData.forEach(record => {
        const recordTime = new Date(record.recordTime)
        const hour = recordTime.getHours()
        
        if (!hourlyData[hour]) {
          hourlyData[hour] = 0
          hourlyCount[hour] = 0
        }
        
        hourlyData[hour] += record.temperature
        hourlyCount[hour]++
      })
      
      // 更新当天的热力图数据
      const currentHeatmapData = [...heatmapData.value]
      
      for (let hour = 0; hour < 24; hour++) {
        // 查找当天该小时的数据索引
        const index = currentHeatmapData.findIndex(item => 
          item[0] === hour && item[1] === 0
        )
        
        if (index !== -1) {
          if (hourlyData[hour] && hourlyCount[hour] > 0) {
            // 有数据时更新
            currentHeatmapData[index][2] = Number((hourlyData[hour] / hourlyCount[hour]).toFixed(1))
          } else {
            // 无数据时保持不变
          }
        }
      }
      
      heatmapData.value = currentHeatmapData
      console.log('当天热力图数据更新完成')
    }
  } catch (error) {
    console.error('更新当天热力图数据失败', error)
  }
}

// 加载传感器列表
const loadSensors = async () => {
  try {
    const response = await api.sensor.getAllSensors()
    sensors.value = response.data
    
    if (sensors.value.length > 0) {
      selectedSensorId.value = [sensors.value[0].sensorId]
      currentSensor.value = sensors.value[0]
      loadChartData()
    }
  } catch (error) {
    console.error('Failed to load sensors', error)
    ElMessage.error('加载传感器列表失败')
    
    // 失败时使用模拟传感器数据
    sensors.value = generateSensors(5)
    if (sensors.value.length > 0) {
      selectedSensorId.value = [sensors.value[0].sensorId]
      currentSensor.value = sensors.value[0]
      loadChartData()
    }
  }
}

// 处理自动刷新变更
const handleAutoRefreshChange = (val) => {
  if (val) {
    startDataUpdateTimer()
    ElMessage.success('已开启实时数据更新')
  } else {
    stopDataUpdateTimer()
    ElMessage.info('已停止实时数据更新')
  }
}

// 开始数据更新定时器
const startDataUpdateTimer = () => {
  stopDataUpdateTimer() // 先清除现有定时器
  
  if (autoRefresh.value) {
    console.log('启动数据更新定时器，间隔:', updateInterval.value, 'ms')
    dataUpdateTimer.value = setInterval(async () => {
      await updateChartData()
    }, updateInterval.value)
  }
}

// 停止数据更新定时器
const stopDataUpdateTimer = () => {
  if (dataUpdateTimer.value) {
    clearInterval(dataUpdateTimer.value)
    dataUpdateTimer.value = null
    console.log('已停止数据更新定时器')
  }
}

// 更新图表数据
const updateChartData = async () => {
  try {
    console.log('定时更新 - 开始获取最新数据')
    const response = await api.envData.getLatestData()
    
    if (response && response.data && response.data.code === 1) {
      const data = response.data.data
      console.log('定时更新 - 获取到的数据:', data)
      
      // 使用API返回的时间或当前时间
      const timeLabel = data.recordTime 
        ? formatDate(new Date(data.recordTime), 'HH:mm:ss')
        : formatDate(new Date(), 'HH:mm:ss')
      
      // 更新图表数据，保持最近10个数据点
      if (chartData.times.length > 0) {
        // 添加新数据点
          chartData.times.push(timeLabel)
          chartData.temperature.push(data.temperature)
          chartData.humidity.push(data.humidity)
          chartData.combustibleGas.push(data.combustibleGas)
          
          // 保持数据点数量稳定（移除最旧点）
        if (chartData.times.length > 10) {
            chartData.times.shift()
            chartData.temperature.shift()
            chartData.humidity.shift()
            chartData.combustibleGas.shift()
          }
      } else {
        // 如果是第一个数据点，初始化数组
        chartData.times = [timeLabel]
        chartData.temperature = [data.temperature]
        chartData.humidity = [data.humidity]
        chartData.combustibleGas = [data.combustibleGas]
      }
      
      // 更新最后更新时间
      lastUpdateTime.value = new Date()
      
      // 直接更新图表数据
      nextTick(() => {
        // 更新温湿度图表
        if (tempHumidityChartRef.value) {
          const newOption = getLineChartOption(
            '温湿度趋势',
            chartData.times,
            [
              { name: '温度', data: chartData.temperature },
              { name: '湿度', data: chartData.humidity }
            ]
          )
          tempHumidityChartRef.value.updateChartData(newOption)
        }
        
        // 更新可燃气体图表
        if (combustibleGasChartRef.value) {
          const newOption = getLineChartOption(
            '可燃气体含量',
            chartData.times,
            [
              { name: '可燃气体', data: chartData.combustibleGas }
            ]
          )
          combustibleGasChartRef.value.updateChartData(newOption)
        }
        
        // 更新雷达图
        if (radarChartRef.value) {
          // 基于当前图表数据计算雷达图数据
          const tempScore = chartData.temperature.length > 0 
            ? Math.max(0, 100 - Math.abs(avgTemperature.value - 22) * 5)
            : 0
          const humidityScore = chartData.humidity.length > 0
            ? Math.max(0, 100 - Math.abs(avgHumidity.value - 50) * 2)
            : 0
          
          // 可燃气体安全度计算 - 与上面的计算方式相同
          const gasValue = avgCombustibleGas.value;
          let gasScore = 50; // 默认值设为中等水平
          
          if (chartData.combustibleGas.length > 0) {
            const minSafe = 300;  // 安全下限(ppm)
            const maxSafe = 1000; // 安全上限(ppm)
            const dangerThreshold = 2000; // 危险阈值(ppm)
            
            // 安全度计算
            if (gasValue <= minSafe) {
              // 低于安全下限：线性计算（300ppm时100分，0ppm时80分）
              gasScore = 100 - ((minSafe - gasValue) / minSafe) * 20;
            } else if (gasValue <= maxSafe) {
              // 安全范围内：恒定满分
              gasScore = 100;
            } else if (gasValue <= dangerThreshold) {
              // 超过安全上限但未达危险阈值：线性衰减（1000ppm时100分，2000ppm时60分）
              gasScore = 100 - ((gasValue - maxSafe) / (dangerThreshold - maxSafe)) * 40;
            } else {
              // 超过危险阈值：指数衰减
              const excessRatio = (gasValue - dangerThreshold) / dangerThreshold;
              gasScore = 60 * Math.pow(0.5, excessRatio); // 每超出一倍危险值分数减半
            }
            
            // 确保分数在0-100范围内
            gasScore = Math.max(0, Math.min(100, Math.round(gasScore)));
            
            console.log(`可燃气体值: ${gasValue}ppm, 安全度: ${gasScore}`);
          }
          
          console.log('更新雷达图 - 可燃气体原始值:', gasValue, '安全度分数:', gasScore);
          
          const newOption = getRadarChartOption(
            '环境综合评分',
            [
              { name: '温度舒适度', max: 100 },
              { name: '湿度舒适度', max: 100 },
              { name: '可燃气体安全度', max: 100 }
            ],
            [
              {
                name: '当前环境',
                value: [tempScore, humidityScore, gasScore]
              }
            ]
          )
          radarChartRef.value.updateChartData(newOption)
        }
        
        // 更新热力图 (实时数据不会更新热力图，热力图由专门的定时器负责每小时更新)
        if (heatmapChartRef.value) {
          const newOption = getHeatmapOption('温度热力分布', heatmapData.value, heatmapHours.value, heatmapDays.value)
          heatmapChartRef.value.updateChartData(newOption)
        }
      })
      
      console.log('定时更新 - 数据已更新，当前数据点数量:', chartData.times.length)
      console.log('定时更新 - 时间标签:', timeLabel)
      console.log('定时更新 - 所有时间标签:', chartData.times)
      } else {
      console.warn('定时更新 - API响应格式不正确:', response)
    }
  } catch (error) {
    console.error('定时更新 - 更新失败:', error)
  }
}

// 加载图表数据
const loadChartData = async () => {
  // 使用新API获取最新数据
  await loadInitialData()
}

// 加载初始数据
const loadInitialData = async () => {
  try {
    const loadingElement = document.querySelector('.page-container')
    const loadingInstance = ElLoading.service({
      target: loadingElement,
      text: '加载数据中...'
    })
    
    // 调用新API获取最新数据
    const response = await api.envData.getLatestData()
    console.log('初始数据API响应:', response)
    
    // 使用当前时间作为时间标签
    const now = new Date()
    const timeLabel = formatDate(now, 'HH:mm:ss')
    
    // 检查响应格式并提取数据
    let newData = null
    
    if (response && response.data) {
      if (response.data.code === 1 && response.data.data) {
        // 标准响应格式：response.data.data包含实际数据
        newData = response.data.data
      } else if (response.data.temperature !== undefined) {
        // 直接在response.data中包含数据
        newData = response.data
      }
    }
    
    if (newData) {
      console.log('获取到的初始数据:', newData)
      
      // 初始化图表数据
      chartData.times = [timeLabel]
      chartData.temperature = [newData.temperature]
      chartData.humidity = [newData.humidity]
      chartData.combustibleGas = [newData.combustibleGas]
      
      // 更新最后更新时间
      lastUpdateTime.value = new Date()
        
      // 直接更新图表数据
      nextTick(() => {
        // 更新温湿度图表
        if (tempHumidityChartRef.value) {
          const newOption = getLineChartOption(
            '温湿度趋势',
            chartData.times,
            [
              { name: '温度', data: chartData.temperature },
              { name: '湿度', data: chartData.humidity }
            ]
          )
          tempHumidityChartRef.value.updateChartData(newOption)
        }
        
        // 更新可燃气体图表
        if (combustibleGasChartRef.value) {
          const newOption = getLineChartOption(
            '可燃气体含量',
            chartData.times,
            [
              { name: '可燃气体', data: chartData.combustibleGas }
            ]
          )
          combustibleGasChartRef.value.updateChartData(newOption)
        }
        
        // 更新雷达图
        if (radarChartRef.value) {
          // 基于当前图表数据计算雷达图数据
          const tempScore = chartData.temperature.length > 0 
            ? Math.max(0, 100 - Math.abs(avgTemperature.value - 22) * 5)
            : 0
          const humidityScore = chartData.humidity.length > 0
            ? Math.max(0, 100 - Math.abs(avgHumidity.value - 50) * 2)
            : 0
          
          // 可燃气体安全度计算 - 与上面的计算方式相同
          const gasValue = avgCombustibleGas.value;
          let gasScore = 50; // 默认值设为中等水平
          
          if (chartData.combustibleGas.length > 0) {
            const minSafe = 300;  // 安全下限(ppm)
            const maxSafe = 1000; // 安全上限(ppm)
            const dangerThreshold = 2000; // 危险阈值(ppm)
            
            // 安全度计算
            if (gasValue <= minSafe) {
              // 低于安全下限：线性计算（300ppm时100分，0ppm时80分）
              gasScore = 100 - ((minSafe - gasValue) / minSafe) * 20;
            } else if (gasValue <= maxSafe) {
              // 安全范围内：恒定满分
              gasScore = 100;
            } else if (gasValue <= dangerThreshold) {
              // 超过安全上限但未达危险阈值：线性衰减（1000ppm时100分，2000ppm时60分）
              gasScore = 100 - ((gasValue - maxSafe) / (dangerThreshold - maxSafe)) * 40;
            } else {
              // 超过危险阈值：指数衰减
              const excessRatio = (gasValue - dangerThreshold) / dangerThreshold;
              gasScore = 60 * Math.pow(0.5, excessRatio); // 每超出一倍危险值分数减半
            }
            
            // 确保分数在0-100范围内
            gasScore = Math.max(0, Math.min(100, Math.round(gasScore)));
            
            console.log(`可燃气体值: ${gasValue}ppm, 安全度: ${gasScore}`);
          }
          
          console.log('更新雷达图 - 可燃气体原始值:', gasValue, '安全度分数:', gasScore);
          
          const newOption = getRadarChartOption(
            '环境综合评分',
            [
              { name: '温度舒适度', max: 100 },
              { name: '湿度舒适度', max: 100 },
              { name: '可燃气体安全度', max: 100 }
            ],
            [
              {
                name: '当前环境',
                value: [tempScore, humidityScore, gasScore]
              }
            ]
          )
          radarChartRef.value.updateChartData(newOption)
        }
        
        // 更新热力图 (实时数据不会更新热力图，热力图由专门的定时器负责每小时更新)
        if (heatmapChartRef.value) {
          const newOption = getHeatmapOption('温度热力分布', heatmapData.value, heatmapHours.value, heatmapDays.value)
          heatmapChartRef.value.updateChartData(newOption)
        }
      })
      
      ElMessage.success('数据已加载')
    } else {
      throw new Error('无法从API响应中提取数据')
    }
    
    loadingInstance.close()
    
    // 如果自动刷新开启，启动定时更新
    if (autoRefresh.value) {
      startDataUpdateTimer()
    }
  } catch (error) {
    console.error('加载初始数据失败', error)
    ElMessage.error('加载数据失败：' + (error.message || '请检查API连接'))
    
    const loadingElement = document.querySelector('.el-loading-mask')
    if (loadingElement) {
      loadingElement.style.display = 'none'
    }
  }
}

// 传感器变更
const onSensorChange = (sensor) => {
  if (sensor && sensor.length > 0) {
    currentSensor.value = sensors.value.find(s => s.sensorId === sensor[0])
    loadChartData()
  }
}

// 日期范围变更
const onDateRangeChange = () => {
  loadChartData()
}

// 加载测试数据
const loadTestData = async () => {
  try {
    // 调用新API获取最新数据
    const response = await api.envData.getLatestData()
    console.log('测试数据API响应:', response)
    
    // 使用当前时间作为时间标签
    const now = new Date()
    const timeLabel = formatDate(now, 'HH:mm:ss')
    
    // 检查响应格式并提取数据
    let newData = null
    
    if (response && response.data) {
      if (response.data.code === 1 && response.data.data) {
        // 标准响应格式：response.data.data包含实际数据
        newData = response.data.data
      } else if (response.data.temperature !== undefined) {
        // 直接在response.data中包含数据
        newData = response.data
      }
    }
    
    if (newData) {
      console.log('获取到的测试数据:', newData)
      
      // 初始化图表数据
      chartData.times = [timeLabel]
      chartData.temperature = [newData.temperature]
      chartData.humidity = [newData.humidity]
      chartData.combustibleGas = [newData.combustibleGas]
      
      // 更新最后更新时间
      lastUpdateTime.value = new Date()
      
      // 直接更新图表数据
      nextTick(() => {
        // 更新温湿度图表
        if (tempHumidityChartRef.value) {
          const newOption = getLineChartOption(
            '温湿度趋势',
            chartData.times,
            [
              { name: '温度', data: chartData.temperature },
              { name: '湿度', data: chartData.humidity }
            ]
          )
          tempHumidityChartRef.value.updateChartData(newOption)
        }
        
        // 更新可燃气体图表
        if (combustibleGasChartRef.value) {
          const newOption = getLineChartOption(
            '可燃气体含量',
            chartData.times,
            [
              { name: '可燃气体', data: chartData.combustibleGas }
            ]
          )
          combustibleGasChartRef.value.updateChartData(newOption)
        }
        
        // 更新雷达图
        if (radarChartRef.value) {
          // 基于当前图表数据计算雷达图数据
          const tempScore = chartData.temperature.length > 0 
            ? Math.max(0, 100 - Math.abs(avgTemperature.value - 22) * 5)
            : 0
          const humidityScore = chartData.humidity.length > 0
            ? Math.max(0, 100 - Math.abs(avgHumidity.value - 50) * 2)
            : 0
          
          // 可燃气体安全度计算 - 与上面的计算方式相同
          const gasValue = avgCombustibleGas.value;
          let gasScore = 50; // 默认值设为中等水平
          
          if (chartData.combustibleGas.length > 0) {
            const minSafe = 300;  // 安全下限(ppm)
            const maxSafe = 1000; // 安全上限(ppm)
            const dangerThreshold = 2000; // 危险阈值(ppm)
            
            // 安全度计算
            if (gasValue <= minSafe) {
              // 低于安全下限：线性计算（300ppm时100分，0ppm时80分）
              gasScore = 100 - ((minSafe - gasValue) / minSafe) * 20;
            } else if (gasValue <= maxSafe) {
              // 安全范围内：恒定满分
              gasScore = 100;
            } else if (gasValue <= dangerThreshold) {
              // 超过安全上限但未达危险阈值：线性衰减（1000ppm时100分，2000ppm时60分）
              gasScore = 100 - ((gasValue - maxSafe) / (dangerThreshold - maxSafe)) * 40;
            } else {
              // 超过危险阈值：指数衰减
              const excessRatio = (gasValue - dangerThreshold) / dangerThreshold;
              gasScore = 60 * Math.pow(0.5, excessRatio); // 每超出一倍危险值分数减半
            }
            
            // 确保分数在0-100范围内
            gasScore = Math.max(0, Math.min(100, Math.round(gasScore)));
            
            console.log(`可燃气体值: ${gasValue}ppm, 安全度: ${gasScore}`);
          }
          
          console.log('更新雷达图 - 可燃气体原始值:', gasValue, '安全度分数:', gasScore);
          
          const newOption = getRadarChartOption(
            '环境综合评分',
            [
              { name: '温度舒适度', max: 100 },
              { name: '湿度舒适度', max: 100 },
              { name: '可燃气体安全度', max: 100 }
            ],
            [
              {
                name: '当前环境',
                value: [tempScore, humidityScore, gasScore]
              }
            ]
          )
          radarChartRef.value.updateChartData(newOption)
        }
        
        // 更新热力图 (实时数据不会更新热力图，热力图由专门的定时器负责每小时更新)
        if (heatmapChartRef.value) {
          const newOption = getHeatmapOption('温度热力分布', heatmapData.value, heatmapHours.value, heatmapDays.value)
          heatmapChartRef.value.updateChartData(newOption)
        }
      })
      
      ElMessage.success('测试数据已加载')
    } else {
      ElMessage.error('获取数据失败：无法从API响应中提取数据')
    }
    
    // 如果自动刷新开启，启动定时更新
    if (autoRefresh.value) {
      startDataUpdateTimer()
    }
  } catch (error) {
    console.error('加载测试数据失败', error)
    ElMessage.error('加载测试数据失败：' + (error.message || '请检查API连接'))
  }
}

// 页面加载和卸载
onMounted(() => {
  loadSensors()
  loadInitialData() // 加载初始数据
  loadHeatmapData() // 加载热力图数据
  
  // 设置热力图每小时更新
  const heatmapUpdateTimer = setInterval(() => {
    if (autoRefresh.value) {
      updateHeatmapData()
    }
  }, /*10000*/3600000) // 10000 ms = 10秒，测试用
  
  // 页面卸载时清理定时器
  onUnmounted(() => {
    stopDataUpdateTimer()
    clearInterval(heatmapUpdateTimer)
    console.log('页面已卸载，定时器已清理')
  })
})
</script>

<style lang="scss" scoped>
.filter-card {
  margin-bottom: 16px;
}

.filter-row {
  .filter-col {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .filter-label {
      white-space: nowrap;
      margin-right: 10px;
      font-weight: 500;
      min-width: 90px;
    }
    
    .filter-component {
      flex: 1;
    }
    
    @media screen and (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      
      .filter-label {
        margin-bottom: 8px;
        margin-right: 0;
      }
      
      .filter-component {
        width: 100%;
      }
    }
  }
}

.chart-card {
  height: 100%;
}

.chart-container {
  position: relative;
  min-height: 350px;
  }
  
  .update-time {
  text-align: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 8px;
  padding: 4px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.sensor-info-footer {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media screen and (max-width: 768px) {
  .el-col {
    margin-bottom: 16px;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style> 