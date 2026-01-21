const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['USER_PENDING', 'USER_APPROVED', 'USER_REJECTED'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);