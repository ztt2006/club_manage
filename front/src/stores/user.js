import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, register as apiRegister, getProfile } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser) => {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const login = async (credentials) => {
    const response = await apiLogin(credentials)
    if (response.success) {
      setToken(response.data.token)
      setUser(response.data.user)
    }
    return response
  }

  const register = async (userData) => {
    return await apiRegister(userData)
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const fetchProfile = async () => {
    const response = await getProfile()
    if (response.success) {
      setUser(response.data)
    }
    return response
  }

  return {
    token,
    user,
    login,
    register,
    logout,
    fetchProfile,
    setUser
  }
})
