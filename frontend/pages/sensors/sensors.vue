<template>
  <app-layout page-title="传感器管理">
    <view v-if="hasPermission" class="container">
    <el-row class="action-bar">
      <el-col :span="12">
        <el-button type="primary" @click="showAddModal" icon="Plus">添加传感器</el-button>
      </el-col>
      <el-col :span="12" class="text-right">
        <el-button @click="refreshSensors" icon="Refresh">刷新</el-button>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="sensor-list">
      <el-col v-for="sensor in sensors" :key="sensor.sensorId" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="sensor-card" shadow="hover">
          <div class="sensor-header">
            <div class="sensor-name">{{ sensor.name }}</div>
            <el-tag :type="sensor.status === 'online' ? 'success' : 'danger'" size="small" effect="dark">
              {{ sensor.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </div>
          <div class="sensor-body">
            <div class="sensor-info">
              <div class="info-item">
                <span class="label">ID:</span>
                <span class="value">{{ sensor.sensorId }}</span>
              </div>
              <div class="info-item">
                <span class="label">类型:</span>
                <span class="value">{{ sensor.type }}</span>
              </div>
              <div class="info-item">
                <span class="label">位置:</span>
                <span class="value">{{ sensor.location }}</span>
              </div>
              <div class="info-item">
                <span class="label">坐标:</span>
                <span class="value">{{ sensor.latitude }}, {{ sensor.longitude }}</span>
              </div>
            </div>
          </div>
          <div class="sensor-footer">
            <el-button size="small" @click="viewDetail(sensor)">查看数据</el-button>
            <el-button size="small" type="primary" @click="editSensor(sensor)">编辑</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(sensor)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 添加/编辑传感器弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑传感器' : '添加传感器'"
      width="30%"
      :close-on-click-modal="false"
      :show-close="true"
      @close="closePopup"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="传感器ID">
          <el-input v-model="formData.sensorId" placeholder="输入传感器ID" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="formData.name" placeholder="输入传感器名称"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="formData.type" placeholder="输入传感器类型"></el-input>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="formData.location" placeholder="输入安装位置"></el-input>
        </el-form-item>
        <el-form-item label="纬度">
          <el-input-number v-model="formData.latitude" :precision="6" :step="0.000001" :min="-90" :max="90"></el-input-number>
        </el-form-item>
        <el-form-item label="经度">
          <el-input-number v-model="formData.longitude" :precision="6" :step="0.000001" :min="-180" :max="180"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" placeholder="选择状态">
            <el-option label="在线" value="online"></el-option>
            <el-option label="离线" value="offline"></el-option>
            <el-option label="维护中" value="maintenance"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closePopup">取消</el-button>
          <el-button type="primary" @click="saveSensor">保存</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 确认删除对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
    >
      <div class="delete-confirm-content">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <p>确定要删除传感器 "{{ currentSensor?.name }}" 吗？</p>
        <p class="warning-text">此操作不可恢复。</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeConfirmPopup">取消</el-button>
          <el-button type="danger" @click="deleteSensor">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </view>
  <view v-else class="no-permission">
    <el-empty description="您没有权限访问此页面"></el-empty>
  </view>
  </app-layout>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import AppLayout from '../../components/AppLayout.vue'
import api from '../../api/index'
import { getRolePermissions, checkFeaturePermission } from '../../utils/permission'
import { ElMessage, ElLoading } from 'element-plus'

export default {
  components: {
    AppLayout
  },
  setup() {
    // 传感器列表
    const sensors = ref([])
    
    // 弹窗状态
    const dialogVisible = ref(false)
    const deleteDialogVisible = ref(false)
    
    // 表单数据
    const formData = reactive({
      sensorId: '',
      name: '',
      type: '',
      location: '',
      latitude: '',
      longitude: '',
      status: 'online'
    })
    
    // 编辑模式
    const isEdit = ref(false)
    
    // 当前选中的传感器
    const currentSensor = ref(null)
    
    // 添加权限检查
    const userInfo = uni.getStorageSync('userInfo')
    const hasPermission = ref(false)
    
    // 检查权限
    const checkPermission = () => {
      if (!userInfo) {
        console.log('No user info found')
        return false
      }
      
      let permissions = []
      if (userInfo.permissions) {
        permissions = userInfo.permissions
      } else {
        permissions = getRolePermissions(userInfo.role)
      }
      
      console.log('Sensors page - User role:', userInfo.role)
      console.log('Sensors page - User permissions:', permissions)
      
      // 检查是否有设备集成权限
      const permitted = permissions.includes('device_integration')
      console.log('Sensors page - Has device_integration permission:', permitted)
      return permitted
    }
    
    // 设置权限状态
    hasPermission.value = checkPermission()
    console.log('Sensors page - Has permission:', hasPermission.value)
    
    // 加载传感器列表
    const loadSensors = async () => {
      try {
        const loadingInstance = ElLoading.service({
          fullscreen: true,
          text: '加载中...'
        })
        
        const response = await api.sensor.getAllSensors()
        sensors.value = response.data
        
        loadingInstance.close()
      } catch (error) {
        console.error('Failed to load sensors', error)
        ElMessage.error('加载传感器列表失败')
      }
    }
    
    // 刷新传感器列表
    const refreshSensors = () => {
      loadSensors()
    }
    
    // 显示添加传感器弹窗
    const showAddModal = () => {
      isEdit.value = false
      resetForm()
      dialogVisible.value = true
    }
    
    // 显示编辑传感器弹窗
    const editSensor = (sensor) => {
      isEdit.value = true
      currentSensor.value = sensor
      
      // 填充表单数据
      formData.sensorId = sensor.sensorId
      formData.name = sensor.name
      formData.type = sensor.type
      formData.location = sensor.location
      formData.latitude = sensor.latitude
      formData.longitude = sensor.longitude
      formData.status = sensor.status
      
      dialogVisible.value = true
    }
    
    // 关闭弹窗
    const closePopup = () => {
      dialogVisible.value = false
    }
    
    // 重置表单
    const resetForm = () => {
      formData.sensorId = ''
      formData.name = ''
      formData.type = ''
      formData.location = ''
      formData.latitude = ''
      formData.longitude = ''
      formData.status = 'online'
    }
    
    // 保存传感器
    const saveSensor = async () => {
      // 表单验证
      if (!formData.sensorId || !formData.name) {
        ElMessage.warning('传感器ID和名称不能为空')
        return
      }
      
      try {
        const loadingInstance = ElLoading.service({
          fullscreen: true,
          text: '保存中...'
        })
        
        const sensorData = {
          sensorId: formData.sensorId,
          name: formData.name,
          type: formData.type,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          status: formData.status
        }
        
        if (isEdit.value) {
          // 更新传感器
          await api.sensor.updateSensor(formData.sensorId, sensorData)
        } else {
          // 添加传感器
          await api.sensor.addSensor(sensorData)
        }
        
        loadingInstance.close()
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        
        closePopup()
        loadSensors()
      } catch (error) {
        console.error('Failed to save sensor', error)
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      }
    }
    
    // 确认删除
    const confirmDelete = (sensor) => {
      currentSensor.value = sensor
      deleteDialogVisible.value = true
    }
    
    // 关闭确认弹窗
    const closeConfirmPopup = () => {
      deleteDialogVisible.value = false
    }
    
    // 删除传感器
    const deleteSensor = async () => {
      if (!currentSensor.value) return
      
      try {
        const loadingInstance = ElLoading.service({
          fullscreen: true,
          text: '删除中...'
        })
        
        await api.sensor.deleteSensor(currentSensor.value.sensorId)
        
        loadingInstance.close()
        ElMessage.success('删除成功')
        
        closeConfirmPopup()
        loadSensors()
      } catch (error) {
        console.error('Failed to delete sensor', error)
        ElMessage.error('删除失败')
      }
    }
    
    // 查看详情
    const viewDetail = (sensor) => {
      uni.navigateTo({
        url: `/pages/detail/detail?sensorId=${sensor.sensorId}`
      })
    }
    
    // 页面加载
    onMounted(() => {
      loadSensors()
    })
    
    return {
      sensors,
      dialogVisible,
      deleteDialogVisible,
      formData,
      isEdit,
      currentSensor,
      loadSensors,
      refreshSensors,
      showAddModal,
      editSensor,
      closePopup,
      saveSensor,
      confirmDelete,
      closeConfirmPopup,
      deleteSensor,
      viewDetail,
      hasPermission
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.text-right {
  text-align: right;
}

.sensor-list {
  .el-col {
    margin-bottom: 20px;
  }
  
  .sensor-card {
    height: 100%;
    
    .sensor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      .sensor-name {
        font-size: 16px;
        font-weight: bold;
      }
    }
    
    .sensor-body {
      margin-bottom: 15px;
      
      .sensor-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        
        .info-item {
          display: flex;
          align-items: center;
          
          .label {
            font-size: 13px;
            color: #666;
            margin-right: 5px;
          }
          
          .value {
            font-size: 13px;
            color: #333;
            word-break: break-all;
          }
        }
      }
    }
    
    .sensor-footer {
      display: flex;
      justify-content: flex-end;
      gap: 5px;
    }
  }
}

.delete-confirm-content {
  text-align: center;
  padding: 20px 0;
  
  .warning-icon {
    font-size: 48px;
    color: #E6A23C;
    margin-bottom: 15px;
  }
  
  .warning-text {
    color: #F56C6C;
    font-size: 14px;
    margin-top: 10px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.no-permission {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
</style> 