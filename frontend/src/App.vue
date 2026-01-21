<script setup>
  import { useAuthStore } from './stores/auth.store'
  import AdminNotifications from './components/admin/AdminNotifications.vue'

  const auth = useAuthStore();
</script>

<template>
  <RouterView/>
  <AdminNotifications v-if="auth.isAdmin"/>
</template>
