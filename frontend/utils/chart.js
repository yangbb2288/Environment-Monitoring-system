/**
 * 图表配置工具
 */

/**
 * 模拟API调用获取图表数据
 * @param {Function} dataGeneratorFn 数据生成函数
 * @param {Object} params 参数
 * @param {Number} delay 延迟时间(毫秒)
 * @returns {Promise} 包含数据的Promise
 */
export function simulateChartDataApi(dataGeneratorFn, params = {}, delay = 300) {
  return new Promise((resolve, reject) => {
    console.log('模拟API调用获取图表数据', params)
    
    // 首先尝试通过实际API获取数据
    if (typeof window !== 'undefined' && window.axios) {
      try {
        // 构建API请求参数
        const apiParams = { ...params };
        
        // 处理日期参数 - 确保日期对象被正确序列化
        if (apiParams.startDate instanceof Date) {
          apiParams.startDate = apiParams.startDate.toISOString();
        }
        if (apiParams.endDate instanceof Date) {
          apiParams.endDate = apiParams.endDate.toISOString();
        }
        
        // 尝试API调用
        window.axios.get('/api/chart/data', { params: apiParams, timeout: 3000 })
          .then(response => {
            resolve(response.data);
          })
          .catch(error => {
            console.warn('API调用失败，使用模拟数据', error);
            // API调用失败，回退到模拟数据
            simulateFallbackData();
          });
      } catch (error) {
        console.warn('API请求构建失败，使用模拟数据', error);
        simulateFallbackData();
      }
    } else {
      // 不存在axios，直接使用模拟数据
      simulateFallbackData();
    }
    
    // 模拟数据生成函数
    function simulateFallbackData() {
      setTimeout(() => {
        try {
          // 确保参数中的日期是有效的
          if (params.startDate && !(params.startDate instanceof Date) && !isNaN(new Date(params.startDate).getTime())) {
            params.startDate = new Date(params.startDate);
          }
          
          if (params.endDate && !(params.endDate instanceof Date) && !isNaN(new Date(params.endDate).getTime())) {
            params.endDate = new Date(params.endDate);
          }
          
          const data = dataGeneratorFn(params);
          
          // 处理日期格式问题
          if (data && typeof data === 'object') {
            // 递归处理对象中的日期
            const processDateInObject = (obj) => {
              if (!obj || typeof obj !== 'object') return;
              
              Object.keys(obj).forEach(key => {
                const value = obj[key];
                
                // 如果是日期对象，转换为ISO字符串
                if (value instanceof Date) {
                  obj[key] = value.toISOString();
                }
                // 如果是数组，递归处理每个元素
                else if (Array.isArray(value)) {
                  value.forEach((item, index) => {
                    if (item instanceof Date) {
                      value[index] = item.toISOString();
                    } else if (typeof item === 'object' && item !== null) {
                      processDateInObject(item);
                    }
                  });
                }
                // 如果是对象，递归处理
                else if (typeof value === 'object' && value !== null) {
                  processDateInObject(value);
                }
              });
            };
            
            processDateInObject(data);
          }
          
          resolve(data);
        } catch (error) {
          console.error('生成模拟数据失败', error);
          reject(error);
        }
      }, delay);
    }
  });
}

/**
 * 验证图表数据
 * @param {Array} xData x轴数据
 * @param {Array} series 系列数据
 * @returns {Boolean} 数据是否有效
 */
export function validateChartData(xData, series) {
  if (!Array.isArray(xData) || !Array.isArray(series)) {
    console.warn('图表数据格式错误: xData和series必须是数组')
    return false
  }
  
  if (xData.length === 0) {
    console.warn('x轴数据为空')
    return false
  }
  
  for (let i = 0; i < series.length; i++) {
    const item = series[i]
    if (!item || !Array.isArray(item.data)) {
      console.warn(`系列数据格式错误: series[${i}]`)
      return false
    }
    
    if (item.data.length !== xData.length) {
      console.warn(`数据长度不匹配: xData(${xData.length}) vs series[${i}].data(${item.data.length})`)
      return false
    }
  }
  
  return true
}

/**
 * 清理图表数据
 * @param {Array} xData x轴数据
 * @param {Array} series 系列数据
 * @returns {Object} 清理后的数据
 */
export function cleanChartData(xData, series) {
  // 确保xData是字符串数组
  const cleanXData = xData.map(item => {
    if (item instanceof Date) {
      return item.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    }
    return String(item)
  })
  
  // 确保series数据是数字数组，且保留两位小数
  const cleanSeries = series.map(item => ({
    ...item,
    data: item.data.map(value => {
      const num = parseFloat(value)
      // 确保所有数值保留两位小数
      return isNaN(num) ? 0 : parseFloat(num.toFixed(2))
    })
  }))
  
  return { xData: cleanXData, series: cleanSeries }
}

/**
 * 获取折线图配置
 * @param {String} title 图表标题
 * @param {Array} xData x轴数据
 * @param {Array} series 系列数据
 * @param {Object} customOptions 自定义配置项，用于覆盖默认配置
 * @returns {Object} ECharts配置项
 */
export function getLineChartOption(title, xData, series, customOptions = {}) {
  // 验证数据
  if (!validateChartData(xData, series)) {
    console.error('图表数据验证失败，返回默认配置')
    return {
      title: { text: title, left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: []
    }
  }
  
  // 清理数据
  const { xData: cleanXData, series: cleanSeries } = cleanChartData(xData, series)

  // 默认配置
  const defaultOptions = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params) {
        if (!params || params.length === 0) return '';
        
        // 使用 ECharts 原生格式，避免 HTML 标签
        let result = params[0].axisValue;
        
        params.forEach(param => {
          if (param.seriesName && param.value !== undefined) {
            const value = typeof param.value === 'number' ? param.value.toFixed(2) : param.value;
            // 使用换行符替代 <br>
            result += '\n' + param.seriesName + ': ' + value;
          }
        });
        
        return result;
      }
    },
    legend: {
      data: cleanSeries.map(item => item.name),
      bottom: 0,
      type: 'scroll',
      pageButtonItemGap: 5,
      pageButtonGap: 5,
      pageButtonPosition: 'end',
      pageIconColor: '#666',
      pageIconInactiveColor: '#aaa',
      pageIconSize: 12,
      pageTextStyle: {
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      top: '15%',
      containLabel: true,
      show: false,
      borderWidth: 0
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: cleanXData,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10,
        margin: 14,
        align: 'right',
        verticalAlign: 'middle'
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value'
    },
    series: cleanSeries.map(item => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: true,
      showSymbol: true,
      symbolSize: 6,
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        borderWidth: 2
      }
    }))
  }

  // 合并自定义配置
  const mergeConfig = (target, source) => {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        mergeConfig(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
  };

  // 深度合并配置
  const finalOptions = JSON.parse(JSON.stringify(defaultOptions));
  if (customOptions) {
    mergeConfig(finalOptions, customOptions);
  }

  return finalOptions;
}

/**
 * 获取热力图配置
 * @param {String} title 图表标题
 * @param {Array} data 热力图数据
 * @returns {Object} ECharts配置项
 */
export function getHeatmapOption(title, data, xData, yData) {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      position: 'top',
      formatter: function(params) {
        if (params.data && Array.isArray(params.data) && params.data.length >= 3) {
          // 使用换行符而不是 HTML 标签
          return '温度: ' + params.data[2].toFixed(2) + '°C\n' + 
                 '时间: ' + xData[params.data[0]] + '\n' + 
                 '日期: ' + yData[params.data[1]];
        }
        return params.value || '';
      }
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
      data: xData,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: yData,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      type: 'continuous',
      min: -10,
      max: 50,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      precision: 0,
      dimension: 2,
      itemWidth: 15,
      itemHeight: 100,
      textStyle: {
        fontSize: 12
      },
      inverse: false/*,
      text: ['-10°C', '50°C']*/,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    series: [{
      name: title,
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
}

/**
 * 获取雷达图配置
 * @param {String} title 图表标题
 * @param {Array} indicators 指标配置
 * @param {Array} series 系列数据
 * @returns {Object} ECharts配置项
 */
export function getRadarChartOption(title, indicators, series) {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (!params || !params.value) return '';
        
        // 使用纯文本格式，避免HTML标签
        let result = params.name;
        
        if (Array.isArray(params.value)) {
          for (let i = 0; i < indicators.length; i++) {
            if (params.value[i] !== undefined) {
              // 使用换行符而非HTML标签，保留两位小数
              result += '\n' + indicators[i].name + ': ' + params.value[i].toFixed(2) + '分';
            }
          }
        }
        
        return result;
      }
    },
    legend: {
      bottom: 0,
      data: series.map(item => item.name)
    },
    radar: {
      indicator: indicators,
      radius: '65%',
      shape: 'circle',
      splitNumber: 5,
      nameGap: 15,
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(250, 250, 250, 0.1)', 'rgba(200, 200, 200, 0.1)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(200, 200, 200, 0.3)'
        }
      }
    },
    series: [{
      type: 'radar',
      data: series,
      lineStyle: {
        width: 2
      },
      emphasis: {
        lineStyle: {
          width: 4
        }
      },
      areaStyle: {
        opacity: 0.2
      }
    }]
  }
}

/**
 * 获取柱状图配置
 * @param {String} title 图表标题
 * @param {Array} xData x轴数据
 * @param {Array} series 系列数据
 * @returns {Object} ECharts配置项
 */
export function getBarChartOption(title, xData, series) {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        if (!params || params.length === 0) return '';
        
        // 使用换行符替代 HTML 标签
        let result = params[0].axisValue;
        
        params.forEach(param => {
          if (param.seriesName && param.value !== undefined) {
            const value = typeof param.value === 'number' ? param.value.toFixed(2) : param.value;
            result += '\n' + param.seriesName + ': ' + value;
          }
        });
        
        return result;
      }
    },
    legend: {
      data: series.map(item => item.name),
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
      data: xData,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value'
    },
    series: series.map(item => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      emphasis: {
        focus: 'series'
      }
    }))
  }
} 