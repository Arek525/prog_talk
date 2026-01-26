<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { api } from '../../services/api';
    import { useAuthStore } from '../../stores/auth.store';

    const props = defineProps({
        topic: Object,
        subtopics: Array
    });

    const emit = defineEmits(['topic-updated']);


    function openDescriptionEditor() {
        descriptionDraft.value = props.topic?.description || '';
        isEditingDescription.value = true;
    }

    function cancelDescriptionEdit() {
        isEditingDescription.value = false;
        descriptionDraft.value = '';
    }

    async function updateDescription() {
        descriptionLoading.value = true;
        try {
            await api.patch(`/topics/${props.topic._id}`, {
                description: descriptionDraft.value
            });
            error.value = '';
            isEditingDescription.value = false;
            emit('topic-updated');
        } catch (e) {
            error.value = e?.response?.data?.error || 'Failed';
        } finally {
            descriptionLoading.value = false;
        }
    }

    const auth = useAuthStore();
    const currentUserId = auth.user.id;

    const isEditingDescription = ref(false);
    const descriptionDraft = ref('');
    const descriptionLoading = ref(false);

    const error = ref('');
    const users = ref([]);
    const blockedIds = ref([]);
    const moderatorsIds = ref([]);

    const newModeratorId = ref('');
    const userToRemoveMod = ref('');
    const userToBlock = ref('');
    const userToUnblock = ref('');
    const exceptions = ref([]);

    const usersToBlock = computed(() => 
        users.value.filter(u => !blockedIds.value.includes(u._id))
    );

    const usersToUnblock = computed(() => 
        users.value.filter(u => blockedIds.value.includes(u._id))
    );

    const moderatorsToRemove = computed(() =>
        users.value.filter(u => moderatorsIds.value.includes(u._id))
    );

    const usersToModerate = computed(() =>
        users.value.filter(u => !moderatorsIds.value.includes(u._id))
    )



    onMounted(async () => {
        const res = await api.get(`/users`);
        users.value = res.data.filter((u) => u.status === 'ACTIVE'
            && u._id !== currentUserId);

        await loadBlocked();
        await loadModerators();
    })

    async function loadModerators(){
        const res = await api.get(`/topics/${props.topic._id}/moderators`);
        moderatorsIds.value = res.data.map(m => m.userId);
    }

    async function loadBlocked(){
        const res = await api.get(`/topics/${props.topic._id}/blocks`);
        blockedIds.value = res.data.map(u => u.userId);
    }


    async function addModerator(){
        try{
            await api.post(`/topics/${props.topic._id}/moderators`, {
                userId: newModeratorId.value
            })
            newModeratorId.value = '';
            error.value = '';
            loadModerators();
        } catch(e){
            error.value = e?.response?.data?.error || 'Failed'
        }
    }

    async function removeModerator(){
        try{
            await api.delete(`/topics/${props.topic._id}/moderators/${userToRemoveMod.value}`)
            userToRemoveMod.value = '';
            error.value = ''
            loadModerators();
        } catch(e){
            error.value = e?.response?.data?.error || 'Failed'
        }
    }

    async function blockUser(){
        try{
            await api.post(`/topics/${props.topic._id}/blocks`, {
                userId: userToBlock.value,
                exceptions: exceptions.value
            });
            loadBlocked();
            userToBlock.value = '';
            exceptions.value = [];
            error.value = '';
        } catch(e){
            error.value = e.response?.data?.error || 'Failed'
        }
    }

    async function unblockUser(){
        try{
            await api.delete(
                `/topics/${props.topic._id}/blocks/${userToUnblock.value}`
            );
            await loadBlocked();
            userToUnblock.value = ''
            error.value = '';
        } catch(e){
            error.value = e.response?.data?.error || 'Failed'
        }
    }



</script>

<template>
    <section class="card section">
        <h3>Moderator actions</h3>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="mod-block form-stack">
        <h4>Add moderator</h4>
            <select v-model="newModeratorId">
                <option disabled value="">Select user</option>
                <option
                    v-for="u in usersToModerate"
                    :key="u._id"
                    :value="u._id"
                >
                    {{ u.email }}
                </option>
            </select>
            <div class="inline-actions">
                <button @click="addModerator" :disabled="!newModeratorId">Add</button>
            </div>
        </div>

        <div class="mod-block form-stack">
            <h4>Remove moderator</h4>
            <select v-model="userToRemoveMod">
                <option disabled value="">Select user</option>
                <option 
                    v-for="u in moderatorsToRemove"
                    :key="u._id"
                    :value="u._id"
                >
                    {{ u.email }}
                </option>
            </select>
            <div class="inline-actions">
                <button @click="removeModerator">Remove</button>
            </div>
        </div>


        <div class="mod-block form-stack">
            <h4>Block user</h4>
            <select v-model="userToBlock">
                <option disabled value="">Select user</option>
                <option
                    v-for="u in usersToBlock"
                    :key="u._id"
                    :value="u._id"
                >
                    {{ u.email }}
                </option>
            </select>

            <div v-if="subtopics.length">
                <p class="muted">Allow access to subtopics:</p>
                <div class="checkbox-grid">
                    <label
                        class="tag-option"
                        v-for="t in props.subtopics" 
                        :key="t._id"
                    >
                        <input
                            type="checkbox"
                            :value="t._id"
                            v-model="exceptions"
                        >
                        <span>{{ t.title }}</span>
                    </label>
                </div>
            </div>
            <div class="inline-actions">
                <button @click="blockUser" :disabled="!userToBlock">Block</button>
            </div>
        </div>

        <div class="mod-block form-stack">
            <h4>Unblock user</h4>
            <select v-model="userToUnblock">
                <option disabled value="">Select user</option>
                <option
                    v-for="u in usersToUnblock"
                    :key="u._id"
                    :value="u._id"
                >
                    {{ u.email }}
                </option>
            </select>

            <div class="inline-actions">
                <button @click="unblockUser" :disabled="!userToUnblock">
                    Unblock
                </button>
            </div>
        </div>

        <div class="mod-block form-stack">
            <h4>Edit topic description</h4>
            <button v-if="!isEditingDescription" @click="openDescriptionEditor">
                Edit
            </button>
            <div v-else class="form-stack">
                <textarea v-model="descriptionDraft" placeholder="New description" />
                <div class="inline-actions">
                    <button @click="updateDescription" :disabled="descriptionLoading">
                        Save
                    </button>
                    <button class="ghost" type="button" @click="cancelDescriptionEdit" :disabled="descriptionLoading">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

    </section>
</template>
