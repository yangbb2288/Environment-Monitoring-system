<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 检查登录状态
			this.checkLoginStatus()
			// 设置侧边栏默认收起状态
			if (uni.getStorageSync('sidebarCollapsed') === '') {
				uni.setStorageSync('sidebarCollapsed', true) // 默认收起
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const userInfo = uni.getStorageSync('userInfo')
				const currentRoute = this.getCurrentRoute()
				
				// 如果没有登录信息，且不在登录相关页面，跳转到登录页
				if (!userInfo && 
					currentRoute !== 'pages/login/login' && 
					currentRoute !== 'pages/login/register') {
					uni.reLaunch({
						url: '/pages/login/login'
					})
				}
			},
			
			// 获取当前路由
			getCurrentRoute() {
				const pages = getCurrentPages()
				if (pages.length === 0) return ''
				
				return pages[pages.length - 1].route
			},
			
			// 判断当前是否在登录相关页面
			isLoginPage() {
				const currentRoute = this.getCurrentRoute()
				return currentRoute === 'pages/login/login' || currentRoute === 'pages/login/register'
			}
		}
	}
</script>

<style lang="scss">
	/* 引入uni.scss */
	@import './uni.scss';

	/* Element Plus 样式覆盖 */
	:root {
		--el-color-primary: #{$uni-color-primary};
		--el-color-success: #{$uni-color-success};
		--el-color-warning: #{$uni-color-warning};
		--el-color-danger: #{$uni-color-error};
		--el-border-radius-base: #{$uni-border-radius-base};
		
		/* 新增变量 */
		--app-container-padding: 16px;
		--app-card-margin: 16px;
		--app-section-gap: 24px;
		--app-element-gap: 16px;
	}

	/* 全局样式 */
	page {
		font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
		background-color: var(--el-bg-color-page, #f5f7fa);
		color: var(--el-text-color-primary, #333);
		font-size: var(--el-font-size-base, 14px);
		line-height: 1.5;
		box-sizing: border-box;
		min-height: 100vh;
		margin: 0;
		padding: 0;
	}

	/* 使所有元素使用相同的盒模型 */
	*, *::before, *::after {
		box-sizing: inherit;
	}

	.container {
		padding: var(--app-container-padding);
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	/* 卡片通用样式 */
	.el-card {
		margin-bottom: var(--app-card-margin);
		border-radius: 8px !important;
		transition: box-shadow 0.3s ease;
		
		&.is-hover-shadow:hover {
			box-shadow: var(--el-box-shadow-light);
		}
		
		.el-card__header {
			padding: 16px 20px;
			border-bottom: 1px solid var(--el-border-color-lighter);
		}
		
		.el-card__body {
			padding: 20px;
		}
	}

	/* 网格布局 */
	.el-row {
		margin-left: -8px;
		margin-right: -8px;
		
		&:last-child {
			margin-bottom: 0;
		}
	}

	.el-col {
		padding-left: 8px;
		padding-right: 8px;
	}

	/* 旧样式兼容 */
	.card {
		background-color: var(--el-bg-color, #fff);
		border-radius: 8px;
		box-shadow: var(--el-box-shadow-light, 0 2px 12px rgba(0, 0, 0, 0.05));
		padding: 20px;
		margin-bottom: var(--app-card-margin);
	}

	/* 弹性布局工具类 */
	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
	}

	.flex-wrap {
		flex-wrap: wrap;
	}

	.justify-between {
		justify-content: space-between;
	}
	
	.justify-center {
		justify-content: center;
	}

	.align-center {
		align-items: center;
	}
	
	.align-start {
		align-items: flex-start;
	}
	
	.align-stretch {
		align-items: stretch;
	}

	/* 文字样式工具类 */
	.text-primary {
		color: var(--el-color-primary);
	}

	.text-success {
		color: var(--el-color-success);
	}

	.text-warning {
		color: var(--el-color-warning);
	}

	.text-danger {
		color: var(--el-color-danger);
	}
	
	.text-info {
		color: var(--el-color-info);
	}

	.text-center {
		text-align: center;
	}
	
	.text-left {
		text-align: left;
	}
	
	.text-right {
		text-align: right;
	}
	
	/* 间距工具类 */
	.mt-0 { margin-top: 0; }
	.mt-1 { margin-top: 4px; }
	.mt-2 { margin-top: 8px; }
	.mt-3 { margin-top: 16px; }
	.mt-4 { margin-top: 24px; }
	
	.mb-0 { margin-bottom: 0; }
	.mb-1 { margin-bottom: 4px; }
	.mb-2 { margin-bottom: 8px; }
	.mb-3 { margin-bottom: 16px; }
	.mb-4 { margin-bottom: 24px; }
	
	.mx-auto { margin-left: auto; margin-right: auto; }
	
	.p-0 { padding: 0; }
	.p-1 { padding: 4px; }
	.p-2 { padding: 8px; }
	.p-3 { padding: 16px; }
	.p-4 { padding: 24px; }

	/* 图表容器样式 */
	.chart-container {
		width: 100%;
		height: 300px;
	}
	
	.chart-wrapper {
		margin-bottom: var(--app-section-gap);
		
		.chart-title {
			font-size: 16px;
			font-weight: 500;
			margin-bottom: 12px;
		}
	}
	
	/* 布局容器样式 */
	.section-container {
		margin-bottom: var(--app-section-gap);
	}
	
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 16px;
	}
	
	/* Element Plus 组件样式适配 */
	.el-button {
		font-size: 14px;
		height: auto;
		padding: 8px 15px;
		
		&.el-button--small {
			padding: 5px 12px;
		}
		
		&.el-button--large {
			padding: 12px 20px;
		}
	}
	
	.el-input {
		--el-input-height: 36px;
	}
	
	.el-form-item {
		margin-bottom: 22px;
		
		&:last-child {
			margin-bottom: 0;
		}
	}
	
	/* 响应式媒体查询 */
	@media screen and (max-width: 768px) {
		:root {
			--app-container-padding: 12px;
			--app-card-margin: 12px;
			--app-section-gap: 20px;
			--app-element-gap: 12px;
		}
		
		.el-message-box {
			width: 90% !important;
			max-width: 600rpx;
		}
		
		.el-dialog {
			width: 90% !important;
			max-width: 650rpx;
		}
		
		.card-grid {
			grid-template-columns: 1fr;
		}
	}
	
	/* 暗黑模式适配 */
	@media (prefers-color-scheme: dark) {
		.el-card {
			border-color: var(--el-border-color-darker);
		}
	}
</style>
