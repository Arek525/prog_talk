<script setup>
    import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
    import { api } from '../services/api'
    import { useRoute, useRouter } from 'vue-router'
    import TopicCreateForm from '../components/topics/TopicCreateForm.vue';
    import PostCreateForm from '../components/posts/PostCreateForm.vue';
    import PostList from '../components/posts/PostList.vue';
    import TopicModeratorPanel from '../components/topics/TopicModeratorPanel.vue';
    import { useAuthStore } from '../stores/auth.store';
    import { socket } from '../services/socket'


    const route = useRoute();
    const router = useRouter();
    const auth = useAuthStore();

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
            breadcrumbs.value = [...treeRes.data];

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

    async function hideTopic(id){
        try{
            await api.post(`/admin/topics/${id}/hide`);
            await load();
        } catch(e){
            error.value = e?.response?.data?.error || 'Failed to hide topic'
        }
    }

    async function closeTopic(id){
        try{
            await api.post(`/admin/topics/${id}/close`)
            await load();
        } catch(e){
            error.value = e?.response?.data?.error || 'Failed to close topic'
        }
    }

    function subscribe(){
        socket.on('topic:changed', load)
    }

    function unsubscribe(){
        socket.off('topic:changed', load)
    }

    function joinTopic(id){
        socket.emit('topic:join', {topicId: id});
    }

    function leaveTopic(id){
        socket.emit('topic:leave', { topicId: id })
    }


    const onConnect = () => socket.emit('topic:join', { topicId: route.params.id })

    //react when parameter in URL changes
    watch(() => route.params.id, (newId, oldId) => {
        if (oldId) leaveTopic(oldId);
        load();
        joinTopic(newId);
    })

    onMounted(() => {
        load();
        subscribe();
        socket.on('connect', onConnect)
        joinTopic(route.params.id);
    })

    onBeforeUnmount(() => {
        socket.off('connect', onConnect)
        leaveTopic(route.params.id);
        unsubscribe();
    })
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
                    <span v-if="index < breadcrumbs.length - 1">&gt; </span>
                </span>
            </nav>

            <!--topic-->
            <h1>{{ topic.title }}</h1>
            <p v-if="topic.description"> {{ topic.description }}</p>

            <hr/>

            <TopicCreateForm
                v-if="topic.isModerator && !topic.isClosed"
                :parent-id="topic._id"
                :tags="topic.tags || []"
            />

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
                        <div>
                            {{ s.title }}
                            <span v-if="s.isHidden" style="color: #999;"> (hidden)</span>
                            <span v-if="s.isClosed" style="color: #999;"> (closed)</span>
                        </div>
                        <div v-if="auth.isAdmin">
                            <button @click.stop="hideTopic(s._id)" :disabled="s.isHidden">Hide</button>
                            <button @click.stop="closeTopic(s._id)" :disabled="s.isClosed">Close</button>
                        </div>
                    </li>
                </ul>
            </section>

            <hr/>

            <!--posts-->
            <section>
                <PostList
                    :topicId="topic._id"
                />

                <PostCreateForm
                    v-if="!topic.isUserBlocked && !topic.isClosed"
                    :topicId="topic._id"
                    :tags="topic.tags || []"
                />
            </section>

            <TopicModeratorPanel
                v-if="(topic.isModerator || auth.user.role === 'ADMIN')
                    && !topic.isClosed"
                :topic="topic"
                :subtopics="subtopics"
            />

        </div>
    </div>
</template>