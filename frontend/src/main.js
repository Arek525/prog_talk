import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import 'highlight.js/styles/github-dark.css'
import { api } from './services/api'
import { useAuthStore } from './stores/auth.store'
import { socket } from './services/socket'

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')

const auth = useAuthStore(pinia);

socket.on('user:banned:self', async () => {
  await auth.fetchMe();
  if(router.currentRoute.value.path !== '/banned'){
    router.push('/banned');
  }
});

socket.on('user:unbanned:self', async () => {
  await auth.fetchMe();
  if (auth.isActive && router.currentRoute.value.path === '/banned') {
    router.push('/forum');
  }
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.response?.data?.error
    if (err.response?.status === 403 && msg === 'User is banned') {
      auth.user = { status: 'BANNED' }
      if (!['/login', '/register'].includes(router.currentRoute.value.path)) {
        router.push('/banned')
      }
    }
    return Promise.reject(err)
  }
)
