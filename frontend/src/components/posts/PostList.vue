<script setup>
    import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue';
    import { api } from '../../services/api';
    import { useAuthStore } from '../../stores/auth.store';
    import hljs from 'highlight.js';
    import { socket } from '../../services/socket'

    const props = defineProps({
        topicId: {
            type: String,
            required: true
        }
    })

    async function highlightCode(){
        await nextTick();
        const blocks = document.querySelectorAll('pre code');
        blocks.forEach((el) => hljs.highlightElement(el));
    }

    const auth = useAuthStore();

    const loading = ref(false);
    const likeLoading = ref({});
    const error = ref('');

    const posts = ref([]);
    const page = ref(1);
    const pages = ref(1);

    const activeReplyTo = ref(null);
    const replyContent = ref('');
    const replyError = ref('');
    const repliesOpen = ref({});

    const rootPosts = computed(() => posts.value.filter(p => !p.replyTo));

    const repliesByParent = computed(() => {
        const map = {};
        for(const p of posts.value){
            if(p.replyTo){
                const id = String(p.replyTo);
                if(!map[id]) map[id] = [];
                map[id].push(p);
            }
        }

        return map;
    })


    async function load(){
        loading.value = true;

        try{
            const res = await api.get(`/topics/${props.topicId}/posts`, {
                params: {page: page.value, limit: 10}
            });

            posts.value = res.data.items;
            pages.value = res.data.pages;
            await highlightCode();
        } catch(e){
            error.value = 'Failed to load posts';
        } finally{
            loading.value = false;
        }
    }

    async function deletePost(postId){
        try{
            await api.delete(`/posts/${postId}`);
            load();
        } catch(e){
            alert(e?.response?.data?.error 
            || 'Cannot delete this post');
        }
    }

    async function toggleLike(post){
        const id = post._id;
        if(likeLoading.value[id]) return;
        likeLoading.value[id] = true;

        try{
            if(post.likedByMe){
                await api.delete(`/posts/${id}/like`);
                post.likedByMe = false;
                post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
                load();
            }
            else{
                await api.post(`/posts/${id}/like`);
                post.likedByMe = true;
                post.likesCount = (post.likesCount || 0) + 1;
                load();
            }
        } catch(e){
            error.value = e?.response?.data?.error || 'Cannot like post';
        } finally{
            likeLoading.value[id] = false;
        }
    }

    function toggleReply(postId){
        if(activeReplyTo.value === postId){
            activeReplyTo.value = null;
            replyContent.value = '';
        } else{
            activeReplyTo.value = postId;
            replyContent.value = '';
        }
    }

    function toggleReplies(postId){
        repliesOpen.value[postId] = !repliesOpen.value[postId];
    }

    async function submitReply(parentId){
        replyError.value = '';
        const content = replyContent.value.trim();
        if(!content){
            replyError.value = 'Reply is required';
            return;
        }

        try {
            await api.post(`/topics/${props.topicId}/posts`, {
                content,
                replyTo: parentId,
            });
            activeReplyTo.value = null;
            replyContent.value = '';
            load();
        } catch (e) {
            replyError.value = e?.response?.data?.error || 'Cannot create reply';
        }
    }

    function subscribe(){
        socket.on('post:changed', load)
    }

    function unsubscribe(){
        socket.off('post:changed', load)
    }


    watch(() => props.topicId, () => {
        page.value = 1;
        load();
    }, {immediate: true})

    onMounted(() => {
        subscribe()
    })

    onBeforeUnmount(() => {
        unsubscribe()
    })
</script>

<template>
    <section>
        <h3>Posts</h3>

        <p v-if="loading">Loading posts...</p>
        <p v-if="error" style="color: red;">{{ error }}</p>

        <div 
            v-for="p in rootPosts"
            :key="p._id"
            style="margin-bottom: 16px;"
        >
            <p v-if="p.deletedAt" style="color: #999;">(deleted)</p>
            <p :style="p.deletedAt ? 'color:#999;' : ''">{{ p.content }}</p>

            <p>
                <span v-for="t in p.tags" :key="t">
                    #{{ t }}
                </span>
            </p>

            <pre v-for="s in p.codeSnippets">
                <code
                    :class="s.language ? `'language-${s.language}` : ''"
                >
                    {{ s.code }}
                </code>
            </pre>

            <button 
                v-if="p.authorId === auth.user.id"
                @click="deletePost(p._id)"
            >
                Delete
            </button>

            <button
                @click="toggleLike(p)"
                :disabled="likeLoading[p._id]"
            >
                {{ p.likedByMe ? 'Unlike' : 'Like' }}
            </button>

            <span>❤️ {{ p.likesCount }}</span>

            <button @click="toggleReply(p._id)">Reply</button>

            <button
                v-if="repliesByParent[p._id]?.length"
                @click="toggleReplies(p._id)"
            >
                {{ repliesOpen[p._id] ? 'Hide replies' : `Show replies (${repliesByParent[p._id].length})` }}
            </button>

            <div v-if="activeReplyTo === p._id" style="margin: 8px 0;">
                <textarea v-model="replyContent" placeholder="Write reply..." />
                <button @click="submitReply(p._id)">Send</button>
                <p v-if="replyError" style="color: red;">{{ replyError }}</p>
            </div>

            <div
                v-if="repliesOpen[p._id]"
                style="margin-left: 24px; border-left: 2px solid #eee; padding-left: 12px;"
            >
                <div v-for="r in repliesByParent[p._id] || []" :key="r._id" style="margin: 8px 0;">
                    <p v-if="r.deletedAt" style="color: #999;">(deleted)</p>
                    <p :style="r.deletedAt ? 'color:#999;' : ''">{{ r.content }}</p>

                    <button 
                        v-if="r.authorId === auth.user.id"
                        @click="deletePost(r._id)"
                    >
                        Delete
                    </button>

                    <button
                        @click="toggleLike(r)"
                        :disabled="likeLoading[r._id]"
                    >
                        {{ r.likedByMe ? 'Unlike' : 'Like' }}
                    </button>

                    <span>❤️ {{ r.likesCount }}</span>
                </div>
            </div>


        </div>

        <!--pagination-->
        <div v-if="pages > 1">
            <button
                v-for="n in pages"
                :key="n"
                @click="page = n; load()"
                :disabled="page === n"
            >
                {{ n }}
            </button>
        </div>
    </section>
</template>