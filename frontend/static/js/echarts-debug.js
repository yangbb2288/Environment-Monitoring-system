/**
 * ECharts调试辅助脚本
 * 用于检查和修复ECharts渲染问题
 */

console.log('ECharts调试脚本已加载');

(function() {
  // 检查ECharts是否可用
  function checkECharts() {
    if (window.echarts) {
      console.log('✅ ECharts可用，版本:', window.echarts.version);
      return true;
    } else {
      console.error('❌ ECharts不可用');
      return false;
    }
  }

  // 检查DOM元素
  function checkDomElement(id) {
    const dom = document.getElementById(id);
    if (dom) {
      const width = dom.clientWidth;
      const height = dom.clientHeight;
      console.log(`✅ DOM元素 ${id} 存在，尺寸: ${width}x${height}`);
      
      if (width === 0 || height === 0) {
        console.warn(`⚠️ DOM元素 ${id} 尺寸为0，可能影响渲染`);
        return false;
      }
      return true;
    } else {
      console.error(`❌ DOM元素 ${id} 不存在`);
      return false;
    }
  }

  // 尝试手动初始化图表
  function initChart(id, option) {
    if (!checkECharts()) return null;
    if (!checkDomElement(id)) return null;
    
    try {
      // 如果已有实例，先销毁
      const existingChart = echarts.getInstanceByDom(document.getElementById(id));
      if (existingChart) {
        console.log(`销毁已有图表实例 ${id}`);
        existingChart.dispose();
      }
      
      // 创建新实例
      console.log(`创建新图表实例 ${id}`);
      const chart = echarts.init(document.getElementById(id));
      
      // 设置选项
      if (option) {
        console.log(`设置图表选项 ${id}`);
        chart.setOption(option);
      } else {
        console.warn(`未提供图表选项 ${id}`);
      }
      
      console.log(`✅ 图表 ${id} 初始化成功`);
      return chart;
    } catch (error) {
      console.error(`❌ 图表 ${id} 初始化失败:`, error);
      return null;
    }
  }

  // 修复所有图表
  function fixAllCharts() {
    console.log('尝试修复所有图表...');
    
    // 查找所有图表容器
    const chartContainers = document.querySelectorAll('[id$="-chart"]');
    console.log(`找到 ${chartContainers.length} 个图表容器`);
    
    chartContainers.forEach(container => {
      const id = container.id;
      const optionKey = `echarts_option_${id}`;
      const option = window[optionKey];
      
      if (option) {
        console.log(`为 ${id} 找到存储的选项`);
        initChart(id, option);
      } else {
        console.warn(`没有为 ${id} 找到存储的选项`);
      }
    });
  }

  // 显示图表状态
  function showChartsStatus() {
    console.log('图表状态检查:');
    
    // 查找所有图表容器
    const chartContainers = document.querySelectorAll('[id$="-chart"]');
    console.log(`找到 ${chartContainers.length} 个图表容器`);
    
    chartContainers.forEach(container => {
      const id = container.id;
      checkDomElement(id);
      
      const instance = echarts.getInstanceByDom(container);
      if (instance) {
        console.log(`✅ 图表 ${id} 已初始化`);
      } else {
        console.warn(`⚠️ 图表 ${id} 未初始化`);
      }
    });
  }

  // 导出全局函数
  window.echartsDebug = {
    checkECharts,
    checkDomElement,
    initChart,
    fixAllCharts,
    showChartsStatus
  };
  
  // 页面加载完成后自动检查
  window.addEventListener('load', function() {
    setTimeout(() => {
      console.log('ECharts调试: 页面加载完成，开始检查...');
      checkECharts();
      
      // 查找所有图表容器
      const chartContainers = document.querySelectorAll('[id$="-chart"]');
      console.log(`找到 ${chartContainers.length} 个图表容器`);
      
      chartContainers.forEach(container => {
        checkDomElement(container.id);
      });
    }, 2000);
  });
  
  console.log('ECharts调试工具已准备就绪，使用 window.echartsDebug 访问');
})(); 