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
            code.value = '';
            language.value = '';
            selectedTags.value = [];
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

    <form class="form-stack" @submit.prevent="submit">
        <textarea
            v-model="content"
            placeholder="Write your post..."
        />

        <textarea
            v-model="code"
            placeholder="Code snippet (optional)"
        />

        <div v-if="code.length" class="field">
            <label>Language</label>
            <select v-model="language">
                <option disabled value="">Select language</option>
                <option value="js">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
            </select>
        </div>

        <div v-if="props.tags.length" class="tag-picker">
            <label class="tag-option" v-for="t in props.tags" :key="t">
                <input
                    type="checkbox"
                    v-model="selectedTags"
                    :value="t"
                />
                <span>#{{ t }}</span>
            </label>
        </div>

        <button
            type="submit"
            :disabled="loading"
        >
            {{ loading ? 'Posting...' : 'Post' }}
        </button>
    </form>

    <p v-if="error" style="color: red;">{{ error }}</p>
</template>
