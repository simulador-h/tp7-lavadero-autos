import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'montecarlo', component: () => import('pages/Montecarlo.vue') },
    ],
  },

  {
    path: '*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
