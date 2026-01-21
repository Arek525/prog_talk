const User = require('../models/User.model');
const notificationService = require('./notification.service');
const jwt = require('jsonwebtoken');
const { getIO } = require('../socket/io');

async function register({email, password, country}){
    const exists = await User.findOne({email});
    if(exists){
        throw new Error('Email already used');
    }

    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }


    const user = new User({
        email,
        country,
        status: 'PENDING'
    });

    user.setPassword(password);
    await user.save();

    await notificationService.createNotification({
        type: 'USER_PENDING',
        message: `Nowa rejestracja oczekuje na decyzję: ${user.email}`
    });

    const io = getIO();
    if(io){
        io.to('admins').emit('notifications:changed')
        io.to('admins').emit('users:changed')
    }

    return user;
}

async function login({email, password}){
    const user = await User.findOne({email});

    if(!user) return null;

    if (user.status === 'BANNED') {
        throw new Error('User is banned');
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
