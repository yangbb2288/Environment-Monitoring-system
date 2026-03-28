<template>
  <el-card class="sensor-selector">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
      </div>
    </template>
    <div class="sensor-list">
      <el-checkbox-group v-model="selectedSensors" @change="handleChange">
        <el-checkbox 
          v-for="sensor in sensors" 
          :key="sensor.id" 
          :label="sensor.id"
          :disabled="isDisabled(sensor.id)"
          border>
          {{ sensor.name }} ({{ sensor.location }})
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  title: {
    type: String,
    default: '选择传感器'
  },
  sensors: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: true
  },
  max: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedSensors = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

const isDisabled = (sensorId) => {
  // 如果已达到最大选择数量且当前传感器未被选中，则禁用
  return !props.multiple && selectedSensors.value.length >= props.max && 
         !selectedSensors.value.includes(sensorId)
}

const handleChange = (values) => {
  if (props.multiple) {
    // 限制最大选择数量
    if (values.length > props.max) {
      ElMessage({
        type: 'warning',
        message: `最多选择${props.max}个传感器`
      })
      
      // 恢复到最大数量
      selectedSensors.value = values.slice(0, props.max)
      return
    }
  } else {
    // 单选模式
    selectedSensors.value = values.length > 0 ? [values[values.length - 1]] : []
  }
}
</script>

<style lang="scss" scoped>
.sensor-selector {
  margin-bottom: 20rpx;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .sensor-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    :deep(.el-checkbox) {
      margin-right: 0;
      margin-bottom: 10px;
    }
    
    :deep(.el-checkbox__label) {
      font-size: 26rpx;
    }
  }
}
</style> 