const moderatorService = require('../services/moderator.service');
const User = require('../models/User.model');
const { isModerator } = require('../services/permissions.service');
const TopicModerator = require('../models/TopicModerator.model');

async function addModerator(req, res){
    try{
        await moderatorService.addModerator(
            req.user._id,
            req.params.id,
            req.body.userId
        )
        res.status(201).json({message: 'Moderator added'});
    } catch(err){
        res.status(403).json({error: err.message});
    }
}

async function removeModerator(req, res){
    try{
        await moderatorService.removeModerator(
            req.user._id,
            req.params.id,
            req.params.userId
        );
        res.json({message: 'Moderator removed'});
    } catch(err){
        res.status(403).json({error: err.message});
    }
}

async function listModerators(req, res){
    try{
        const userId = req.user._id;
        const topicId = req.params.id;
        const user = await User.findById(userId);

        if(!(await isModerator(userId, topicId)) && user.role !== 'ADMIN'){
            return res.status(403).json({error: 'Not a moderator or admin'})
        }

        const mods = await TopicModerator.find({ topicId })
            .populate('userId', 'email');

        res.json(mods.map(m => ({
            userId: m.userId._id,
            email: m.userId.email
        })));
    } catch(err){
        res.status(403).json({error: err.message})
    }
}

async function blockUser(req, res) {
    try {
        await moderatorService.blockUser(
            req.user._id,
            req.params.id,
            req.body.userId,
            req.body.exceptions || [],
            req.body.reason
        );
        res.status(201).json({ message: 'User blocked' });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
}

async function unblockUser(req, res) {
    try {
        await moderatorService.unblockUser(
            req.user._id,
            req.params.id,
            req.params.userId
        );
        res.json({ message: 'User unblocked' });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
}

module.exports = {
    addModerator,
    removeModerator,
    listModerators,
    blockUser,
    unblockUser,
};