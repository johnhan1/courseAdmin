<template>
  <div class="course-header-card">
    <div class="course-info">
      <el-button link class="back-btn" @click="emit('back')" style="margin-right: 8px;">
        <el-icon size="20"><ArrowLeft /></el-icon>
      </el-button>
      <div class="course-icon-wrapper">
        <el-icon class="course-icon"><Reading /></el-icon>
      </div>
      <div class="course-details">
        <div class="course-title-row">
          <h1 class="course-title" :class="{'is-empty': !courseForm.name}">{{ courseForm.name || '未命名课程（请点击右侧设置填写基本信息）' }}</h1>
          <el-tag v-if="courseForm.category" size="small" class="course-tag">
            {{ getCategoryLabel(courseForm.category) }}
          </el-tag>
        </div>
        <div class="course-meta" v-if="courseForm.name">
          <el-tag :type="getStatusType(courseForm.status)" effect="plain" size="small" class="status-tag">
            {{ getStatusLabel(courseForm.status) }}
          </el-tag>
          <span class="divider" v-if="chaptersLength > 0">|</span>
          <span v-if="chaptersLength > 0">共 {{ chaptersLength }} 章 {{ totalLessons }} 节</span>
        </div>
      </div>
    </div>
    <div class="course-actions">
      <div class="save-status">
        <span class="status-label">最后保存</span>
        <span class="status-time">今天 14:20</span>
      </div>
      <el-button @click="emit('save')">保存草稿</el-button>
      <el-button type="primary" @click="emit('publish')">发布课程</el-button>
      <el-button class="settings-btn" :icon="Setting" @click="emit('openSettings')"></el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft, Reading, Setting } from '@element-plus/icons-vue'

const props = defineProps({
  courseForm: {
    type: Object,
    required: true
  },
  chaptersLength: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['back', 'save', 'publish', 'openSettings'])

const getCategoryLabel = (val) => {
  const map = {
    general: '通用培训',
    management: '管理培训',
    tech: '技术培训',
    product: '产品培训'
  }
  return map[val] || val
}

const getStatusLabel = (status) => {
  const statusMap = {
    published: '已发布',
    draft: '草稿',
    offline: '已下架'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status) => {
  const typeMap = {
    published: 'success',
    draft: 'info',
    offline: 'danger'
  }
  return typeMap[status] || 'info'
}
</script>

<style scoped lang="scss">
.course-header-card {
  flex-shrink: 0;
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

    .back-btn {
      color: #606266;
      padding: 4px;
      height: auto;
      
      &:hover {
        color: #1890ff;
        background-color: #f0f5ff;
      }
    }

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

          &.is-empty {
            color: #8c939d;
            font-weight: 400;
            font-style: italic;
          }
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
</style>