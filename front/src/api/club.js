import request from '@/utils/request'

export const getClubs = (params) => {
  return request({
    url: '/clubs',
    method: 'get',
    params
  })
}

export const getClubById = (id) => {
  return request({
    url: `/clubs/${id}`,
    method: 'get'
  })
}

export const createClub = (data) => {
  return request({
    url: '/clubs',
    method: 'post',
    data
  })
}

export const updateClub = (id, data) => {
  return request({
    url: `/clubs/${id}`,
    method: 'put',
    data
  })
}

export const deleteClub = (id) => {
  return request({
    url: `/clubs/${id}`,
    method: 'delete'
  })
}

export const uploadLogo = (id, file) => {
  const formData = new FormData()
  formData.append('logo', file)
  return request({
    url: `/clubs/${id}/logo`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const getClubMembers = (id) => {
  return request({
    url: `/clubs/${id}/members`,
    method: 'get'
  })
}
