<template>
  <app-layout page-title="异常预警">
	<view class="container">
	  <view class="header">
		<text class="title">异常预警</text>
		<text class="subtitle">当温度、湿度或可燃气体含量超过设定阈值时，自动推送邮件，显示预警级别和建议措施</text>
	  </view>
	  
	  <view class="card">
		<text class="section-title">预警阈值设置</text>
		
		<view class="form-group">
		  <view class="threshold-item">
			<text>温度 (°C)</text>
			<view class="threshold-inputs">
			  <view class="input-group" style="width: 90%;">
				<text class="input-label">预警阈值</text>
				<input type="number" v-model="thresholds.temperature" class="input" />
			  </view>
			</view>
		  </view>
		  
		  <view class="threshold-item">
			<text>湿度 (%)</text>
			<view class="threshold-inputs">
			  <view class="input-group" style="width: 90%;">
				<text class="input-label">预警阈值</text>
				<input type="number" v-model="thresholds.humidity" class="input" />
			  </view>
			</view>
		  </view>
		  
		  <view class="threshold-item">
			<text>可燃气体含量 (ppm)</text>
			<view class="threshold-inputs">
			  <view class="input-group" style="width: 90%;">
				<text class="input-label">预警阈值</text>
				<input type="number" v-model="thresholds.combustibleGas" class="input" />
			  </view>
			</view>
		  </view>
		</view>
		
		<button type="primary" class="save-btn" @click="saveThresholds">保存设置</button>
	  </view>
	  
	  <view class="card">
		<text class="section-title">最近预警记录</text>
		<view class="warning-list">
		  <view class="warning-item">
			<view class="warning-header">
			  <text class="warning-level high">高风险</text>
			  <text class="warning-time">2023-06-15 14:30</text>
			</view>
			<view class="warning-content">
			  <text class="warning-message">温度达到35°C，超过预警阈值</text>
			  <text class="warning-location">传感器位置: 城东工业区</text>
			</view>
			<view class="warning-actions">
			  <text class="action">查看详情</text>
			  <text class="action">标记已处理</text>
			</view>
		  </view>
		  
		  <view class="warning-item">
			<view class="warning-header">
			  <text class="warning-level medium">中风险</text>
			  <text class="warning-time">2023-06-14 09:15</text>
			</view>
			<view class="warning-content">
			  <text class="warning-message">湿度达到85%，超过预警阈值</text>
			  <text class="warning-location">传感器位置: 城南居民区</text>
			</view>
			<view class="warning-actions">
			  <text class="action">查看详情</text>
			  <text class="action">标记已处理</text>
			</view>
		  </view>
		  
		  <view class="warning-item">
			<view class="warning-header">
			  <text class="warning-level low">低风险</text>
			  <text class="warning-time">2023-06-13 16:45</text>
			</view>
			<view class="warning-content">
			  <text class="warning-message">可燃气体含量达到1500ppm，接近预警阈值</text>
			  <text class="warning-location">传感器位置: 城西商业区</text>
			</view>
			<view class="warning-actions">
			  <text class="action">查看详情</text>
			  <text class="action">标记已处理</text>
			</view>
		  </view>
		</view>
	  </view>
	</view>
  </app-layout>
  </template>
  
  <script setup>
import AppLayout from '../../components/AppLayout.vue'
import { onMounted, ref } from 'vue';
import api from '../../api/index.js';

// 初始化阈值对象 - 按照后端需要的顺序：humidity, combustibleGas, temperature
const thresholds = ref({
  humidity: 80,
  combustibleGas: 2000,
  temperature: 30
});

// 获取阈值设置
const getThresholds = async () => {
  try {
    const response = await api.sensor.getThreshold();
	console.log(response)
    if (response.data && response.data.code === 1) {
      // 确保使用正确的字段名称
      const data = response.data.data;
      thresholds.value = {
        humidity: data.humidity,
        combustibleGas: data.gas || data.combustibleGas, // 兼容可能的字段名
        temperature: data.temperature
      };
    }
  } catch (error) {
    console.error('获取阈值设置失败:', error);
    uni.showToast({
      title: '获取阈值设置失败',
      icon: 'none'
    });
  }
};

// 保存阈值设置
const saveThresholds = async () => {
  try {
    // 按照后端需要的顺序构造参数
    const params = {
      humidity: thresholds.value.humidity,
      combustibleGas: thresholds.value.combustibleGas,
      temperature: thresholds.value.temperature
    };
    
    const response = await api.sensor.setThreshold(params);
	console.log(response)
    if (response.data && response.data.code === 1) {
      uni.showToast({
        title: '阈值设置成功',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: '阈值设置失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('阈值设置失败:', error);
    uni.showToast({
      title: '阈值设置失败',
      icon: 'none'
    });
  }
};

onMounted(() => {
  // 确保侧边栏收起
  uni.setStorageSync('sidebarCollapsed', true);
  
  // 获取初始阈值设置
  getThresholds();
});
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
  
  .form-group {
	margin-bottom: 30rpx;
  }
  
  .label {
	font-size: 28rpx;
	margin-bottom: 15rpx;
	display: block;
  }
  
  .threshold-item {
	margin-bottom: 20rpx;
	padding: 15rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;
  }
  
  .threshold-inputs {
	display: flex;
	justify-content: space-between;
	margin-top: 15rpx;
  }
  
  .input-group {
	width: 30%;
  }
  
  .input-label {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 5rpx;
	display: block;
  }
  
  .input {
	width: 100%;
	height: 70rpx;
	border: 1px solid #ddd;
	border-radius: 6rpx;
	padding: 0 15rpx;
	font-size: 26rpx;
	box-sizing: border-box;
  }
  
  .save-btn {
	margin-top: 20rpx;
  }
  
  .warning-list {
	margin-top: 20rpx;
  }
  
  .warning-item {
	padding: 20rpx;
	border-bottom: 1px solid #eee;
  }
  
  .warning-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
  }
  
  .warning-level {
	padding: 4rpx 12rpx;
	border-radius: 4rpx;
	font-size: 24rpx;
	
	&.high {
	  background-color: #f56c6c;
	  color: #fff;
	}
	
	&.medium {
	  background-color: #e6a23c;
	  color: #fff;
	}
	
	&.low {
	  background-color: #67c23a;
	  color: #fff;
	}
  }
  
  .warning-time {
	font-size: 24rpx;
	color: #999;
  }
  
  .warning-content {
	margin-bottom: 15rpx;
  }
  
  .warning-message {
	font-size: 26rpx;
	margin-bottom: 8rpx;
	display: block;
  }
  
  .warning-location {
	font-size: 24rpx;
	color: #666;
  }
  
  .warning-actions {
	display: flex;
	justify-content: flex-end;
  }
  
  .action {
	font-size: 24rpx;
	color: #409eff;
	margin-left: 20rpx;
  }
  </style>