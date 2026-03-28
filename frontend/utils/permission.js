/**
 * 权限控制工具
 */

// 页面权限映射
const pagePermissions = {
	// 首页 - 所有人可访问
	'pages/index/index': ['*'],
	
	// 数据看板 - 环保部门和城市管理者可访问
	'pages/dashboard/dashboard': ['realtime_monitoring', 'data_visualization'],
	
	// 传感器管理 - 环保部门和城市管理者可访问
	'pages/sensors/sensors': ['device_integration', 'abnormal_warning', 'habit_learning'],
	
	// 数据分析 - 环保部门和城市管理者可访问
	'pages/analysis/analysis': ['data_analysis', 'data_visualization', 'abnormal_warning', 'habit_learning'],
	
	// 区域对比 - 城市管理者可访问
	'pages/comparison/comparison': ['data_visualization'],
	
	// 历史回溯 - 环保部门、城市管理者和公众可访问
	'pages/history/history': ['data_analysis', 'data_visualization', 'information_disclosure'],
	
	// 详细数据 - 环保部门和城市管理者可访问
	'pages/detail/detail': ['data_analysis', 'data_visualization'],
	
	// 异常预警 - 城市管理者可访问
	'pages/warning/warning': ['abnormal_warning'],
	
	// 习惯学习 - 城市管理者可访问
	'pages/learning/learning': ['habit_learning'],
	
	// RAG知识库助手 - 环保部门和城市管理者可访问
	'pages/knowledge/knowledge': ['rag_knowledge_base', 'data_visualization']
  };
  
  // 功能权限映射到角色
  export const featurePermissions = {
	// 环保部门功能
	realtime_monitoring: '实时监测', // 城区空气主要污染物自动采集
	data_analysis: '数据分析与预测', // 应用大数据与机器学习方法，对各项污染物浓度变化趋势、季节性及空间分布做深入分析
	device_integration: '设备集成', // 支持对喷雾降尘、空气净化等措施的联动自动触发
	rag_knowledge_base: 'RAG知识库助手', // RAG知识库集成国内外环保经验，为每次异常警报自动推荐治理与改善措施
	
	// 城市管理者功能
	abnormal_warning: '异常预警', // 当任一指标超过设定阈值时，自动推送短信/APP/邮件
	habit_learning: '习惯学习', // 系统对历史污染记录分析后，主动优化监测频率与告警触发机制
	data_visualization: '数据可视化', // 提供热力图、线性趋势、分布雷达等多种可视化方式
	
	// 公众功能
	information_disclosure: '信息公开' // 面向社会开放当前及历史空气质量数据
  };
  
  // 角色对应的功能权限
export const roleFeatures = {
	environmental: [
	  'realtime_monitoring', 
	  'data_analysis', 
	  'device_integration', 
	  'rag_knowledge_base',
	  'information_disclosure' // 环保部门也可以访问公众权限
	],
	cityManager: [
	  'abnormal_warning', 
	  'habit_learning', 
	  'data_visualization',
	  'realtime_monitoring', 
	  'data_analysis',
	  'device_integration',
	  'rag_knowledge_base',
	  'information_disclosure' // 城市管理者可以访问所有权限
	],
	public: [
	  'information_disclosure'
	]
  };
  
  /**
   * 检查用户是否有权限访问指定页面
   * @param {String} pagePath 页面路径
   * @param {Array} userPermissions 用户权限列表
   * @returns {Boolean} 是否有权限
   */
  export const checkPagePermission = (pagePath, userPermissions) => {
	console.log('checkPagePermission called for page:', pagePath, 'with permissions:', userPermissions);
	
	// 登录、注册和忘记密码页面无需权限
	if (pagePath === 'pages/login/login' || pagePath === 'pages/login/register' || pagePath === 'pages/login/forgot-password') {
		console.log('Login/register/forgot-password page, permission granted');
		return true;
	}
	
	// 获取页面所需权限
	const requiredPermissions = pagePermissions[pagePath] || [];
	console.log('Required permissions for page', pagePath, ':', requiredPermissions);
	
	// 如果页面权限包含'*'，表示所有人可访问
	if (requiredPermissions.includes('*')) {
		console.log('Page has * permission, access granted');
		return true;
	}
	
	// 检查用户是否有任一所需权限
	const hasPermission = userPermissions.some(permission => requiredPermissions.includes(permission));
	console.log('User has required permission?', hasPermission);
	return hasPermission;
  };
  
  /**
   * 检查用户是否有指定功能的权限
   * @param {String} feature 功能标识
   * @param {Array} userPermissions 用户权限列表
   * @returns {Boolean} 是否有权限
   */
  export const checkFeaturePermission = (feature, userPermissions) => {
	return userPermissions.includes(feature);
  };
  
  /**
   * 获取用户可访问的页面路径列表
   * @param {Array} userPermissions 用户权限列表
   * @returns {Array} 可访问的页面路径列表
   */
  export const getAccessiblePages = (userPermissions) => {
	return Object.keys(pagePermissions).filter(pagePath => {
	  const requiredPermissions = pagePermissions[pagePath];
	  
	  // 如果页面权限包含'*'，表示所有人可访问
	  if (requiredPermissions.includes('*')) {
		return true;
	  }
	  
	  // 检查用户是否有任一所需权限
	  return userPermissions.some(permission => requiredPermissions.includes(permission));
	});
  };
  
  /**
   * 路由拦截器，检查页面访问权限
   * @param {Object} options 路由选项
   * @returns {Boolean} 是否允许访问
   */
  export const routeInterceptor = (options) => {
	console.log('Route interceptor:', options.url);
	
	// 登录和注册页面无需拦截
	if (options.url.includes('/pages/login/login') || options.url.includes('/pages/login/register') || options.url.includes('/pages/login/forgot-password')) {
		console.log('Login/register page, allowing access');
		return true;
	}
	
	// 获取用户信息
	const userInfo = uni.getStorageSync('userInfo');
	
	// 如果未登录，跳转到登录页
	if (!userInfo) {
		console.log('No user info, redirecting to login');
		uni.redirectTo({
			url: '/pages/login/login'
		});
		return false;
	}
	
	// 获取用户权限
	let userPermissions = [];
	if (userInfo.permissions) {
		// 如果用户信息中已有权限列表，直接使用
		userPermissions = userInfo.permissions;
	} else {
		// 否则根据角色获取权限
		userPermissions = getRolePermissions(userInfo.role);
		
		// 将权限列表保存到用户信息中，避免重复计算
		userInfo.permissions = userPermissions;
		uni.setStorageSync('userInfo', userInfo);
	}
	
	console.log('User role:', userInfo.role);
	console.log('User permissions:', userPermissions);
	
	// 提取页面路径
	const pagePath = options.url.split('?')[0].replace(/^\//, '');
	console.log('Checking permission for page:', pagePath);
	
	// tabBar页面特殊处理
	const tabBarPages = [
		'pages/index/index',
		'pages/dashboard/dashboard',
		'pages/sensors/sensors',
		'pages/analysis/analysis'
	];
	
	// 检查权限
	if (!checkPagePermission(pagePath, userPermissions)) {
		console.log('Permission denied for page:', pagePath);
		
		// 如果是tabBar页面，显示提示但不阻止跳转
		// 在页面内部通过v-if控制内容显示
		if (tabBarPages.includes(pagePath)) {
			console.log('TabBar page with no permission, allowing navigation but will hide content');
			uni.showToast({
				title: '您没有权限查看该页面内容',
				icon: 'none'
			});
			return true;
		}
		
		uni.showToast({
			title: '您没有权限访问该页面',
			icon: 'none'
		});
		
		// 跳转到首页
		setTimeout(() => {
			uni.switchTab({
				url: '/pages/index/index'
			});
		}, 1500);
		
		return false;
	}
	
	console.log('Permission granted for page:', pagePath);
	return true;
  };
  
  /**
   * 根据角色获取权限列表
   * @param {String} role 角色
   * @returns {Array} 权限列表
   */
  export const getRolePermissions = (role) => {
	// 使用预定义的角色特性映射
	return roleFeatures[role] || [];
  };