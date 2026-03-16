<template>
  <div class="dashboard-page">
    <!-- 欢迎语 -->
    <div class="welcome-section">
      <h2>欢迎使用课程管理系统</h2>
      <p>今天是 {{ currentDate }}，系统运行正常</p>
    </div>

    <!-- 核心指标 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="4" v-for="stat in coreStats" :key="stat.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ background: stat.bgColor }">
            <el-icon size="24" :color="stat.iconColor">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            <el-icon v-if="stat.trend > 0"><ArrowUp /></el-icon>
            <el-icon v-else><ArrowDown /></el-icon>
            <span>{{ Math.abs(stat.trend) }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <span>学习活跃度趋势</span>
              <el-radio-group v-model="chartPeriod" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="quarter">本季</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="line-chart">
            <div class="chart-y-axis">
              <span v-for="i in 5" :key="i">{{ 100 - (i - 1) * 25 }}</span>
            </div>
            <div class="chart-content">
              <svg viewBox="0 0 700 200" class="trend-svg">
                <!-- 渐变定义 -->
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#409EFF;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#409EFF;stop-opacity:0" />
                  </linearGradient>
                </defs>
                <!-- 填充区域 -->
                <path :d="areaPath" fill="url(#lineGradient)" />
                <!-- 线条 -->
                <path :d="linePath" fill="none" stroke="#409EFF" stroke-width="2" />
                <!-- 数据点 -->
                <circle 
                  v-for="(point, index) in chartPoints" 
                  :key="index"
                  :cx="point.x" 
                  :cy="point.y" 
                  r="4" 
                  fill="#409EFF"
                />
              </svg>
              <div class="chart-x-axis">
                <span v-for="(label, index) in chartLabels" :key="index">{{ label }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <span>课程类型分布</span>
            </div>
          </template>
          <div class="pie-chart">
            <div class="pie-container">
              <div class="pie-center">
                <div class="center-value">{{ totalCourses }}</div>
                <div class="center-label">课程总数</div>
              </div>
              <svg viewBox="0 0 200 200" class="pie-svg">
                <circle 
                  v-for="(slice, index) in pieSlices" 
                  :key="index"
                  cx="100" 
                  cy="100" 
                  r="80"
                  fill="none"
                  :stroke="slice.color"
                  :stroke-width="20"
                  :stroke-dasharray="`${slice.length} ${440 - slice.length}`"
                  :stroke-dashoffset="slice.offset"
                  transform="rotate(-90 100 100)"
                />
              </svg>
            </div>
            <div class="pie-legend">
              <div class="legend-item" v-for="(item, index) in courseTypeData" :key="index">
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span class="legend-name">{{ item.name }}</span>
                <span class="legend-value">{{ item.value }} ({{ Math.round(item.value / totalCourses * 100) }}%)</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-row :gutter="16" class="table-row">
      <el-col :span="12">
        <el-card class="table-card" shadow="never">
          <template #header>
            <div class="table-header">
              <span>热门课程 TOP10</span>
              <el-button link type="primary">查看全部</el-button>
            </div>
          </template>
          <el-table :data="hotCourses" stripe size="small">
            <el-table-column type="index" width="50" />
            <el-table-column label="课程名称" prop="name" show-overflow-tooltip />
            <el-table-column label="学习人数" width="100" prop="learners" />
            <el-table-column label="完成率" width="100">
              <template #default="{ row }">
                <el-progress :percentage="row.completionRate" :stroke-width="6" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="table-card" shadow="never">
          <template #header>
            <div class="table-header">
              <span>学习达人榜</span>
              <el-button link type="primary">查看全部</el-button>
            </div>
          </template>
          <el-table :data="topLearners" stripe size="small">
            <el-table-column type="index" width="50">
              <template #default="{ $index }">
                <el-icon v-if="$index < 3" :color="['#FFD700', '#C0C0C0', '#CD7F32'][$index]">
                  <Trophy />
                </el-icon>
                <span v-else>{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="学员" min-width="120">
              <template #default="{ row }">
                <div class="learner-info">
                  <el-avatar :size="28" :src="row.avatar">{{ row.name.charAt(0) }}</el-avatar>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="部门" prop="dept" width="120" />
            <el-table-column label="学习时长" width="120">
              <template #default="{ row }">
                <span class="highlight">{{ row.studyHours }}h</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card class="quick-links" shadow="never">
      <template #header>
        <span>快捷入口</span>
      </template>
      <div class="links-grid">
        <div class="link-item" @click="navigateTo('/course')">
          <div class="link-icon" style="background: #ecf5ff;">
            <el-icon size="28" color="#409EFF"><Reading /></el-icon>
          </div>
          <span class="link-name">新建课程</span>
        </div>
        <div class="link-item" @click="navigateTo('/plan/create')">
          <div class="link-icon" style="background: #f0f9eb;">
            <el-icon size="28" color="#67C23A"><Calendar /></el-icon>
          </div>
          <span class="link-name">创建计划</span>
        </div>
        <div class="link-item" @click="navigateTo('/resource')">
          <div class="link-icon" style="background: #fdf6ec;">
            <el-icon size="28" color="#E6A23C"><Folder /></el-icon>
          </div>
          <span class="link-name">上传资源</span>
        </div>
        <div class="link-item" @click="navigateTo('/monitor')">
          <div class="link-icon" style="background: #f4f4f5;">
            <el-icon size="28" color="#909399"><TrendCharts /></el-icon>
          </div>
          <span class="link-name">查看监控</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const chartPeriod = ref('week')

const currentDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

const coreStats = ref([
  { label: '课程总数', value: 86, trend: 12, icon: 'Reading', bgColor: '#ecf5ff', iconColor: '#409EFF' },
  { label: '培训计划', value: 24, trend: 8, icon: 'Calendar', bgColor: '#f0f9eb', iconColor: '#67C23A' },
  { label: '学习资源', value: 328, trend: 25, icon: 'Folder', bgColor: '#fdf6ec', iconColor: '#E6A23C' },
  { label: '注册学员', value: 1256, trend: 5, icon: 'User', bgColor: '#f4f4f5', iconColor: '#909399' },
  { label: '本月学习', value: 892, trend: 18, icon: 'Clock', bgColor: '#ecf5ff', iconColor: '#409EFF' },
  { label: '完成率', value: '78%', trend: 3, icon: 'CircleCheck', bgColor: '#f0f9eb', iconColor: '#67C23A' }
])

// 折线图数据
const chartData = ref([65, 78, 90, 85, 95, 88, 92, 85, 90, 95, 88, 92])
const chartLabels = ref(['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日'])

const chartPoints = computed(() => {
  const width = 700
  const height = 200
  const padding = 20
  const points = chartData.value.map((value, index) => ({
    x: padding + (index / (chartData.value.length - 1)) * (width - padding * 2),
    y: height - padding - (value / 100) * (height - padding * 2)
  }))
  return points
})

const linePath = computed(() => {
  const points = chartPoints.value
  if (points.length === 0) return ''
  
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 2
    const cpy1 = prev.y
    const cpx2 = prev.x + (curr.x - prev.x) / 2
    const cpy2 = curr.y
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`
  }
  return path
})

const areaPath = computed(() => {
  const points = chartPoints.value
  if (points.length === 0) return ''
  
  const height = 200
  const padding = 20
  let path = `M ${points[0].x} ${height - padding}`
  path += ` L ${points[0].x} ${points[0].y}`
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 2
    const cpy1 = prev.y
    const cpx2 = prev.x + (curr.x - prev.x) / 2
    const cpy2 = curr.y
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`
  }
  
  path += ` L ${points[points.length - 1].x} ${height - padding} Z`
  return path
})

// 饼图数据
const courseTypeData = ref([
  { name: '技术培训', value: 35, color: '#409EFF' },
  { name: '管理培训', value: 20, color: '#67C23A' },
  { name: '产品培训', value: 15, color: '#E6A23C' },
  { name: '通用技能', value: 16, color: '#F56C6C' }
])

const totalCourses = computed(() => {
  return courseTypeData.value.reduce((sum, item) => sum + item.value, 0)
})

const pieSlices = computed(() => {
  const total = totalCourses.value
  let offset = 0
  const circumference = 2 * Math.PI * 80 // r=80
  
  return courseTypeData.value.map(item => {
    const length = (item.value / total) * circumference
    const slice = {
      color: item.color,
      length,
      offset: -offset
    }
    offset += length
    return slice
  })
})

// 热门课程
const hotCourses = ref([
  { name: '新员工入职培训系列课程', learners: 245, completionRate: 92 },
  { name: 'Java高级工程师进阶之路', learners: 189, completionRate: 78 },
  { name: '销售精英技能提升训练营', learners: 167, completionRate: 85 },
  { name: '产品经理能力体系建设', learners: 156, completionRate: 88 },
  { name: '企业级架构设计模式', learners: 134, completionRate: 72 }
])

// 学习达人
const topLearners = ref([
  { name: '张三', dept: '技术部', studyHours: 48, avatar: '' },
  { name: '李四', dept: '销售部', studyHours: 42, avatar: '' },
  { name: '王五', dept: '产品部', studyHours: 38, avatar: '' },
  { name: '赵六', dept: '技术部', studyHours: 35, avatar: '' },
  { name: '孙七', dept: '人事部', studyHours: 32, avatar: '' }
])

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.dashboard-page {
  .welcome-section {
    margin-bottom: 24px;
    
    h2 {
      font-size: 24px;
      font-weight: 500;
      color: #303133;
      margin: 0 0 8px;
    }
    
    p {
      color: #909399;
      font-size: 14px;
      margin: 0;
    }
  }
  
  .stats-row {
    margin-bottom: 16px;
    
    .stat-card {
      :deep(.el-card__body) {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1.2;
        }
        
        .stat-label {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
      
      .stat-trend {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 2px;
        
        &.up {
          color: #67C23A;
        }
        
        &.down {
          color: #F56C6C;
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
        font-weight: 500;
      }
      
      .line-chart {
        height: 280px;
        display: flex;
        
        .chart-y-axis {
          width: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          padding-right: 8px;
          color: #909399;
          font-size: 12px;
        }
        
        .chart-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          
          .trend-svg {
            flex: 1;
            width: 100%;
          }
          
          .chart-x-axis {
            height: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            color: #909399;
            font-size: 12px;
          }
        }
      }
      
      .pie-chart {
        padding: 20px;
        
        .pie-container {
          display: flex;
          justify-content: center;
          position: relative;
          margin-bottom: 24px;
          
          .pie-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            
            .center-value {
              font-size: 32px;
              font-weight: 600;
              color: #303133;
            }
            
            .center-label {
              font-size: 12px;
              color: #909399;
              margin-top: 4px;
            }
          }
          
          .pie-svg {
            width: 200px;
            height: 200px;
            transform: rotate(-90deg);
          }
        }
        
        .pie-legend {
          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            
            .legend-dot {
              width: 12px;
              height: 12px;
              border-radius: 50%;
            }
            
            .legend-name {
              flex: 1;
              font-size: 14px;
              color: #606266;
            }
            
            .legend-value {
              font-size: 14px;
              color: #909399;
            }
          }
        }
      }
    }
  }
  
  .table-row {
    margin-bottom: 16px;
    
    .table-card {
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
      }
      
      .learner-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .highlight {
        color: #409EFF;
        font-weight: 500;
      }
    }
  }
  
  .quick-links {
    .links-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      
      .link-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background: #f5f7fa;
        }
        
        .link-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .link-name {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }
}
</style>
