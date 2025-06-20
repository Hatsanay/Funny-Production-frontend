import DefaultLayout from '@/layouts/DefaultLayout';
import { createRouter, createWebHistory } from 'vue-router'; // เปลี่ยนเป็น createWebHistory
import userDasboard from '../views/dashboard/Dashboard.vue';




import CreateQueueGraphicView from '../views/queue/CreateQueueGraphicView.vue';
import DeleteQueueGraphicView from '../views/queue/DeleteQueueGraphicView.vue';
import EditQueueGraphicView from '../views/queue/EditQueueGraphicView.vue';
import HistoryQueueGraphicView from '../views/queue/HistoryQueueGraphicView.vue';
import queueView from '../views/queue/queueView.vue';
import { clearToken, hasPermission, isAuthenticated } from './auth';





const routes = [
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    redirect: '/login', // Redirect ไปหน้า Login
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        meta: { permission: 'home', requiresAuth: true },
        component: userDasboard,
      },

      {
        path: '/queue',
        name: 'queue',
        meta: { permission: 'queueView', requiresAuth: true },
        component: queueView,
      },

      {
        path: '/CreateQueueGraphic',
        name: 'CreateQueueGraphic',
        meta: { permission: 'CreateQueueGraphic', requiresAuth: true },
        component: CreateQueueGraphicView,
      },

      {
        path: '/EditQueueGraphic',
        name: 'EditQueueGraphic',
        meta: { permission: 'EditQueueGraphic', requiresAuth: true },
        component: EditQueueGraphicView,
      },
      {
        path: '/DeleteQueueGraphic',
        name: 'DeleteQueueGraphic',
        meta: { permission: 'DeleteQueueGraphic', requiresAuth: true },
        component: DeleteQueueGraphicView,
      },

      {
        path: '/HistoryQueueGraphic',
        name: 'HistoryQueueGraphic',
        meta: { permission: 'HistoryQueueGraphic', requiresAuth: true },
        component: HistoryQueueGraphicView,
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login/Login.vue'),
  },

  {
    path: '/:pathMatch(.*)*', // จัดการเส้นทางที่ไม่ตรงกับอะไรเลย
    redirect: '/login', // Redirect ไปหน้า Login
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // ใช้ createWebHistory เพื่อลิงค์สะอาด
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    clearToken()
  }

  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else if (to.meta.permission && isAuthenticated()) {
    if (hasPermission(to.meta.permission)) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router