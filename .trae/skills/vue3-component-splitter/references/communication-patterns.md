# 组件通信模式

本文档详细说明 Vue3 组件间通信的各种模式及其适用场景。

## 通信模式选择指南

```
                    ┌─────────────────┐
                    │  组件通信需求   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
       父子组件？                     跨级/兄弟组件？
              │                             │
         Yes  │                             │  Yes
              ▼                             ▼
     ┌────────────────┐           ┌──────────────────┐
     │ props + emit   │           │  配置类？状态类？ │
     │ (首选方案)     │           └────────┬─────────┘
     └────────────────┘                    │
                                   ┌───────┴───────┐
                                   │               │
                              配置类 (主题)    状态类 (用户信息)
                                   │               │
                                   ▼               ▼
                            provide/inject      Pinia store
```

---

## 1. 父子组件通信

### props + emit（首选）

**适用场景**：
- 父组件 → 子组件：传递数据
- 子组件 → 父组件：触发事件

**示例**：

```vue
<!-- 父组件：UserManagement.vue -->
<template>
  <user-table 
    :data="userList"
    :loading="loading"
    @user-deleted="handleDelete"
    @user-edit="handleEdit"
  />
</template>

<script setup>
import { ref } from 'vue'
import UserTable from './UserTable.vue'

const userList = ref([])
const loading = ref(false)

const handleDelete = (id) => {
  console.log('删除用户:', id)
}

const handleEdit = (user) => {
  console.log('编辑用户:', user)
}
</script>
```

```vue
<!-- 子组件：UserTable.vue -->
<template>
  <el-table :data="data" v-loading="loading">
    <el-table-column prop="name" label="姓名" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button @click="handleEdit(row)">编辑</el-button>
        <el-button @click="handleDelete(row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['user-deleted', 'user-edit'])

const handleDelete = (id) => {
  emit('user-deleted', id)
}

const handleEdit = (user) => {
  emit('user-edit', user)
}
</script>
```

**优点**：
- 数据流向清晰（单向数据流）
- 易于理解和维护
- TypeScript 友好

---

## 2. 跨级组件通信

### provide / inject

**适用场景**：
- 祖先组件 → 后代组件
- 传递配置类数据（主题、语言、布局等）
- 数据不频繁变化

**示例**：

```vue
<!-- 祖先组件：App.vue -->
<template>
  <config-provider>
    <dashboard />
  </config-provider>
</template>

<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
const language = ref('zh-CN')

provide('theme', theme)
provide('language', language)
provide('updateTheme', (newTheme) => {
  theme.value = newTheme
})
</script>
```

```vue
<!-- 后代组件：Card.vue -->
<template>
  <div :class="`card card--${theme}`">
    <h3>{{ title }}</h3>
  </div>
</template>

<script setup>
import { inject } from 'vue'

defineProps(['title'])

const theme = inject('theme', 'light') // 提供默认值
</script>
```

**优点**：
- 避免 prop drilling（层层传递）
- 配置集中管理

**缺点**：
- 数据流向不直观
- 难以追踪数据来源

---

### Pinia Store

**适用场景**：
- 全局状态管理
- 多个组件共享的状态
- 状态频繁变化

**示例**：

```js
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    permissions: [],
    searchFilters: {}
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    }
  },
  
  actions: {
    login(user) {
      this.currentUser = user
    },
    
    logout() {
      this.currentUser = null
      this.permissions = []
    },
    
    setSearchFilters(filters) {
      this.searchFilters = filters
    }
  }
})
```

```vue
<!-- 组件 A：UserSearch.vue -->
<template>
  <el-form @submit.prevent="handleSearch">
    <el-input v-model="filters.username" placeholder="用户名" />
    <el-button type="primary" @click="handleSearch">搜索</el-button>
  </el-form>
</template>

<script setup>
import { reactive } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const filters = reactive({ username: '' })

const handleSearch = () => {
  userStore.setSearchFilters({ ...filters })
}
</script>
```

```vue
<!-- 组件 B：UserTable.vue -->
<template>
  <el-table :data="userList">
    <el-table-column prop="name" label="姓名" />
  </el-table>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userList = computed(() => {
  // 根据 searchFilters 过滤数据
  return filterData(userStore.searchFilters)
})
</script>
```

**优点**：
- 状态集中管理
- 响应式更新
- DevTools 支持

---

## 3. 兄弟组件通信

### 方案 1：共同父组件中转

**适用场景**：
- 两个兄弟组件需要通信
- 有共同的父组件

**示例**：

```vue
<!-- 父组件：UserManagement.vue -->
<template>
  <user-search @search="handleSearch" />
  <user-table :search-params="searchParams" />
</template>

<script setup>
import { ref } from 'vue'
import UserSearch from './UserSearch.vue'
import UserTable from './UserTable.vue'

const searchParams = ref({})

const handleSearch = (params) => {
  searchParams.value = params
}
</script>
```

**原理**：
- 兄弟 A → 父组件：通过 emit 发送事件
- 父组件 → 兄弟 B：通过 props 传递数据

---

### 方案 2：Pinia Store

**适用场景**：
- 多个兄弟组件需要共享状态
- 父组件中转太复杂

**示例**：见上方 Pinia Store 示例

---

## 4. 其他通信方式

### 事件总线（不推荐）

Vue3 移除了 `$on`、`$off`、`$once`，不再推荐事件总线模式。

**替代方案**：使用 Pinia 或 mitt 库

---

### ref 直接访问（谨慎使用）

**适用场景**：
- 需要调用子组件的方法
- 特殊场景（如表单验证）

**示例**：

```vue
<!-- 父组件 -->
<template>
  <user-form ref="formRef" />
  <el-button @click="handleSubmit">提交</el-button>
</template>

<script setup>
import { ref } from 'vue'
import UserForm from './UserForm.vue'

const formRef = ref(null)

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    // 提交表单
  }
}
</script>
```

```vue
<!-- 子组件：UserForm.vue -->
<script setup>
const validate = async () => {
  // 表单验证逻辑
  return true
}

defineExpose({
  validate
})
</script>
```

**注意**：
- 破坏了组件封装性
- 仅在必要时使用

---

## 通信模式对比

| 模式 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| props + emit | 父子组件 | 清晰、简单、TS 友好 | 只能父子通信 |
| provide/inject | 跨级配置 | 避免 prop drilling | 数据流向不直观 |
| Pinia | 全局状态 | 集中管理、响应式 | 需要额外依赖 |
| 父组件中转 | 兄弟组件 | 简单直接 | 增加父组件负担 |
| ref 访问 | 特殊场景 | 直接调用方法 | 破坏封装 |

---

## 选择建议

**决策流程**：

1. **父子组件？**
   - Yes → 使用 props + emit
   - No → 继续

2. **跨级通信？**
   - Yes → 继续
   - No（兄弟组件）→ 父组件中转 或 Pinia

3. **传递的是什么？**
   - 配置类（主题、语言）→ provide/inject
   - 状态类（用户信息、权限）→ Pinia

4. **多个组件共享？**
   - Yes → Pinia
   - No → provide/inject
