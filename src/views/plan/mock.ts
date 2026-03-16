export const mockPlans = [
  {
    id: 1,
    name: '2024春季新员工入职培训',
    code: 'PLAN-2024-001',
    type: 'required',
    status: 'ongoing',
    courseCount: 5,
    userCount: 50,
    completedCount: 32,
    progress: 64,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    createTime: '2024-01-10 09:30:00',
    courses: [
      { id: 1, name: '新员工入职培训系列课程', weight: 2 },
      { id: 2, name: '企业文化与价值观', weight: 1 },
      { id: 3, name: '公司制度与流程', weight: 1 },
      { id: 4, name: '岗位技能培训', weight: 3 },
      { id: 5, name: '团队协作与沟通', weight: 2 }
    ]
  },
  {
    id: 2,
    name: '销售部Q1能力提升计划',
    code: 'PLAN-2024-002',
    type: 'required',
    status: 'ongoing',
    courseCount: 3,
    userCount: 30,
    completedCount: 18,
    progress: 60,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createTime: '2023-12-28 14:20:00',
    courses: [
      { id: 2, name: '销售精英技能提升训练营', weight: 5 },
      { id: 6, name: '客户关系管理', weight: 3 },
      { id: 7, name: '谈判技巧实战', weight: 2 }
    ]
  },
  {
    id: 3,
    name: '技术部晋升考核培训',
    code: 'PLAN-2024-003',
    type: 'required',
    status: 'draft',
    courseCount: 4,
    userCount: 25,
    completedCount: 0,
    progress: 0,
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    createTime: '2024-01-12 11:00:00',
    courses: [
      { id: 3, name: 'Java高级工程师进阶之路', weight: 5 },
      { id: 8, name: '企业级架构设计模式', weight: 5 },
      { id: 9, name: '数据结构与算法', weight: 3 },
      { id: 10, name: '系统设计实践', weight: 4 }
    ]
  },
  {
    id: 4,
    name: '产品管理能力进阶',
    code: 'PLAN-2024-004',
    type: 'optional',
    status: 'ongoing',
    courseCount: 3,
    userCount: 15,
    completedCount: 8,
    progress: 53,
    startDate: '2024-01-08',
    endDate: '2024-03-08',
    createTime: '2024-01-05 16:45:00',
    courses: [
      { id: 4, name: '产品经理能力体系建设', weight: 4 },
      { id: 11, name: '用户研究与需求分析', weight: 3 },
      { id: 12, name: '产品数据分析师', weight: 3 }
    ]
  },
  {
    id: 5,
    name: '管理能力提升计划-2023',
    code: 'PLAN-2023-001',
    type: 'required',
    status: 'archived',
    courseCount: 4,
    userCount: 20,
    completedCount: 20,
    progress: 100,
    startDate: '2023-10-01',
    endDate: '2023-12-31',
    createTime: '2023-09-25 10:00:00',
    courses: [
      { id: 13, name: '领导力与团队管理', weight: 4 },
      { id: 14, name: '绩效管理与面谈技巧', weight: 3 },
      { id: 15, name: '目标管理与执行力', weight: 3 },
      { id: 16, name: '跨部门协作与沟通', weight: 2 }
    ]
  },
  {
    id: 6,
    name: '数据分析师培养计划',
    code: 'PLAN-2024-005',
    type: 'optional',
    status: 'ongoing',
    courseCount: 3,
    userCount: 12,
    completedCount: 3,
    progress: 25,
    startDate: '2024-01-20',
    endDate: '2024-04-20',
    createTime: '2024-01-15 09:00:00',
    courses: [
      { id: 17, name: '数据分析与可视化实战', weight: 5 },
      { id: 18, name: 'SQL数据分析基础', weight: 3 },
      { id: 19, name: '商业数据分析案例', weight: 3 }
    ]
  },
  {
    id: 7,
    name: '通用技能培训-选修池',
    code: 'PLAN-2024-006',
    type: 'optional',
    status: 'draft',
    courseCount: 6,
    userCount: 0,
    completedCount: 0,
    progress: 0,
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    createTime: '2024-01-18 14:30:00',
    courses: [
      { id: 20, name: '高效时间管理', weight: 1 },
      { id: 21, name: '职场沟通技巧', weight: 1 },
      { id: 22, name: 'PPT制作与演讲', weight: 1 },
      { id: 23, name: 'Excel数据处理', weight: 1 },
      { id: 24, name: '商务邮件写作', weight: 1 },
      { id: 25, name: '职场压力管理', weight: 1 }
    ]
  },
  {
    id: 8,
    name: '架构师培养计划-2023',
    code: 'PLAN-2023-002',
    type: 'required',
    status: 'archived',
    courseCount: 5,
    userCount: 8,
    completedCount: 8,
    progress: 100,
    startDate: '2023-07-01',
    endDate: '2023-12-31',
    createTime: '2023-06-20 11:30:00',
    courses: [
      { id: 26, name: '企业级架构设计模式', weight: 5 },
      { id: 27, name: '微服务架构实战', weight: 5 },
      { id: 28, name: '分布式系统设计', weight: 4 },
      { id: 29, name: '云原生技术栈', weight: 3 },
      { id: 30, name: '性能优化与调优', weight: 3 }
    ]
  }
]

export const mockCertificates = [
  { id: 'cert-001', name: '新员工入职培训结业证书', template: 'template-001' },
  { id: 'cert-002', name: '销售精英认证证书', template: 'template-002' },
  { id: 'cert-003', name: '技术能力认证证书', template: 'template-003' },
  { id: 'cert-004', name: '产品经理专业证书', template: 'template-004' },
  { id: 'cert-005', name: '管理能力提升证书', template: 'template-005' }
]

export const mockUsers = [
  { id: 1, name: '张三', dept: '技术部', employeeNo: 'EMP001', joinDate: '2023-06-01' },
  { id: 2, name: '李四', dept: '技术部', employeeNo: 'EMP002', joinDate: '2022-03-15' },
  { id: 3, name: '王五', dept: '销售部', employeeNo: 'EMP003', joinDate: '2023-01-10' },
  { id: 4, name: '赵六', dept: '产品部', employeeNo: 'EMP004', joinDate: '2021-08-20' },
  { id: 5, name: '孙七', dept: '技术部', employeeNo: 'EMP005', joinDate: '2023-11-01' },
  { id: 6, name: '周八', dept: '销售部', employeeNo: 'EMP006', joinDate: '2022-06-01' },
  { id: 7, name: '吴九', dept: '财务部', employeeNo: 'EMP007', joinDate: '2020-05-15' },
  { id: 8, name: '郑十', dept: '人事部', employeeNo: 'EMP008', joinDate: '2021-12-01' }
]

export const mockDepartments = [
  {
    id: 1,
    name: '研发中心',
    children: [
      { id: 11, name: '技术部' },
      { id: 12, name: '产品部' },
      { id: 13, name: '测试部' }
    ]
  },
  {
    id: 2,
    name: '销售中心',
    children: [
      { id: 21, name: '销售一部' },
      { id: 22, name: '销售二部' },
      { id: 23, name: '客户服务部' }
    ]
  },
  {
    id: 3,
    name: '职能中心',
    children: [
      { id: 31, name: '财务部' },
      { id: 32, name: '人事部' },
      { id: 33, name: '行政部' }
    ]
  }
]

export const mockAvailableCourses = [
  { id: 1, name: '新员工入职培训系列课程', category: '通用技能', cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
  { id: 2, name: '销售精英技能提升训练营', category: '管理培训', cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
  { id: 3, name: 'Java高级工程师进阶之路', category: '技术培训', cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
  { id: 4, name: '产品经理能力体系建设', category: '产品培训', cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
  { id: 5, name: '团队协作与沟通技巧', category: '通用技能', cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
  { id: 6, name: '数据分析与可视化实战', category: '技术培训', cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
  { id: 7, name: '领导力与团队管理', category: '管理培训', cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
  { id: 8, name: '企业级架构设计模式', category: '技术培训', cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' }
]
