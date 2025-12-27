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

    const topic = new Topic({
        title,
        description,
        parentId,
        createdBy: userId
    });

    await topic.save();
    return topic;
}

async function updateTopic(userId, topicId, data){
    if(!(await isModerator(userId, topicId))){
        throw new Error('Not a moderator');
    }

    const topic = await Topic.findByIdAndUpdate(
        topicId,
        {
            $set: {
                title: data.title,
                description: data.description
            }
        },
        {new: true}
    )

    return topic;
}

async function getRootTopics(){
    return Topic.find({parentId: null, isHidden: false});
}

async function getTopic(topicId){
    return Topic.findById(topicId);
}

async function getTopicTree(topicId){
    return getParentChain(topicId);
}

module.exports = {
  createRootTopic,
  createSubtopic,
  updateTopic,
  getRootTopics,
  getTopic,
  getTopicTree,
};
