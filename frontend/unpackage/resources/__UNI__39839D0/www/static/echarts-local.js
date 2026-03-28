// 本地ECharts加载脚本
// 如果CDN加载失败，这个脚本会尝试从其他来源加载ECharts

console.log('正在加载本地ECharts脚本');

(function() {
  // 检查ECharts是否已经加载
  if (window.echarts) {
    console.log('ECharts已经加载，版本:', window.echarts.version);
    return;
  }
  
  // 尝试加载的CDN源
  const cdnSources = [
    'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js',
    'https://cdn.bootcdn.net/ajax/libs/echarts/5.4.3/echarts.min.js',
    'https://unpkg.com/echarts@5.4.3/dist/echarts.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js'
  ];
  
  // 当前尝试的索引
  let currentIndex = 0;
  
  // 尝试加载ECharts
  function tryLoadECharts() {
    if (currentIndex >= cdnSources.length) {
      console.error('所有CDN源都加载失败，尝试加载本地静态文件');
      // 尝试加载本地静态文件
      const script = document.createElement('script');
      script.src = './static/echarts.js';
      
      script.onload = function() {
        console.log('成功从本地静态文件加载ECharts');
        // 加载成功后，尝试初始化所有图表
        initAllCharts();
      };
      
      script.onerror = function() {
        console.error('本地静态文件加载失败，显示错误信息');
        // 显示错误信息
        showLoadError();
      };
      
      document.head.appendChild(script);
      return;
    }
    
    const source = cdnSources[currentIndex];
    console.log(`尝试从 ${source} 加载ECharts`);
    
    const script = document.createElement('script');
    script.src = source;
    
    script.onload = function() {
      console.log(`成功从 ${source} 加载ECharts`);
      // 加载成功后，尝试初始化所有图表
      initAllCharts();
    };
    
    script.onerror = function() {
      console.warn(`从 ${source} 加载ECharts失败，尝试下一个源`);
      currentIndex++;
      tryLoadECharts();
    };
    
    document.head.appendChild(script);
  }
  
  // 初始化所有图表
  function initAllCharts() {
    // 查找所有图表容器
    const chartContainers = document.querySelectorAll('[id$="-chart"]');
    console.log(`找到 ${chartContainers.length} 个图表容器`);
    
    chartContainers.forEach(container => {
      try {
        // 检查是否有存储的选项
        const chartId = container.id;
        const optionKey = `echarts_option_${chartId}`;
        const storedOption = window[optionKey];
        
        if (storedOption) {
          console.log(`为 ${chartId} 找到存储的选项`);
          const chart = window.echarts.init(container);
          chart.setOption(storedOption);
          console.log(`成功初始化图表 ${chartId}`);
        } else {
          console.warn(`没有为 ${chartId} 找到存储的选项`);
        }
      } catch (error) {
        console.error(`初始化图表 ${container.id} 失败:`, error);
      }
    });
    
    // 通知应用ECharts已准备就绪
    if (typeof uni !== 'undefined') {
      uni.$emit('echarts-ready');
    }
    
    // 设置全局状态
    window.ECHARTS_LOADING_STATUS = 'loaded';
  }
  
  // 显示加载错误
  function showLoadError() {
    // 查找所有图表容器
    const chartContainers = document.querySelectorAll('[id$="-chart"]');
    
    chartContainers.forEach(container => {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #f56c6c; background: #fef0f0; height: 100%;">
          <p style="margin: 0; padding-top: 50px;">无法加载图表库</p>
          <p style="margin: 10px 0; font-size: 12px;">请检查网络连接并刷新页面</p>
        </div>
      `;
    });
    
    // 设置全局状态
    window.ECHARTS_LOADING_STATUS = 'failed';
    
    // 尝试加载回退方案
    const fallbackScript = document.createElement('script');
    fallbackScript.src = './static/echarts-fallback.js';
    document.head.appendChild(fallbackScript);
  }
  
  // 开始尝试加载
  tryLoadECharts();
  
  // 提供一个全局方法，用于存储图表选项
  window.storeChartOption = function(chartId, option) {
    const optionKey = `echarts_option_${chartId}`;
    window[optionKey] = option;
    console.log(`已存储图表 ${chartId} 的选项`);
  };
})(); 