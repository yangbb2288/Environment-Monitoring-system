/**
 * API 服务入口
 */
import axios from 'axios'
import sensor from './sensor'
import envData from './envData'
import * as user from './user'
const BASE_URL = 'http://localhost:8080';

// 配置axios默认设置
axios.defaults.timeout = 30000000000 // 默认30秒超时
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    console.log('API请求:', config.method?.toUpperCase(), config.url, config.params || config.data)
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    console.log('API响应:', response.status, response.config.url)
    return response
  },
  error => {
    // 对响应错误做点什么
    console.error('API响应错误:', error)
    return Promise.reject(error)
  }
)

// RAG知识库助手API
const llmRag = {
    // 向知识库助手提问
    askQuestion(question) {
        // 获取用户token
        const token = uni.getStorageSync('token');
        if (!token) {
            console.error('Token不存在，请先登录获取token');
            return Promise.reject(new Error('Token不存在，请先登录获取token'));
        }
        return axios.post(
            `${BASE_URL}/user/llmRag`, 
            { question: question }, 
            { 
                headers: {
                    'token': token ,
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};

// 警告处理API
const warning = {
  // 获取最近的警告处理方案
  getRecentWarningHandles() {
    // 获取用户token
    const userInfo = uni.getStorageSync('userInfo');
    const token = userInfo?.token;
    
    return axios.get(`${BASE_URL}/warn/handle`, {
      headers: { 'token': token }
    })
  }
}

export default {
  sensor,
  envData,
  user,
  llmRag,
  warning
} 