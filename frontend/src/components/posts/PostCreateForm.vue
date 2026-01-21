<script setup>
    import { ref } from 'vue';
    import { api } from '../../services/api';

    const props = defineProps({
        topicId: {
            type: String,
            required: true
        },
        tags: {
            type: Array,
            default: () => []
        }
    })

    const loading = ref(false);
    const error = ref('');
    const content = ref('');
    const code = ref('');
    const language = ref('');
    const selectedTags = ref([]);

    async function submit(){
        error.value = '';
        if(!content.value.trim()){
            error.value = 'Content is required';
            return
        }

        loading.value = true;
        error.value = '';

        try{
            await api.post(`/topics/${props.topicId}/posts`, {
                content: content.value,
                tags: selectedTags.value,
                codeSnippets: code.value
                ? [{language: language.value, code: code.value}]
                : [],
            });

            content.value = '';
        } catch(e){
            error.value = e?.response?.data?.error ||
            'Cannot create post';
        } finally{
            loading.value = false;
        }
    }
</script>

<template>
    <h3>Add post</h3>

    <form @submit.prevent="submit">
        <textarea
            v-model="content"
            placeholder="Write your post..."
        />

        <textarea
            v-model="code"
            placeholder="Code snippet (optional)"
        />

        <select 
            v-model="language" 
            v-if="code.length"
        >
            <option>js</option>
            <option>python</option>
            <option>cpp</option>
        </select>

        <label v-for="t in props.tags" :key="t">
            <input
                type="checkbox"
                v-model="selectedTags"
                :value="t"
            />
            {{ t }}
        </label>

        <button
            type="submit"
            :disabled="loading"
        >
            {{ loading ? 'Posting...' : 'Post' }}
        </button>
    </form>

    <p v-if="error" style="color: red;">{{ error }}</p>
</template>