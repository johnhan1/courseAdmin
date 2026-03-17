<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="课程基本信息设置"
    size="400px"
    :destroy-on-close="true"
  >
    <el-form :model="form" label-position="top" class="course-settings-form">
      <el-form-item label="课程名称" required>
        <el-input v-model="form.name" placeholder="请输入课程名称" />
      </el-form-item>
      
      <el-form-item label="课程分类" required>
        <el-select v-model="form.category" placeholder="请选择课程分类" style="width: 100%">
          <el-option label="通用培训" value="general" />
          <el-option label="管理培训" value="management" />
          <el-option label="技术培训" value="tech" />
          <el-option label="产品培训" value="product" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="课程简介">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="4" 
          placeholder="请输入课程简介" 
        />
      </el-form-item>
      
      <el-form-item label="课程封面">
        <el-upload
          class="cover-uploader"
          action="/api/upload"
          :show-file-list="false"
          :on-success="onCoverSuccess"
        >
          <img v-if="form.cover" :src="form.cover" class="cover-image" />
          <div v-else class="cover-upload-placeholder">
            <el-icon class="cover-upload-icon"><Plus /></el-icon>
            <div class="cover-upload-text">点击上传封面</div>
          </div>
        </el-upload>
      </el-form-item>
      
      <div class="drawer-footer">
        <el-button @click="emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="save">保存设置</el-button>
      </div>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  courseForm: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'save', 'update:courseForm'])

// 使用计算属性来代理 props.courseForm，以便在 v-model 中使用
// 注意：这里我们直接修改了 props.courseForm 的属性，这在 Vue 中是可行的（因为是对象），
// 但为了严格的单向数据流，最好是 clone 一份数据，保存时再 emit 出去。
// 为了简化重构，这里暂时保持响应式引用。
const form = computed({
  get: () => props.courseForm,
  set: (val) => emit('update:courseForm', val)
})

const onCoverSuccess = (res) => {
  form.value.cover = res.url
}

const save = () => {
  if (!form.value.name) {
    ElMessage.warning('请输入课程名称')
    return
  }
  emit('save')
}
</script>

<style scoped lang="scss">
.course-settings-form {
  padding: 0 4px;

  .cover-uploader {
    width: 100%;
    
    :deep(.el-upload) {
      width: 100%;
      border: 1px dashed #dcdfe6;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .cover-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
    }

    .cover-upload-placeholder {
      width: 100%;
      height: 180px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #fafafa;

      .cover-upload-icon {
        font-size: 28px;
        color: #8c939d;
        margin-bottom: 8px;
      }

      .cover-upload-text {
        font-size: 14px;
        color: #8c939d;
      }
    }
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #f0f2f5;
  }
}
</style>