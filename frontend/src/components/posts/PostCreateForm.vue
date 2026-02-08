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
                tags: selectedTags.value
            });

            content.value = '';
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
            placeholder="Write your post in Markdown..."
        />
        <p class="muted">Code block: <code>```js ... ```</code></p>
        <p class="muted">Language shortcuts: js, ts, py, cpp, java, cs, go, rs, php, sql, bash, json, html, css, vue, yaml, xml, md</p>

        <details class="muted">
            <summary>Example post</summary>
            <pre><code>
                I have a parsing issue.

                ```js
                const raw = '{"name":"Ala"}'
                const data = JSON.parse(raw)
                console.log(data.name)
                ```
                Then I also tried Python:
                
                ```py
                import json
                data = json.loads(raw)
                print(data["name"])
                ```
                Any suggestions?
            </code></pre>
        </details>


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
