<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.store'
import AdminNotifications from './components/admin/AdminNotifications.vue'

const auth = useAuthStore()
const router = useRouter()

const hasUser = computed(() => !!auth.user)

const onLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="top-nav">
    <RouterLink class="brand" to="/forum">ProgTalk</RouterLink>

    <nav class="nav-links" v-if="hasUser">
      <RouterLink to="/forum">Forum</RouterLink>
      <RouterLink to="/profile">Profile</RouterLink>
      <RouterLink v-if="auth.isAdmin" to="/admin">Admin</RouterLink>
    </nav>

    <button
      v-if="hasUser"
      class="logout"
      type="button"
      @click="onLogout"
    >
      Logout
    </button>
  </header>

  <RouterView />
  <AdminNotifications v-if="auth.isAdmin" />
</template>
