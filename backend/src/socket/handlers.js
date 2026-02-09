const Topic = require('../models/Topic.model');

module.exports = function registerHandlers(io, socket){
    const user = socket.user;

    if(user.role === 'ADMIN'){
        socket.join('admins');
    }

    socket.join(`user:${user._id}`);
    if (user.status === 'BANNED') return;

    socket.on('forum:join', () => {
        socket.join('forum');
    })

    socket.on('forum:leave', () => {
        socket.leave('forum');
    })

    socket.on('topic:join', async ({topicId}) => {
        try{
            const topic = await Topic.findById(topicId);
            if(!topic) return;

            if(topic.isHidden && socket.user.role !== 'ADMIN'){
                return;
            }

            await socket.join(String(topicId));

        } catch(err){
            console.error('topic:join failed', err)
        }
    });

    socket.on('topic:leave', async({topicId}) => {
        await socket.leave(String(topicId));
    });
};
