const { isModerator } = require('../services/permissions.service');

function requireModerator(param = 'topicId'){
    return async (req, res, next) => {
        const topicId = req.params[param];
        const ok = await isModerator(req.user._id, topicId);

        if (!ok){
            return res.status(403).json({message: 'Moderator only'});
        }

        next();
    }
}

modeule.exports = {
    requireModerator
};
