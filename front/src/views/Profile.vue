<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <!-- 头像卡片 -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="avatar-card">
          <template #header>
            <span>个人头像</span>
          </template>
          <div class="avatar-container">
            <el-avatar :size="150" :src="avatarUrl" class="avatar-display">
              <el-icon :size="60"><UserFilled /></el-icon>
            </el-avatar>
            <div class="avatar-actions">
              <el-upload
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
                :http-request="handleUpload"
                accept="image/*"
              >
                <el-button type="primary" :loading="uploading">
                  <el-icon><Upload /></el-icon>
                  {{ uploading ? '上传中...' : '更换头像' }}
                </el-button>
              </el-upload>
              <div class="upload-tips">
                <p>支持 JPG、PNG、GIF</p>
                <p>文件大小不超过 2MB</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="16">
        <el-card>
          <template #header>
            <span>个人信息</span>
          </template>
          <el-form :model="form" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="form.username" disabled />
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="form.realName" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="角色">
              <el-tag>{{ getRoleText(form.role) }}</el-tag>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdate">更新信息</el-button>
              <el-button @click="showPasswordDialog = true">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateProfile, uploadAvatar, changePassword } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { UserFilled, Upload } from '@element-plus/icons-vue'

const userStore = useUserStore()
const passwordFormRef = ref(null)
const uploading = ref(false)
const showPasswordDialog = ref(false)

const form = reactive({
  username: '',
  realName: '',
  email: '',
  phone: '',
  role: '',
  avatar: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const avatarUrl = computed(() => {
  if (form.avatar) {
    // 如果是完整URL，直接使用
    if (form.avatar.startsWith('http')) {
      return form.avatar
    }
    // 否则拼接后端地址
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${form.avatar}`
  }
  return ''
})

const handleUpdate = async () => {
  try {
    const response = await updateProfile(form)
    if (response.success) {
      ElMessage.success('更新成功')
      userStore.setUser(response.data)
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
  }
}

const getRoleText = (role) => {
  const roleMap = {
    'SUPER_ADMIN': '超级管理员',
    'ADMIN': '管理员',
    'USER': '普通用户',
    'PRESIDENT': '社长',
    'VICE_PRESIDENT': '副社长',
    'MANAGER': '管理员',
    'MEMBER': '成员'
  }
  return roleMap[role] || role
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const handleUpload = async ({ file }) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await uploadAvatar(formData)
    if (response.success) {
      ElMessage.success('头像上传成功')
      // 更新本地表单数据
      form.avatar = response.data.avatar
      // 更新用户store（完整用户信息）
      userStore.setUser(response.data)
      // 打印确认更新
      console.log('头像已更新:', response.data.avatar)
    }
  } catch (error) {
    console.error('Failed to upload avatar:', error)
    ElMessage.error('头像上传失败')
  } finally {
    uploading.value = false
  }
}

const handleAvatarSuccess = () => {
  // 由 handleUpload 处理
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        if (response.success) {
          ElMessage.success('密码修改成功，请重新登录')
          showPasswordDialog.value = false
          // 清空表单
          passwordForm.oldPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''
          // 可以选择自动登出
          setTimeout(() => {
            userStore.logout()
          }, 1500)
        }
      } catch (error) {
        console.error('Failed to change password:', error)
      }
    }
  })
}

onMounted(async () => {
  await userStore.fetchProfile()
  Object.assign(form, userStore.user)
})
</script>

<style scoped>
@import '@/styles/table.css';

.profile-page {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.avatar-card {
  text-align: center;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-display {
  margin-bottom: 30px;
  border: 4px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-display:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.avatar-actions {
  width: 100%;
}

.avatar-actions .el-button {
  width: 100%;
  margin-bottom: 15px;
}

.upload-tips {
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
  margin-top: 10px;
}

.upload-tips p {
  margin: 4px 0;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .avatar-card {
    margin-bottom: 20px;
  }
}
</style>
