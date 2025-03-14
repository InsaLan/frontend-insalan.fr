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
    component: () => import('@/views/Tournament/Tournament.vue'),
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
    path: '/schedule',
    component: () => import('@/views/Schedule.vue'),
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
    component: () => import('@/views/Tournament/TournamentRegister.vue'),
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
    component: () => import('@/views/Tournament/TournamentDetail.vue'),
    props: (route) => ({ id: Number(route.params.id) }),
    children: [
      {
        path: '',
        component: () => import('@/components/Tournament/TournamentInfo.vue'),
        // redirect: (to) => `${to.fullPath}/info`,
        name: 'tournament_info',
      },
      {
        path: 'info',
        redirect: { name: 'tournament_info' },
        // component: () => import('@/components/TournamentInfo.vue'),
        // name: 'tournament_info',
      },
      {
        path: 'teams',
        component: () => import('@/components/Tournament/TournamentTeams.vue'),
        name: 'tournament_teams',
      },
      {
        path: 'seatings',
        component: () => import('@/components/Tournament/TournamentSeating.vue'),
        name: 'tournament_seatings',
      },
      {
        path: 'groups',
        component: () => import('@/components/Tournament/TournamentGroups.vue'),
        name: 'tournament_groups',
      },
      {
        path: 'swiss',
        component: () => import('@/components/Tournament/TournamentSwiss.vue'),
        name: 'tournament_swiss',
      },
      {
        path: 'brackets',
        component: () => import('@/components/Tournament/TournamentBrackets.vue'),
        name: 'tournament_brackets',
      },
      {
        path: 'planning',
        component: () => import('@/components/Tournament/TournamentPlanning.vue'),
        name: 'tournament_planning',
      },
      {
        path: 'rules',
        component: () => import('@/components/Tournament/TournamentRules.vue'),
        name: 'tournament_rules',
      },
      {
        path: 'admin',
        beforeEnter: () => {
          const { isConnected, user } = useUserStore();
          return (!isConnected || !user.groups.includes('Equipe Tournois')) ? { path: '/' } : true;
        },
        children: [
          {
            path: '',
            component: () => import('@/components/Tournament/TournamentInfo.vue'),
            name: 'tournament_admin_info',
          },
          {
            path: 'info',
            redirect: { name: 'tournament_admin_info' },
          },
          {
            path: 'teams',
            component: () => import('@/components/Tournament/Admin/TournamentAdminTeams.vue'),
            name: 'tournament_admin_teams',
          },
          {
            path: 'seatings',
            component: () => import('@/components/Tournament/TournamentSeating.vue'),
            name: 'tournament_admin_seatings',
          },
          {
            path: 'groups',
            children: [
              {
                path: '',
                component: () => import('@/components/Tournament/Admin/TournamentAdminGroups.vue'),
                name: 'tournament_admin_groups',
              },
              {
                path: 'matchs',
                component: () => import('@/components/Tournament/Admin/TournamentAdminGroupsMatchs.vue'),
                name: 'tournament_admin_groups-matchs',
              },
            ],
          },
          {
            path: 'swiss',
            component: () => import('@/components/Tournament/Admin/TournamentAdminSwiss.vue'),
            name: 'tournament_admin_swiss',
          },
          {
            path: 'brackets',
            component: () => import('@/components/Tournament/Admin/TournamentAdminBrackets.vue'),
            name: 'tournament_admin_brackets',
          },
          {
            path: 'planning',
            component: () => import('@/components/Tournament/TournamentPlanning.vue'),
            name: 'tournament_admin_planning',
          },
          {
            path: 'rules',
            component: () => import('@/components/Tournament/TournamentRules.vue'),
            name: 'tournament_admin_rules',
          },
        ],
      },
    ],
  },
  {
    path: '/tournament/:id(\\d+)/team/:teamId(\\d+)',
    component: () => import('@/views/TeamDetail.vue'),
    props: (route) => ({ id: Number(route.params.id), teamId: Number(route.params.teamId) }),
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
    path: '/admin/scan',
    component: () => import('@/views/ScanQrCode.vue'),
    beforeEnter: () => {
      const { isConnected, user } = useUserStore();
      return (
        !isConnected
        || (!user.is_superuser && !user.is_staff)
        // Restrict route from loading on desktop
        || window.innerWidth > 768
      ) ? { path: '/' } : true;
    },
  },
  {
    path: '/admin/pizza',
    component: () => import('@/views/AdminPizza/AdminPizza.vue'),
    beforeEnter: () => {
      const { isConnected, user } = useUserStore();
      return (!isConnected || !user.groups.includes('Equipe Bouffe')) ? { path: '/' } : true;
    },
  },
  {
    path: '/admin/pizza/list',
    component: () => import('@/views/AdminPizza/AdminPizzaList.vue'),
    beforeEnter: () => {
      const { isConnected, user } = useUserStore();
      return (!isConnected || !user.groups.includes('Equipe Bouffe')) ? { path: '/' } : true;
    },
  },
  {
    path: '/admin/pizza/export/list',
    component: () => import('@/views/AdminPizza/AdminPizzaExportList.vue'),
    beforeEnter: () => {
      const { isConnected, user } = useUserStore();
      return (!isConnected || !user.groups.includes('Equipe Bouffe')) ? { path: '/' } : true;
    },
  },
  {
    path: '/archives',
    component: () => import('@/views/Archives.vue'),
  },
  {
    path: '/cart',
    component: () => import('@/views/Cart.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFound.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});
