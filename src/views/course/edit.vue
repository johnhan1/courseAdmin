<template>
  <div class="course-edit-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <h2>{{ isEdit ? '编辑课程' : '新建课程' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish">立即发布</el-button>
      </div>
    </div>

    <!-- 基础信息区 -->
    <el-card class="basic-info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>基础信息</span>
        </div>
      </template>
      
      <el-form :model="courseForm" label-width="100px">
        <el-row :gutter="24">
          <el-col :span="16">
            <el-form-item label="课程名称" required>
              <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程分类" required>
              <el-select v-model="courseForm.category" placeholder="请选择" style="width: 100%;">
                <el-option label="技术培训" value="tech" />
                <el-option label="管理培训" value="management" />
                <el-option label="产品培训" value="product" />
                <el-option label="通用技能" value="general" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="课程简介">
          <el-input 
            v-model="courseForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入课程简介，帮助学员了解课程内容"
          />
        </el-form-item>
        
        <el-form-item label="课程封面">
          <el-upload
            class="cover-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
          >
            <img v-if="courseForm.cover" :src="courseForm.cover" class="cover-image" />
            <div v-else class="cover-placeholder">
              <el-icon size="32"><Plus /></el-icon>
              <div class="upload-text">点击上传封面</div>
              <div class="upload-tip">建议尺寸 16:9，最大 2MB</div>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 章节编排区 -->
    <el-card class="curriculum-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>章节编排</span>
          <el-button type="primary" :icon="Plus" @click="addChapter">
            添加章节
          </el-button>
        </div>
      </template>
      
      <div class="curriculum-builder">
        <!-- 左侧目录树 -->
        <div class="chapter-tree">
          <div class="tree-header">
            <span>课程目录</span>
            <span class="stats">{{ chapters.length }}章 / {{ totalLessons }}节</span>
          </div>
          
          <draggable 
            v-model="chapters" 
            item-key="id"
            handle=".drag-handle"
            class="chapter-list"
          >
            <template #item="{ element: chapter, index: chapIndex }">
              <div class="chapter-item">
                <div 
                  class="chapter-header"
                  :class="{ active: currentChapter?.id === chapter.id }"
                  @click="selectChapter(chapter)"
                >
                  <el-icon class="drag-handle"><Rank /></el-icon>
                  <span class="chapter-name">{{ chapter.name }}</span>
                  <div class="chapter-actions">
                    <el-tooltip content="添加子节">
                      <el-icon @click.stop="addLesson(chapter)"><Plus /></el-icon>
                    </el-tooltip>
                    <el-tooltip content="重命名">
                      <el-icon @click.stop="renameChapter(chapter)"><Edit /></el-icon>
                    </el-tooltip>
                    <el-tooltip content="删除章节">
                      <el-icon @click.stop="deleteChapter(chapter, chapIndex)"><Delete /></el-icon>
                    </el-tooltip>
                  </div>
                </div>
                
                <draggable 
                  v-model="chapter.lessons" 
                  item-key="id"
                  handle=".drag-handle"
                  group="lessons"
                  class="lesson-list"
                >
                  <template #item="{ element: lesson, index: lesIndex }">
                    <div 
                      class="lesson-item"
                      :class="{ 
                        active: currentLesson?.id === lesson.id,
                        'has-resource': !!lesson.resource 
                      }"
                      @click="selectLesson(chapter, lesson)"
                    >
                      <el-icon class="drag-handle"><Rank /></el-icon>
                      <el-icon v-if="lesson.resource" size="14" color="#67C23A" class="resource-icon">
                        <CircleCheck />
                      </el-icon>
                      <el-icon v-else size="14" color="#C0C4CC" class="resource-icon">
                        <CircleClose />
                      </el-icon>
                      <span class="lesson-name">{{ lesson.name }}</span>
                      <div class="lesson-actions">
                        <el-icon @click.stop="deleteLesson(chapter, lesIndex)"><Delete /></el-icon>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </template>
          </draggable>
        </div>
        
        <!-- 右侧配置面板 -->
        <div class="lesson-config" v-if="currentLesson">
          <div class="config-header">
            <h4>节点配置</h4>
            <div class="current-path">
              {{ currentChapter?.name }} / {{ currentLesson.name }}
            </div>
          </div>
          
          <div class="config-body">
            <!-- 资源挂载区 -->
            <div class="config-section">
              <h5>学习资源</h5>
              
              <div v-if="currentLesson.resource" class="resource-preview">
                <div class="resource-card">
                  <el-image 
                    v-if="currentLesson.resource.thumbnail"
                    :src="currentLesson.resource.thumbnail" 
                    class="resource-thumb"
                    fit="cover"
                  />
                  <div v-else class="resource-icon-large">
                    <el-icon size="48" color="#409EFF"><Document /></el-icon>
                  </div>
                  <div class="resource-info">
                    <div class="resource-name">{{ currentLesson.resource.name }}</div>
                    <div class="resource-meta">
                      <span v-if="currentLesson.resource.duration">
                        <el-icon><Timer /></el-icon>
                        {{ currentLesson.resource.duration }}
                      </span>
                      <el-tag size="small">{{ getResourceTypeLabel(currentLesson.resource.type) }}</el-tag>
                    </div>
                  </div>
                  <el-button 
                    type="danger" 
                    link 
                    :icon="Close"
                    @click="removeResource"
                    class="remove-btn"
                  >
                    移除
                  </el-button>
                </div>
              </div>
              
              <div v-else class="resource-empty" @click="openResourceModal">
                <el-icon size="48" color="#C0C4CC"><Plus /></el-icon>
                <p>从资源库选择素材</p>
              </div>
            </div>
            
            <!-- 节点属性 -->
            <div class="config-section">
              <h5>节点属性</h5>
              
              <el-form label-width="120px">
                <el-form-item label="允许免费试看">
                  <el-switch v-model="currentLesson.isFree" />
                </el-form-item>
                
                <el-form-item label="关联课后练习">
                  <el-select 
                    v-model="currentLesson.quizId" 
                    placeholder="选择微试卷（可选）"
                    clearable
                    style="width: 100%;"
                  >
                    <el-option 
                      v-for="quiz in quizList" 
                      :key="quiz.id" 
                      :label="quiz.name" 
                      :value="quiz.id" 
                    />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
        
        <div class="lesson-config empty" v-else>
          <el-empty description="请选择或创建一个课时节点" />
        </div>
      </div>
    </el-card>

    <!-- 资源选择模态框 -->
    <resource-selector
      v-model:visible="resourceModalVisible"
      @select="handleResourceSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Close, Timer, Document, ArrowLeft } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import ResourceSelector from './components/ResourceSelector.vue'
import { mockCourses, mockChapters, mockQuizzes } from './mock'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.id)
const isEdit = computed(() => !!courseId.value)

// 课程表单
const courseForm = ref({
  name: '',
  category: '',
  description: '',
  cover: ''
})

// 章节数据
const chapters = ref([])
const currentChapter = ref(null)
const currentLesson = ref(null)
const quizList = ref([])
const resourceModalVisible = ref(false)

const totalLessons = computed(() => {
  return chapters.value.reduce((sum, chap) => sum + (chap.lessons?.length || 0), 0)
})

const getResourceTypeLabel = (type) => {
  const labels = {
    video: '视频',
    document: '文档',
    audio: '音频',
    image: '图片'
  }
  return labels[type] || '其他'
}

// 加载课程数据
const loadCourseData = () => {
  if (isEdit.value) {
    const course = mockCourses.find(c => c.id === Number(courseId.value))
    if (course) {
      courseForm.value = {
        name: course.name,
        category: course.category,
        description: course.description,
        cover: course.cover
      }
    }
    chapters.value = JSON.parse(JSON.stringify(mockChapters))
  }
  quizList.value = mockQuizzes
}

// 章节操作
const addChapter = () => {
  ElMessageBox.prompt('请输入章节名称', '添加章节', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    const newChapter = {
      id: `chap-${Date.now()}`,
      name: value,
      sort: chapters.value.length + 1,
      lessons: []
    }
    chapters.value.push(newChapter)
    ElMessage.success('章节添加成功')
  })
}

const renameChapter = (chapter) => {
  ElMessageBox.prompt('请输入新名称', '重命名章节', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: chapter.name
  }).then(({ value }) => {
    chapter.name = value
    ElMessage.success('重命名成功')
  })
}

const deleteChapter = (chapter, index) => {
  if (chapter.lessons?.length > 0) {
    ElMessage.warning('该章节下还有课时，请先删除课时')
    return
  }
  chapters.value.splice(index, 1)
  if (currentChapter.value?.id === chapter.id) {
    currentChapter.value = null
    currentLesson.value = null
  }
  ElMessage.success('章节删除成功')
}

const selectChapter = (chapter) => {
  currentChapter.value = chapter
}

// 课时操作
const addLesson = (chapter) => {
  ElMessageBox.prompt('请输入课时名称', '添加课时', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    const newLesson = {
      id: `les-${Date.now()}`,
      name: value,
      sort: (chapter.lessons?.length || 0) + 1,
      resource: null,
      isFree: false,
      quizId: null
    }
    if (!chapter.lessons) chapter.lessons = []
    chapter.lessons.push(newLesson)
    ElMessage.success('课时添加成功')
  })
}

const deleteLesson = (chapter, index) => {
  chapter.lessons.splice(index, 1)
  if (currentLesson.value?.id === chapter.lessons[index]?.id) {
    currentLesson.value = null
  }
  ElMessage.success('课时删除成功')
}

const selectLesson = (chapter, lesson) => {
  currentChapter.value = chapter
  currentLesson.value = lesson
}

// 资源操作
const openResourceModal = () => {
  resourceModalVisible.value = true
}

const handleResourceSelect = (resource) => {
  if (currentLesson.value) {
    currentLesson.value.resource = resource
    ElMessage.success('资源挂载成功')
  }
}

const removeResource = () => {
  if (currentLesson.value) {
    currentLesson.value.resource = null
    ElMessage.success('资源已移除')
  }
}

// 封面操作
const handleCoverSuccess = (res) => {
  courseForm.value.cover = res.url
}

// 保存操作
const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
}

const handlePublish = () => {
  ElMessage.success('课程发布成功')
  router.push('/course')
}

const handleBack = () => {
  router.push('/course')
}

onMounted(() => {
  loadCourseData()
})
</script>

<style scoped lang="scss">
.course-edit-page {
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
  
  .basic-info-card {
    margin-bottom: 20px;
    
    .card-header {
      font-weight: 500;
    }
    
    .cover-uploader {
      :deep(.el-upload) {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: border-color 0.3s;
        
        &:hover {
          border-color: #409EFF;
        }
      }
      
      .cover-image {
        width: 300px;
        height: 169px;
        object-fit: cover;
      }
      
      .cover-placeholder {
        width: 300px;
        height: 169px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #8c939d;
        
        .upload-text {
          margin-top: 8px;
          font-size: 14px;
        }
        
        .upload-tip {
          margin-top: 4px;
          font-size: 12px;
        }
      }
    }
  }
  
  .curriculum-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
    
    .curriculum-builder {
      display: flex;
      height: 600px;
      
      .chapter-tree {
        width: 320px;
        border-right: 1px solid #ebeef5;
        display: flex;
        flex-direction: column;
        
        .tree-header {
          padding: 12px 16px;
          border-bottom: 1px solid #ebeef5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .stats {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .chapter-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          
          .chapter-item {
            margin-bottom: 8px;
            
            .chapter-header {
              display: flex;
              align-items: center;
              padding: 10px 12px;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.2s;
              
              &:hover, &.active {
                background: #ecf5ff;
              }
              
              .drag-handle {
                cursor: move;
                margin-right: 8px;
                color: #c0c4cc;
              }
              
              .chapter-name {
                flex: 1;
                font-weight: 500;
                color: #303133;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              
              .chapter-actions {
                display: none;
                gap: 8px;
                
                .el-icon {
                  padding: 4px;
                  border-radius: 4px;
                  
                  &:hover {
                    background: #dcdfe6;
                  }
                }
              }
              
              &:hover .chapter-actions {
                display: flex;
              }
            }
            
            .lesson-list {
              padding-left: 24px;
              
              .lesson-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 4px;
                
                &:hover, &.active {
                  background: #f5f7fa;
                }
                
                &.has-resource .lesson-name {
                  color: #67C23A;
                }
                
                .drag-handle {
                  cursor: move;
                  margin-right: 6px;
                  color: #c0c4cc;
                  font-size: 12px;
                }
                
                .resource-icon {
                  margin-right: 6px;
                }
                
                .lesson-name {
                  flex: 1;
                  font-size: 13px;
                  color: #606266;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
                
                .lesson-actions {
                  display: none;
                  
                  .el-icon {
                    padding: 4px;
                    border-radius: 4px;
                    
                    &:hover {
                      background: #fcd3d3;
                      color: #f56c6c;
                    }
                  }
                }
                
                &:hover .lesson-actions {
                  display: block;
                }
              }
            }
          }
        }
      }
      
      .lesson-config {
        flex: 1;
        background: #f5f7fa;
        display: flex;
        flex-direction: column;
        
        &.empty {
          align-items: center;
          justify-content: center;
        }
        
        .config-header {
          padding: 16px 20px;
          background: #fff;
          border-bottom: 1px solid #ebeef5;
          
          h4 {
            margin: 0 0 8px;
            font-size: 16px;
          }
          
          .current-path {
            font-size: 13px;
            color: #909399;
          }
        }
        
        .config-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          
          .config-section {
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
            
            h5 {
              margin: 0 0 16px;
              font-size: 14px;
              color: #303133;
              padding-bottom: 12px;
              border-bottom: 1px solid #ebeef5;
            }
            
            .resource-empty {
              height: 160px;
              border: 2px dashed #dcdfe6;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s;
              
              &:hover {
                border-color: #409EFF;
                background: #ecf5ff;
              }
              
              p {
                margin-top: 12px;
                color: #606266;
              }
            }
            
            .resource-card {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 16px;
              background: #f5f7fa;
              border-radius: 8px;
              
              .resource-thumb {
                width: 120px;
                height: 68px;
                border-radius: 4px;
                object-fit: cover;
              }
              
              .resource-icon-large {
                width: 120px;
                height: 68px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #fff;
                border-radius: 4px;
              }
              
              .resource-info {
                flex: 1;
                
                .resource-name {
                  font-size: 14px;
                  font-weight: 500;
                  color: #303133;
                  margin-bottom: 8px;
                }
                
                .resource-meta {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  font-size: 13px;
                  color: #909399;
                  
                  span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                  }
                }
              }
              
              .remove-btn {
                margin-left: auto;
              }
            }
          }
        }
      }
    }
  }
}
</style>
