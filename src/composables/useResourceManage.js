import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useResourceManage(activeItem) {
  const resourceModalVisible = ref(false)

  const openResourceModal = () => {
    resourceModalVisible.value = true
  }

  const handleResourceSelect = (resource) => {
    if (activeItem.value) {
      activeItem.value.resource = resource
      ElMessage.success('资源挂载成功')
    }
  }

  const handleResourceUploadSuccess = ({ res, file }) => {
    if (activeItem.value) {
      activeItem.value.resource = {
        id: Date.now(),
        name: file.name,
        type: file.name.endsWith('.mp4') ? 'video' : file.name.endsWith('.pdf') ? 'document' : 'other',
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB'
      }
      ElMessage.success('上传成功')
    }
  }

  const removeResource = () => {
    if (activeItem.value) {
      activeItem.value.resource = null
      ElMessage.success('资源已移除')
    }
  }

  return {
    resourceModalVisible,
    openResourceModal,
    handleResourceSelect,
    handleResourceUploadSuccess,
    removeResource
  }
}
