import request from '@/utils/request'

export const getNotifications = (params) => {
  return request({
    url: '/notifications',
    method: 'get',
    params
  })
}

export const getUnreadCount = () => {
  return request({
    url: '/notifications/unread-count',
    method: 'get'
  })
}

export const markAsRead = (id) => {
  return request({
    url: `/notifications/${id}/read`,
    method: 'put'
  })
}

export const markAllAsRead = () => {
  return request({
    url: '/notifications/read-all',
    method: 'put'
  })
}

export const deleteNotification = (id) => {
  return request({
    url: `/notifications/${id}`,
    method: 'delete'
  })
}
