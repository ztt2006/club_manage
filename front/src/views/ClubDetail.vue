<template>
  <div class="club-detail-page">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ club.name }}</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="社团名称">{{ club.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ club.category }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ club.description }}</el-descriptions-item>
        <el-descriptions-item label="成员数">{{ club._count?.members || 0 }}</el-descriptions-item>
        <el-descriptions-item label="活动数">{{ club._count?.activities || 0 }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card style="margin-top: 20px">
      <template #header>
        <span>社团成员</span>
      </template>
      <el-table :data="club.members" style="width: 100%">
        <el-table-column prop="user.realName" label="姓名" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag>{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="加入时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.joinDate) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClubById } from '@/api/club'
import { format } from 'date-fns'

const route = useRoute()
const loading = ref(false)
const club = ref({})

const fetchClubDetail = async () => {
  loading.value = true
  try {
    const response = await getClubById(route.params.id)
    if (response.success) {
      club.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch club detail:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd')
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
  fetchClubDetail()
})
</script>

<style scoped>
.club-detail-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
