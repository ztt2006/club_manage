import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { roles: ['ADMIN', 'SUPER_ADMIN'] }
      },
      {
        path: 'clubs',
        name: 'Clubs',
        component: () => import('@/views/Clubs.vue')
      },
      {
        path: 'clubs/:id',
        name: 'ClubDetail',
        component: () => import('@/views/ClubDetail.vue')
      },
      {
        path: 'my-clubs',
        name: 'MyClubs',
        component: () => import('@/views/MyClubs.vue')
      },
      {
        path: 'activities',
        name: 'Activities',
        component: () => import('@/views/Activities.vue')
      },
      {
        path: 'activities/:id',
        name: 'ActivityDetail',
        component: () => import('@/views/ActivityDetail.vue')
      },
      {
        path: 'recruitments',
        name: 'Recruitments',
        component: () => import('@/views/Recruitments.vue')
      },
      {
        path: 'recruitments/:id',
        name: 'RecruitmentDetail',
        component: () => import('@/views/RecruitmentDetail.vue')
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/Statistics.vue'),
        meta: { roles: ['ADMIN', 'SUPER_ADMIN'] }
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/Notifications.vue')
      },
      {
        path: 'announcements',
        name: 'Announcements',
        component: () => import('@/views/Announcements.vue')
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/Messages.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const requiredRoles = to.meta.roles

  if (requiresAuth && !userStore.token) {
    next('/login')
  } else if (requiredRoles && !requiredRoles.includes(userStore.user?.role)) {
    next('/dashboard')
  } else if (to.path === '/login' && userStore.token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
