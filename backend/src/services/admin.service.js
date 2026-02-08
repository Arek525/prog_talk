const User = require('../models/User.model');
const notificationService = require('./notification.service');
const Topic = require('../models/Topic.model');
const { getIO } = require('../socket/io');

function safeGetIO() {
  try { return getIO(); } catch (e) { return null; }
}

async function listPendingUsers() {
    return User.find({ status: 'PENDING' });
}

async function listBannedUsers(){
    return User.find({status: 'BANNED'});
}

async function listActiveUsers(){
    return User.find({status: 'ACTIVE'});
}

async function approveUser(userId, adminUser) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.status !== 'PENDING') {
        throw new Error('User is not pending');
    }

    user.status = 'ACTIVE';
    await user.save();

    await notificationService.createNotification({
        type: 'USER_APPROVED',
        message: `Admin ${adminUser?.email || 'Unknown'} zaakceptował: ${user.email}`
    });


    const io = safeGetIO();
    if(io){
        io.to('admins').emit('notifications:changed');
        io.to('admins').emit('users:changed');

        io.to(`user:${user._id}`).emit('user:approved:self', {
            message: 'Your account has been approved'
        });
    }

}

async function rejectUser(userId, adminUser){
    const user = await User.findById(userId);
    if(!user) throw new Error('User not found');

    if (user.status !== 'PENDING') {
        throw new Error('User is not pending');
    }

    user.status = 'BANNED';
    await user.save();

    await notificationService.createNotification({
        type: 'USER_REJECTED',
        message: `Admin ${adminUser?.email || 'Unknown'} odrzucił: ${user.email}`
});


    const io = safeGetIO();
    if(io){
        io.to('admins').emit('notifications:changed');
        io.to('admins').emit('users:changed');

        io.to(`user:${user._id}`).emit('user:rejected:self', {
            message: 'Your registration has been rejected'
        });
    }
}

async function banUser(targetUserId, userId) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new Error('User not found');

    if(String(userId) === String(targetUserId)){
        throw new Error('Cannot ban yourself');
    }

    targetUser.status = 'BANNED';
    await targetUser.save();

    const io = safeGetIO();
    if (io) io.to('admins').emit('users:changed');
}

async function unbanUser(userId){
    const user = await User.findById(userId);
    if(!user) throw new Error('User not found');

    if(user.status !== 'BANNED'){
        throw new Error('User is not banned');
    }

    user.status = 'ACTIVE';
    await user.save();

    const io = safeGetIO();
    if (io) io.to('admins').emit('users:changed');
} 

async function closeTopic(topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) throw new Error('Topic not found');

    if(topic.isClosed) throw new Error('Topic already closed');

    topic.isClosed = true;
    await topic.save();

    const io = safeGetIO();
    if(io && topic.parentId === null) io.to('forum').emit('forum:changed'); 
    if (io) {
        io.to(String(topicId)).emit('topic:changed');
        if (topic.parentId) io.to(String(topic.parentId)).emit('topic:changed');
    }
}

async function hideTopic(topicId) {
    const topic = await Topic.findById(topicId);

    if(topic.isHidden) throw new Error('Topic already hidden');
    if (!topic) throw new Error('Topic not found');

    topic.isHidden = true;
    await topic.save();

    const io = safeGetIO();
    if (io) {
        io.to(String(topicId)).emit('topic:changed');
        if (topic.parentId) io.to(String(topic.parentId)).emit('topic:changed');
        if (topic.parentId === null) io.to('forum').emit('forum:changed');
    }
}

module.exports = {
    listPendingUsers,
    listBannedUsers,
    unbanUser,
    approveUser,
    rejectUser,
    banUser,
    closeTopic,
    hideTopic,
    listActiveUsers
};
