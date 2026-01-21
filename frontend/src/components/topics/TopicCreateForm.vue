<script setup>
    import { ref, computed } from 'vue';
    import { api } from '../../services/api';

    const props = defineProps({
        parentId: {
            type: String,
            default: null //null = root topic
        }
    });


    const title = ref('');
    const description = ref('');
    const tagsInput = ref('');
    const loading = ref(false);
    const error = ref('');

    const tags = computed(() =>
        tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
    );

    async function submit(){
        error.value = '';
        if(!title.value.trim()){
            error.value = 'Title is required';
            return
        }

        loading.value = true;

        try{
            if(props.parentId){
                //subtopic
                await api.post(`/topics/${props.parentId}/subtopics`, {
                    title: title.value,
                    description: description.value,
                    tags: tags.value
                });
            } else {
                //root topic
                await api.post(`/topics`, {
                    title: title.value,
                    description: description.value,
                    tags: tags.value
                });
            }

            title.value = '';
            description.value = '';
            tagsInput.value = '';

        } catch(e){
            error.value = e?.response?.data?.error ||
            'Failed to create topic';
        } finally{
            loading.value = false;
        }
    }
</script>

<template>
    <div style="margin-bottom: 20px;">
        <h3>
            {{ parentId ? 'Create subtopic' : 'Create new topic' }}
        </h3>

        <form @submit.prevent="submit">
            <input
                v-model="title"
                placeholder="Title"
            />

            <textarea
                v-model="description"
                placeholder="Description (optional)"
            />

            <input
                v-model="tagsInput"
                placeholder="Tags (comma separated)"
            />


            <button
                type="submit"
                :disabled="loading"
            >
                {{ loading ? 'Creating...' : 'Create' }}
            </button>
        </form>

        <p v-if="error" style="color: red;">
            {{ error }}
        </p>
    </div>
</template>