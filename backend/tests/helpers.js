const app = require('../src/app');
const request = require('supertest');

module.exports = {
  request: request(app),
};
