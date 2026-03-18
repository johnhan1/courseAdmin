<template>
  <div class="col-card col-content">
    <div class="col-header">
      <div class="col-title">
        <el-icon><Menu /></el-icon>
        <span>内容管理</span>
      </div>
    </div>
    
    <div class="col-body" v-if="activeItem">
      <div class="form-group">
        <el-input 
          :model-value="activeItem.name" 
          @update:model-value="updateName"
          class="lesson-title-input" 
        />
      </div>

      <div class="upload-area" v-if="!activeItem.resource">
        <el-upload
          class="content-uploader"
          drag
          action="/api/upload"
          :show-file-list="false"
          :on-success="onUploadSuccess"
        >
          <div class="upload-inner">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">点击或拖拽文件上传</div>
            <div class="upload-tip">支持 MP4, PDF, PPT (最大 500MB)</div>
            <div class="supported-icons">
              <el-icon class="icon-pdf" color="#E74C3C"><File /></el-icon>
              <el-icon class="icon-video" color="#3498DB"><Video /></el-icon>
              <el-icon class="icon-ppt" color="#F39C12"><DataBoard /></el-icon>
            </div>
          </div>
        </el-upload>
      </div>
      
      <div class="uploaded-file-card" v-else>
        <div class="file-icon-wrapper">
          <el-icon v-if="activeItem.resource.type === 'video'" class="file-icon" color="#3498DB"><Video /></el-icon>
          <el-icon v-else class="file-icon" color="#E74C3C"><File /></el-icon>
        </div>
        <div class="file-info">
          <div class="file-name">{{ activeItem.resource.name }}</div>
          <div class="file-meta">{{ activeItem.resource.size || '124.5 MB' }} · 已上传</div>
        </div>
        <div class="file-actions">
          <el-button link><el-icon><View /></el-icon></el-button>
          <el-button link type="danger" @click="emit('remove-resource')"><el-icon><Delete /></el-icon></el-button>
        </div>
      </div>

      <el-button class="import-btn" @click="emit('open-resource-modal')" plain>
        <el-icon><Files /></el-icon> 从素材库导入
      </el-button>
    </div>
    
    <div class="col-body empty-state" v-else>
      <el-empty description="请先在左侧选择或添加章节/小节" />
    </div>
  </div>
</template>

<script setup>
import { Menu, UploadFilled, DataBoard, View, Delete, Files } from '@element-plus/icons-vue'
import { Video, File } from 'lucide-vue-next'

const props = defineProps({
  activeItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:activeItem', 'remove-resource', 'open-resource-modal', 'upload-success', 'update-name'])

const updateName = (val) => {
  emit('update-name', val)
}

const onUploadSuccess = (res, file) => {
  emit('upload-success', { res, file })
}
</script>

<style scoped lang="scss">
.col-card {
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px 0 rgba(0,0,0,0.05);
  border: 1px solid #ebeef5;
  
  &.col-content { flex: 2; }

  .col-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f2f5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .col-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 15px;
      color: #1f2225;

      .el-icon {
        color: #8c939d;
      }
    }
  }

  .col-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    &.empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.form-group {
  margin-bottom: 24px;

  .lesson-title-input {
    :deep(.el-input__wrapper) {
      background-color: #f8f9fa;
      box-shadow: none;
      border: 1px solid transparent;
      padding: 4px 12px;
      
      &.is-focus {
        background-color: #fff;
        border-color: #409eff;
        box-shadow: 0 0 0 1px #409eff inset;
      }

      .el-input__inner {
        font-size: 16px;
        font-weight: 500;
        color: #1f2225;
      }
    }
  }
}

.upload-area {
  margin-bottom: 24px;

  .content-uploader {
    :deep(.el-upload-dragger) {
      padding: 40px;
      background: #f8f9fa;
      border: 2px dashed #dcdfe6;
      border-radius: 12px;
      
      &:hover {
        border-color: #1890ff;
        background: #f0f5ff;
      }
    }
  }

  .upload-inner {
    display: flex;
    flex-direction: column;
    align-items: center;

    .upload-icon {
      font-size: 48px;
      color: #91d5ff;
      margin-bottom: 16px;
    }

    .upload-text {
      font-size: 16px;
      color: #303133;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .upload-tip {
      font-size: 13px;
      color: #8c939d;
      margin-bottom: 20px;
    }

    .supported-icons {
      display: flex;
      gap: 16px;
      font-size: 24px;
    }
  }
}

.uploaded-file-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8f9fa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 24px;

  .file-icon-wrapper {
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);

    .file-icon {
      font-size: 24px;
    }
  }

  .file-info {
    flex: 1;

    .file-name {
      font-size: 14px;
      font-weight: 500;
      color: #1f2225;
      margin-bottom: 4px;
    }

    .file-meta {
      font-size: 12px;
      color: #8c939d;
    }
  }

  .file-actions {
    display: flex;
    gap: 8px;
    
    .el-button {
      font-size: 18px;
    }
  }
}

.import-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  background: #f8f9fa;
  border-color: #dcdfe6;
  color: #606266;
  font-weight: 500;

  &:hover {
    color: #1890ff;
    border-color: #91d5ff;
    background: #e6f7ff;
  }
}
</style>