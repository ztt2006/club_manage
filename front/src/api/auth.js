import request from '@/utils/request'

export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export const register = (data) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

export const getProfile = () => {
  return request({
    url: '/auth/profile',
    method: 'get'
  })
}

export const updateProfile = (data) => {
  return request({
    url: '/auth/profile',
    method: 'put',
    data
  })
}

export const changePassword = (data) => {
  return request({
    url: '/auth/change-password',
    method: 'put',
    data
  })
}

export const uploadAvatar = (formData) => {
  return request({
    url: '/users/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
