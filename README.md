# HireAI — AI-Powered Technical Interview Platform

A production-ready SaaS platform for companies to conduct automated technical assessments and interviews using AI, with secure code execution, adaptive questioning, and comprehensive analytics.

## 🎯 What's Built in Phase 1

- ✅ Complete authentication system (signup, login, email verification, password reset, Google OAuth)
- ✅ Role-based access control (Candidate, Recruiter, Admin)
- ✅ 11 MongoDB models with full schema definitions
- ✅ Clean architecture: repositories, services, controllers, middleware
- ✅ Protected routes and dashboard shells for all three roles
- ✅ Responsive dark-mode SaaS UI with design system
- ✅ React Query + Redux integration
- ✅ Rate limiting, input validation, error handling
- ✅ Docker support (frontend, backend, MongoDB, Redis)
- ✅ GitHub Actions CI/CD pipeline
- ✅ Comprehensive test suite scaffold (auth tests)

## 📦 Tech Stack

**Backend**
- Node.js 20, Express.js, TypeScript
- MongoDB + Mongoose, Redis + BullMQ
- JWT authentication with refresh token rotation
- Rate limiting, input sanitization, Swagger/OpenAPI docs

**Frontend**
- React 19, TypeScript, Vite
- Tailwind CSS + custom design tokens
- Redux Toolkit + React Query
- React Hook Form + Zod validation
- Monaco Editor integration (for coding platform)

**Infrastructure**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Secured code execution via containerized sandboxes (Python, JavaScript, Java, C++)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB (or use container)
- Redis (or use container)

### Local Development

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Back to root
cd ..

# Copy environment templates and customize
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services (MongoDB, Redis, backend, frontend)
docker-compose up -d

# Or, to run backend/frontend locally against containerized MongoDB/Redis:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

Visit `http://localhost:5173` for the frontend, `http://localhost:5000/api-docs` for API docs.

### Test Authentication Flow

1. **Signup**: Go to `/signup`, create a candidate or recruiter account
2. **Email Verification**: In dev, check logs or click the verification link directly
3. **Login**: Use your credentials on `/login`
4. **Dashboard**: You'll land in your role's dashboard (candidate/recruiter/admin)
5. **Protected Routes**: Try navigating to a role you don't have — it'll redirect

## 📚 Documentation

- **[IMPLEMENTATION_STEPS.md](./docs/IMPLEMENTATION_STEPS.md)** — Step-by-step setup, environment variables, database seed, running tests
- **[USER_GUIDE.md](./docs/USER_GUIDE.md)** — Feature walkthrough for candidates, recruiters, admins
- **[DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** — Architecture deep-dive, how to extend, interviewing tips, deployment

## 🔧 Architecture Highlights

### Backend
```
src/
  config/        # ENV, DB, Redis, Swagger
  controllers/   # HTTP layer (auth, users - future modules)
  services/      # Business logic (AuthService, EmailService, etc)
  repositories/  # Data access (UserRepository, SessionRepository)
  middlewares/   # Auth, rate limiting, validation, error handling
  routes/        # Express routers (auth, users - future modules)
  models/        # Mongoose schemas (11 collections)
  utils/         # JWT, ApiError, ApiResponse, logger
  ai/            # OpenAI client wrapper
  docker/runners # Code execution sandbox images
```

### Frontend
```
src/
  features/auth/           # Signup, login, forgot password (complete)
  pages/                   # Candidate, recruiter, admin dashboards
  components/
    layout/                # Sidebar, DashboardLayout
    ui/                    # LogoMark, form fields, cards
  store/                   # Redux slices (auth, ui)
  services/                # Axios client, auth API calls
  types/                   # TypeScript interfaces
  hooks/                   # React Query hooks (useAuth, etc)
  layouts/                 # Page templates
```

## 🔒 Security

- **JWT + Refresh Tokens**: Short-lived access tokens (15m), long-lived refresh tokens (7d) with rotation
- **RBAC**: Role-based access control enforced at route and service level
- **Input Validation**: Zod schemas on every endpoint
- **Rate Limiting**: Redis-backed, adaptive per endpoint (stricter on auth)
- **SQL/NoSQL Injection**: Mongoose + input sanitization + parameterized queries
- **CORS**: Restricted to frontend origin in production
- **HTTPS**: Enforce in production via nginx/load balancer
- **Code Execution**: Sandboxed in isolated Docker containers with CPU/memory limits, no network access

## 📊 What's Next (Phase 2+)

1. **Candidate Module** — Resume upload, ATS analysis, job recommendations, profile completion
2. **Recruiter Module** — Job creation, candidate management, scheduling interviews, comparison reports
3. **Coding Platform** — Monaco editor, code execution, test cases, leaderboard
4. **AI Interview** — Question generation from resume/JD, adaptive questioning, answer evaluation, interview replay
5. **Resume Analyzer** — PDF extraction, skill detection, ATS scoring
6. **Analytics** — Candidate/recruiter dashboards, funnel visualization, scoring distribution
7. **Notifications** — Email alerts, in-app notifications, reminders
8. **Testing** — Unit tests, integration tests, E2E tests
9. **Deployment** — Kubernetes manifests, terraform, monitoring (DataDog/New Relic)

## 💡 Differentiator: AI Interview Replay

After each AI interview, candidates get:
- **Full transcript** with timestamps
- **Reasoning trail** behind each score (Claude's step-by-step thinking)
- **Adaptive question history** showing why questions changed based on previous answers
- **Side-by-side comparison** of expected vs. actual answers

This transparency builds trust and turns interviews into a learning opportunity.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/module-name`
2. Keep modules isolated (one module per PR)
3. Follow the established patterns: repository → service → controller
4. Write tests for critical paths
5. Run `npm run lint` and `npm run format` before committing

## 📞 Support

For questions about the architecture or implementation, refer to `DEVELOPER_GUIDE.md` or open an issue.

---

**Built with ❤️ for technical recruiters and engineers**
