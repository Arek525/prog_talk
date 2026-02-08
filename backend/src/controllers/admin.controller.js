const adminService = require('../services/admin.service');
const notificationService = require('../services/notification.service');

async function getNotifications(req, res){
    try{
        const limit = req.query.limit;
        const notifications = await notificationService.listNotifications(limit);
        res.json(notifications);
  } catch(err){
    res.status(400).json({ error: err.message });
  }
}

async function getPendingUsers(req, res) {
    try {
        const users = await adminService.listPendingUsers();
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function getBannedUsers(req, res){
    try{
        const users = await adminService.listBannedUsers();
        res.json(users);
    } catch(err){
        res.status(400).json({error: err.message})
    }
}

async function getActiveUsers(req, res){
    try{
        const users = await adminService.listActiveUsers();
        res.json(users);
    } catch(err){
        res.status(400).json({error: err.message})
    }
}

async function unbanUser(req, res){
    try{
        await adminService.unbanUser(req.params.id);
        res.json({message: 'User unbanned'});
    } catch(err){
        res.status(400).json({error: err.message})
    }
}

async function approveUser(req, res) {
    try {
        await adminService.approveUser(req.params.id, req.user);
        res.json({ message: 'User approved' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function rejectUser(req, res){
    try{
        await adminService.rejectUser(req.params.id, req.user);
        res.json({ message: 'User rejected' });
    } catch(err){
        res.status(400).json({error: err.message});
    }
}

async function banUser(req, res) {
    try {
        await adminService.banUser(req.params.id, req.user._id);
        res.json({ message: 'User banned' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function closeTopic(req, res) {
    try {
        await adminService.closeTopic(req.params.id);
        res.json({ message: 'Topic closed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function hideTopic(req, res) {
    try {
        await adminService.hideTopic(req.params.id);
        res.json({ message: 'Topic hidden' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = {
    getPendingUsers,
    getBannedUsers,
    unbanUser,
    approveUser,
    rejectUser,
    banUser,
    closeTopic,
    hideTopic,
    getActiveUsers,
    getNotifications
};
