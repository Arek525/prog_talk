const {Server} = require('socket.io');
const socketAuth = require('./auth');
const registerHandlers = require('./handlers');

function initSocket(server){
    const io = new Server(server, {
        cors:{
            origin: true,
            credentials: true
        }
    });

    setTimeout(io);

    io.use(socketAuth);

    io.on('connection', (socket) => {
        registerHandlers(io, socket);
    });

    return io;
}

module.exports = initSocket;
