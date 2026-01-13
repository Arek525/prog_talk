<script setup>
  import { ref, onMounted } from 'vue';
  import { api } from '../services/api';

  const users = ref([])
  const loading = ref(false)
  const error = ref('')

  async function load(){
    loading.value = true
    error.value = ''

    try{
      const res = await api.get('/admin/users/pending')
      users.value = res.data
    } catch(e){
      error.value = 'Failed to load pending users'
    } finally{
      loading.value = false
    }
  }

  async function approve(id){
    try{
      await api.post(`/admin/users/${id}/approve`)
      users.value = users.value.filter(u => u._id !== id)
    } catch(e){
      alert('Approve failed')
    }
  }

  async function reject(id){
    try{
      await api.post(`/admin/users/${id}/reject`)
      users.value = users.value.filter(u => u._id !== id)
    } catch(e){
      alert('Reject failed')
    }
  }

  onMounted(load)
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto;">
    <h1>Pending users</h1>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red">{{ error }}</p>

    <table v-if="users.length">
      <thead>
        <tr>
          <th>Email</th>
          <th>Country</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in users" :key="u._id">
          <td>{{ u.email }}</td>
          <td>{{ u.country || '-'}}</td>
          <td>
            <button @click="approve(u._id)">Approve</button>
            <button @click="reject(u._id)">Reject</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No pending users</p>
  </div>
</template>
