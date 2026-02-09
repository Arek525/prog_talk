const TopicModerator = require('../models/TopicModerator.model');
const TopicBlock = require('../models/TopicBlock.model');
const Topic = require('../models/Topic.model');
const User = require('../models/User.model');
const { getIO } = require('../socket/io');

const {
  isModerator,
  isUserBlocked,
  isTopicFounderInBranch,
} = require('./permissions.service');

function safeGetIO() {
    try { return getIO(); } catch (e) { return null; }
}

function emitPermissionsChanged(topicId){
    const io = safeGetIO();
    if(io){
        io.to(String(topicId)).emit('topic:permissions:changed');
    }
}

async function addModerator(userId, topicId, targetUserId){
    const user = await User.findById(userId);
    const topic = await Topic.findById(topicId);


    if(topic.isClosed){
        throw new Error('Topic is closed');
    }

    if(topic.isHidden){
        throw new Error('Topic is hidden');
    }


    const targetUser = await User.findById(targetUserId);
    if (!targetUser){
        throw new Error('User not found')

    } 

    if(!(await isModerator(userId, topicId)) && user.role !== 'ADMIN'){
        throw new Error('Not a moderator or admin');
    }

    if(targetUser.status !== 'ACTIVE'){
        throw new Error('User is banned or pending')
    }

    if(await isModerator(targetUserId, topicId)){
        throw new Error('User is already a moderator')
    }

    await TopicModerator.create({
        topicId,
        userId: targetUserId,
        promotedBy: userId
    });

    emitPermissionsChanged(topicId);
}

async function removeModerator(userId, topicId, targetUserId){
    const user = await User.findById(userId);

    const topic = await Topic.findById(topicId);

    if(topic.isClosed){
        throw new Error('Topic is closed');
    }

    if(topic.isHidden){
        throw new Error('Topic is hidden');
    }


    if(!(await isModerator(userId, topicId)) && user.role !== 'ADMIN'){
        throw new Error('Not a moderator or admin');
    }

    if(String(userId) === String(targetUserId)){
        throw new Error("Cannot remove moderator from yourself");
    }

    if(!(await isModerator(targetUserId, topicId))){
        throw new Error('User is not a moderator');
    }

    if(await isTopicFounderInBranch(targetUserId, topicId)){
        throw new Error('Cannot remove moderator privileges from topic founder');
    }
    

    //higher decision is more important
    const localMod = await TopicModerator.findOne({ topicId, userId: targetUserId });
    if (!localMod) throw new Error('Cannot remove moderating. User was granted on a higher topic.');

    if (user.role !== 'ADMIN' && String(localMod.promotedBy) !== String(userId)) {
        throw new Error('You can only remove moderators you promoted');
    }


    await TopicModerator.deleteOne({
        topicId,
        userId: targetUserId
    })

    emitPermissionsChanged(topicId);
}

async function blockUser(userId, topicId, targetUserId, exceptions = [], reason){
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    const topic = await Topic.findById(topicId);

    if(topic.isClosed){
        throw new Error('Topic is closed');
    }

    if(topic.isHidden){
        throw new Error('Topic is hidden');
    }

    if (!targetUser){
        throw new Error('User not found');
    }

    if(targetUser.role === 'ADMIN'){
        throw new Error('Cannot block admin');
    }

    if(!(await isModerator(userId, topicId)) && user.role !== 'ADMIN'){
        throw new Error('Not a moderator or admin');
    }

    if(String(userId) === String(targetUserId)){
        throw new Error("Cannot block yourself");
    }


    if(await isUserBlocked(targetUserId, topicId)){
        throw new Error('User is already blocked')
    }

    if(await isTopicFounderInBranch(targetUserId, topicId)){
        throw new Error('Cannot block topic founder');
    }

    await TopicBlock.create({
        topicId,
        userId: targetUserId,
        exceptions,
        createdByModeratorId: userId,
        reason,
    });

    emitPermissionsChanged(topicId);
}

async function unblockUser(userId, topicId, targetUserId) {
    const user = await User.findById(userId);

    const topic = await Topic.findById(topicId);

    if(topic.isClosed){
        throw new Error('Topic is closed');
    }

    if(topic.isHidden){
        throw new Error('Topic is hidden');
    }

    if(!(await isModerator(userId, topicId)) && user.role !== 'ADMIN'){
        throw new Error('Not a moderator or admin');
    }

    if(String(userId) === String(targetUserId)){
        throw new Error("Cannot unblock yourself");
    }

    if (!(await isUserBlocked(targetUserId, topicId))) {
        throw new Error('User is not blocked');
    }

    //higher decision is more important
    const localBlock = await TopicBlock.findOne({ topicId, userId: targetUserId });
    if (!localBlock) throw new Error('Cannot remove blocking. User was blocked on a higher topic.');

    await TopicBlock.deleteOne({
        topicId,
        userId: targetUserId,
    });

    emitPermissionsChanged(topicId);
}

module.exports = {
  addModerator,
  removeModerator,
  blockUser,
  unblockUser,
};
