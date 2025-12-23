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

module.exports = {
    requireAuth,
    requireAdmin
};
