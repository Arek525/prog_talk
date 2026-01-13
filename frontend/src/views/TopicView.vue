<script setup>
    import { ref, onMounted, watch } from 'vue'
    import { api } from '../services/api'
    import { useRoute, useRouter } from 'vue-router'

    const route = useRoute();
    const router = useRouter();

    const topic = ref(null);
    const subtopics = ref([]);
    const breadcrumbs = ref([]);

    const loading = ref(false);
    const error = ref('')

    async function load(){
        loading.value = true;
        error.value = '';

        try{
            const topicId = route.params.id;

            const [topicRes, treeRes, subRes] = await Promise.all([
                api.get(`topics/${topicId}`),
                api.get(`topics/${topicId}/tree`),
                api.get(`topics/${topicId}/subtopics`)
            ]);

            topic.value = topicRes.data;

             // tree = [current, parent, ..., root]
             // breadcrumbs we want: root, ..., parent, current
             breadcrumbs.value = [...treeRes.data].reverse();

             subtopics.value = subRes.data;
        } catch(e){
            error.value = 'Topic not found or access denied';
            topic.value = null;
            breadcrumbs.value = [];
            subtopics.value = [];
        } finally{
            loading.value = false;
        }
    }

    //react when parameter in URL changes (breadcrumbs/subtopic click)
    watch(() => route.params.id, load);

    onMounted(load);
</script>

<template>
    <div style="max-width: 800px; margin: 40px auto;">
        <p
            style="cursor: pointer; color: #4f8cff;;"
            @click="router.push('/forum')"
        >
            Back to forum
        </p>

        <p v-if="loading">Loading topic...</p>
        <p v-if="error" style="color: red;">{{ error }}</p>

        <!--content-->
        <div v-if="topic && !loading">
            <!--breadcrumbs-->
            <nav style="margin-bottom: 16px;">
                <span
                    v-for="(b, index) in breadcrumbs"
                    :key="b._id"
                    style="cursor: pointer; color: #4f8cff;"
                    @click="router.push(`/topics/${b._id}`)"
                >
                    {{ b.title }}
                    <span v-if="index < breadcrumbs.length - 1">&gt;</span>
                </span>
            </nav>

            <!--topic-->
            <h1>{{ topic.title }}</h1>
            <p v-if="topic.description"> {{ topic.description }}</p>

            <hr/>

            <!--subtopics-->
            <section>
                <h3>Subtopics</h3>

                <p v-if="!subtopics.length">
                    No subtopics yet
                </p>

                <ul v-else>
                    <li
                        v-for="s in subtopics"
                        :key="s._id"
                        style="cursor: pointer; padding: 4px 0;"
                        @click="router.push(`/topics/${s._id}`)"
                    >
                        {{ s.title }}
                    </li>
                </ul>
            </section>

            <hr/>

            <!--posts-->
            <section>
                <h3>Posts</h3>
                <p>Posts view coming next...</p>
            </section>

        </div>
    </div>
</template>