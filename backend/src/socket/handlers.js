const Topic = require('../models/Topic.model');
const { isUserBlocked } = require('../services/permissions.service');

module.exports = function registerHandlers(io, socket){
    const user = socket.user;

    if(user.role === 'ADMIN'){
        socket.join('admins');
    }

    socket.join(`user:${user._id}`)

    socket.on('topic:join', async ({topicId}) => {
        try{
            const topic = await Topic.findById(topicId);
            if(!topic) return socket.emit('error', {message: 'Topic not found'});

            if(topic.isHidden && socket.user.role !== 'ADMIN'){
                return socket.emit('error', {message: 'Forbidden'});
            }

            await socket.join(String(topicId));
            socket.emit('topic:joined', {topicId});

        } catch(err){
            socket.emit('error', {message: 'Join failed'})
        }
    });

    socket.on('topic:leave', async({topicId}) => {
        await socket.leave(String(topicId));
        socket.emit('topic:left', {topicId});
    });
};
