<template>
  <el-card class="stat-card" shadow="hover" :body-style="{ padding: '0' }">
    <div class="card-content" :class="{ 'has-icon': !!icon }">
      <div v-if="icon" class="card-icon" :class="iconColorClass">
        <el-icon :size="28"><component :is="icon" /></el-icon>
      </div>
      <div class="card-data">
        <div class="card-header">
          <span class="card-title">{{ title }}</span>
          <el-tooltip v-if="tooltip" :content="tooltip" placement="top">
            <el-icon><question-filled /></el-icon>
          </el-tooltip>
        </div>
        
        <div class="card-value" :class="valueColorClass">
          <span class="value-text">{{ formattedValue }}</span>
          <span v-if="unit" class="value-unit">{{ unit }}</span>
          
          <div v-if="showTrend" class="trend-indicator" :class="trendClass">
            <el-icon v-if="trend > 0"><top /></el-icon>
            <el-icon v-else-if="trend < 0"><bottom /></el-icon>
            <span class="trend-value">{{ Math.abs(trend) }}%</span>
          </div>
        </div>

        <div v-if="$slots.footer" class="card-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { computed } from 'vue'
import { QuestionFilled, Top, Bottom } from '@element-plus/icons-vue'

export default {
  name: 'StatCard',
  components: {
    QuestionFilled,
    Top,
    Bottom
  },
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: 'primary'
    },
    valueColor: {
      type: String,
      default: ''
    },
    tooltip: {
      type: String,
      default: ''
    },
    trend: {
      type: Number,
      default: null
    },
    progressValue: {
      type: Number,
      default: null
    },
    progressColor: {
      type: String,
      default: ''
    },
    warningThreshold: {
      type: Number,
      default: null
    },
    dangerThreshold: {
      type: Number,
      default: null
    },
    format: {
      type: String,
      default: 'number' // number, currency, percentage
    }
  },
  setup(props) {
    // 图标颜色类
    const iconColorClass = computed(() => {
      if (!props.iconColor) return '';
      return `icon-${props.iconColor}`;
    });
    
    // 值颜色类
    const valueColorClass = computed(() => {
      // 如果有明确设置颜色
      if (props.valueColor) {
        return `text-${props.valueColor}`;
      }
      
      // 根据阈值判断颜色
      const value = Number(props.value);
      
      if (props.dangerThreshold !== null && value >= props.dangerThreshold) {
        return 'text-danger';
      }
      
      if (props.warningThreshold !== null && value >= props.warningThreshold) {
        return 'text-warning';
      }
      
      return '';
    });
    
    // 趋势类
    const trendClass = computed(() => {
      if (props.trend > 0) return 'trend-up';
      if (props.trend < 0) return 'trend-down';
      return '';
    });
    
    // 显示趋势
    const showTrend = computed(() => {
      return props.trend !== null;
    });
    
    // 显示进度条
    const showProgress = computed(() => {
      return props.progressValue !== null;
    });
    
    // 格式化的值
    const formattedValue = computed(() => {
      if (typeof props.value === 'string') {
        return props.value;
      }
      
      const value = Number(props.value);
      
      switch (props.format) {
        case 'currency':
          return value.toLocaleString('zh-CN', { 
            style: 'currency', 
            currency: 'CNY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0 
          });
          
        case 'percentage':
          return `${value.toFixed(1)}%`;
          
        default:
          return value % 1 === 0 ? value.toString() : value.toFixed(1);
      }
    });
    
    return {
      iconColorClass,
      valueColorClass,
      trendClass,
      showTrend,
      showProgress,
      formattedValue
    };
  }
}
</script>

<style lang="scss" scoped>
.stat-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
  }
  
  .card-content {
    display: flex;
    padding: 16px 20px;
    
    &.has-icon {
      padding-left: 16px;
    }
  }
  
  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    flex-shrink: 0;
    
    &.icon-primary {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
    
    &.icon-success {
      background-color: var(--el-color-success-light-9);
      color: var(--el-color-success);
    }
    
    &.icon-warning {
      background-color: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
    }
    
    &.icon-danger {
      background-color: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
    
    &.icon-info {
      background-color: var(--el-color-info-light-9);
      color: var(--el-color-info);
    }
  }
  
  .card-data {
    flex: 1;
    
    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .card-title {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-right: 6px;
      }
    }
    
    .card-value {
      display: flex;
      align-items: baseline;
      margin-bottom: 8px;
      
      .value-text {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        line-height: 1.2;
      }
      
      .value-unit {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-left: 4px;
      }
      
      .trend-indicator {
        display: flex;
        align-items: center;
        margin-left: auto;
        font-size: 13px;
        
        &.trend-up {
          color: var(--el-color-success);
        }
        
        &.trend-down {
          color: var(--el-color-danger);
        }
        
        .trend-value {
          margin-left: 2px;
        }
      }
      
      &.text-primary {
        .value-text {
          color: var(--el-color-primary);
        }
      }
      
      &.text-success {
        .value-text {
          color: var(--el-color-success);
        }
      }
      
      &.text-warning {
        .value-text {
          color: var(--el-color-warning);
        }
      }
      
      &.text-danger {
        .value-text {
          color: var(--el-color-danger);
        }
      }
    }
    
    .card-footer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--el-border-color-lighter);
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style> 