<script setup>
  import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
  import { api } from '../services/api';
  import { socket } from '../services/socket';

  const pendingUsers = ref([])
  const bannedUsers = ref([])
  const activeUsers = ref([])

  const banQuery = ref('')
  const unbanQuery = ref('')
  const pendingQuery = ref('')

  const loading = ref(false)
  const error = ref('')

  const filteredActiveUsers = computed(()=> {
    const q = banQuery.value.trim().toLowerCase();
    if(!q) return activeUsers.value;
    return activeUsers.value.filter(u => u.email.toLowerCase().includes(q));
  });

  const filteredBannedUsers = computed(() => {
    const q = unbanQuery.value.trim().toLowerCase();
    if(!q) return bannedUsers.value;
    return bannedUsers.value.filter(u => u.email.toLowerCase().includes(q));
  })

  const filteredPendingUsers = computed(() => {
    const q = pendingQuery.value.trim().toLowerCase();
    if(!q) return pendingUsers.value;
    return pendingUsers.value.filter(u => u.email.toLowerCase().includes(q));
  })

  async function load(silent = true){
    if(!silent) loading.value = true;
    error.value = '';

    try{
      const [pendingRes, bannedRes, activeRes] = await Promise.all([
        api.get('/admin/users/pending'),
        api.get('/admin/users/banned'),
        api.get('/admin/users/active')
      ])

      pendingUsers.value = pendingRes.data;
      bannedUsers.value = bannedRes.data;
      activeUsers.value = activeRes.data;
    } catch(e){
      error.value = 'Failed to load users'
    } finally{
      if (!silent) loading.value = false
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
    socket.on('users:changed', load);
    load();
  })

  onBeforeUnmount(() => {
    socket.off('users:changed', load);
  })
</script>

<template>
  <div class="page">

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red">{{ error }}</p>

    <section class="card section">
      <h2>Active users</h2>

      <input
        v-model="banQuery"
        placeholder="Search by email"
        style="margin-bottom: 10px;"
      >

      <p v-if="!activeUsers.length">No active users</p>
      <p v-else-if="!filteredActiveUsers.length">No matching users</p>

      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Country</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in filteredActiveUsers.slice(0, 10)" :key="u._id">
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
        v-model="unbanQuery"
        placeholder="Search by email"
        style="margin-bottom: 10px;"
      />

      <p v-if="!bannedUsers.length">No banned users</p>
      <p v-else-if="!filteredBannedUsers.length">No matching users</p>

      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Country</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in filteredBannedUsers.slice(0, 10)" :key="u._id">
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
        placeholder="Search by email"
        style="margin-bottom: 10px;"
      >

      <p v-if="!pendingUsers.length">No pending users</p>
      <p v-else-if="!filteredPendingUsers.length">No matching users</p>

      <table v-else class="admin-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Country</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in filteredPendingUsers.slice(0, 10)" :key="u._id">
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
