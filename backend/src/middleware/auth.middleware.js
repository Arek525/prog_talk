const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});

const requireAdmin = [
    requireAuth,
    (req, res, next) => {
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({message: 'Adminy only'});
        }
        next();
    }
];

const requireActive = [
    requireAuth,
    (req, res, next) => {
        if(req.user.status === 'BANNED'){
            return res.status(403).json({message: 'User is banned'});
        }
        next();
    }
]

module.exports = {
    requireAuth,
    requireAdmin,
    requireActive
};
