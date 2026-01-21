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
    background-color:rgb(11, 98, 180);
    border: 1px solid #ddd;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-size: 14px;
}
.admin-notify ul { list-style: none; padding: 0; margin: 8px 0 0; }
.admin-notify li { cursor: pointer; padding: 6px 0; border-top: 1px solid #eee; }
.admin-notify__list {
  max-height: 220px;
  overflow-y: auto;
}
</style>