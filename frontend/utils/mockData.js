/**
 * 模拟数据生成工具
 * 用于生成测试图表显示的假数据
 */

/**
 * 生成指定范围内的随机数
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 * @param {Boolean} isInteger 是否为整数
 * @param {Number} seed 随机种子 (可选)
 * @returns {Number} 随机数
 */
function randomBetween(min, max, isInteger = false, seed = null) {
  // 使用种子或标准随机数
  let random;
  if (seed !== null) {
    // 简单的伪随机数生成
    random = (Math.sin(seed) * 10000) % 1;
    random = Math.abs(random);
  } else {
    random = Math.random();
  }
  
  const value = random * (max - min) + min;
  return isInteger ? Math.round(value) : Number(value.toFixed(1));
}

// 为每个传感器生成的随机种子，确保相同传感器生成相似数据
const sensorSeeds = {};

// 用于模拟API调用的延迟时间 (毫秒)
const API_DELAY = 300;

/**
 * 为传感器ID生成一致的随机种子
 * @param {String} sensorId 传感器ID
 * @returns {Object} 随机种子对象
 */
function getSensorSeed(sensorId) {
  if (!sensorSeeds[sensorId]) {
    // 为传感器生成一个独特但一致的特征
    sensorSeeds[sensorId] = {
      tempBase: randomBetween(19, 25, false),    // 基础温度 (19-25°C)
      tempVariation: randomBetween(5, 10, false), // 温度变化幅度
      humidityBase: randomBetween(45, 65, false), // 基础湿度
      aqiBase: randomBetween(40, 90, true),       // 基础空气质量
      noiseBase: randomBetween(35, 50, false),    // 基础噪音
      co2Base: randomBetween(380, 450, true),     // 基础CO2
      lightBase: randomBetween(600, 1000, true),  // 基础光照
      pattern: Math.floor(Math.random() * 3)      // 数据模式 (0-2)
    };
  }
  return sensorSeeds[sensorId];
}

/**
 * 生成随机传感器数据
 * @param {Number} count 数据点数量
 * @returns {Array} 传感器数据数组
 */
export function generateSensors(count = 10) {
  const locations = ['办公室', '会议室', '生产车间', '仓库', '实验室', '休息区', '餐厅', '户外', '大厅', '走廊']
  const types = ['温湿度传感器', '空气质量传感器', '综合环境传感器', '噪声传感器', '光照传感器']
  const statuses = ['online', 'offline', 'maintenance']
  
  return Array.from({ length: count }, (_, index) => {
    const id = `S${String(index + 1).padStart(3, '0')}`
    return {
      id: index + 1,
      sensorId: id,
      name: `传感器 ${id}`,
      type: types[Math.floor(Math.random() * types.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      latitude: randomBetween(22, 40, false),
      longitude: randomBetween(100, 130, false),
      status: statuses[Math.floor(Math.random() * (statuses.length - 1))], // 大部分在线
      createdAt: new Date(Date.now() - randomBetween(30, 365, true) * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }
  })
}

/**
 * 生成随机环境数据
 * @param {String} sensorId 传感器ID
 * @param {Number} count 数据点数量
 * @param {Date|String} startTime 开始时间
 * @param {Date|String} endTime 结束时间
 * @returns {Array} 环境数据数组
 */
export function generateEnvData(sensorId, count = 24, startTime = new Date(Date.now() - 24 * 60 * 60 * 1000), endTime = new Date()) {
  // 确保startTime和endTime是有效的Date对象
  try {
    if (!(startTime instanceof Date)) {
      startTime = new Date(startTime);
    }
    
    if (!(endTime instanceof Date)) {
      endTime = new Date(endTime);
    }
    
    // 验证日期是否有效
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('无效的日期参数', { startTime, endTime });
      // 使用默认值
      startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      endTime = new Date();
    }
  } catch (error) {
    console.error('日期处理错误', error);
    // 使用默认值
    startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    endTime = new Date();
  }
  
  const timeInterval = (endTime - startTime) / count
  
  // 获取或生成传感器的一致性种子
  const seed = getSensorSeed(sensorId);
  
  return Array.from({ length: count }, (_, index) => {
    const timestamp = new Date(startTime.getTime() + timeInterval * index)
    // 根据时间生成有规律的数据
    const hour = timestamp.getHours()
    const dayProgress = (hour / 24); // 0-1表示一天中的进度
    
    // 基于传感器特性和时间生成数据
    // 温度在白天高，晚上低，但保持传感器特征的一致性
    let tempVariation;
    if (seed.pattern === 0) {
      // 标准模式：正弦曲线
      tempVariation = Math.sin((hour - 6) * Math.PI / 12) * seed.tempVariation;
    } else if (seed.pattern === 1) {
      // 双峰模式：早晨和下午各有一个峰值
      tempVariation = (Math.sin((hour - 4) * Math.PI / 8) + Math.sin((hour - 16) * Math.PI / 8)) * seed.tempVariation / 2;
    } else {
      // 平稳模式：变化更小
      tempVariation = Math.sin((hour - 6) * Math.PI / 12) * seed.tempVariation / 2;
    }
    
    const temperature = Number((seed.tempBase + tempVariation + randomBetween(-0.5, 0.5, false)).toFixed(1));
    
    // 湿度与温度成反比
    const humidityVariation = -Math.sin((hour - 6) * Math.PI / 12) * 15;
    const humidity = Number((seed.humidityBase + humidityVariation + randomBetween(-3, 3, false)).toFixed(1));
    
    // 空气质量基于一天中的时间和传感器特性
    let aqiVariation;
    if (seed.pattern === 0) {
      // 标准模式：早晚高峰
      aqiVariation = (Math.sin((hour - 8) * Math.PI / 12) + Math.sin((hour - 17) * Math.PI / 12)) * 20;
    } else if (seed.pattern === 1) {
      // 高污染模式
      aqiVariation = Math.sin(hour * Math.PI / 12) * 30 + 15;
    } else {
      // 低污染模式
      aqiVariation = Math.sin(hour * Math.PI / 12) * 10;
    }
    
    const airQuality = Math.max(10, Math.round(seed.aqiBase + aqiVariation + randomBetween(-5, 5, true)));
    
    // PM2.5与空气质量相关
    const pm25 = Number((airQuality * 0.6 + randomBetween(-3, 3, false)).toFixed(1));
    
    // PM10与PM2.5相关
    const pm10 = Number((pm25 * 1.5 + randomBetween(-5, 5, false)).toFixed(1));
    
    // CO2在人多的时候高
    let co2Variation;
    if (hour >= 9 && hour <= 18) {
      // 工作时间CO2较高
      co2Variation = randomBetween(50, 200, true);
    } else {
      co2Variation = randomBetween(0, 50, true);
    }
    const co2 = seed.co2Base + co2Variation;
    
    // 噪声在工作时间高
    let noiseVariation;
    if (hour >= 9 && hour <= 18) {
      // 工作时间噪音较高
      noiseVariation = randomBetween(10, 25, false);
    } else {
      noiseVariation = randomBetween(0, 10, false);
    }
    const noise = Number((seed.noiseBase + noiseVariation).toFixed(1));
    
    // 光照随太阳变化
    let light;
    if (hour >= 6 && hour <= 18) {
      // 白天有阳光
      const lightCurve = Math.sin((hour - 6) * Math.PI / 12);
      light = Math.round(seed.lightBase * lightCurve + randomBetween(50, 150, true));
    } else {
      // 夜间光照低
      light = randomBetween(20, 100, true);
    }
    
    return {
      id: index + 1,
      sensorId,
      temperature,
      humidity,
      airQuality,
      pm25,
      pm10,
      co2,
      noise,
      light,
      timestamp,
      createdAt: new Date()
    }
  })
}

/**
 * 生成聚合数据
 * @param {String} sensorId 传感器ID
 * @param {Date} startTime 开始时间
 * @param {Date} endTime 结束时间
 * @param {String} groupBy 分组方式
 * @returns {Array} 聚合数据数组
 */
export function generateAggregatedData(sensorId, startTime, endTime, groupBy = 'daily') {
  let count
  let format
  
  switch (groupBy) {
    case 'hourly':
      count = Math.ceil((endTime - startTime) / (60 * 60 * 1000))
      format = 'MM-DD HH:00'
      break
    case 'daily':
      count = Math.ceil((endTime - startTime) / (24 * 60 * 60 * 1000))
      format = 'YYYY-MM-DD'
      break
    case 'weekly':
      count = Math.ceil((endTime - startTime) / (7 * 24 * 60 * 60 * 1000))
      format = 'YYYY-WW周'
      break
    case 'monthly':
      count = Math.ceil((endTime - startTime) / (30 * 24 * 60 * 60 * 1000))
      format = 'YYYY-MM'
      break
    default:
      count = 30
      format = 'YYYY-MM-DD'
  }
  
  return Array.from({ length: count }, (_, index) => {
    const timestamp = new Date(startTime.getTime() + (endTime - startTime) / count * index)
    
    return {
      timestamp,
      timeLabel: formatTimeByGroup(timestamp, groupBy),
      avgTemperature: randomBetween(18, 28, false),
      avgHumidity: randomBetween(40, 70, false),
      avgAirQuality: randomBetween(30, 120, true),
      avgPm25: randomBetween(20, 80, false),
      maxTemperature: randomBetween(25, 35, false),
      minTemperature: randomBetween(15, 25, false),
      maxHumidity: randomBetween(60, 90, false),
      minHumidity: randomBetween(30, 50, false),
      count: randomBetween(20, 100, true)
    }
  })
}

/**
 * 根据分组方式格式化时间
 * @param {Date} date 日期对象
 * @param {String} groupBy 分组方式
 * @returns {String} 格式化后的时间字符串
 */
function formatTimeByGroup(date, groupBy) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  
  switch (groupBy) {
    case 'hourly':
      return `${month}-${day} ${hour}:00`
    case 'daily':
      return `${year}-${month}-${day}`
    case 'weekly': {
      // 简单计算周数
      const firstDay = new Date(date.getFullYear(), 0, 1)
      const weekNumber = Math.ceil(((date - firstDay) / 86400000 + firstDay.getDay() + 1) / 7)
      return `${year}-${String(weekNumber).padStart(2, '0')}周`
    }
    case 'monthly':
      return `${year}-${month}`
    default:
      return `${year}-${month}-${day}`
  }
}

/**
 * 生成异常数据点
 * @param {Array} data 原始数据
 * @param {Number} anomalyCount 异常点数量
 * @returns {Array} 添加异常点后的数据
 */
export function generateAnomalies(data, anomalyCount = 3) {
  const result = [...data]
  const indices = []
  
  // 随机选择几个点作为异常点
  while (indices.length < anomalyCount && indices.length < data.length * 0.2) {
    const index = Math.floor(Math.random() * data.length)
    if (!indices.includes(index)) {
      indices.push(index)
    }
  }
  
  // 修改这些点的值使其成为异常点
  indices.forEach(index => {
    const multiplier = Math.random() > 0.5 ? 1.5 : 0.5
    result[index] = {
      ...result[index],
      temperature: result[index].temperature * multiplier,
      humidity: result[index].humidity * (2 - multiplier),
      airQuality: result[index].airQuality * multiplier,
      pm25: result[index].pm25 * multiplier
    }
  })
  
  return result
}

/**
 * 生成相关性数据
 * @returns {Object} 相关性数据
 */
export function generateCorrelationData() {
  return {
    temperature_humidity: randomBetween(-0.8, -0.4, false),
    temperature_airQuality: randomBetween(0.3, 0.7, false),
    temperature_pm25: randomBetween(0.2, 0.6, false),
    humidity_airQuality: randomBetween(-0.5, -0.1, false),
    humidity_pm25: randomBetween(-0.6, -0.2, false),
    airQuality_pm25: randomBetween(0.7, 0.9, false)
  }
}

/**
 * 生成温度分布数据
 * @returns {Object} 温度分布数据
 */
export function generateTemperatureDistribution() {
  const distribution = {}
  
  // 生成正态分布的温度数据
  for (let i = 0; i < 200; i++) {
    // 使用Box-Muller转换生成正态分布随机数
    const u = 1 - Math.random()
    const v = 1 - Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    
    // 均值为22，标准差为5的正态分布
    const temp = Math.round(22 + z * 5)
    
    if (temp >= 0 && temp <= 40) {
      if (!distribution[temp]) {
        distribution[temp] = 0
      }
      distribution[temp]++
    }
  }
  
  return distribution
}

/**
 * 生成24小时变化规律数据
 * @returns {Object} 24小时变化规律数据
 */
export function generateDailyPattern() {
  return {
    hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    temperature: Array.from({ length: 24 }, (_, i) => {
      const baseTemp = 22
      const variation = Math.sin((i - 6) * Math.PI / 12) * 8
      return randomBetween(baseTemp + variation - 1, baseTemp + variation + 1, false)
    }),
    humidity: Array.from({ length: 24 }, (_, i) => {
      const baseHumidity = 50
      const variation = -Math.sin((i - 6) * Math.PI / 12) * 20
      return randomBetween(baseHumidity + variation - 5, baseHumidity + variation + 5, false)
    }),
    airQuality: Array.from({ length: 24 }, (_, i) => {
      const baseAQI = 50
      const variation = (Math.sin((i - 8) * Math.PI / 12) + Math.sin((i - 17) * Math.PI / 12)) * 25
      return randomBetween(baseAQI + variation - 10, baseAQI + variation + 10, true)
    })
  }
}

/**
 * 生成多传感器对比数据
 * @param {Array} sensorIds 传感器ID数组
 * @param {Number} count 数据点数量
 * @returns {Object} 多传感器对比数据
 */
export function generateComparisonData(sensorIds, count = 24) {
  const times = Array.from({ length: count }, (_, i) => {
    const date = new Date()
    date.setHours(date.getHours() - (count - i))
    return date
  })
  
  const result = {}
  
  sensorIds.forEach(sensorId => {
    const baseTemp = randomBetween(18, 25, false)
    const baseHumidity = randomBetween(40, 60, false)
    const baseAQI = randomBetween(40, 80, true)
    
    result[sensorId] = {
      temperature: times.map((_, i) => {
        const hour = (new Date().getHours() - (count - i) + 24) % 24
        const variation = Math.sin((hour - 6) * Math.PI / 12) * 5
        return randomBetween(baseTemp + variation - 1, baseTemp + variation + 1, false)
      }),
      humidity: times.map((_, i) => {
        const hour = (new Date().getHours() - (count - i) + 24) % 24
        const variation = -Math.sin((hour - 6) * Math.PI / 12) * 15
        return randomBetween(baseHumidity + variation - 5, baseHumidity + variation + 5, false)
      }),
      airQuality: times.map((_, i) => {
        const hour = (new Date().getHours() - (count - i) + 24) % 24
        const variation = (Math.sin((hour - 8) * Math.PI / 12) + Math.sin((hour - 17) * Math.PI / 12)) * 20
        return randomBetween(baseAQI + variation - 10, baseAQI + variation + 10, true)
      })
    }
  })
  
  return {
    times: times.map(t => {
      const hours = t.getHours().toString().padStart(2, '0')
      const minutes = t.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }),
    data: result
  }
} 