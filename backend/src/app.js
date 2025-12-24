const express = require('express');
const passport = require('./config/passport');

const app = express();
app.use(express.json());
app.use(passport.initialize());

module.exports = app;
