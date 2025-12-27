const TopicModerator = require('../models/TopicModerator.model');
const TopicBlock = require('../models/TopicBlock.model');
const Topic = require('../models/Topic.model');
const {getParentChain} = require('./topicTree.service');

// is a moderator if still is one on any higher topic
async function isModerator(userId, topicId) {
  const chain = await getParentChain(topicId);

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];

    const mod = await TopicModerator.findOne({
      userId,
      topicId: current,
    });

    if (!mod) continue;

    return true;
  }

  return false;
}


// is blocked if still is blocked on any higher topic
async function isUserBlocked(userId, topicId) {
  const chain = await getParentChain(topicId);

  for (let i = 0; i < chain.length; i++) {
    const blockedAt = chain[i];
    const block = await TopicBlock.findOne({
      userId,
      topicId: blockedAt,
    });

    if (!block) continue;

    const child = chain[i - 1]; //checking if our subtopic is on the exception branch
    if (child && block.exceptions.includes(child)) continue;

    return true;
  }

  return false;
}

async function isTopicFounderInBranch(userId, topicId){
  const chain = await getParentChain(topicId);

  const topics = await Topic.find({
    _id: {$in: chain},
    createdBy: userId
  })

  return topics.length > 0;
}

module.exports = {
  isModerator,
  isUserBlocked,
};
