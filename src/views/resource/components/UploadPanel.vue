<template>
  <div class="upload-panel" v-show="visible">
    <div class="panel-header">
      <div class="title">
        <span>正在上传 {{ uploadingCount }} 个文件</span>
        <span class="progress">总进度 {{ totalProgress }}%</span>
      </div>
      <div class="actions">
        <el-icon class="action-icon" @click="isMinimized = !isMinimized">
          <Minus v-if="!isMinimized" />
          <FullScreen v-else />
        </el-icon>
        <el-icon class="action-icon close" @click="handleClose">
          <Close />
        </el-icon>
      </div>
    </div>
    
    <div class="panel-body" v-show="!isMinimized">
      <div v-for="file in uploadList" :key="file.id" class="upload-item">
        <div class="file-info">
          <el-icon size="20" :color="getFileColor(file.type)">
            <VideoCamera v-if="file.type === 'video'" />
            <Document v-else-if="file.type === 'document'" />
            <Microphone v-else-if="file.type === 'audio'" />
            <Picture v-else />
          </el-icon>
          <div class="file-meta">
            <div class="filename">{{ file.name }}</div>
            <div class="filesize">{{ formatFileSize(file.size) }}</div>
          </div>
        </div>
        
        <div class="upload-progress">
          <el-progress 
            :percentage="file.progress" 
            :status="file.status"
            :stroke-width="4"
          />
          <div class="status-text" :class="file.status">
            {{ getStatusText(file) }}
          </div>
        </div>
        
        <div class="upload-actions">
          <el-button 
            v-if="file.status === 'uploading'" 
            link 
            :icon="VideoPause"
            @click="pauseUpload(file)"
          >
            暂停
          </el-button>
          <el-button 
            v-if="file.status === 'exception'" 
            link 
            type="primary"
            :icon="RefreshRight"
            @click="retryUpload(file)"
          >
            重试
          </el-button>
          <el-button link :icon="Close" @click="removeFile(file)">
            移除
          </el-button>
        </div>
      </div>
      
      <div class="upload-area" v-if="uploadList.length === 0">
        <el-upload
          drag
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept=".mp4,.mov,.avi,.pdf,.doc,.docx,.ppt,.pptx,.mp3,.wav,.jpg,.png,.gif"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持视频、文档、音频、图片等多种格式，单个文件最大 2GB
            </div>
          </template>
        </el-upload>
      </div>
      
      <div class="add-more" v-else>
        <el-upload
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          multiple
        >
          <el-button link type="primary" :icon="Plus">添加更多文件</el-button>
        </el-upload>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload, VideoPause, RefreshRight, Close, VideoCamera, Document, Microphone, Picture } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'upload-success'])

const isMinimized = ref(false)
const uploadList = ref([])

const uploadingCount = computed(() => {
  return uploadList.value.filter(f => f.status === 'uploading').length
})

const totalProgress = computed(() => {
  if (uploadList.value.length === 0) return 0
  const total = uploadList.value.reduce((sum, f) => sum + f.progress, 0)
  return Math.round(total / uploadList.value.length)
})

const getFileColor = (type) => {
  const colors = {
    video: '#409EFF',
    document: '#E6A23C',
    audio: '#67C23A',
    image: '#F56C6C'
  }
  return colors[type] || '#909399'
}

const getStatusText = (file) => {
  const texts = {
    uploading: '上传中...',
    success: '上传完成',
    exception: '上传失败'
  }
  return texts[file.status] || '等待上传'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
  if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return 'document'
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'audio'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image'
  return 'other'
}

const handleFileChange = (uploadFile) => {
  const file = {
    id: Date.now().toString() + Math.random(),
    name: uploadFile.name,
    size: uploadFile.size,
    type: getFileType(uploadFile.name),
    progress: 0,
    status: 'uploading',
    raw: uploadFile.raw
  }
  uploadList.value.push(file)
  startUpload(file)
}

const startUpload = (file) => {
  // 模拟上传进度
  const interval = setInterval(() => {
    if (file.status !== 'uploading') {
      clearInterval(interval)
      return
    }
    
    file.progress += Math.random() * 10
    
    // 随机模拟失败（5%概率）
    if (file.progress > 50 && Math.random() < 0.05) {
      file.status = 'exception'
      file.progress = 0
      clearInterval(interval)
      return
    }
    
    if (file.progress >= 100) {
      file.progress = 100
      file.status = 'success'
      clearInterval(interval)
      emit('upload-success')
    }
  }, 300)
}

const pauseUpload = (file) => {
  file.status = file.status === 'uploading' ? '' : 'uploading'
  if (file.status === 'uploading') {
    startUpload(file)
  }
}

const retryUpload = (file) => {
  file.status = 'uploading'
  file.progress = 0
  startUpload(file)
}

const removeFile = (file) => {
  const index = uploadList.value.findIndex(f => f.id === file.id)
  if (index > -1) {
    uploadList.value.splice(index, 1)
  }
}

const handleClose = () => {
  if (uploadingCount.value > 0) {
    ElMessage.warning('还有文件正在上传，请勿关闭')
    return
  }
  uploadList.value = []
  emit('update:visible', false)
}

watch(() => props.visible, (val) => {
  if (val) {
    isMinimized.value = false
  }
})
</script>

<style scoped lang="scss">
.upload-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 480px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  z-index: 2000;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    
    .title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #303133;
      
      .progress {
        color: #409EFF;
        font-weight: 500;
      }
    }
    
    .actions {
      display: flex;
      gap: 8px;
      
      .action-icon {
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        
        &:hover {
          background: #f5f7fa;
        }
        
        &.close:hover {
          background: #fef0f0;
          color: #f56c6c;
        }
      }
    }
  }
  
  .panel-body {
    max-height: 400px;
    overflow-y: auto;
    padding: 16px;
    
    .upload-item {
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .file-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        
        .file-meta {
          flex: 1;
          min-width: 0;
          
          .filename {
            font-size: 14px;
            color: #303133;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .filesize {
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
          }
        }
      }
      
      .upload-progress {
        margin-bottom: 8px;
        
        .status-text {
          font-size: 12px;
          margin-top: 4px;
          
          &.uploading {
            color: #409EFF;
          }
          
          &.success {
            color: #67C23A;
          }
          
          &.exception {
            color: #F56C6C;
          }
        }
      }
      
      .upload-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    }
    
    .upload-area {
      :deep(.el-upload) {
        width: 100%;
        
        .el-upload-dragger {
          width: 100%;
          height: 180px;
        }
      }
    }
    
    .add-more {
      text-align: center;
      padding: 12px;
      border-top: 1px dashed #dcdfe6;
      margin-top: 12px;
    }
  }
}
</style>
