import request from '@/utils/request'

export const getComments = (params) => {
  return request({
    url: '/comments',
    method: 'get',
    params
  })
}

export const getAverageRating = (params) => {
  return request({
    url: '/comments/rating',
    method: 'get',
    params
  })
}

export const createComment = (data) => {
  return request({
    url: '/comments',
    method: 'post',
    data
  })
}

export const updateComment = (id, data) => {
  return request({
    url: `/comments/${id}`,
    method: 'put',
    data
  })
}

export const deleteComment = (id) => {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  })
}
