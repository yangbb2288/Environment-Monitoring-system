<template>
  <app-layout page-title="RAG知识库助手">
	<view class="container">
	  <view class="header">
		<text class="title">RAG知识库助手</text>
		<text class="subtitle">集成国内外环保经验，为每次异常警报自动推荐治理与改善措施</text>
	  </view>
	  
	  <view class="card">
		<text class="section-title">知识库问答</text>
		<view class="qa-section">
		  <view class="qa-input">
			<input type="text" placeholder="输入您的环保问题..." v-model="question" class="question-input" />
			<button class="ask-btn" @click="askQuestion">提问</button>
		  </view>
		  
		  <view class="qa-result" v-if="answer">
			<view class="question-box">
			  <text class="question-text">{{ question }}</text>
			</view>
			<view class="answer-box">
			  <text class="answer-text">{{ answer }}</text>
			</view>
		  </view>
		</view>
	  </view>
	  
	  <view class="card">
		<text class="section-title">最近异常警报推荐措施</text>
		<view class="recommendation-list">
		  <view class="recommendation-item" v-for="(item, index) in warningHandles" :key="index">
			<view class="recommendation-header">
			  <text class="recommendation-type">{{ item.type }}</text>
			  <text class="recommendation-date">{{ item.date }}</text>
			</view>
			<view class="recommendation-content">
			  <text class="recommendation-title">{{ item.title }}</text>
			  <text class="recommendation-desc">{{ item.description }}</text>
			  <view class="recommendation-steps">
				<text class="step" v-for="(step, stepIndex) in item.steps" :key="stepIndex">{{ step }}</text>
			  </view>
			</view>
		  </view>
		</view>
	  </view>
	</view>
  </app-layout>
  </template>
  
  <script>
  import AppLayout from '../../components/AppLayout.vue';
  import api from '../../api/index';
  
  export default {
    components: {
      AppLayout
    },
	data() {
	  return {
		question: '',
		answer: '',
		warningHandles: [],
		isLoading: false
	  }
	},
	mounted() {
	  this.fetchWarningHandles();
	},
	methods: {
	  // 提问问题
	  askQuestion() {
		if (!this.question) {
		  uni.showToast({
			title: '请输入您的问题',
			icon: 'none'
		  })
		  return
		}
		
		this.isLoading = true;
		uni.showLoading({
		  title: '思考中...'
		})
		
		api.llmRag.askQuestion(this.question)
		  .then(response => {
			this.answer = response.data.data;
		  })
		  .catch(error => {
			console.error('RAG查询错误:', error);
			uni.showToast({
			  title: '查询失败，请重试',
			  icon: 'none'
			})
		  })
		  .finally(() => {
			this.isLoading = false;
			uni.hideLoading();
		  });
	  },
	  
	  // 获取最近警告处理方案
	  fetchWarningHandles() {
		api.warning.getRecentWarningHandles()
		  .then(response => {
			this.warningHandles = response.data || [];
		  })
		  .catch(error => {
			console.error('获取警告处理方案失败:', error);
			// 使用模拟数据
			this.warningHandles = [
			  {
				type: '温度异常警报',
				date: '2023-06-15',
				title: '高温环境处理方案',
				description: '针对温度达到38.5°C的异常情况，建议采取以下措施：',
				steps: [
				  '1. 启动厂房降温系统，增加通风频次',
				  '2. 调整生产设备运行参数，降低热源输出',
				  '3. 增加工作区域喷淋降温',
				  '4. 调整工作人员轮班制度，避免长时间高温环境作业'
				]
			  },
			  {
				type: '湿度异常警报',
				date: '2023-06-14',
				title: '高湿度环境处理方案',
				description: '针对湿度达到85%的异常情况，建议采取以下措施：',
				steps: [
				  '1. 启动除湿系统，降低环境湿度',
				  '2. 检查密封设备是否完好，防止水汽渗入',
				  '3. 增加防潮设备运行频次',
				  '4. 对敏感设备区域进行隔离保护'
				]
			  },
			  {
				type: '可燃气体异常警报',
				date: '2023-06-13',
				title: '可燃气体浓度超标处理方案',
				description: '针对可燃气体浓度接近警戒值的情况，建议采取以下措施：',
				steps: [
				  '1. 立即启动应急通风系统，稀释空气中的可燃气体',
				  '2. 检查气体管道和设备是否泄漏',
				  '3. 暂停可能产生火花的设备运行',
				  '4. 必要时疏散相关区域人员'
				]
			  }
			];
		  });
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
  
  .recommendation-list {
	margin-top: 20rpx;
  }
  
  .recommendation-item {
	padding: 20rpx;
	border-bottom: 1px solid #eee;
	margin-bottom: 20rpx;
  }
  
  .recommendation-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
  }
  
  .recommendation-type {
	font-size: 26rpx;
	font-weight: bold;
	color: #409eff;
  }
  
  .recommendation-date {
	font-size: 24rpx;
	color: #999;
  }
  
  .recommendation-content {
	margin-bottom: 15rpx;
  }
  
  .recommendation-title {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	display: block;
  }
  
  .recommendation-desc {
	font-size: 26rpx;
	margin-bottom: 15rpx;
	display: block;
  }
  
  .recommendation-steps {
	background-color: #f8f8f8;
	padding: 15rpx;
	border-radius: 8rpx;
	margin-bottom: 15rpx;
  }
  
  .step {
	font-size: 26rpx;
	line-height: 1.8;
	display: block;
  }
  
  .qa-section {
	margin-top: 20rpx;
  }
  
  .qa-input {
	display: flex;
	margin-bottom: 20rpx;
  }
  
  .question-input {
	flex: 1;
	height: 80rpx;
	border: 1px solid #ddd;
	border-radius: 8rpx 0 0 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
  }
  
  .ask-btn {
	width: 160rpx;
	height: 80rpx;
	line-height: 80rpx;
	background-color: #409eff;
	color: #fff;
	border-radius: 0 8rpx 8rpx 0;
	font-size: 28rpx;
	padding: 0;
  }
  
  .qa-result {
	margin-top: 30rpx;
  }
  
  .question-box {
	background-color: #f2f6fc;
	padding: 20rpx;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
  }
  
  .question-text {
	font-size: 28rpx;
  }
  
  .answer-box {
	background-color: #ecf5ff;
	padding: 20rpx;
	border-radius: 8rpx;
  }
  
  .answer-text {
	font-size: 28rpx;
	line-height: 1.8;
	margin-bottom: 15rpx;
	display: block;
  }
  </style>