<template>
	<el-button type="primary" @click="dialogVisible = true">选择传感器</el-button>
	
	<el-dialog
	  v-model="dialogVisible"
	  title="选择传感器"
	  width="500px"
	  destroy-on-close
	>
	  <div class="sensor-list">
		<el-checkbox-group v-model="selectedSensorsTemp" @change="handleChange">
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
	  
	  <template #footer>
		<span class="dialog-footer">
		  <el-button @click="dialogVisible = false">取消</el-button>
		  <el-button type="primary" @click="confirmSelection">确定</el-button>
		</span>
	  </template>
	</el-dialog>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  
  const props = defineProps({
	sensors: {
	  type: Array,
	  default: () => []
	},
	modelValue: {
	  type: [Array, String, Number],
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
  
  const dialogVisible = ref(false)
  const selectedSensorsTemp = ref([]) // 临时存储选择的传感器，确认后才更新
  
  // 当对话框打开时，初始化临时选择
  watch(dialogVisible, (val) => {
	if (val) {
	  // 复制当前选择到临时变量
	  selectedSensorsTemp.value = Array.isArray(props.modelValue) 
		? [...props.modelValue] 
		: props.modelValue ? [props.modelValue] : []
	}
  })
  
  const isDisabled = (sensorId) => {
	// 如果已达到最大选择数量且当前传感器未被选中，则禁用
	return !props.multiple && selectedSensorsTemp.value.length >= props.max && 
		   !selectedSensorsTemp.value.includes(sensorId)
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
		selectedSensorsTemp.value = values.slice(0, props.max)
		return
	  }
	} else {
	  // 单选模式
	  selectedSensorsTemp.value = values.length > 0 ? [values[values.length - 1]] : []
	}
  }
  
  // 确认选择
  const confirmSelection = () => {
	const result = props.multiple ? selectedSensorsTemp.value : (selectedSensorsTemp.value[0] || '')
	emit('update:modelValue', result)
	emit('change', result)
	dialogVisible.value = false
	
	// 显示选择结果
	const selectedCount = Array.isArray(result) ? result.length : (result ? 1 : 0)
	ElMessage({
	  type: 'success',
	  message: `已选择 ${selectedCount} 个传感器`
	})
  }
  </script>
  
  <style lang="scss" scoped>
  .sensor-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
	max-height: 400px;
	overflow-y: auto;
	padding: 10px 0;
	
	:deep(.el-checkbox) {
	  margin-right: 0;
	  margin-bottom: 10px;
	}
	
	:deep(.el-checkbox__label) {
	  font-size: 14px;
	}
  }
  
  .dialog-footer {
	display: flex;
	justify-content: flex-end;
	width: 100%;
	gap: 10px;
  }
  </style>