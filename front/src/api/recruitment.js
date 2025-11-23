import request from '@/utils/request'

export const getRecruitments = (params) => {
  return request({
    url: '/recruitments',
    method: 'get',
    params
  })
}

export const getRecruitmentById = (id) => {
  return request({
    url: `/recruitments/${id}`,
    method: 'get'
  })
}

export const createRecruitment = (data) => {
  return request({
    url: '/recruitments',
    method: 'post',
    data
  })
}

export const updateRecruitment = (id, data) => {
  return request({
    url: `/recruitments/${id}`,
    method: 'put',
    data
  })
}

export const deleteRecruitment = (id) => {
  return request({
    url: `/recruitments/${id}`,
    method: 'delete'
  })
}

export const updateRecruitmentStatus = (id, status) => {
  return request({
    url: `/recruitments/${id}/status`,
    method: 'put',
    data: { status }
  })
}
