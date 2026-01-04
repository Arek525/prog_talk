require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const initSocket = require('./socket');

mongoose.connect(process.env.MONGO_URI);

const server = http.createServer(app);
initSocket(server);

server.listen(3000, () => {
    console.log('ProgTalk backend running on port 3000')
})