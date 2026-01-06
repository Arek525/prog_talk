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

    const io = getIO();
    if(io){
        io.to('admins').emit('user:approved', {
            userId: user._id,
            email: user.email
        });

        io.to(`user:${user._id}`).emit('user:approved:self', {
            message: 'Your account has been approved'
        });
    }

}

async function rejectUser(userId){
    const user = await User.findById(userId);
    if(!user) throw new Error('User not found');

    if (user.status !== 'PENDING') {
        throw new Error('User is not pending');
    }

    user.status = 'BANNED';
    await user.save();

    const io = getIO();
    if(io){
        io.to('admins').emit('user:rejected', {
            userId: user._id,
            email: user.email
        });

        io.to(`user:${user._id}`).emit('user:rejected:self', {
            message: 'Your registration has been rejected'
        });
    }
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
    rejectUser,
    banUser,
    closeTopic,
    hideTopic
};
