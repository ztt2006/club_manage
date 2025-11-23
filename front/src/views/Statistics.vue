<template>
  <div class="statistics-page">
    <el-card v-loading="loading">
      <template #header>
        <span>数据统计</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-box">
            <div class="stat-value">{{ stats.users?.total || 0 }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-box">
            <div class="stat-value">{{ stats.clubs?.total || 0 }}</div>
            <div class="stat-label">社团总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-box">
            <div class="stat-value">{{ stats.activities?.total || 0 }}</div>
            <div class="stat-label">活动总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-box">
            <div class="stat-value">{{ stats.recruitments?.total || 0 }}</div>
            <div class="stat-label">招新总数</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOverviewStats } from '@/api/statistics'

const loading = ref(false)
const stats = ref({})

const fetchStats = async () => {
  loading.value = true
  try {
    const response = await getOverviewStats()
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.statistics-page {
  padding: 20px;
}

.stat-box {
  text-align: center;
  padding: 30px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  margin-top: 10px;
  color: #666;
}
</style>
