# Vue3 组件拆分最佳实践

本文档提供 Vue3 组件拆分的最佳实践指导。

## 组件命名

### 命名规范
- 使用 **PascalCase**（大驼峰）
- 名称清晰表达职责
- 避免过度缩写

**示例**：
```
✅ UserSearch.vue
✅ OrderTable.vue
❌ user-search.vue（kebab-case）
❌ USearch.vue（过度缩写）
❌ Component1.vue（无意义）
```

---

## Props 设计

### 设计原则
- 使用对象接收多个相关属性
- 提供合理的默认值
- 使用 validator 验证

**示例**：
```vue
<script setup>
const props = defineProps({
  // ✅ 相关属性组织为对象
  pagination: {
    type: Object,
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0
    })
  },
  
  // ✅ 提供默认值
  loading: {
    type: Boolean,
    default: false
  },
  
  // ✅ 使用 validator
  status: {
    type: String,
    validator: (value) => ['pending', 'active', 'inactive'].includes(value)
  }
})
</script>
```

---

## 事件命名

### 命名规范
- 使用 **kebab-case**（短横线分隔）
- 使用过去分词表示已完成：`updated`、`deleted`、`submitted`
- 使用现在分词表示进行中：`loading`、`submitting`

**示例**：
```vue
<script setup>
const emit = defineEmits([
  // ✅ 已完成
  'user-updated',
  'item-deleted',
  'form-submitted',
  
  // ✅ 进行中
  'loading-change',
  'submitting-change',
  
  // ✅ 其他
  'search',
  'refresh',
  'cancel'
])
</script>
```

---

## 插槽使用

### 插槽类型
- **默认插槽**：主要内容
- **具名插槽**：多个插入点
- **作用域插槽**：子组件数据传递给父组件

**示例**：
```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <!-- 默认插槽 -->
    <slot></slot>
    
    <!-- 具名插槽 -->
    <slot name="header"></slot>
    <slot name="footer"></slot>
    
    <!-- 作用域插槽 -->
    <slot name="item" :item="item" :index="index"></slot>
  </div>
</template>

<!-- 使用 -->
<card>
  <template #header>
    <h3>卡片标题</h3>
  </template>
  
  <template #item="{ item }">
    <div>{{ item.name }}</div>
  </template>
</card>
```

---

## 样式隔离

### 隔离方式
- 使用 **scoped**
- 使用 **CSS Modules**
- 使用 **BEM 命名**

**示例 1：scoped**
```vue
<style scoped>
.user-card {
  padding: 20px;
}

.user-card__title {
  font-size: 18px;
}
</style>
```

**示例 2：CSS Modules**
```vue
<template>
  <div :class="$style.card">
    <h3 :class="$style.title">{{ title }}</h3>
  </div>
</template>

<script setup>
defineProps(['title'])
</script>

<style module>
.card {
  padding: 20px;
}

.title {
  font-size: 18px;
}
</style>
```

---

## 组件通信模式选择

### 父子组件
**首选方案**：props + emit

```vue
<!-- 父组件 -->
<user-table 
  :data="userList" 
  @user-deleted="handleDelete"
/>

<!-- 子组件 -->
<script setup>
const props = defineProps(['data'])
const emit = defineEmits(['user-deleted'])

const handleDelete = (id) => {
  emit('user-deleted', id)
}
</script>
```

### 跨级组件
**方案 1：provide/inject**（配置类、非响应式）

```vue
<!-- 祖先组件 -->
<script setup>
import { provide } from 'vue'
provide('theme', 'dark')
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'
const theme = inject('theme')
</script>
```

**方案 2：Pinia**（状态类、全局共享）

```js
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    permissions: []
  }),
  actions: {
    login(user) {
      this.currentUser = user
    }
  }
})
```

### 兄弟组件
**方案 1：共同父组件中转**

```vue
<!-- 父组件 -->
<template>
  <user-search @search="handleSearch" />
  <user-table :search-params="searchParams" />
</template>

<script setup>
const searchParams = ref({})
const handleSearch = (params) => {
  searchParams.value = params
}
</script>
```

**方案 2：Pinia store**

```vue
<!-- 组件 A -->
<script setup>
const userStore = useUserStore()
userStore.setSearchFilters(filters)
</script>

<!-- 组件 B -->
<script setup>
const userStore = useUserStore()
const filters = userStore.searchFilters
</script>
```

---

## 状态管理选择

### 何时使用什么

| 场景 | 推荐方案 | 说明 |
|------|---------|------|
| 父子组件通信 | props + emit | 最简单直接 |
| 跨级配置传递 | provide/inject | 主题、语言等配置 |
| 全局状态 | Pinia | 用户信息、权限等 |
| 表单状态 | composables | 表单逻辑封装 |
| 列表状态 | composables + Pinia | 分页、筛选、排序 |

### composables 组织

```js
// composables/useUserList.js
export function useUserList() {
  const userList = ref([])
  const loading = ref(false)
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
  })
  
  const fetchList = async (params) => {
    loading.value = true
    try {
      const res = await api.getUserList(params)
      userList.value = res.data
      pagination.total = res.total
    } finally {
      loading.value = false
    }
  }
  
  return {
    userList,
    loading,
    pagination,
    fetchList
  }
}
```

---

## 性能优化

### 异步组件

```js
// 路由配置
{
  path: '/users',
  component: () => import('@/views/UserManagement/index.vue')
}

// 组件内使用
const UserTable = defineAsyncComponent(
  () => import('./UserTable.vue')
)
```

### 按需加载

```vue
<template>
  <component :is="activeComponent" />
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const activeComponent = computed(() => {
  return defineAsyncComponent(() => import(`./${activeType}.vue`))
})
</script>
```

---

## 测试建议

### 单元测试

```js
import { mount } from '@vue/test-utils'
import UserTable from './UserTable.vue'

describe('UserTable', () => {
  test('renders data correctly', () => {
    const wrapper = mount(UserTable, {
      props: {
        data: [{ id: 1, name: 'John' }]
      }
    })
    
    expect(wrapper.text()).toContain('John')
  })
  
  test('emits delete event', async () => {
    const wrapper = mount(UserTable, {
      props: { data: [{ id: 1, name: 'John' }] }
    })
    
    await wrapper.find('[data-testid="delete-btn"]').trigger('click')
    expect(wrapper.emitted('user-deleted')).toBeTruthy()
  })
})
```
