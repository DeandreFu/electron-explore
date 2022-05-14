import { createApp } from 'vue';

import App from './pages/App.vue';
import './assets/styles/index.css';
import { router } from './router';

createApp(App).use(router).mount('#app');
console.log(process['env'].WEB_PORT);
