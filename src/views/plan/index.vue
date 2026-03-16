<template>
  <div class="plan-page">
    <!-- 状态筛选 -->
    <el-card class="status-filter" shadow="never">
      <div class="status-tabs">
        <div 
          v-for="status in statusList" 
          :key="status.value"
          class="status-tab"
          :class="{ active: currentStatus === status.value }"
          @click="currentStatus = status.value"
        >
          <el-icon :size="20" :color="status.color">
            <component :is="status.icon" />
          </el-icon>
          <div class="status-info">
            <span class="status-name">{{ status.label }}</span>
            <span class="status-count">{{ status.count }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 筛选和操作栏 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索计划名称"
          clearable
          style="width: 280px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          创建培训计划
        </el-button>
      </div>
    </el-card>

    <!-- 计划列表 -->
    <el-card class="plan-list" shadow="never">
      <el-table :data="planList" v-loading="loading" stripe>
        <el-table-column label="计划信息" min-width="300">
          <template #default="{ row }">
            <div class="plan-info">
              <div class="plan-name">{{ row.name }}</div>
              <div class="plan-meta">
                <el-tag :type="row.type === 'required' ? 'danger' : 'success'" size="small">
                  {{ row.type === 'required' ? '必修' : '选修' }}
                </el-tag>
                <span class="plan-id">编号: {{ row.code }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="课程数量" width="120">
          <template #default="{ row }">
            <div class="course-count">
              <el-icon><Reading /></el-icon>
              <span>{{ row.courseCount }} 门课程</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="参与人数" width="120">
          <template #default="{ row }">
            <div class="user-count">
              <el-icon><User /></el-icon>
              <span>{{ row.userCount }} 人</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="时间周期" width="220">
          <template #default="{ row }">
            <div class="time-range">
              <div class="date">{{ row.startDate }} 至</div>
              <div class="date">{{ row.endDate }}</div>
              <div class="time-tag" v-if="row.status === 'ongoing'">
                <el-tag size="small" type="success">进行中</el-tag>
              </div>
              <div class="time-tag" v-else-if="row.status === 'draft'">
                <el-tag size="small" type="info">未发布</el-tag>
              </div>
              <div class="time-tag" v-else>
                <el-tag size="small">已结束</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="完成进度" width="150">
          <template #default="{ row }">
            <div class="progress-info">
              <el-progress 
                :percentage="row.progress" 
                :status="row.progress === 100 ? 'success' : ''"
              />
              <span class="progress-text">{{ row.completedCount }}/{{ row.userCount }} 完成</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handleView(row)">
              查看详情
            </el-button>
            <el-button 
              v-if="row.status === 'draft'"
              link 
              type="primary" 
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="row.status === 'ongoing'"
              link 
              type="success" 
              :icon="CircleCheck"
              @click="handleComplete(row)"
            >
              结束计划
            </el-button>
            <el-button link type="primary" :icon="TrendCharts" @click="handleMonitor(row)">
              监控
            </el-button>
            <el-popconfirm
              v-if="row.status === 'draft'"
              title="确定删除该计划吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" :icon="Delete">删除</el-button>
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
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Edit, CircleCheck, Delete, TrendCharts, Plus } from '@element-plus/icons-vue'
import { mockPlans } from './mock'

const router = useRouter()
const loading = ref(false)
const currentStatus = ref('all')

const statusList = [
  { value: 'all', label: '全部计划', icon: 'List', color: '#409EFF', count: 12 },
  { value: 'draft', label: '草稿箱', icon: 'Document', color: '#909399', count: 3 },
  { value: 'ongoing', label: '进行中', icon: 'Loading', color: '#67C23A', count: 5 },
  { value: 'archived', label: '已归档', icon: 'CircleCheck', color: '#606266', count: 4 }
]

const filter = reactive({
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const planList = ref([])

const fetchPlans = async () => {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockPlans]
    
    if (currentStatus.value !== 'all') {
      filtered = filtered.filter(p => p.status === currentStatus.value)
    }
    
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase()
      filtered = filtered.filter(p => p.name.toLowerCase().includes(kw))
    }
    
    planList.value = filtered.slice((pagination.page - 1) * pagination.size, pagination.page * pagination.size)
    pagination.total = filtered.length
    loading.value = false
  }, 300)
}

const handleCreate = () => {
  router.push('/plan/create')
}

const handleEdit = (row) => {
  router.push(`/plan/edit/${row.id}`)
}

const handleView = (row) => {
  ElMessage.info(`查看计划: ${row.name}`)
}

const handleMonitor = (row) => {
  router.push(`/monitor/plan/${row.id}`)
}

const handleComplete = (row) => {
  row.status = 'archived'
  ElMessage.success(`计划已结束: ${row.name}`)
  fetchPlans()
}

const handleDelete = (row) => {
  ElMessage.success(`计划已删除: ${row.name}`)
  fetchPlans()
}

const handleSizeChange = (val) => {
  pagination.size = val
  fetchPlans()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchPlans()
}

watch(currentStatus, () => {
  pagination.page = 1
  fetchPlans()
})

onMounted(() => {
  fetchPlans()
})
</script>

<style scoped lang="scss">
.plan-page {
  .status-filter {
    margin-bottom: 16px;
    
    .status-tabs {
      display: flex;
      gap: 16px;
      
      .status-tab {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: #f5f7fa;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background: #ecf5ff;
        }
        
        &.active {
          background: #409EFF;
          
          .status-info {
            .status-name,
            .status-count {
              color: #fff;
            }
          }
        }
        
        .status-info {
          display: flex;
          flex-direction: column;
          
          .status-name {
            font-size: 14px;
            color: #606266;
          }
          
          .status-count {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }
  
  .filter-card {
    margin-bottom: 16px;
    
    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .plan-list {
    .plan-info {
      .plan-name {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 6px;
      }
      
      .plan-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .plan-id {
          font-size: 12px;
          color: #909399;
        }
      }
    }
    
    .course-count,
    .user-count {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #606266;
      font-size: 14px;
    }
    
    .time-range {
      .date {
        font-size: 13px;
        color: #606266;
        line-height: 1.6;
      }
      
      .time-tag {
        margin-top: 4px;
      }
    }
    
    .progress-info {
      .progress-text {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
        display: block;
      }
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
