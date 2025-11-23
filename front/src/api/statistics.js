import request from '@/utils/request'

export const getOverviewStats = () => {
  return request({
    url: '/statistics/overview',
    method: 'get'
  })
}

export const getClubStats = () => {
  return request({
    url: '/statistics/clubs',
    method: 'get'
  })
}

export const getActivityStats = () => {
  return request({
    url: '/statistics/activities',
    method: 'get'
  })
}

export const getUserStats = () => {
  return request({
    url: '/statistics/users',
    method: 'get'
  })
}

export const getRecruitmentStats = () => {
  return request({
    url: '/statistics/recruitments',
    method: 'get'
  })
}
