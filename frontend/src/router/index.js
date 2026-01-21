import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import PendingView from '../views/PendingView.vue'
import ForumView from '../views/ForumView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminView from '../views/AdminView.vue'
import TopicView from '../views/TopicView.vue'
import BannedView from '../views/BannedView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },

    { path: '/pending', component: PendingView },
    { path: '/banned', component: BannedView },
    { path: '/forum', component: ForumView },
    { path: '/profile', component: ProfileView },
    { path: '/admin', component: AdminView },
    { path: '/topics/:id', component: TopicView},

    { path: '/', redirect: '/forum' },
  ],
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if(!auth.user && !auth.loading){
        await auth.fetchMe();
    }

    if (auth.isBanned) {
        if (['/banned', '/login', '/register'].includes(to.path)) return true;
        return '/banned';
    }

    if(!auth.isLoggedIn){
        if(to.path === '/login' || to.path === '/register') return true
        return '/login'
    }

    if(auth.isPending){
        if (to.path === '/pending' || to.path === '/profile') return true
        return '/pending'
    }

    if (['/pending', '/login', '/register', '/banned'].includes(to.path)) return '/forum'

    if(to.path === '/admin' && !auth.isAdmin) return '/forum'

    return true
})

export default router