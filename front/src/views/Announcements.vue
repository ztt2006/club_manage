<template>
  <div class="announcements-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公告列表</span>
          <el-button v-if="isAdmin" type="primary" @click="showDialog = true">
            <el-icon><Plus /></el-icon>
            发布公告
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-select v-model="searchForm.type" placeholder="公告类型" clearable>
            <el-option label="系统公告" value="SYSTEM" />
            <el-option label="社团公告" value="CLUB" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchAnnouncements">查询</el-button>
        </el-form-item>
      </el-form>

      <el-timeline>
        <el-timeline-item
          v-for="item in announcements"
          :key="item.id"
          :timestamp="formatDate(item.createdAt)"
          placement="top"
        >
          <el-card :class="{ 'pinned-announcement': item.isPinned }">
            <div class="announcement-header">
              <el-tag :type="item.type === 'SYSTEM' ? 'danger' : 'primary'" size="small">
                {{ item.type === 'SYSTEM' ? '系统公告' : '社团公告' }}
              </el-tag>
              <el-tag v-if="item.isPinned" type="warning" size="small">
                <el-icon><Star /></el-icon>
                置顶
              </el-tag>
              <el-tag :type="getPriorityType(item.priority)" size="small">
                {{ getPriorityText(item.priority) }}
              </el-tag>
            </div>
            <h3>{{ item.title }}</h3>
            <p class="content">{{ item.content }}</p>
            <div class="announcement-footer">
              <span class="creator">发布者：{{ item.creator?.realName }}</span>
              <span v-if="item.club" class="club">社团：{{ item.club.name }}</span>
              <div v-if="isAdmin" class="actions">
                <el-button text type="danger" size="small" @click="handleDelete(item.id)">
                  删除
                </el-button>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="fetchAnnouncements"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 创建公告对话框 -->
    <el-dialog v-model="showDialog" title="发布公告" width="600px">
      <el-form :model="announcementForm" label-width="100px">
        <el-form-item label="公告类型">
          <el-radio-group v-model="announcementForm.type">
            <el-radio label="SYSTEM">系统公告</el-radio>
            <el-radio label="CLUB">社团公告</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="announcementForm.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="announcementForm.content" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="announcementForm.priority">
            <el-option label="低" value="LOW" />
            <el-option label="普通" value="NORMAL" />
            <el-option label="高" value="HIGH" />
            <el-option label="紧急" value="URGENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="announcementForm.isPinned" />
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
import { useUserStore } from '@/stores/user'
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/api/announcement'
import { ElMessage, ElMessageBox } from 'element-plus'
import { format } from 'date-fns'

const userStore = useUserStore()
const showDialog = ref(false)
const announcements = ref([])

const isAdmin = computed(() => ['ADMIN', 'SUPER_ADMIN'].includes(userStore.user?.role))

const searchForm = reactive({
  type: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const announcementForm = reactive({
  title: '',
  content: '',
  type: 'SYSTEM',
  priority: 'NORMAL',
  isPinned: false
})

const fetchAnnouncements = async () => {
  try {
    const response = await getAnnouncements({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    })
    if (response.success) {
      announcements.value = response.data.announcements
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
  }
}

const handleCreate = async () => {
  try {
    const response = await createAnnouncement(announcementForm)
    if (response.success) {
      ElMessage.success('公告发布成功')
      showDialog.value = false
      Object.assign(announcementForm, {
        title: '',
        content: '',
        type: 'SYSTEM',
        priority: 'NORMAL',
        isPinned: false
      })
      fetchAnnouncements()
    }
  } catch (error) {
    console.error('Failed to create announcement:', error)
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条公告吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const response = await deleteAnnouncement(id)
    if (response.success) {
      ElMessage.success('删除成功')
      fetchAnnouncements()
    }
  }).catch(() => {})
}

const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

const getPriorityType = (priority) => {
  const typeMap = {
    LOW: 'info',
    NORMAL: '',
    HIGH: 'warning',
    URGENT: 'danger'
  }
  return typeMap[priority]
}

const getPriorityText = (priority) => {
  const textMap = {
    LOW: '低',
    NORMAL: '普通',
    HIGH: '高',
    URGENT: '紧急'
  }
  return textMap[priority]
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.announcements-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pinned-announcement {
  border-left: 3px solid #e6a23c;
}

.announcement-header {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.content {
  white-space: pre-wrap;
  line-height: 1.6;
  margin: 15px 0;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #666;
}

.actions {
  display: flex;
  gap: 10px;
}
</style>
