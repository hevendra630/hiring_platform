# HireAI — AI-Powered Technical Interview Platform

A SaaS platform for companies to run automated technical assessments and AI-driven interviews, with sandboxed code execution, adaptive conversational interviewing, and role-based dashboards for candidates, recruiters, and admins.

## Core features

- **Full authentication system**: signup, login, email verification, password reset, Google OAuth
- **JWT access + refresh tokens with rotation**: short-lived access tokens paired with long-lived refresh tokens; a per-user `tokenVersion` is bumped on password change or logout, instantly invalidating all previously issued tokens without a token blocklist
- **Role-based access control (RBAC)**: Candidate, Recruiter, and Admin roles enforced via route-level middleware (`authenticate` + `authorize`)
- **Sandboxed code execution**: candidate code submissions (Python, JavaScript, Java, C++) run in isolated, ephemeral Docker containers via `dockerode` — memory-capped (256MB), network-disabled, time-limited, and force-removed after execution, with automatic fallback to a mock executor when Docker is unavailable
- **AI-driven interviews**: OpenAI-powered conversational interviewer that asks adaptive technical/behavioral questions, optionally personalized using the candidate's GitHub activity, and generates a **per-answer score with strengths, weaknesses, and improvement suggestions**
- **Redis-backed infrastructure**: used for adaptive, per-endpoint rate limiting (`rate-limit-redis`) and provisioned for BullMQ-based background job processing
- **CI pipeline (GitHub Actions)**: automated lint, typecheck, and test runs for both backend and frontend on every push/PR, plus a Docker image build verification step
- **Swagger/OpenAPI docs**, structured logging (Winston), input validation (Zod), and MongoDB + Mongoose data layer with 11 domain models

## Tech stack

**Backend:** Node.js 20, Express.js, TypeScript, MongoDB + Mongoose, Redis (`ioredis`), BullMQ, `dockerode` (Docker sandbox orchestration), JWT (`jsonwebtoken`), Zod validation, Winston logging, Swagger/OpenAPI

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Query, React Hook Form + Zod, Monaco Editor (code editor), Socket.IO client

**AI:** OpenAI API (adaptive interview questioning + answer scoring), GitHub REST API (candidate context enrichment)

**Infrastructure:** Docker & Docker Compose (MongoDB, Redis, backend, frontend services; backend mounts the Docker socket to launch per-language sandbox containers), GitHub Actions CI

## Folder structure

```
backend/
  src/
    config/        # ENV, DB, Redis, Swagger
    controllers/    # HTTP layer (auth, jobs, applications, interviews, submissions, resumes, users)
    services/       # Business logic — includes sandbox.service.ts (Docker code execution) and ai.service.ts (OpenAI interview logic)
    repositories/   # Data access layer
    middlewares/     # Auth (JWT + RBAC), rate limiting, validation, error handling
    routes/          # Express routers
    models/          # Mongoose schemas (11 collections)
    utils/           # JWT signing/verification, ApiError, ApiResponse, logger
    ai/              # OpenAI client wrapper
    docker/runners/  # Per-language Dockerfiles for sandboxed code execution (Python, JS, Java, C++)
frontend/
  src/
    features/         # auth, coding (Monaco editor workspace), interviews, jobs, resumes
    pages/             # Candidate, recruiter, and admin dashboards
    components/        # Sidebar, DashboardLayout, shared UI
    store/              # Redux slices
    services/           # Axios API client
```

## Quick start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB (or use the container)
- Redis (or use the container)

### Local development

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..

# Copy environment templates and customize
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services (MongoDB, Redis, backend, frontend)
docker-compose up -d

# Or run backend/frontend locally against containerized MongoDB/Redis:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

Visit `http://localhost:5173` for the frontend, `http://localhost:5000/api-docs` for API docs.

## Documentation

- **[IMPLEMENTATION_STEPS.md](./docs/IMPLEMENTATION_STEPS.md)** — Step-by-step setup, environment variables, database seed, running tests
- **[USER_GUIDE.md](./docs/USER_GUIDE.md)** — Feature walkthrough for candidates, recruiters, admins
- **[DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** — Architecture deep-dive, how to extend, deployment

## Security

- **JWT + refresh tokens with rotation**, invalidated instantly via `tokenVersion` on password change/logout
- **RBAC** enforced at the route level for Candidate/Recruiter/Admin roles
- **Input validation** via Zod schemas on every endpoint
- **Rate limiting**, Redis-backed, stricter on auth endpoints
- **NoSQL injection protection** via Mongoose + `express-mongo-sanitize`
- **CORS** restricted to the frontend origin in production
- **Code execution isolation**: no network access, memory caps, execution timeouts, and forced container teardown after every run

## Notes on current state

- CI runs lint/typecheck/tests and verifies Docker builds on every push — it does **not** currently deploy anywhere (no CD/deploy step is configured yet).
- BullMQ is included and Redis is wired up as shared infrastructure, but background job queues (e.g. async AI scoring, email sending) are not yet implemented as actual BullMQ `Queue`/`Worker` instances — this is set up for, not yet in active use.

## Contributing

1. Create a feature branch: `git checkout -b feature/module-name`
2. Keep modules isolated (one module per PR)
3. Follow the established pattern: repository → service → controller
4. Write tests for critical paths
5. Run `npm run lint` and `npm run format` before committing
