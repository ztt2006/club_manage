<template>
  <div class="activities-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动列表</span>
          <el-button type="primary" @click="showDialog = true">
            <el-icon><Plus /></el-icon>
            创建活动
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.search" placeholder="搜索活动名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="searchForm.upcoming">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="true">即将开始</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchActivities">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table 
        :data="activities" 
        v-loading="loading" 
        stripe
        style="width: 100%"
        :header-cell-style="{backgroundColor: 'transparent', color: '#fff'}"
      >
        <el-table-column prop="title" label="活动名称" />
        <el-table-column label="社团" width="150">
          <template #default="{ row }">
            {{ row.club?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="150" />
        <el-table-column label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="报名人数" width="100">
          <template #default="{ row }">
            {{ row._count.records }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row.id)">详情</el-button>
            <el-button text type="success" @click="handleRegister(row.id)">报名</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="fetchActivities"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <el-dialog v-model="showDialog" title="创建活动" width="650px">
      <el-form :model="activityForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="社团" prop="clubId">
          <el-select v-model="activityForm.clubId" placeholder="选择社团" style="width: 100%">
            <el-option 
              v-for="club in myClubs" 
              :key="club.id" 
              :label="club.name" 
              :value="club.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="title">
          <el-input 
            v-model="activityForm.title" 
            placeholder="请输入活动名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="活动简介" prop="description">
          <el-input 
            v-model="activityForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入活动简介，介绍活动的目的、内容和亮点"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="活动地点" prop="location">
          <el-input 
            v-model="activityForm.location" 
            placeholder="例如：教学楼A101"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="activityForm.startTime"
            type="datetime"
            placeholder="选择开始日期时间"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="activityForm.endTime"
            type="datetime"
            placeholder="选择结束日期时间"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="最大报名人数" prop="maxParticipants">
          <el-input-number 
            v-model="activityForm.maxParticipants" 
            :min="1" 
            :max="500"
          />
          <span style="margin-left: 10px; color: #909399; font-size: 12px">
            建议根据场地容量设置
          </span>
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
import { getActivities, createActivity, registerActivity } from '@/api/activity'
import { getMyClubs } from '@/api/member'
import { ElMessage } from 'element-plus'
import { format } from 'date-fns'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const activities = ref([])
const myClubs = ref([])
const formRef = ref()

const isAdmin = computed(() => ['ADMIN', 'SUPER_ADMIN'].includes(userStore.user?.role))

const searchForm = reactive({
  search: '',
  upcoming: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const activityForm = reactive({
  clubId: null,
  title: '',
  description: '',
  location: '',
  startTime: new Date(),
  endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  maxParticipants: 50
})

const rules = {
  clubId: [{ required: true, message: '请选择社团', trigger: 'change' }],
  title: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 100, message: '活动名称长度2-100个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入活动简介', trigger: 'blur' },
    { min: 10, max: 500, message: '简介长度10-500个字符', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  maxParticipants: [
    { required: true, message: '请输入最大报名人数', trigger: 'blur' }
  ]
}

const fetchActivities = async () => {
  loading.value = true
  try {
    const response = await getActivities({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    })
    if (response.success) {
      activities.value = response.data.activities
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch activities:', error)
  } finally {
    loading.value = false
  }
}

const fetchMyClubs = async () => {
  try {
    const response = await getMyClubs()
    if (response.success) {
      myClubs.value = response.data.map(item => ({
        id: item.clubId,
        name: item.club.name
      }))
    }
  } catch (error) {
    console.error('Failed to fetch my clubs:', error)
  }
}

const handleCreate = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 验证时间
      if (activityForm.endTime <= activityForm.startTime) {
        ElMessage.error('结束时间必须晚于开始时间')
        return
      }

      submitting.value = true
      try {
        const data = {
          ...activityForm,
          startTime: activityForm.startTime.toISOString(),
          endTime: activityForm.endTime.toISOString()
        }
        const response = await createActivity(data)
        if (response.success) {
          ElMessage.success('活动创建成功')
          showDialog.value = false
          Object.assign(activityForm, {
            clubId: null,
            title: '',
            description: '',
            location: '',
            startTime: new Date(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            maxParticipants: 50
          })
          fetchActivities()
        }
      } catch (error) {
        console.error('Failed to create activity:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const disabledDate = (time) => {
  // 禁用过去的日期
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const handleRegister = async (id) => {
  try {
    const response = await registerActivity(id)
    if (response.success) {
      ElMessage.success('报名成功')
      fetchActivities()
    }
  } catch (error) {
    console.error('Failed to register:', error)
  }
}

const viewDetail = (id) => {
  router.push(`/activities/${id}`)
}

const formatDate = (date) => {
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
  return textMap[status]
}

onMounted(() => {
  fetchActivities()
  fetchMyClubs()
})
</script>

<style scoped>
@import '@/styles/table.css';

.activities-page {
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

/* 活动状态标签 */
:deep(.el-tag) {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 报名按钮 */
:deep(.el-button--success) {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: none;
}
</style>
