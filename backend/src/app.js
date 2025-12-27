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
const postRoutes = require('./routes/post.routes');

app.use('/auth', authRoutes);
app.use('/topics', topicRoutes);
app.use('/', moderatorRoutes);
app.use('/', postRoutes);

module.exports = app;
