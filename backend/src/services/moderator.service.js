const TopicModerator = require('../models/TopicModerator.model');
const TopicBlock = require('../models/TopicBlock.model');
const User = require('../models/User.model');

const {
  isModerator,
  isUserBlocked,
  isTopicFounderInBranch,
} = require('./permissions.service');


async function addModerator(userId, topicId, targetUserId){
    const user = await User.findById(userId);

    if(!(await isModerator(userId, topicId)) || user.role === 'ADMIN'){
        throw new Error('Not a moderator or admin');
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
    const user = await User.findById(userId);

    if(!(await isModerator(userId, topicId)) || user.role === 'ADMIN'){
        throw new Error('Not a moderator or admin');
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


    await TopicModerator.deleteOne({
        topicId,
        userId: targetUserId
    })
}

async function blockUser(userId, topicId, targetUserId, exceptions = [], reason){
    const user = await User.findById(userId);

    if(!(await isModerator(userId, topicId)) || user.role === 'ADMIN'){
        throw new Error('Not a moderator or admin');
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
    const user = await User.findById(userId);

    if(!(await isModerator(userId, topicId)) || user.role === 'ADMIN'){
        throw new Error('Not a moderator or admin');
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
}

module.exports = {
  addModerator,
  removeModerator,
  blockUser,
  unblockUser,
};
