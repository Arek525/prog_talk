const { request } = require('./helpers');
const User = require('../src/models/User.model');
const Topic = require('../src/models/Topic.model');

async function createUser(email, { role = 'USER', status = 'ACTIVE' } = {}) {
  const user = new User({ email, role, status });
  user.setPassword('password');
  await user.save();
  return user;
}

async function login(email) {
  const res = await request
    .post('/auth/login')
    .send({ email, password: 'password' });

  return res.headers['set-cookie'];
}

describe('Admin API', () => {
  let adminCookie;

  beforeEach(async () => {
    await createUser('admin@test.com', { role: 'ADMIN', status: 'ACTIVE' });
    adminCookie = await login('admin@test.com');
  });

  it('rejects non-admin access', async () => {
    await createUser('user@test.com', { status: 'ACTIVE' });
    const userCookie = await login('user@test.com');

    const res = await request
      .get('/admin/users/pending')
      .set('Cookie', userCookie);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Adminy only');
  });

  it('lists only pending users', async () => {
    await createUser('pending@test.com', { status: 'PENDING' });
    await createUser('active@test.com', { status: 'ACTIVE' });

    const res = await request
      .get('/admin/users/pending')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].email).toBe('pending@test.com');
  });

  it('approves pending user', async () => {
    const pending = await createUser('pending2@test.com', { status: 'PENDING' });

    const res = await request
      .post(`/admin/users/${pending._id}/approve`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User approved');

    const updated = await User.findById(pending._id);
    expect(updated.status).toBe('ACTIVE');
  });

  it('rejects approval of non-pending user', async () => {
    const active = await createUser('already@test.com', { status: 'ACTIVE' });

    const res = await request
      .post(`/admin/users/${active._id}/approve`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('User is not pending');
  });

  it('bans user', async () => {
    const victim = await createUser('ban@test.com', { status: 'ACTIVE' });

    const res = await request
      .post(`/admin/users/${victim._id}/ban`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User banned');

    const updated = await User.findById(victim._id);
    expect(updated.status).toBe('BANNED');
  });

  it('closes topic', async () => {
    const topic = await Topic.create({
      title: 'Close me',
      createdBy: (await User.findOne({ email: 'admin@test.com' }))._id,
    });

    const res = await request
      .post(`/admin/topics/${topic._id}/close`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Topic closed');

    const updated = await Topic.findById(topic._id);
    expect(updated.isClosed).toBe(true);
  });

  it('hides topic', async () => {
    const topic = await Topic.create({
      title: 'Hide me',
      createdBy: (await User.findOne({ email: 'admin@test.com' }))._id,
    });

    const res = await request
      .post(`/admin/topics/${topic._id}/hide`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Topic hidden');

    const updated = await Topic.findById(topic._id);
    expect(updated.isHidden).toBe(true);
  });

  it('returns 400 when topic not found', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    const res = await request
      .post(`/admin/topics/${fakeId}/close`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Topic not found');
  });
});
