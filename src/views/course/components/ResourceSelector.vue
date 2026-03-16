<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择学习资源"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="resource-selector">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索资源名称"
          clearable
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-radio-group v-model="filterType" size="small">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="video">视频</el-radio-button>
          <el-radio-button label="document">文档</el-radio-button>
          <el-radio-button label="audio">音频</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 资源列表 -->
      <div class="resource-list" v-loading="loading">
        <div 
          v-for="resource in filteredResources" 
          :key="resource.id"
          class="resource-item"
          :class="{ selected: selectedResource?.id === resource.id }"
          @click="selectResource(resource)"
        >
          <div class="resource-thumb">
            <img v-if="resource.thumbnail" :src="resource.thumbnail" alt="">
            <el-icon v-else size="32" :color="getTypeColor(resource.type)">
              <VideoCamera v-if="resource.type === 'video'" />
              <Document v-else-if="resource.type === 'document'" />
              <Microphone v-else-if="resource.type === 'audio'" />
              <Picture v-else />
            </el-icon>
          </div>
          
          <div class="resource-info">
            <div class="resource-name">{{ resource.name }}</div>
            <div class="resource-meta">
              <el-tag size="small" :type="getTagType(resource.type)">
                {{ getTypeLabel(resource.type) }}
              </el-tag>
              <span v-if="resource.duration" class="duration">
                <el-icon><Timer /></el-icon>
                {{ resource.duration }}
              </span>
              <span class="size">{{ formatFileSize(resource.size) }}</span>
            </div>
          </div>
          
          <div class="resource-check">
            <el-icon v-if="selectedResource?.id === resource.id" size="24" color="#409EFF">
              <CircleCheckFilled />
            </el-icon>
          </div>
        </div>
        
        <el-empty v-if="filteredResources.length === 0" description="暂无资源" />
      </div>
      
      <!-- 预览区 -->
      <div class="preview-area" v-if="selectedResource">
        <h5>资源预览</h5>
        <div class="preview-content">
          <el-image 
            v-if="selectedResource.thumbnail"
            :src="selectedResource.thumbnail"
            fit="cover"
          />
          <div v-else class="preview-placeholder">
            <el-icon size="48" :color="getTypeColor(selectedResource.type)">
              <VideoCamera v-if="selectedResource.type === 'video'" />
              <Document v-else-if="selectedResource.type === 'document'" />
              <Microphone v-else-if="selectedResource.type === 'audio'" />
              <Picture v-else />
            </el-icon>
          </div>
          <p class="preview-name">{{ selectedResource.name }}</p>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :disabled="!selectedResource" @click="confirmSelect">
        确认选择
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'select'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref('')
const selectedResource = ref(null)

// 模拟资源数据
const resources = ref([
  {
    id: 1,
    name: '企业入职培训-公司介绍.mp4',
    type: 'video',
    duration: '12:34',
    size: 156789012,
    thumbnail: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  },
  {
    id: 2,
    name: '产品知识体系-2024版.pptx',
    type: 'document',
    duration: null,
    size: 25123456,
    thumbnail: null
  },
  {
    id: 3,
    name: '销售技巧-客户沟通艺术.mp4',
    type: 'video',
    duration: '45:20',
    size: 456789012,
    thumbnail: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  },
  {
    id: 4,
    name: '团队协作与沟通技巧.mp3',
    type: 'audio',
    duration: '28:15',
    size: 89234567,
    thumbnail: null
  },
  {
    id: 5,
    name: '企业文化宣传册.pdf',
    type: 'document',
    duration: null,
    size: 12567890,
    thumbnail: null
  },
  {
    id: 6,
    name: '项目管理实战-敏捷开发.mp4',
    type: 'video',
    duration: '56:42',
    size: 789012345,
    thumbnail: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  }
])

const filteredResources = computed(() => {
  let result = resources.value
  
  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }
  
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(kw))
  }
  
  return result
})

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
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const selectResource = (resource) => {
  selectedResource.value = resource
}

const confirmSelect = () => {
  if (selectedResource.value) {
    emit('select', selectedResource.value)
    dialogVisible.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    selectedResource.value = null
    searchKeyword.value = ''
    filterType.value = ''
  }
})
</script>

<style scoped lang="scss">
.resource-selector {
  .search-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .resource-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 12px;
    
    .resource-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &:hover {
        background: #f5f7fa;
      }
      
      &.selected {
        background: #ecf5ff;
        border: 1px solid #b3d8ff;
      }
      
      .resource-thumb {
        width: 80px;
        height: 45px;
        border-radius: 4px;
        overflow: hidden;
        background: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .resource-info {
        flex: 1;
        min-width: 0;
        
        .resource-name {
          font-size: 14px;
          color: #303133;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .resource-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #909399;
          
          .duration, .size {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
      
      .resource-check {
        width: 24px;
        flex-shrink: 0;
      }
    }
  }
  
  .preview-area {
    margin-top: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    
    h5 {
      margin: 0 0 12px;
      font-size: 14px;
      color: #606266;
    }
    
    .preview-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .el-image {
        width: 160px;
        height: 90px;
        border-radius: 4px;
      }
      
      .preview-placeholder {
        width: 160px;
        height: 90px;
        background: #fff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .preview-name {
        flex: 1;
        font-size: 14px;
        color: #303133;
        margin: 0;
      }
    }
  }
}
</style>
