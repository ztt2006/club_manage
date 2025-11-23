<template>
  <div class="messages-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>站内消息</span>
          <el-button type="primary" @click="showSendDialog = true">
            <el-icon><Plus /></el-icon>
            发送消息
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="收件箱" name="received" />
        <el-tab-pane label="发件箱" name="sent" />
      </el-tabs>

      <el-table :data="messages" v-loading="loading" style="width: 100%">
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="activeTab === 'received'" :type="row.isRead ? '' : 'success'">
              {{ row.isRead ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="activeTab === 'received' ? '发件人' : '收件人'" width="150">
          <template #default="{ row }">
            {{ activeTab === 'received' ? row.sender?.realName : row.receiver?.realName }}
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="主题" />
        <el-table-column label="发送时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewMessage(row.id)">查看</el-button>
            <el-button text type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="fetchMessages"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 发送消息对话框 -->
    <el-dialog v-model="showSendDialog" title="发送消息" width="600px">
      <el-form :model="messageForm" label-width="100px">
        <el-form-item label="收件人ID">
          <el-input v-model="messageForm.receiverId" type="number" placeholder="输入用户ID" />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="messageForm.subject" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="messageForm.content" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSendDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSend">发送</el-button>
      </template>
    </el-dialog>

    <!-- 查看消息对话框 -->
    <el-dialog v-model="showViewDialog" title="消息详情" width="600px">
      <div v-if="currentMessage">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="发件人">
            {{ currentMessage.sender?.realName }}
          </el-descriptions-item>
          <el-descriptions-item label="收件人">
            {{ currentMessage.receiver?.realName }}
          </el-descriptions-item>
          <el-descriptions-item label="主题">
            {{ currentMessage.subject }}
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">
            {{ formatDate(currentMessage.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentMessage.isRead ? '' : 'success'">
              {{ currentMessage.isRead ? '已读' : '未读' }}
            </el-tag>
            <span v-if="currentMessage.readAt" style="margin-left: 10px">
              （{{ formatDate(currentMessage.readAt) }}）
            </span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="message-content">
          <h4>内容：</h4>
          <p>{{ currentMessage.content }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getReceivedMessages, getSentMessages, getMessageById, sendMessage, deleteMessage } from '@/api/message'
import { ElMessage, ElMessageBox } from 'element-plus'
import { format } from 'date-fns'

const activeTab = ref('received')
const loading = ref(false)
const showSendDialog = ref(false)
const showViewDialog = ref(false)
const messages = ref([])
const currentMessage = ref(null)

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const messageForm = reactive({
  receiverId: '',
  subject: '',
  content: ''
})

const fetchMessages = async () => {
  loading.value = true
  try {
    const fetchFunc = activeTab.value === 'received' ? getReceivedMessages : getSentMessages
    const response = await fetchFunc({
      page: pagination.page,
      limit: pagination.limit
    })
    if (response.success) {
      messages.value = response.data.messages
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
  }
}

const viewMessage = async (id) => {
  try {
    const response = await getMessageById(id)
    if (response.success) {
      currentMessage.value = response.data
      showViewDialog.value = true
      // 刷新列表（如果是收件箱且消息被标记为已读）
      if (activeTab.value === 'received') {
        fetchMessages()
      }
    }
  } catch (error) {
    console.error('Failed to view message:', error)
  }
}

const handleSend = async () => {
  try {
    const response = await sendMessage(messageForm)
    if (response.success) {
      ElMessage.success('消息发送成功')
      showSendDialog.value = false
      Object.assign(messageForm, {
        receiverId: '',
        subject: '',
        content: ''
      })
      if (activeTab.value === 'sent') {
        fetchMessages()
      }
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const response = await deleteMessage(id)
    if (response.success) {
      ElMessage.success('删除成功')
      fetchMessages()
    }
  }).catch(() => {})
}

const handleTabChange = () => {
  pagination.page = 1
  fetchMessages()
}

const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

onMounted(() => {
  fetchMessages()
})
</script>

<style scoped>
.messages-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-content {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.message-content h4 {
  margin-top: 0;
  color: #333;
}

.message-content p {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #666;
}
</style>
