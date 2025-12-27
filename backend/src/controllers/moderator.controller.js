const moderatorService = require('../services/moderator.service');

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
    blockUser,
    unblockUser,
};