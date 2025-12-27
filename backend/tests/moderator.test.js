const { request } = require('./helpers');

const User = require('../src/models/User.model');
const TopicModerator = require('../src/models/TopicModerator.model');
const TopicBlock = require('../src/models/TopicBlock.model');

async function createUser(email) {
  const u = new User({ email, status: 'ACTIVE' });
  u.setPassword('password');
  await u.save();
  return u;
}

async function login(email) {
  const res = await request
    .post('/auth/login')
    .send({ email, password: 'password' });

  return res.headers['set-cookie'][0];
}

describe('Moderator API', () => {
  let founder;
  let moderator;
  let normalUser;

  let founderCookie;
  let moderatorCookie;
  let normalCookie;

  let rootTopic;
  let subTopic;

  beforeEach(async () => {
    founder = await createUser('founder@test.com');
    moderator = await createUser('moderator@test.com');
    normalUser = await createUser('user@test.com');

    founderCookie = await login('founder@test.com');
    moderatorCookie = await login('moderator@test.com');
    normalCookie = await login('user@test.com');

    const rootRes = await request
      .post('/topics')
      .set('Cookie', founderCookie)
      .send({ title: 'Root' });

    rootTopic = rootRes.body;

    const subRes = await request
      .post(`/topics/${rootTopic._id}/subtopics`)
      .set('Cookie', founderCookie)
      .send({ title: 'Sub' });

    subTopic = subRes.body;

    await request
      .post(`/topics/${rootTopic._id}/moderators`)
      .set('Cookie', founderCookie)
      .send({ userId: moderator._id });
  });

  it('rejects adding moderator by non-moderator', async () => {
    const res = await request
      .post(`/topics/${subTopic._id}/moderators`)
      .set('Cookie', normalCookie)
      .send({ userId: normalUser._id });

    expect(res.status).toBe(403);
  });

  it('rejects adding moderator who is already moderator', async () => {
    const res = await request
      .post(`/topics/${subTopic._id}/moderators`)
      .set('Cookie', founderCookie)
      .send({ userId: moderator._id });

    expect(res.status).toBe(403);
  });

  it('rejects removing moderator who is not moderator', async () => {
    const res = await request
      .delete(`/topics/${subTopic._id}/moderators/${normalUser._id}`)
      .set('Cookie', founderCookie);

    expect(res.status).toBe(403);
  });

  it('rejects removing moderator who is topic founder', async () => {
    const res = await request
      .delete(`/topics/${subTopic._id}/moderators/${founder._id}`)
      .set('Cookie', founderCookie);

    expect(res.status).toBe(403);
  });

  it('removes moderator correctly', async () => {
    const res = await request
      .delete(`/topics/${rootTopic._id}/moderators/${moderator._id}`)
      .set('Cookie', founderCookie);

    expect(res.status).toBe(200);

    const mod = await TopicModerator.findOne({
      topicId: rootTopic._id,
      userId: moderator._id,
    });

    expect(mod).toBeNull();
  });

  it('rejects blocking user by non-moderator', async () => {
    const res = await request
      .post(`/topics/${subTopic._id}/blocks`)
      .set('Cookie', normalCookie)
      .send({ userId: moderator._id });

    expect(res.status).toBe(403);
  });

  it('rejects blocking topic founder', async () => {
    const res = await request
      .post(`/topics/${subTopic._id}/blocks`)
      .set('Cookie', moderatorCookie)
      .send({ userId: founder._id });

    expect(res.status).toBe(403);
  });

  it('blocks user correctly', async () => {
    const res = await request
      .post(`/topics/${subTopic._id}/blocks`)
      .set('Cookie', founderCookie)
      .send({ userId: normalUser._id });

    expect(res.status).toBe(201);

    const block = await TopicBlock.findOne({
      topicId: subTopic._id,
      userId: normalUser._id,
    });

    expect(block).not.toBeNull();
  });

  it('rejects blocking already blocked user', async () => {
    await request
      .post(`/topics/${subTopic._id}/blocks`)
      .set('Cookie', founderCookie)
      .send({ userId: normalUser._id });

    const res = await request
      .post(`/topics/${subTopic._id}/blocks`)
      .set('Cookie', founderCookie)
      .send({ userId: normalUser._id });

    expect(res.status).toBe(403);
  });

  it('rejects unblocking user who is not blocked', async () => {
    const res = await request
      .delete(`/topics/${subTopic._id}/blocks/${normalUser._id}`)
      .set('Cookie', founderCookie);

    expect(res.status).toBe(403);
  });

  it('unblocks user correctly', async () => {
    await request
      .post(`/topics/${subTopic._id}/blocks`)
      .set('Cookie', founderCookie)
      .send({ userId: normalUser._id });

    const res = await request
      .delete(`/topics/${subTopic._id}/blocks/${normalUser._id}`)
      .set('Cookie', founderCookie);

    expect(res.status).toBe(200);

    const block = await TopicBlock.findOne({
      topicId: subTopic._id,
      userId: normalUser._id,
    });

    expect(block).toBeNull();
  });
});
