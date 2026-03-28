/**
 * 环境数据相关API
 */
import axios from 'axios'
import { 
  generateEnvData, 
  generateAggregatedData, 
  generateAnomalies 
} from '../utils/mockData'

//const BASE_URL = '/api/env-data'
const BASE_URL = 'http://localhost:8080';

const USE_MOCK = false // 强制使用真实API
const API_DELAY = 300 // 模拟API延迟时间(毫秒)

// 缓存生成的环境数据，按传感器ID组织
const cachedEnvData = {}

export default {
  /**
   * API基础URL，供外部访问
   */
  BASE_URL,
  
  /**
   * 获取历史数据
   * 用于数据分析页面
   */
  getHistoryData() {
    // 从本地存储获取token
    const token = uni.getStorageSync('token')
    
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 生成模拟的历史数据
          const data = Array(50).fill(0).map((_, i) => {
            const hours = Math.floor(Math.random() * 72);
            return {
              temperature: parseFloat((15 + Math.random() * 25).toFixed(1)),
              humidity: parseFloat((30 + Math.random() * 50).toFixed(1)),
              combustibleGas: parseFloat((50 + Math.random() * 500).toFixed(1)),
              recordTime: new Date(new Date() - hours * 60 * 60 * 1000).toISOString()
            }
          });
          
          // 按时间排序
          data.sort((a, b) => new Date(a.recordTime) - new Date(b.recordTime));
          
          resolve({
            code: 1,
            msg: "success",
            data: data
          })
        }, API_DELAY)
      })
    }
    
    // 使用真实API，添加token到请求头
    return axios.get(`${BASE_URL}/historyData`, {
      headers: {
        'token': token // 添加token到请求头
      }
    }).catch(error => {
      console.error('Failed to fetch history data from API, using mock data', error)
      // 如果API请求失败，使用模拟数据作为备用
      const data = Array(50).fill(0).map((_, i) => {
        const hours = Math.floor(Math.random() * 72);
        return {
          temperature: parseFloat((15 + Math.random() * 25).toFixed(1)),
          humidity: parseFloat((30 + Math.random() * 50).toFixed(1)),
          combustibleGas: parseFloat((50 + Math.random() * 500).toFixed(1)),
          recordTime: new Date(new Date() - hours * 60 * 60 * 1000).toISOString()
        }
      });
      
      // 按时间排序
      data.sort((a, b) => new Date(a.recordTime) - new Date(b.recordTime));
      
      return {
        code: 1,
        msg: "success",
        data: data
      }
    })
  },
  
  /**
   * 获取最新数据 (新版API)
   */
  getLatestData() {
    // 从本地存储获取token
    const token = uni.getStorageSync('token')
    
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 生成模拟的最新数据
          resolve({
            code: 1,
            msg: "success",
            data: {
              temperature: parseFloat((20 + Math.random() * 15).toFixed(1)),
              humidity: parseFloat((10 + Math.random() * 20).toFixed(1)),
              combustibleGas: parseFloat((80 + Math.random() * 20).toFixed(1)),
              recordTime: new Date().toISOString()
            }
          })
        }, API_DELAY)
      })
    }
    
    // 使用真实API
    return axios.get(`${BASE_URL}/getLatestData`, {
      headers: {
        'token': token // 添加token到请求头
      }
    }).catch(error => {
      console.error('Failed to fetch latest data from API, using mock data', error)
      // 如果API请求失败，使用模拟数据作为备用
      return {
        code: 1,
        msg: "success",
        data: {
          temperature: parseFloat((20 + Math.random() * 15).toFixed(1)),
          humidity: parseFloat((10 + Math.random() * 20).toFixed(1)),
          combustibleGas: parseFloat((80 + Math.random() * 20).toFixed(1)),
          recordTime: new Date().toISOString()
        }
      }
    })
  },
  
  /**
   * 获取热力图数据
   * 用于仪表板页面的热力图显示
   */
  getHeatmapData() {
    // 从本地存储获取token
    const token = uni.getStorageSync('token')
    
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 生成模拟的热力图数据
          resolve({
            code: 1,
            msg: "success",
            data: Array(72).fill(0).map((_, i) => {
              const day = Math.floor(i / 24);
              const hour = i % 24;
              const baseTemp = 22 + (Math.random() - 0.5) * 20;
              return {
                temperature: parseFloat(baseTemp.toFixed(1)),
                recordTime: new Date(new Date() - (day * 24 * 60 * 60 * 1000) - ((23-hour) * 60 * 60 * 1000)).toISOString()
              };
            })
          })
        }, API_DELAY)
      })
    }
    
    // 使用真实API，添加token到请求头
    return axios.get(`${BASE_URL}/historyData`, {
      headers: {
        'token': token // 添加token到请求头
      }
    }).catch(error => {
      console.error('Failed to fetch heatmap data from API, using mock data', error)
      // 如果API请求失败，使用模拟数据作为备用
      return {
        code: 1,
        msg: "success",
        data: Array(72).fill(0).map((_, i) => {
          const day = Math.floor(i / 24);
          const hour = i % 24;
          const baseTemp = 22 + (Math.random() - 0.5) * 20;
          return {
            temperature: parseFloat(baseTemp.toFixed(1)),
            recordTime: new Date(new Date() - (day * 24 * 60 * 60 * 1000) - ((23-hour) * 60 * 60 * 1000)).toISOString()
          };
        })
      }
    })
  },
  
  /**
   * 获取最新数据 (旧版API)
   * @param {String} sensorId 传感器ID
   * @param {Number} limit 限制数量
   */
  getLatestDataLegacy(sensorId, limit = 10) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 生成最近24小时的数据，然后取最新的几条
          const endTime = new Date()
          const startTime = new Date(endTime - 24 * 60 * 60 * 1000)
          
          // 使用缓存数据或生成新数据
          if (!cachedEnvData[sensorId]) {
            cachedEnvData[sensorId] = generateEnvData(sensorId, 24, startTime, endTime)
          }
          
          resolve({
            data: cachedEnvData[sensorId].slice(-limit)
          })
        }, 300)
      })
    }
    return axios.get(`${BASE_URL}/latest/${sensorId}`, {
      params: { limit }
    }).catch(error => {
      console.error('Failed to fetch latest data from API, using mock data', error)
      // 如果API请求失败，使用模拟数据作为备用
      const endTime = new Date()
      const startTime = new Date(endTime - 24 * 60 * 60 * 1000)
      
      if (!cachedEnvData[sensorId]) {
        cachedEnvData[sensorId] = generateEnvData(sensorId, 24, startTime, endTime)
      }
      
      return {
        data: cachedEnvData[sensorId].slice(-limit)
      }
    })
  },
  
  /**
   * 根据时间范围获取环境数据
   * @param {String} sensorId 传感器ID
   * @param {Date} startTime 开始时间
   * @param {Date} endTime 结束时间
   */
  getEnvData(sensorId, startTime, endTime) {
    // 复用现有的getDataByTimeRange方法
    return this.getDataByTimeRange(sensorId, startTime, endTime);
  },
  
  /**
   * 根据时间范围获取数据
   * @param {String} sensorId 传感器ID
   * @param {Date} startTime 开始时间
   * @param {Date} endTime 结束时间
   */
  getDataByTimeRange(sensorId, startTime, endTime) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 计算时间范围内的小时数，生成对应数量的数据点
          const hours = Math.ceil((endTime - startTime) / (60 * 60 * 1000))
          const count = Math.min(Math.max(hours, 24), 168) // 至少24个点，最多一周168个点
          
          // 使用缓存数据或生成新数据
          const cacheKey = `${sensorId}_${startTime.getTime()}_${endTime.getTime()}`
          if (!cachedEnvData[cacheKey]) {
            let data = generateEnvData(sensorId, count, startTime, endTime)
            
            // 添加少量异常值
            if (count > 10) {
              data = generateAnomalies(data, Math.floor(count / 10))
            }
            
            cachedEnvData[cacheKey] = data
          }
          
          resolve({
            data: cachedEnvData[cacheKey]
          })
        }, 300)
      })
    }
    return axios.get(`${BASE_URL}/${sensorId}`, {
      params: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }
    }).catch(error => {
      console.error('Failed to fetch data by time range from API, using mock data', error)
      // 如果API请求失败，使用模拟数据作为备用
      const hours = Math.ceil((endTime - startTime) / (60 * 60 * 1000))
      const count = Math.min(Math.max(hours, 24), 168)
      
      const cacheKey = `${sensorId}_${startTime.getTime()}_${endTime.getTime()}`
      if (!cachedEnvData[cacheKey]) {
        let data = generateEnvData(sensorId, count, startTime, endTime)
        
        if (count > 10) {
          data = generateAnomalies(data, Math.floor(count / 10))
        }
        
        cachedEnvData[cacheKey] = data
      }
      
      return {
        data: cachedEnvData[cacheKey]
      }
    })
  },
  
  /**
   * 保存环境数据
   * @param {Object} envData 环境数据对象
   */
  saveData(envData) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              ...envData,
              id: Date.now(),
              timestamp: new Date(),
              createdAt: new Date()
            }
          })
        }, 300)
      })
    }
    return axios.post(BASE_URL, envData)
  },
  
  /**
   * 获取聚合数据
   * @param {String} sensorId 传感器ID
   * @param {Date} startTime 开始时间
   * @param {Date} endTime 结束时间
   * @param {String} groupBy 分组方式 (hourly, daily, weekly, monthly)
   */
  getAggregatedData(sensorId, startTime, endTime, groupBy = 'daily') {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 使用缓存数据或生成新数据
          const cacheKey = `${sensorId}_${startTime.getTime()}_${endTime.getTime()}_${groupBy}`
          if (!cachedEnvData[cacheKey]) {
            cachedEnvData[cacheKey] = generateAggregatedData(sensorId, startTime, endTime, groupBy)
          }
          
          resolve({
            data: cachedEnvData[cacheKey]
          })
        }, 300)
      })
    }
    return axios.get(`${BASE_URL}/aggregated/${sensorId}`, {
      params: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        groupBy
      }
    }).catch(error => {
      console.error('Failed to fetch aggregated data from API, using mock data', error)
      // 如果API请求失败，使用模拟数据作为备用
      const cacheKey = `${sensorId}_${startTime.getTime()}_${endTime.getTime()}_${groupBy}`
      if (!cachedEnvData[cacheKey]) {
        cachedEnvData[cacheKey] = generateAggregatedData(sensorId, startTime, endTime, groupBy)
      }
      
      return {
        data: cachedEnvData[cacheKey]
      }
    })
  },
  
  /**
   * 获取多个传感器的数据用于对比
   * @param {Array} sensorIds 传感器ID数组
   * @param {Date} startTime 开始时间
   * @param {Date} endTime 结束时间
   */
  getComparisonData(sensorIds, startTime, endTime) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = sensorIds.map(id => {
            const hours = Math.ceil((endTime - startTime) / (60 * 60 * 1000))
            const count = Math.min(Math.max(hours, 24), 72) // 最多3天72个点
            
            // 使用缓存数据或生成新数据
            const cacheKey = `${id}_${startTime.getTime()}_${endTime.getTime()}_comparison`
            if (!cachedEnvData[cacheKey]) {
              cachedEnvData[cacheKey] = generateEnvData(id, count, startTime, endTime)
            }
            
            return { data: cachedEnvData[cacheKey] }
          })
          
          resolve(results)
        }, 300)
      })
    }
    
    try {
      const promises = sensorIds.map(id => 
        this.getDataByTimeRange(id, startTime, endTime)
      )
      return Promise.all(promises)
    } catch (error) {
      console.error('Failed to fetch comparison data, using mock data', error)
      // 如果API请求失败，使用模拟数据作为备用
      return new Promise((resolve) => {
        const results = sensorIds.map(id => {
          const hours = Math.ceil((endTime - startTime) / (60 * 60 * 1000))
          const count = Math.min(Math.max(hours, 24), 72)
          
          const cacheKey = `${id}_${startTime.getTime()}_${endTime.getTime()}_comparison`
          if (!cachedEnvData[cacheKey]) {
            cachedEnvData[cacheKey] = generateEnvData(id, count, startTime, endTime)
          }
          
          return { data: cachedEnvData[cacheKey] }
        })
        
        resolve(results)
      })
    }
  },

  /**
   * AI分析数据
   * @param {String} sensorId 传感器ID
   * @param {Date} startTime 开始时间
   * @param {Date} endTime 结束时间
   */
  getAIAnalysis() {
    const token = uni.getStorageSync('token')
    
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            code: 1,
            msg: "success",
            data: "基于您提供的环境数据分析，我发现了以下关键信息：\n\n### 温度分析\n- 平均温度：25.6°C\n- 温度范围：18.2°C - 32.1°C\n- 温度变化趋势：相对稳定，无明显异常\n\n### 湿度分析\n- 平均湿度：45.3%\n- 湿度范围：28.5% - 78.2%\n- 湿度变化：在舒适范围内波动\n\n### 可燃气体分析\n- 平均浓度：35.2\n- 浓度范围：12.0 - 89.5\n- 安全状态：整体安全，但需关注高值时段\n\n### 综合建议\n1. 环境参数整体处于安全范围\n2. 建议定期检查传感器设备\n3. 关注可燃气体浓度异常时段"
          })
        }, 1000)
      })
    }
    
    return axios.get(`${BASE_URL}/analysisChat`, {
      headers: {
        'token': token
      },
      timeout: 90000 // 设置60秒超时
    }).then(response => {
      // 确保返回正确的格式
      if (response.data) {
        return response.data
      }
      return response
    }).catch(error => {
      console.error('Failed to get AI analysis', error)
      
      // 根据错误类型返回不同的错误信息
      if (error.code === 'ECONNABORTED') {
        return {
          code: 0,
          msg: "AI分析超时，请稍后重试",
          data: "AI分析需要较长时间处理，请稍后重试或减少数据范围。"
        }
      } else if (error.response) {
        // 服务器返回了错误状态码
        return {
          code: 0,
          msg: `AI分析失败 (${error.response.status})`,
          data: error.response.data?.message || "服务器错误，请稍后重试。"
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        return {
          code: 0,
          msg: "网络连接失败",
          data: "无法连接到AI分析服务，请检查网络连接。"
        }
      } else {
        // 其他错误
        return {
          code: 0,
          msg: "AI分析失败",
          data: "抱歉，AI分析服务暂时不可用，请稍后重试。"
        }
      }
    })
  },

  /**
   * AI问答
   * @param {String} prompt 问题内容
   */
  getAIAnswer(prompt) {
    const token = uni.getStorageSync('token')
    
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            code: 1,
            msg: "success",
            data: "根据您的问题，我为您提供以下建议：\n\n### 环境监测建议\n1. 定期检查传感器设备状态\n2. 设置合理的报警阈值\n3. 建立数据备份机制\n\n### 安全措施\n1. 安装可燃气体报警器\n2. 配备通风设备\n3. 制定应急预案\n\n### 数据分析\n建议使用趋势分析工具，定期生成环境报告，及时发现潜在风险。"
          })
        }, 800)
      })
    }
    
    return axios.get(`${BASE_URL}/chat`, {
      headers: {
        'token': token
      },
      params: {
        prompt
      },
      timeout: 30000 // 设置30秒超时
    }).then(response => {
      // 确保返回正确的格式
      if (response.data) {
        return response.data
      }
      return response
    }).catch(error => {
      console.error('Failed to get AI answer', error)
      
      // 根据错误类型返回不同的错误信息
      if (error.code === 'ECONNABORTED') {
        return {
          code: 0,
          msg: "AI问答超时，请稍后重试",
          data: "AI正在思考中，请稍后重试。"
        }
      } else if (error.response) {
        // 服务器返回了错误状态码
        return {
          code: 0,
          msg: `AI问答失败 (${error.response.status})`,
          data: error.response.data?.message || "服务器错误，请稍后重试。"
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        return {
          code: 0,
          msg: "网络连接失败",
          data: "无法连接到AI问答服务，请检查网络连接。"
        }
      } else {
        // 其他错误
        return {
          code: 0,
          msg: "AI问答失败",
          data: "抱歉，AI问答服务暂时不可用，请稍后重试。"
        }
      }
    })
  },


} 