<script setup>
    import { ref, onMounted } from 'vue'
    import { api } from '../services/api'
    import { useRouter } from 'vue-router'

    const router = useRouter();

    const loading = ref(false);
    const error = ref();
    const topics = ref([]);

    async function loadTopics(){
        loading.value = true;
        error.value = '';

        try{
            const res = await api.get('/topics')
            topics.value = res.data;
        } catch(e){
            error.value = 'Failed to load topics'
        } finally{
            loading.value = false
        }
    }

    function openTopic(id){
        router.push(`/topics/${id}`)
    }

    onMounted(loadTopics)
</script>

<template>
    <div style="max-width: 700px; margin: 40px auto;">
        <h1>Forum</h1>

        <p v-if="loading">Loading topics...</p>
        <p v-if="error" style="color: red">{{ error }}</p>

        <ul v-if="topics.length">
            <li
                v-for="t in topics"
                :key="t._id"
                style="cursor: pointer; padding: 8px 0;"
                @click="openTopic(t._id)"
            >
            <b>{{ t.title }}</b>
            <p v-if="t.description">{{ t.description }}</p>
            </li>
        </ul>
        
        <p v-else>No topics yet</p>
    </div>
</template>