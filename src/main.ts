import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';
import { createPinia } from 'pinia';
import App from './App.vue';
import './styles.scss';

const pinia = createPinia();
const router = createRouter({ history: createWebHistory(), routes });
const app = createApp(App);

app.use(router);
app.use(pinia);
app.mount('#app');


const script = document.createElement('script');
script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GOOGLE_ANALYTICS}`;
document.body.appendChild(script);

window.dataLayer = window.dataLayer || [];

window.gtag = function () {
  window.dataLayer.push(arguments);
};

window.gtag('js', new Date());
window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS);
window.gtag?.('event', 'page_view', {
  page_path: window.location.pathname,
  page_location: window.location.href,
  page_title: document.title,
});