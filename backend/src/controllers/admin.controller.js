const adminService = require('../services/admin.service');

async function getPendingUsers(req, res) {
    try {
        const users = await adminService.listPendingUsers();
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function approveUser(req, res) {
    try {
        await adminService.approveUser(req.params.id);
        res.json({ message: 'User approved' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function rejectUser(req, res){
    try{
        await adminService.rejectUser(req.params.id);
        res.json({ message: 'User rejected' });
    } catch(err){
        res.status(400).json({error: err.message});
    }
}

async function banUser(req, res) {
    try {
        await adminService.banUser(req.params.id);
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
    approveUser,
    banUser,
    closeTopic,
    hideTopic
};
