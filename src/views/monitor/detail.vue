<template>
  <div class="monitor-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <h2>{{ planDetail.name }}</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Bell" @click="handleUrgeAll">
          一键催办
        </el-button>
      </div>
    </div>

    <!-- 漏斗统计 -->
    <el-card class="funnel-card" shadow="never">
      <div class="funnel-stats">
        <div class="funnel-item">
          <div class="funnel-icon" style="background: #ecf5ff;">
            <el-icon size="32" color="#409EFF"><User /></el-icon>
          </div>
          <div class="funnel-info">
            <div class="funnel-value">{{ planDetail.stats.total }}</div>
            <div class="funnel-label">应修人数</div>
          </div>
          <el-icon class="arrow" size="24" color="#c0c4cc"><ArrowRight /></el-icon>
        </div>
        
        <div class="funnel-item">
          <div class="funnel-icon" style="background: #f0f9eb;">
            <el-icon size="32" color="#67C23A"><Message /></el-icon>
          </div>
          <div class="funnel-info">
            <div class="funnel-value">{{ planDetail.stats.notified }}</div>
            <div class="funnel-label">已读通知</div>
          </div>
          <div class="funnel-rate">{{ Math.round(planDetail.stats.notified / planDetail.stats.total * 100) }}%</div>
          <el-icon class="arrow" size="24" color="#c0c4cc"><ArrowRight /></el-icon>
        </div>
        
        <div class="funnel-item">
          <div class="funnel-icon" style="background: #fdf6ec;">
            <el-icon size="32" color="#E6A23C"><VideoPlay /></el-icon>
          </div>
          <div class="funnel-info">
            <div class="funnel-value">{{ planDetail.stats.started }}</div>
            <div class="funnel-label">开始学习</div>
          </div>
          <div class="funnel-rate">{{ Math.round(planDetail.stats.started / planDetail.stats.total * 100) }}%</div>
          <el-icon class="arrow" size="24" color="#c0c4cc"><ArrowRight /></el-icon>
        </div>
        
        <div class="funnel-item">
          <div class="funnel-icon" style="background: #f0f9eb;">
            <el-icon size="32" color="#67C23A"><CircleCheck /></el-icon>
          </div>
          <div class="funnel-info">
            <div class="funnel-value">{{ planDetail.stats.completed }}</div>
            <div class="funnel-label">已完成</div>
          </div>
          <div class="funnel-rate highlight">{{ Math.round(planDetail.stats.completed / planDetail.stats.total * 100) }}%</div>
        </div>
      </div>
    </el-card>

    <!-- 学员监控表 -->
    <el-card class="user-table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span>学员学习进度</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索姓名/工号"
              clearable
              style="width: 220px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button :icon="Download">导出</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredUserProgress" v-loading="loading" stripe>
        <el-table-column label="学员信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="36" :src="row.avatar">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <div class="user-meta">
                <div class="name">
                  {{ row.name }}
                  <el-tag 
                    v-if="row.warning === 'never_started'" 
                    type="danger" 
                    size="small"
                    class="warning-tag"
                  >
                    从未开始
                  </el-tag>
                  <el-tag 
                    v-else-if="row.warning === 'suspected'" 
                    type="warning" 
                    size="small"
                    class="warning-tag"
                  >
                    刷课嫌疑
                  </el-tag>
                </div>
                <div class="dept">{{ row.dept }} · {{ row.employeeNo }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="学习进度" width="200">
          <template #default="{ row }">
            <div class="progress-cell">
              <el-progress 
                :percentage="row.progress" 
                :status="row.progress === 100 ? 'success' : ''"
              />
              <span class="progress-text">{{ row.progress }}%</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="学习时长" width="140">
          <template #default="{ row }">
            <div class="study-time">
              <el-icon><Clock /></el-icon>
              <span>{{ row.studyTime }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="最近学习" width="160">
          <template #default="{ row }">
            <span :class="{ 'text-muted': row.lastStudyTime === '-' }">
              {{ row.lastStudyTime }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.status)" 
              size="small"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.warning === 'never_started'" 
              link 
              type="primary" 
              :icon="Bell"
              @click="handleUrge(row)"
            >
              催办
            </el-button>
            <el-button link type="primary" :icon="View" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button 
              v-if="row.status !== 'completed'" 
              link 
              type="success" 
              :icon="CircleCheck"
              @click="handleForceComplete(row)"
            >
              强制完成
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

    <!-- 强制完成对话框 -->
    <el-dialog
      v-model="forceCompleteVisible"
      title="强制标记完成"
      width="500px"
    >
      <el-form :model="forceCompleteForm" label-width="100px">
        <el-form-item label="学员">
          <span>{{ currentUser?.name }} ({{ currentUser?.employeeNo }})</span>
        </el-form-item>
        <el-form-item label="强制原因" required>
          <el-radio-group v-model="forceCompleteForm.reason">
            <el-radio label="offline_training">已参加线下培训</el-radio>
            <el-radio label="leave">请假/出差</el-radio>
            <el-radio label="other">其他原因</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input 
            v-model="forceCompleteForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="forceCompleteVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmForceComplete">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockPlanDetail, mockUserProgress } from './mock'

const route = useRoute()
const router = useRouter()
const planId = computed(() => route.params.id as string)

const loading = ref(false)
const searchKeyword = ref('')
const forceCompleteVisible = ref(false)
const currentUser = ref<any>(null)

const planDetail = ref({
  name: '',
  stats: { total: 0, notified: 0, started: 0, completed: 0 }
})

const userProgress = ref<any[]>([])

const forceCompleteForm = ref({
  reason: 'offline_training',
  remark: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const filteredUserProgress = computed(() => {
  let filtered = [...userProgress.value]
  
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(u => 
      u.name.toLowerCase().includes(kw) || 
      u.employeeNo.toLowerCase().includes(kw)
    )
  }
  
  return filtered.slice((pagination.page - 1) * pagination.size, pagination.page * pagination.size)
})

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    completed: 'success',
    learning: 'primary',
    not_started: 'info'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: '已完成',
    learning: '学习中',
    not_started: '未开始'
  }
  return labels[status] || status
}

const fetchPlanDetail = async () => {
  loading.value = true
  setTimeout(() => {
    planDetail.value = mockPlanDetail
    userProgress.value = mockUserProgress
    pagination.total = mockUserProgress.length
    loading.value = false
  }, 500)
}

const handleBack = () => {
  router.push('/monitor')
}

const handleUrgeAll = () => {
  const neverStartedCount = userProgress.value.filter(u => u.warning === 'never_started').length
  if (neverStartedCount === 0) {
    ElMessage.info('没有需要催办的学员')
    return
  }
  ElMessage.success(`已向 ${neverStartedCount} 位未开始学员发送催办通知`)
}

const handleUrge = (row: any) => {
  ElMessage.success(`已向 ${row.name} 发送催办通知`)
}

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看 ${row.name} 的学习详情`)
}

const handleForceComplete = (row: any) => {
  currentUser.value = row
  forceCompleteVisible.value = true
}

const confirmForceComplete = () => {
  if (currentUser.value) {
    currentUser.value.status = 'completed'
    currentUser.value.progress = 100
    ElMessage.success(`已强制标记 ${currentUser.value.name} 为完成状态`)
  }
  forceCompleteVisible.value = false
}

const handleSizeChange = (val: number) => {
  pagination.size = val
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
}

onMounted(() => {
  fetchPlanDetail()
})
</script>

<style scoped lang="scss">
.monitor-detail-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }
  }
  
  .funnel-card {
    margin-bottom: 20px;
    
    .funnel-stats {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 20px;
      
      .funnel-item {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
        justify-content: center;
        position: relative;
        
        .funnel-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .funnel-info {
          .funnel-value {
            font-size: 32px;
            font-weight: 600;
            color: #303133;
            line-height: 1.2;
          }
          
          .funnel-label {
            font-size: 14px;
            color: #909399;
            margin-top: 4px;
          }
        }
        
        .funnel-rate {
          position: absolute;
          top: 0;
          right: 40px;
          background: #f5f7fa;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          color: #606266;
          
          &.highlight {
            background: #f0f9eb;
            color: #67C23A;
          }
        }
        
        .arrow {
          position: absolute;
          right: 0;
        }
        
        &:last-child .arrow {
          display: none;
        }
      }
    }
  }
  
  .user-table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .user-meta {
        .name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          display: flex;
          align-items: center;
          gap: 8px;
          
          .warning-tag {
            font-size: 11px;
          }
        }
        
        .dept {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
    
    .progress-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .el-progress {
        flex: 1;
      }
      
      .progress-text {
        font-size: 13px;
        color: #606266;
        min-width: 40px;
      }
    }
    
    .study-time {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #606266;
      font-size: 13px;
    }
    
    .text-muted {
      color: #c0c4cc;
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
