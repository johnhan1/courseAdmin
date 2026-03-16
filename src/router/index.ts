import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { public: true }
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '数据报表', icon: 'DataLine' }
        },
        {
          path: 'resource',
          name: 'Resource',
          component: () => import('@/views/resource/index.vue'),
          meta: { title: '资源中心', icon: 'Folder' }
        },
        {
          path: 'course',
          name: 'Course',
          component: () => import('@/views/course/index.vue'),
          meta: { title: '课程管理', icon: 'Reading' }
        },
        {
          path: 'course/edit/:id?',
          name: 'CourseEdit',
          component: () => import('@/views/course/edit.vue'),
          meta: { title: '课程编辑', hidden: true }
        },
        {
          path: 'plan',
          name: 'Plan',
          component: () => import('@/views/plan/index.vue'),
          meta: { title: '培训计划', icon: 'Calendar' }
        },
        {
          path: 'plan/create',
          name: 'PlanCreate',
          component: () => import('@/views/plan/create.vue'),
          meta: { title: '创建计划', hidden: true }
        },
        {
          path: 'plan/edit/:id',
          name: 'PlanEdit',
          component: () => import('@/views/plan/create.vue'),
          meta: { title: '编辑计划', hidden: true }
        },
        {
          path: 'monitor',
          name: 'Monitor',
          component: () => import('@/views/monitor/index.vue'),
          meta: { title: '进度监控', icon: 'TrendCharts' }
        },
        {
          path: 'monitor/plan/:id',
          name: 'PlanMonitor',
          component: () => import('@/views/monitor/detail.vue'),
          meta: { title: '计划监控详情', hidden: true }
        }
      ]
    }
  ]
})

export default router
