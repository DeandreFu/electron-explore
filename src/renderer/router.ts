import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('./pages/HomePage.vue'),
  },
  {
    path: '/sender',
    component: () => import('./pages/Sender.vue'),
  },
  {
    path: '/receiver',
    component: () => import('./pages/Receiver.vue'),
  },
  {
    path: '/call',
    component: () => import('./pages/VideoCall.vue'),
  },
  {
    path: '/answer',
    component: () => import('./pages/VideoAnswer.vue'),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  sensitive: true,
  linkActiveClass: 'active-link',
});
