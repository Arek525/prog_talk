const express = require('express');
const passport = require('./config/passport');
const cookieParser = require('cookie-parser');


const app = express();
app.use(express.json());
app.use(cookieParser());  
app.use(passport.initialize());

const authRoutes = require('./routes/auth.routes');
const topicRoutes = require('./routes/topic.routes');
const moderatorRoutes = require('./routes/moderator.routes');

app.use('/auth', authRoutes);
app.use('/topics', topicRoutes);
app.use('/', moderatorRoutes);

module.exports = app;
