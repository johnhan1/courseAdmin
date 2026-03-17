<template>
  <div class="workspace-page">
    <!-- Top Nav -->
    <!-- <header class="workspace-header">
      <div class="header-left">
        <el-button link class="back-btn" @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="title-with-icon">
          <el-icon class="edit-icon"><EditPen /></el-icon>
          <h2>工作区：内容编辑模式</h2>
        </div>
      </div>
      <div class="header-right">
        <el-button class="preview-btn">预览课程</el-button>
        <el-button type="primary" class="publish-btn" @click="handlePublish">
          <el-icon><Upload /></el-icon>
          保存并发布
        </el-button>
      </div>
    </header> -->

    <main class="workspace-main">
      <!-- Course Info Card -->
      <div class="course-header-card">
        <div class="course-info">
          <div class="course-icon-wrapper">
            <el-icon class="course-icon"><Reading /></el-icon>
          </div>
          <div class="course-details">
            <div class="course-title-row">
              <h1 class="course-title">{{ courseForm.name || '网络安全基础 2024' }}</h1>
              <el-tag size="small" class="course-tag">线上课程</el-tag>
            </div>
            <div class="course-meta">
              <span>学分: 5.0</span>
              <span class="divider">|</span>
              <span>目标: 全体员工</span>
            </div>
          </div>
        </div>
        <div class="course-actions">
          <div class="save-status">
            <span class="status-label">最后保存</span>
            <span class="status-time">今天 14:20</span>
          </div>
          <el-button class="settings-btn" :icon="Setting"></el-button>
        </div>
      </div>

      <!-- 3 Columns Workspace -->
      <div class="workspace-columns">
        
        <!-- Column 1: Chapter Management -->
        <div class="col-card col-chapters">
          <div class="col-header">
            <div class="col-title">
              <el-icon><Menu /></el-icon>
              <span>章节管理</span>
            </div>
            <el-button link class="add-btn" @click="addChapter">
              <el-icon><CirclePlus /></el-icon>
            </el-button>
          </div>
          
          <div class="col-body chapter-tree-body">
            <draggable 
              v-model="chapters" 
              item-key="id" 
              handle=".drag-handle" 
              class="chapter-list"
              @end="onChapterDragEnd"
            >
              <template #item="{ element: chapter, index: chapIndex }">
                <div class="chapter-item" :class="{ 'is-active': currentChapter?.id === chapter.id }">
                  <div class="chapter-title" @click="selectChapter(chapter)">
                    <div class="chapter-title-left">
                      <el-icon class="drag-handle"><Rank /></el-icon>
                      <el-icon class="collapse-icon" @click.stop="toggleChapterCollapse(chapter)">
                        <ArrowDown v-if="!chapter.isCollapsed" />
                        <ArrowRight v-else />
                      </el-icon>
                      <el-input 
                        v-if="chapter.isEditing"
                        v-model="chapter.editName"
                        class="chapter-name-input"
                        size="small"
                        @click.stop
                        @blur="finishRenameChapter(chapter)"
                        @keyup.enter="finishRenameChapter(chapter)"
                        ref="chapterInputRef"
                      />
                      <span v-else class="chapter-name" @dblclick.stop="startRenameChapter(chapter)">{{ chapter.name }}</span>
                    </div>
                    <div class="chapter-actions">
                      <el-icon class="action-icon" @click.stop="addLesson(chapter)"><Plus /></el-icon>
                      <el-dropdown trigger="click">
                        <el-icon class="action-icon" @click.stop><MoreFilled /></el-icon>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="startRenameChapter(chapter)">重命名</el-dropdown-item>
                            <el-dropdown-item @click="deleteChapter(chapter, chapIndex)" divided class="danger-text">删除章节</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                  
                  <div class="chapter-content" v-show="!chapter.isCollapsed">
                      <draggable 
                        v-model="chapter.lessons" 
                        item-key="id" 
                        handle=".drag-handle" 
                        group="lessons" 
                        class="lesson-list"
                        @end="onLessonDragEnd"
                      >
                        <template #item="{ element: lesson, index: lesIndex }">
                          <div class="lesson-item" :class="{ 'is-active': currentLesson?.id === lesson.id }" @click="selectLesson(chapter, lesson)">
                            <el-icon class="drag-handle"><Rank /></el-icon>
                            <el-icon v-if="lesson.resource?.type === 'video'" class="lesson-type-icon icon-video"><VideoPlay /></el-icon>
                            <el-icon v-else class="lesson-type-icon icon-doc"><Document /></el-icon>
                            <span class="lesson-name">{{ lesson.name }}</span>
                          </div>
                        </template>
                      </draggable>
                    </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <!-- Column 2: Content Upload -->
        <div class="col-card col-content">
          <div class="col-header">
            <div class="col-title">
              <el-icon><Menu /></el-icon>
              <span>内容管理</span>
            </div>
          </div>
          
          <div class="col-body" v-if="currentLesson">
            <div class="form-group">
              <label class="form-label">小节标题</label>
              <el-input v-model="currentLesson.name" class="lesson-title-input" />
            </div>

            <div class="upload-area" v-if="!currentLesson.resource">
              <el-upload
                class="content-uploader"
                drag
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleResourceUploadSuccess"
              >
                <div class="upload-inner">
                  <!-- <el-icon class="upload-icon"><CloudUpload /></el-icon> -->
                  <div class="upload-text">点击或拖拽文件上传</div>
                  <div class="upload-tip">支持 MP4, PDF, PPT (最大 500MB)</div>
                  <div class="supported-icons">
                    <el-icon class="icon-pdf" color="#E74C3C"><Document /></el-icon>
                    <el-icon class="icon-video" color="#3498DB"><VideoPlay /></el-icon>
                    <el-icon class="icon-ppt" color="#F39C12"><DataBoard /></el-icon>
                  </div>
                </div>
              </el-upload>
            </div>
            
            <div class="uploaded-file-card" v-else>
              <div class="file-icon-wrapper">
                <el-icon v-if="currentLesson.resource.type === 'video'" class="file-icon" color="#3498DB"><VideoPlay /></el-icon>
                <el-icon v-else class="file-icon" color="#E74C3C"><Document /></el-icon>
              </div>
              <div class="file-info">
                <div class="file-name">{{ currentLesson.resource.name }}</div>
                <div class="file-meta">{{ currentLesson.resource.size || '124.5 MB' }} · 已上传</div>
              </div>
              <div class="file-actions">
                <el-button link><el-icon><View /></el-icon></el-button>
                <el-button link type="danger" @click="removeResource"><el-icon><Delete /></el-icon></el-button>
              </div>
            </div>

            <el-button class="import-btn" @click="openResourceModal" plain>
              <el-icon><Files /></el-icon> 从素材库导入
            </el-button>
          </div>
          
          <div class="col-body empty-state" v-else>
            <el-empty description="请先在左侧选择或添加小节" />
          </div>
        </div>

        <!-- Column 3: Learning Settings -->
        <!-- <div class="col-card col-settings">
          <div class="col-header">
            <div class="col-title">
              <el-icon><Menu /></el-icon>
              <span>学习设置</span>
            </div>
          </div>
          
          <div class="col-body" v-if="currentLesson">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">防拖拽进度条</div>
                <div class="setting-desc">无法跳过未学章节。</div>
              </div>
              <el-switch v-model="settings.antiDrag" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">断点续看</div>
                <div class="setting-desc">自动记录观看进度。</div>
              </div>
              <el-switch v-model="settings.resumePlayback" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-title">完成后解锁下一课</div>
                <div class="setting-desc">完成当前节解锁下部分。</div>
              </div>
              <el-switch v-model="settings.unlockNext" />
            </div>

            <div class="form-group min-view-time">
              <label class="form-label">最少观看时长 (分钟)</label>
              <el-input v-model="settings.minViewTime" placeholder="10">
                <template #suffix>MIN</template>
              </el-input>
            </div>

            <div class="info-alert">
              <el-icon class="info-icon"><InfoFilled /></el-icon>
              <div class="alert-content">
                <div class="alert-title">提示</div>
                <div class="alert-desc">章节必须包含至少一个教学内容方可发布。</div>
              </div>
            </div>
          </div>
          
          <div class="col-body empty-state" v-else>
            <el-empty description="请选择小节" />
          </div>
        </div> -->
      </div>
    </main>

    <!-- 资源选择模态框 -->
    <resource-selector v-model:visible="resourceModalVisible" @select="handleResourceSelect" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Close, Timer, Document, ArrowLeft, EditPen, Upload, Reading, 
  Setting, Menu, CirclePlus, MoreFilled, VideoPlay, FullScreen, 
  DataBoard, View, Delete, Files, InfoFilled, Rank, CircleCheck, CircleClose, Edit,
  ArrowDown, ArrowRight
} from '@element-plus/icons-vue'
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

const settings = ref({
  antiDrag: true,
  resumePlayback: true,
  unlockNext: false,
  minViewTime: 10
})

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

// 拖拽结束处理逻辑
const updateChapterNames = () => {
  chapters.value.forEach((chapter, index) => {
    const sort = index + 1
    chapter.sort = sort
    // 只替换"第X章"部分，保留冒号后面的自定义标题内容
    const nameParts = chapter.name.split('：')
    if (nameParts.length > 1) {
      chapter.name = `第${numberToChinese(sort)}章：${nameParts.slice(1).join('：')}`
    } else {
      chapter.name = `第${numberToChinese(sort)}章`
    }
  })
}

const updateLessonNames = () => {
  chapters.value.forEach((chapter, cIndex) => {
    const chapterSort = cIndex + 1
    if (chapter.lessons && chapter.lessons.length > 0) {
      chapter.lessons.forEach((lesson, lIndex) => {
        const lessonSort = lIndex + 1
        lesson.sort = lessonSort
        // 替换开头的 "X.Y " 部分
        const nameMatch = lesson.name.match(/^\d+\.\d+\s+(.*)/)
        if (nameMatch && nameMatch[1]) {
          lesson.name = `${chapterSort}.${lessonSort} ${nameMatch[1]}`
        } else {
          lesson.name = `${chapterSort}.${lessonSort} 新小节`
        }
      })
    }
  })
}

const onChapterDragEnd = () => {
  updateChapterNames()
  // 章节顺序改变可能会影响小节的标题（前面的 1.x 变 2.x）
  updateLessonNames()
  ElMessage.success('章节顺序已更新')
}

const onLessonDragEnd = () => {
  updateLessonNames()
  ElMessage.success('小节顺序已更新')
}

// 辅助函数：将数字转换为中文数字
const numberToChinese = (num) => {
  const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (num <= 10) return chineseNumbers[num]
  if (num < 20) return '十' + (num % 10 === 0 ? '' : chineseNumbers[num % 10])
  const ten = Math.floor(num / 10)
  const unit = num % 10
  return chineseNumbers[ten] + '十' + (unit === 0 ? '' : chineseNumbers[unit])
}

// 章节操作
const toggleChapterCollapse = (chapter) => {
  if (chapter.isEditing) return
  chapter.isCollapsed = !chapter.isCollapsed
}

const addChapter = () => {
  const nextSort = chapters.value.length + 1
  const newChapter = {
    id: `chap-${Date.now()}`,
    name: `第${numberToChinese(nextSort)}章：新章节`,
    sort: nextSort,
    lessons: [],
    isCollapsed: false,
    isEditing: false,
    editName: ''
  }
  chapters.value.push(newChapter)
  ElMessage.success('章节添加成功')
}

const chapterInputRef = ref(null)

const startRenameChapter = async (chapter) => {
  chapter.editName = chapter.name
  chapter.isEditing = true
  // 等待 DOM 更新后聚焦输入框
  await nextTick()
  if (chapterInputRef.value) {
    // 处理可能是一个数组（由于 v-for 渲染）或单个元素的情况
    const inputEl = Array.isArray(chapterInputRef.value) ? chapterInputRef.value[0] : chapterInputRef.value
    inputEl?.focus()
  }
}

const finishRenameChapter = (chapter) => {
  if (!chapter.isEditing) return
  
  const newName = chapter.editName.trim()
  if (newName && newName !== chapter.name) {
    chapter.name = newName
    ElMessage.success('重命名成功')
  }
  chapter.isEditing = false
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
  if (!chapter.lessons) chapter.lessons = []
  const chapterIndex = chapters.value.findIndex(c => c.id === chapter.id) + 1
  const nextSort = chapter.lessons.length + 1
  
  const newLesson = {
    id: `les-${Date.now()}`,
    name: `${chapterIndex}.${nextSort} 新小节`,
    sort: nextSort,
    resource: null,
    isFree: false,
    quizId: null
  }
  
  chapter.lessons.push(newLesson)
  ElMessage.success('课时添加成功')
  // 自动选中新添加的小节
  selectLesson(chapter, newLesson)
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

const handleResourceUploadSuccess = (res, file) => {
  if (currentLesson.value) {
    currentLesson.value.resource = {
      id: Date.now(),
      name: file.name,
      type: file.name.endsWith('.mp4') ? 'video' : file.name.endsWith('.pdf') ? 'document' : 'other',
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB'
    }
    ElMessage.success('上传成功')
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
.workspace-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  .workspace-header {
    height: 56px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    box-shadow: 0 1px 4px rgba(0,21,41,0.08);
    z-index: 10;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .back-btn {
        font-size: 18px;
        color: #606266;
      }

      .title-with-icon {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        background: #f0f5ff;
        border-radius: 4px;
        color: #1890ff;

        .edit-icon {
          font-size: 16px;
        }

        h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .preview-btn {
        border-color: #d9d9d9;
        color: #333;
      }

      .publish-btn {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .workspace-main {
    flex: 1;
    // padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 24px;

    .course-header-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);

      .course-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .course-icon-wrapper {
          width: 56px;
          height: 56px;
          background: #e6f7ff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          .course-icon {
            font-size: 28px;
            color: #1890ff;
          }
        }

        .course-details {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .course-title-row {
            display: flex;
            align-items: center;
            gap: 12px;

            .course-title {
              margin: 0;
              font-size: 18px;
              font-weight: 600;
              color: #1f2225;
            }

            .course-tag {
              background: #e6f7ff;
              border-color: #91d5ff;
              color: #1890ff;
            }
          }

          .course-meta {
            font-size: 13px;
            color: #8c939d;
            display: flex;
            align-items: center;
            gap: 8px;

            .divider {
              color: #dcdfe6;
            }
          }
        }
      }

      .course-actions {
        display: flex;
        align-items: center;
        gap: 24px;

        .save-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 12px;

          .status-label {
            color: #8c939d;
          }

          .status-time {
            color: #303133;
            font-weight: 500;
          }
        }

        .settings-btn {
          border-color: #dcdfe6;
          color: #606266;
        }
      }
    }

    .workspace-columns {
      display: flex;
      gap: 24px;
      flex: 1;
      min-height: 0;

      .col-card {
        background: #fff;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        
        &.col-chapters { flex: 1; max-width: 320px; }
        &.col-content { flex: 2; }
        &.col-settings { flex: 1; max-width: 320px; }

        .col-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f2f5;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .col-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 15px;
            color: #1f2225;

            .el-icon {
              color: #8c939d;
            }

            .highlight-title {
              color: #1890ff;
            }
          }

          .add-btn, .expand-btn, .settings-btn {
            color: #1890ff;
            font-size: 18px;
            padding: 4px;
          }
        }

        .col-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;

          &.chapter-tree-body {
            padding: 12px;
          }

          &.empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      /* Chapter Management Styles */
      .chapter-list {
        .chapter-item {
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;

          .chapter-title {
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
            cursor: pointer;

            .chapter-title-left {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;

                .drag-handle {
                  cursor: grab;
                  color: #dcdfe6;
                  font-size: 16px;
                  margin-right: -4px;
                  
                  &:hover {
                    color: #8c939d;
                  }
                  
                  &:active {
                    cursor: grabbing;
                  }
                }

                .collapse-icon {
                  color: #8c939d;
                  font-size: 14px;
                  transition: transform 0.3s;
                  flex-shrink: 0;
                  
                  &:hover {
                    color: #1890ff;
                  }
                }

                .chapter-name {
                  font-size: 14px;
                  color: #1f2225;
                  user-select: none;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .chapter-name-input {
                  flex: 1;
                  margin-right: 8px;
                }
              }

            .chapter-actions {
              display: flex;
              align-items: center;
              gap: 4px;

              .action-icon {
                font-size: 20px;
                color: #8c939d;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
                
                &:hover { 
                  background: #e9ecef;
                  color: #1890ff;
                }
              }
            }
          }

          .lesson-list {
            padding: 0 12px;

            .lesson-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px 12px;
              margin-bottom: 8px;
              background: #fff;
              border-radius: 6px;
              cursor: pointer;
              border: 1px solid transparent;
              transition: all 0.2s;

              .drag-handle {
                cursor: grab;
                color: #dcdfe6;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.2s;
                
                &:active {
                  cursor: grabbing;
                }
              }

              &:hover {
                border-color: #d9ecff;
                
                .drag-handle {
                  opacity: 1;
                }
              }

              &.is-active {
                background: #e6f7ff;
                border-color: #91d5ff;
                
                .lesson-name {
                  color: #1890ff;
                  font-weight: 500;
                }
              }

              .lesson-type-icon {
                font-size: 16px;
                color: #8c939d;
                
                // &.icon-video {
                //   color: #3498db;
                // }
                
                // &.icon-doc {
                //   color: #e74c3c;
                // }
              }

              .lesson-name {
                font-size: 13px;
                color: #303133;
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
      }

      /* Content Upload Styles */
      .form-group {
        margin-bottom: 24px;

        .form-label {
          display: block;
          font-size: 13px;
          color: #606266;
          margin-bottom: 8px;
        }

        .lesson-title-input {
          :deep(.el-input__wrapper) {
            background-color: #f8f9fa;
            box-shadow: none;
            border: 1px solid transparent;
            padding: 4px 12px;
            
            &.is-focus {
              background-color: #fff;
              border-color: #409eff;
              box-shadow: 0 0 0 1px #409eff inset;
            }

            .el-input__inner {
              font-size: 16px;
              font-weight: 500;
              color: #1f2225;
            }
          }
        }
      }

      .upload-area {
        margin-bottom: 24px;

        .content-uploader {
          :deep(.el-upload-dragger) {
            padding: 40px;
            background: #f8f9fa;
            border: 2px dashed #dcdfe6;
            border-radius: 12px;
            
            &:hover {
              border-color: #1890ff;
              background: #f0f5ff;
            }
          }
        }

        .upload-inner {
          display: flex;
          flex-direction: column;
          align-items: center;

          .upload-icon {
            font-size: 48px;
            color: #91d5ff;
            margin-bottom: 16px;
          }

          .upload-text {
            font-size: 16px;
            color: #303133;
            font-weight: 500;
            margin-bottom: 8px;
          }

          .upload-tip {
            font-size: 13px;
            color: #8c939d;
            margin-bottom: 20px;
          }

          .supported-icons {
            display: flex;
            gap: 16px;
            font-size: 24px;
          }
        }
      }

      .uploaded-file-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: #f8f9fa;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        margin-bottom: 24px;

        .file-icon-wrapper {
          width: 40px;
          height: 40px;
          background: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);

          .file-icon {
            font-size: 24px;
          }
        }

        .file-info {
          flex: 1;

          .file-name {
            font-size: 14px;
            font-weight: 500;
            color: #1f2225;
            margin-bottom: 4px;
          }

          .file-meta {
            font-size: 12px;
            color: #8c939d;
          }
        }

        .file-actions {
          display: flex;
          gap: 8px;
          
          .el-button {
            font-size: 18px;
          }
        }
      }

      .import-btn {
        width: 100%;
        height: 44px;
        border-radius: 8px;
        background: #f8f9fa;
        border-color: #dcdfe6;
        color: #606266;
        font-weight: 500;

        &:hover {
          color: #1890ff;
          border-color: #91d5ff;
          background: #e6f7ff;
        }
      }

      /* Learning Settings Styles */
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #f0f2f5;

        .setting-info {
          .setting-title {
            font-size: 14px;
            font-weight: 500;
            color: #1f2225;
            margin-bottom: 4px;
          }

          .setting-desc {
            font-size: 12px;
            color: #8c939d;
          }
        }
      }

      .min-view-time {
        margin-top: 24px;

        :deep(.el-input__wrapper) {
          box-shadow: none;
          border: 1px solid #dcdfe6;
          background: #fff;
          
          &:hover, &.is-focus {
            border-color: #409eff;
          }
        }
      }

      .info-alert {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: #f0f5ff;
        border-radius: 8px;
        margin-top: 24px;

        .info-icon {
          color: #1890ff;
          font-size: 18px;
          margin-top: 2px;
        }

        .alert-content {
          .alert-title {
            font-size: 14px;
            font-weight: 500;
            color: #1890ff;
            margin-bottom: 4px;
          }

          .alert-desc {
            font-size: 12px;
            color: #606266;
            line-height: 1.5;
          }
        }
      }
    }
  }
}
</style>
