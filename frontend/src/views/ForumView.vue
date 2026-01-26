<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { api } from '../services/api'
    import { useRouter } from 'vue-router'
    import TopicCreateForm from '../components/topics/TopicCreateForm.vue';
    import { useAuthStore } from '../stores/auth.store'
    import { socket } from '../services/socket'


    const router = useRouter();
    const auth = useAuthStore();


    const loading = ref(false);
    const error = ref();
    const topics = ref([]);

    async function loadTopics(){
        loading.value = true;
        error.value = '';

        try{
            const res = await api.get('/topics')
            topics.value = res.data.reverse();
        } catch(e){
            error.value = 'Failed to load topics'
        } finally{
            loading.value = false
        }
    }

    function openTopic(id){
        router.push(`/topics/${id}`)
    }

    async function hideTopic(id){
        try{
            await api.post(`/admin/topics/${id}/hide`);
            await loadTopics();
        } catch(e){
            error.value = e?.response?.data?.error || 'Failed to hide topic'
        }
    }

    async function closeTopic(id){
        try{
            await api.post(`/admin/topics/${id}/close`)
            await loadTopics()
        } catch(e){
            error.value = e?.response?.data?.error || 'Failed to close topic'
        }
    }

    const onConnect = () => socket.emit('forum:join')

    function subscribe(){
        socket.on('forum:changed', loadTopics)
    }

    function unsubscribe(){
        socket.off('forum:changed', loadTopics)
    }

    onMounted(() => {
        loadTopics();
        subscribe()
        socket.on('connect', onConnect)
        socket.emit('forum:join')
    })

    onBeforeUnmount(() => {
        socket.off('connect', onConnect)
        unsubscribe();
        socket.emit('forum:leave');
    })
</script>

<template>
    <div class="page">
        <div class="page-header">
            <h1>Forum</h1>
        </div>

        <div class="card section">
            <TopicCreateForm />
        </div>

        <p class="section-title">Topics</p>

        <p v-if="loading" class="muted">Loading topics...</p>
        <p v-if="error" class="error">{{ error }}</p>

        <div v-if="topics.length" class="card">
            <ul class="list">
                <li
                    v-for="t in topics"
                    :key="t._id"
                    class="list-item"
                    @click="openTopic(t._id)"
                >
                    <div class="list-main">
                        <div class="list-title">
                            {{ t.title }}
                            <span v-if="t.isHidden" class="badge">hidden</span>
                            <span v-if="t.isClosed" class="badge">closed</span>
                        </div>
                        <p v-if="t.description" class="list-meta">{{ t.description }}</p>
                    </div>
                    <div v-if="auth.isAdmin" class="list-actions">
                        <button class="ghost" @click.stop="hideTopic(t._id)" :disabled="t.isHidden">
                            Hide
                        </button>
                        <button class="ghost" @click.stop="closeTopic(t._id)" :disabled="t.isClosed">
                            Close
                        </button>
                    </div>
                </li>
            </ul>
        </div>

        <p v-else class="muted">No topics yet</p>
    </div>
</template>
