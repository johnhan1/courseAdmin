<template>
  <el-container class="layout-container">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon size="28" color="#409EFF"><School /></el-icon>
        <span class="title">课程管理系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :collapse="isCollapse"
        :collapse-transition="false"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据报表</span>
        </el-menu-item>
        
        <el-menu-item index="/resource">
          <el-icon><Folder /></el-icon>
          <span>资源中心</span>
        </el-menu-item>
        
        <el-menu-item index="/course">
          <el-icon><Reading /></el-icon>
          <span>课程管理</span>
        </el-menu-item>
        
        <el-menu-item index="/plan">
          <el-icon><Calendar /></el-icon>
          <span>培训计划</span>
        </el-menu-item>
        
        <el-menu-item index="/monitor">
          <el-icon><TrendCharts /></el-icon>
          <span>进度监控</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        
        <div class="header-right">
          <el-input
            v-model="searchQuery"
            placeholder="全局搜索..."
            class="search-input"
            :prefix-icon="Search"
            clearable
          />
          
          <el-badge :value="3" class="message-badge">
            <el-icon size="20"><Bell /></el-icon>
          </el-badge>
          
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>系统设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from './components/Breadcrumb.vue'

const route = useRoute()
const isCollapse = ref(false)
const searchQuery = ref('')

const activeMenu = computed(() => route.path)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  
  .sidebar {
    background: #001529;
    transition: width 0.3s;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      
      .title {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        margin-left: 12px;
      }
    }
    
    .sidebar-menu {
      border-right: none;
      height: calc(100% - 60px);
    }
  }
  
  .header {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    
    .header-left {
      display: flex;
      align-items: center;
      
      .collapse-btn {
        font-size: 20px;
        cursor: pointer;
        margin-right: 16px;
        color: #606266;
        
        &:hover {
          color: #409EFF;
        }
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 24px;
      
      .search-input {
        width: 240px;
      }
      
      .message-badge {
        cursor: pointer;
        color: #606266;
        
        &:hover {
          color: #409EFF;
        }
      }
      
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        gap: 8px;
        
        .username {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }
  
  .main-content {
    background: #f0f2f5;
    padding: 20px;
    overflow-y: auto;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
