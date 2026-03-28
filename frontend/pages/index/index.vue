<template>
	<app-layout page-title="首页">
		<page-container title="环境监测系统">
			<div class="dashboard-container">
				<!-- 左侧地图区域 -->
				<div class="map-container">
					<div class="section-title">传感器分布</div>
					<div id="map-container" class="amap-container"></div>
				</div>
				
				<!-- 右侧信息区域 -->
				<div class="info-container">
					<!-- 右上角仪表盘 -->
					<div class="dashboard-panel">
						<div class="section-title">实时数据</div>
						<div class="gauge-container">
							<e-charts :option="combinedGaugeOption" class="combined-gauge-chart"></e-charts>
						</div>
							</div>
					
					<!-- 右下角传感器列表 -->
					<div class="sensors-panel">
						<div class="section-header">
							<div class="section-title">传感器列表</div>
							<el-button type="primary" size="small" @click="showAddSensorDialog">
								<el-icon><plus /></el-icon> 添加传感器
							</el-button>
						</div>
						
						<div class="sensors-table-container">
							<el-table :data="sensors" style="width: 100%" size="small" :max-height="tableHeight">
								<el-table-column prop="id" label="ID" width="60" />
								<el-table-column prop="name" label="名称" />
								<el-table-column prop="location" label="位置" />
								<el-table-column prop="status" label="状态" width="80">
									<template #default="scope">
										<el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'">
											{{ scope.row.status === 'online' ? '在线' : '离线' }}
										</el-tag>
									</template>
								</el-table-column>
								<el-table-column label="操作" width="80">
									<template #default="scope">
										<el-button type="danger" size="small" text @click="deleteSensor(scope.row)">
											<el-icon><delete /></el-icon>
										</el-button>
									</template>
								</el-table-column>
							</el-table>
						</div>
					</div>
				</div>
			</div>
			
			<!-- 添加传感器对话框 -->
			<el-dialog v-model="addSensorDialogVisible" title="添加传感器" width="500px">
				<el-form :model="newSensor" label-width="80px">
					<el-form-item label="名称">
						<el-input v-model="newSensor.name" placeholder="请输入传感器名称"></el-input>
					</el-form-item>
					<el-form-item label="位置">
						<el-input v-model="newSensor.location" placeholder="请输入传感器位置"></el-input>
					</el-form-item>
					<el-form-item label="经度">
						<el-input-number v-model="newSensor.longitude" :precision="6" :step="0.000001" :min="73" :max="135" placeholder="经度"></el-input-number>
					</el-form-item>
					<el-form-item label="纬度">
						<el-input-number v-model="newSensor.latitude" :precision="6" :step="0.000001" :min="18" :max="53" placeholder="纬度"></el-input-number>
					</el-form-item>
					<el-form-item label="类型">
						<el-select v-model="newSensor.type" placeholder="请选择传感器类型">
							<el-option label="温度" value="temperature"></el-option>
							<el-option label="湿度" value="humidity"></el-option>
							<el-option label="可燃气体" value="gas"></el-option>
							<el-option label="综合" value="comprehensive"></el-option>
						</el-select>
					</el-form-item>
				</el-form>
				<template #footer>
					<span class="dialog-footer">
						<el-button @click="addSensorDialogVisible = false">取消</el-button>
						<el-button type="primary" @click="addSensor">确认</el-button>
					</span>
				</template>
			</el-dialog>
		</page-container>
	</app-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, nextTick } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PageContainer from '../../components/PageContainer.vue';
import ECharts from '../../components/ECharts.vue';
import api from '../../api/sensor';
import envData from '../../api/envData';

// 地图实例
let map = null;
let markers = [];
let dataUpdateInterval = null;

// 表格高度
const tableHeight = ref(240);

// 传感器数据
const sensors = ref([
	{ id: 1, name: '传感器A', location: '北京市海淀区', longitude: 116.3, latitude: 39.9, status: 'online', type: 'comprehensive' },
	{ id: 2, name: '传感器B', location: '上海市浦东新区', longitude: 121.5, latitude: 31.2, status: 'online', type: 'temperature' },
	{ id: 3, name: '传感器C', location: '广州市天河区', longitude: 113.3, latitude: 23.1, status: 'offline', type: 'humidity' },
	{ id: 4, name: '传感器D', location: '深圳市南山区', longitude: 114.1, latitude: 22.5, status: 'online', type: 'gas' },
	{ id: 5, name: '传感器E', location: '成都市武侯区', longitude: 104.1, latitude: 30.6, status: 'online', type: 'comprehensive' },
	{ id: 6, name: '传感器F', location: '重庆市渝中区', longitude: 106.5, latitude: 29.5, status: 'offline', type: 'temperature' },
	{ id: 7, name: '传感器G', location: '西安市雁塔区', longitude: 108.9, latitude: 34.2, status: 'online', type: 'humidity' },
	{ id: 8, name: '传感器H', location: '南京市鼓楼区', longitude: 118.8, latitude: 32.1, status: 'online', type: 'gas' }
]);

// 添加传感器对话框
const addSensorDialogVisible = ref(false);
const newSensor = reactive({
	name: '',
	location: '',
	longitude: 116.3,
	latitude: 39.9,
	type: 'comprehensive'
});

// 仪表盘数据
const gaugeData = [
	{
		value: 25,
		name: '温度',
		title: {
			offsetCenter: ['-60%', '80%']
		},
		detail: {
			offsetCenter: ['-60%', '95%'],
			formatter: '{value}°C',
			color: '#fff',
			backgroundColor: '#FACC14',
			borderRadius: 3
		},
		itemStyle: {
			color: '#FACC14'
		}
	},
	{
		value: 45,
		name: '湿度',
		title: {
			offsetCenter: ['0%', '80%']
		},
		detail: {
			offsetCenter: ['0%', '95%'],
			formatter: '{value}%',
			color: '#fff',
			backgroundColor: '#36A3EB',
			borderRadius: 3
		},
		itemStyle: {
			color: '#36A3EB'
		}
	},
	{
		value: 15,
		name: '可燃气体',
		title: {
			offsetCenter: ['60%', '80%']
		},
		detail: {
			offsetCenter: ['60%', '95%'],
			formatter: '{value}%LEL',
			color: '#fff',
			backgroundColor: '#FF9F43',
			borderRadius: 3
		},
		itemStyle: {
			color: '#FF9F43'
		}
	}
];

// 组合仪表盘配置
const combinedGaugeOption = ref({
	series: [
		{
			type: 'gauge',
			min: 0,
			max: 100,
			radius: '75%',
			center: ['50%', '45%'],
			startAngle: 210,
			endAngle: -30,
			anchor: {
				show: true,
				showAbove: true,
				size: 18,
				itemStyle: {
					color: '#FAC858'
				}
			},
			pointer: {
				icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
				width: 8,
				length: '80%',
				offsetCenter: [0, '8%']
			},
			progress: {
				show: true,
				overlap: true,
				roundCap: true,
				width: 15
			},
			axisLine: {
				roundCap: true,
				lineStyle: {
					width: 15
				}
			},
			splitLine: {
				show: false
			},
			axisTick: {
				show: false
			},
			axisLabel: {
				show: false
			},
			data: gaugeData,
			title: {
				fontSize: 14,
				color: '#464646'
			},
			detail: {
				width: 40,
				height: 14,
				fontSize: 14,
				borderRadius: 3
			},
			z: 10
		}
	]
});

// 初始化地图
const initMap = () => {
	// 确保AMap已加载
	if (window.AMap) {
		// 创建地图实例
		map = new AMap.Map('map-container', {
			zoom: 4,
			center: [104.5, 38.0],  // 中国中心点
			resizeEnable: true
		});
		
		// 添加传感器标记
		addSensorsToMap();
		
		// 添加地图控件
		map.addControl(new AMap.Scale());
		map.addControl(new AMap.ToolBar());
	} else {
		console.error('AMap not loaded');
	}
};

// 添加传感器到地图
const addSensorsToMap = () => {
	if (!map) return;
	
	// 清除现有标记
	if (markers.length > 0) {
		map.remove(markers);
		markers = [];
	}
	
	// 添加新标记
	sensors.value.forEach(sensor => {
		const marker = new AMap.Marker({
			position: [sensor.longitude, sensor.latitude],
			title: sensor.name,
			icon: new AMap.Icon({
				size: new AMap.Size(32, 32),
				image: sensor.status === 'online' ? 
					'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png' : 
					'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
			})
		});
		
		// 添加点击事件
		marker.on('click', () => {
			map.setZoomAndCenter(10, [sensor.longitude, sensor.latitude]);
			
			// 显示信息窗体
			const infoWindow = new AMap.InfoWindow({
				content: `
					<div style="padding: 8px">
						<h4>${sensor.name}</h4>
						<p>位置: ${sensor.location}</p>
						<p>状态: ${sensor.status === 'online' ? '在线' : '离线'}</p>
						<p>类型: ${getSensorTypeText(sensor.type)}</p>
					</div>
				`,
				offset: new AMap.Pixel(0, -30)
			});
			
			infoWindow.open(map, [sensor.longitude, sensor.latitude]);
		});
		
		markers.push(marker);
		map.add(marker);
	});
};

// 获取传感器类型文本
const getSensorTypeText = (type) => {
	const typeMap = {
		'temperature': '温度',
		'humidity': '湿度',
		'gas': '可燃气体',
		'comprehensive': '综合'
	};
	return typeMap[type] || type;
};

// 显示添加传感器对话框
const showAddSensorDialog = () => {
	// 重置表单
	Object.assign(newSensor, {
		name: '',
		location: '',
		longitude: 116.3,
		latitude: 39.9,
		type: 'comprehensive'
	});
	addSensorDialogVisible.value = true;
};

// 添加传感器
const addSensor = async () => {
	if (!newSensor.name || !newSensor.location) {
		ElMessage.warning('请填写传感器名称和位置');
		return;
	}
	
	try {
		// 模拟API调用
		// const response = await api.sensor.addSensor(newSensor);
		
		// 添加到本地数据
		const sensorId = sensors.value.length > 0 ? Math.max(...sensors.value.map(s => s.id)) + 1 : 1;
		sensors.value.push({
			id: sensorId,
			name: newSensor.name,
			location: newSensor.location,
			longitude: newSensor.longitude,
			latitude: newSensor.latitude,
			status: 'online',
			type: newSensor.type
		});
		
		// 更新地图
		addSensorsToMap();
		
		ElMessage.success('添加传感器成功');
		addSensorDialogVisible.value = false;
	} catch (error) {
		ElMessage.error('添加传感器失败: ' + error.message);
	}
};

// 删除传感器
const deleteSensor = (sensor) => {
	ElMessageBox.confirm(
		`确定要删除传感器 ${sensor.name} 吗？`,
		'警告',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(async () => {
		try {
			// 模拟API调用
			// await api.sensor.deleteSensor(sensor.id);
			
			// 从本地数据中删除
			sensors.value = sensors.value.filter(s => s.id !== sensor.id);
			
			// 更新地图
			addSensorsToMap();
			
			ElMessage.success('删除传感器成功');
		} catch (error) {
			ElMessage.error('删除传感器失败: ' + error.message);
		}
	}).catch(() => {});
};

// 获取最新数据
const fetchLatestData = async () => {
	try {
		// 调用API获取最新数据
		const response = await envData.getLatestData();
		console.log(response);
		if (response && response.data.code === 1 && response.data) {
			const data = response.data.data;
			
			// 计算可燃气体浓度（转换为%LEL）
			// 假设combustibleGas单位为ppm，转换为%LEL (假设100%LEL = 10000ppm)
			const gasConcentration = (parseFloat(data.combustibleGas) / 100).toFixed(1);
			
			// 更新仪表盘数据
			const updatedGaugeData = [
				{
					...gaugeData[0],
					value: parseFloat(parseFloat(data.temperature).toFixed(1))
				},
				{
					...gaugeData[1],
					value: parseFloat(parseFloat(data.humidity).toFixed(1))
				},
				{
					...gaugeData[2],
					value: parseFloat(gasConcentration)
				}
			];
			
			// 对数据进行排序，使较小的值显示在上层
			const sortedData = [...updatedGaugeData].sort((a, b) => b.value - a.value);
			
			// 更新图表
			combinedGaugeOption.value = {
				series: [
					{
						...combinedGaugeOption.value.series[0],
						data: sortedData
					}
				]
			};
			
			console.log('获取最新数据成功:', data);
		} else {
			console.error('获取最新数据失败: 响应格式不正确', response);
		}
	} catch (error) {
		console.error('获取最新数据失败:', error);
	}
};

// 生命周期钩子
onMounted(() => {
	// 加载高德地图
	const script = document.createElement('script');
	script.src = 'https://webapi.amap.com/maps?v=2.0&key=aa99606ce20cf8884fcbe601868cc8ef';
	script.onload = () => {
		initMap();
	};
	document.head.appendChild(script);
	
	// 获取初始数据
	fetchLatestData();
	
	// 定时更新数据
	dataUpdateInterval = setInterval(fetchLatestData, 3000);
	
	// 计算表格高度
	nextTick(() => {
		const sensorsPanelEl = document.querySelector('.sensors-panel');
		if (sensorsPanelEl) {
			const headerHeight = sensorsPanelEl.querySelector('.section-header').offsetHeight;
			tableHeight.value = sensorsPanelEl.clientHeight - headerHeight - 32; // 32px for padding
		}
	});
});

onUnmounted(() => {
	// 清除数据更新定时器
	if (dataUpdateInterval) {
		clearInterval(dataUpdateInterval);
	}
	
	// 销毁地图实例
	if (map) {
		map.destroy();
		map = null;
	}
});
</script>

<style lang="scss" scoped>
.dashboard-container {
	display: flex;
	gap: 20px;
	width: 100%;
	padding: 0 0 20px 0;
	
	.map-container {
		width: 66%;
		height: 600px;
		background-color: #fff;
		border-radius: var(--el-border-radius-base);
		box-shadow: var(--el-box-shadow-light);
		padding: 16px;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		
		.amap-container {
			flex: 1;
			width: 100%;
		}
	}
	
	.info-container {
		width: calc(34% - 20px);
		display: flex;
		flex-direction: column;
		gap: 20px;
		
		.dashboard-panel, .sensors-panel {
			width: 100%;
			height: 290px;
			background-color: #fff;
			border-radius: var(--el-border-radius-base);
			box-shadow: var(--el-box-shadow-light);
			padding: 16px;
			box-sizing: border-box;
		}
		
		.dashboard-panel {
			display: flex;
			flex-direction: column;
			
			.section-title {
				margin-bottom: 8px;
			}
			
			.gauge-container {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				
				.combined-gauge-chart {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 95%;
					height: 95%;
				}
			}
		}
		
		.sensors-panel {
	display: flex;
	flex-direction: column;
			overflow: hidden;
			
			.section-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 12px;
			}
			
			.sensors-table-container {
				flex: 1;
				overflow: hidden;
				
				:deep(.el-table) {
					--el-table-border-color: var(--el-border-color-lighter);
					--el-table-border: 1px solid var(--el-table-border-color);
					--el-table-text-color: var(--el-text-color-regular);
					--el-table-header-text-color: var(--el-text-color-secondary);
					--el-table-row-hover-bg-color: var(--el-fill-color-light);
					--el-table-current-row-bg-color: var(--el-color-primary-light-9);
					--el-table-header-bg-color: var(--el-fill-color-light);
					--el-table-fixed-box-shadow: none;
					--el-table-bg-color: var(--el-fill-color-blank);
					--el-table-tr-bg-color: var(--el-fill-color-blank);
					--el-table-expanded-cell-bg-color: var(--el-fill-color-blank);
					--el-table-fixed-left-column: none;
					--el-table-fixed-right-column: none;
				}
				
				:deep(.el-table__fixed-right) {
					box-shadow: none !important;
					background-color: transparent !important;
				}
				
				:deep(.el-table__fixed-right-patch) {
					background-color: transparent !important;
				}
				
				:deep(.el-scrollbar__wrap) {
					overflow-x: hidden;
				}
			}
		}
	}
}

.section-title {
	font-size: 16px;
	font-weight: 500;
	margin-bottom: 16px;
	color: var(--el-text-color-primary);
}
</style>