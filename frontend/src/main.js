import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import 'highlight.js/styles/github.css'
import { api } from './services/api'
import { useAuthStore } from './stores/auth.store'
import { socket } from './services/socket'

socket.connect();

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')

const auth = useAuthStore(pinia)

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
