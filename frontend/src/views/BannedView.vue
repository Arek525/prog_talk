<script setup>
    import { useAuthStore } from '../stores/auth.store';
    import { useRouter } from 'vue-router'

    const auth = useAuthStore()
    const router = useRouter()

    async function logout() {
        await auth.logout()
        router.push('/login')
    }
</script>

<template>
    <div style="max-width: 600px; margin: 40px auto;">
        <h1>Account banned</h1>
        <p>Your account has been banned.</p>
        <p><b>{{ auth.user?.email }}</b></p>
        <button @click="logout">Logout</button>
    </div>
</template>
