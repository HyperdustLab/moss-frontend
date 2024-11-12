import { createRouter, createWebHashHistory, createWebHistory, type RouteRecordRaw } from 'vue-router'
import useI18n from '@/lang/index'

const lang = localStorage.getItem('lang') || 'en-us'

const Layouts = () => import('@/layouts/index.vue')

const { t } = useI18n.global

/** 常驻路由 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layouts,
    meta: {
      hidden: true,
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      hidden: true,
    },
  },
  {
    path: '/invite/:walletAddress',
    component: () => import('@/views/dashboard/invite.vue'),
    name: 'invite',
    meta: {
      hidden: true,
      name: 'invite',
    },
  },

  {
    path: '/inviteSuccess/:walletAddress',
    component: () => import('@/views/dashboard/inviteSuccess.vue'),
    name: 'inviteSuccess',
    meta: {
      hidden: true,
    },
  },
  {
    path: '/share/:walletAddress',
    component: () => import('@/views/dashboard/share.vue'),
    name: 'share',
    meta: {
      hidden: true,
    },
  },
  {
    path: '/dAppHub',
    component: () => import('@/views/dAppHub/index.vue'),
    name: 'dAppHub',
    meta: {
      hidden: true,
    },
  },
  {
    path: '/privacyPolicy',
    component: () => import('@/views/privacyPolicy/index.vue'),
    name: 'privacyPolicy',
    meta: {
      hidden: true,
    },
  },
  {
    path: '/termsService',
    component: () => import('@/views/termsService/index.vue'),
    name: 'termsService',
    meta: {
      hidden: true,
    },
  },

  {
    path: '/Agent',
    component: () => import('@/views/agent/index.vue'),
    name: 'Agent',
    meta: {
      hidden: true,
    },
  },

  {
    path: '/',
    component: Layouts,
    redirect: '/minerNode/index',
    children: [
      {
        path: '/minerNode/index',
        component: () => import('@/views/minerNode/index.vue'),
        name: 'MinerNode',
        meta: {
          title: t('menu.minerNode'),
          svgIcon: 'GPU',
          keepAlive: true,
        },
      },
    ],
  },

  {
    path: '/AI',
    component: Layouts,
    redirect: '/AI/AILLM/index',
    meta: {
      title: t('menu.AI'),
      svgIcon: 'AI',
      keepAlive: true,
    },
    children: [
      {
        path: 'AILLM/index',
        component: () => import('@/views/AILLM/index.vue'),
        name: 'AILLM',
        meta: {
          title: t('menu.AILLM'),
          keepAlive: true,
        },
      },

      {
        path: 'AIDapp/index',
        component: () => import('@/views/AIDapp/index.vue'),
        name: 'AIDapp',
        meta: {
          title: t('menu.AIDapp'),
          keepAlive: true,
        },
      },
    ],
  },

  {
    path: '/3DGym',
    component: Layouts,
    redirect: '/3DGym/index',
    meta: {
      title: t('menu.Gym3D'),
      svgIcon: '3D',
      keepAlive: true,
    },
    children: [
      {
        path: '/3DGym/index',
        component: () => import('@/views/3DGym/index.vue'),
        name: '3DGym',
        meta: {
          title: t('menu.Gym3D'),
          svgIcon: '3D',
          keepAlive: true,
        },
      },
    ],
  },

  {
    path: '/agent',
    component: Layouts,
    redirect: '/agent/index',

    children: [
      {
        path: '/agent/index',
        component: () => import('@/views/agent/index.vue'),
        name: 'agent',
        meta: {
          title: 'Agent',
          svgIcon: 'Agent',
          keepAlive: true,
        },
      },
    ],
  },
  // {
  //   path: '/faucet',
  //   component: Layouts,
  //   redirect: '/faucet/index',
  //   children: [
  //     {
  //       path: '/faucet/index',
  //       component: () => import('@/views/faucet/index.vue'),
  //       name: 'faucetIndex',
  //       meta: {
  //         title: t('menu.faucet'),
  //         svgIcon: 'FAUCET',
  //         keepAlive: true,
  //       },
  //     },
  //   ],
  // },
  {
    path: '/help',
    component: Layouts,
    redirect: '/help/index',
    children: [
      {
        path: 'https://hyperdust-foundation.gitbook.io/testnet-docs-and-guides/',
        component: () => {},
        name: 'help',
        meta: {
          title: t('menu.help'),
          svgIcon: 'help',
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: '/Explore',
    component: Layouts,
    redirect: '/Explore/index',
    children: [
      {
        path: 'https://explorer.hyperagi.network/',
        component: () => {},
        name: 'Explore',
        meta: {
          title: 'Explore',
          svgIcon: 'Explore',
          keepAlive: true,
        },
      },
    ],
  },
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*', // Must put the 'ErrorPage' route at the end, 必须将 'ErrorPage' 路由放在最后
    redirect: '/404',
    name: 'ErrorPage',
    meta: {
      hidden: true,
    },
  },
]

const router = createRouter({
  history: import.meta.env.VITE_ROUTER_HISTORY === 'hash' ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH) : createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: constantRoutes,
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
