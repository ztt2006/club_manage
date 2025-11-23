import request from '@/utils/request'

export const getUsers = (params) => {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export const getUserById = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

export const updateUser = (id, data) => {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

export const deleteUser = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

export const updateUserStatus = (id, status) => {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export const updateUserRole = (id, role) => {
  return request({
    url: `/users/${id}/role`,
    method: 'put',
    data: { role }
  })
}

export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return request({
    url: '/users/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
