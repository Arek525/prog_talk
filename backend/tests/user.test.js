const { request } = require('./helpers');
const User = require('../src/models/User.model');

async function createActiveUser(email = 'user@test.com', role = 'USER') {
  const user = new User({ email, role, status: 'ACTIVE' });
  user.setPassword('password');
  await user.save();
  return user;
}

async function login(email, password = 'password') {
  const res = await request
    .post('/auth/login')
    .send({ email, password });

  return res.headers['set-cookie'];
}

describe('User API', () => {
  let user;
  let cookie;

  beforeEach(async () => {
    user = await createActiveUser();
    cookie = await login(user.email);
  });

  it('rejects unauthenticated access to profile', async () => {
    const res = await request.get('/users/me');
    expect(res.status).toBe(401);
  });

  it('returns profile for authenticated user', async () => {
    const res = await request
      .get('/users/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
    expect(res.body.role).toBe('USER');
  });

  it('updates country', async () => {
    const res = await request
      .patch('/users/me')
      .set('Cookie', cookie)
      .send({ country: 'PL' });

    expect(res.status).toBe(200);
    expect(res.body.country).toBe('PL');

    const updated = await User.findById(user._id);
    expect(updated.country).toBe('PL');
  });

  it('updates password and allows login with new password', async () => {
    const res = await request
      .patch('/users/me')
      .set('Cookie', cookie)
      .send({ password: 'newpass' });

    expect(res.status).toBe(200);

    const oldLogin = await request
      .post('/auth/login')
      .send({ email: user.email, password: 'password' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request
      .post('/auth/login')
      .send({ email: user.email, password: 'newpass' });
    expect(newLogin.status).toBe(200);
  });
});
