<script setup>
    import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue';
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
    const isModPanelOpen = ref(false)
    const hasModPanel = computed(() => {
        return !!topic.value
            && (topic.value.isModerator || auth.user.role === 'ADMIN')
            && !topic.value.isClosed
    })

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
    <div :class="['page', { 'topic-layout': hasModPanel }]">
        <div class="topic-main">
            <div class="page-header">
                <p class="crumb" @click="router.push('/forum')">Back to forum</p>
            </div>

            <p v-if="loading" class="muted">Loading topic...</p>
            <p v-if="error" class="error">{{ error }}</p>

            <!--content-->
            <div v-if="topic && !loading">
                <!--breadcrumbs-->
                <nav class="breadcrumbs">
                    <span
                        v-for="(b, index) in breadcrumbs"
                        :key="b._id"
                        class="crumb"
                        @click="router.push(`/topics/${b._id}`)"
                    >
                        {{ b.title }}
                        <span v-if="index < breadcrumbs.length - 1">&gt;</span>
                    </span>
                </nav>

                <!--topic-->
                <div class="card section">
                    <h1>{{ topic.title }}</h1>
                    <p v-if="topic.description" class="muted">{{ topic.description }}</p>
                </div>

                <hr class="divider" />

                <div class="card section" v-if="topic.isModerator && !topic.isClosed">
                    <TopicCreateForm
                        :parent-id="topic._id"
                        :tags="topic.tags || []"
                    />
                </div>

                <!--subtopics-->
                <section class="section">
                    <p class="section-title">Subtopics</p>

                    <p v-if="!subtopics.length" class="muted">
                        No subtopics yet
                    </p>

                    <div v-else class="card">
                        <ul class="list">
                            <li
                                v-for="s in subtopics"
                                :key="s._id"
                                class="list-item"
                                @click="router.push(`/topics/${s._id}`)"
                            >
                                <div class="list-main">
                                    <div class="list-title">
                                        {{ s.title }}
                                        <span v-if="s.isHidden" class="badge">hidden</span>
                                        <span v-if="s.isClosed" class="badge">closed</span>
                                    </div>
                                </div>
                                <div v-if="auth.isAdmin" class="list-actions">
                                    <button class="ghost" @click.stop="hideTopic(s._id)" :disabled="s.isHidden">Hide</button>
                                    <button class="ghost" @click.stop="closeTopic(s._id)" :disabled="s.isClosed">Close</button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                <hr class="divider" />

                <!--posts-->
                <section class="section">
                    <PostList :topicId="topic._id" />

                    <div class="card section" v-if="!topic.isUserBlocked && !topic.isClosed">
                        <PostCreateForm
                            :topicId="topic._id"
                            :tags="topic.tags || []"
                        />
                    </div>
                </section>
            </div>
        </div>

        <aside
            v-if="hasModPanel"
            class="topic-side"
        >
            <button class="ghost" @click="isModPanelOpen = !isModPanelOpen">
                {{ isModPanelOpen ? 'Hide moderator panel' : 'Show moderator panel' }}
            </button>
            <div v-if="isModPanelOpen" class="panel-drawer">
                <TopicModeratorPanel
                    :topic="topic"
                    :subtopics="subtopics"
                />
            </div>
        </aside>
    </div>
</template>
