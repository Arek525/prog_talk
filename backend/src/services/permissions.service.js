const TopicModerator = require('../models/TopicModerator.model');
const TopicBlock = require('../models/TopicBlock.model');
const Topic = require('../models/Topic.model');
const {getParentChain} = require('./topicTree.service');

// the highest decision matters, moderating is propagated
async function isModerator(userId, topicId) {
  const chain = await getParentChain(topicId);

  for (let i = chain.length - 1; i >= 0; i--) {
    const currentTopicId = chain[i];

    const mod = await TopicModerator.findOne({
      userId,
      topicId: currentTopicId,
    });

    if (!mod) continue;

    return true;
  }

  return false;
}


// the highest decision matters, blocking is propagated
async function isUserBlocked(userId, topicId) {
  const chain = await getParentChain(topicId);

  for (let i = chain.length - 1; i >= 0; i -= 1) {
    const blockedAt = chain[i];
    const block = await TopicBlock.findOne({
      userId,
      topicId: blockedAt,
    });

    if (!block) continue;

    const child = chain[i - 1];
    if (child && block.exceptions.some((id) => id.equals(child))) {
      continue;
    }

    return true;
  }

  return false;
}

async function isTopicFounderInBranch(userId, topicId){
  const chain = await getParentChain(topicId);

  return await Topic.exists({
    _id: {$in: chain},
    createdBy: userId
  });
}

module.exports = {
  isModerator,
  isUserBlocked,
  isTopicFounderInBranch
};
