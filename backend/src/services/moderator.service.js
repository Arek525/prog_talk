const TopicModerator = require('../models/TopicModerator.model');
const TopicBlock = require('../models/TopicBlock.model');
const {
  isModerator,
  isUserBlocked,
  isTopicFounderInBranch,
} = require('./permissions.service');


async function addModerator(userId, topicId, targetUserId){
    if(!(await isModerator(userId, topicId))){
        throw new Error('Not a moderator');
    }

    if(await isModerator(targetUserId, topicId)){
        throw new Error('User is already a moderator')
    }

    await TopicModerator.create({
        topicId,
        userId: targetUserId,
        promotedBy: userId
    });
}

async function removeModerator(userId, topicId, targetUserId){
    if(!(await isModerator(userId, topicId))){
        throw new Error('Not a moderator');
    }

    if(!(await isModerator(targetUserId, topicId))){
        throw new Error('User is not a moderator');
    }

    if(await isTopicFounderInBranch(targetUserId, topicId)){
        throw new Error('Cannot remove moderator privileges from topic founder');
    }

    await TopicModerator.deleteOne({
        topicId,
        userId: targetUserId
    })
}

async function blockUser(userId, topicId, targetUserId, exceptions = [], reason){
    if(!(await isModerator(userId, topicId))) {
        throw new Error('Not a moderator');
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
}

async function unblockUser(userId, topicId, targetUserId) {
    if (!(await isModerator(userId, topicId))) {
        throw new Error('Not a moderator');
    }

    if (!(await isUserBlocked(targetUserId, topicId))) {
        throw new Error('User is not blocked');
    }

    await TopicBlock.deleteOne({
        topicId,
        userId: targetUserId,
    });
}

module.exports = {
  addModerator,
  removeModerator,
  blockUser,
  unblockUser,
};
