<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import { socket } from '../../services/socket'
import { api } from '../../services/api'

const auth = useAuthStore();
const router = useRouter();
const notifications = ref([]);

const isNotsOpen = ref(false);

async function loadNotifications(){
    try{
        const res = await api.get('/admin/notifications');
        notifications.value = res.data;
        isNotsOpen.value = true;
    } catch(e){
        alert(e?.response?.data?.error || 'Failed loading notifications');
    }
}

function subscribe(){
  socket.on('notifications:changed', loadNotifications)
}
function unsubscribe(){
  socket.off('notifications:changed', loadNotifications)
}

onMounted(async () => {
    await loadNotifications()
    subscribe()
})

onBeforeUnmount(() => {
    unsubscribe()
})
</script>

<template>
    <div class="admin-notify">
        <div class="admin-notify__header">
            <h4>Notifications</h4>
            <button @click="isNotsOpen=!isNotsOpen">
                {{ isNotsOpen ? 'Hide' : 'Show' }}
            </button>
        </div>
        <div v-if="isNotsOpen">
            <p v-if="!notifications.length">No notifications</p>
            <ul v-else class="admin-notify__list">
                <li v-for="n in notifications" :key="n._id" @click="router.push('/admin')">
                    {{ new Date(n.createdAt).toLocaleString('pl-PL', { 
                        day:'2-digit', 
                        month:'2-digit', 
                        year:'numeric', 
                        hour:'2-digit', 
                        minute:'2-digit' }) }}
                    {{ n.message }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.admin-notify__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.admin-notify {
    position: fixed;
    right: 16px;
    bottom: 16px;
    width: 320px;
    background: linear-gradient(180deg, rgba(20, 42, 62, 0.95), rgba(17, 29, 44, 0.95));
    border: 1px solid rgba(79, 181, 173, 0.35);
    padding: 12px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
    font-size: 14px;
    color: #e6edf3;
    border-radius: 12px;
}
.admin-notify ul { list-style: none; padding: 0; margin: 8px 0 0; }
.admin-notify li { cursor: pointer; padding: 6px 0; border-top: 1px solid rgba(255,255,255,0.08); }
.admin-notify li:hover { color: #8fe0d8; }
.admin-notify__list {
  max-height: 220px;
  overflow-y: auto;
}
</style>
