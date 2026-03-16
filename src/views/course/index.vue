<template>
  <div class="course-page">
    <!-- 筛选区 -->
    <!-- <el-card class="filter-card" shadow="never"> -->
      <el-form :model="filter" inline>
        <el-form-item>
          <el-select v-model="filter.status" placeholder="全部状态" clearable style="width: 140px;">
            <el-option label="草稿" value="draft" />
            <el-option label="已上架" value="published" />
            <el-option label="已下架" value="offline" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-select v-model="filter.category" placeholder="全部分类" clearable style="width: 140px;">
            <el-option label="技术培训" value="tech" />
            <el-option label="管理培训" value="management" />
            <el-option label="产品培训" value="product" />
            <el-option label="通用技能" value="general" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-input
            v-model="filter.keyword"
            placeholder="课程名称/编号"
            clearable
            style="width: 240px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    <!-- </el-card> -->

    <!-- 操作栏 -->
    <!-- <el-card class="operation-card" shadow="never"> -->
      <div class="operation-bar">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新建课程
        </el-button>
        <el-button :icon="Download">导出数据</el-button>
      </div>
    <!-- </el-card> -->

    <!-- 课程列表 -->
    <el-card class="course-list" shadow="never">
      <el-table :data="courseList" v-loading="loading" stripe>
        <el-table-column label="课程信息" min-width="320">
          <template #default="{ row }">
            <div class="course-info">
              <el-image 
                :src="row.cover" 
                class="course-cover"
                fit="cover"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon size="32"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-meta">
                <div class="name">{{ row.name }}</div>
                <div class="code">编号: {{ row.code }}</div>
                <div class="tags">
                  <el-tag size="small" :type="row.status === 'published' ? 'success' : row.status === 'draft' ? 'info' : 'danger'">
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                  <el-tag size="small" type="info" style="margin-left: 4px;">
                    {{ getCategoryLabel(row.category) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="内容概况" width="180">
          <template #default="{ row }">
            <div class="content-stats">
              <div class="stat-item">
                <el-icon><Folder /></el-icon>
                <span>{{ row.chapterCount }}章 / {{ row.lessonCount }}节</span>
              </div>
              <div class="stat-item">
                <el-icon><Timer /></el-icon>
                <span>总时长 {{ row.totalDuration }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="引用状态" width="150">
          <template #default="{ row }">
            <el-tooltip v-if="row.refPlans.length > 0" placement="top">
              <template #content>
                <div class="ref-tooltip">
                  <p>被以下计划引用:</p>
                  <ul>
                    <li v-for="plan in row.refPlans" :key="plan">{{ plan }}</li>
                  </ul>
                </div>
              </template>
              <el-tag size="small" type="warning" class="ref-tag">
                被 {{ row.refPlans.length }} 个计划引用
              </el-tag>
            </el-tooltip>
            <span v-else class="text-muted">未引用</span>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
              编辑内容
            </el-button>
            <el-button link type="primary" :icon="View" @click="handlePreview(row)">
              预览
            </el-button>
            <el-button 
              v-if="row.status === 'published'"
              link 
              type="warning" 
              :icon="ArrowDown"
              @click="handleOffline(row)"
            >
              下架
            </el-button>
            <el-button 
              v-else-if="row.status === 'offline'"
              link 
              type="success" 
              :icon="ArrowUp"
              @click="handlePublish(row)"
            >
              上架
            </el-button>
            
            <el-popconfirm
              v-if="row.refPlans.length === 0"
              title="确定删除该课程吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
            
            <el-button 
              v-else
              link 
              type="danger" 
              :icon="Delete"
              @click="showDeleteWarning(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 删除警告对话框 -->
    <el-dialog
      v-model="deleteWarningVisible"
      title="⚠️ 无法删除课程"
      width="500px"
      :show-close="false"
    >
      <div class="delete-warning">
        <div class="warning-icon">
          <el-icon size="48" color="#F56C6C"><Warning /></el-icon>
        </div>
        <p class="warning-title">该课程正在被以下培训计划使用</p>
        <ul class="ref-list">
          <li v-for="plan in currentCourse?.refPlans" :key="plan">
            <el-icon><Link /></el-icon>
            {{ plan }}
          </li>
        </ul>
        <p class="warning-tip">请先移除课程引用，或删除相关培训计划后再试。</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="deleteWarningVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowUp, Edit, ArrowDown, Delete, View, Download, Plus, Search, RefreshRight } from '@element-plus/icons-vue'
import { mockCourses } from './mock'

const router = useRouter()
const loading = ref(false)
const deleteWarningVisible = ref(false)
const currentCourse = ref(null)

const filter = reactive({
  status: '',
  category: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const courseList = ref([])

const getStatusLabel = (status) => {
  const labels = {
    draft: '草稿',
    published: '已上架',
    offline: '已下架'
  }
  return labels[status] || status
}

const getCategoryLabel = (category) => {
  const labels = {
    tech: '技术培训',
    management: '管理培训',
    product: '产品培训',
    general: '通用技能'
  }
  return labels[category] || category
}

const fetchCourses = async () => {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockCourses]
    
    if (filter.status) {
      filtered = filtered.filter(c => c.status === filter.status)
    }
    if (filter.category) {
      filtered = filtered.filter(c => c.category === filter.category)
    }
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(kw) || 
        c.code.toLowerCase().includes(kw)
      )
    }
    
    courseList.value = filtered.slice((pagination.page - 1) * pagination.size, pagination.page * pagination.size)
    pagination.total = filtered.length
    loading.value = false
  }, 300)
}

const handleSearch = () => {
  pagination.page = 1
  fetchCourses()
}

const handleReset = () => {
  filter.status = ''
  filter.category = ''
  filter.keyword = ''
  handleSearch()
}

const handleCreate = () => {
  router.push('/course/edit')
}

const handleEdit = (row) => {
  router.push(`/course/edit/${row.id}`)
}

const handlePreview = (row) => {
  ElMessage.info(`预览课程: ${row.name}`)
}

const handleOffline = (row) => {
  row.status = 'offline'
  ElMessage.success(`已下架: ${row.name}`)
}

const handlePublish = (row) => {
  row.status = 'published'
  ElMessage.success(`已上架: ${row.name}`)
}

const handleDelete = (row) => {
  ElMessage.success(`已删除: ${row.name}`)
  fetchCourses()
}

const showDeleteWarning = (row) => {
  currentCourse.value = row
  deleteWarningVisible.value = true
}

const handleSizeChange = (val) => {
  pagination.size = val
  fetchCourses()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchCourses()
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped lang="scss">
.course-page {
  .operation-bar {
    margin-bottom: 16px;
  }
  
  .course-list {
    .course-info {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .course-cover {
        width: 120px;
        height: 68px;
        border-radius: 6px;
        flex-shrink: 0;
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          background: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #909399;
        }
      }
      
      .course-meta {
        flex: 1;
        min-width: 0;
        
        .name {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .code {
          font-size: 12px;
          color: #909399;
          margin-bottom: 6px;
        }
        
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }
    }
    
    .content-stats {
      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #606266;
        margin-bottom: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .text-muted {
      color: #909399;
      font-size: 13px;
    }
    
    .ref-tag {
      cursor: pointer;
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .ref-tooltip {
    p {
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    ul {
      margin: 0;
      padding-left: 16px;
      
      li {
        margin-bottom: 4px;
        font-size: 13px;
      }
    }
  }
  
  .delete-warning {
    text-align: center;
    padding: 20px;
    
    .warning-icon {
      margin-bottom: 16px;
    }
    
    .warning-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 16px;
    }
    
    .ref-list {
      text-align: left;
      background: #f5f7fa;
      border-radius: 8px;
      padding: 16px 16px 16px 32px;
      margin-bottom: 16px;
      
      li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        color: #606266;
        
        .el-icon {
          color: #409EFF;
        }
      }
    }
    
    .warning-tip {
      color: #909399;
      font-size: 13px;
    }
  }
}
</style>
