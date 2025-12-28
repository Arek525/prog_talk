const Topic = require('../models/Topic.model');
const TopicModerator = require('../models/TopicModerator.model');
const { isModerator } = require('./permissions.service');
const { getParentChain } = require('./topicTree.service');

async function createRootTopic(userId, {title, description}){
    if(!title) throw new Error('Title required');

    const topic = new Topic({
        title,
        description,
        parentId: null,
        createdBy: userId
    });

    await topic.save();

    await TopicModerator.create({
        topicId: topic._id,
        userId,
        promotedBy: userId
    });

    return topic;
}

async function createSubtopic(userId, parentId, {title, description}){
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
        createdBy: userId
    });

    await topic.save();
    return topic;
}

async function updateTopic(userId, topicId, data) {
    if (!(await isModerator(userId, topicId))) {
        throw new Error('Not a moderator');
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new Error('Topic not found');
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

    return topic;
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


module.exports = {
  createRootTopic,
  createSubtopic,
  updateTopic,
  getRootTopics,
  getTopic,
  getTopicTree,
};
