import { http, HttpResponse } from 'msw';
import { users, problems, answers, tags, faqs, notifications, nextId } from './db';

function withoutPassword(user) {
  const copy = { ...user };
  delete copy.password;
  return copy;
}
const makeToken = (userId) => `mock-token-${userId}-${Date.now()}`;
const userIdFromToken = (token) => token?.match(/^mock-token-([^-]+)-/)?.[1];

function json404(message) {
  return HttpResponse.json({ message }, { status: 404 });
}

export const handlers = [
  // ---------------------------------------------------------------- auth
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return HttpResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }
    return HttpResponse.json({ user: withoutPassword(user), token: makeToken(user.id) });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const { name, email, password } = await request.json();
    if (users.some((u) => u.email === email)) {
      return HttpResponse.json({ message: 'An account with that email already exists.' }, { status: 409 });
    }
    const user = {
      id: nextId('users'),
      name,
      email,
      password,
      role: 'student',
      cohort: null,
    };
    users.push(user);
    return HttpResponse.json({ user: withoutPassword(user), token: makeToken(user.id) }, { status: 201 });
  }),

  // --------------------------------------------------------------- users
  http.get('/api/users/me', ({ request }) => {
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
    const user = users.find((u) => u.id === userIdFromToken(token));
    if (!user) return HttpResponse.json({ message: 'Not authenticated.' }, { status: 401 });
    return HttpResponse.json(withoutPassword(user));
  }),

  http.put('/api/users/me', async ({ request }) => {
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
    const user = users.find((u) => u.id === userIdFromToken(token));
    if (!user) return HttpResponse.json({ message: 'Not authenticated.' }, { status: 401 });
    Object.assign(user, await request.json());
    return HttpResponse.json(withoutPassword(user));
  }),

  http.get('/api/users', () => HttpResponse.json(users.map(withoutPassword))),

  http.get('/api/users/:id', ({ params }) => {
    const user = users.find((u) => u.id === params.id);
    return user ? HttpResponse.json(withoutPassword(user)) : json404('User not found.');
  }),

  http.patch('/api/users/:id', async ({ params, request }) => {
    const user = users.find((u) => u.id === params.id);
    if (!user) return json404('User not found.');
    Object.assign(user, await request.json());
    return HttpResponse.json(withoutPassword(user));
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const index = users.findIndex((u) => u.id === params.id);
    if (index === -1) return json404('User not found.');
    users.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ------------------------------------------------------------ problems
  http.get('/api/problems', () => HttpResponse.json(problems)),

  http.get('/api/problems/:id', ({ params }) => {
    const problem = problems.find((p) => p.id === params.id);
    return problem ? HttpResponse.json(problem) : json404('Question not found.');
  }),

  http.post('/api/problems', async ({ request }) => {
    const problem = { id: nextId('problems'), votes: 0, views: 0, ...(await request.json()) };
    problems.push(problem);
    return HttpResponse.json(problem, { status: 201 });
  }),

  http.patch('/api/problems/:id', async ({ params, request }) => {
    const problem = problems.find((p) => p.id === params.id);
    if (!problem) return json404('Question not found.');
    Object.assign(problem, await request.json());
    return HttpResponse.json(problem);
  }),

  http.delete('/api/problems/:id', ({ params }) => {
    const index = problems.findIndex((p) => p.id === params.id);
    if (index === -1) return json404('Question not found.');
    problems.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ------------------------------------------------------------- answers
  http.get('/api/answers', ({ request }) => {
    const problemId = new URL(request.url).searchParams.get('problemId');
    const list = problemId ? answers.filter((a) => a.problemId === problemId) : answers;
    return HttpResponse.json(list);
  }),

  http.post('/api/answers', async ({ request }) => {
    const answer = { id: nextId('answers'), votes: 0, ...(await request.json()) };
    answers.push(answer);
    return HttpResponse.json(answer, { status: 201 });
  }),

  http.patch('/api/answers/:id', async ({ params, request }) => {
    const answer = answers.find((a) => a.id === params.id);
    if (!answer) return json404('Answer not found.');
    Object.assign(answer, await request.json());
    return HttpResponse.json(answer);
  }),

  http.delete('/api/answers/:id', ({ params }) => {
    const index = answers.findIndex((a) => a.id === params.id);
    if (index === -1) return json404('Answer not found.');
    answers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------------------------------------------------------------- tags
  http.get('/api/tags', () => HttpResponse.json(tags)),

  // ---------------------------------------------------------------- faqs
  http.get('/api/faqs', ({ request }) => {
    const category = new URL(request.url).searchParams.get('category');
    const list = category ? faqs.filter((f) => f.category === category) : faqs;
    return HttpResponse.json(list);
  }),

  http.post('/api/faqs', async ({ request }) => {
    const faq = { id: nextId('faqs'), ...(await request.json()) };
    faqs.push(faq);
    return HttpResponse.json(faq, { status: 201 });
  }),

  http.patch('/api/faqs/:id', async ({ params, request }) => {
    const faq = faqs.find((f) => f.id === params.id);
    if (!faq) return json404('FAQ not found.');
    Object.assign(faq, await request.json());
    return HttpResponse.json(faq);
  }),

  http.delete('/api/faqs/:id', ({ params }) => {
    const index = faqs.findIndex((f) => f.id === params.id);
    if (index === -1) return json404('FAQ not found.');
    faqs.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // --------------------------------------------------------- notifications
  http.get('/api/notifications', ({ request }) => {
    const userId = new URL(request.url).searchParams.get('userId');
    const list = notifications
      .filter((n) => !userId || n.userId === userId)
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return HttpResponse.json(list);
  }),

  http.post('/api/notifications', async ({ request }) => {
    const notification = { id: nextId('notifications'), ...(await request.json()) };
    notifications.push(notification);
    return HttpResponse.json(notification, { status: 201 });
  }),

  http.patch('/api/notifications/:id', async ({ params, request }) => {
    const notification = notifications.find((n) => n.id === params.id);
    if (!notification) return json404('Notification not found.');
    Object.assign(notification, await request.json());
    return HttpResponse.json(notification);
  }),
];
