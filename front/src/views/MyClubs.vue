                            <template>
  <div class="my-clubs-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的社团</span>
          <el-button type="primary" @click="showJoinDialog = true">
            <el-icon><Plus /></el-icon>
            加入社团
          </el-button>
        </div>
      </template>

      <el-empty v-if="clubs.length === 0" description="您还未加入任何社团">
        <el-button type="primary" @click="showJoinDialog = true">立即加入</el-button>
      </el-empty>

      <el-table 
        v-else 
        :data="clubs" 
        v-loading="loading" 
        stripe
        style="width: 100%"
        :header-cell-style="{backgroundColor: 'transparent', color: '#fff'}"
      >
        <el-table-column prop="club.name" label="社团名称" />
        <el-table-column prop="club.category" label="分类" width="100" />
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
        <el-table-column label="成员数" width="100">
          <template #default="{ row }">
            {{ row.club._count?.members || 0 }} / {{ row.club.maxMembers }}
          </template>
        </el-table-column>
        <el-table-column label="社团状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.club.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.club.status === 'ACTIVE' ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row.clubId)">
              查看详情
            </el-button>
            <el-button 
              v-if="row.role !== 'PRESIDENT'" 
              text 
              type="danger" 
              @click="handleExit(row.id)"
            >
              退出社团
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 加入社团对话框 -->
    <el-dialog v-model="showJoinDialog" title="加入社团" width="700px">
      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-input v-model="searchKeyword" placeholder="搜索社团名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchAvailableClubs">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table 
        :data="availableClubs" 
        v-loading="clubsLoading" 
        stripe
        max-height="400"
        :header-cell-style="{backgroundColor: 'transparent', color: '#fff'}"
      >
        <el-table-column prop="name" label="社团名称" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="成员" width="100">
          <template #default="{ row }">
            {{ row._count?.members || 0 }} / {{ row.maxMembers }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="简介" show-overflow-tooltip />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button 
              text 
              type="primary" 
              @click="handleJoin(row.id)"
              :disabled="isAlreadyMember(row.id) || row._count?.members >= row.maxMembers"
            >
              {{ isAlreadyMember(row.id) ? '已加入' : row._count?.members >= row.maxMembers ? '已满' : '加入' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMyClubs, addMember, removeMember } from '@/api/member'
import { getClubs } from '@/api/club'
import { ElMessage, ElMessageBox } from 'element-plus'
import { format } from 'date-fns'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const clubsLoading = ref(false)
const showJoinDialog = ref(false)
const clubs = ref([])
const availableClubs = ref([])
const searchKeyword = ref('')

const fetchClubs = async () => {
  loading.value = true
  try {
    const response = await getMyClubs()
    if (response.success) {
      clubs.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch my clubs:', error)
  } finally {
    loading.value = false
  }
}

const searchAvailableClubs = async () => {
  clubsLoading.value = true
  try {
    const response = await getClubs({
      search: searchKeyword.value,
      status: 'ACTIVE',
      limit: 50
    })
    if (response.success) {
      availableClubs.value = response.data.clubs
    }
  } catch (error) {
    console.error('Failed to fetch available clubs:', error)
  } finally {
    clubsLoading.value = false
  }
}

const isAlreadyMember = (clubId) => {
  return clubs.value.some(item => item.clubId === clubId)
}

const handleJoin = async (clubId) => {
  try {
    const response = await addMember({
      clubId,
      userId: userStore.user.id,
      role: 'MEMBER'
    })
    if (response.success) {
      ElMessage.success('加入社团成功')
      showJoinDialog.value = false
      await fetchClubs()
    }
  } catch (error) {
    console.error('Failed to join club:', error)
  }
}

const handleExit = (memberId) => {
  ElMessageBox.confirm('确定要退出这个社团吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await removeMember(memberId)
      if (response.success) {
        ElMessage.success('已退出社团')
        await fetchClubs()
      }
    } catch (error) {
      console.error('Failed to exit club:', error)
    }
  }).catch(() => {})
}

const viewDetail = (id) => {
  router.push(`/clubs/${id}`)
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
  fetchClubs()
})
</script>

<style scoped>
@import '@/styles/table.css';

.my-clubs-page {
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

/* 空状态优化 */
:deep(.el-empty) {
  padding: 60px 0;
}

:deep(.el-empty__description) {
  font-size: 16px;
  color: #909399;
}

/* 角色徽章 */
:deep(.el-tag) {
  margin: 0 4px;
}
</style>
