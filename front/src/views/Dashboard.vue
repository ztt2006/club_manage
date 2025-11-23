<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.users?.total || 0 }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon :size="30"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.clubs?.total || 0 }}</div>
              <div class="stat-label">社团数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon :size="30"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activities?.upcoming || 0 }}</div>
              <div class="stat-label">即将开始的活动</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c">
              <el-icon :size="30"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.recruitments?.open || 0 }}</div>
              <div class="stat-label">进行中的招新</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新活动</span>
              <el-button text type="primary" @click="$router.push('/activities')">
                查看更多
              </el-button>
            </div>
          </template>
          <el-table :data="recentActivities" style="width: 100%">
            <el-table-column prop="title" label="活动名称" />
            <el-table-column prop="startTime" label="开始时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.startTime) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>我的社团</span>
              <el-button text type="primary" @click="$router.push('/my-clubs')">
                查看更多
              </el-button>
            </div>
          </template>
          <el-table :data="myClubs" style="width: 100%">
            <el-table-column prop="club.name" label="社团名称" />
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }">
                <el-tag>{{ getRoleText(row.role) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOverviewStats } from '@/api/statistics'
import { getActivities } from '@/api/activity'
import { getMyClubs } from '@/api/member'
import { format } from 'date-fns'

const stats = ref({})
const recentActivities = ref([])
const myClubs = ref([])

const fetchData = async () => {
  try {
    const [statsRes, activitiesRes, clubsRes] = await Promise.all([
      getOverviewStats(),
      getActivities({ page: 1, limit: 5, upcoming: true }),
      getMyClubs()
    ])
    
    if (statsRes.success) stats.value = statsRes.data
    if (activitiesRes.success) recentActivities.value = activitiesRes.data.activities
    if (clubsRes.success) myClubs.value = clubsRes.data.slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

const getRoleText = (role) => {
  const roleMap = {
    PRESIDENT: '社长',
    VICE_PRESIDENT: '副社长',
    MANAGER: '管理员',
    MEMBER: '成员'
  }
  return roleMap[role] || role
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
