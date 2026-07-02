# Developer Guide

This guide explains the system architecture, design decisions, and how to extend HireAI for Phase 2+.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Patterns](#design-patterns)
3. [Backend Deep Dive](#backend-deep-dive)
4. [Frontend Deep Dive](#frontend-deep-dive)
5. [How to Build Phase 2 Modules](#how-to-build-phase-2-modules)
6. [Interview Talking Points](#interview-talking-points)
7. [Performance & Scaling](#performance--scaling)

---

## Architecture Overview

HireAI uses a **layered, modular architecture** that separates concerns and allows independent feature development.

### High-Level Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  Pages → Components → Services → Store (Redux + React Query)
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP (JSON)
┌──────────────────▼──────────────────────────────────────┐
│                 Express Backend                         │
│  Routes → Controllers → Services → Repositories → DB   │
└──────────────────┬──────────────────────────────────────┘
                   │
      ┌────────────┼─────────────┐
      ▼            ▼             ▼
   MongoDB       Redis        Docker
  (Persistence) (Cache/Queue) (Code Sandbox)
```

### Module Structure

Each module (Auth, Candidate, Recruiter, Coding Platform, etc.) follows this pattern:

**Backend**
```
features/
├── auth/
│   ├── auth.controller.ts        # HTTP handlers
│   ├── auth.service.ts           # Business logic
│   ├── auth.routes.ts            # Express routes
│   └── auth.validator.ts         # Zod schemas
├── candidates/                   # (Phase 2)
│   ├── candidate.controller.ts
│   ├── candidate.service.ts
│   ├── repositories/
│   │   └── candidate.repo.ts    # Data access
│   └── ...
└── ...
```

**Frontend**
```
features/
├── auth/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── ...
│   ├── authSlice.ts             # Redux state
│   ├── authApi.ts               # API calls
│   ├── useAuth.ts               # React Query hooks
│   └── ...
├── dashboard/
│   ├── candidate/               # (Phase 2)
│   ├── recruiter/
│   └── admin/
└── ...
```

---

## Design Patterns

### 1. Repository Pattern (Data Access)

**Why**: Decouples service logic from Mongoose/database details. Easy to mock for testing.

```typescript
// ❌ WITHOUT Repository (tight coupling)
class AuthService {
  async signup(email: string) {
    const existing = await User.findOne({ email }); // Direct DB call
    if (existing) throw new Error('Email taken');
  }
}

// ✅ WITH Repository (loose coupling, testable)
class AuthService {
  constructor(private userRepo: UserRepository) {}
  
  async signup(email: string) {
    const existing = await this.userRepo.findByEmail(email); // Abstraction
    if (existing) throw new Error('Email taken');
  }
}
```

**When to Use**: Anytime you're accessing data (queries, creates, updates).

**Example**: `backend/src/repositories/user.repository.ts`

### 2. Service Layer (Business Logic)

**Why**: Centralizes rules, makes them reusable, testable without HTTP context.

```typescript
// ❌ Logic in Controller (duplicate code if another route needs this)
export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new Error('Invalid email');
  const match = await user.comparePassword(req.body.password);
  if (!match) throw new Error('Invalid password');
  // ... token generation, cookie setting, etc
}

// ✅ Logic in Service (reusable, testable)
export class AuthService {
  async login(email, password) {
    const user = await this.userRepo.findByEmail(email, true);
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    const match = await user.comparePassword(password);
    if (!match) throw ApiError.unauthorized('Invalid email or password');
    return this.issueTokenPair(user);
  }
}
```

**Example**: `backend/src/services/auth.service.ts`

### 3. Middleware Pipeline (Cross-Cutting Concerns)

**Why**: Separates authentication, validation, rate limiting from business logic.

```typescript
// ❌ Everything in the handler
router.post('/profile', (req, res) => {
  // Check auth
  if (!req.headers.authorization) return res.status(401).json(...);
  // Validate input
  if (!req.body.name || req.body.name.length < 2) return res.status(400).json(...);
  // Rate limit
  // ... actual logic
});

// ✅ Middleware chain (declarative, reusable)
router.post('/profile',
  authenticate,                      // auth middleware
  validate(updateProfileSchema),     // validation middleware
  apiLimiter,                        // rate limiting middleware
  updateProfileHandler               // the actual handler
);
```

**Example**: `backend/src/middlewares/` (auth, validate, rateLimiter, error handler)

### 4. Redux + React Query Separation

**Why**: Redux for **client state** (auth, UI), React Query for **server state** (interviews, jobs, submissions).

```typescript
// ❌ Using Redux for server data (causes sync issues)
const interviews = useSelector(state => state.interviews); // stale data?

// ✅ Using React Query for server data (automatic sync)
const { data: interviews } = useQuery({
  queryKey: ['interviews'],
  queryFn: () => apiClient.get('/interviews'),
});

// ✅ Using Redux for client state (auth, sidebar collapsed, theme)
const { user, accessToken } = useSelector(state => state.auth);
const { sidebarCollapsed, theme } = useSelector(state => state.ui);
```

**Example**: 
- Redux: `frontend/src/features/auth/authSlice.ts`, `frontend/src/store/uiSlice.ts`
- React Query: `frontend/src/features/auth/useAuth.ts`

---

## Backend Deep Dive

### Request Lifecycle

```
1. HTTP Request arrives
2. Middleware pipeline runs (left to right):
   - morgan (logging)
   - cors, helmet (security)
   - authenticate (verify JWT)
   - validate (Zod schema check)
   - apiLimiter (rate limiting)
3. Route handler (controller) runs
4. Controller calls service(s)
5. Service uses repository/external APIs
6. Response serialized as JSON
7. Error handler catches any thrown errors
8. Client receives HTTP response
```

### Example: Signup Flow

```typescript
// 1. Route definition (routes/auth.routes.ts)
router.post('/signup', 
  authLimiter,                              // Middleware 1: rate limit
  validate(signupSchema),                   // Middleware 2: validate input
  authController.signup                      // Handler
);

// 2. Controller (controllers/auth.controller.ts)
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.signup(req.body);  // Delegate to service
  res.status(201).json(new ApiResponse(201, 'Account created', { user }));
});

// 3. Service (services/auth.service.ts)
async signup(input: SignupInput): Promise<IUser> {
  const existing = await userRepository.findByEmail(input.email);  // Check existing
  if (existing) throw ApiError.conflict('Email already registered');
  
  const user = await userRepository.create(input);  // Create user
  const { plainToken, hashedToken } = tokenService.generateTokenPair();  // Generate token
  user.emailVerificationToken = hashedToken;
  await userRepository.save(user);
  
  await emailService.sendVerificationEmail(user.email, user.name, verifyUrl);  // Email
  return user;
}

// 4. Repository (repositories/user.repository.ts)
async create(input: CreateUserInput): Promise<IUser> {
  return User.create(input);  // Pure data access
}

// 5. Error Handler catches ApiError and responds
```

### Extending with a New Module

**Example**: Building the "Jobs" module (Phase 2)

```typescript
// Step 1: Define the model (src/models/Job.ts)
export interface IJob extends Document {
  title: string;
  company: Types.ObjectId;
  description: string;
  // ... other fields
}

// Step 2: Create repository (src/repositories/job.repository.ts)
export class JobRepository {
  async create(input: CreateJobInput): Promise<IJob> {
    return Job.create(input);
  }
  async findById(id: string): Promise<IJob | null> {
    return Job.findById(id).populate('company');
  }
  // ... other methods
}

// Step 3: Create service (src/services/job.service.ts)
export class JobService {
  constructor(private jobRepo: JobRepository) {}
  
  async createJob(userId: string, input: CreateJobInput): Promise<IJob> {
    // Verify user is a recruiter
    const user = await userRepository.findById(userId);
    if (user.role !== 'recruiter') throw ApiError.forbidden();
    
    // Verify company ownership
    const company = await companyRepository.findById(input.company);
    if (company.owner.toString() !== userId) throw ApiError.forbidden();
    
    return this.jobRepo.create({ ...input, createdBy: userId });
  }
}

// Step 4: Create controller (src/controllers/job.controller.ts)
export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.createJob(req.user!.id, req.body);
  res.status(201).json(new ApiResponse(201, 'Job created', { job }));
});

// Step 5: Create validators (src/validators/job.validator.ts)
export const createJobSchema = z.object({
  title: z.string().min(5),
  company: z.string(),
  description: z.string().min(50),
  // ...
});

// Step 6: Create routes (src/routes/job.routes.ts)
const router = Router();
router.post('/', authenticate, authorize('recruiter'), validate(createJobSchema), createJob);
export default router;

// Step 7: Mount in API router (src/routes/index.ts)
router.use('/jobs', jobRoutes);

// Step 8: Write tests (src/test/jobs.test.ts)
describe('Job module', () => {
  it('creates a job', async () => {
    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Senior React Dev', ... });
    expect(res.status).toBe(201);
  });
});
```

---

## Frontend Deep Dive

### State Management Strategy

```
┌─────────────────────────────────────────────────────┐
│                   Redux Store                        │
│ (Who am I? Is sidebar open? What's the theme?)      │
│ ├─ auth: { user, accessToken, isInitializing }     │
│ └─ ui: { sidebarCollapsed, theme }                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              React Query Cache                       │
│ (What data lives on the server?)                    │
│ ├─ bootstrap-auth                                   │
│ ├─ ['interviews']                                   │
│ ├─ ['interviews', interviewId]                      │
│ ├─ ['jobs']                                         │
│ └─ ['jobs', jobId]                                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Component State (useState)              │
│ (Temporary UI state: form input, modal open?)       │
│ └─ Used sparingly, for UI-only concerns            │
└─────────────────────────────────────────────────────┘
```

### React Query Patterns

```typescript
// 1. Fetch (GET)
const { data: interviews, isLoading, error } = useQuery({
  queryKey: ['interviews'],
  queryFn: () => apiClient.get('/interviews'),
});

// 2. Fetch with filters
const { data: jobs } = useQuery({
  queryKey: ['jobs', { role, company }],
  queryFn: () => apiClient.get('/jobs', { params: { role, company } }),
});

// 3. Fetch single item
const { data: interview } = useQuery({
  queryKey: ['interviews', interviewId],
  queryFn: () => apiClient.get(`/interviews/${interviewId}`),
});

// 4. Mutate (POST/PUT/DELETE)
const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/jobs', data),
  onSuccess: (res) => {
    // Invalidate the 'jobs' query so it refetches
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    toast.success('Job created!');
  },
});

mutation.mutate({ title: 'Senior Dev' });
```

### Building a New Page

**Example**: Candidate's "My Interviews" page (Phase 2)

```typescript
// 1. API function (features/interviews/interviewsApi.ts)
export const interviewsApi = {
  getCandidateInterviews: () =>
    apiClient.get<ApiSuccess<{ interviews: Interview[] }>>('/interviews/me'),
  
  getInterviewDetail: (id: string) =>
    apiClient.get<ApiSuccess<{ interview: Interview }>>(`/interviews/${id}`),
};

// 2. React Query hooks (features/interviews/useInterviews.ts)
export function useCandidateInterviews() {
  return useQuery({
    queryKey: ['candidate-interviews'],
    queryFn: () => interviewsApi.getCandidateInterviews(),
  });
}

export function useInterviewDetail(id: string) {
  return useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewsApi.getInterviewDetail(id),
  });
}

// 3. Page component (pages/candidate/InterviewsPage.tsx)
export function InterviewsPage() {
  const { data, isLoading, error } = useCandidateInterviews();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  
  return (
    <DashboardLayout sidebarItems={navItems} pageTitle="My Interviews">
      <div className="space-y-4">
        {data?.data?.interviews.map(interview => (
          <InterviewCard key={interview._id} interview={interview} />
        ))}
      </div>
    </DashboardLayout>
  );
}

// 4. Card component (features/interviews/InterviewCard.tsx)
export function InterviewCard({ interview }: { interview: Interview }) {
  const [showDetail, setShowDetail] = useState(false);
  
  return (
    <div className="bg-base-surface rounded-xl p-6 border border-base-border cursor-pointer"
         onClick={() => setShowDetail(true)}>
      <h3 className="font-semibold text-ink">{interview.jobTitle}</h3>
      <p className="text-ink-muted">{interview.company}</p>
      <p className="text-2xl font-bold text-accent mt-4">{interview.score}/100</p>
      
      {showDetail && (
        <InterviewDetail id={interview._id} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}
```

---

## How to Build Phase 2 Modules

### Phase 2 Checklist (for each module)

- [ ] **Database**: Define all models in `src/models/`
- [ ] **API**: Create endpoints (routes, controllers, services, repos)
- [ ] **Validation**: Write Zod schemas for all inputs
- [ ] **Tests**: Write backend tests covering happy path + error cases
- [ ] **Frontend**: Create pages, hooks, API clients
- [ ] **UI**: Design cards, forms, tables matching design system
- [ ] **Integration**: Wire up auth, permissions, error handling
- [ ] **Docs**: Update user guide with feature walkthrough

### Recommended Order for Phase 2

1. **Candidate Module** (dependency for everything else)
   - Resume upload (Cloudinary integration)
   - Resume analysis (OpenAI integration)
   - Job browsing and application

2. **Recruiter Module** (dependency for interviews)
   - Company management
   - Job creation and management
   - Candidate list and scheduling

3. **Coding Platform** (dependency for interviews)
   - Problem management
   - Code execution engine (Docker integration)
   - Submission storage and grading

4. **AI Interview Module** (uses coding platform + candidate/recruiter modules)
   - Question generation (OpenAI)
   - Interview flow and scoring
   - Transcript storage

5. **Resume Analyzer**
   - PDF parsing
   - Skill extraction
   - ATS scoring

6. **Analytics Dashboard**
   - Candidate metrics (scores, trends)
   - Recruiter funnel (applied → hired)
   - Charts (recharts integration)

7. **Notifications**
   - Email queue (BullMQ)
   - In-app notifications
   - Reminders

---

## Interview Talking Points

When asked "Tell me about HireAI" or "Walk me through your architecture":

### Elevator Pitch (2 min)

> "HireAI is a technical interview platform. Candidates upload resumes and take coding/AI interviews. Recruiters post jobs, configure interviews, and review results with full transparency — a transcript, reasoning trail, and adaptive questioning history. We built it with clean architecture: repositories abstract data, services hold business logic, controllers expose HTTP endpoints. Frontend uses Redux for client state and React Query for server state. The result is modular code that scales — Phase 2 adds resume analysis, job management, and analytics without touching existing modules."

### Deep Dive on Authentication (5 min)

> "Authentication uses JWT with refresh token rotation. Access tokens expire in 15 minutes and are stored in Redux. Refresh tokens are httpOnly cookies (XSS-safe) with 7-day expiry. On every 401 response, the frontend automatically calls `/refresh` to get a new access token — if that fails, we redirect to login. Every refresh token is hashed and stored in a Sessions table, so we can revoke all tokens for a user (logout everywhere) by incrementing a token version in the User doc. Passwords are bcrypted with salt 12, and we never return them in JSON responses."

### Deep Dive on Authorization (5 min)

> "We use role-based access control. A user is either Candidate, Recruiter, or Admin. On the frontend, `RoleProtectedRoute` checks `store.auth.user.role` and redirects if unauthorized. On the backend, the `authorize` middleware checks `req.user.role` after `authenticate` verifies the JWT. For example, only recruiters can POST /jobs. If a candidate tries, they get a 403 Forbidden. We track role in the JWT payload (not re-queried from the database on every request) for performance."

### Deep Dive on Error Handling (5 min)

> "Errors are either **operational** (expected, safe to expose to the client like 'Email already exists') or **programmer errors** (bugs, which get a generic 500 in production). We have an `ApiError` class with static factories: `ApiError.notFound()`, `ApiError.conflict()`, `ApiError.unauthorized()`. Controllers throw these, and a global error handler catches them, logs them, and responds with the right status code. In tests, we verify both the happy path and error cases — e.g., signup with a duplicate email should return 409, not 500."

### Deep Dive on Testing (5 min)

> "We use Jest + Supertest for integration tests. The test database is an in-memory MongoDB instance (`mongodb-memory-server`), so tests don't touch production. We test auth flows: signup → login → refresh → logout. We test rate limiting, token expiry, and RBAC. We also test data validation — zod schemas reject invalid inputs before hitting the database. On the frontend, we'd add Vitest + React Testing Library for component tests (Phase 2)."

### Deep Dive on Security (10 min)

Mention these in order:

1. **JWT + Refresh Token Rotation**: Access tokens short-lived, refresh tokens can be revoked
2. **RBAC**: Role checks at routes + services
3. **Input Validation**: Zod schemas, Mongoose constraints
4. **Rate Limiting**: Redis-backed, stricter on auth endpoints
5. **Prepared Queries**: Mongoose parameterizes by default, no SQL injection
6. **XSS Protection**: Refresh token in httpOnly cookie (not in localStorage)
7. **CORS**: Restricted to frontend origin
8. **Helmet**: Sets security headers (HSTS, X-Frame-Options, etc.)
9. **Secrets Management**: .env file in local dev, environment variables in production
10. **Code Execution Sandbox**: Candidate submissions run in isolated Docker containers with CPU/memory limits, no network access

### Deep Dive on Scalability (10 min)

> "For read scalability, we use MongoDB replicas and Redis caching. Rate limit counts are stored in Redis, not the database. For write scalability, we use BullMQ for async jobs — email sending, interview grading, report generation don't block HTTP responses. On the frontend, code-splitting with Vite ensures the initial bundle is small. React Query automatically dedupes requests and caches results. If we hit database limits, we'd add pagination, indexes, and sharding. Docker makes it easy to horizontally scale: spin up multiple backend instances behind a load balancer."

### Red Flags to Avoid

- ❌ "I built this in one day" — (implies lack of thoughtfulness)
- ❌ "I used X because it's popular" — (no conviction)
- ❌ "I didn't write tests" — (code quality concern)
- ❌ "Passwords are stored in plaintext" — (security concern)
- ❌ "Access tokens live in localStorage" — (XSS vulnerability)

---

## Performance & Scaling

### Current Bottlenecks & Solutions

| Bottleneck | Phase 1 | Phase 2+ Solution |
|---|---|---|
| Email sending blocks HTTP | Logs to console | BullMQ job queue |
| AI interview generation | N/A | Stream OpenAI responses (don't wait for full answer) |
| Resume PDF parsing | N/A | Queue job, notify when ready |
| Database queries | Single MongoDB instance | Replicas + read preference (read from secondary) |
| Rate limits in memory | Not enforced | Redis store (survives restarts) |
| Static assets on CDN | Nginx serves locally | CloudFlare / S3 + CloudFront |
| No caching | Every request hits DB | Redis caching + React Query client-side cache |

### Database Indexing

Current indexes (defined in models):

```typescript
// User
- email (unique)
- googleId (sparse, unique)
- role

// Job
- company
- status
- text search on title, description, skills

// Interview
- candidate
- job
- status
- createdAt (for pagination)

// Submission
- candidate
- problem
- status
- createdAt

// Session (TTL index)
- expiresAt (auto-deletes old sessions)
```

Add more as you profile queries. MongoDB Compass or Atlas Charts show slow queries.

### Caching Strategy

```typescript
// Data that changes rarely → cache 5-10 minutes
const { data: jobs } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => apiClient.get('/jobs'),
  staleTime: 1000 * 60 * 5, // 5 min
});

// Data that changes frequently → cache 30 seconds
const { data: interviews } = useQuery({
  queryKey: ['interviews'],
  queryFn: () => apiClient.get('/interviews'),
  staleTime: 1000 * 30,
});

// Data you mutate often → no cache
const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/jobs', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] }); // Refetch immediately
  },
});
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/v1/health

# Using k6
k6 run load-test.js
```

Monitor under load:

- CPU usage
- Memory usage
- Database connection pool
- Redis memory
- Response times (p50, p95, p99)

---

## Common Questions & Answers

**Q: Why not use Passport.js for auth?**
A: We built it manually for better control. Passport is great for complex OAuth flows, but we wanted to understand every step — especially the refresh token rotation. Manual auth also means fewer dependencies.

**Q: Why MongoDB + Mongoose instead of SQL?**
A: MongoDB's flexible schema is great for iterative development. Mongoose adds structure and validation. For this platform, the document model maps naturally to domain objects. No regrets so far.

**Q: Why Redux + React Query instead of just Context API?**
A: Context + useState can work but gets messy with server state. React Query handles caching, deduping, and synchronization. Redux stays small (just auth + UI) and predictable.

**Q: How do you prevent race conditions in interviews?**
A: Each interview gets a unique ID. Submissions are immutable once created. We use database-level constraints and optimistic locking (version fields) if needed. For concurrent interview updates, we queue changes via BullMQ.

**Q: What about PII (personally identifiable information)?**
A: Resumes, emails, and interview transcripts are sensitive. We store everything encrypted at rest (MongoDB encryption plugin). Backups are encrypted. In production, we'd add request logging to S3 (not in-memory), and comply with GDPR (right to deletion, data export).

---

## Useful Commands

```bash
# Backend
npm run dev              # Start development server
npm run build            # Compile TypeScript
npm run lint             # Check code style
npm run format           # Auto-format code
npm test                 # Run tests
npm run test:coverage    # Coverage report

# Frontend
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build locally
npm run lint             # Check code style
npm run format           # Auto-format code

# Docker
docker-compose up -d      # Start all services
docker-compose logs -f    # Follow logs
docker-compose down       # Stop all services
docker-compose exec backend npm test  # Run tests in container

# Database
mongosh mongodb://localhost:27017/hireai  # Connect to MongoDB
redis-cli                 # Connect to Redis
redis-cli MONITOR         # See all Redis commands in real-time
```

---

**Next Step**: Start Phase 2 by creating the Candidate module. Use these patterns and the checklist above as your guide.
