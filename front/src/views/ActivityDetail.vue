<template>
  <div class="activity-detail-page">
    <!-- 活动详情 -->
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ activity.title }}</span>
          <div>
            <el-button v-if="canManage" type="warning" @click="handleCancelActivity">
              {{ activity.status === 'CANCELLED' ? '恢复活动' : '取消活动' }}
            </el-button>
            <el-button 
              v-if="!isRegistered && activity.status === 'PLANNED'" 
              type="success" 
              @click="handleRegister"
            >
              立即报名
            </el-button>
            <el-button @click="$router.back()">返回</el-button>
          </div>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动名称">{{ activity.title }}</el-descriptions-item>
        <el-descriptions-item label="所属社团">
          <el-link type="primary" @click="$router.push(`/clubs/${activity.club?.id}`)">
            {{ activity.club?.name || '无' }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="活动地点">{{ activity.location }}</el-descriptions-item>
        <el-descriptions-item label="报名人数">
          <el-tag type="success">{{ activity.records?.length || 0 }} / {{ activity.maxParticipants }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatDate(activity.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatDate(activity.endTime) }}</el-descriptions-item>
        <el-descriptions-item label="活动状态">
          <el-tag :type="getStatusType(activity.status)">
            {{ getStatusText(activity.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(activity.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="活动简介" :span="2">
          <div class="content">{{ activity.description }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 报名成员列表（管理员可见） -->
    <el-card v-if="canManage" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>报名成员列表 ({{ participants.length }})</span>
          <el-radio-group v-model="filterStatus" size="small" @change="filterParticipants">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="REGISTERED">已报名</el-radio-button>
            <el-radio-button label="CHECKED_IN">已签到</el-radio-button>
            <el-radio-button label="ABSENT">未参加</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table 
        :data="filteredParticipants" 
        stripe
        style="width: 100%"
        :header-cell-style="{backgroundColor: 'transparent', color: '#fff'}"
        :empty-text="暂无报名成员"
      >
        <el-table-column prop="user.realName" label="姓名" width="120" />
        <el-table-column prop="user.username" label="用户名" width="150" />
        <el-table-column prop="user.email" label="邮箱" width="200" />
        <el-table-column prop="user.phone" label="手机号" width="150" />
        <el-table-column label="报名时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.registeredAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getParticipantStatusType(row.status)">
              {{ getParticipantStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签到时间" width="180">
          <template #default="{ row }">
            {{ row.checkedInAt ? formatDate(row.checkedInAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'REGISTERED'" 
              text 
              type="success" 
              size="small"
              @click="handleCheckIn(row.id)"
            >
              签到
            </el-button>
            <el-button 
              text 
              type="danger" 
              size="small"
              @click="handleCancelRegistration(row.id)"
            >
              取消报名
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getActivityById, registerActivity, cancelActivity, checkInActivity, cancelRegistration } from '@/api/activity'
import { ElMessage, ElMessageBox } from 'element-plus'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const activity = ref({})
const participants = ref([])
const filteredParticipants = ref([])
const filterStatus = ref('')

const canManage = computed(() => {
  return ['ADMIN', 'SUPER_ADMIN'].includes(userStore.user?.role)
})

const isRegistered = computed(() => {
  return activity.value.records?.some(record => record.userId === userStore.user?.id)
})

const fetchActivityDetail = async () => {
  loading.value = true
  try {
    const response = await getActivityById(route.params.id)
    if (response.success) {
      activity.value = response.data
      if (canManage.value && response.data.records) {
        participants.value = response.data.records
        filterParticipants()
      }
    }
  } catch (error) {
    console.error('Failed to fetch activity detail:', error)
  } finally {
    loading.value = false
  }
}

const filterParticipants = () => {
  if (filterStatus.value) {
    filteredParticipants.value = participants.value.filter(
      p => p.status === filterStatus.value
    )
  } else {
    filteredParticipants.value = participants.value
  }
}

const handleRegister = async () => {
  try {
    const response = await registerActivity(route.params.id)
    if (response.success) {
      ElMessage.success('报名成功')
      await fetchActivityDetail()
    }
  } catch (error) {
    console.error('Failed to register:', error)
  }
}

const handleCancelActivity = () => {
  const action = activity.value.status === 'CANCELLED' ? '恢复' : '取消'
  ElMessageBox.confirm(`确定要${action}这个活动吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await cancelActivity(route.params.id)
      if (response.success) {
        ElMessage.success(`${action}成功`)
        await fetchActivityDetail()
      }
    } catch (error) {
      console.error('Failed to cancel activity:', error)
    }
  }).catch(() => {})
}

const handleCheckIn = async (recordId) => {
  try {
    const response = await checkInActivity(recordId)
    if (response.success) {
      ElMessage.success('签到成功')
      await fetchActivityDetail()
    }
  } catch (error) {
    console.error('Failed to check in:', error)
  }
}

const handleCancelRegistration = (recordId) => {
  ElMessageBox.confirm('确定要取消该成员的报名吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await cancelRegistration(recordId)
      if (response.success) {
        ElMessage.success('已取消报名')
        await fetchActivityDetail()
      }
    } catch (error) {
      console.error('Failed to cancel registration:', error)
    }
  }).catch(() => {})
}

const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

const getStatusType = (status) => {
  const typeMap = {
    PLANNED: 'info',
    ONGOING: 'success',
    COMPLETED: '',
    CANCELLED: 'danger'
  }
  return typeMap[status]
}

const getStatusText = (status) => {
  const textMap = {
    PLANNED: '计划中',
    ONGOING: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return textMap[status] || status
}

const getParticipantStatusType = (status) => {
  const typeMap = {
    REGISTERED: 'warning',
    CHECKED_IN: 'success',
    ABSENT: 'info',
    CANCELLED: 'danger'
  }
  return typeMap[status]
}

const getParticipantStatusText = (status) => {
  const textMap = {
    REGISTERED: '已报名',
    CHECKED_IN: '已签到',
    ABSENT: '未参加',
    CANCELLED: '已取消'
  }
  return textMap[status] || status
}

onMounted(() => {
  fetchActivityDetail()
})
</script>

<style scoped>
@import '@/styles/table.css';

.activity-detail-page {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  white-space: pre-wrap;
  line-height: 1.6;
}

/* 成员列表表格 */
:deep(.el-table) {
  margin-top: 10px;
}

/* 状态徽章 */
:deep(.el-tag) {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 描述列表美化 */
:deep(.el-descriptions__label) {
  font-weight: 600;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

/* 报名按钮 */
.el-button--success {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  transition: all 0.3s ease;
}

.el-button--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4);
}

/* 取消按钮 */
.el-button--warning {
  background: linear-gradient(135deg, #e6a23c 0%, #f0b752 100%);
  border: none;
  color: #ffffff;
}
</style>
