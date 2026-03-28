<template>
  <el-card class="date-range-picker">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
      </div>
    </template>
    <div class="picker-container">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="onRangeChange"
      />
    </div>
    <div class="quick-select">
      <el-button size="small" @click="selectRange('today')">今天</el-button>
      <el-button size="small" @click="selectRange('yesterday')">昨天</el-button>
      <el-button size="small" @click="selectRange('week')">本周</el-button>
      <el-button size="small" @click="selectRange('month')">本月</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatDate } from '../utils/date'

const props = defineProps({
  title: {
    type: String,
    default: '选择日期范围'
  },
  startDate: {
    type: Date,
    default: () => new Date()
  },
  endDate: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['update:startDate', 'update:endDate', 'change'])

const dateRange = ref([
  formatDate(props.startDate, 'YYYY-MM-DD'),
  formatDate(props.endDate, 'YYYY-MM-DD')
])

// 监听props变化
watch(() => props.startDate, (newVal) => {
  dateRange.value[0] = formatDate(newVal, 'YYYY-MM-DD')
})

watch(() => props.endDate, (newVal) => {
  dateRange.value[1] = formatDate(newVal, 'YYYY-MM-DD')
})

const onRangeChange = (val) => {
  if (!val) return
  
  const startDate = new Date(val[0])
  const endDate = new Date(val[1])
  
  emit('update:startDate', startDate)
  emit('update:endDate', endDate)
  emit('change', { startDate, endDate })
}

const selectRange = (type) => {
  const now = new Date()
  let start = new Date()
  let end = new Date()
  
  switch (type) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'yesterday':
      start.setDate(now.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(now.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      const day = now.getDay() || 7
      start.setDate(now.getDate() - day + 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
  }
  
  dateRange.value = [
    formatDate(start, 'YYYY-MM-DD'),
    formatDate(end, 'YYYY-MM-DD')
  ]
  
  emit('update:startDate', start)
  emit('update:endDate', end)
  emit('change', { startDate: start, endDate: end })
}
</script>

<style lang="scss" scoped>
.date-range-picker {
  margin-bottom: 20rpx;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .picker-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20rpx;
    
    :deep(.el-date-editor) {
      width: 100%;
    }
  }
  
  .quick-select {
    display: flex;
    justify-content: space-between;
    gap: 10rpx;
  }
}
</style> 