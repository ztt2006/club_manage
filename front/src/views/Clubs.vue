<template>
  <div class="clubs-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>社团列表</span>
          <el-button v-if="isAdmin" type="primary" @click="showDialog = true">
            <el-icon><Plus /></el-icon>
            新建社团
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.search" placeholder="搜索社团名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.category" placeholder="分类" clearable>
            <el-option label="学术" value="学术" />
            <el-option label="文艺" value="文艺" />
            <el-option label="体育" value="体育" />
            <el-option label="公益" value="公益" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchClubs">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table 
        :data="clubs" 
        v-loading="loading" 
        stripe
        style="width: 100%"
        :header-cell-style="{backgroundColor: 'transparent', color: '#fff'}"
      >
        <el-table-column prop="name" label="社团名称" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="description" label="简介" show-overflow-tooltip />
        <el-table-column label="成员数" width="100">
          <template #default="{ row }">
            {{ row._count.members }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row.id)">详情</el-button>
            <el-button v-if="isAdmin" text type="danger" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="fetchClubs"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <el-dialog v-model="showDialog" title="新建社团" width="650px">
      <el-form :model="clubForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="社团名称" prop="name">
          <el-input 
            v-model="clubForm.name" 
            placeholder="请输入社团名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="clubForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="学术" value="学术" />
            <el-option label="文艺" value="文艺" />
            <el-option label="体育" value="体育" />
            <el-option label="公益" value="公益" />
            <el-option label="科技" value="科技" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="社团简介" prop="description">
          <el-input 
            v-model="clubForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入社团简介，介绍社团的特色、目标和活动内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="最大成员数" prop="maxMembers">
          <el-input-number 
            v-model="clubForm.maxMembers" 
            :min="10" 
            :max="500"
            :step="10"
          />
          <span style="margin-left: 10px; color: #909399; font-size: 12px">
            建议设置为10-500人
          </span>
        </el-form-item>
        <el-form-item label="成立日期">
          <el-date-picker 
            v-model="clubForm.foundedDate" 
            type="date" 
            placeholder="选择成立日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="submitting">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getClubs, createClub, deleteClub } from '@/api/club'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const clubs = ref([])
const formRef = ref()

const isAdmin = computed(() => ['ADMIN', 'SUPER_ADMIN'].includes(userStore.user?.role))

const searchForm = reactive({
  search: '',
  category: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const clubForm = reactive({
  name: '',
  category: '',
  description: '',
  maxMembers: 100,
  foundedDate: new Date()
})

const rules = {
  name: [
    { required: true, message: '请输入社团名称', trigger: 'blur' },
    { min: 2, max: 50, message: '社团名称长度2-50个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入社团简介', trigger: 'blur' },
    { min: 10, max: 500, message: '简介长度10-500个字符', trigger: 'blur' }
  ],
  maxMembers: [
    { required: true, message: '请输入最大成员数', trigger: 'blur' }
  ]
}

const fetchClubs = async () => {
  loading.value = true
  try {
    const response = await getClubs({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    })
    if (response.success) {
      clubs.value = response.data.clubs
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch clubs:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data = {
          ...clubForm,
          foundedDate: clubForm.foundedDate ? clubForm.foundedDate.toISOString() : null
        }
        const response = await createClub(data)
        if (response.success) {
          ElMessage.success('社团创建成功')
          showDialog.value = false
          Object.assign(clubForm, {
            name: '',
            category: '',
            description: '',
            maxMembers: 100,
            foundedDate: new Date()
          })
          fetchClubs()
        }
      } catch (error) {
        console.error('Failed to create club:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这个社团吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const response = await deleteClub(id)
    if (response.success) {
      ElMessage.success('删除成功')
      fetchClubs()
    }
  })
}

const viewDetail = (id) => {
  router.push(`/clubs/${id}`)
}

onMounted(() => {
  fetchClubs()
})
</script>

<style scoped>
@import '@/styles/table.css';

.clubs-page {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

/* 表格行悬停效果增强 */
:deep(.el-table__row) {
  cursor: pointer;
}

/* 数字徽章 */
:deep(.el-table__cell) .el-tag {
  font-weight: 600;
}
</style>
