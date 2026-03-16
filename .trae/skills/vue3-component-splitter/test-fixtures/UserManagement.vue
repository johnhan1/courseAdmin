<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色">
            <el-option label="管理员" :value="1" />
            <el-option label="普通用户" :value="2" />
            <el-option label="访客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片区域 -->
    <div class="statistics-area">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">总用户数</div>
            <div class="stat-value">{{ statistics.totalUsers }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">今日新增</div>
            <div class="stat-value">{{ statistics.todayNew }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">活跃用户</div>
            <div class="stat-value">{{ statistics.activeUsers }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">禁用用户</div>
            <div class="stat-value">{{ statistics.disabledUsers }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区域 -->
    <div class="toolbar-area">
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
        批量删除
      </el-button>
      <el-button @click="handleBatchImport">批量导入</el-button>
      <el-dropdown @command="handleMore">
        <el-button>
          更多操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="export">导出选中</el-dropdown-item>
            <el-dropdown-item command="assign">分配角色</el-dropdown-item>
            <el-dropdown-item command="reset">重置密码</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-area">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.role === 1" type="danger">管理员</el-tag>
            <el-tag v-else-if="row.role === 2" type="primary">普通用户</el-tag>
            <el-tag v-else type="info">访客</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleView(row)">查看</el-button>
            <el-button type="warning" link @click="handleResetPassword(row)">重置密码</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-area">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!formData.id">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="管理员" :value="1" />
            <el-option label="普通用户" :value="2" />
            <el-option label="访客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog v-model="viewDialogVisible" title="用户详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ viewData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ viewData.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ viewData.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ viewData.phone }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag v-if="viewData.role === 1" type="danger">管理员</el-tag>
          <el-tag v-else-if="viewData.role === 2" type="primary">普通用户</el-tag>
          <el-tag v-else type="info">访客</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="viewData.status === 1 ? 'success' : 'danger'">
            {{ viewData.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ viewData.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ viewData.remark }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入用户" width="500px">
      <el-upload drag :action="uploadUrl" :on-success="handleUploadSuccess" :on-error="handleUploadError" multiple>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/csv 文件，且不超过 5MB
          </div>
        </template>
      </el-upload>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配角色" width="400px">
      <el-select v-model="assignRole" placeholder="请选择角色" style="width: 100%">
        <el-option label="管理员" :value="1" />
        <el-option label="普通用户" :value="2" />
        <el-option label="访客" :value="3" />
      </el-select>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, UploadFilled } from '@element-plus/icons-vue'
import axios from 'axios'

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  phone: '',
  status: null,
  role: null
})

// 统计数据
const statistics = ref({
  totalUsers: 0,
  todayNew: 0,
  activeUsers: 0,
  disabledUsers: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => formData.value.id ? '编辑用户' : '新增用户')
const formRef = ref(null)
const formData = ref({
  id: null,
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 2,
  status: 1,
  remark: ''
})

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur', min: 6 }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 查看对话框
const viewDialogVisible = ref(false)
const viewData = ref({})

// 导入对话框
const importDialogVisible = ref(false)
const uploadUrl = '/api/user/import'

// 分配角色对话框
const assignDialogVisible = ref(false)
const assignRole = ref(null)

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/user/list', {
      params: {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        ...searchForm
      }
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await axios.get('/api/user/statistics')
    statistics.value = res.data
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.email = ''
  searchForm.phone = ''
  searchForm.status = null
  searchForm.role = null
  handleSearch()
}

// 导出
const handleExport = () => {
  window.open('/api/user/export')
}

// 新增
const handleAdd = () => {
  formData.value = {
    id: null,
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 2,
    status: 1,
    remark: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  formData.value = { ...row }
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/user/${row.id}`)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      if (formData.value.id) {
        await axios.put(`/api/user/${formData.value.id}`, formData.value)
      } else {
        await axios.post('/api/user', formData.value)
      }
      ElMessage.success('保存成功')
      dialogVisible.value = false
      loadData()
    } catch (error) {
      ElMessage.error('保存失败')
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.post('/api/user/batch-delete', { ids: selectedRows.value.map(r => r.id) })
      ElMessage.success('批量删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  })
}

// 批量导入
const handleBatchImport = () => {
  importDialogVisible.value = true
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('上传失败')
}

// 更多操作
const handleMore = (command) => {
  switch (command) {
    case 'export':
      // 导出选中
      break
    case 'assign':
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先选择用户')
        return
      }
      assignDialogVisible.value = true
      break
    case 'reset':
      // 重置密码
      break
  }
}

// 分配角色提交
const handleAssignSubmit = async () => {
  if (!assignRole.value) {
    ElMessage.warning('请选择角色')
    return
  }
  try {
    await axios.post('/api/user/assign-role', {
      ids: selectedRows.value.map(r => r.id),
      role: assignRole.value
    })
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('分配失败')
  }
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 状态变化
const handleStatusChange = async (row) => {
  try {
    await axios.put(`/api/user/${row.id}`, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// 分页变化
const handleSizeChange = () => {
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
  loadStatistics()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.statistics-area {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
  color: white;
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-title {
  font-size: 14px;
  opacity: 0.9;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-top: 8px;
}

.toolbar-area {
  margin-bottom: 15px;
}

.table-area {
  margin-bottom: 15px;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
}
</style>
