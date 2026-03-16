# 常见拆分场景

本文档列出 Vue3 组件拆分的常见场景及其拆分方案。

## 场景 1：CRUD 页面

**特征**：搜索 + 表格 + 表单 + 分页

**代码特征**：
- 包含搜索表单区域
- 数据表格展示
- 新增/编辑对话框
- 分页组件
- 可能有统计卡片、导入导出功能

**拆分方案**：
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

**职责划分**：
- **index.vue**：布局容器，协调子组件，处理全局状态
- **UserSearch**：搜索表单，触发搜索事件
- **UserTable**：数据展示，处理行操作（编辑、删除、查看）
- **UserForm**：新增/编辑表单，表单验证
- **UserPagination**：分页控制

---

## 场景 2：详情页

**特征**：多个信息卡片/区域

**代码特征**：
- 展示单个实体的详细信息
- 包含多个信息区块（订单信息、商品信息、物流信息等）
- 可能有多个 Tab 页
- 操作按钮分散在各区域

**拆分方案**：
```
OrderDetail/
├── index.vue
├── OrderHeader.vue        # 头部信息（订单号、状态等）
├── OrderInfo.vue          # 订单基本信息
├── OrderItems.vue         # 商品列表
├── OrderLogistics.vue     # 物流信息
├── OrderPayment.vue       # 支付信息
└── composables/
    ├── useOrder.js
    ├── useOrderItems.js
    ├── useLogistics.js
    └── usePayment.js
```

---

## 场景 3：Dashboard

**特征**：多个统计卡片 + 图表

**代码特征**：
- 多个统计卡片（4-8 个）
- 多个图表（折线图、柱状图、饼图等）
- 时间范围选择器
- 可能有数据表格
- 刷新按钮

**拆分方案**：
```
Dashboard/
├── index.vue
├── DashboardHeader.vue    # 头部（时间选择、刷新）
├── DashboardContent.vue   # 内容区域
├── cards/
│   ├── SalesCard.vue      # 销售卡片
│   ├── UserCard.vue       # 用户卡片
│   ├── OrderCard.vue      # 订单卡片
│   └── RevenueCard.vue    # 收入卡片
├── charts/
│   ├── SalesTrend.vue     # 销售趋势图
│   ├── CategoryPie.vue    # 分类占比图
│   └── RankingBar.vue     # 排行榜
└── composables/
    ├── useDashboard.js
    └── useCharts.js
```

---

## 场景 4：复杂表单

**特征**：多步骤、多字段组、动态表单

**代码特征**：
- 表单字段超过 20 个
- 多步骤提交（步骤 1、2、3）
- 动态表单（根据选择显示/隐藏字段）
- 字段组重复（如订单商品列表，可添加多行）

**拆分方案**：
```
OrderCreate/
├── index.vue
├── FormStep1.vue          # 步骤 1：订单信息
├── FormStep2.vue          # 步骤 2：商品信息
├── FormStep3.vue          # 步骤 3：物流信息
├── FormFieldGroup.vue     # 字段组（可重复）
├── DynamicForm.vue        # 动态表单
└── composables/
    ├── useOrderForm.js
    └── useFormValidation.js
```

---

## 场景 5：设置页面

**特征**：多个设置分类，Tab 切换

**代码特征**：
- 左侧导航/Tab
- 右侧设置内容
- 每个 Tab 页是独立的设置模块
- 保存按钮可能在每个 Tab 或全局

**拆分方案**：
```
Settings/
├── index.vue
├── SettingsTabs.vue       # Tab 导航
├── tabs/
│   ├── AccountSettings.vue    # 账户设置
│   ├── SecuritySettings.vue   # 安全设置
│   ├── NotificationSettings.vue # 通知设置
│   └── ProfileSettings.vue    # 个人资料
└── composables/
    └── useSettings.js
```

---

## 场景 6：数据可视化页面

**特征**：多个图表 + 数据表格 + 筛选器

**代码特征**：
- 多个图表（3 个以上）
- 复杂筛选器（多条件、日期范围）
- 数据表格
- 导出功能

**拆分方案**：
```
Analytics/
├── index.vue
├── FilterPanel.vue        # 筛选器面板
├── ChartGrid.vue          # 图表网格布局
├── DataTable.vue          # 数据表格
├── charts/
│   ├── TrendChart.vue
│   ├── DistributionChart.vue
│   └── ComparisonChart.vue
└── composables/
    ├── useFilters.js
    ├── useCharts.js
    └── useTable.js
```

---

## 场景选择指南

当面对一个组件时，按以下顺序判断拆分方案：

1. **功能模块过多** → 按功能模块拆分（场景 1、6）
2. **业务实体过多** → 按业务领域拆分（场景 2）
3. **UI 结构明显** → 按 UI 结构拆分（场景 3、5）
4. **表单复杂** → 按步骤/字段组拆分（场景 4）

**优先级判断**：
- 功能独立性 > UI 结构
- 复用价值 > 代码行数
- 业务领域 > 技术实现
