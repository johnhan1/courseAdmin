<template>
  <div class="col-card col-chapters">
    <div class="col-header">
      <div class="col-title">
        <el-icon><Menu /></el-icon>
        <span>章节管理</span>
      </div>
      <el-button link class="add-btn" @click="emit('add-chapter')">
        <el-icon><CirclePlus /></el-icon>
      </el-button>
    </div>
    
    <div class="col-body chapter-tree-body">
      <draggable 
        :model-value="chapters" 
        @update:model-value="emit('update:chapters', $event)"
        item-key="id" 
        handle=".drag-handle" 
        class="chapter-list"
        @end="emit('chapter-drag-end')"
      >
        <template #item="{ element: chapter, index: chapIndex }">
          <div class="chapter-item" :class="{ 'is-active': currentChapter?.id === chapter.id }">
            <div class="chapter-title" @click="emit('select-chapter', chapter)">
              <div class="chapter-title-left">
                <el-icon class="drag-handle"><GripVertical /></el-icon>
                <el-icon class="collapse-icon" @click.stop="toggleChapterCollapse(chapter)">
                  <ArrowDown v-if="!chapter.isCollapsed" />
                  <ArrowRight v-else />
                </el-icon>
                <span class="chapter-name">{{ chapter.name }}</span>
              </div>
              <div class="chapter-actions">
                <el-icon class="action-icon" @click.stop="emit('add-lesson', chapter)"><Plus /></el-icon>
                <el-icon class="action-icon danger-icon" @click.stop="emit('delete-chapter', { chapter, index: chapIndex })"><Delete /></el-icon>
              </div>
            </div>
            
            <div class="chapter-content" v-show="!chapter.isCollapsed">
                <draggable 
                  :model-value="chapter.lessons" 
                  @update:model-value="(newLessons) => updateLessons(chapter, newLessons)"
                  item-key="id" 
                  handle=".drag-handle" 
                  group="lessons" 
                  class="lesson-list"
                  @end="emit('lesson-drag-end')"
                >
                  <template #item="{ element: lesson, index: lesIndex }">
                    <div class="lesson-item" :class="{ 'is-active': currentLesson?.id === lesson.id }" @click="emit('select-lesson', { chapter, lesson })">
                      <el-icon class="drag-handle"><GripVertical /></el-icon>
                      <el-icon v-if="lesson.resource?.type === 'video'" class="lesson-type-icon icon-video"><Video /></el-icon>
                      <el-icon v-else class="lesson-type-icon icon-doc"><File /></el-icon>
                      <span class="lesson-name">{{ lesson.name }}</span>
                      <div class="lesson-status-icons">
                        <el-tooltip v-if="!lesson.resource" content="未上传内容" placement="top">
                          <el-icon class="warning-icon"><Warning /></el-icon>
                        </el-tooltip>
                        <el-icon class="delete-icon" @click.stop="emit('delete-lesson', { chapter, index: lesIndex })"><Delete /></el-icon>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { Menu, CirclePlus, ArrowDown, ArrowRight, Plus, Delete, Warning } from '@element-plus/icons-vue'
import { Video, File, GripVertical } from 'lucide-vue-next'
import draggable from 'vuedraggable'

const props = defineProps({
  chapters: {
    type: Array,
    required: true
  },
  currentChapter: {
    type: Object,
    default: null
  },
  currentLesson: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'update:chapters', 
  'add-chapter', 
  'delete-chapter', 
  'select-chapter', 
  'chapter-drag-end',
  'add-lesson',
  'delete-lesson',
  'select-lesson',
  'lesson-drag-end',
  'update-lessons' // 新增，用于更新特定章节的 lessons
])

const toggleChapterCollapse = (chapter) => {
  chapter.isCollapsed = !chapter.isCollapsed
}

// 辅助函数：更新特定章节的 lessons
const updateLessons = (chapter, newLessons) => {
  // 这种直接修改 prop 对象属性的方式在 Vue3 中是响应式的，但为了规范，最好 emit 出去
  // 这里由于 draggable 的复杂性，我们采用直接修改的方式，或者 emit 一个深层更新事件
  chapter.lessons = newLessons
  // 如果需要严格单向数据流，可以 emit 一个事件让父组件去处理整个 chapters 的更新
  // emit('update-lesson-list', { chapterId: chapter.id, lessons: newLessons })
}
</script>

<style scoped lang="scss">
.col-card {
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  
  &.col-chapters { flex: 1; max-width: 320px; }

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

    .add-btn {
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
  }
}

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
            color: #8c939d;
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

          &.danger-icon:hover {
            color: #f56c6c;
            background: #fef0f0;
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
          color: #8c939d;
          font-size: 14px;
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
        }

        .lesson-name {
          font-size: 13px;
          color: #303133;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lesson-status-icons {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .warning-icon {
            color: #F56C6C;
            font-size: 16px;
          }

          .delete-icon {
            color: #8c939d;
            font-size: 16px;
            transition: all 0.2s;
            padding: 4px;
            border-radius: 4px;

            &:hover {
              color: #f56c6c;
              background: #fef0f0;
            }
          }
        }
      }
    }
  }
}
</style>