export const mockMonitorData = [
  {
    id: 1,
    name: '2024春季新员工入职培训',
    total: 50,
    notified: 48,
    started: 42,
    completed: 32,
    neverStarted: 8,
    suspected: 2,
    daysLeft: 15
  },
  {
    id: 2,
    name: '销售部Q1能力提升计划',
    total: 30,
    notified: 30,
    started: 28,
    completed: 18,
    neverStarted: 2,
    suspected: 1,
    daysLeft: 45
  },
  {
    id: 3,
    name: '产品管理能力进阶',
    total: 15,
    notified: 15,
    started: 12,
    completed: 8,
    neverStarted: 3,
    suspected: 0,
    daysLeft: 28
  },
  {
    id: 4,
    name: '数据分析师培养计划',
    total: 12,
    notified: 12,
    started: 8,
    completed: 3,
    neverStarted: 4,
    suspected: 0,
    daysLeft: 60
  },
  {
    id: 5,
    name: '技术部晋升考核培训',
    total: 25,
    notified: 24,
    started: 20,
    completed: 5,
    neverStarted: 5,
    suspected: 2,
    daysLeft: 5
  }
]

export const mockPlanDetail = {
  id: 1,
  name: '2024春季新员工入职培训',
  stats: {
    total: 50,
    notified: 48,
    started: 42,
    completed: 32
  }
}

export const mockUserProgress = [
  {
    id: 1,
    name: '张三',
    dept: '技术部',
    employeeNo: 'EMP2024001',
    progress: 100,
    studyTime: '12小时35分钟',
    lastStudyTime: '2024-01-20 18:30',
    status: 'completed',
    warning: null
  },
  {
    id: 2,
    name: '李四',
    dept: '技术部',
    employeeNo: 'EMP2024002',
    progress: 75,
    studyTime: '8小时20分钟',
    lastStudyTime: '2024-01-20 16:45',
    status: 'learning',
    warning: null
  },
  {
    id: 3,
    name: '王五',
    dept: '销售部',
    employeeNo: 'EMP2024003',
    progress: 50,
    studyTime: '5小时30分钟',
    lastStudyTime: '2024-01-19 20:15',
    status: 'learning',
    warning: null
  },
  {
    id: 4,
    name: '赵六',
    dept: '产品部',
    employeeNo: 'EMP2024004',
    progress: 25,
    studyTime: '2小时45分钟',
    lastStudyTime: '2024-01-18 14:20',
    status: 'learning',
    warning: null
  },
  {
    id: 5,
    name: '孙七',
    dept: '技术部',
    employeeNo: 'EMP2024005',
    progress: 0,
    studyTime: '0分钟',
    lastStudyTime: '-',
    status: 'not_started',
    warning: 'never_started'
  },
  {
    id: 6,
    name: '周八',
    dept: '财务部',
    employeeNo: 'EMP2024006',
    progress: 30,
    studyTime: '1小时15分钟',
    lastStudyTime: '2024-01-20 09:00',
    status: 'learning',
    warning: 'suspected'
  },
  {
    id: 7,
    name: '吴九',
    dept: '人事部',
    employeeNo: 'EMP2024007',
    progress: 100,
    studyTime: '6小时45分钟',
    lastStudyTime: '2024-01-19 22:00',
    status: 'completed',
    warning: null
  },
  {
    id: 8,
    name: '郑十',
    dept: '技术部',
    employeeNo: 'EMP2024008',
    progress: 0,
    studyTime: '0分钟',
    lastStudyTime: '-',
    status: 'not_started',
    warning: 'never_started'
  }
]
