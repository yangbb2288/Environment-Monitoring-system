<template>
  <app-layout page-title="数据分析">
    <view v-if="hasPermission" class="container">
    <view class="filter-section card">
      <sensor-selector-dialog
        :sensors="sensors" 
        v-model="selectedSensorId" 
        :multiple="false" 
        @change="onSensorChange"
      />
      <date-range-picker-dialog
        v-model:startDate="startDate" 
        v-model:endDate="endDate" 
        @change="onDateRangeChange"
      />
      <view class="ai-actions">
        <button class="ai-analysis-btn" @click="performAIAnalysis" :disabled="!analysisReady || aiAnalyzing">
          <i class="el-icon-cpu" v-if="!aiAnalyzing"></i>
          <i class="el-icon-loading" v-else></i>
          <text class="btn-text">{{ aiAnalyzing ? 'AI分析中...' : 'AI智能分析' }}</text>
        </button>
        <button class="ai-chat-btn" @click="showAIChat = true">
          <i class="el-icon-chat-dot-round"></i>
          <text class="btn-text">AI问答</text>
        </button>
      </view>
    </view>
    
    <!-- AI分析结果 -->
    <view class="ai-analysis-result card" v-if="aiAnalysisResult">
      <view class="section-header">
        <text class="section-title"><i class="el-icon-cpu"></i> AI智能分析结果</text>
        <button class="close-btn" @click="aiAnalysisResult = null">×</button>
      </view>
      <view class="ai-content">
        <text class="ai-text">{{ aiAnalysisResult }}</text>
      </view>
    </view>
    
    <view class="analysis-summary card" v-if="analysisReady">
      <view class="summary-title">数据分析摘要</view>
      <view class="summary-content">
        <view class="summary-item">
          <text class="label">数据点数量:</text>
          <text class="value">{{ dataPoints }}</text>
        </view>
        <view class="summary-item">
          <text class="label">平均温度:</text>
          <text class="value">{{ avgTemperature.toFixed(1) }}°C</text>
        </view>
        <view class="summary-item">
          <text class="label">平均湿度:</text>
          <text class="value">{{ avgHumidity.toFixed(1) }}%</text>
        </view>
        <view class="summary-item">
          <text class="label">平均燃气含量:</text>
          <text class="value">{{ avgCombustibleGas.toFixed(1) }} ppm</text>
        </view>
        <view class="summary-item">
          <text class="label">舒适度指标:</text>
          <text class="value" :class="comfortScoreClass">{{ comfortScore.toFixed(1) }}</text>
        </view>
      </view>
    </view>
    
    <view class="chart-section card">
      <view class="section-header">
        <text class="section-title">温度分布分析</text>
      </view>
      <view class="chart-container">
        <echarts :option="temperatureDistributionOption" chart-id="temp-distribution-chart" height="350px" />
      </view>
    </view>
    
    <view class="chart-section card">
      <view class="section-header">
        <text class="section-title">日内变化规律</text>
      </view>
      <view class="chart-container">
        <echarts :option="dailyPatternOption" chart-id="daily-pattern-chart" height="350px" />
      </view>
    </view>
    
    <view class="chart-section card">
      <view class="section-header">
        <text class="section-title">异常值检测</text>
      </view>
      <view class="chart-container">
        <echarts :option="anomalyOption" chart-id="anomaly-chart" height="350px" />
      </view>
    </view>
    
    <view class="insight-section card" v-if="analysisReady">
      <view class="section-header">
        <text class="section-title">数据洞察</text>
        <button class="refresh-btn" @click="loadInsightsData" :disabled="insightsLoading">
          <i class="el-icon-refresh" :class="{ 'is-loading': insightsLoading }"></i>
          刷新洞察
        </button>
      </view>
      <view v-if="insightsLoading" class="insights-loading">
        <i class="el-icon-loading"></i>
        <text class="loading-text">正在计算数据洞察...</text>
      </view>
      <view v-else-if="insightsError" class="insights-error">
        <i class="el-icon-warning"></i>
        <text class="error-text">{{ insightsError }}</text>
        <button class="retry-btn" @click="loadInsightsData">重试</button>
      </view>
      <view v-else class="insight-list">
        <!-- 温度洞察 -->
        <view class="insight-item" v-if="insightsData.temperatureInsights">
          <text class="insight-icon">{{ getTemperatureIcon(insightsData.temperatureInsights.status) }}</text>
          <view class="insight-content">
            <text class="insight-title">温度{{ getStatusText(insightsData.temperatureInsights.status) }}</text>
            <text class="insight-desc">
              平均温度 {{ insightsData.temperatureInsights.avg.toFixed(1) }}°C，
              范围 {{ insightsData.temperatureInsights.min.toFixed(1) }}°C 至 
              {{ insightsData.temperatureInsights.max.toFixed(1) }}°C，
              {{ getTrendText(insightsData.temperatureInsights.trend) }}。
            </text>
            <view class="insight-recommendations" v-if="insightsData.temperatureInsights.recommendations?.length">
              <text class="recommendations-title">建议措施：</text>
              <view class="recommendation-list">
                <text class="recommendation-item" v-for="(rec, idx) in insightsData.temperatureInsights.recommendations" :key="idx">
                  {{ idx + 1 }}. {{ rec }}
                </text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 湿度洞察 -->
        <view class="insight-item" v-if="insightsData.humidityInsights">
          <text class="insight-icon">{{ getHumidityIcon(insightsData.humidityInsights.status) }}</text>
          <view class="insight-content">
            <text class="insight-title">湿度{{ getStatusText(insightsData.humidityInsights.status) }}</text>
            <text class="insight-desc">
              平均湿度 {{ insightsData.humidityInsights.avg.toFixed(1) }}%，
              范围 {{ insightsData.humidityInsights.min.toFixed(1) }}% 至 
              {{ insightsData.humidityInsights.max.toFixed(1) }}%，
              {{ getTrendText(insightsData.humidityInsights.trend) }}。
            </text>
            <view class="insight-recommendations" v-if="insightsData.humidityInsights.recommendations?.length">
              <text class="recommendations-title">建议措施：</text>
              <view class="recommendation-list">
                <text class="recommendation-item" v-for="(rec, idx) in insightsData.humidityInsights.recommendations" :key="idx">
                  {{ idx + 1 }}. {{ rec }}
                </text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 可燃气体洞察 -->
        <view class="insight-item" v-if="insightsData.gasInsights">
          <text class="insight-icon">{{ getGasIcon(insightsData.gasInsights.status) }}</text>
          <view class="insight-content">
            <text class="insight-title">可燃气体{{ getStatusText(insightsData.gasInsights.status) }}</text>
            <text class="insight-desc">
              平均浓度 {{ insightsData.gasInsights.avg.toFixed(1) }} ppm，
              范围 {{ insightsData.gasInsights.min.toFixed(1) }} ppm 至 
              {{ insightsData.gasInsights.max.toFixed(1) }} ppm，
              安全评分 {{ insightsData.gasInsights.safetyScore }}，
              {{ getTrendText(insightsData.gasInsights.trend) }}。
            </text>
            <view class="insight-recommendations" v-if="insightsData.gasInsights.recommendations?.length">
              <text class="recommendations-title">建议措施：</text>
              <view class="recommendation-list">
                <text class="recommendation-item" v-for="(rec, idx) in insightsData.gasInsights.recommendations" :key="idx">
                  {{ idx + 1 }}. {{ rec }}
                </text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 异常值洞察 -->
        <view class="insight-item" v-if="insightsData.anomalyInsights && insightsData.anomalyInsights.count > 0">
          <text class="insight-icon">⚠️</text>
          <view class="insight-content">
            <text class="insight-title">检测到异常值</text>
            <text class="insight-desc">
              共检测到 {{ insightsData.anomalyInsights.count }} 个异常数据点
              (温度: {{ insightsData.anomalyInsights.types.temperature || 0 }}, 
              湿度: {{ insightsData.anomalyInsights.types.humidity || 0 }}, 
              可燃气体: {{ insightsData.anomalyInsights.types.gas || 0 }})，
              异常程度: {{ getSeverityText(insightsData.anomalyInsights.severity) }}。
            </text>
            <view class="insight-recommendations" v-if="insightsData.anomalyInsights.recommendations?.length">
              <text class="recommendations-title">建议措施：</text>
              <view class="recommendation-list">
                <text class="recommendation-item" v-for="(rec, idx) in insightsData.anomalyInsights.recommendations" :key="idx">
                  {{ idx + 1 }}. {{ rec }}
                </text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 日变化规律洞察 -->
        <view class="insight-item" v-if="insightsData.patterns">
          <text class="insight-icon">🕒</text>
          <view class="insight-content">
            <text class="insight-title">温湿度日变化规律</text>
            <text class="insight-desc">
              温度最高出现在 {{ insightsData.patterns.dailyTemperature.peakHour }}:00，
              最低出现在 {{ insightsData.patterns.dailyTemperature.lowestHour }}:00，
              日内波动 {{ insightsData.patterns.dailyTemperature.variance.toFixed(1) }}°C。
              湿度最高出现在 {{ insightsData.patterns.dailyHumidity.peakHour }}:00，
              最低出现在 {{ insightsData.patterns.dailyHumidity.lowestHour }}:00，
              日内波动 {{ insightsData.patterns.dailyHumidity.variance.toFixed(1) }}%。
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
    <view v-else class="no-permission">
      <text class="no-permission-text">您没有权限访问此页面</text>
    </view>
    
    <!-- AI问答对话框 -->
    <view class="ai-chat-modal" v-if="showAIChat" @click="showAIChat = false">
      <view class="ai-chat-dialog" @click.stop>
        <view class="chat-header">
          <text class="chat-title"><i class="el-icon-chat-dot-round"></i> AI智能助手</text>
          <button class="close-btn" @click="showAIChat = false">×</button>
        </view>
        <view class="chat-content">
          <view class="chat-messages" ref="chatMessages">
            <view class="message ai-message" v-if="aiChatHistory.length === 0">
              <text class="message-avatar">AI</text>
              <view class="message-bubble">
                <text class="message-text">您好！我是AI智能助手，可以为您提供环境数据分析、安全建议和决策支持。请告诉我您的问题。</text>
              </view>
            </view>
            <view 
              class="message" 
              :class="msg.type === 'user' ? 'user-message' : 'ai-message'"
              v-for="(msg, index) in aiChatHistory" 
              :key="index"
            >
              <text class="message-avatar" v-if="msg.type === 'ai'">AI</text>
              <text class="message-avatar user-avatar" v-else>我</text>
              <view class="message-bubble">
                <text class="message-text" v-if="!msg.content.includes('\n')">{{ msg.content }}</text>
                <rich-text class="message-text formatted" v-else :nodes="formatAIMessage(msg.content)"></rich-text>
              </view>
            </view>
            <view class="message ai-message" v-if="aiChatLoading">
              <text class="message-avatar">AI</text>
              <view class="message-bubble">
                <text class="message-text">正在思考中...</text>
              </view>
            </view>
          </view>
          <view class="chat-input-container">
            <textarea 
              class="input-field" 
              v-model="chatInput" 
              placeholder="请输入您的问题..."
              @keypress.enter.prevent="sendMessage"
              :disabled="aiChatLoading"
              auto-height
              maxlength="500"
              cursor-spacing="20"
              adjust-position
            />
            <button class="send-btn" @click="sendMessage" :disabled="aiChatLoading || !chatInput.trim()">
              发送
            </button>
          </view>
        </view>
      </view>
    </view>
  </app-layout>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import AppLayout from '../../components/AppLayout.vue'
import SensorSelector from '../../components/SensorSelector.vue'
import DateRangePicker from '../../components/DateRangePicker.vue'
import SensorSelectorDialog from '../../components/SensorSelectorDialog.vue'
import DateRangePickerDialog from '../../components/DateRangePickerDialog.vue'
import ECharts from '../../components/ECharts.vue'
import { getLineChartOption, getBarChartOption } from '../../utils/chart'
import { formatDate, getPastDate } from '../../utils/date'
import api from '../../api/index'
import { 
  generateTemperatureDistribution, 
  generateDailyPattern 
} from '../../utils/mockData'
import { getRolePermissions, checkFeaturePermission } from '../../utils/permission'

export default {
  components: {
    SensorSelector,
    DateRangePicker,
    SensorSelectorDialog,
    DateRangePickerDialog,
    AppLayout,
    ECharts
  },
  setup() {
    // 传感器数据
    const sensors = ref([])
    const selectedSensorId = ref([])
    const currentSensor = ref(null)
    
    // 日期范围
    const startDate = ref(getPastDate(30))
    const endDate = ref(new Date())
    
    // 分析数据
    const analysisData = ref([])
    const analysisReady = ref(false)
    const dataPoints = ref(0)
    const avgTemperature = ref(0)
    const avgHumidity = ref(0)
    const avgCombustibleGas = ref(0)
    const comfortScore = ref(0)
    
    // 数据洞察
    const insightsData = ref({})
    const insightsLoading = ref(false)
    const insightsError = ref(null)
    
    // 图表数据
    const chartData = reactive({
      times: [],
      temperature: [],
      humidity: [],
      combustibleGas: [],
      hourlyTemperature: Array(24).fill(0),
      hourlyHumidity: Array(24).fill(0),
      hourlyGas: Array(24).fill(0),
      temperatureDistribution: {},
      anomalies: [],
      scatterData: [] // 添加散点图数据
    })
    
    // 环境评分样式
    const comfortScoreClass = computed(() => {
      if (comfortScore.value >= 80) return 'excellent'
      if (comfortScore.value >= 60) return 'good'
      if (comfortScore.value >= 40) return 'moderate'
      return 'poor'
    })
    
    // 温度分布图表配置
    const temperatureDistributionOption = computed(() => {
      const categories = Object.keys(chartData.temperatureDistribution).sort((a, b) => parseFloat(a) - parseFloat(b))
      const values = categories.map(key => chartData.temperatureDistribution[key])
      
      return {
        title: {
          text: '温度分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}次'
        },
        xAxis: {
          type: 'category',
          data: categories.map(t => `${t}°C`),
          name: '温度',
          nameLocation: 'middle',
          nameGap: 30
        },
        yAxis: {
          type: 'value',
          name: '频次',
          nameLocation: 'middle',
          nameGap: 40
        },
        series: [{
          data: values,
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: '#5470c6'
          }
        }]
      }
    })
    
    // 日内变化规律图表配置
    const dailyPatternOption = computed(() => {
      // 获取当前时间并向下取整到小时
      const now = new Date();
      const currentHour = now.getHours();
      const today = formatDate(now, 'YYYY-MM-DD');
      
      // 生成过去24小时的小时标签，从当前小时开始倒数
      const hourLabels = [];
      const hourData = {
        temperature: [],
        humidity: [],
        gas: []
      };
      
      // 填充24小时的数据
      for (let i = 0; i < 24; i++) {
        // 计算小时索引，从当前小时往前推
        const hourIndex = (currentHour - i + 24) % 24;
        // 添加小时标签，格式为 HH:00
        hourLabels.unshift(`${hourIndex}:00`);
        
        // 添加对应的数据
        hourData.temperature.unshift(parseFloat(chartData.hourlyTemperature[hourIndex].toFixed(2)));
        hourData.humidity.unshift(parseFloat(chartData.hourlyHumidity[hourIndex].toFixed(2)));
        hourData.gas.unshift(parseFloat(chartData.hourlyGas[hourIndex].toFixed(2)));
      }
      
      return {
        title: {
          text: '24小时变化规律',
          left: 'center',
          subtext: `更新时间: ${formatDate(now, 'YYYY-MM-DD HH:00')}`
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = params[0].axisValueLabel + '\n';
            params.forEach(param => {
              // 保留两位小数
              const value = parseFloat(param.value).toFixed(2);
              const unit = param.seriesName === '可燃气体' ? ' ppm' : (param.seriesName === '温度' ? ' °C' : ' %');
              result += param.marker + ' ' + param.seriesName + ': ' + value + unit + '\n';
            });
            return result;
          }
        },
        legend: {
          data: ['温度', '湿度', '可燃气体'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: hourLabels,
          name: '时间',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            interval: 2,
            rotate: 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '温度/湿度',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#5470c6'
              }
            },
            axisLabel: {
              formatter: '{value}.00'
            }
          },
          {
            type: 'value',
            name: '可燃气体',
            position: 'right',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#91cc75'
              }
            },
            axisLabel: {
              formatter: '{value}.00'
            }
          }
        ],
        series: [
          {
            name: '温度',
            type: 'line',
            data: hourData.temperature,
            smooth: true,
            markPoint: {
              data: [
                { type: 'max', name: '最高值' },
                { type: 'min', name: '最低值' }
              ]
            }
          },
          {
            name: '湿度',
            type: 'line',
            data: hourData.humidity,
            smooth: true,
            markPoint: {
              data: [
                { type: 'max', name: '最高值' },
                { type: 'min', name: '最低值' }
              ]
            }
          },
          {
            name: '可燃气体',
            type: 'line',
            yAxisIndex: 1,
            data: hourData.gas,
            smooth: true,
            markPoint: {
              data: [
                { type: 'max', name: '最高值' },
                { type: 'min', name: '最低值' }
              ]
            }
          }
        ]
      }
    })
    
    // 异常值检测图表
    const anomalyOption = computed(() => {
      if (chartData.times.length === 0) {
        return {
          title: {
            text: '异常值检测',
            left: 'center'
          },
          series: []
        }
      }
      
      // 获取当前时间并向下取整到小时
      const now = new Date();
      const currentHour = now.getHours();
      const today = formatDate(now, 'YYYY-MM-DD');
      
      // 创建时间标签和每小时聚合数据的容器
      const hourLabels = [];
      
      // 每小时数据的容器
      const hourlyData = {
        tempNormal: Array(24).fill([]), // 每小时的正常温度点
        tempAnomaly: Array(24).fill([]), // 每小时的异常温度点
        humidityNormal: Array(24).fill([]), // 每小时的正常湿度点
        humidityAnomaly: Array(24).fill([]), // 每小时的异常湿度点
        gasNormal: Array(24).fill([]), // 每小时的正常可燃气体点
        gasAnomaly: Array(24).fill([]) // 每小时的异常可燃气体点
      };
      
      // 临时存储每小时的数据点
      const hourlyPoints = {
        tempValues: Array(24).fill([]),
        humidityValues: Array(24).fill([]),
        gasValues: Array(24).fill([]),
        tempAnomalyCount: Array(24).fill(0),
        humidityAnomalyCount: Array(24).fill(0),
        gasAnomalyCount: Array(24).fill(0)
      };
      
      // 初始化数组
      for (let i = 0; i < 24; i++) {
        hourlyPoints.tempValues[i] = [];
        hourlyPoints.humidityValues[i] = [];
        hourlyPoints.gasValues[i] = [];
      }
      
      // 按小时聚合数据
      chartData.temperature.forEach((temp, index) => {
        const humidity = chartData.humidity[index];
        const gas = chartData.combustibleGas[index];
        const timeStr = chartData.times[index];
        
        // 解析时间字符串获取小时和日期
        const timeParts = timeStr.split(' ');
        if (timeParts.length !== 2) return; // 跳过格式不正确的时间
        
        const datePart = timeParts[0]; // MM-DD 格式
        const hourMinute = timeParts[1].split(':');
        if (hourMinute.length !== 2) return; // 跳过格式不正确的时间
        
        const hour = parseInt(hourMinute[0]);
        
        // 获取当前日期，格式化为 MM-DD
        const todayStr = formatDate(new Date(), 'MM-DD');
        
        // 只处理当天的数据
        if (datePart !== todayStr) return;
        
        // 检查这个点是否在异常列表中
        const isAnomalyTemp = chartData.anomalies.some(a => 
          a.type === 'temperature' && formatDate(new Date(a.time), 'MM-DD HH:mm') === timeStr
        );
        
        const isAnomalyHumidity = chartData.anomalies.some(a => 
          a.type === 'humidity' && formatDate(new Date(a.time), 'MM-DD HH:mm') === timeStr
        );
        
        const isAnomalyGas = chartData.anomalies.some(a => 
          a.type === 'combustibleGas' && formatDate(new Date(a.time), 'MM-DD HH:mm') === timeStr
        );
        
        // 添加到对应小时的数据集合
        hourlyPoints.tempValues[hour].push(temp);
        hourlyPoints.humidityValues[hour].push(humidity);
        hourlyPoints.gasValues[hour].push(gas);
        
        // 统计异常点数量
        if (isAnomalyTemp) hourlyPoints.tempAnomalyCount[hour]++;
        if (isAnomalyHumidity) hourlyPoints.humidityAnomalyCount[hour]++;
        if (isAnomalyGas) hourlyPoints.gasAnomalyCount[hour]++;
      });
      
      // 计算每小时的平均值和异常比例
      const hourlyAvg = {
        temp: Array(24).fill(0),
        humidity: Array(24).fill(0),
        gas: Array(24).fill(0),
        tempHasAnomaly: Array(24).fill(false),
        humidityHasAnomaly: Array(24).fill(false),
        gasHasAnomaly: Array(24).fill(false)
      };
      
      for (let i = 0; i < 24; i++) {
        // 计算每小时平均值
        if (hourlyPoints.tempValues[i].length > 0) {
          const sum = hourlyPoints.tempValues[i].reduce((acc, val) => acc + val, 0);
          hourlyAvg.temp[i] = parseFloat((sum / hourlyPoints.tempValues[i].length).toFixed(2));
        }
        
        if (hourlyPoints.humidityValues[i].length > 0) {
          const sum = hourlyPoints.humidityValues[i].reduce((acc, val) => acc + val, 0);
          hourlyAvg.humidity[i] = parseFloat((sum / hourlyPoints.humidityValues[i].length).toFixed(2));
        }
        
        if (hourlyPoints.gasValues[i].length > 0) {
          const sum = hourlyPoints.gasValues[i].reduce((acc, val) => acc + val, 0);
          hourlyAvg.gas[i] = parseFloat((sum / hourlyPoints.gasValues[i].length).toFixed(2));
        }
        
        // 确定是否有异常
        hourlyAvg.tempHasAnomaly[i] = hourlyPoints.tempAnomalyCount[i] > 0;
        hourlyAvg.humidityHasAnomaly[i] = hourlyPoints.humidityAnomalyCount[i] > 0;
        hourlyAvg.gasHasAnomaly[i] = hourlyPoints.gasAnomalyCount[i] > 0;
      }
      
      // 生成过去24小时的数据点
      const tempNormalPoints = [];
      const tempAnomalyPoints = [];
      const humidityNormalPoints = [];
      const humidityAnomalyPoints = [];
      const gasNormalPoints = [];
      const gasAnomalyPoints = [];
      
      // 填充24小时的数据点
      for (let i = 0; i < 24; i++) {
        // 计算小时索引，从当前小时往前推
        const hourIndex = (currentHour - i + 24) % 24;
        
        // 添加小时标签，格式为 HH:00
        const hourLabel = `${hourIndex}:00`;
        hourLabels.unshift(hourLabel);
        
        const position = 23 - i; // 图表位置，最新数据在最右侧
        
        // 添加温度数据点
        if (hourlyAvg.temp[hourIndex] !== 0) {
          if (hourlyAvg.tempHasAnomaly[hourIndex]) {
            tempAnomalyPoints.push([position, hourlyAvg.temp[hourIndex], hourLabel]);
          } else {
            tempNormalPoints.push([position, hourlyAvg.temp[hourIndex], hourLabel]);
          }
        }
        
        // 添加湿度数据点
        if (hourlyAvg.humidity[hourIndex] !== 0) {
          if (hourlyAvg.humidityHasAnomaly[hourIndex]) {
            humidityAnomalyPoints.push([position, hourlyAvg.humidity[hourIndex], hourLabel]);
          } else {
            humidityNormalPoints.push([position, hourlyAvg.humidity[hourIndex], hourLabel]);
          }
        }
        
        // 添加可燃气体数据点
        if (hourlyAvg.gas[hourIndex] !== 0) {
          if (hourlyAvg.gasHasAnomaly[hourIndex]) {
            gasAnomalyPoints.push([position, hourlyAvg.gas[hourIndex], hourLabel]);
          } else {
            gasNormalPoints.push([position, hourlyAvg.gas[hourIndex], hourLabel]);
          }
        }
      }
      
      return {
        title: {
          text: '异常值检测（每小时平均值）',
          left: 'center',
          subtext: `更新时间: ${formatDate(now, 'YYYY-MM-DD HH:00')}`
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            const seriesName = params.seriesName;
            const time = params.data[2];
            const value = parseFloat(params.data[1]).toFixed(2);
            let unit = '';
            
            // 根据系列名称确定单位
            if (seriesName.includes('温度')) {
              unit = '°C';
            } else if (seriesName.includes('湿度')) {
              unit = '%';
            } else if (seriesName.includes('可燃气体')) {
              unit = 'ppm';
            }
            
            return seriesName + '\n' + time + '\n' + value + unit;
          }
        },
        legend: {
          data: ['温度-正常', '温度-异常', '湿度-正常', '湿度-异常', '可燃气体-正常', '可燃气体-异常'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: hourLabels,
          axisLabel: {
            interval: 2,
            rotate: 0
          }
        },
        yAxis: [
          {
          type: 'value',
            name: '温度/湿度',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#5470c6'
              }
            },
            axisLabel: {
              formatter: '{value}.00'
            }
          },
          {
            type: 'value',
            name: '可燃气体',
            position: 'right',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#91cc75'
              }
            },
            axisLabel: {
              formatter: '{value}.00'
            }
          }
        ],
        series: [
          {
            name: '温度-正常',
            type: 'scatter',
            data: tempNormalPoints,
            symbolSize: 12,
            itemStyle: {
              color: '#5470c6'
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: '温度-异常',
            type: 'scatter',
            data: tempAnomalyPoints,
            symbolSize: 18,
            itemStyle: {
              color: '#ee6666'
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: '湿度-正常',
            type: 'scatter',
            data: humidityNormalPoints,
            symbolSize: 12,
            itemStyle: {
              color: '#91cc75'
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: '湿度-异常',
            type: 'scatter',
            data: humidityAnomalyPoints,
            symbolSize: 18,
            itemStyle: {
              color: '#ff9a00'
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: '可燃气体-正常',
            type: 'scatter',
            data: gasNormalPoints,
            yAxisIndex: 1,
            symbolSize: 12,
            itemStyle: {
              color: '#73c0de'
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: '可燃气体-异常',
            type: 'scatter',
            data: gasAnomalyPoints,
            yAxisIndex: 1,
            symbolSize: 18,
            itemStyle: {
              color: '#fc8452'
            },
            emphasis: {
              focus: 'series'
            }
          }
        ]
      }
    })
    
    // AI分析相关
    const aiAnalysisResult = ref(null)
    const aiAnalyzing = ref(false)
    const showAIChat = ref(false)
    const aiChatHistory = ref([])
    const aiChatLoading = ref(false)
    const chatInput = ref('')
    
    // 添加权限检查
    const userInfo = uni.getStorageSync('userInfo')
    const hasPermission = ref(false)
    
    // 检查权限
    const checkPermission = () => {
      if (!userInfo) {
        console.log('No user info found')
        return false
      }
      
      let permissions = []
      if (userInfo.permissions) {
        permissions = userInfo.permissions
      } else {
        permissions = getRolePermissions(userInfo.role)
      }
      
      console.log('Analysis page - User role:', userInfo.role)
      console.log('Analysis page - User permissions:', permissions)
      
      // 检查是否有数据分析权限
      const permitted = permissions.includes('data_analysis')
      console.log('Analysis page - Has data_analysis permission:', permitted)
      return permitted
    }
    
    // 设置权限状态
    hasPermission.value = checkPermission()
    console.log('Analysis page - Has permission:', hasPermission.value)
    
    // 加载传感器列表
    const loadSensors = async () => {
      try {
        const response = await api.sensor.getAllSensors()
        sensors.value = response.data
        
        if (sensors.value.length > 0) {
          selectedSensorId.value = [sensors.value[0].sensorId]
          currentSensor.value = sensors.value[0]
          loadAnalysisData()
        }
      } catch (error) {
        console.error('Failed to load sensors', error)
        uni.showToast({
          title: '加载传感器列表失败',
          icon: 'none'
        })
      }
    }
    
    // 加载数据洞察
    const loadInsightsData = async () => {
      if (selectedSensorId.value.length === 0) {
        uni.showToast({
          title: '请先选择传感器',
          icon: 'none'
        })
        return
      }
      
      insightsLoading.value = true
      insightsError.value = null
      
      try {
        console.log('加载数据洞察')
        
        // 使用历史数据API获取数据，然后计算洞察
        const response = await api.envData.getHistoryData();
        console.log('历史数据响应:', response)
        
        if (response.data && response.data.code === 1 && Array.isArray(response.data.data)) {
          // 提取数据
          const data = response.data.data;
          
          // 计算数据洞察
          const insights = calculateInsightsFromData(data);
          insightsData.value = insights;
          
          console.log('数据洞察计算成功:', insightsData.value)
        } else {
          throw new Error(response.msg || '获取数据洞察失败')
        }
      } catch (error) {
        console.error('加载数据洞察失败:', error)
        insightsError.value = error.message || '获取数据洞察失败，请重试'
      } finally {
        insightsLoading.value = false
      }
    }
    
    // 从历史数据计算洞察
    const calculateInsightsFromData = (data) => {
      if (!data || data.length === 0) {
        return {}
      }
      
      // 提取温度、湿度和可燃气体数据
      const temperatures = data.map(item => item.temperature);
      const humidities = data.map(item => item.humidity);
      const gases = data.map(item => item.combustibleGas);
      const times = data.map(item => new Date(item.recordTime));
      
      // 计算基本统计数据
      const tempStats = calculateStats(temperatures);
      const humidityStats = calculateStats(humidities);
      const gasStats = calculateStats(gases);
      
      // 计算趋势
      const tempTrend = calculateTrend(temperatures);
      const humidityTrend = calculateTrend(humidities);
      const gasTrend = calculateTrend(gases);
      
      // 计算状态
      const tempStatus = getTemperatureStatus(tempStats.avg);
      const humidityStatus = getHumidityStatus(humidityStats.avg);
      const gasStatus = getGasStatus(gasStats.avg);
      
      // 计算安全评分
      const gasScore = calculateGasSafetyScore(gasStats.avg);
      
      // 计算异常值
      const anomalies = {
        temperature: temperatures.filter(t => t < 5 || t > 40).length,
        humidity: humidities.filter(h => h < 10 || h > 90).length,
        gas: gases.filter(g => g > 2000).length
      };
      
      const totalAnomalies = anomalies.temperature + anomalies.humidity + anomalies.gas;
      const anomalySeverity = totalAnomalies > 10 ? 'high' : (totalAnomalies > 5 ? 'medium' : 'low');
      
      // 计算日内变化规律
      const hourlyData = calculateHourlyPatterns(times, temperatures, humidities);
      
      // 生成建议措施
      const tempRecommendations = getTemperatureRecommendations(tempStatus, tempStats.avg);
      const humidityRecommendations = getHumidityRecommendations(humidityStatus, humidityStats.avg);
      const gasRecommendations = getGasRecommendations(gasStatus, gasStats.avg);
      const anomalyRecommendations = getAnomalyRecommendations(anomalySeverity, anomalies);
      
      return {
        temperatureInsights: {
          avg: tempStats.avg,
          min: tempStats.min,
          max: tempStats.max,
          trend: tempTrend,
          status: tempStatus,
          recommendations: tempRecommendations
        },
        humidityInsights: {
          avg: humidityStats.avg,
          min: humidityStats.min,
          max: humidityStats.max,
          trend: humidityTrend,
          status: humidityStatus,
          recommendations: humidityRecommendations
        },
        gasInsights: {
          avg: gasStats.avg,
          min: gasStats.min,
          max: gasStats.max,
          trend: gasTrend,
          status: gasStatus,
          safetyScore: gasScore,
          recommendations: gasRecommendations
        },
        anomalyInsights: {
          count: totalAnomalies,
          types: anomalies,
          severity: anomalySeverity,
          recommendations: anomalyRecommendations
        },
        patterns: hourlyData
      };
    }
    
    // 计算基本统计数据
    const calculateStats = (values) => {
      if (!values || values.length === 0) {
        return { min: 0, max: 0, avg: 0 };
      }
      
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      
      return { min, max, avg };
    }
    
    // 计算趋势
    const calculateTrend = (values) => {
      if (!values || values.length < 5) {
        return 'stable';
      }
      
      // 取最近的数据点计算趋势
      const recentValues = values.slice(-10);
      const firstHalf = recentValues.slice(0, Math.floor(recentValues.length / 2));
      const secondHalf = recentValues.slice(Math.floor(recentValues.length / 2));
      
      const firstAvg = firstHalf.reduce((acc, val) => acc + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((acc, val) => acc + val, 0) / secondHalf.length;
      
      const difference = secondAvg - firstAvg;
      const threshold = 2; // 阈值，根据实际情况调整
      
      if (Math.abs(difference) < threshold) {
        // 计算波动性
        const variance = values.reduce((acc, val) => acc + Math.pow(val - firstAvg, 2), 0) / values.length;
        return variance > 10 ? 'fluctuating' : 'stable';
      } else {
        return difference > 0 ? 'rising' : 'falling';
      }
    }
    
    // 获取温度状态
    const getTemperatureStatus = (avg) => {
      if (avg > 28) return 'high';
      if (avg < 18) return 'low';
      return 'normal';
    }
    
    // 获取湿度状态
    const getHumidityStatus = (avg) => {
      if (avg > 70) return 'high';
      if (avg < 30) return 'low';
      return 'normal';
    }
    
    // 获取可燃气体状态
    const getGasStatus = (avg) => {
      if (avg > 1000) return 'high';
      if (avg < 100) return 'low';
      return 'normal';
    }
    
    // 计算可燃气体安全评分
    const calculateGasSafetyScore = (gasValue) => {
      const minSafe = 300;  // 安全下限(ppm)
      const maxSafe = 1000; // 安全上限(ppm)
      const dangerThreshold = 2000; // 危险阈值(ppm)
      
      let gasScore = 50;
      
      if (gasValue <= minSafe) {
        // 低于安全下限：线性计算（300ppm时100分，0ppm时80分）
        gasScore = 100 - ((minSafe - gasValue) / minSafe) * 20;
      } else if (gasValue <= maxSafe) {
        // 安全范围内：恒定满分
        gasScore = 100;
      } else if (gasValue <= dangerThreshold) {
        // 超过安全上限但未达危险阈值：线性衰减
        gasScore = 100 - ((gasValue - maxSafe) / (dangerThreshold - maxSafe)) * 40;
      } else {
        // 超过危险阈值：指数衰减
        const excessRatio = (gasValue - dangerThreshold) / dangerThreshold;
        gasScore = 60 * Math.pow(0.5, excessRatio); // 每超出一倍危险值分数减半
      }
      
      return Math.max(0, Math.min(100, Math.round(gasScore)));
    }
    
    // 计算小时模式
    const calculateHourlyPatterns = (times, temperatures, humidities) => {
      // 初始化小时数据
      const hourlyTemps = Array(24).fill(0);
      const hourlyHumidities = Array(24).fill(0);
      const hourlyCount = Array(24).fill(0);
      
      // 按小时聚合数据
      times.forEach((time, index) => {
        const hour = time.getHours();
        
        // 检查是否是今天的数据
        const timeDate = formatDate(time, 'YYYY-MM-DD');
        const today = formatDate(new Date(), 'YYYY-MM-DD');
        
        // 只处理当天的数据
        if (timeDate === today) {
          hourlyTemps[hour] += temperatures[index];
          hourlyHumidities[hour] += humidities[index];
          hourlyCount[hour]++;
        }
      });
      
      // 计算每小时平均值
      for (let i = 0; i < 24; i++) {
        if (hourlyCount[i] > 0) {
          hourlyTemps[i] /= hourlyCount[i];
          hourlyHumidities[i] /= hourlyCount[i];
        }
      }
      
      // 找出峰值和低谷
      const tempPeakHour = hourlyTemps.indexOf(Math.max(...hourlyTemps));
      const tempLowestHour = hourlyTemps.indexOf(Math.min(...hourlyTemps));
      const humidityPeakHour = hourlyHumidities.indexOf(Math.max(...hourlyHumidities));
      const humidityLowestHour = hourlyHumidities.indexOf(Math.min(...hourlyHumidities));
      
      // 计算日内波动
      const tempVariance = Math.max(...hourlyTemps) - Math.min(...hourlyTemps);
      const humidityVariance = Math.max(...hourlyHumidities) - Math.min(...hourlyHumidities);
      
      return {
        dailyTemperature: {
          peakHour: tempPeakHour,
          lowestHour: tempLowestHour,
          variance: tempVariance
        },
        dailyHumidity: {
          peakHour: humidityPeakHour,
          lowestHour: humidityLowestHour,
          variance: humidityVariance
        }
      };
    }
    
    // 获取温度建议
    const getTemperatureRecommendations = (status, avg) => {
      switch (status) {
        case 'high':
          return [
            `调整空调设置至24-26°C (当前: ${avg.toFixed(1)}°C)`,
            "确保通风系统正常运行",
            "避免阳光直射传感器区域"
          ];
        case 'low':
          return [
            `适当提高室温至20-22°C (当前: ${avg.toFixed(1)}°C)`,
            "检查暖气系统是否正常工作",
            "确保门窗密封良好，避免冷风渗入"
          ];
        default:
          return [
            "保持当前温度设置",
            "定期检查温控系统"
          ];
      }
    }
    
    // 获取湿度建议
    const getHumidityRecommendations = (status, avg) => {
      switch (status) {
        case 'high':
          return [
            `使用除湿设备降低湿度至40-60% (当前: ${avg.toFixed(1)}%)`,
            "检查是否有漏水或渗水问题",
            "确保通风良好"
          ];
        case 'low':
          return [
            `使用加湿器提高湿度至40-60% (当前: ${avg.toFixed(1)}%)`,
            "避免过度使用空调",
            "在室内放置水培植物增加湿度"
          ];
        default:
          return [
            "保持当前湿度控制措施",
            "定期检查除湿/加湿设备"
          ];
      }
    }
    
    // 获取可燃气体建议
    const getGasRecommendations = (status, avg) => {
      switch (status) {
        case 'high':
          return [
            `立即增强通风，降低可燃气体浓度 (当前: ${avg.toFixed(1)} ppm)`,
            "检查可能的气体泄漏源",
            "考虑安装气体报警器"
          ];
        case 'low':
          return [
            "保持当前通风条件",
            "定期检查气体传感器校准状态"
          ];
        default:
          return [
            "继续保持良好的通风条件",
            "定期检查气体传感器校准状态"
          ];
      }
    }
    
    // 获取异常值建议
    const getAnomalyRecommendations = (severity, anomalies) => {
      const recommendations = [];
      
      if (anomalies.temperature > 0) {
        recommendations.push("检查温度传感器是否需要校准");
      }
      
      if (anomalies.humidity > 0) {
        recommendations.push("检查湿度传感器是否需要校准");
      }
      
      if (anomalies.gas > 0) {
        recommendations.push("检查可燃气体传感器是否需要校准");
      }
      
      if (severity === 'high') {
        recommendations.push("立即调查异常原因，可能存在设备故障");
      } else if (severity === 'medium') {
        recommendations.push("关注异常发生时段的环境条件");
      } else {
        recommendations.push("定期检查传感器状态");
      }
      
      return recommendations;
    }
    
    // 获取温度状态图标
    const getTemperatureIcon = (status) => {
      switch (status) {
        case 'high': return '🌡️'
        case 'low': return '❄️'
        default: return '✅'
      }
    }
    
    // 获取湿度状态图标
    const getHumidityIcon = (status) => {
      switch (status) {
        case 'high': return '💧'
        case 'low': return '🏜️'
        default: return '✅'
      }
    }
    
    // 获取可燃气体状态图标
    const getGasIcon = (status) => {
      switch (status) {
        case 'high': return '😷'
        case 'low': return '🌬️'
        default: return '✅'
      }
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      switch (status) {
        case 'high': return '偏高'
        case 'low': return '偏低'
        default: return '适宜'
      }
    }
    
    // 获取趋势文本
    const getTrendText = (trend) => {
      switch (trend) {
        case 'rising': return '呈上升趋势'
        case 'falling': return '呈下降趋势'
        case 'fluctuating': return '波动较大'
        default: return '趋势稳定'
      }
    }
    
    // 获取异常程度文本
    const getSeverityText = (severity) => {
      switch (severity) {
        case 'high': return '严重'
        case 'medium': return '中等'
        default: return '轻微'
      }
    }
    
    // 加载分析数据
    const loadAnalysisData = async () => {
      if (selectedSensorId.value.length === 0) {
        uni.showToast({
          title: '请先选择传感器',
          icon: 'none'
        })
        return
      }
      
      try {
        const sensorId = selectedSensorId.value[0]
        console.log('加载分析数据，参数:', {
          sensorId,
          startDate: startDate.value,
          endTime: endDate.value
        })
        
        // 显示加载提示
        uni.showLoading({
          title: '数据分析中',
          mask: true
        })
        
        // 使用新接口获取历史数据
        const response = await api.envData.getHistoryData();
        console.log('历史数据响应:', response)
        console.log('历史数据响应:', response.data)
        console.log('历史数据响应:', response.data.data)
        
        if (response.data && response.data.code === 1 && Array.isArray(response.data.data)) {
          // 提取数据
          const data = response.data.data;
          dataPoints.value = data.length;
          
          // 重置图表数据
          chartData.temperature = []
          chartData.humidity = []
          chartData.combustibleGas = []
          chartData.times = []
          chartData.temperatureDistribution = {}
          chartData.anomalies = []
          chartData.hourlyTemperature = Array(24).fill(0)
          chartData.hourlyHumidity = Array(24).fill(0)
          chartData.hourlyGas = Array(24).fill(0)
          
          // 记录总和，用于计算平均值
          let sumTemp = 0
          let sumHumidity = 0
          let sumGas = 0
          
          // 记录每小时的数据点数，用于计算平均值
          const hourlyCount = Array(24).fill(0)
          
          // 处理数据
          data.forEach(item => {
            // 提取数据
            const temp = item.temperature
            const humidity = item.humidity
            const gas = item.combustibleGas
            const recordTime = new Date(item.recordTime)
            const recordTimeStr = formatDate(recordTime, 'MM-DD HH:mm')
            const recordDateStr = formatDate(recordTime, 'YYYY-MM-DD')
            
            // 获取当前日期，格式化为 YYYY-MM-DD
            const today = formatDate(new Date(), 'YYYY-MM-DD')
            
            // 添加到图表数据
            chartData.temperature.push(temp)
            chartData.humidity.push(humidity)
            chartData.combustibleGas.push(gas)
            chartData.times.push(recordTimeStr)
            
            // 添加到温度分布
            const tempKey = Math.round(temp)
            chartData.temperatureDistribution[tempKey] = (chartData.temperatureDistribution[tempKey] || 0) + 1
            
            // 累加总和
            sumTemp += temp
            sumHumidity += humidity
            sumGas += gas
            
            // 统计小时数据 - 只统计当天的数据
            if (recordDateStr === today) {
              const hour = recordTime.getHours()
              chartData.hourlyTemperature[hour] += temp
              chartData.hourlyHumidity[hour] += humidity
              chartData.hourlyGas[hour] += gas
              hourlyCount[hour]++
            }
            
            // 检测异常值
            // 温度异常：低于5°C或高于40°C
            if (temp < 5 || temp > 40) {
              chartData.anomalies.push({
                type: 'temperature',
                value: temp,
                time: formatDate(recordTime, 'YYYY-MM-DD HH:mm'),
                threshold: temp < 5 ? '低于5°C' : '高于40°C'
              })
            }
            
            // 湿度异常：低于10%或高于90%
            if (humidity < 10 || humidity > 90) {
              chartData.anomalies.push({
                type: 'humidity',
                value: humidity,
                time: formatDate(recordTime, 'YYYY-MM-DD HH:mm'),
                threshold: humidity < 10 ? '低于10%' : '高于90%'
              })
            }
            
            // 可燃气体异常值
            if (gas > 2000) {
              chartData.anomalies.push({
                type: 'combustibleGas',
                value: gas,
                time: formatDate(recordTime, 'YYYY-MM-DD HH:mm'),
                threshold: '高于2000ppm'
              })
            }
          })
          
          // 计算平均值
          avgTemperature.value = dataPoints.value > 0 ? sumTemp / dataPoints.value : 0
          avgHumidity.value = dataPoints.value > 0 ? sumHumidity / dataPoints.value : 0
          avgCombustibleGas.value = dataPoints.value > 0 ? sumGas / dataPoints.value : 0
          
          // 计算每小时平均值
          for (let i = 0; i < 24; i++) {
            if (hourlyCount[i] > 0) {
              chartData.hourlyTemperature[i] /= hourlyCount[i]
              chartData.hourlyHumidity[i] /= hourlyCount[i]
              chartData.hourlyGas[i] /= hourlyCount[i]
            }
          }
          
          // 计算舒适度评分 (0-100)
          const tempScore = Math.max(0, 100 - Math.abs(avgTemperature.value - 22) * 5)
          const humidityScore = Math.max(0, 100 - Math.abs(avgHumidity.value - 50) * 2)
          
          // 可燃气体安全度计算
          let gasScore = 50;
          const gasValue = avgCombustibleGas.value;
          const minSafe = 300;  // 安全下限(ppm)
          const maxSafe = 1000; // 安全上限(ppm)
          const dangerThreshold = 2000; // 危险阈值(ppm)
          
          if (gasValue <= minSafe) {
            // 低于安全下限：线性计算（300ppm时100分，0ppm时80分）
            gasScore = 100 - ((minSafe - gasValue) / minSafe) * 20;
          } else if (gasValue <= maxSafe) {
            // 安全范围内：恒定满分
            gasScore = 100;
          } else if (gasValue <= dangerThreshold) {
            // 超过安全上限但未达危险阈值：线性衰减
            gasScore = 100 - ((gasValue - maxSafe) / (dangerThreshold - maxSafe)) * 40;
          } else {
            // 超过危险阈值：指数衰减
            const excessRatio = (gasValue - dangerThreshold) / dangerThreshold;
            gasScore = 60 * Math.pow(0.5, excessRatio); // 每超出一倍危险值分数减半
          }
          
          gasScore = Math.max(0, Math.min(100, Math.round(gasScore)));
          comfortScore.value = (tempScore + humidityScore + gasScore) / 3
          
          // 加载数据洞察
          loadInsightsData()
          
          // 更新分析状态
          analysisReady.value = true
          uni.hideLoading()
          
          uni.showToast({
            title: '数据分析完成',
            icon: 'success'
          })
        } else {
          throw new Error(response.msg || '数据格式错误')
        }
      } catch (error) {
        console.error('数据分析失败', error)
        uni.hideLoading()
        
        uni.showToast({
          title: '数据分析失败：' + (error.message || '未知错误'),
          icon: 'none',
          duration: 3000
        })
      }
    }
    
    // 格式化AI消息，处理换行和Markdown格式
    const formatAIMessage = (content) => {
      if (!content) return '';
      
      // 处理Markdown标题
      let formatted = content.replace(/###\s+([^\n]+)/g, '<h3 class="ai-heading">$1</h3>');
      
      // 处理列表
      formatted = formatted.replace(/(\d+)\.\s+([^\n]+)/g, '<div class="ai-list-item"><span class="ai-list-number">$1.</span> $2</div>');
      
      // 处理普通段落和换行
      formatted = formatted.split('\n\n').map(paragraph => {
        if (paragraph.trim() && !paragraph.includes('<h3') && !paragraph.includes('<div class="ai-list-item">')) {
          return `<p class="ai-paragraph">${paragraph.replace(/\n/g, '<br/>')}</p>`;
        }
        return paragraph;
      }).join('');
      
      return formatted;
    };
    
    // 传感器变化
    const onSensorChange = (ids) => {
      if (ids.length > 0) {
        const sensorId = ids[0]
        currentSensor.value = sensors.value.find(s => s.sensorId === sensorId)
        loadAnalysisData()
      }
    }
    
    // 日期范围变化
    const onDateRangeChange = () => {
      loadAnalysisData()
    }
    
    // AI分析数据
    const performAIAnalysis = async () => {
      if (selectedSensorId.value.length === 0) {
        uni.showToast({
          title: '请先选择传感器',
          icon: 'none'
        })
        return
      }
      
      aiAnalyzing.value = true
      
      // 显示加载提示
      uni.showLoading({
        title: 'AI分析中，请稍候...',
        mask: true
      })
      
      try {
        const sensorId = selectedSensorId.value[0]
        console.log('开始AI分析，参数:', {
          sensorId,
          startDate: startDate.value,
          endDate: endDate.value
        })
        
        const response = await api.envData.getAIAnalysis()
        console.log('AI分析响应:', response)
        
        if (response.code === 1) {
          aiAnalysisResult.value = response.data
          uni.hideLoading()
          uni.showToast({
            title: 'AI分析完成',
            icon: 'success'
          })
        } else {
          console.error('AI分析返回错误:', response)
          uni.hideLoading()
          uni.showToast({
            title: response.msg || 'AI分析失败',
            icon: 'none',
            duration: 3000
          })
        }
      } catch (error) {
        console.error('AI analysis failed', error)
        uni.hideLoading()
        
        // 根据错误类型显示不同的提示
        let errorMessage = 'AI分析失败，请稍后重试'
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'AI分析超时，请稍后重试或减少数据范围'
        } else if (error.response) {
          errorMessage = `服务器错误 (${error.response.status})`
        } else if (error.request) {
          errorMessage = '网络连接失败，请检查网络'
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
      } finally {
        aiAnalyzing.value = false
      }
    }
    
    // 发送消息后滚动到底部
    const scrollChatToBottom = () => {
      nextTick(() => {
        const chatMessagesEl = document.querySelector('.chat-messages')
        if (chatMessagesEl) {
          chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight
        }
      })
    }
    
    // 监听聊天历史变化，自动滚动到底部
    watch(aiChatHistory, () => {
      scrollChatToBottom()
    })
    
    // 发送AI问答消息
    const sendMessage = async () => {
      if (!chatInput.value.trim() || aiChatLoading.value) return
      
      const userMessage = chatInput.value.trim()
      
      // 添加用户消息到历史记录
      aiChatHistory.value.push({
        type: 'user',
        content: userMessage
      })
      
      // 清空输入框
      chatInput.value = ''
      
      // 自动滚动到底部
      scrollChatToBottom()
      
      // 设置加载状态
      aiChatLoading.value = true
      
      try {
        const response = await api.envData.getAIAnswer(userMessage)
        
        if (response.code === 1) {
          // 添加AI回复到历史记录
          aiChatHistory.value.push({
            type: 'ai',
            content: response.data
          })
        } else {
          // 添加错误信息
          aiChatHistory.value.push({
            type: 'ai',
            content: response.data || '抱歉，我无法回答这个问题。'
          })
        }
      } catch (error) {
        console.error('AI问答失败', error)
        
        // 添加错误信息
        aiChatHistory.value.push({
          type: 'ai',
          content: '抱歉，服务暂时不可用。请稍后再试。'
        })
      } finally {
        aiChatLoading.value = false
        scrollChatToBottom()
      }
    }
    
    // 测试API连接
    const testAPIConnection = async () => {
      uni.showLoading({
        title: '测试连接中...',
        mask: true
      })
      
      try {
        console.log('开始测试API连接')
        
        // 测试AI问答接口
        const response = await api.envData.getAIAnswer('测试连接')
        console.log('API连接测试响应:', response)
        
        if (response.code === 1) {
          uni.hideLoading()
          uni.showToast({
            title: 'API连接正常',
            icon: 'success'
          })
        } else {
          uni.hideLoading()
          uni.showToast({
            title: `API连接异常: ${response.msg}`,
            icon: 'none',
            duration: 3000
          })
        }
      } catch (error) {
        console.error('API连接测试失败:', error)
        uni.hideLoading()
        
        let errorMessage = 'API连接失败'
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'API连接超时'
        } else if (error.response) {
          errorMessage = `服务器错误 (${error.response.status})`
        } else if (error.request) {
          errorMessage = '网络连接失败'
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
      }
    }
    
    // 页面加载
    onMounted(() => {
      loadSensors()
    })
    
    return {
      sensors,
      selectedSensorId,
      startDate,
      endDate,
      analysisReady,
      dataPoints,
      avgTemperature,
      avgHumidity,
      avgCombustibleGas,
      comfortScore,
      comfortScoreClass,
      temperatureDistributionOption,
      dailyPatternOption,
      anomalyOption,
      insightsData,
      insightsLoading,
      insightsError,
      loadInsightsData,
      getTemperatureIcon,
      getHumidityIcon,
      getGasIcon,
      getStatusText,
      getTrendText,
      getSeverityText,
      onSensorChange,
      onDateRangeChange,
      formatDate,
      hasPermission,
      aiAnalysisResult,
      aiAnalyzing,
      showAIChat,
      aiChatHistory,
      aiChatLoading,
      chatInput,
      performAIAnalysis,
      sendMessage,
      testAPIConnection,
      formatAIMessage
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

.ai-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
  flex-wrap: wrap;
}

.ai-analysis-btn,
.ai-chat-btn {
  flex: 1;
  min-width: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 24rpx;
  background: var(--el-color-primary);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(64, 158, 255, 0.3);
  
  i {
    margin-right: 8rpx;
    font-size: 28rpx;
  }
  
  &:hover {
    transform: translateY(-2rpx);
    opacity: 0.9;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: var(--el-color-info);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

.ai-chat-btn {
  background: var(--el-color-success);
  box-shadow: 0 4rpx 12rpx rgba(103, 194, 58, 0.3);
}

.test-btn {
  flex: 1;
  min-width: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 158, 0.3);
  
  &:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 6rpx 16rpx rgba(255, 154, 158, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #ccc 0%, #999 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

.btn-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
}

.btn-text {
  font-weight: bold;
}

.analysis-summary {
  margin-bottom: 20rpx;
  
  .summary-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .summary-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    
    .summary-item {
      display: flex;
      align-items: center;
      
      .label {
        font-size: 26rpx;
        color: #666;
        margin-right: 10rpx;
      }
      
      .value {
        font-size: 26rpx;
        color: #333;
        font-weight: bold;
        
        &.excellent {
          color: #67c23a;
        }
        
        &.good {
          color: #409eff;
        }
        
        &.moderate {
          color: #e6a23c;
        }
        
        &.poor {
          color: #f56c6c;
        }
      }
    }
  }
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

.insight-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
    }
    
    .refresh-btn {
      padding: 8rpx 16rpx;
      background-color: #f0f9eb;
      color: #67c23a;
      border: 1px solid #c2e7b0;
      border-radius: 4rpx;
      font-size: 24rpx;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
      
      i {
        margin-right: 4rpx;
        font-size: 24rpx;
        
        &.is-loading {
          animation: rotating 2s linear infinite;
        }
      }
      
      &:hover {
        background-color: #67c23a;
        color: #fff;
      }
      
      &:disabled {
        background-color: #f5f7fa;
        color: #c0c4cc;
        border-color: #e4e7ed;
        cursor: not-allowed;
      }
    }
  }
  
  .insights-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;
    
    i {
      font-size: 48rpx;
      color: #409eff;
      margin-bottom: 16rpx;
      animation: rotating 2s linear infinite;
    }
    
    .loading-text {
      font-size: 26rpx;
      color: #606266;
    }
  }
  
  .insights-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;
    
    i {
      font-size: 48rpx;
      color: #f56c6c;
      margin-bottom: 16rpx;
    }
    
    .error-text {
      font-size: 26rpx;
      color: #f56c6c;
      margin-bottom: 16rpx;
    }
    
    .retry-btn {
      padding: 8rpx 24rpx;
      background-color: #fef0f0;
      color: #f56c6c;
      border: 1px solid #fbc4c4;
      border-radius: 4rpx;
      font-size: 24rpx;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: #f56c6c;
        color: #fff;
      }
    }
  }

  .insight-list {
    .insight-item {
      display: flex;
      margin-bottom: 20rpx;
      padding: 16rpx;
      border-radius: 8rpx;
      background-color: #f8f9fa;
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
        transform: translateY(-2rpx);
      }
      
      .insight-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }
      
      .insight-content {
        flex: 1;
        
        .insight-title {
          font-size: 28rpx;
          font-weight: bold;
          margin-bottom: 6rpx;
          display: block;
        }
        
        .insight-desc {
          font-size: 26rpx;
          color: #666;
          line-height: 1.5;
        }
        
        .insight-recommendations {
          margin-top: 12rpx;
          background-color: #f0f9eb;
          padding: 12rpx;
          border-radius: 4rpx;
          
          .recommendations-title {
            font-size: 24rpx;
            color: #67c23a;
            font-weight: bold;
            display: block;
            margin-bottom: 8rpx;
          }
          
          .recommendation-list {
            .recommendation-item {
              font-size: 24rpx;
              color: #606266;
              line-height: 1.5;
              display: block;
              margin-bottom: 4rpx;
            }
          }
        }
      }
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.no-permission {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
}

.no-permission-text {
  font-size: 32rpx;
  color: #999;
}

.ai-analysis-result {
  margin-bottom: 20rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
      display: flex;
      align-items: center;
      
      i {
        margin-right: 8rpx;
        font-size: 24rpx;
        color: var(--el-color-primary);
      }
    }
    
    .close-btn {
      padding: 8rpx 16rpx;
      background-color: var(--el-color-danger);
      color: #fff;
      border: none;
      border-radius: 4rpx;
      font-size: 24rpx;
      cursor: pointer;
    }
  }
  
  .ai-content {
    background-color: #f8f9fa;
    border-radius: 8rpx;
    padding: 20rpx;
    border: 1px solid var(--el-border-color-lighter);
    
    .ai-text {
      font-size: 26rpx;
      color: #333;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }
}

.ai-chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .ai-chat-dialog {
    background-color: #fff;
    border-radius: 16rpx;
    width: 90%;
    max-width: 800rpx;
    height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 30rpx;
      border-bottom: 2rpx solid #ebeef5;
      background-color: #f5f7fa;
      border-radius: 16rpx 16rpx 0 0;
      position: relative;

      .chat-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: flex;
        align-items: center;
        
        i {
          margin-right: 12rpx;
          font-size: 32rpx;
          color: #409eff;
        }
      }

      .close-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f56c6c;
        color: #fff;
        border: none;
        border-radius: 30rpx;
        font-size: 32rpx;
        cursor: pointer;
        transition: all 0.2s ease;
        position: absolute;
        right: 20rpx;
        top: 20rpx;
        
        &:hover {
          background-color: #eb5050;
          transform: scale(1.05);
        }
      }
    }

    .chat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      
      .chat-messages {
        flex: 1;
        padding: 30rpx;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        background-color: #fff;

        .message {
          margin-bottom: 30rpx;
          display: flex;
          align-items: flex-start;
          width: 100%;

          .message-avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 40rpx;
            background-color: #409eff;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28rpx;
            font-weight: bold;
            margin-right: 16rpx;
            flex-shrink: 0;
            box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
          }

          .user-avatar {
            background-color: #67c23a;
          }

          .message-bubble {
            max-width: calc(100% - 110rpx);
            padding: 20rpx 24rpx;
            border-radius: 12rpx;
            position: relative;
            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
            word-break: break-word;
          }

          &.user-message {
            flex-direction: row-reverse;
            
            .message-avatar {
              margin-right: 0;
              margin-left: 16rpx;
            }

            .message-bubble {
              background-color: #ecf5ff;
              border: 1px solid #d9ecff;
              border-radius: 12rpx 4rpx 12rpx 12rpx;
            }
          }

          &.ai-message {
            .message-bubble {
              background-color: #f5f7fa;
              border: 1px solid #e4e7ed;
              border-radius: 4rpx 12rpx 12rpx 12rpx;
            }
          }

          .message-text {
            font-size: 28rpx;
            line-height: 1.6;
            word-wrap: break-word;
            white-space: pre-wrap;
            color: #333;
          }

          .formatted {
            white-space: normal;

            :deep(.ai-heading) {
              font-size: 30rpx;
              font-weight: bold;
              color: #303133;
              margin: 16rpx 0 12rpx;
              padding-bottom: 8rpx;
              border-bottom: 1px solid #ebeef5;
            }

            :deep(.ai-paragraph) {
              margin: 10rpx 0;
            }

            :deep(.ai-list-item) {
              margin: 10rpx 0;
              padding-left: 10rpx;
              display: flex;
            }

            :deep(.ai-list-number) {
              font-weight: bold;
              margin-right: 10rpx;
              color: #409eff;
            }
          }
        }
      }

      .chat-input-container {
        display: flex;
        align-items: center;
        padding: 20rpx 30rpx;
        border-top: 2rpx solid #ebeef5;
        gap: 20rpx;
        background-color: #f5f7fa;

        .input-field {
          flex: 1;
          padding: 20rpx 24rpx;
          border: 2rpx solid #dcdfe6;
          border-radius: 30rpx;
          font-size: 28rpx;
          outline: none;
          background-color: #fff;
          transition: all 0.3s ease;
          min-height: 72rpx;
          max-height: 160rpx;
          width: 100%;
          box-sizing: border-box;
          
          &:focus {
            border-color: #409eff;
            box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
          }
          
          &:hover {
            border-color: #c0c4cc;
          }
          
          &:disabled {
            background-color: #f5f5f5;
            color: #999;
          }
        }

        .send-btn {
          width: 120rpx;
          height: 72rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #409eff;
          color: #fff;
          border: none;
          border-radius: 36rpx;
          font-size: 28rpx;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4rpx 12rpx rgba(64, 158, 255, 0.4);
          
          &:hover {
            background-color: #66b1ff;
            transform: translateY(-2rpx);
          }
          
          &:active {
            transform: translateY(0);
          }
          
          &:disabled {
            background-color: #a0cfff;
            cursor: not-allowed;
            box-shadow: none;
          }
        }
      }
    }
  }
}
</style> 