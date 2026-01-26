<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { api } from '../services/api'
    import { useAuthStore } from '../stores/auth.store'

    const router = useRouter()
    const auth = useAuthStore()

    const email = ref('')
    const password = ref('')
    const repeatPassword = ref('')
    const country = ref('')

    const error = ref('')
    const loading = ref(false)

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    async function onSubmit() {
        error.value = ''

        if (!email.value || !password.value || !repeatPassword.value) {
            error.value = 'All fields are required'
            return
        }

        if (!isValidEmail(email.value)) {
            error.value = 'Invalid email address'
            return
        }

        if (password.value.length < 6) {
            error.value = 'Password must be at least 6 characters'
            return
        }

        if (password.value !== repeatPassword.value) {
            error.value = 'Passwords do not match'
            return
        }

        loading.value = true

        try{
            //register
            await api.post('auth/register', {
                email: email.value,
                password: password.value,
                country: country.value
            })

            //autologin
            await auth.login({
                email: email.value,
                password: password.value
            })

            //redirect (PEDNING)
            router.push('/pending')
        } catch(e){
            error.value = e?.response?.data?.error || 
            'Registration failed'
        } finally{
            loading.value = false
        }
    }
</script>

<template>
    <div class="page auth-card">
        <h1>Register</h1>

        <form class="form-stack" @submit.prevent="onSubmit">
            <input v-model="email" placeholder="email">
            <input 
                v-model="password" 
                type="password" 
                placeholder="password">
            <input
                v-model="repeatPassword"
                type="password"
                placeholder="repeat password"
            />
            <input
                v-model="country"
                placeholder="country"
            />

            <button type="submit" :disabled="loading">
                {{ loading ? 'Registering...' : 'Register' }}
            </button>
        </form>

        <p v-if="error" class="error">
            {{ error }}
        </p>

        <p>
            Already have an account?
            <RouterLink to="/login">Log in</RouterLink>
        </p>
    </div>
</template>
