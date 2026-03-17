import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export function useChapterManage() {
  const chapters = ref([])
  const currentChapter = ref(null)
  const currentLesson = ref(null)

  const activeItem = computed({
    get: () => currentLesson.value || currentChapter.value,
    set: (val) => {
      if (currentLesson.value) currentLesson.value = val
      else if (currentChapter.value) currentChapter.value = val
    }
  })

  const totalLessons = computed(() => {
    return chapters.value.reduce((sum, chap) => sum + (chap.lessons?.length || 0), 0)
  })

  // 辅助函数：将数字转换为中文数字
  const numberToChinese = (num) => {
    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    if (num <= 10) return chineseNumbers[num]
    if (num < 20) return '十' + (num % 10 === 0 ? '' : chineseNumbers[num % 10])
    const ten = Math.floor(num / 10)
    const unit = num % 10
    return chineseNumbers[ten] + '十' + (unit === 0 ? '' : chineseNumbers[unit])
  }

  // 更新章节名称
  const updateChapterNames = () => {
    chapters.value.forEach((chapter, index) => {
      const sort = index + 1
      chapter.sort = sort
      const nameParts = chapter.name.split('：')
      if (nameParts.length > 1) {
        chapter.name = `第${numberToChinese(sort)}章：${nameParts.slice(1).join('：')}`
      } else {
        chapter.name = `第${numberToChinese(sort)}章`
      }
    })
  }

  // 更新小节名称
  const updateLessonNames = () => {
    chapters.value.forEach((chapter, cIndex) => {
      const chapterSort = cIndex + 1
      if (chapter.lessons && chapter.lessons.length > 0) {
        chapter.lessons.forEach((lesson, lIndex) => {
          const lessonSort = lIndex + 1
          lesson.sort = lessonSort
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
    updateLessonNames()
    ElMessage.success('章节顺序已更新')
  }

  const onLessonDragEnd = () => {
    updateLessonNames()
    ElMessage.success('小节顺序已更新')
  }

  const addChapter = () => {
    const nextSort = chapters.value.length + 1
    const newChapter = {
      id: `chap-${Date.now()}`,
      name: `第${numberToChinese(nextSort)}章：新章节`,
      sort: nextSort,
      lessons: [],
      isCollapsed: false,
      resource: null
    }
    chapters.value.push(newChapter)
    ElMessage.success('章节添加成功')
  }

  const deleteChapter = ({ chapter, index }) => {
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
    currentLesson.value = null
  }

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
    selectLesson({ chapter, lesson: newLesson })
  }

  const deleteLesson = ({ chapter, index }) => {
    chapter.lessons.splice(index, 1)
    if (currentLesson.value?.id === chapter.lessons[index]?.id) {
      currentLesson.value = null
    }
    ElMessage.success('课时删除成功')
  }

  const selectLesson = ({ chapter, lesson }) => {
    currentChapter.value = chapter
    currentLesson.value = lesson
  }

  const handleUpdateName = (val) => {
    if (activeItem.value) {
      activeItem.value.name = val
    }
  }

  return {
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
  }
}
