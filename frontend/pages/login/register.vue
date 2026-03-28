<template>
	<view class="login-container">
	  <el-card class="login-card">
		<view class="logo-area">
		  <image src="/static/logo.png" mode="aspectFit" class="logo"></image>
		  <text class="app-title">环境监测系统</text>
		</view>
		
		<el-form :model="registerForm" ref="registerFormRef" :rules="rules" label-position="top">
		  <el-form-item label="用户名" prop="username">
			<el-input v-model="registerForm.username" placeholder="请输入用户名" :prefix-icon="User" />
		  </el-form-item>
		  
		  <el-form-item label="邮箱" prop="email">
			<el-input v-model="registerForm.email" placeholder="请输入邮箱" :prefix-icon="Message" />
		  </el-form-item>
          
          <div class="verify-code-container">
            <el-form-item label="验证码" prop="verifyCode" style="flex: 1; margin-right: 10px;">
              <el-input v-model="registerForm.verifyCode" placeholder="请输入验证码" :prefix-icon="Key" />
            </el-form-item>
            <el-button 
              type="primary" 
              :disabled="isSending || countdown > 0"
              @click="sendVerifyCode"
              class="send-code-btn"
            >
              {{ sendBtnText }}
            </el-button>
          </div>
		  
		  <el-form-item label="密码" prop="password">
			<el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
		  </el-form-item>
		  
		  <el-form-item label="确认密码" prop="confirmPassword">
			<el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password :prefix-icon="Lock" />
		  </el-form-item>
		  
		  <el-form-item label="角色">
			<el-select v-model="registerForm.role" placeholder="请选择角色" class="w-100">
			  <el-option 
				v-for="role in roles" 
				:key="role.value" 
				:label="role.label" 
				:value="role.value" />
			</el-select>
		  </el-form-item>
		  
		  <div class="role-description" v-if="roleDescription">
			<el-alert
			  :title="roleDescription"
			  type="info"
			  :closable="false"
			/>
		  </div>
		  
		  <el-button type="primary" @click="handleRegister" class="login-btn" :loading="loading">注 册</el-button>
		</el-form>
		
		<view class="footer-links">
		  <el-link type="primary" @click="goToLogin">已有账号? 去登录</el-link>
		</view>
	  </el-card>
	</view>
  </template>
  
<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { User, Message, Lock, Key } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import api from '../../api/index';

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  verifyCode: '',
  role: 'public' // 默认为公众角色
});

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// 角色选项
const roles = [
  { value: 'environmental', label: '环保部门' },
  { value: 'cityManager', label: '城市管理者' },
  { value: 'public', label: '公众' }
];

// 角色描述
const roleDescriptions = {
  environmental: '环保部门角色具有实时监测、数据分析与预测、设备集成、RAG知识库助手等功能权限',
  cityManager: '城市管理者角色具有全部权限，包括异常预警、习惯学习、数据可视化等功能权限',
  public: '公众角色仅具有信息公开等功能权限，可以访问历史回溯页面'
};

const roleDescription = computed(() => {
  return roleDescriptions[registerForm.role] || '';
});

const registerFormRef = ref(null);
const loading = ref(false);
const isSending = ref(false);
const countdown = ref(0);
let timer = null;

// 发送按钮文本
const sendBtnText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}秒后重试` : '发送验证码';
});

// 发送验证码
const sendVerifyCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱');
    return;
  }
  
  // 简单邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerForm.email)) {
    ElMessage.warning('请输入有效的邮箱格式');
    return;
  }
  
  isSending.value = true;
  
  try {
    // 调用发送验证码API
    const response = await api.user.sendEmailVerifyCode(registerForm.email);
    
    if (response.code === 200 || response.code === 1) {
      startCountdown();
      ElMessage.success('验证码已发送至您的邮箱');
      
      // 开发环境下显示验证码
      if (response.data && response.data.mockCode) {
        console.log('开发模式：验证码为', response.data.mockCode);
        registerForm.verifyCode = response.data.mockCode;
      }
    } else {
      ElMessage.error(response.message || '验证码发送失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '验证码发送失败，请稍后重试');
  } finally {
    isSending.value = false;
  }
};

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  
  if (timer) {
    clearInterval(timer);
  }
  
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
};

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    // 显示加载
    loading.value = true;
    
    try {
      // 调用注册API
	  console.log(registerForm.confirmPassword)
      const response = await api.user.register({
        username: registerForm.username,
        email: registerForm.email,  
        password: registerForm.password,
        role: registerForm.role,
        code: registerForm.verifyCode
      });
      
      loading.value = false;
      
      if (response.code === 200 || response.code === 1) {
        ElMessage.success('注册成功，请登录');
        
        // 注册成功后跳转到登录页
        setTimeout(() => {
          goToLogin();
        }, 2000);
      } else {
        ElMessage.error(response.message || '注册失败');
      }
    } catch (error) {
      loading.value = false;
      ElMessage.error(error.message || '注册失败，请稍后重试');
    }
  });
};

// 跳转到登录页面
const goToLogin = () => {
  uni.redirectTo({
    url: '/pages/login/login'
  });
};

// 组件销毁时清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>
  
<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--el-bg-color-page, #f8f8f8);
  padding: 30rpx;
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

.verify-code-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 22px;
}

.send-code-btn {
  margin-top: 32px;
  height: 40px;
  font-size: 14px;
  width: 140px;
}

.role-description {
  margin-bottom: 20rpx;
}

.login-btn {
  width: 100%;
  margin-top: 20rpx;
  height: 80rpx;
}

.footer-links {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
}

.w-100 {
  width: 100%;
}
</style>