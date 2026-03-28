<template>
	<view class="login-container">
	  <el-card class="login-card">
		<view class="logo-area">
		  <image src="/static/logo.png" mode="aspectFit" class="logo"></image>
		  <text class="app-title">环境监测系统</text>
		</view>
		
		<el-form :model="resetForm" ref="resetFormRef" :rules="rules" label-position="top">
		  <el-form-item label="邮箱" prop="email">
			<el-input v-model="resetForm.email" placeholder="请输入邮箱" :prefix-icon="Message" />
		  </el-form-item>
          
          <div class="verify-code-container">
            <el-form-item label="验证码" prop="verifyCode" style="flex: 1; margin-right: 10px;">
              <el-input v-model="resetForm.verifyCode" placeholder="请输入验证码" :prefix-icon="Key" />
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
		  
		  <el-form-item label="新密码" prop="password">
			<el-input v-model="resetForm.password" type="password" placeholder="请输入新密码" show-password :prefix-icon="Lock" />
		  </el-form-item>
		  
		  <el-form-item label="确认新密码" prop="confirmPassword">
			<el-input v-model="resetForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password :prefix-icon="Lock" />
		  </el-form-item>
		  
		  <el-button type="primary" @click="handleReset" class="login-btn" :loading="loading">重置密码</el-button>
		</el-form>
		
		<view class="footer-links">
		  <el-link type="primary" @click="goToLogin">返回登录</el-link>
		</view>
	  </el-card>
	</view>
</template>
  
<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { Message, Lock, Key } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { sendEmailVerifyCode, verifyEmailCode, updatePassword } from '../../api/user';

// API基础URL
const BASE_URL = 'http://localhost:8080';

// 表单数据
const resetForm = reactive({
  email: '',
  verifyCode: '',
  password: '',
  confirmPassword: ''
});

// 表单校验规则
const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== resetForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

const resetFormRef = ref(null);
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
  if (!resetForm.email) {
    ElMessage.warning('请先输入邮箱');
    return;
  }
  
  // 简单邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(resetForm.email)) {
    ElMessage.warning('请输入有效的邮箱格式');
    return;
  }
  
  isSending.value = true;
  
  try {
    // 调用发送验证码API
    const response = await sendEmailVerifyCode(resetForm.email);
    
    if (response.code === 200 || response.code === 1) {
      startCountdown();
      ElMessage.success('验证码已发送至您的邮箱');
      
      // 开发环境下显示验证码
      if (response.data && response.data.mockCode) {
        console.log('开发模式：验证码为', response.data.mockCode);
        resetForm.verifyCode = response.data.mockCode;
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

// 重置密码处理
const handleReset = async () => {
  if (!resetFormRef.value) return;
  
  await resetFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    // 显示加载
    loading.value = true;
    
    try {
      // 验证码正确后，调用密码更新API
      const response = await updatePassword({
        email: resetForm.email,
        code: resetForm.verifyCode,
        newPassword: resetForm.password,
        confirm_password: resetForm.confirmPassword
      });
      
      loading.value = false;
      
      if (response.code === 200 || response.code === 1) {
        ElMessage.success('密码重置成功，请使用新密码登录');
        
        // 重置成功后跳转到登录页
        setTimeout(() => {
          goToLogin();
        }, 2000);
      } else {
        ElMessage.error(response.message || '密码重置失败');
      }
    } catch (error) {
      loading.value = false;
      ElMessage.error(error.message || '密码重置失败，请稍后重试');
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

.verify-code-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.send-code-btn {
  margin-top: 32rpx;
  height: 80rpx;
  white-space: nowrap;
}
</style> 