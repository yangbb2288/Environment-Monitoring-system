# Element Plus 集成说明

本项目已经集成了 Element Plus 组件库，并对原有的 UniApp 项目进行了全面的样式美化和升级。

## 主要变更

1. **引入 Element Plus**
   - 安装了 Element Plus 及其图标库
   - 配置了自动导入和按需加载
   - 创建了自定义主题，与原有颜色方案保持一致

2. **Vue 3 语法升级**
   - 将组件从 Options API 升级到 Composition API
   - 使用 `<script setup>` 语法简化组件代码
   - 使用 `defineProps` 和 `defineEmits` 替代 `props` 和 `emits` 选项

3. **组件升级**
   - 登录页面：使用 Element Plus 表单、输入框、按钮等组件
   - 首页：使用 Element Plus 卡片、标签、图标等组件
   - 数据卡片：使用 Element Plus 卡片和图标
   - 传感器选择器：使用 Element Plus 复选框组
   - 日期范围选择器：使用 Element Plus 日期选择器

4. **样式优化**
   - 使用 Element Plus 变量系统，确保样式一致性
   - 优化了移动端适配
   - 增强了组件间的视觉一致性

## 使用说明

### 主题定制

项目使用了自定义主题，主题文件位于 `theme/element-plus-theme.scss`。你可以在此文件中修改颜色、字体大小等变量。

### 组件使用

所有 Element Plus 组件都已全局注册，可以直接在模板中使用。例如：

```vue
<template>
  <el-button type="primary">按钮</el-button>
</template>
```

### 图标使用

Element Plus 图标已全局注册，可以直接使用：

```vue
<template>
  <el-icon><Search /></el-icon>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
</script>
```

## 注意事项

1. 本项目同时支持 UniApp 原生组件和 Element Plus 组件，但建议优先使用 Element Plus 组件以保持视觉一致性。

2. 在小程序环境中，部分 Element Plus 组件可能存在兼容性问题，请根据具体情况选择合适的组件。

3. 自定义主题使用了 CSS 变量，确保在所有支持的平台上都能正确渲染。 