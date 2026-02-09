<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { api } from '../services/api';
  import { socket } from '../services/socket';

  const activeUsers = ref([])
  const pendingUsers = ref([])
  const bannedUsers = ref([])

  const activeQuery = ref('')
  const pendingQuery = ref('')
  const bannedQuery = ref('')

  const loading = ref(false)
  const error = ref('')

  async function loadAll(silent = true) {
    if (!silent) loading.value = true;
    error.value = '';

    try {
      await Promise.all([
        loadActive(),
        loadPending(),
        loadBanned(),
      ]);
    } catch (e) {
      error.value = 'Failed to load users';
    } finally {
      if (!silent) loading.value = false;
    }
}

  async function loadActive(){
    error.value = '';

    try{
      const activeRes = await api.get('/admin/users', {params: {status: 'ACTIVE', q: activeQuery.value}});
      activeUsers.value = activeRes.data;
    } catch(e){
      error.value = 'Failed to load users'
    }
  }

    async function loadPending(){
    error.value = '';

    try{
      const pendingRes = await api.get('/admin/users', {params: {status: 'PENDING', q: pendingQuery.value}});
      pendingUsers.value = pendingRes.data;
    } catch(e){
      error.value = 'Failed to load users'
    }
  }

    async function loadBanned(){
    error.value = '';

    try{
      const bannedRes = await api.get('/admin/users', {params: {status: 'BANNED', q: bannedQuery.value}});
      bannedUsers.value = bannedRes.data;
    } catch(e){
      error.value = 'Failed to load users'
    }
  }


  async function approve(user){
    try{
      await api.post(`/admin/users/${user._id}/approve`)
    } catch(e){
      error.value = e?.response?.data?.error || 'Approve failed'
    }
  }

  async function reject(user){
    try{
      await api.post(`/admin/users/${user._id}/reject`)
    } catch(e){
      error.value = e?.response?.data?.error || 'Reject failed'
    }
  }

  async function unban(user){
    try{
      await api.post(`/admin/users/${user._id}/unban`)
    } catch(e){
      error.value = e?.response?.data?.error || 'Unban failed'
    }
  }

  async function ban(user){
    try{
      await api.post(`/admin/users/${user._id}/ban`);
    } catch(e){
      error.value = e?.response?.data?.error || 'Ban failed'
    }
  }

  onMounted(() => {
    socket.on('users:changed', loadAll);
    loadAll(false);
  })

  onBeforeUnmount(() => {
    socket.off('users:changed', loadAll);
  })
</script>

<template>
  <div class="page">

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red">{{ error }}</p>

    <section class="card section">
      <h2>Active users</h2>

      <input
        v-model="activeQuery"
        @input="loadActive"
        placeholder="Search by email"
        style="margin-bottom: 10px;"
      >

      <p v-if="!activeUsers.length && activeQuery.trim().length === 0">No active users</p>
      <p v-else-if="!activeUsers.length && activeQuery.trim().length">No matching users</p>

      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Country</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in activeUsers.slice(0, 10)" :key="u._id">
            <td>{{ u.email }}</td>
            <td>{{ u.country || '-'}}</td>
            <td>
              <div class="inline-actions">
                <button @click="ban(u)">Ban</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card section">
      <h2>Banned users</h2>

      <input
        v-model="bannedQuery"
        @input="loadBanned"
        placeholder="Search by email"
        style="margin-bottom: 10px;"
      />

      <p v-if="!bannedUsers.length && bannedQuery.trim().length === 0">No banned users</p>
      <p v-else-if="!bannedUsers.length && bannedQuery.trim().length">No matching users</p>

      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Country</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in bannedUsers.slice(0, 10)" :key="u._id">
            <td>{{ u.email }}</td>
            <td>{{ u.country || '-'}}</td>
            <td>
              <div class="inline-actions">
                <button @click="unban(u)">Unban</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card section">
      <h2>Pending users</h2>

      <input
        v-model="pendingQuery"
        @input="loadPending"
        placeholder="Search by email"
        style="margin-bottom: 10px;"
      >

      <p v-if="!pendingUsers.length && pendingQuery.trim().length === 0">No pending users</p>
      <p v-else-if="!pendingUsers.length && pendingQuery.trim().length">No matching users</p>

      <table v-else class="admin-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Country</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in pendingUsers.slice(0, 10)" :key="u._id">
          <td>{{ u.email }}</td>
          <td>{{ u.country || '-'}}</td>
          <td>
            <div class="inline-actions">
              <button @click="approve(u)">Approve</button>
              <button class="ghost" @click="reject(u)">Reject</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    </section>
  </div>
</template>
