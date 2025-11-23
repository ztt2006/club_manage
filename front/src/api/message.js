import request from '@/utils/request'

export const getReceivedMessages = (params) => {
  return request({
    url: '/messages/received',
    method: 'get',
    params
  })
}

export const getSentMessages = (params) => {
  return request({
    url: '/messages/sent',
    method: 'get',
    params
  })
}

export const getUnreadCount = () => {
  return request({
    url: '/messages/unread-count',
    method: 'get'
  })
}

export const getMessageById = (id) => {
  return request({
    url: `/messages/${id}`,
    method: 'get'
  })
}

export const sendMessage = (data) => {
  return request({
    url: '/messages',
    method: 'post',
    data
  })
}

export const deleteMessage = (id) => {
  return request({
    url: `/messages/${id}`,
    method: 'delete'
  })
}
