<template>
  <div class="monitor-page">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ecf5ff;">
              <el-icon size="28" color="#409EFF"><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">12</div>
              <div class="stat-label">进行中的计划</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f0f9eb;">
              <el-icon size="28" color="#67C23A"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">568</div>
              <div class="stat-label">应修学学员</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fdf6ec;">
              <el-icon size="28" color="#E6A23C"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">342</div>
              <div class="stat-label">学习中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f4f4f5;">
              <el-icon size="28" color="#909399"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">186</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <span>学习趋势</span>
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-placeholder">
            <div class="mock-chart">
              <div class="bar" v-for="i in 7" :key="i" :style="{ height: Math.random() * 60 + 30 + '%' }"></div>
            </div>
            <div class="chart-labels">
              <span v-for="day in ['周一','周二','周三','周四','周五','周六','周日']" :key="day">{{ day }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <span>部门学习完成情况</span>
            </div>
          </template>
          <div class="dept-ranking">
            <div class="dept-item" v-for="(dept, index) in deptRanking" :key="dept.name">
              <span class="rank">{{ index + 1 }}</span>
              <span class="name">{{ dept.name }}</span>
              <el-progress :percentage="dept.rate" :color="getRankColor(index)" />
              <span class="count">{{ dept.completed }}/{{ dept.total }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 计划列表 -->
    <el-card class="plan-list" shadow="never">
      <template #header>
        <div class="list-header">
          <span>培训计划监控</span>
          <el-button type="primary" link :icon="Refresh" @click="refreshData">刷新数据</el-button>
        </div>
      </template>
      
      <el-table :data="monitorList" v-loading="loading" stripe>
        <el-table-column label="计划名称" min-width="250">
          <template #default="{ row }">
            <div class="plan-name">{{ row.name }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="学习漏斗" min-width="320">
          <template #default="{ row }">
            <div class="funnel">
              <div class="funnel-item">
                <span class="label">应修</span>
                <el-icon><ArrowRight /></el-icon>
                <span class="value">{{ row.total }}</span>
              </div>
              <div class="funnel-item">
                <span class="label">已读</span>
                <el-icon><ArrowRight /></el-icon>
                <span class="value">{{ row.notified }}</span>
              </div>
              <div class="funnel-item">
                <span class="label">开始</span>
                <el-icon><ArrowRight /></el-icon>
                <span class="value">{{ row.started }}</span>
              </div>
              <div class="funnel-item">
                <span class="label">完成</span>
                <el-icon><ArrowRight /></el-icon>
                <span class="value highlight">{{ row.completed }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="完成率" width="120">
          <template #default="{ row }">
            <el-progress :percentage="Math.round(row.completed / row.total * 100)" />
          </template>
        </el-table-column>
        
        <el-table-column label="异常学员" width="120">
          <template #default="{ row }">
            <div class="abnormal">
              <el-tag v-if="row.neverStarted > 0" type="danger" size="small">
                {{ row.neverStarted }} 未开始
              </el-tag>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="剩余时间" width="120">
          <template #default="{ row }">
            <el-tag :type="row.daysLeft < 7 ? 'danger' : 'info'" size="small">
              {{ row.daysLeft }} 天
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleMonitor(row)">
              查看详情
            </el-button>
            <el-button link type="primary" @click="handleUrge(row)">
              催办
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { mockMonitorData } from './mock'

const router = useRouter()
const loading = ref(false)
const trendPeriod = ref('week')

const deptRanking = ref([
  { name: '研发中心', total: 120, completed: 98, rate: 82 },
  { name: '产品部', total: 45, completed: 38, rate: 84 },
  { name: '销售一部', total: 60, completed: 45, rate: 75 },
  { name: '财务部', total: 25, completed: 22, rate: 88 },
  { name: '人事部', total: 20, completed: 18, rate: 90 }
])

const monitorList = ref<any[]>([])

const getRankColor = (index: number) => {
  const colors = ['#67C23A', '#67C23A', '#409EFF', '#E6A23C', '#F56C6C']
  return colors[index] || '#909399'
}

const fetchMonitorData = async () => {
  loading.value = true
  setTimeout(() => {
    monitorList.value = mockMonitorData
    loading.value = false
  }, 500)
}

const refreshData = () => {
  fetchMonitorData()
  ElMessage.success('数据已刷新')
}

const handleMonitor = (row: any) => {
  router.push(`/monitor/plan/${row.id}`)
}

const handleUrge = (row: any) => {
  ElMessage.success(`已向 ${row.neverStarted} 位未开始学员发送催办通知`)
}

onMounted(() => {
  fetchMonitorData()
})
</script>

<style scoped lang="scss">
.monitor-page {
  .stats-row {
    margin-bottom: 16px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-info {
          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #303133;
            line-height: 1.2;
          }
          
          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }
  
  .chart-row {
    margin-bottom: 16px;
    
    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chart-placeholder {
        height: 280px;
        padding: 20px;
        
        .mock-chart {
          height: 220px;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          gap: 16px;
          padding: 0 20px;
          
          .bar {
            width: 40px;
            background: linear-gradient(180deg, #409EFF 0%, #79bbff 100%);
            border-radius: 4px 4px 0 0;
            transition: height 0.3s;
          }
        }
        
        .chart-labels {
          display: flex;
          justify-content: space-around;
          margin-top: 12px;
          padding: 0 20px;
          
          span {
            font-size: 12px;
            color: #909399;
          }
        }
      }
      
      .dept-ranking {
        padding: 12px;
        
        .dept-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #ebeef5;
          
          &:last-child {
            border-bottom: none;
          }
          
          .rank {
            width: 24px;
            height: 24px;
            background: #f5f7fa;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 500;
            color: #606266;
          }
          
          .name {
            width: 100px;
            font-size: 14px;
            color: #303133;
          }
          
          .el-progress {
            flex: 1;
          }
          
          .count {
            width: 80px;
            text-align: right;
            font-size: 13px;
            color: #606266;
          }
        }
      }
    }
  }
  
  .plan-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
    
    .plan-name {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
    
    .funnel {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .funnel-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        background: #f5f7fa;
        border-radius: 4px;
        
        .label {
          font-size: 12px;
          color: #909399;
        }
        
        .value {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
          
          &.highlight {
            color: #67C23A;
          }
        }
        
        .el-icon {
          color: #c0c4cc;
          font-size: 12px;
        }
      }
    }
    
    .abnormal {
      .el-tag {
        cursor: pointer;
      }
    }
  }
}
</style>
