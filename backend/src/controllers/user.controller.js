const userService = require('../services/user.service');

async function getMe(req, res){
    try{
        const profile = await userService.getProfile(req.user._id);
        res.json(profile)
    } catch(err){
        res.status(404).json({error: err.message});
    }
}

async function updateMe(req, res){
    try{
        const profile = await userService.updateProfile(
            req.user._id,
            req.body
        );
        res.json(profile);
    } catch(err){
        res.status(400).json({error: err.message});
    }
}

module.exports = {
    getMe,
    updateMe
}