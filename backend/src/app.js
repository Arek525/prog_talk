const express = require('express');
const passport = require('./config/passport');

const app = express();
app.use(express.json());
app.use(passport.initialize());

const authRoutes = require('./routes/auth.routes')

app.use('/auth', authRoutes);

module.exports = app;
