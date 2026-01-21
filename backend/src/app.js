const express = require('express');
const passport = require('./config/passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'https://localhost',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());  
app.use(passport.initialize());

const authRoutes = require('./routes/auth.routes');
const topicRoutes = require('./routes/topic.routes');
const moderatorRoutes = require('./routes/moderator.routes');
const postRoutes = require('./routes/post.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

app.use('/auth', authRoutes);
app.use('/topics', topicRoutes);
app.use('/', moderatorRoutes);
app.use('/', postRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);

module.exports = app;
