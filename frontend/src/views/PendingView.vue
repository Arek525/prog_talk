<script setup>
    import { onMounted, onBeforeUnmount } from 'vue'
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
        socket.on('user:approved:self', async () => {
            await auth.fetchMe();
            router.push('/forum')
        });

        socket.on('user:rejected:self', async () => {
            await auth.fetchMe();
            router.push('/banned');
        })
    });

    onBeforeUnmount(() => {
        socket.off('user:approved:self');
        socket.off('user:rejected:self');
    })
</script>

<template>
    <div style="max-width: 600px; margin: 40px auto;">
        <h1>Account pending</h1>
        <p>Your account is waiting for approval. Until then, you can only edit your profile details.</p>
        <p><b>{{ auth.user?.email }}</b></p>
        <RouterLink to="/profile">Go to profile</RouterLink>
        <button @click="logout">Logout</button>
    </div>
</template>