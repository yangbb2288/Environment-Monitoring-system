<template>
  <div class="page-container">
    <el-card v-if="title || hasHeaderSlot" class="page-header">
      <div class="header-content">
        <div class="left-section">
          <h2 v-if="title" class="page-title">{{ title }}</h2>
          <slot name="header"></slot>
        </div>
        <div class="right-section">
          <slot name="actions"></slot>
        </div>
      </div>
    </el-card>
    
    <div class="page-content">
      <slot></slot>
    </div>
    
    <div v-if="hasFooterSlot" class="page-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import { ref, useSlots, computed } from 'vue'

export default {
  name: 'PageContainer',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const slots = useSlots()
    
    const hasHeaderSlot = computed(() => !!slots.header)
    const hasFooterSlot = computed(() => !!slots.footer)
    
    return {
      hasHeaderSlot,
      hasFooterSlot
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--app-container-padding, 16px);
  
  .page-header {
    margin-bottom: var(--app-element-gap, 16px);
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .left-section {
        flex: 1;
        
        .page-title {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
      
      .right-section {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }
  }
  
  .page-content {
    flex: 1;
  }
  
  .page-footer {
    margin-top: var(--app-element-gap, 16px);
  }
}

@media screen and (max-width: 768px) {
  .page-container {
    padding: 12px;
    
    .page-header {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        
        .right-section {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style> 