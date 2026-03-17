import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockCourses, mockChapters } from '../views/course/mock'

export function useCourseData(courseId) {
  const router = useRouter()
  const loading = ref(false)
  
  const isEdit = computed(() => !!courseId.value)

  // 课程表单
  const courseForm = ref({
    name: '',
    category: '',
    description: '',
    cover: '',
    status: 'draft'
  })

  // 学习设置
  const settings = ref({
    antiDrag: true,
    unlockNext: false,
    minViewTime: 10
  })

  // 加载课程数据
  const loadCourseData = async (callback) => {
    loading.value = true
    try {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 600))
      
      let chaptersData = []

      if (isEdit.value) {
        const course = mockCourses.find(c => c.id === Number(courseId.value))
        if (course) {
          courseForm.value = {
            name: course.name,
            category: course.category,
            description: course.description,
            cover: course.cover,
            status: course.status
          }
          
          if (course.settings) {
            settings.value = { ...settings.value, ...course.settings }
          }
        }
        chaptersData = JSON.parse(JSON.stringify(mockChapters))
      }
      
      // 执行回调，传递章节数据
      if (callback) callback(chaptersData)
    } finally {
      loading.value = false
    }
  }

  // 保存草稿
  const saveDraft = () => {
    if (!courseForm.value.name) {
      ElMessage.warning('请先完善课程名称')
      return false
    }
    ElMessage.success('草稿保存成功')
    return true
  }

  // 发布课程
  const publishCourse = async (chapters) => {
    // 校验基本信息
    if (!courseForm.value.name || !courseForm.value.category) {
      ElMessage.warning('发布前请完善课程基本信息(名称、分类必填)')
      return { success: false, reason: 'basic_info' }
    }
    
    // 校验章节和小节
    if (!chapters || chapters.length === 0) {
      ElMessage.warning('请至少添加一个章节')
      return { success: false, reason: 'empty_chapters' }
    }
    
    const hasEmptyLesson = chapters.some(chap => 
      !chap.lessons || chap.lessons.length === 0 || chap.lessons.some(lesson => !lesson.resource)
    )
    
    if (hasEmptyLesson) {
      ElMessage.warning('存在空章节或未上传资源的小节，无法发布')
      return { success: false, reason: 'empty_lessons' }
    }

    try {
      await ElMessageBox.confirm(
        '确认要发布该课程吗？发布后学员即可看到该课程。',
        '发布确认',
        {
          confirmButtonText: '确定发布',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      ElMessage.success('课程发布成功')
      router.push('/course')
      return { success: true }
    } catch (e) {
      return { success: false, reason: 'cancel' }
    }
  }

  return {
    loading,
    courseForm,
    settings,
    isEdit,
    loadCourseData,
    saveDraft,
    publishCourse
  }
}
