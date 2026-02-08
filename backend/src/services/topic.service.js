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

function emitForumChanged() {
    const io = safeGetIO();
    if (io) io.to('forum').emit('forum:changed');
}

function emitTopicChanged(topicId) {
    const io = safeGetIO();
    if (io) io.to(String(topicId)).emit('topic:changed');
}

function emitTopicBranchChanged(topic) {
    if (!topic) return;

    if (topic.parentId === null) {
        emitForumChanged();
    } else {
        emitTopicChanged(topic.parentId);
    }

    emitTopicChanged(topic._id);
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

    emitForumChanged();

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

    emitTopicChanged(parentId);

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

    emitTopicBranchChanged(topic);

    return updatedTopic;
}


async function getRootTopics(user, page = 1, limit = 10){
    const filter = { parentId: null };

    if (user.role !== 'ADMIN') {
        filter.isHidden = false;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        Topic.find(filter).sort({createdAt: -1}).skip(skip).limit(limit),
        Topic.countDocuments(filter)
    ]);

    return {
        items,
        pages: Math.ceil(total / limit)
    }
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
    topicData.isUserBlocked = userBlocked;

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
