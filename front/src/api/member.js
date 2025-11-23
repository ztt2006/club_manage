import request from '@/utils/request'

export const addMember = (data) => {
  return request({
    url: '/members',
    method: 'post',
    data
  })
}

export const removeMember = (id) => {
  return request({
    url: `/members/${id}`,
    method: 'delete'
  })
}

export const updateMemberRole = (id, role) => {
  return request({
    url: `/members/${id}/role`,
    method: 'put',
    data: { role }
  })
}

export const updateMemberStatus = (id, status) => {
  return request({
    url: `/members/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export const getMyClubs = () => {
  return request({
    url: '/members/my-clubs',
    method: 'get'
  })
}
