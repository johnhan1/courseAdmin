export const mockCourses = [
  {
    id: 1,
    name: '新员工入职培训系列课程',
    code: 'COURSE-2024-001',
    category: 'general',
    status: 'published',
    cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    description: '帮助新员工快速融入公司文化，了解公司制度和业务流程',
    chapterCount: 4,
    lessonCount: 12,
    totalDuration: '2小时35分钟',
    createTime: '2024-01-10 09:30:00',
    refPlans: ['2024春季新员工培训', '技术部入职培训']
  },
  {
    id: 2,
    name: '销售精英技能提升训练营',
    code: 'COURSE-2024-002',
    category: 'management',
    status: 'published',
    cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    description: '系统提升销售人员的客户开发、谈判技巧和成交能力',
    chapterCount: 6,
    lessonCount: 24,
    totalDuration: '8小时20分钟',
    createTime: '2024-01-08 14:20:00',
    refPlans: ['销售部Q1培训计划']
  },
  {
    id: 3,
    name: 'Java高级工程师进阶之路',
    code: 'COURSE-2024-003',
    category: 'tech',
    status: 'draft',
    cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    description: '深入讲解Java并发编程、JVM调优、分布式系统等高级主题',
    chapterCount: 8,
    lessonCount: 32,
    totalDuration: '16小时45分钟',
    createTime: '2024-01-05 11:15:00',
    refPlans: []
  },
  {
    id: 4,
    name: '产品经理能力体系建设',
    code: 'COURSE-2024-004',
    category: 'product',
    status: 'published',
    cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    description: '从需求分析到产品上线，全流程产品管理能力提升',
    chapterCount: 5,
    lessonCount: 20,
    totalDuration: '10小时30分钟',
    createTime: '2024-01-03 16:45:00',
    refPlans: ['产品部年度培训计划', '管理能力提升计划']
  },
  {
    id: 5,
    name: '团队协作与沟通技巧',
    code: 'COURSE-2024-005',
    category: 'general',
    status: 'offline',
    cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    description: '提升跨部门协作效率，掌握高效沟通方法',
    chapterCount: 3,
    lessonCount: 9,
    totalDuration: '3小时15分钟',
    createTime: '2024-01-02 10:00:00',
    refPlans: []
  },
  {
    id: 6,
    name: '数据分析与可视化实战',
    code: 'COURSE-2024-006',
    category: 'tech',
    status: 'published',
    cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    description: '掌握Python数据分析，学习数据可视化和报表制作',
    chapterCount: 7,
    lessonCount: 28,
    totalDuration: '14小时20分钟',
    createTime: '2023-12-28 09:00:00',
    refPlans: ['数据分析师培训计划']
  },
  {
    id: 7,
    name: '领导力与团队管理',
    code: 'COURSE-2024-007',
    category: 'management',
    status: 'draft',
    cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    description: '培养管理者的领导力和团队建设能力',
    chapterCount: 4,
    lessonCount: 16,
    totalDuration: '6小时40分钟',
    createTime: '2023-12-25 15:30:00',
    refPlans: []
  },
  {
    id: 8,
    name: '企业级架构设计模式',
    code: 'COURSE-2024-008',
    category: 'tech',
    status: 'published',
    cover: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    description: '学习微服务架构、分布式系统设计等企业级技术方案',
    chapterCount: 10,
    lessonCount: 40,
    totalDuration: '20小时00分钟',
    createTime: '2023-12-20 11:20:00',
    refPlans: ['架构师培养计划', '技术委员会培训']
  }
]

export const mockChapters = [
  {
    id: 'chap-1',
    name: '第一章：公司文化与价值观',
    sort: 1,
    lessons: [
      {
        id: 'les-1-1',
        name: '第1节：企业发展历程',
        sort: 1,
        resource: {
          id: 1,
          name: '企业发展历程介绍.mp4',
          type: 'video',
          duration: '15:30',
          thumbnail: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
        },
        isFree: true,
        quizId: null
      },
      {
        id: 'les-1-2',
        name: '第2节：企业核心价值观',
        sort: 2,
        resource: {
          id: 2,
          name: '企业核心价值观解读.mp4',
          type: 'video',
          duration: '20:15',
          thumbnail: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
        },
        isFree: false,
        quizId: 'quiz-001'
      },
      {
        id: 'les-1-3',
        name: '第3节：企业文化实践',
        sort: 3,
        resource: null,
        isFree: false,
        quizId: null
      }
    ]
  },
  {
    id: 'chap-2',
    name: '第二章：公司制度与流程',
    sort: 2,
    lessons: [
      {
        id: 'les-2-1',
        name: '第1节：人事管理制度',
        sort: 1,
        resource: {
          id: 5,
          name: '人事管理制度.pdf',
          type: 'document',
          duration: null,
          thumbnail: null
        },
        isFree: false,
        quizId: null
      },
      {
        id: 'les-2-2',
        name: '第2节：财务报销流程',
        sort: 2,
        resource: null,
        isFree: false,
        quizId: null
      }
    ]
  },
  {
    id: 'chap-3',
    name: '第三章：业务体系介绍',
    sort: 3,
    lessons: [
      {
        id: 'les-3-1',
        name: '第1节：核心业务板块',
        sort: 1,
        resource: null,
        isFree: false,
        quizId: null
      },
      {
        id: 'les-3-2',
        name: '第2节：产品服务体系',
        sort: 2,
        resource: null,
        isFree: false,
        quizId: null
      }
    ]
  }
]

export const mockQuizzes = [
  { id: 'quiz-001', name: '企业文化知识测验' },
  { id: 'quiz-002', name: '入职培训综合测试' },
  { id: 'quiz-003', name: '产品知识测验' },
  { id: 'quiz-004', name: '技术能力评估' },
  { id: 'quiz-005', name: '管理能力测评' }
]
