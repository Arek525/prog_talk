const passport = require('passport');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');
const User = require('../models/User.model');

const cookieExtractor = (req) => {
    return req?.cookies?.access_token || null;
}

const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(opts, async (payload, done) => {
        try{
            const user = await User.findById(payload.sub);
            if (!user) return done(null, false);
            return done(null, user);
        } catch (err){
            return done(err, false);
        }
    })
)

module.exports = passport;
