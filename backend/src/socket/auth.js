const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split('; ').map(c => c.split('='))
  );
}

module.exports = async function socketAuth(socket, next){
    try{
        const cookies = parseCookies(socket.handshake.headers.cookie);
        const token = cookies.access_token;
        if(!token) return next(new Error('Unauthorized'));

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub);
        if(!user) return next(new Error('Unauthorized'));

        if(user.status !== 'ACTIVE' && user.role !== 'ADMIN'){
          return next(new Error('Forbidden'));
        }

        socket.user = user;
        next();   
    } catch(err){
        next(new Error('Unauthorized'));
    }
}