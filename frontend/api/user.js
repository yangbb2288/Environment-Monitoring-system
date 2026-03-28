/**
 * 用户认证相关API
 */
import axios from 'axios';

// API基础URL
const BASE_URL = 'http://localhost:8080';

// 登录接口
export const login = (data) => {
  // 使用axios调用真实后端接口
  return new Promise((resolve, reject) => {
    console.log('Login attempt with data:', data);
    axios.post(`${BASE_URL}/login`, data)
      .then(response => {
        console.log('Login API response:', response.data);
        if (response.data.code === 1 || response.data.code === 200) {
          // 登录成功，存储token和用户信息
          const token = response.data.data.token;
          const userInfo = response.data.data;
          console.log('Login success, token:', token);
          console.log('Login success, userInfo:', userInfo);
          uni.setStorageSync('token', token);
          
          // 确保userInfo包含正确的角色和权限结构
          if (userInfo.userInfo) {
            // 如果后端返回的是嵌套的userInfo结构
            console.log('Using nested userInfo structure:', userInfo.userInfo);
            uni.setStorageSync('userInfo', userInfo.userInfo);
          } else {
            // 如果后端返回的是扁平结构，需要构建正确的userInfo对象
            const rolePermissions = getRolePermissions(data.role);
            console.log('Role permissions for', data.role, ':', rolePermissions);
            const formattedUserInfo = {
              id: userInfo.id || 'user_temp',
              username: userInfo.username || data.username,
              email: userInfo.email || data.username,
              role: data.role, // 使用登录表单提供的角色
              permissions: rolePermissions
            };
            console.log('Formatted userInfo:', formattedUserInfo);
            uni.setStorageSync('userInfo', formattedUserInfo);
          }
          
          resolve(response.data);
        } else {
          console.error('Login failed with response:', response.data);
          reject(response.data);
        }
      })
      .catch(error => {
        // 如果后端接口不可用，使用模拟数据
        console.error('Login API call failed, using mock data:', error);
        mockLogin(data).then(resolve).catch(reject);
      });
  });
};

// 注册接口
export const register = (data) => {
	return new Promise((resolve, reject) => {
	  axios.post(`${BASE_URL}/register`, {
		username: data.username,  // 用户名
		email: data.email,       // 邮箱
		password: data.password, // 密码
		role: data.role,         // 角色
		code: data.code          // 验证码
	  }, {
		headers: {
		  'Content-Type': 'application/json' // 明确指定 JSON 格式
		}
	  })
	  .then(response => {
		if (response.data.code === 200 || response.data.code === 1) {  // 假设 200 表示成功
		  resolve(response.data);
		} else {
		  reject(new Error(response.data.msg || '注册失败'));
		}
	  })
	  .catch(error => {
		console.error('注册接口调用失败，使用模拟数据', error);
		mockRegister(data).then(resolve).catch(reject);
	  });
	});
  };

// 发送邮箱验证码
export const sendEmailVerifyCode = (email) => {
	return new Promise((resolve, reject) => {
	  // 使用 GET 请求，参数通过 URL 传递
	  axios.get(`${BASE_URL}/register/sendEmail?email=${encodeURIComponent(email)}`)
		.then(response => {
		  console.log('验证码发送成功', response.data);
		  if (response.data.code === 200 || response.data.code === 1) {  // 假设 200 表示成功
			resolve(response.data);
		  } else {
			reject(new Error(response.data.msg || '验证码发送失败'));
		  }
		})
		.catch(error => {
		  console.error('发送验证码接口调用失败，使用模拟数据', error);
		  mockSendEmailVerifyCode(email).then(resolve).catch(reject);
		});
	});
  };

// 验证邮箱验证码
export const verifyEmailCode = (email, code) => {
  return new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/register/sendEmail`, { 
      code: code,
      email: email 
    }).then(response => {
      console.log('验证码验证成功');
      resolve(response.data);
    })
    .catch(error => {
      console.error('验证码验证接口调用失败，使用模拟数据', error);
      mockVerifyEmailCode(email, code).then(resolve).catch(reject);
    });
  });
};

// 获取用户信息
export const getUserInfo = () => {
  const token = uni.getStorageSync('token');
  
  // 使用axios调用真实后端接口
  return new Promise((resolve, reject) => {
    if (!token) {
      reject({
        code: 401,
        message: '未登录或登录已过期'
      });
      return;
    }
    
    axios.get(`${BASE_URL}/user/info`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        // 如果后端接口不可用，使用本地存储的用户信息
        console.error('获取用户信息接口调用失败，使用本地数据', error);
        mockGetUserInfo().then(resolve).catch(reject);
      });
  });
};

// 退出登录
export const logout = () => {
  const token = uni.getStorageSync('token');
  
  // 使用axios调用真实后端接口
  return new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        // 无论后端是否成功，都清除本地存储
        uni.removeStorageSync('userInfo');
        uni.removeStorageSync('token');
        resolve(response.data);
      })
      .catch(error => {
        // 如果后端接口不可用，仍然清除本地存储
        console.error('退出登录接口调用失败', error);
        uni.removeStorageSync('userInfo');
        uni.removeStorageSync('token');
        resolve({
          code: 200,
          message: '退出成功'
        });
      });
  });
};

// 重置密码
export const resetPassword = (data) => {
  return new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/user/reset-password`, {
      email: data.email,
      code: data.code,
      newPassword: data.newPassword,
	  confirm_password: data.confirm_password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.data.code === 200 || response.data.code === 1) {
        resolve(response.data);
      } else {
        reject(new Error(response.data.msg || '密码重置失败'));
      }
    })
    .catch(error => {
      console.error('重置密码接口调用失败，使用模拟数据', error);
      mockResetPassword(data).then(resolve).catch(reject);
    });
  });
};

// 更新密码
export const updatePassword = (data) => {
  return new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/user/update`, {
      email: data.email,
      code: data.code,
      newPassword: data.newPassword,
      confirm_password: data.confirm_password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.data.code === 200 || response.data.code === 1) {
        resolve(response.data);
      } else {
        reject(new Error(response.data.message || '密码更新失败'));
      }
    })
    .catch(error => {
      console.error('更新密码接口调用失败，使用模拟数据', error);
      mockUpdatePassword(data).then(resolve).catch(reject);
    });
  });
};

// ========== 模拟接口实现 ==========

// 模拟登录
const mockLogin = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.username && data.password) {
        console.log('Mock login with role:', data.role);
        
        // 根据角色返回不同的权限
        const permissions = getRolePermissions(data.role);
        console.log('Mock login permissions for role', data.role, ':', permissions);
        
        // 创建用户信息对象
        const userInfo = {
          id: 'user_' + Math.floor(Math.random() * 1000),
          username: data.username,
          email: data.username + '@example.com',
          role: data.role,
          permissions: permissions // 确保权限被正确包含
        };
        
        console.log('Mock login created userInfo:', userInfo);
        
        // 直接存储到本地存储
        const token = 'mock_token_' + Date.now();
        uni.setStorageSync('token', token);
        uni.setStorageSync('userInfo', userInfo);
        
        resolve({
          code: 1,
          data: {
            token: token,
            userInfo: userInfo
          },
          message: '登录成功'
        });
      } else {
        reject({
          code: 401,
          message: '用户名或密码错误'
        });
      }
    }, 1000);
  });
};

// 模拟注册
const mockRegister = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.username && data.password && data.email && data.verifyCode) {
        resolve({
          code: 200,
          data: {
            userId: 'user_' + Math.floor(Math.random() * 1000),
            username: data.username,
            email: data.email,
            role: data.role
          },
          message: '注册成功'
        });
      } else {
        reject({
          code: 400,
          message: '注册信息不完整或验证码错误'
        });
      }
    }, 1000);
  });
};

// 模拟发送邮箱验证码
const mockSendEmailVerifyCode = (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && email.includes('@')) {
        // 模拟验证码，实际应由后端生成并发送到邮箱
        const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('模拟发送验证码到邮箱:', email, '验证码:', mockCode);
        
        // 存储验证码到本地，仅用于模拟验证
        uni.setStorageSync('mockVerifyCode_' + email, mockCode);
        
        resolve({
          code: 200,
          message: '验证码已发送到邮箱',
          data: {
            // 在实际生产环境中不应返回验证码，这里仅为了方便测试
            mockCode: mockCode
          }
        });
      } else {
        reject({
          code: 400,
          message: '邮箱格式不正确'
        });
      }
    }, 1500);
  });
};

// 模拟验证邮箱验证码
const mockVerifyEmailCode = (email, code) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 从本地存储获取之前存储的验证码
      const storedCode = uni.getStorageSync('mockVerifyCode_' + email);
      
      if (storedCode && code === storedCode) {
        resolve({
          code: 200,
          message: '验证码验证成功'
        });
      } else {
        reject({
          code: 400,
          message: '验证码错误或已过期'
        });
      }
    }, 800);
  });
};

// 模拟获取用户信息
const mockGetUserInfo = () => {
  return new Promise((resolve, reject) => {
    // 从本地存储获取用户信息
    const userInfo = uni.getStorageSync('userInfo');
    
    if (userInfo) {
      // 获取角色权限
      const permissions = getRolePermissions(userInfo.role);
      
      resolve({
        code: 200,
        data: {
          ...userInfo,
          permissions
        }
      });
    } else {
      reject({
        code: 401,
        message: '未登录或登录已过期'
      });
    }
  });
};

// 模拟重置密码
const mockResetPassword = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('模拟密码重置:', data.email, data.newPassword);
      resolve({
        code: 200,
        data: {
          email: data.email
        },
        message: '密码重置成功'
      });
    }, 1000);
  });
};

// 模拟更新密码
const mockUpdatePassword = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('模拟密码更新:', data);
      resolve({
        code: 200,
        data: {
          email: data.email
        },
        message: '密码更新成功'
      });
    }, 1000);
  });
};

/**
 * 根据角色获取权限列表
 * @param {String} role 角色
 * @returns {Array} 权限列表
 */
const getRolePermissions = (role) => {
  // 定义不同角色的权限
  const permissionsMap = {
    // 环保部门权限
    environmental: [
      'realtime_monitoring', // 实时监测
      'data_analysis',       // 数据分析与预测
      'device_integration',  // 设备集成
      'rag_knowledge_base',  // RAG知识库助手
      'data_visualization'   // 数据可视化
    ],
    // 城市管理者权限
    cityManager: [
      'abnormal_warning',    // 异常预警
      'habit_learning',      // 习惯学习
      'data_visualization',  // 数据可视化
      'realtime_monitoring', // 实时监测
      'data_analysis',       // 数据分析与预测
      'device_integration',  // 设备集成
      'rag_knowledge_base',  // RAG知识库助手
      'information_disclosure' // 信息公开
    ],
    // 公众权限
    public: [
      'information_disclosure' // 信息公开
    ]
  };
  
  return permissionsMap[role] || [];
};

