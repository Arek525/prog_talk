<script setup>
  import { ref, onMounted } from 'vue'
  import { api } from '../services/api'
  import { useAuthStore } from '../stores/auth.store'

  const auth = useAuthStore()

  const country = ref('')
  const password = ref('')
  const error = ref('')
  const message = ref('')
  const loading = ref(false)
  const showPassword = ref(false)

  onMounted(async () => {
    try{
      const res = await api.get('/users/me')
      country.value = res.data.country || ''
    } catch(e){
      error.value = 'Failed to load profile'
    }
  })

  async function save(){
    error.value = ''
    message.value = ''

    if (password.value && password.value.length < 6) {
      error.value = 'Password must be at least 6 characters'
      return
    }

    loading.value = true

    try{
      const res = api.patch('/users/me', {
        country: country.value || undefined,
        password: password.value || undefined
      })

      password.value = ''
      country.value = ''
      message.value = 'Profile updated successfully'
      await auth.refresh()
    } catch(e){
      error.value = e?.response?.data?.error || 'Update failed'
    } finally{
      loading.value = false
    }
  }

</script>


<template>
  <div class="page">
    <div class="page-header">
      <h1>Profile</h1>
    </div>

    <div class="card section">
      <p><b>Email: </b>{{ auth.user.email }}</p>
      <p><b>Status: </b>{{ auth.user.status }}</p>
      <p><b>Role: </b>{{ auth.user.role }}</p>
      <p><b>Country: </b>{{ auth.user.country }}</p>
    </div>

    <div class="card section">
      <div class="field">
        <label>
          Country
          <input v-model="country" placeholder="Country">
        </label>
      </div>

      <div class="field">
        <label>
          New password
          <input
            v-model="password"
            placeholder="Leave empty to keep current"
            :type="showPassword ? 'text' : 'password'"
          />
        </label>
        <button
          class="ghost"
          @pointerdown="showPassword = true"
          @pointerup="showPassword = false"
          @pointerleave="showPassword = false"
          @pointercancel="showPassword = false"
          :disabled="loading"
        >
          Show
        </button>
      </div>

      <button @click="save" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save changes' }}
      </button>

      <p v-if="message" class="badge">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>
