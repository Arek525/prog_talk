<script setup>
    import { onMounted, onBeforeUnmount } from 'vue';
    import { useAuthStore } from '../stores/auth.store';
    import { useRouter } from 'vue-router'
    import { socket } from '../services/socket';

    const auth = useAuthStore()
    const router = useRouter()

    async function logout() {
        await auth.logout()
        router.push('/login')
    }

    onMounted(() => {
        socket.on('user:unbanned:self', async () => {
            await auth.fetchMe();
            if(auth.isActive) router.push('/forum');
        })
    })

    onBeforeUnmount(() => {
        socket.off('user:unbanned:self')
    })
</script>

<template>
    <div style="max-width: 600px; margin: 40px auto;">
        <h1>Account banned</h1>
        <p>Your account has been banned.</p>
        <p><b>{{ auth.user?.email }}</b></p>
        <button @click="logout">Logout</button>
    </div>
</template>
