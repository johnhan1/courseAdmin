<template>
  <div class="resource-page">
    <!-- 操作栏 -->
    <el-card class="operation-card" shadow="never">
      <div class="operation-bar">
        <div class="left">
          <el-radio-group v-model="filter.type" size="default">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="video">视频</el-radio-button>
            <el-radio-button label="document">文档</el-radio-button>
            <el-radio-button label="audio">音频</el-radio-button>
            <el-radio-button label="image">图片</el-radio-button>
          </el-radio-group>
          
          <el-input
            v-model="filter.keyword"
            placeholder="搜索资源名称"
            style="width: 240px; margin-left: 16px;"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="right">
          <el-button type="primary" :icon="Plus" @click="handleUpload">
            上传资源
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 资源列表 -->
    <el-card class="resource-list" shadow="never">
      <el-table :data="resourceList" v-loading="loading" stripe>
        <el-table-column label="资源信息" min-width="280">
          <template #default="{ row }">
            <div class="resource-info">
              <div class="resource-thumb">
                <img v-if="row.type === 'video'" :src="row.thumbnail" alt="">
                <el-icon v-else size="32" :color="getTypeColor(row.type)">
                  <Document v-if="row.type === 'document'" />
                  <Microphone v-else-if="row.type === 'audio'" />
                  <Picture v-else />
                </el-icon>
              </div>
              <div class="resource-meta">
                <div class="name">{{ row.name }}</div>
                <div class="type-tag">
                  <el-tag size="small" :type="getTagType(row.type)">
                    {{ getTypeLabel(row.type) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="转码状态" width="180">
          <template #default="{ row }">
            <div class="transcode-status">
              <template v-if="row.status === 'processing'">
                <el-progress 
                  :percentage="row.progress" 
                  :stroke-width="6"
                  status="active"
                />
                <span class="status-text">处理中...</span>
              </template>
              <template v-else-if="row.status === 'success'">
                <div class="success-status">
                  <el-icon color="#67C23A"><CircleCheck /></el-icon>
                  <span>成功</span>
                  <el-tag size="small" type="info" v-if="row.resolution">
                    {{ row.resolution }}
                  </el-tag>
                </div>
              </template>
              <template v-else-if="row.status === 'failed'">
                <el-tooltip :content="row.errorMsg" placement="top">
                  <div class="failed-status">
                    <el-icon color="#F56C6C"><CircleClose /></el-icon>
                    <span>失败</span>
                  </div>
                </el-tooltip>
              </template>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        
        <el-table-column label="时长" width="100">
          <template #default="{ row }">
            {{ row.duration || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </el-table-column>
        
        <el-table-column label="引用情况" width="120">
          <template #default="{ row }">
            <el-tooltip v-if="row.refCount > 0" :content="row.refCourses.join(', ')" placement="top">
              <el-tag size="small" type="warning">被 {{ row.refCount }} 个课程引用</el-tag>
            </el-tooltip>
            <span v-else class="text-muted">未引用</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handlePreview(row)">
              预览
            </el-button>
            <el-button link type="primary" :icon="Refresh" @click="handleReplace(row)">
              替换
            </el-button>
            <el-popconfirm
              title="确定删除该资源吗？"
              @confirm="handleDelete(row)"
              v-if="row.refCount === 0"
            >
              <template #reference>
                <el-button link type="danger" :icon="Delete">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 上传面板 -->
    <upload-panel
      v-model:visible="uploadPanelVisible"
      @upload-success="handleUploadSuccess"
    />

    <!-- 替换文件对话框 -->
    <el-dialog
      v-model="replaceDialogVisible"
      title="替换文件"
      width="500px"
    >
      <div class="replace-info">
        <p>正在替换: <strong>{{ currentResource?.name }}</strong></p>
        <p class="tip">新文件上传后将保持相同的资源ID，所有引用该资源的课程将自动更新。</p>
      </div>
      <el-upload
        drag
        action="/api/resource/replace"
        :on-success="handleReplaceSuccess"
        :before-upload="beforeReplaceUpload"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck, CircleClose, Refresh, Delete, View, Upload, Plus } from '@element-plus/icons-vue'
import UploadPanel from './components/UploadPanel.vue'
import { mockResources } from './mock'

const loading = ref(false)
const uploadPanelVisible = ref(false)
const replaceDialogVisible = ref(false)
const currentResource = ref(null)

const filter = reactive({
  type: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const resourceList = ref([])

const getTypeColor = (type) => {
  const colors = {
    video: '#409EFF',
    document: '#E6A23C',
    audio: '#67C23A',
    image: '#F56C6C'
  }
  return colors[type] || '#909399'
}

const getTagType = (type) => {
  const types = {
    video: 'primary',
    document: 'warning',
    audio: 'success',
    image: 'danger'
  }
  return types[type] || 'info'
}

const getTypeLabel = (type) => {
  const labels = {
    video: '视频',
    document: '文档',
    audio: '音频',
    image: '图片'
  }
  return labels[type] || '其他'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const fetchResources = async () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    resourceList.value = mockResources.slice((pagination.page - 1) * pagination.size, pagination.page * pagination.size)
    pagination.total = mockResources.length
    loading.value = false
  }, 500)
}

const handleUpload = () => {
  uploadPanelVisible.value = true
}

const handleUploadSuccess = () => {
  fetchResources()
}

const handlePreview = (row) => {
  ElMessage.info(`预览: ${row.name}`)
}

const handleReplace = (row) => {
  currentResource.value = row
  replaceDialogVisible.value = true
}

const beforeReplaceUpload = (file) => {
  // 文件类型校验
  return true
}

const handleReplaceSuccess = () => {
  ElMessage.success('替换成功')
  replaceDialogVisible.value = false
  fetchResources()
}

const handleDelete = (row) => {
  ElMessage.success(`已删除: ${row.name}`)
  fetchResources()
}

const handleSizeChange = (val) => {
  pagination.size = val
  fetchResources()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchResources()
}

onMounted(() => {
  fetchResources()
})
</script>

<style scoped lang="scss">
.resource-page {
  .operation-card {
    margin-bottom: 16px;
    
    .operation-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .left {
        display: flex;
        align-items: center;
      }
    }
  }
  
  .resource-list {
    .resource-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .resource-thumb {
        width: 80px;
        height: 45px;
        border-radius: 4px;
        overflow: hidden;
        background: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .resource-meta {
        .name {
          font-size: 14px;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .type-tag {
          margin-top: 4px;
        }
      }
    }
    
    .transcode-status {
      .status-text {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
        display: block;
      }
      
      .success-status,
      .failed-status {
        display: flex;
        align-items: center;
        gap: 8px;
        
        span {
          font-size: 14px;
          color: #606266;
        }
      }
    }
    
    .text-muted {
      color: #909399;
      font-size: 14px;
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .replace-info {
    margin-bottom: 20px;
    
    .tip {
      color: #909399;
      font-size: 13px;
      margin-top: 8px;
    }
  }
}
</style>
