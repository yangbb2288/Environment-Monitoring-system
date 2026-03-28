// ECharts回退脚本
// 如果主要的ECharts加载失败，这个脚本提供一个简单的替代方案

console.log('Loading ECharts fallback script');

// 检查是否已经有全局echarts对象
if (!window.echarts) {
  // 创建一个简单的替代对象
  window.echarts = {
    version: 'fallback',
    
    // 初始化函数
    init: function(dom) {
      console.log('Using ECharts fallback for:', dom.id);
      
      // 创建一个简单的图表对象
      const chart = {
        dom: dom,
        options: null,
        
        // 设置选项
        setOption: function(option) {
          this.options = option;
          this.render();
        },
        
        // 简单渲染
        render: function() {
          if (!this.options) return;
          
          // 清空容器
          this.dom.innerHTML = '';
          
          // 创建标题
          if (this.options.title && this.options.title.text) {
            const title = document.createElement('div');
            title.style.textAlign = 'center';
            title.style.fontWeight = 'bold';
            title.style.padding = '10px';
            title.innerText = this.options.title.text;
            this.dom.appendChild(title);
          }
          
          // 创建图例
          if (this.options.legend && this.options.legend.data) {
            const legend = document.createElement('div');
            legend.style.textAlign = 'center';
            legend.style.padding = '5px';
            
            this.options.legend.data.forEach(item => {
              const span = document.createElement('span');
              span.style.margin = '0 10px';
              span.innerText = item;
              legend.appendChild(span);
            });
            
            this.dom.appendChild(legend);
          }
          
          // 创建简单的数据表格
          if (this.options.series && this.options.series.length > 0) {
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '10px';
            
            // 创建表头
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            // 添加X轴标签列
            const thX = document.createElement('th');
            thX.style.border = '1px solid #ddd';
            thX.style.padding = '8px';
            thX.innerText = 'X轴';
            headerRow.appendChild(thX);
            
            // 添加系列列
            this.options.series.forEach(series => {
              const th = document.createElement('th');
              th.style.border = '1px solid #ddd';
              th.style.padding = '8px';
              th.innerText = series.name || '数据';
              headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // 创建表体
            const tbody = document.createElement('tbody');
            
            // 添加数据行
            if (this.options.xAxis && this.options.xAxis.data) {
              const xData = this.options.xAxis.data;
              
              // 最多显示10行数据
              const maxRows = Math.min(xData.length, 10);
              
              for (let i = 0; i < maxRows; i++) {
                const row = document.createElement('tr');
                
                // 添加X轴标签
                const tdX = document.createElement('td');
                tdX.style.border = '1px solid #ddd';
                tdX.style.padding = '8px';
                tdX.innerText = xData[i];
                row.appendChild(tdX);
                
                // 添加系列数据
                this.options.series.forEach(series => {
                  const td = document.createElement('td');
                  td.style.border = '1px solid #ddd';
                  td.style.padding = '8px';
                  td.innerText = series.data && series.data[i] !== undefined ? series.data[i] : 'N/A';
                  row.appendChild(td);
                });
                
                tbody.appendChild(row);
              }
              
              // 如果数据超过10行，添加省略提示
              if (xData.length > 10) {
                const row = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = this.options.series.length + 1;
                td.style.textAlign = 'center';
                td.style.padding = '8px';
                td.innerText = `... (共${xData.length}行数据)`;
                row.appendChild(td);
                tbody.appendChild(row);
              }
            }
            
            table.appendChild(tbody);
            this.dom.appendChild(table);
          }
          
          // 添加提示信息
          const note = document.createElement('div');
          note.style.textAlign = 'center';
          note.style.padding = '10px';
          note.style.color = '#999';
          note.style.fontSize = '12px';
          note.innerText = '(ECharts加载失败，显示简化视图)';
          this.dom.appendChild(note);
        },
        
        // 空方法
        resize: function() {},
        dispose: function() {},
        on: function() {}
      };
      
      return chart;
    }
  };
  
  console.log('ECharts fallback loaded successfully');
} 