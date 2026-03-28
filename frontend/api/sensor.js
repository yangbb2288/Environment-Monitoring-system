/**
 * 传感器相关API
 */
import axios from 'axios'
import { generateSensors } from '../utils/mockData'

//const BASE_URL = '/api/sensors'
const BASE_URL = 'http://localhost:8080';

const USE_MOCK = false // 设置为true使用模拟数据，设置为false使用真实API
const API_DELAY = 300 // 模拟API延迟时间(毫秒)

// 缓存生成的传感器列表，确保每次返回相同的传感器
let cachedSensors = null

export default {
  /**
   * 获取所有传感器
   */
  getAllSensors() {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 使用缓存的传感器列表或生成新的
          if (!cachedSensors) {
            cachedSensors = generateSensors(10)
          }
          
          // 确保至少有一个传感器在线
          if (!cachedSensors.some(s => s.status === 'online')) {
            if (cachedSensors.length > 0) {
              cachedSensors[0].status = 'online'
            }
          }
          
          resolve({
            data: cachedSensors
          })
        }, 300) // 模拟网络延迟
      })
    }
    return axios.get(BASE_URL)
      .catch(error => {
        console.error('Failed to fetch sensors from API, using mock data', error)
        // 如果API请求失败，使用模拟数据作为备用
        if (!cachedSensors) {
          cachedSensors = generateSensors(10)
          
          // 确保至少有一个传感器在线
          if (cachedSensors.length > 0) {
            cachedSensors[0].status = 'online'
          }
        }
        
        return {
          data: cachedSensors
        }
      })
  },
  
  /**
   * 根据ID获取传感器
   * @param {String} sensorId 传感器ID
   */
  getSensorById(sensorId) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const sensors = generateSensors(10)
          const sensor = sensors.find(s => s.sensorId === sensorId) || sensors[0]
          resolve({
            data: sensor
          })
        }, 300)
      })
    }
    return axios.get(`${BASE_URL}/${sensorId}`)
  },
  
  /**
   * 添加传感器
   * @param {Object} sensor 传感器对象
   */
  addSensor(sensor) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              ...sensor,
              id: Date.now(),
              sensorId: `S${Date.now().toString().substr(-6)}`,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        }, 300)
      })
    }
    return axios.post(BASE_URL, sensor)
  },
  
  /**
   * 更新传感器
   * @param {String} sensorId 传感器ID
   * @param {Object} sensor 传感器对象
   */
  updateSensor(sensorId, sensor) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              ...sensor,
              sensorId,
              updatedAt: new Date()
            }
          })
        }, 300)
      })
    }
    return axios.put(`${BASE_URL}/${sensorId}`, sensor)
  },
  
  /**
   * 删除传感器
   * @param {String} sensorId 传感器ID
   */
  deleteSensor(sensorId) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: null
          })
        }, 300)
      })
    }
    return axios.delete(`${BASE_URL}/${sensorId}`)
  },

  /**
   * 获取阈值设置
   */
  getThreshold() {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              code: 1,
              msg: "success",
              data: {
                humidity: 80,
                combustibleGas: 2000,
                temperature: 30
              }
            }
          })
        }, API_DELAY)
      })
    }
    // 从本地存储获取token
    const token = uni.getStorageSync('token');
    console.log('Get threshold with token:', token); // 调试信息
    return axios.get(`${BASE_URL}/getLThreshold`, {
      headers: {
        'token': token
      }
    })
  },

  /**
   * 设置阈值
   * @param {Object} thresholds 包含湿度、可燃气体和温度阈值的对象
   */
  setThreshold(thresholds) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              code: 1,
              msg: "success",
              data: "阈值设置成功"
            }
          })
        }, API_DELAY)
      })
    }
    // 从本地存储获取token
    const token = uni.getStorageSync('token');
    console.log('Set threshold with token:', token); // 调试信息
    console.log('Threshold data:', thresholds); // 调试信息

    // 确保按正确的顺序传递参数：humidity, combustibleGas, temperature
    // POST请求中，数据应该直接作为请求体发送，而不是作为params
    return axios.post(`${BASE_URL}/threshold`, 
      {
        humidity: thresholds.humidity,
        combustibleGas: thresholds.combustibleGas,
        temperature: thresholds.temperature
      },
      {
        headers: {
          'token': token
        }
      }
    )
  }
} 