const express = require('express');
const path = require('path');
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
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');


app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api', moderatorRoutes);
app.use('/api', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

const distPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;
