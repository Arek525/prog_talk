import { defineStore } from "pinia";
import { api } from "../services/api";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: false //is auth/me being checked at the moment
    }),

    getters: {
        isLoggedIn: (s) => !!s.user,
        isPending: (s) => s.user?.status === 'PENDING',
        isActive: (s) => s.user?.status === 'ACTIVE',
        isAdmin: (s) => s.user?.status === 'ADMIN'
    },

    actions: {
        async fetchMe(){
            this.loading = true
            try{
                const res = await api.get('/auth/me')
                this.user = res.data
                return this.user
            } catch (err) {
                //401 not logged (or non-existent/expired cookie)
                this.user = null
                return null
            } finally {
                this.loading = false
            }
        },

        async login({email, password}){
            const res = await api.post('auth/login', {email, password})
            this.user = res.data.user
            return this.user
        },

        async logout(){
            try{
                await api.post('auth/logout')
            } finally{
                this.user = null
            }
        }
    }
})