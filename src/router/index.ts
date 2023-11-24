import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user.store';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/verification/:idname/:idtoken',
    component: () => import('@/views/EmailVerif.vue'),
    props: true,
  },
  {
    path: '/tournament',
    component: () => import('@/views/Tournament.vue'),
  },
  {
    path: '/info',
    component: () => import('@/views/Informations.vue'),
  },
  {
    path: '/association',
    component: () => import('@/views/Association.vue'),
  },
  {
    path: '/eat',
    component: () => import('@/views/Eat.vue'),
  },
  {
    path: '/me',
    component: () => import('@/views/Me.vue'),
    beforeEnter: () => {
      const { isConnected } = useUserStore();
      return !isConnected ? { path: '/register' } : true;
    },
  },
  {
    path: '/tournament/:id(\\d+)/register',
    component: () => import('@/views/TournamentRegister.vue'),
    props: (route) => ({ id: Number(route.params.id) }),
    beforeEnter: () => {
      const { isConnected } = useUserStore();
      return !isConnected ? { path: '/register' } : true;
    },
  },
  {
    path: '/register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/tournament/:id(\\d+)',
    component: () => import('@/views/TournamentDetail.vue'),
    props: (route) => ({ id: Number(route.params.id), section: route.query }),
  },
  {
    path: '/reset-password/:idname/:idtoken',
    component: () => import('@/views/ResetPassword.vue'),
    props: true,
  },
  {
    path: '/logout',
    component: () => import('@/views/Logout.vue'),
  },
  {
    path: '/pay/return',
    component: () => import('@/views/ReturnPayment.vue'),
    props: (route) => ({ status: route.query }),
    beforeEnter: () => {
      const { isConnected } = useUserStore();
      return !isConnected ? { path: '/register' } : true;
    },
  },
  {
    path: '/ticket/scan',
    component: () => import('@/views/ScanQrCode.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFound.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});
