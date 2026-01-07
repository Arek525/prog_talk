const {Server} = require('socket.io');
const socketAuth = require('./auth');
const registerHandlers = require('./handlers');
const { setIO } = require('./io');

function initSocket(server){
    const io = new Server(server, {
        cors:{
            origin: true,
            credentials: true
        }
    });

    setIO(io);

    io.use(socketAuth);

    io.on('connection', (socket) => {
        registerHandlers(io, socket);
    });

    return io;
}

module.exports = initSocket;
