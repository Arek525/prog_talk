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

<style scoped>
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  font-weight: 700;
  font-size: 1.1rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.logout {
  padding: 0.4rem 0.9rem;
}
</style>
