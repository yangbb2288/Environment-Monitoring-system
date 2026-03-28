<template>
	<el-button type="primary" @click="dialogVisible = true">选择数据粒度</el-button>
	
	<el-dialog
	  v-model="dialogVisible"
	  title="选择数据粒度"
	  width="400px"
	  destroy-on-close
	>
	  <div class="granularity-options">
		<el-radio-group v-model="selectedGranularityTemp">
		  <el-radio v-for="(text, index) in groupByOptions" :key="index" :label="groupByValues[index]">
			{{ `按${text}查看` }}
		  </el-radio>
		</el-radio-group>
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
  
  const props = defineProps({
	modelValue: {
	  type: String,
	  default: 'hour'
	},
	options: {
	  type: Array,
	  default: () => ['小时', '天', '周', '月']
	},
	values: {
	  type: Array,
	  default: () => ['hour', 'day', 'week', 'month']
	}
  })
  
  const emit = defineEmits(['update:modelValue', 'change'])
  
  const dialogVisible = ref(false)
  const selectedGranularityTemp = ref(props.modelValue)
  const groupByOptions = computed(() => props.options)
  const groupByValues = computed(() => props.values)
  
  // 监听对话框状态
  watch(dialogVisible, (val) => {
	if (val) {
	  selectedGranularityTemp.value = props.modelValue
	}
  })
  
  // 确认选择
  const confirmSelection = () => {
	emit('update:modelValue', selectedGranularityTemp.value)
	emit('change', selectedGranularityTemp.value)
	dialogVisible.value = false
  }
  </script>
  
  <style lang="scss" scoped>
  .granularity-options {
	display: flex;
	flex-direction: column;
	gap: 15px;
	
	:deep(.el-radio-group) {
	  display: flex;
	  flex-direction: column;
	  gap: 15px;
	}
  }
  
  .dialog-footer {
	display: flex;
	justify-content: flex-end;
	width: 100%;
	gap: 10px;
  }
  </style>