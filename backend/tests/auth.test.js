const { request } = require('./helpers');
const User = require('../src/models/User.model');

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        country: 'PL',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();

    const user = await User.findOne({ email: 'test@test.com' });
    expect(user).not.toBeNull();
    expect(user.status).toBe('PENDING');
  });

  it('should not allow login for PENDING user', async () => {
    const user = new User({
      email: 'pending@test.com',
      country: 'PL',
      status: 'PENDING',
    });
    user.setPassword('password123');
    await user.save();

    const res = await request
      .post('/auth/login')
      .send({
        email: 'pending@test.com',
        password: 'password123',
      });

    expect(res.status).toBe(403);
  });

  it('should login ACTIVE user and set cookie', async () => {
    const user = new User({
      email: 'active@test.com',
      country: 'PL',
      status: 'ACTIVE',
    });
    user.setPassword('password123');
    await user.save();

    const res = await request
      .post('/auth/login')
      .send({
        email: 'active@test.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
