const Notification = require('../models/Notification.model');

async function createNotification({ type, message }) {
    return Notification.create({ type, message });
}

async function listNotifications(limit) {
    const query = Notification.find().sort({ createdAt: -1 });
    const max = Number(limit);

    if (max && max > 0) {
        query.limit(max);
    }
    
    return query;
}

module.exports = {
    createNotification,
    listNotifications,
};
