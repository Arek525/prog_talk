const Topic = require('../models/Topic.model');
const TopicModerator = require('../models/TopicModerator.model');
const { isModerator, isUserBlocked } = require('./permissions.service');
const { getParentChain } = require('./topicTree.service');
const { getIO } = require('../socket/io');

function safeGetIO() {
    try { 
        return getIO(); 
    } catch (e) { 
        return null; 
    }
}

async function createRootTopic(userId, {title, description, tags = []}){
    if(!title) throw new Error('Title required');

    const topic = new Topic({
        title,
        description,
        tags,
        parentId: null,
        createdBy: userId,
        tags
    });

    await topic.save();

    await TopicModerator.create({
        topicId: topic._id,
        userId,
        promotedBy: userId
    });

    const io = safeGetIO();
    if(io) io.to('forum').emit('forum:changed');

    return topic;
}

async function createSubtopic(userId, parentId, {title, description, tags = []}){
    if(!(await isModerator(userId, parentId))){
        throw new Error('Not a moderator');
    }


    const parentTopic = await Topic.findById(parentId);
    if (!parentTopic) throw new Error('Topic not found');

    if (parentTopic.isHidden) {
        throw new Error('Topic is hidden');
    }

    if (parentTopic.isClosed) {
        throw new Error('Topic is closed');
    }

    const topic = new Topic({
        title,
        description,
        parentId,
        createdBy: userId,
        tags: tags
    });

    await topic.save();

    const io = safeGetIO();
    if (io) io.to(String(parentId)).emit('topic:changed');

    return topic;
}

async function updateTopic(userId, topicId, data) {
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new Error('Topic not found');
    }

    if (topic.isHidden) {
        throw new Error('Topic is hidden');
    }

    if (!(await isModerator(userId, topicId))) {
        throw new Error('Not a moderator');
    }


    if (topic.isClosed) {
        throw new Error('Topic is closed');
    }

    const update = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;

    const updatedTopic = await Topic.findByIdAndUpdate(
        topicId,
        { $set: update },
        { new: true }
    );

    const io = safeGetIO();
    if(topic.parentId === null){
        if(io) io.to('forum').emit('forum:changed');
    } else{
        if (io) io.to(String(topic.parentId)).emit('topic:changed');
    }

    if (io) io.to(String(topicId)).emit('topic:changed');

    return updatedTopic;
}


async function getRootTopics(user){
    const filter = { parentId: null };

    if (user.role !== 'ADMIN') {
        filter.isHidden = false;
    }

    return Topic.find(filter);
}

async function getTopic(user, topicId){
    const topic = await Topic.findById(topicId);
    if (!topic) throw new Error('Topic not found');

    if (topic.isHidden && user.role !== 'ADMIN') {
        throw new Error('Topic not found');
    }

    const [isUserModerator, userBlocked] = await Promise.all([
        isModerator(user._id, topicId),
        isUserBlocked(user._id, topicId)
    ]);
    const topicData = topic.toObject();
    topicData.isModerator = isUserModerator;
    topicData.isBlocked = userBlocked;

    return topicData;
}

async function getTopicTree(user, topicId) {
    const chain = await getParentChain(topicId);

    const topics = await Topic.find({
        _id: { $in: chain },
    });

    if (user.role === 'ADMIN') {
        return topics;
    }

    return topics.filter(topic => !topic.isHidden);
}

async function getSubtopics(user, topicId){
    const topic = await Topic.findById(topicId);
    if(!topic) throw new Error('Topic not found');

    const filter = {parentId: topicId};

    if(user.role !== 'ADMIN'){
        filter.isHidden = false;
    }

    return Topic.find(filter);
}


module.exports = {
  createRootTopic,
  createSubtopic,
  updateTopic,
  getRootTopics,
  getTopic,
  getTopicTree,
  getSubtopics
};
