<template>
	<view class="container">
	  <view class="header">
		<text class="title">习惯学习</text>
		<text class="subtitle">系统对历史污染记录分析后，主动优化监测频率与告警触发机制，实现自适应服务</text>
	  </view>
	  
	  <view class="card">
		<text class="section-title">系统学习状态</text>
		<view class="status-section">
		  <view class="status-item">
			<text class="status-label">数据分析周期</text>
			<text class="status-value">每7天</text>
		  </view>
		  <view class="status-item">
			<text class="status-label">已收集数据量</text>
			<text class="status-value">1,245,879 条</text>
		  </view>
		  <view class="status-item">
			<text class="status-label">上次优化时间</text>
			<text class="status-value">2023-06-14 03:00</text>
		  </view>
		  <view class="status-item">
			<text class="status-label">下次优化时间</text>
			<text class="status-value">2023-06-21 03:00</text>
		  </view>
		</view>
		
		<view class="progress-section">
		  <text class="progress-label">学习进度</text>
		  <view class="progress-bar">
			<view class="progress-inner" style="width: 75%;"></view>
		  </view>
		  <text class="progress-value">75%</text>
		</view>
	  </view>
	  
	  <view class="card">
		<text class="section-title">优化结果</text>
		<view class="optimization-list">
		  <view class="optimization-item">
			<view class="optimization-header">
			  <text class="optimization-title">监测频率优化</text>
			  <text class="optimization-date">2023-06-14</text>
			</view>
			<view class="optimization-content">
			  <view class="optimization-row">
				<text class="row-label">工业区传感器</text>
				<text class="row-old">原频率: 30分钟/次</text>
				<text class="row-new">新频率: 15分钟/次</text>
				<text class="row-reason">原因: 检测到工作日9:00-18:00污染物浓度波动较大</text>
			  </view>
			  <view class="optimization-row">
				<text class="row-label">居民区传感器</text>
				<text class="row-old">原频率: 30分钟/次</text>
				<text class="row-new">新频率: 60分钟/次</text>
				<text class="row-reason">原因: 数据稳定，波动小</text>
			  </view>
			  <view class="optimization-row">
				<text class="row-label">商业区传感器</text>
				<text class="row-old">原频率: 30分钟/次</text>
				<text class="row-new">新频率: 20分钟/次</text>
				<text class="row-reason">原因: 周末人流量大，污染物浓度变化较快</text>
			  </view>
			</view>
		  </view>
		  
		  <view class="optimization-item">
			<view class="optimization-header">
			  <text class="optimization-title">告警阈值优化</text>
			  <text class="optimization-date">2023-06-07</text>
			</view>
			<view class="optimization-content">
			  <view class="optimization-row">
				<text class="row-label">PM2.5阈值</text>
				<text class="row-old">原阈值: 75μg/m³</text>
				<text class="row-new">新阈值: 70μg/m³</text>
				<text class="row-reason">原因: 历史数据显示70μg/m³时已有明显上升趋势</text>
			  </view>
			  <view class="optimization-row">
				<text class="row-label">AQI阈值</text>
				<text class="row-old">原阈值: 100</text>
				<text class="row-new">新阈值: 95</text>
				<text class="row-reason">原因: 提前预警可减少污染峰值</text>
			  </view>
			</view>
		  </view>
		</view>
	  </view>
	  
	  <view class="card">
		<text class="section-title">系统配置</text>
		<view class="config-section">
		  <view class="config-item">
			<text class="config-label">学习模式</text>
			<picker @change="onModeChange" :value="modeIndex" :range="modes" class="picker">
			  <view class="picker-value">{{ modes[modeIndex] }}</view>
			</picker>
		  </view>
		  
		  <view class="config-item">
			<text class="config-label">分析周期</text>
			<picker @change="onCycleChange" :value="cycleIndex" :range="cycles" class="picker">
			  <view class="picker-value">{{ cycles[cycleIndex] }}</view>
			</picker>
		  </view>
		  
		  <view class="config-item">
			<text class="config-label">自动应用优化</text>
			<switch :checked="autoApply" @change="onAutoApplyChange" color="#409eff" />
		  </view>
		  
		  <view class="config-item">
			<text class="config-label">优化前通知</text>
			<switch :checked="notifyBeforeOptimize" @change="onNotifyChange" color="#409eff" />
		  </view>
		</view>
		
		<button type="primary" class="save-btn">保存配置</button>
	  </view>
	</view>
  </template>
  
  <script>
  export default {
	data() {
	  return {
		modeIndex: 1,
		modes: ['保守模式', '平衡模式', '激进模式'],
		cycleIndex: 1,
		cycles: ['每3天', '每7天', '每14天', '每30天'],
		autoApply: true,
		notifyBeforeOptimize: true
	  }
	},
	methods: {
	  // 学习模式变更
	  onModeChange(e) {
		this.modeIndex = e.detail.value
	  },
	  
	  // 分析周期变更
	  onCycleChange(e) {
		this.cycleIndex = e.detail.value
	  },
	  
	  // 自动应用设置变更
	  onAutoApplyChange(e) {
		this.autoApply = e.detail.value
	  },
	  
	  // 通知设置变更
	  onNotifyChange(e) {
		this.notifyBeforeOptimize = e.detail.value
	  }
	}
  }
  </script>
  
  <style lang="scss" scoped>
  .container {
	padding: 20rpx;
  }
  
  .header {
	margin-bottom: 30rpx;
  }
  
  .title {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
  }
  
  .subtitle {
	font-size: 24rpx;
	color: #666;
  }
  
  .card {
	background-color: #fff;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  }
  
  .section-title {
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	display: block;
  }
  
  .status-section {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
	margin-bottom: 30rpx;
  }
  
  .status-item {
	background-color: #f8f8f8;
	padding: 15rpx;
	border-radius: 8rpx;
  }
  
  .status-label {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
	display: block;
  }
  
  .status-value {
	font-size: 28rpx;
	font-weight: bold;
  }
  
  .progress-section {
	display: flex;
	align-items: center;
	margin-top: 20rpx;
  }
  
  .progress-label {
	font-size: 26rpx;
	width: 120rpx;
  }
  
  .progress-bar {
	flex: 1;
	height: 20rpx;
	background-color: #eee;
	border-radius: 10rpx;
	overflow: hidden;
	margin: 0 20rpx;
  }
  
  .progress-inner {
	height: 100%;
	background-color: #409eff;
  }
  
  .progress-value {
	font-size: 26rpx;
	width: 60rpx;
	text-align: right;
  }
  
  .optimization-list {
	margin-top: 20rpx;
  }
  
  .optimization-item {
	margin-bottom: 30rpx;
  }
  
  .optimization-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
  }
  
  .optimization-title {
	font-size: 28rpx;
	font-weight: bold;
  }
  
  .optimization-date {
	font-size: 24rpx;
	color: #999;
  }
  
  .optimization-content {
	background-color: #f8f8f8;
	border-radius: 8rpx;
	padding: 15rpx;
  }
  
  .optimization-row {
	padding: 15rpx 0;
	border-bottom: 1px solid #eee;
	
	&:last-child {
	  border-bottom: none;
	}
  }
  
  .row-label {
	font-size: 26rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	display: block;
  }
  
  .row-old {
	font-size: 24rpx;
	color: #f56c6c;
	margin-bottom: 5rpx;
	display: block;
  }
  
  .row-new {
	font-size: 24rpx;
	color: #67c23a;
	margin-bottom: 5rpx;
	display: block;
  }
  
  .row-reason {
	font-size: 24rpx;
	color: #666;
  }
  
  .config-section {
	margin-bottom: 30rpx;
  }
  
  .config-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #eee;
	
	&:last-child {
	  border-bottom: none;
	}
  }
  
  .config-label {
	font-size: 28rpx;
  }
  
  .picker {
	width: 200rpx;
  }
  
  .picker-value {
	font-size: 28rpx;
	text-align: right;
  }
  
  .save-btn {
	margin-top: 20rpx;
  }
  </style>