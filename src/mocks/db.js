// In-memory mock "database" for MSW. Resets on every page reload — this
// is a stand-in until a real backend exists, not persistent storage.
// Demo login: any seeded user's email below + password "password123".

let nextIds = {
  users: 6,
  problems: 4,
  answers: 4,
  tags: 17,
  faqs: 7,
  notifications: 6,
};

export function nextId(kind) {
  return String(nextIds[kind]++);
}

export const users = [
  {
    id: '1',
    name: 'Alex Kimani',
    email: 'alex.kimani@moringaschool.com',
    password: 'password123',
    role: 'student',
    cohort: 'FT-09',
  },
  {
    id: '2',
    name: 'Brandon Wanja',
    email: 'brandon.wanja@moringaschool.com',
    password: 'password123',
    role: 'student',
    cohort: 'FT-09',
  },
  {
    id: '3',
    name: 'Clara Mwangi',
    email: 'clara.mwangi@moringaschool.com',
    password: 'password123',
    role: 'student',
    cohort: 'FT-08',
  },
  {
    id: '4',
    name: 'Ian Kipkoech',
    email: 'ian.kipkoech@moringaschool.com',
    password: 'password123',
    role: 'student',
    cohort: 'FT-09',
  },
  {
    id: '5',
    name: 'Sarah Jane',
    email: 'sarah.jane@moringaschool.com',
    password: 'password123',
    role: 'admin',
    cohort: 'Technical Mentor',
  },
];

export const tags = [
  { id: '1', name: 'reactjs' },
  { id: '2', name: 'javascript' },
  { id: '3', name: 'python' },
  { id: '4', name: 'flask' },
  { id: '5', name: 'django' },
  { id: '6', name: 'css' },
  { id: '7', name: 'docker' },
  { id: '8', name: 'postgres' },
  { id: '9', name: 'html' },
  { id: '10', name: 'mongodb' },
  { id: '11', name: 'nodejs' },
  { id: '12', name: 'hooks' },
  { id: '13', name: 'auth' },
  { id: '14', name: 'backend' },
  { id: '15', name: 'frontend' },
  { id: '16', name: 'sqlalchemy' },
];

const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

export const problems = [
  {
    id: '1',
    title: 'React useEffect rendering multiple times on state update',
    body:
      "I am building a search input filter, but my API fetch inside useEffect is triggered infinitely. Every time setResults updates state, the hook re-renders.\n\nuseEffect(() => {\n  fetchData();\n}, [query]); // infinite loop",
    userId: '2',
    tagIds: ['1', '15', '12'],
    votes: 12,
    views: 104,
    createdAt: minsAgo(10),
    solvedAnswerId: '1',
    followerIds: ['1'],
    flagged: false,
  },
  {
    id: '2',
    title: 'How to properly run migrations in Flask using Docker',
    body:
      'I have a Flask project set up inside a dockerized environment but running `flask db upgrade` fails with a connection refused error against Postgres.',
    userId: '3',
    tagIds: ['3', '4', '7'],
    votes: 8,
    views: 42,
    createdAt: hoursAgo(1),
    solvedAnswerId: null,
    followerIds: [],
    flagged: false,
  },
  {
    id: '3',
    title: 'Authentication token missing headers in node/express requests',
    body:
      "My frontend sends the Authorization header on every request, but req.headers.authorization is undefined on the Express side. CORS is enabled with credentials: true.",
    userId: '4',
    tagIds: ['11', '13', '14'],
    votes: 5,
    views: 18,
    createdAt: hoursAgo(2),
    solvedAnswerId: null,
    followerIds: ['1'],
    flagged: false,
  },
];

export const answers = [
  {
    id: '1',
    problemId: '1',
    userId: '5',
    body:
      'The problem is you are probably generating a new `query` object on every single render. Wrap the query creation in a `useMemo` hook, or verify that you are not mutating it.',
    votes: 8,
    createdAt: hoursAgo(2),
    flagged: false,
  },
  {
    id: '2',
    problemId: '1',
    userId: '3',
    body: 'Also worth double-checking your dependency array only lists primitives, not objects/arrays created inline.',
    votes: 2,
    createdAt: hoursAgo(1),
    flagged: false,
  },
  {
    id: '3',
    problemId: '2',
    userId: '4',
    body:
      'Check that your DATABASE_URL uses the docker-compose service name (e.g. `db`) as the host, not `localhost` — that trips up almost everyone the first time.',
    votes: 3,
    createdAt: minsAgo(30),
    flagged: false,
  },
];

export const faqs = [
  {
    id: '1',
    category: 'Enrollment',
    question: 'How do I submit my IP projects?',
    answer:
      'Submit your Independent Projects via GitHub Classroom links provided in Canvas. Make sure to commit and push changes before the 11:59 PM Sunday deadline.',
  },
  {
    id: '2',
    category: 'Grading',
    question: 'What is the passing grade for Moringa School cohorts?',
    answer: 'A passing grade is 70% or higher on both the project rubric and the technical assessment.',
  },
  {
    id: '3',
    category: 'Tech Stack',
    question: 'I have Docker issues on my Apple M-series chip.',
    answer:
      'Use the `--platform linux/amd64` flag on images without an arm64 build, or switch the base image to one with multi-arch support.',
  },
  {
    id: '4',
    category: 'Enrollment',
    question: 'How do I request a 1-on-1 session with a TM?',
    answer: 'Book a slot through the Technical Mentor calendar link shared in your cohort Slack channel.',
  },
  {
    id: '5',
    category: 'Grading',
    question: 'Can I self-pace or retake a module?',
    answer: 'Yes — reach out to your program manager to discuss a self-paced track or a module retake.',
  },
  {
    id: '6',
    category: 'Enrollment',
    question: 'Where can I find my final transcript?',
    answer: 'Transcripts are issued through the Moringa School registrar portal after program completion.',
  },
];

export const notifications = [
  {
    id: '1',
    userId: '1',
    type: 'answer',
    message: "Brandon W. answered your question 'React useEffect rendering multiple times on state update'. Check it out!",
    read: false,
    createdAt: minsAgo(2),
  },
  {
    id: '2',
    userId: '1',
    type: 'vote',
    message: '5 students upvoted your explanation about dockerizing standard Flask database migrations.',
    read: false,
    createdAt: hoursAgo(1),
  },
  {
    id: '3',
    userId: '1',
    type: 'system',
    message: 'Reminder: IP-04 Angular Dashboard project is due this Sunday at 11:59 PM. Submit your repo early.',
    read: true,
    createdAt: hoursAgo(24),
  },
  {
    id: '4',
    userId: '1',
    type: 'accepted',
    message: "Alex Kimani accepted your suggested fix for 'Flask SQLAlchemy session binding issues'.",
    read: true,
    createdAt: hoursAgo(48),
  },
  {
    id: '5',
    userId: '1',
    type: 'badge',
    message: 'You have resolved 10 peer programming challenges this month. Your reputation score increased +50.',
    read: true,
    createdAt: hoursAgo(72),
  },
];
