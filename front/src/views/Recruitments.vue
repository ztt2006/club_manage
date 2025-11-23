<template>
  <div class="recruitments-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>社团招新</span>
          <el-button v-if="canManage" type="primary" @click="showDialog = true">
            <el-icon><Plus /></el-icon>
            发布招新
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="进行中" value="OPEN" />
            <el-option label="已关闭" value="CLOSED" />
            <el-option label="草稿" value="DRAFT" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchRecruitments">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table 
        :data="recruitments" 
        v-loading="loading" 
        stripe
        style="width: 100%"
        :header-cell-style="{backgroundColor: 'transparent', color: '#fff'}"
      >
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="club.name" label="社团" width="150" />
        <el-table-column prop="positions" label="名额" width="80" />
        <el-table-column label="申请数" width="100">
          <template #default="{ row }">
            <el-tag type="success">{{ row._count?.applications || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'OPEN' ? 'success' : 'info'">
              {{ row.status === 'OPEN' ? '进行中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row.id)">详情</el-button>
            <el-button v-if="canManage" text type="danger" @click="handleDelete(row.id)">
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
        @current-change="fetchRecruitments"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 创建招新对话框 -->
    <el-dialog v-model="showDialog" title="发布招新" width="650px">
      <el-form :model="recruitmentForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="社团" prop="clubId">
          <el-select v-model="recruitmentForm.clubId" placeholder="选择社团" style="width: 100%">
            <el-option 
              v-for="club in clubs" 
              :key="club.id" 
              :label="club.name" 
              :value="club.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="recruitmentForm.title" placeholder="例如：2024年春季招新" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="recruitmentForm.description" type="textarea" :rows="3" 
            placeholder="介绍本次招新的基本情况" />
        </el-form-item>
        <el-form-item label="招新要求" prop="requirements">
          <el-input v-model="recruitmentForm.requirements" type="textarea" :rows="3" 
            placeholder="说明加入社团的要求和条件" />
        </el-form-item>
        <el-form-item label="招新名额" prop="positions">
          <el-input-number v-model="recruitmentForm.positions" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker 
            v-model="recruitmentForm.startDate" 
            type="date" 
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker 
            v-model="recruitmentForm.endDate" 
            type="date" 
            placeholder="选择结束日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getRecruitments, createRecruitment, deleteRecruitment } from '@/api/recruitment'
import { getClubs } from '@/api/club'
import { ElMessage, ElMessageBox } from 'element-plus'
import { format } from 'date-fns'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const showDialog = ref(false)
const recruitments = ref([])
const clubs = ref([])
const formRef = ref()

const canManage = computed(() => ['ADMIN', 'SUPER_ADMIN'].includes(userStore.user?.role))

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const searchForm = reactive({
  status: ''
})

const recruitmentForm = reactive({
  clubId: null,
  title: '',
  description: '',
  requirements: '',
  positions: 10,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
})

const rules = {
  clubId: [{ required: true, message: '请选择社团', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  requirements: [{ required: true, message: '请输入招新要求', trigger: 'blur' }],
  positions: [{ required: true, message: '请输入招新名额', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const fetchRecruitments = async () => {
  loading.value = true
  try {
    const response = await getRecruitments({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    })
    if (response.success) {
      recruitments.value = response.data.recruitments
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch recruitments:', error)
  } finally {
    loading.value = false
  }
}

const fetchClubs = async () => {
  try {
    const response = await getClubs({ limit: 100 })
    if (response.success) {
      clubs.value = response.data.clubs.filter(club => club.status === 'ACTIVE')
    }
  } catch (error) {
    console.error('Failed to fetch clubs:', error)
  }
}

const handleCreate = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await createRecruitment({
          ...recruitmentForm,
          startDate: recruitmentForm.startDate.toISOString(),
          endDate: recruitmentForm.endDate.toISOString()
        })
        if (response.success) {
          ElMessage.success('招新发布成功')
          showDialog.value = false
          Object.assign(recruitmentForm, {
            clubId: null,
            title: '',
            description: '',
            requirements: '',
            positions: 10,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
          fetchRecruitments()
        }
      } catch (error) {
        console.error('Failed to create recruitment:', error)
      }
    }
  })
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这个招新吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const response = await deleteRecruitment(id)
    if (response.success) {
      ElMessage.success('删除成功')
      fetchRecruitments()
    }
  }).catch(() => {})
}

const viewDetail = (id) => {
  router.push(`/recruitments/${id}`)
}

const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd')
}

onMounted(() => {
  fetchRecruitments()
  if (canManage.value) {
    fetchClubs()
  }
})
</script>

<style scoped>
@import '@/styles/table.css';

.recruitments-page {
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

/* 招新状态标签 */
:deep(.el-tag) {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 申请数徽章 */
:deep(.el-tag--success) {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: #ffffff;
}
</style>
