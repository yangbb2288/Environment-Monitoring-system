/**
 * 日期格式化工具
 */

/**
 * 格式化日期
 * @param {Date|String} date 日期对象或字符串
 * @param {String} format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {String} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  // 统一处理日期输入
  let dateObj;
  if (typeof date === 'string') {
    // 处理ISO格式（含T）和普通格式
    if (date.includes('T')) {
      dateObj = new Date(date); // 直接解析ISO格式
    } else {
      dateObj = new Date(date.replace(/-/g, '/')); // 兼容旧格式
    }
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    console.error('Unsupported date type:', date);
    return '';
  }

  // 验证日期有效性
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }

  // 提取时间组件（使用UTC或本地时间）
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hour = dateObj.getHours();
  const minute = dateObj.getMinutes();
  const second = dateObj.getSeconds();

  // 格式化
  return format
    .replace('YYYY', year)
    .replace('MM', padZero(month))
    .replace('DD', padZero(day))
    .replace('HH', padZero(hour))
    .replace('mm', padZero(minute))
    .replace('ss', padZero(second));
}


/**
 * 数字补零
 * @param {Number} num 数字
 * @returns {String} 补零后的字符串
 */
function padZero(num) {
  return num < 10 ? '0' + num : '' + num
}

/**
 * 获取过去N天的日期
 * @param {Number} days 天数
 * @returns {Date} 日期对象
 */
export function getPastDate(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

/**
 * 获取过去N小时的日期
 * @param {Date} fromDate 起始日期，默认为当前时间
 * @param {Number} hours 小时数
 * @returns {Date} 日期对象
 */
export function getPastHours(fromDate = new Date(), hours) {
  // 如果第一个参数是数字，则认为是旧的调用方式
  if (typeof fromDate === 'number') {
    hours = fromDate;
    fromDate = new Date();
  }
  
  const date = new Date(fromDate)
  date.setHours(date.getHours() - hours)
  return date
}

/**
 * 获取日期范围数组
 * @param {Date} startDate 开始日期
 * @param {Date} endDate 结束日期
 * @param {String} format 格式化模板
 * @returns {Array} 日期范围数组
 */
export function getDateRange(startDate, endDate, format = 'MM-DD') {
  const dates = []
  let currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate, format))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * 格式化时间为友好的显示方式
 * @param {Date|String} date 日期对象或字符串
 * @returns {String} 友好的时间显示
 */
export function formatFriendlyTime(date) {
  if (!date) return ''
  
  if (typeof date === 'string') {
    date = new Date(date.replace(/-/g, '/'))
  }
  
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前'
  }
  
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
  }
  
  // 小于30天
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前'
  }
  
  // 其他情况返回标准格式
  return formatDate(date, 'YYYY-MM-DD')
} 