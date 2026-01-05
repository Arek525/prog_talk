const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

async function register({email, password, country}){
    const exists = await User.findOne({email});
    if(exists){
        throw new Error('Email already used');
    }

    const user = new User({
        email,
        country,
        status: 'PENDING'
    });

    user.setPassword(password);
    await user.save();

    const io = getIO();
    if(io){
        io.to('admins').emit('user:pending', {
            userId: user._id,
            email: user.email
        })
    }

    return user;
}

async function login({email, password}){
    const user = await User.findOne({email});

    if(!user) return null;

    if (user.status === 'BANNED') {
        throw new Error('User is banned');
    }

    else if(user.status === 'PENDING'){
        throw new Error('User is pending')
    }
    
    const valid = user.validatePassword(password);
    if(!valid) return null;

    const token = jwt.sign(
        {sub: user._id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    )

    return {user, token};
}

module.exports = {
    register,
    login
};
