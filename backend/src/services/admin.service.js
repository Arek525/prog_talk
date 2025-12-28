const User = require('../models/User.model');
const Topic = require('../models/Topic.model');

async function listPendingUsers() {
    return User.find({ status: 'PENDING' });
}

async function approveUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.status !== 'PENDING') {
        throw new Error('User is not pending');
    }

    user.status = 'ACTIVE';
    await user.save();
}

async function banUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.status = 'BANNED';
    await user.save();
}

async function closeTopic(topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) throw new Error('Topic not found');

    topic.isClosed = true;
    await topic.save();
}

async function hideTopic(topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) throw new Error('Topic not found');

    topic.isHidden = true;
    await topic.save();
}

module.exports = {
    listPendingUsers,
    approveUser,
    banUser,
    closeTopic,
    hideTopic
};
