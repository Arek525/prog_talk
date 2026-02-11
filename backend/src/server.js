require('dotenv').config();
const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
const app = require('./app');
const initSocket = require('./socket');

const PORT = Number(process.env.PORT || 443);
const HOST = '0.0.0.0';

const TLS_KEY_PATH = process.env.TLS_KEY_PATH || '/app/certs/progtalk.key';
const TLS_CERT_PATH = process.env.TLS_CERT_PATH || '/app/certs/progtalk.crt';

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const server = https.createServer(
      {
        key: fs.readFileSync(TLS_KEY_PATH),
        cert: fs.readFileSync(TLS_CERT_PATH),
      },
      app
    );

    initSocket(server);

    server.listen(PORT, HOST, () => {
      console.log(`ProgTalk backend running on https://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Server start failed:', err);
    process.exit(1);
  }
}

start();
