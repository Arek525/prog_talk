require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node createAdmin.js <email> <password>');
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.error('User already exists');
    process.exit(1);
  }

  const admin = new User({
    email,
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  admin.setPassword(password);
  await admin.save();

  console.log(`Admin created: ${email}`);
  process.exit(0);
}

run();
