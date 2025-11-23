<template>
  <div class="notifications-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的通知</span>
          <el-button type="primary" @click="handleMarkAllAsRead">全部标记为已读</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="未读" name="unread" />
      </el-tabs>

      <el-empty v-if="notifications.length === 0" description="暂无通知" />
      
      <el-timeline v-else>
        <el-timeline-item
          v-for="item in notifications"
          :key="item.id"
          :timestamp="formatDate(item.createdAt)"
          placement="top"
        >
          <el-card :class="{ 'unread-notification': !item.isRead }">
            <div class="notification-header">
              <el-tag :type="getTypeTag(item.type)" size="small">
                {{ getTypeText(item.type) }}
              </el-tag>
              <el-tag v-if="!item.isRead" type="success" size="small">未读</el-tag>
            </div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.content }}</p>
            <div class="notification-actions">
              <el-button v-if="!item.isRead" text type="primary" size="small" @click="markAsRead(item.id)">
                标记已读
              </el-button>
              <el-button text type="danger" size="small" @click="handleDelete(item.id)">
                删除
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-pagination
        v-if="pagination.total > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="fetchNotifications"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getNotifications, markAsRead as apiMarkAsRead, markAllAsRead, deleteNotification } from '@/api/notification'
import { ElMessage, ElMessageBox } from 'element-plus'
import { format } from 'date-fns'

const activeTab = ref('all')
const notifications = ref([])

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const fetchNotifications = async () => {
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    
    if (activeTab.value === 'unread') {
      params.isRead = 'false'
    }

    const response = await getNotifications(params)
    if (response.success) {
      notifications.value = response.data.notifications
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
}

const markAsRead = async (id) => {
  try {
    const response = await apiMarkAsRead(id)
    if (response.success) {
      ElMessage.success('已标记为已读')
      fetchNotifications()
    }
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

const handleMarkAllAsRead = async () => {
  try {
    const response = await markAllAsRead()
    if (response.success) {
      ElMessage.success('已全部标记为已读')
      fetchNotifications()
    }
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const response = await deleteNotification(id)
    if (response.success) {
      ElMessage.success('删除成功')
      fetchNotifications()
    }
  }).catch(() => {})
}

const handleTabChange = () => {
  pagination.page = 1
  fetchNotifications()
}

const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

const getTypeTag = (type) => {
  const typeMap = {
    SYSTEM: '',
    ACTIVITY: 'success',
    CLUB: 'primary',
    RECRUITMENT: 'warning',
    APPLICATION: 'info',
    MEMBER: 'success'
  }
  return typeMap[type] || ''
}

const getTypeText = (type) => {
  const typeMap = {
    SYSTEM: '系统通知',
    ACTIVITY: '活动通知',
    CLUB: '社团通知',
    RECRUITMENT: '招新通知',
    APPLICATION: '申请通知',
    MEMBER: '成员通知'
  }
  return typeMap[type] || type
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notifications-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unread-notification {
  background-color: #f0f9ff;
}

.notification-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.notification-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
