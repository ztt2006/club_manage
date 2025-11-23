import request from '@/utils/request'

export const getApplicationsByRecruitment = (recruitmentId) => {
  return request({
    url: `/applications/recruitment/${recruitmentId}`,
    method: 'get'
  })
}

export const getApplicationById = (id) => {
  return request({
    url: `/applications/${id}`,
    method: 'get'
  })
}

export const createApplication = (data) => {
  return request({
    url: '/applications',
    method: 'post',
    data
  })
}

export const reviewApplication = (id, data) => {
  return request({
    url: `/applications/${id}/review`,
    method: 'put',
    data
  })
}

export const deleteApplication = (id) => {
  return request({
    url: `/applications/${id}`,
    method: 'delete'
  })
}
