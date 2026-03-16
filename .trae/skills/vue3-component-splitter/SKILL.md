---
name: vue3-component-splitter
description: "Vue3 组件智能拆分技能。**触发场景**：用户明确要求拆分/重构 Vue3 组件；提到组件太大/太复杂/难以维护；上传 Vue 文件询问如何优化；请求代码改进/性能优化/组件化。**注意**：即使用户未明确说\"拆分\"，但只要提到组件复杂、代码乱、难维护，就应该触发。此技能会智能判断是否需要拆分，并提供详细方案和完整代码。"
---

# Vue3 组件智能拆分技能

## 技能概述

专门用于分析和拆分 Vue3 大型复杂组件，通过智能判断和合理的拆分策略，提高代码的可维护性、可读性和可复用性。

## 智能判断

### 判断维度（满足任一即建议拆分）

**代码行数**
- 总行数 > 300 行
- Template > 200 行
- Script > 150 行

**功能模块**
- 包含 > 3 个独立功能模块
- 模块间耦合度低

**模板复杂度**
- 嵌套层级 > 3 层
- v-if/v-show > 5 个
- v-for > 3 个

**可复用片段**
- 相同 UI 结构重复 > 2 次
- 相似逻辑多处重复

### 优先级判断

当多个拆分方案并存时，按以下优先级选择：

1. **功能独立性 > UI 结构** - 按功能模块拆分优先于按 UI 结构拆分
2. **复用价值 > 代码行数** - 可复用组件提取优先于单纯减少行数
3. **业务领域 > 技术实现** - 按业务实体拆分优先于技术实现拆分

**示例决策**：
```
组件包含：搜索 + 表格 + 统计卡片 + 图表
✅ 优先：按功能模块拆分（UserSearch、UserTable、Statistics、Chart）
❌ 次选：按 UI 结构拆分（Header、Content、Footer）
```

## 拆分策略

### 1. 按功能模块拆分（最常用）

适用：CRUD 页面、数据管理页面

```
UserManagement/
├── index.vue              # 主组件（布局容器）
├── UserSearch.vue         # 搜索表单
├── UserTable.vue          # 数据表格
├── UserForm.vue           # 新增/编辑表单
├── UserPagination.vue     # 分页
└── composables/
    ├── useUserList.js     # 列表逻辑
    └── useUserForm.js     # 表单逻辑
```

### 2. 按业务领域拆分

适用：详情页、涉及多个业务实体

```
OrderDetail/
├── index.vue
├── OrderInfo.vue          # 订单信息
├── OrderItems.vue         # 商品列表
├── OrderLogistics.vue     # 物流信息
└── composables/
    ├── useOrder.js
    └── useOrderItems.js
```

### 3. 按 UI 结构拆分

适用：Dashboard、有明显层级结构

```
Dashboard/
├── index.vue
├── DashboardHeader.vue    # 头部统计
├── DashboardContent.vue   # 内容区域
└── cards/
    ├── SalesCard.vue      # 销售卡片
    └── UserCard.vue       # 用户卡片
```

### 4. 提取可复用组件

适用：重复的 UI 片段、相似逻辑

## 拆分原则

1. **单一职责** - 每个组件只负责一个功能
2. **高内聚低耦合** - 相关逻辑放一起，组件间通过 props/events 通信
3. **保持接口稳定** - 父组件 API 保持稳定
4. **渐进式拆分** - 优先拆分最复杂的部分

## 拆分流程

### 1. 分析组件

输出：
```markdown
## 组件分析

### 代码统计
| 部分 | 行数 | 评估 |
|------|------|------|
| Template | 220 行 | ⚠️ 过多 |
| Script | 180 行 | ⚠️ 过多 |
| Style | 50 行 | ✅ 合理 |
| 总计 | 450 行 | ⚠️ 需要拆分 |

### 问题识别
1. 代码行数过多：总行数超过 300 行
2. 功能模块过多：包含搜索、表格、表单、图表 4 个模块
3. 模板复杂度高：嵌套层级达到 4 层

### 拆分建议
建议拆分为 5 个子组件
```

### 2. 制定拆分方案

输出：
```markdown
## 拆分方案

### 组件结构
UserManagement/
├── index.vue              # 主组件（约 80 行）
├── UserSearch.vue         # 搜索组件（约 100 行）
├── UserTable.vue          # 表格组件（约 120 行）
├── UserForm.vue           # 表单组件（约 100 行）
└── composables/
    └── useUserList.js

### 职责划分
- **index.vue**：布局容器，协调子组件
- **UserSearch**：搜索表单，触发搜索事件
- **UserTable**：数据展示，处理行操作
- **UserForm**：新增/编辑表单

### 通信方式
- 父子组件：props + emit
- 状态共享：Pinia store（用户信息、权限）
- 逻辑复用：composables（列表、表单）
- 跨级配置：provide/inject（主题、语言）
```

**通信模式选择指南**：
- 父子组件 → props + emit（首选）
- 跨级配置 → provide/inject
- 全局状态 → Pinia
- 兄弟组件 → 父组件中转 或 Pinia

详见：`references/communication-patterns.md`

### 3. 实现拆分

输出完整代码（使用 `<script setup>` 和 Composition API）：

```vue
<!-- index.vue -->
<template>
  <div class="user-management">
    <user-search @search="handleSearch" />
    <user-table 
      :data="userList" 
      @edit="handleEdit"
      @delete="handleDelete"
    />
    <user-pagination
      v-model:current="currentPage"
      v-model:pageSize="pageSize"
      :total="total"
      @change="handlePageChange"
    />
    <user-form
      v-model:visible="formVisible"
      :form-data="formData"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserSearch from './UserSearch.vue'
import UserTable from './UserTable.vue'
import UserPagination from './UserPagination.vue'
import UserForm from './UserForm.vue'
import { useUserList } from './composables/useUserList'

const { userList, total, currentPage, pageSize, search } = useUserList()
const formVisible = ref(false)
const formData = ref(null)

const handleSearch = (params) => search(params)
const handleEdit = (row) => { formData.value = row; formVisible.value = true }
</script>
```

```vue
<!-- UserSearch.vue -->
<template>
  <el-form :model="searchForm" inline>
    <el-form-item label="用户名">
      <el-input v-model="searchForm.username" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, toRefs } from 'vue'
const emit = defineEmits(['search'])
const state = reactive({ searchForm: { username: '' } })
const { searchForm } = toRefs(state)
const handleSearch = () => emit('search', state.searchForm)
const handleReset = () => { state.searchForm.username = ''; emit('search', {}) }
</script>
```

### 4. 说明好处

```markdown
## 拆分好处

### 代码质量
- 可读性：每个组件约 100 行，易于理解
- 可维护性：修改某功能只影响对应组件
- 可测试性：小组件更容易单元测试

### 开发效率
- 并行开发：不同开发者同时开发不同子组件
- 代码复用：UserTable 可用于其他页面
- 按需加载：异步加载优化性能
```

## 输出格式

始终按以下顺序输出：

1. **组件分析报告** - 代码统计、问题识别
2. **拆分方案** - 组件结构、职责划分、通信方式
3. **完整代码** - 每个子组件的完整实现
4. **使用说明** - 引入方式、使用示例

## 拆分技巧

### 使用 Composition API

```js
// composables/useUserSearch.js
export function useUserSearch() {
  const searchForm = reactive({ username: '', status: null })
  const search = () => { /* 搜索逻辑 */ }
  const reset = () => { /* 重置逻辑 */ }
  return { searchForm, search, reset }
}
```

### 使用 script setup

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0) // 直接使用，无需 return
</script>
```

### 使用 TypeScript（可选）

```ts
interface UserTableProps {
  data: User[]
  loading?: boolean
}
const props = defineProps<UserTableProps>()
```

## 常见场景

详见 `references/scenarios.md`：

- CRUD 页面（搜索 + 表格 + 表单 + 分页）
- 详情页（订单、商品、物流、支付）
- Dashboard（统计卡片 + 图表）
- 复杂表单（多步骤、字段组）

## 最佳实践

详见 `references/best-practices.md`：

- 组件命名：PascalCase
- Props 设计：对象接收、默认值、validator
- 事件命名：kebab-case、过去分词/现在分词
- 样式隔离：scoped、CSS Modules

## 参考文档

- `references/scenarios.md` - 常见场景拆分方案
- `references/best-practices.md` - 最佳实践
- `references/communication-patterns.md` - 通信模式选择