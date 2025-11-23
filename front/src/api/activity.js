import request from '@/utils/request'

export const getActivities = (params) => {
  return request({
    url: '/activities',
    method: 'get',
    params
  })
}

export const getActivityById = (id) => {
  return request({
    url: `/activities/${id}`,
    method: 'get'
  })
}

export const createActivity = (data) => {
  return request({
    url: '/activities',
    method: 'post',
    data
  })
}

export const updateActivity = (id, data) => {
  return request({
    url: `/activities/${id}`,
    method: 'put',
    data
  })
}

export const deleteActivity = (id) => {
  return request({
    url: `/activities/${id}`,
    method: 'delete'
  })
}

export const uploadCover = (id, file) => {
  const formData = new FormData()
  formData.append('cover', file)
  return request({
    url: `/activities/${id}/cover`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const registerActivity = (id) => {
  return request({
    url: `/activities/${id}/register`,
    method: 'post'
  })
}

export const checkinActivity = (id) => {
  return request({
    url: `/activities/${id}/checkin`,
    method: 'post'
  })
}

export const checkInActivity = (recordId) => {
  return request({
    url: `/activity-records/${recordId}/checkin`,
    method: 'put'
  })
}

export const cancelActivity = (id) => {
  return request({
    url: `/activities/${id}/cancel`,
    method: 'put'
  })
}

export const cancelRegistration = (recordId) => {
  return request({
    url: `/activity-records/${recordId}`,
    method: 'delete'
  })
}

export const getActivityParticipants = (id) => {
  return request({
    url: `/activities/${id}/participants`,
    method: 'get'
  })
}
