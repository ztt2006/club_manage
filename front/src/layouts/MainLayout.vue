<template>
  <el-container class="main-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>社团管理系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-menu-item index="/clubs">
          <el-icon><OfficeBuilding /></el-icon>
          <span>社团列表</span>
        </el-menu-item>
        
        <el-menu-item index="/my-clubs">
          <el-icon><Stamp /></el-icon>
          <span>我的社团</span>
        </el-menu-item>
        
        <el-menu-item index="/activities">
          <el-icon><Calendar /></el-icon>
          <span>活动管理</span>
        </el-menu-item>
        
        <el-menu-item index="/recruitments">
          <el-icon><UserFilled /></el-icon>
          <span>社团招新</span>
        </el-menu-item>
        
        <el-menu-item index="/announcements">
          <el-icon><Bell /></el-icon>
          <span>公告通知</span>
        </el-menu-item>
        
        <el-menu-item index="/notifications">
          <el-icon><Message /></el-icon>
          <span>我的通知</span>
          <el-badge v-if="unreadNotifications > 0" :value="unreadNotifications" class="badge" />
        </el-menu-item>
        
        <el-menu-item index="/messages">
          <el-icon><ChatDotRound /></el-icon>
          <span>站内消息</span>
          <el-badge v-if="unreadMessages > 0" :value="unreadMessages" class="badge" />
        </el-menu-item>
        
        <el-menu-item v-if="isAdmin" index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item v-if="isAdmin" index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :src="userAvatar" :size="32">
                {{ userStore.user?.realName?.[0] }}
              </el-avatar>
              <span class="username">{{ userStore.user?.realName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'
import { getUnreadCount as getUnreadNotifications } from '@/api/notification'
import { getUnreadCount as getUnreadMessages } from '@/api/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const unreadNotifications = ref(0)
const unreadMessages = ref(0)

const activeMenu = computed(() => route.path)
const isAdmin = computed(() => ['ADMIN', 'SUPER_ADMIN'].includes(userStore.user?.role))

const userAvatar = computed(() => {
  const avatar = userStore.user?.avatar
  if (avatar) {
    // 如果是完整URL，直接使用
    if (avatar.startsWith('http')) {
      return avatar
    }
    // 否则拼接后端地址
    const fullUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${avatar}`
    console.log('用户头像URL:', fullUrl)
    return fullUrl
  }
  return ''
})

const fetchUnreadCounts = async () => {
  try {
    const [notificationsRes, messagesRes] = await Promise.all([
      getUnreadNotifications(),
      getUnreadMessages()
    ])
    if (notificationsRes.success) {
      unreadNotifications.value = notificationsRes.data.count
    }
    if (messagesRes.success) {
      unreadMessages.value = messagesRes.data.count
    }
  } catch (error) {
    console.error('Failed to fetch unread counts:', error)
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    })
  } else if (command === 'profile') {
    router.push('/profile')
  }
}

onMounted(() => {
  fetchUnreadCounts()
  // 每30秒刷新一次未读数量
  setInterval(fetchUnreadCounts, 30000)
})
</script>

<style scoped>
.main-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  background-color: #2b3a4b;
}

.logo h2 {
  font-size: 18px;
  margin: 0;
}

.el-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 10px;
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

.badge {
  position: absolute;
  top: 10px;
  right: 15px;
}
</style>
