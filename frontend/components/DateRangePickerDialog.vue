<template>
	<el-button type="primary" @click="dialogVisible = true">选择日期范围</el-button>
	
	<el-dialog
	  v-model="dialogVisible"
	  title="选择日期范围"
	  width="500px"
	  destroy-on-close
	>
	  <div class="picker-container">
		<el-date-picker
		  v-model="dateRangeTemp"
		  type="daterange"
		  range-separator="至"
		  start-placeholder="开始日期"
		  end-placeholder="结束日期"
		  format="YYYY-MM-DD"
		  value-format="YYYY-MM-DD"
		  style="width: 100%"
		/>
	  </div>
	  
	  <div class="quick-select">
		<el-button size="small" @click="selectRange('today')">今天</el-button>
		<el-button size="small" @click="selectRange('yesterday')">昨天</el-button>
		<el-button size="small" @click="selectRange('week')">本周</el-button>
		<el-button size="small" @click="selectRange('month')">本月</el-button>
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
  import { formatDate } from '../utils/date'
  
  const props = defineProps({
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
  
  const dialogVisible = ref(false)
  const dateRangeTemp = ref([
	formatDate(props.startDate, 'YYYY-MM-DD'),
	formatDate(props.endDate, 'YYYY-MM-DD')
  ])
  
  // 监听props变化和对话框状态
  watch([() => props.startDate, () => props.endDate, dialogVisible], ([newStartDate, newEndDate, isVisible]) => {
	if (isVisible) {
	  dateRangeTemp.value = [
		formatDate(props.startDate, 'YYYY-MM-DD'),
		formatDate(props.endDate, 'YYYY-MM-DD')
	  ]
	}
  }, { immediate: true })
  
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
	
	dateRangeTemp.value = [
	  formatDate(start, 'YYYY-MM-DD'),
	  formatDate(end, 'YYYY-MM-DD')
	]
  }
  
  // 确认选择
  const confirmSelection = () => {
	if (!dateRangeTemp.value || dateRangeTemp.value.length < 2) {
	  return
	}
	
	const startDate = new Date(dateRangeTemp.value[0])
	const endDate = new Date(dateRangeTemp.value[1])
	
	emit('update:startDate', startDate)
	emit('update:endDate', endDate)
	emit('change', { startDate, endDate })
	dialogVisible.value = false
  }
  </script>
  
  <style lang="scss" scoped>
  .picker-container {
	margin-bottom: 20px;
  }
  
  .quick-select {
	display: flex;
	justify-content: space-between;
	gap: 10px;
	margin-top: 10px;
  }
  
  .dialog-footer {
	display: flex;
	justify-content: flex-end;
	width: 100%;
	gap: 10px;
  }
  </style>