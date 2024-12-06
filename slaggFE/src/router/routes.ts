import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/signin/login',
  },
  {
    path: '/chat',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ChatPage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/signin',
    component: () => import('layouts/SignInLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('pages/LoginPage.vue')},
      { path: 'register', name: 'register', component: () => import('pages/RegisterPage.vue')}
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
