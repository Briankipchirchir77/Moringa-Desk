# MoringaDesk

A Stack Overflow–style Q&A platform for a Moringa School cohort — students post
technical problems, get answers from peers and technical mentors, vote,
follow questions, and browse a shared FAQ. Built entirely in React
(front-end only), with role-based views for students and admins.

## Live demo

The project runs entirely client-side (no real backend required — see
[Architecture](#architecture-mock-backend--the-explore-tab) below), so you
can run it locally in under a minute. (Optional deployed URL: add here if
hosted on Netlify/Vercel.)

## Features

- Auth (login/register) with role-based routing (student vs. admin)
- Session persists across page reloads
- Ask, answer, vote on, and follow questions; accept a solution
- Tag-based browsing, search, and filtering
- FAQ section, notifications, and a profile page
- Admin dashboard: manage users, content, FAQs, and view reports
- **Explore tab** — live data pulled from a real external API (see below)

## Setup instructions

Requires Node.js 18+ and npm.

```bash
git clone https://github.com/Briankipchirchir77/Moringa-Desk.git
cd Moringa-Desk
npm install
npm run dev
```

Open the URL Vite prints (defaults to `http://localhost:5173`).

Other scripts:

```bash
npm run build      # production build
npm run preview    # preview the production build locally
npm run lint        # eslint
npm test             # run the Vitest suite
```

### Demo login

Any seeded email below + password `password123` (or register a new account —
registration works end-to-end against the mock backend):

| Email | Role |
|---|---|
| sarah.jane@moringaschool.com | admin |
| alex.kimani@moringaschool.com | student |
| brandon.wanja@moringaschool.com | student |
| clara.mwangi@moringaschool.com | student |
| ian.kipkoech@moringaschool.com | student |

## Architecture: mock backend + the Explore tab

This app doesn't have a real backend yet, so most of its data (users,
questions, answers, tags, FAQs, notifications) is served by
[Mock Service Worker](https://mswjs.io/) (`src/mocks/`) — an in-memory,
relationally-consistent fake API that intercepts `fetch` calls the same way
a real server would. It resets on every page reload; it's a stand-in for a
backend that doesn't exist yet, not persistent storage.

To satisfy the assignment's requirement of integrating a **real external
API**, the **Explore** tab (`/explore`) calls the live, public, unauthenticated
[Stack Exchange API](https://api.stackexchange.com/docs) directly — real,
current Stack Overflow questions, filterable by tag via a controlled search
input, dynamically rendered, each linking out to the real question on
stackoverflow.com.

### API used and endpoint(s)

**Stack Exchange API** — `https://api.stackexchange.com/2.3`

- `GET /questions?order=desc&sort=activity&site=stackoverflow&pagesize=10&filter=default`
  — most recently active questions
- `GET /questions?...&tagged={tag}` — same, filtered to a specific tag
  (used when a user searches or clicks a suggested tag chip on the Explore page)

No API key is required for this request volume. Implementation:
[src/features/community/stackExchangeApi.js](src/features/community/stackExchangeApi.js)
(RTK Query) and
[src/features/community/ExplorePage.jsx](src/features/community/ExplorePage.jsx).

## Tech stack

React 19, React Router, Redux Toolkit + RTK Query, Vite, Mock Service Worker,
Vitest + React Testing Library, ESLint.

## Known bugs / challenges

- The mock backend resets on every page reload — data created during a demo
  (new questions, answers, registered accounts) doesn't persist between
  sessions. This is expected given there's no real database yet.
- Stack Exchange's public API is rate-limited per IP; heavy repeated use of
  the Explore tab in a short window can return a `throttle_violation` error
  from the API (the page surfaces this as a normal error state rather than
  crashing).
- No automated end-to-end/browser test suite yet — coverage is unit tests
  (Vitest) around slices/utilities; manual click-through and screenshot
  verification were used to confirm auth/session and Explore-tab behavior
  during development.
