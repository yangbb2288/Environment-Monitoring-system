<template>
  <el-card class="data-card" :class="{ 'warning': isWarning, 'danger': isDanger }">
    <view class="card-header">
      <text class="title">{{ title }}</text>
      <text class="unit">{{ unit }}</text>
    </view>
    <view class="card-body">
      <text class="value">{{ formattedValue }}</text>
    </view>
    <view class="card-footer" v-if="showTrend">
      <view class="trend" :class="trendClass">
        <el-icon v-if="trend > 0"><CaretTop /></el-icon>
        <el-icon v-else-if="trend < 0"><CaretBottom /></el-icon>
        <el-icon v-else><DArrowRight /></el-icon>
        <text class="trend-value">{{ trendValue }}</text>
      </view>
    </view>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { CaretTop, CaretBottom, DArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
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
  warningThreshold: {
    type: Number,
    default: null
  },
  dangerThreshold: {
    type: Number,
    default: null
  },
  precision: {
    type: Number,
    default: 1
  },
  trend: {
    type: Number,
    default: 0
  },
  showTrend: {
    type: Boolean,
    default: true
  }
})

// 格式化数值
const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toFixed(props.precision)
  }
  return props.value
})

// 是否警告状态
const isWarning = computed(() => {
  if (props.warningThreshold === null) return false
  return props.value >= props.warningThreshold && 
         (props.dangerThreshold === null || props.value < props.dangerThreshold)
})

// 是否危险状态
const isDanger = computed(() => {
  if (props.dangerThreshold === null) return false
  return props.value >= props.dangerThreshold
})

// 趋势值
const trendValue = computed(() => {
  if (props.trend === 0) return '持平'
  const absValue = Math.abs(props.trend).toFixed(props.precision)
  return props.trend > 0 ? `+${absValue}` : `-${absValue}`
})

// 趋势类名
const trendClass = computed(() => {
  if (props.trend > 0) return 'up'
  if (props.trend < 0) return 'down'
  return 'flat'
})
</script>

<style lang="scss" scoped>
.data-card {
  margin-bottom: 20rpx;
  position: relative;
  overflow: hidden;
  
  &.warning {
    :deep(.el-card__body) {
      &::before {
        background-color: var(--el-color-warning);
      }
    }
    
    .value {
      color: var(--el-color-warning);
    }
  }
  
  &.danger {
    :deep(.el-card__body) {
      &::before {
        background-color: var(--el-color-danger);
      }
    }
    
    .value {
      color: var(--el-color-danger);
    }
  }
  
  :deep(.el-card__body) {
    padding: 15rpx 20rpx;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: var(--el-color-primary);
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
    
    .title {
      font-size: 28rpx;
      color: var(--el-text-color-regular);
    }
    
    .unit {
      font-size: 24rpx;
      color: var(--el-text-color-secondary);
    }
  }
  
  .card-body {
    margin-bottom: 10rpx;
    
    .value {
      font-size: 40rpx;
      font-weight: bold;
      color: var(--el-text-color-primary);
    }
  }
  
  .card-footer {
    .trend {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      
      &.up {
        color: var(--el-color-danger);
      }
      
      &.down {
        color: var(--el-color-success);
      }
      
      &.flat {
        color: var(--el-color-info);
      }
      
      .trend-value {
        margin-left: 6rpx;
      }
    }
  }
}
</style> 