const User = require('../models/User.model');
const notificationService = require('./notification.service');
const Topic = require('../models/Topic.model');
const { getIO } = require('../socket/io');

function safeGetIO() {
  try { return getIO(); } catch (e) { return null; }
}

function emitAdminsUsersChanged() {
    const io = safeGetIO();
    if (io) io.to('admins').emit('users:changed');
}

function emitAdminsNotificationsChanged() {
    const io = safeGetIO();
    if (io) io.to('admins').emit('notifications:changed');
}

function emitUserApproved(userId) {
    const io = safeGetIO();
    if (io) {
        io.to(`user:${userId}`).emit('user:approved:self');
    }
}

function emitUserRejected(userId) {
    const io = safeGetIO();
    if (io) {
        io.to(`user:${userId}`).emit('user:rejected:self');
    }
}

function emitUserBanned(userId){
    const io = safeGetIO();
    if(io){
        io.to(`user:${userId}`).emit('user:banned:self')
    }
}

function emitUserUnbanned(userId){
    const io = safeGetIO();
    if(io){
        io.to(`user:${userId}`).emit('user:unbanned:self')
    }
}

function emitTopicChanged(topic) {
    const io = safeGetIO();
    if (!io || !topic) return;

    io.to(String(topic._id)).emit('topic:changed');

    if (topic.parentId) {
        io.to(String(topic.parentId)).emit('topic:changed');
    }

    if (topic.parentId == null) {
        io.to('forum').emit('forum:changed');
    }
}

function escapeRegex(text = '') {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listUsers(status = 'ACTIVE', query = ''){
    if(!['ACTIVE', 'BANNED', 'PENDING'].includes(status)){
        throw new Error('Given status does not exist');
    }

    const q = String(query).trim()

    const filter = {status};
    if(q){
        filter.email = {$regex: escapeRegex(q), $options: 'i'}
    }

    return User.find(filter).sort({createdAt: -1});
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


    emitAdminsNotificationsChanged();
    emitAdminsUsersChanged();
    emitUserApproved(user._id);

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


    emitAdminsNotificationsChanged();
    emitAdminsUsersChanged();
    emitUserRejected(user._id);
}

async function banUser(targetUserId, userId) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new Error('User not found');

    if(String(userId) === String(targetUserId)){
        throw new Error('Cannot ban yourself');
    }

    targetUser.status = 'BANNED';
    await targetUser.save();

    emitAdminsUsersChanged();
    emitUserBanned(targetUserId);
}

async function unbanUser(userId){
    const user = await User.findById(userId);
    if(!user) throw new Error('User not found');

    if(user.status !== 'BANNED'){
        throw new Error('User is not banned');
    }

    user.status = 'ACTIVE';
    await user.save();

    emitAdminsUsersChanged();
    emitUserUnbanned(userId);
} 

async function closeTopic(topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) throw new Error('Topic not found');

    if(topic.isClosed) throw new Error('Topic already closed');

    topic.isClosed = true;
    await topic.save();

    emitTopicChanged(topic);
}

async function hideTopic(topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) throw new Error('Topic not found');
    if(topic.isHidden) throw new Error('Topic already hidden');

    topic.isHidden = true;
    await topic.save();

    emitTopicChanged(topic);
}

module.exports = {
    listUsers,
    unbanUser,
    approveUser,
    rejectUser,
    banUser,
    closeTopic,
    hideTopic
};
