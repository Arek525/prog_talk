<script setup>
    import { ref } from 'vue'
    import { useAuthStore } from '../stores/auth.store'
    import { useRouter } from 'vue-router'

    const auth = useAuthStore()
    const router = useRouter()

    const email = ref('')
    const password = ref('')
    const error = ref('')

    async function onSubmit(){
        error.value = ''
        try{
            await auth.login({email: email.value, password: password.value})

            if(auth.isPending) router.push('/pending')
            else router.push('/forum')
        } catch(e){
            error.value = e?.response?.data?.error || 'Login failed'
        }
    }
</script>

<template>
    <div style="max-width: 360px; margin: 40px auto;">
        <h1>Login</h1>

        <form @submit.prevent="onSubmit">
            <input v-model="email" placeholder="email"/>
            <input v-model="password" placeholder="password" type="password"/>
            <button type="submit">Login</button>
        </form>

        <p v-if="error" style="color: red;">{{ error }}</p>

        <p>
            No account?
            <RouterLink to="/register">Register</RouterLink>
        </p>
    </div>
</template>