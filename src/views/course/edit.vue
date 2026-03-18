<template>
  <div class="workspace-page" v-loading="loading" element-loading-text="正在加载课程数据...">
    <main class="workspace-main">
      <!-- Course Info Card -->
      <course-header
        :course-form="courseForm"
        :chapters-length="chapters.length"
        :total-lessons="totalLessons"
        @back="handleBack"
        @save="handleSaveDraft"
        @publish="handlePublish"
        @open-settings="openCourseSettings"
      />

      <!-- 3 Columns Workspace -->
      <div class="workspace-columns">
        
        <!-- Column 1: Chapter Management -->
        <chapter-list
          v-model:chapters="chapters"
          :current-chapter="currentChapter"
          :current-lesson="currentLesson"
          @add-chapter="addChapter"
          @delete-chapter="deleteChapter"
          @select-chapter="selectChapter"
          @chapter-drag-end="onChapterDragEnd"
          @add-lesson="addLesson"
          @delete-lesson="deleteLesson"
          @select-lesson="selectLesson"
          @lesson-drag-end="onLessonDragEnd"
        />

        <!-- Column 2: Content Upload -->
        <resource-editor
          v-model:active-item="activeItem"
          @remove-resource="removeResource"
          @open-resource-modal="openResourceModal"
          @upload-success="handleResourceUploadSuccess"
          @update-name="handleUpdateName"
        />

        <!-- Column 3: Learning Settings -->
        <div class="col-card col-settings">
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
        </div>
      </div>
    </main>

    <!-- 资源选择模态框 -->
    <resource-selector v-model:visible="resourceModalVisible" @select="handleResourceSelect" />

    <!-- 课程基本信息设置抽屉 -->
    <course-settings-drawer
      v-model:visible="courseSettingsVisible"
      :course-form="courseForm"
      @save="saveCourseSettings"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Menu, InfoFilled } from '@element-plus/icons-vue'
import ResourceSelector from './components/ResourceSelector.vue'
import CourseHeader from './components/CourseHeader.vue'
import ChapterList from './components/ChapterList.vue'
import ResourceEditor from './components/ResourceEditor.vue'
import CourseSettingsDrawer from './components/CourseSettingsDrawer.vue'
import { useCourseData } from '../../composables/useCourseData'
import { useChapterManage } from '../../composables/useChapterManage'
import { useResourceManage } from '../../composables/useResourceManage'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.id)
const courseSettingsVisible = ref(false)

// 引入 Composables
const { 
  loading, 
  courseForm, 
  settings, 
  loadCourseData, 
  saveDraft, 
  publishCourse 
} = useCourseData(courseId)

const {
  chapters,
  currentChapter,
  currentLesson,
  activeItem,
  totalLessons,
  onChapterDragEnd,
  onLessonDragEnd,
  addChapter,
  deleteChapter,
  selectChapter,
  addLesson,
  deleteLesson,
  selectLesson,
  handleUpdateName
} = useChapterManage()

const {
  resourceModalVisible,
  openResourceModal,
  handleResourceSelect,
  handleResourceUploadSuccess,
  removeResource
} = useResourceManage(activeItem)

// 页面级操作
const handleBack = () => {
  router.push('/course')
}

const handleSaveDraft = async () => {
  const success = await saveDraft(chapters.value)
  if (!success && !courseForm.value.name) {
    courseSettingsVisible.value = true
  }
}

const handlePublish = async () => {
  const result = await publishCourse(chapters.value)
  if (!result.success && result.reason === 'basic_info') {
    courseSettingsVisible.value = true
  }
}

const openCourseSettings = () => {
  courseSettingsVisible.value = true
}

const saveCourseSettings = () => {
  courseSettingsVisible.value = false
  ElMessage.success('课程基本信息已保存')
}

onMounted(() => {
  // 加载数据，并将返回的章节数据赋值给 chapters
  loadCourseData((loadedChapters) => {
    chapters.value = loadedChapters
  })
})
</script>

<style scoped lang="scss">
.workspace-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;

  .workspace-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 0; // 关键：允许 flex 子项收缩

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
        box-shadow: 0 4px 12px 0 rgba(0,0,0,0.05);
        border: 1px solid #ebeef5;
        
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
          }
        }

        .col-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;

          &.empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
          }
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