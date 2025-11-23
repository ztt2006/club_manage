<template>
  <div class="recruitment-detail-page">
    <!-- 招新详情 -->
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ recruitment.title }}</span>
          <div>
            <el-button v-if="canManage" type="warning" @click="handleStatusChange">
              {{ recruitment.status === 'OPEN' ? '关闭招新' : '开启招新' }}
            </el-button>
            <el-button @click="$router.back()">返回</el-button>
          </div>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标题">{{ recruitment.title }}</el-descriptions-item>
        <el-descriptions-item label="社团">
          <el-link type="primary" @click="$router.push(`/clubs/${recruitment.club?.id}`)">
            {{ recruitment.club?.name }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="招新名额">{{ recruitment.positions }}</el-descriptions-item>
        <el-descriptions-item label="当前申请数">
          <el-tag type="success">{{ recruitment.applications?.length || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="recruitment.status === 'OPEN' ? 'success' : 'info'">
            {{ getStatusText(recruitment.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="招新时间">
          {{ formatDate(recruitment.startDate) }} ~ {{ formatDate(recruitment.endDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">
          <div class="content">{{ recruitment.description }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="要求" :span="2">
          <div class="content">{{ recruitment.requirements }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 申请按钮 -->
      <div v-if="recruitment.status === 'OPEN' && !canManage" class="apply-section">
        <el-button type="primary" size="large" @click="showApplyDialog = true">
          <el-icon><Plus /></el-icon>
          立即申请
        </el-button>
      </div>
    </el-card>

    <!-- 申请列表（管理员可见） -->
    <el-card v-if="canManage" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>申请列表 ({{ applications.length }})</span>
          <el-radio-group v-model="filterStatus" size="small" @change="filterApplications">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="PENDING">待审核</el-radio-button>
            <el-radio-button label="APPROVED">已通过</el-radio-button>
            <el-radio-button label="REJECTED">已拒绝</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table 
        :data="filteredApplications" 
        stripe
        style="width: 100%"
        :header-cell-style="{backgroundColor: 'transparent', color: '#fff'}"
        :empty-text="暂无申请记录"
      >
        <el-table-column prop="applicantName" label="姓名" width="120" />
        <el-table-column prop="applicantEmail" label="邮箱" width="200" />
        <el-table-column prop="applicantPhone" label="手机号" width="150" />
        <el-table-column prop="reason" label="申请理由" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getApplicationStatusType(row.status)">
              {{ getApplicationStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'PENDING'" 
              text 
              type="success" 
              size="small"
              @click="handleReview(row.id, 'APPROVED')"
            >
              通过
            </el-button>
            <el-button 
              v-if="row.status === 'PENDING'" 
              text 
              type="danger" 
              size="small"
              @click="showRejectDialog(row)"
            >
              拒绝
            </el-button>
            <el-button 
              text 
              type="primary" 
              size="small"
              @click="viewApplication(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 申请表单对话框 -->
    <el-dialog v-model="showApplyDialog" title="提交申请" width="600px">
      <el-form :model="applicationForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="applicantName">
          <el-input v-model="applicationForm.applicantName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="applicantEmail">
          <el-input v-model="applicationForm.applicantEmail" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="手机号" prop="applicantPhone">
          <el-input v-model="applicationForm.applicantPhone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="申请理由" prop="reason">
          <el-input 
            v-model="applicationForm.reason" 
            type="textarea" 
            :rows="5" 
            placeholder="请说明您为什么想加入该社团，以及您的特长和优势"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApplyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleApply" :loading="submitting">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝理由对话框 -->
    <el-dialog v-model="showRejectDialogVisible" title="拒绝申请" width="500px">
      <el-form label-width="100px">
        <el-form-item label="拒绝理由">
          <el-input 
            v-model="rejectNote" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入拒绝理由（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 申请详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="申请详情" width="600px">
      <el-descriptions v-if="currentApplication" :column="1" border>
        <el-descriptions-item label="姓名">{{ currentApplication.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentApplication.applicantEmail }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentApplication.applicantPhone }}</el-descriptions-item>
        <el-descriptions-item label="申请理由">
          <div class="content">{{ currentApplication.reason }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getApplicationStatusType(currentApplication.status)">
            {{ getApplicationStatusText(currentApplication.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">
          {{ formatDate(currentApplication.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentApplication.reviewedAt" label="审核时间">
          {{ formatDate(currentApplication.reviewedAt) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentApplication.reviewNote" label="审核备注">
          <div class="content">{{ currentApplication.reviewNote }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getRecruitmentById, updateRecruitmentStatus } from '@/api/recruitment'
import { getApplicationsByRecruitment, createApplication, reviewApplication } from '@/api/application'
import { ElMessage, ElMessageBox } from 'element-plus'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const submitting = ref(false)
const recruitment = ref({})
const applications = ref([])
const filteredApplications = ref([])
const filterStatus = ref('')
const showApplyDialog = ref(false)
const showRejectDialogVisible = ref(false)
const showDetailDialog = ref(false)
const currentApplication = ref(null)
const rejectNote = ref('')
const currentRejectId = ref(null)
const formRef = ref()

const canManage = computed(() => {
  return ['ADMIN', 'SUPER_ADMIN'].includes(userStore.user?.role)
})

const applicationForm = ref({
  applicantName: userStore.user?.realName || '',
  applicantEmail: userStore.user?.email || '',
  applicantPhone: userStore.user?.phone || '',
  reason: ''
})

const rules = {
  applicantName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  applicantEmail: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  applicantPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 20, message: '申请理由至少20个字符', trigger: 'blur' }
  ]
}

const fetchRecruitmentDetail = async () => {
  loading.value = true
  try {
    const response = await getRecruitmentById(route.params.id)
    if (response.success) {
      recruitment.value = response.data
      if (canManage.value) {
        await fetchApplications()
      }
    }
  } catch (error) {
    console.error('Failed to fetch recruitment detail:', error)
  } finally {
    loading.value = false
  }
}

const fetchApplications = async () => {
  try {
    const response = await getApplicationsByRecruitment(route.params.id)
    if (response.success) {
      applications.value = response.data
      filterApplications()
    }
  } catch (error) {
    console.error('Failed to fetch applications:', error)
  }
}

const filterApplications = () => {
  if (filterStatus.value) {
    filteredApplications.value = applications.value.filter(
      app => app.status === filterStatus.value
    )
  } else {
    filteredApplications.value = applications.value
  }
}

const handleApply = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const response = await createApplication({
          recruitmentId: route.params.id,
          ...applicationForm.value
        })
        if (response.success) {
          ElMessage.success('申请提交成功，请等待审核')
          showApplyDialog.value = false
          applicationForm.value.reason = ''
        }
      } catch (error) {
        console.error('Failed to submit application:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleReview = async (id, status) => {
  try {
    const response = await reviewApplication(id, { status })
    if (response.success) {
      ElMessage.success(status === 'APPROVED' ? '已通过申请' : '已拒绝申请')
      await fetchApplications()
    }
  } catch (error) {
    console.error('Failed to review application:', error)
  }
}

const showRejectDialog = (row) => {
  currentRejectId.value = row.id
  rejectNote.value = ''
  showRejectDialogVisible.value = true
}

const confirmReject = async () => {
  try {
    const response = await reviewApplication(currentRejectId.value, {
      status: 'REJECTED',
      reviewNote: rejectNote.value
    })
    if (response.success) {
      ElMessage.success('已拒绝申请')
      showRejectDialogVisible.value = false
      await fetchApplications()
    }
  } catch (error) {
    console.error('Failed to reject application:', error)
  }
}

const viewApplication = (row) => {
  currentApplication.value = row
  showDetailDialog.value = true
}

const handleStatusChange = async () => {
  const newStatus = recruitment.value.status === 'OPEN' ? 'CLOSED' : 'OPEN'
  const action = newStatus === 'OPEN' ? '开启' : '关闭'
  
  ElMessageBox.confirm(`确定要${action}招新吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await updateRecruitmentStatus(route.params.id, newStatus)
      if (response.success) {
        ElMessage.success(`${action}成功`)
        await fetchRecruitmentDetail()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }).catch(() => {})
}

const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd')
}

const getStatusText = (status) => {
  const statusMap = {
    OPEN: '招新中',
    CLOSED: '已关闭',
    DRAFT: '草稿'
  }
  return statusMap[status] || status
}

const getApplicationStatusType = (status) => {
  const typeMap = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return typeMap[status]
}

const getApplicationStatusText = (status) => {
  const textMap = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
  }
  return textMap[status] || status
}

onMounted(() => {
  fetchRecruitmentDetail()
})
</script>

<style scoped>
@import '@/styles/table.css';

.recruitment-detail-page {
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

.apply-section {
  margin-top: 30px;
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.apply-section .el-button {
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.apply-section .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.4);
}

/* 申请列表美化 */
:deep(.el-table) {
  margin-top: 10px;
}

/* 状态徽章 */
:deep(.el-tag) {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 描述列表 */
:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
