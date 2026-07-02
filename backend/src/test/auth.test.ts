import request from 'supertest';
import { createApp } from '../app';
import { User } from '@models/User';

const app = createApp();

describe('Auth module', () => {
  const candidate = {
    name: 'Asha Verma',
    email: 'asha@example.com',
    password: 'Password123',
    role: 'candidate' as const,
  };

  it('signs up a new candidate and creates an unverified user record', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send(candidate);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(candidate.email);
    expect(res.body.data.user.password).toBeUndefined();

    const stored = await User.findOne({ email: candidate.email });
    expect(stored?.isEmailVerified).toBe(false);
  });

  it('rejects signup with a duplicate email', async () => {
    await request(app).post('/api/v1/auth/signup').send(candidate);
    const res = await request(app).post('/api/v1/auth/signup').send(candidate);
    expect(res.status).toBe(409);
  });

  it('rejects signup with a weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ ...candidate, email: 'weak@example.com', password: 'weak' });
    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });

  it('logs in with correct credentials and sets a refresh-token cookie', async () => {
    await request(app).post('/api/v1/auth/signup').send(candidate);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: candidate.email, password: candidate.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=/);
  });

  it('rejects login with the wrong password', async () => {
    await request(app).post('/api/v1/auth/signup').send(candidate);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: candidate.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('refreshes the access token using the refresh-token cookie', async () => {
    await request(app).post('/api/v1/auth/signup').send(candidate);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: candidate.email, password: candidate.password });

    const cookie = loginRes.headers['set-cookie'][0];
    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('returns the current user from a protected route given a valid access token', async () => {
    await request(app).post('/api/v1/auth/signup').send(candidate);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: candidate.email, password: candidate.password });

    const token = loginRes.body.data.accessToken;
    const res = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(candidate.email);
  });

  it('rejects a protected route with no token', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });

  it('always responds 200 on forgot-password, even for an unknown email (no enumeration leak)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'doesnotexist@example.com' });
    expect(res.status).toBe(200);
  });
});
