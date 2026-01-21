<script setup>
    import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
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

    function subscribe(){
        socket.on('post:changed', load)
    }

    function unsubscribe(){
        socket.off('post:changed', load)
    }


    watch(() => props.topicId, () => {
        page.value = 1;
        load();
    }, {immediate: true}) //so no need for onMounted

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
            v-for="p in posts"
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