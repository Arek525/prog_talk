import { defineStore } from "pinia";
import { api } from "../services/api";
import { socket } from '../services/socket'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: false //is auth/me being checked at the moment
    }),

    getters: {
        isLoggedIn: (s) => !!s.user && s.user.status !== 'BANNED',
        isPending: (s) => s.user?.status === 'PENDING',
        isActive: (s) => s.user?.status === 'ACTIVE',
        isAdmin: (s) => s.user?.role === 'ADMIN',
        isBanned: (s) => s.user?.status === 'BANNED'
    },

    actions: {
        syncSocket() {
            if (this.user) {
                if (!socket.connected) socket.connect()
            } else {
                if (socket.connected) socket.disconnect()
            }
        },
        async fetchMe(){
            this.loading = true
            try{
                const res = await api.get('/auth/me')
                this.user = res.data
                return this.user
            } catch (err) {
                if(err.response?.status === 403){
                    this.user = {status: 'BANNED'}
                    return this.user
                }
                this.user = null
                return null
            } finally {
                this.syncSocket()
                this.loading = false
            }
        },

        async login({email, password}){
            try {
                await api.post('auth/login', { email, password });
                await this.fetchMe();
                return this.user;
            } catch (err) {
                if (err.response?.status === 403) {
                    this.user = { status: 'BANNED' };
                    this.syncSocket()
                }
                throw err;
            }
        },

        async logout(){
            try{
                await api.post('auth/logout')
            } finally{
                this.user = null
                this.syncSocket()
            }
        },

        async refresh(){
            await this.fetchMe()
        }
    }
})
