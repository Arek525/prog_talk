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
    <div style="max-width: 700px; margin: 40px auto;">
        <h1>Forum</h1>

        <TopicCreateForm/>

        <p v-if="loading">Loading topics...</p>
        <p v-if="error" style="color: red">{{ error }}</p>

        <ul v-if="topics.length">
            <li
                v-for="t in topics"
                :key="t._id"
                style="cursor: pointer; padding: 8px 0;"
                @click="openTopic(t._id)"
            >
                 <div>
                    <b>{{ t.title }}</b>
                    <span v-if="t.isHidden" style="color: #999;"> (hidden)</span>
                    <span v-if="t.isClosed" style="color: #999;"> (closed)</span>
                    <p v-if="t.description">{{ t.description }}</p>
                </div>
                 <div v-if="auth.isAdmin">
                        <button @click.stop="hideTopic(t._id)" :disabled="t.isHidden">
                            Hide
                        </button>
                        <button @click.stop="closeTopic(t._id)" :disabled="t.isClosed">
                            Close
                        </button>
                    </div>
            </li>
        </ul>
        
        <p v-else>No topics yet</p>
    </div>
</template>