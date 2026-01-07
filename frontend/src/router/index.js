import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },

    { path: '/banned', component: BannedView },
    { path: '/pending', component: PendingView },
    { path: '/forum', component: ForumView },
    { path: '/profile', component: ProfileView },
    { path: '/admin', component: AdminView },

    { path: '/', redirect: '/forum' },
  ],
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    //user not known
    if(!auth.user && !auth.loading){
        await auth.fetchMe()
    }

    if(auth.isBanned){
        if(to.path === '/banned') return true
        return '/banned'
    }

    if(!auth.isLoggedIn){
        if(to.path === '/login' || to.path === '/register') return true
        return '/login'
    }

    if(auth.isPending){
        if (to.path === '/pending' || to.path === '/profile') return true
        return '/pending'
    }

    if(to.path === '/login' || to.path === '/register') return '/forum'

    if(to.path === '/admin' && !auth.isAdmin) return '/forum'

    return true
})

export default router