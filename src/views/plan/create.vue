<template>
  <div class="plan-create-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <h2>{{ isEdit ? '编辑培训计划' : '创建培训计划' }}</h2>
      </div>
    </div>

    <!-- 步骤条 -->
    <el-card class="step-card" shadow="never">
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="定义任务" />
        <el-step title="课程组装" />
        <el-step title="学员指派" />
        <el-step title="发布与通知" />
      </el-steps>
    </el-card>

    <!-- Step 1: 定义任务 -->
    <div v-if="currentStep === 0" class="step-content">
      <el-card shadow="never">
        <el-form :model="planForm" label-width="120px" class="plan-form">
          <el-form-item label="计划标题" required>
            <el-input 
              v-model="planForm.name" 
              placeholder="如：2024技术部晋升考核"
              style="width: 500px;"
            />
          </el-form-item>
          
          <el-form-item label="计划编号" required>
            <el-input 
              v-model="planForm.code" 
              placeholder="系统自动生成"
              disabled
              style="width: 300px;"
            />
          </el-form-item>
          
          <el-form-item label="时间周期" required>
            <el-date-picker
              v-model="planForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 400px;"
            />
          </el-form-item>
          
          <el-form-item label="任务类型" required>
            <el-radio-group v-model="planForm.type">
              <el-radio-button label="required">
                <el-icon><Lock /></el-icon>
                必修（强制推送，计入绩效）
              </el-radio-button>
              <el-radio-button label="optional">
                <el-icon><Unlock /></el-icon>
                选修（展示在选修池，自由报名）
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="结业证书">
            <el-select 
              v-model="planForm.certificateId" 
              placeholder="选择证书模板（可选）"
              clearable
              style="width: 400px;"
            >
              <el-option 
                v-for="cert in certificates" 
                :key="cert.id" 
                :label="cert.name" 
                :value="cert.id" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="计划说明">
            <el-input 
              v-model="planForm.description" 
              type="textarea" 
              :rows="4"
              placeholder="请输入计划说明，帮助学员了解培训目标和要求"
              style="width: 600px;"
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- Step 2: 课程组装 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-card shadow="never">
        <div class="course-assembly">
          <!-- 左侧：候选课程 -->
          <div class="candidate-courses">
            <h4>候选课程库</h4>
            <el-input
              v-model="courseSearch"
              placeholder="搜索课程"
              clearable
              style="margin-bottom: 16px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <div class="course-list">
              <div 
                v-for="course in filteredAvailableCourses" 
                :key="course.id"
                class="course-item"
              >
                <el-image :src="course.cover" fit="cover" class="course-cover" />
                <div class="course-info">
                  <div class="course-name">{{ course.name }}</div>
                  <el-tag size="small">{{ course.category }}</el-tag>
                </div>
                <el-button 
                  type="primary" 
                  link 
                  :icon="Plus"
                  @click="addCourse(course)"
                  :disabled="isCourseSelected(course.id)"
                >
                  {{ isCourseSelected(course.id) ? '已添加' : '添加' }}
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 右侧：已选课程 -->
          <div class="selected-courses">
            <div class="selected-header">
              <h4>已选课程清单</h4>
              <div class="unlock-mode">
                <span>闯关模式：</span>
                <el-switch v-model="planForm.unlockMode" />
                <el-tooltip content="开启后，学员必须按顺序学完上一门，才能解锁下一门" placement="top">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>
            
            <draggable 
              v-model="planForm.courses" 
              item-key="id"
              handle=".drag-handle"
              class="selected-list"
            >
              <template #item="{ element: course, index }">
                <div class="selected-item">
                  <div class="item-header">
                    <el-icon class="drag-handle"><Rank /></el-icon>
                    <span class="index-badge">{{ index + 1 }}</span>
                    <el-image :src="course.cover" fit="cover" class="item-cover" />
                    <div class="item-info">
                      <div class="item-name">{{ course.name }}</div>
                      <div class="item-category">{{ course.category }}</div>
                    </div>
                    <el-button link type="danger" :icon="Delete" @click="removeCourse(index)">
                      移除
                    </el-button>
                  </div>
                  
                  <div v-if="planForm.unlockMode && index < planForm.courses.length - 1" class="lock-chain">
                    <el-icon size="20" color="#E6A23C"><Lock /></el-icon>
                  </div>
                  
                  <div class="weight-setting">
                    <span class="label">学分权重：</span>
                    <el-input-number v-model="course.weight" :min="1" :max="10" size="small" />
                  </div>
                </div>
              </template>
            </draggable>
            
            <el-empty v-if="planForm.courses.length === 0" description="请从左侧选择课程" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- Step 3: 学员指派 -->
    <div v-if="currentStep === 2" class="step-content">
      <el-card shadow="never">
        <el-tabs v-model="targetTab">
          <el-tab-pane label="静态名单" name="static">
            <div class="target-static">
              <div class="target-section">
                <h4>组织架构选择</h4>
                <el-tree
                  :data="departments"
                  show-checkbox
                  node-key="id"
                  :props="{ label: 'name', children: 'children' }"
                  @check-change="handleDeptCheck"
                />
              </div>
              
              <div class="target-section">
                <h4>Excel导入</h4>
                <el-upload
                  drag
                  action="/api/import"
                  :on-success="handleImportSuccess"
                  accept=".xlsx,.xls"
                >
                  <el-icon class="el-icon--upload"><Upload /></el-icon>
                  <div class="el-upload__text">
                    拖拽Excel文件到此处或 <em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持 .xlsx/.xls 格式，需包含工号、姓名两列
                      <el-button link type="primary" :icon="Download">下载模板</el-button>
                    </div>
                  </template>
                </el-upload>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="动态规则" name="dynamic">
            <div class="target-dynamic">
              <h4>规则编辑器</h4>
              <p class="rule-desc">设置条件自动筛选学员，符合条件的员工将自动加入培训计划</p>
              
              <div class="rule-builder">
                <div class="rule-row">
                  <span class="rule-text">当</span>
                  <el-select v-model="dynamicRule.field" style="width: 140px;">
                    <el-option label="入职日期" value="joinDate" />
                    <el-option label="部门" value="dept" />
                    <el-option label="岗位" value="position" />
                    <el-option label="职级" value="level" />
                  </el-select>
                  <el-select v-model="dynamicRule.operator" style="width: 120px;">
                    <el-option label="等于" value="eq" />
                    <el-option label="不等于" value="ne" />
                    <el-option label="早于" value="lt" />
                    <el-option label="晚于" value="gt" />
                    <el-option label="包含" value="contains" />
                  </el-select>
                  <el-select v-if="dynamicRule.field === 'dept'" v-model="dynamicRule.value" style="width: 180px;">
                    <el-option label="技术部" value="技术部" />
                    <el-option label="销售部" value="销售部" />
                    <el-option label="产品部" value="产品部" />
                  </el-select>
                  <el-input v-else v-model="dynamicRule.value" placeholder="输入值" style="width: 180px;" />
                </div>
                
                <div class="rule-actions">
                  <el-button type="primary" :icon="View" @click="previewTarget">
                    计算覆盖人数
                  </el-button>
                </div>
                
                <div v-if="previewCount !== null" class="preview-result">
                  <el-alert
                    :title="`预计命中 ${previewCount} 人`"
                    type="success"
                    :closable="false"
                    show-icon
                  />
                  <el-table :data="previewUsers" size="small" style="margin-top: 12px;">
                    <el-table-column prop="name" label="姓名" width="100" />
                    <el-table-column prop="dept" label="部门" width="120" />
                    <el-table-column prop="employeeNo" label="工号" width="120" />
                    <el-table-column prop="joinDate" label="入职日期" />
                  </el-table>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- Step 4: 发布与通知 -->
    <div v-if="currentStep === 3" class="step-content">
      <el-card shadow="never">
        <div class="publish-section">
          <h4>通知渠道设置</h4>
          <div class="notify-channels">
            <el-checkbox v-model="notifyChannels.site" label="站内信" border />
            <el-checkbox v-model="notifyChannels.email" label="邮件" border />
            <el-checkbox v-model="notifyChannels.dingtalk" label="钉钉推送" border />
          </div>
        </div>
        
        <el-divider />
        
        <div class="preview-section">
          <h4>发布预览</h4>
          <div class="preview-card">
            <div class="preview-qr">
              <el-image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=plan-preview" />
              <p>扫码预览学员端效果</p>
            </div>
            <div class="preview-info">
              <h5>{{ planForm.name || '培训计划标题' }}</h5>
              <p>课程数量：{{ planForm.courses.length }} 门</p>
              <p>培训周期：{{ formatDateRange(planForm.timeRange) }}</p>
              <p>任务类型：{{ planForm.type === 'required' ? '必修' : '选修' }}</p>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="confirm-section">
          <el-alert
            title="请确认计划信息无误后再发布"
            type="warning"
            :closable="false"
            style="margin-bottom: 16px;"
          />
        </div>
      </el-card>
    </div>

    <!-- 步骤导航 -->
    <div class="step-actions">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <el-button v-if="currentStep < 3" type="primary" @click="nextStep">
        下一步
      </el-button>
      <template v-else>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish">立即发布</el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, View, Download, Delete, ArrowLeft } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { mockCertificates, mockDepartments, mockUsers, mockAvailableCourses } from './mock'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.name === 'PlanEdit')

const currentStep = ref(0)
const targetTab = ref('static')

// 计划表单
const planForm = ref({
  name: '',
  code: 'PLAN-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
  timeRange: [],
  type: 'required',
  certificateId: '',
  description: '',
  unlockMode: false,
  courses: []
})

const certificates = ref(mockCertificates)
const departments = ref(mockDepartments)
const courseSearch = ref('')
const availableCourses = ref(mockAvailableCourses)

const filteredAvailableCourses = computed(() => {
  if (!courseSearch.value) return availableCourses.value
  const kw = courseSearch.value.toLowerCase()
  return availableCourses.value.filter(c => c.name.toLowerCase().includes(kw))
})

const isCourseSelected = (courseId) => {
  return planForm.value.courses.some(c => c.id === courseId)
}

const addCourse = (course) => {
  planForm.value.courses.push({ ...course, weight: 1 })
}

const removeCourse = (index) => {
  planForm.value.courses.splice(index, 1)
}

// 动态规则
const dynamicRule = ref({
  field: 'joinDate',
  operator: 'gt',
  value: ''
})
const previewCount = ref(null)
const previewUsers = ref([])

const previewTarget = () => {
  // 模拟计算覆盖人数
  previewCount.value = 34
  previewUsers.value = mockUsers.slice(0, 5)
}

// 通知渠道
const notifyChannels = ref({
  site: true,
  email: true,
  dingtalk: false
})

const formatDateRange = (range) => {
  if (!range || range.length !== 2) return '-'
  const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `${format(range[0])} 至 ${format(range[1])}`
}

const handleDeptCheck = () => {
  // 处理部门选择
}

const handleImportSuccess = () => {
  ElMessage.success('导入成功')
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
  router.push('/plan')
}

const handlePublish = () => {
  ElMessage.success('计划发布成功')
  router.push('/plan')
}

const handleBack = () => {
  router.push('/plan')
}
</script>

<style scoped lang="scss">
.plan-create-page {
  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
  }
  
  .step-card {
    margin-bottom: 20px;
  }
  
  .step-content {
    margin-bottom: 20px;
    
    .plan-form {
      max-width: 800px;
    }
    
    .course-assembly {
      display: flex;
      gap: 24px;
      min-height: 500px;
      
      .candidate-courses {
        width: 360px;
        border-right: 1px solid #ebeef5;
        padding-right: 24px;
        
        h4 {
          margin: 0 0 16px;
          font-size: 16px;
        }
        
        .course-list {
          .course-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 8px;
            background: #f5f7fa;
            
            .course-cover {
              width: 80px;
              height: 45px;
              border-radius: 4px;
            }
            
            .course-info {
              flex: 1;
              min-width: 0;
              
              .course-name {
                font-size: 13px;
                color: #303133;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
      }
      
      .selected-courses {
        flex: 1;
        
        .selected-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          
          h4 {
            margin: 0;
            font-size: 16px;
          }
          
          .unlock-mode {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .help-icon {
              color: #909399;
              cursor: help;
            }
          }
        }
        
        .selected-list {
          .selected-item {
            margin-bottom: 16px;
            
            .item-header {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: #ecf5ff;
              border-radius: 6px;
              
              .drag-handle {
                cursor: move;
                color: #909399;
              }
              
              .index-badge {
                width: 24px;
                height: 24px;
                background: #409EFF;
                color: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
              }
              
              .item-cover {
                width: 80px;
                height: 45px;
                border-radius: 4px;
              }
              
              .item-info {
                flex: 1;
                
                .item-name {
                  font-size: 14px;
                  color: #303133;
                  margin-bottom: 4px;
                }
                
                .item-category {
                  font-size: 12px;
                  color: #909399;
                }
              }
            }
            
            .lock-chain {
              display: flex;
              justify-content: center;
              padding: 8px 0;
            }
            
            .weight-setting {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: #f5f7fa;
              border-radius: 0 0 6px 6px;
              
              .label {
                font-size: 13px;
                color: #606266;
              }
            }
          }
        }
      }
    }
    
    .target-static {
      display: flex;
      gap: 48px;
      
      .target-section {
        flex: 1;
        
        h4 {
          margin: 0 0 16px;
          font-size: 16px;
        }
      }
    }
    
    .target-dynamic {
      max-width: 600px;
      
      h4 {
        margin: 0 0 8px;
        font-size: 16px;
      }
      
      .rule-desc {
        color: #909399;
        font-size: 13px;
        margin-bottom: 24px;
      }
      
      .rule-builder {
        .rule-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          
          .rule-text {
            font-size: 14px;
            color: #606266;
          }
        }
        
        .rule-actions {
          margin: 24px 0;
        }
      }
    }
    
    .publish-section {
      h4 {
        margin: 0 0 16px;
        font-size: 16px;
      }
      
      .notify-channels {
        display: flex;
        gap: 16px;
      }
    }
    
    .preview-section {
      h4 {
        margin: 0 0 16px;
        font-size: 16px;
      }
      
      .preview-card {
        display: flex;
        gap: 24px;
        padding: 24px;
        background: #f5f7fa;
        border-radius: 8px;
        
        .preview-qr {
          text-align: center;
          
          p {
            margin-top: 12px;
            font-size: 13px;
            color: #606266;
          }
        }
        
        .preview-info {
          h5 {
            margin: 0 0 16px;
            font-size: 18px;
          }
          
          p {
            margin: 8px 0;
            color: #606266;
          }
        }
      }
    }
  }
  
  .step-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    position: sticky;
    bottom: 20px;
  }
}
</style>
