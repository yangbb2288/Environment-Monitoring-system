<template>
	<view class="login-container">
	  <el-card class="login-card">
		<view class="logo-area">
		  <image src="/static/logo.png" mode="aspectFit" class="logo"></image>
		  <text class="app-title">环境监测系统</text>
		</view>
		
		<el-form :model="loginForm" ref="loginFormRef" :rules="rules" label-position="top">
		  <el-form-item label="账号" prop="username">
			<el-input v-model="loginForm.username" placeholder="请输入账号" :prefix-icon="User" />
		  </el-form-item>
		  
		  <el-form-item label="密码" prop="password">
			<el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
		  </el-form-item>
		  
		  <el-form-item label="角色">
			<el-select v-model="loginForm.role" placeholder="请选择角色" class="w-100">
			  <el-option 
				v-for="role in roles" 
				:key="role.value" 
				:label="role.label" 
				:value="role.value" />
			</el-select>
		  </el-form-item>
		  
		  <el-button type="primary" @click="handleLogin" class="login-btn" :loading="loading">登 录</el-button>
		</el-form>
		
		<view class="footer-links">
		  <el-link type="primary" @click="forgetPassword">忘记密码?</el-link>
		  <el-link type="primary" @click="goToRegister">注册账号</el-link>
		</view>
	  </el-card>
	</view>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { User, Lock } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import api from '../../api/index'
  
  // 表单数据
  const loginForm = reactive({
	username: '',
	password: '',
	role: 'public' // 默认为公众角色
  })
  
  // 表单校验规则
  const rules = {
	username: [
	  { required: true, message: '请输入账号', trigger: 'blur' }
	],
	password: [
	  { required: true, message: '请输入密码', trigger: 'blur' }
	]
  }
  
  // 角色选项
  const roles = [
	{ value: 'environmental', label: '环保部门' },
	{ value: 'cityManager', label: '城市管理者' },
	{ value: 'public', label: '公众' }
  ]
  
  const loginFormRef = ref(null)
  const loading = ref(false)
  
  // 登录处理
  const handleLogin = async () => {
	if (!loginFormRef.value) return
	
	await loginFormRef.value.validate(async (valid) => {
	  if (!valid) return
	  
	  // 显示加载
	  loading.value = true
	  
	  // 清除现有的用户信息和权限，确保使用最新的权限设置
	  uni.removeStorageSync('userInfo')
	  uni.removeStorageSync('token')
	  
	  try {
		// 调用登录API
		console.log('Login form data:', loginForm)
		const response = await api.user.login({
		  email: loginForm.username,  
		  password: loginForm.password,
		  role: loginForm.role
		})
		
		loading.value = false
		
		if (response.code === 200 || response.code === 1) {
		  // 登录成功
		  console.log('Login successful, response:', response)
		  
		  // 确保用户信息包含正确的角色
		  const userInfo = uni.getStorageSync('userInfo')
		  console.log('Retrieved userInfo from storage:', userInfo)
		  
		  if (userInfo) {
			// 确保角色与选择的一致
			if (!userInfo.role || userInfo.role !== loginForm.role) {
			  console.log('Updating role in userInfo from', userInfo.role, 'to', loginForm.role)
			  userInfo.role = loginForm.role
			  uni.setStorageSync('userInfo', userInfo)
			}
		  }
		  
		  ElMessage({
			type: 'success',
			message: '登录成功'
		  })
		  
		  // 跳转到首页
		  setTimeout(() => {
			console.log('Redirecting to index page')
			uni.reLaunch({
			  url: '/pages/index/index'
			})
		  }, 1000)
		} else {
		  // 登录失败
		  console.error('Login failed:', response)
		  ElMessage({
			type: 'error',
			message: response.message || '登录失败'
		  })
		}
	  } catch (error) {
		loading.value = false
		console.error('Login error:', error)
		
		ElMessage({
		  type: 'error',
		  message: error.message || '登录失败，请稍后重试'
		})
	  }
	})
  }
  
  // 跳转到注册页面
  const goToRegister = () => {
	uni.navigateTo({
	  url: '/pages/login/register'
	})
  }
  
  // 忘记密码
  const forgetPassword = () => {
    //console.log('Navigating to forgot-password page')
    uni.navigateTo({
      url: '/pages/login/forgot-password'
    })
  }
  </script>
  
  <style lang="scss" scoped>
  .login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	background-color: var(--el-bg-color-page, #f8f8f8);
	padding: 0 30rpx;
  }
  
  .login-card {
	width: 100%;
	max-width: 800rpx;
	border-radius: var(--el-border-radius-base, 12rpx);
	
	:deep(.el-card__body) {
	  padding: 40rpx;
	}
  }
  
  .logo-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
  }
  
  .logo {
	width: 160rpx;
	height: 160rpx;
  }
  
  .app-title {
	font-size: 36rpx;
	font-weight: bold;
	margin-top: 20rpx;
	color: var(--el-text-color-primary, #333);
  }
  
  .login-btn {
	width: 100%;
	margin-top: 20rpx;
	height: 80rpx;
  }
  
  .footer-links {
	display: flex;
	justify-content: space-between;
	margin-top: 30rpx;
  }
  
  .w-100 {
	width: 100%;
  }
  </style>