import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/sender',
    component: () => import('./pages/Sender.vue'),
  },
  {
    path: '/receiver',
    component: () => import('./pages/Receiver.vue'),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
