const { request } = require('./helpers');
const User = require('../src/models/User.model');
const Topic = require('../src/models/Topic.model');
const TopicModerator = require('../src/models/TopicModerator.model');

async function loginAndGetCookie(email, password) {
  const res = await request.post('/auth/login').send({ email, password });
  return res.headers['set-cookie'];
}

describe('Topic API', () => {
  let user;
  let cookie;

  beforeEach(async () => {
    user = new User({ email: 'topic@test.com', status: 'ACTIVE' });
    user.setPassword('password');
    await user.save();

    cookie = await loginAndGetCookie('topic@test.com', 'password');
  });

  it('creates root topic and assigns moderator', async () => {
    const res = await request
      .post('/topics')
      .set('Cookie', cookie)
      .send({ title: 'JavaScript' });

    expect(res.status).toBe(201);

    const topic = await Topic.findOne({ title: 'JavaScript' });
    expect(topic).not.toBeNull();

    const mod = await TopicModerator.findOne({
      topicId: topic._id,
      userId: user._id,
    });
    expect(mod).not.toBeNull();
  });

  it('creates subtopic only for moderator', async () => {
    const root = await request
      .post('/topics')
      .set('Cookie', cookie)
      .send({ title: 'Backend' });

    const res = await request
      .post(`/topics/${root.body._id}/subtopics`)
      .set('Cookie', cookie)
      .send({ title: 'Node.js' });

    expect(res.status).toBe(201);
  });

  it('rejects subtopic creation for non-moderator', async () => {
    const other = new User({ email: 'x@test.com', status: 'ACTIVE' });
    other.setPassword('password');
    await other.save();

    const otherCookie = await loginAndGetCookie('x@test.com', 'password');

    const root = await request
      .post('/topics')
      .set('Cookie', cookie)
      .send({ title: 'Security' });

    const res = await request
      .post(`/topics/${root.body._id}/subtopics`)
      .set('Cookie', otherCookie)
      .send({ title: 'OWASP' });

    expect(res.status).toBe(403);
  });

  it('returns topic tree', async () => {
    const root = await request
      .post('/topics')
      .set('Cookie', cookie)
      .send({ title: 'Frontend' });

    await request
      .post(`/topics/${root.body._id}/subtopics`)
      .set('Cookie', cookie)
      .send({ title: 'Vue' });

    const res = await request.get(`/topics/${root.body._id}/tree`);
    expect(res.body.length).toBe(1);
  });
});
