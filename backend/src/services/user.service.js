const User = require('../models/User.model');

async function getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    return {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        country: user.country,
    };
}

async function updateProfile(userId, { password, country }) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (password) {
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        user.setPassword(password);
    }

    if (country !== undefined) {
        user.country = country;
    }

    await user.save();

    return {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        country: user.country,
    };
}

module.exports = {
    getProfile,
    updateProfile
};