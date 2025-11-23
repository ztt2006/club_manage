<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <span>用户管理</span>
      </template>
      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.search" placeholder="搜索用户" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUsers">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="真实姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="fetchUsers"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUsers } from '@/api/user'

const loading = ref(false)
const users = ref([])

const searchForm = reactive({
  search: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await getUsers({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    })
    if (response.success) {
      users.value = response.data.users
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}
</style>
