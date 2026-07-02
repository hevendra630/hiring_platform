# Implementation & Setup Guide

## Prerequisites

- **Node.js** 20+ (check: `node --version`)
- **npm** 9+ (check: `npm --version`)
- **Docker & Docker Compose** (check: `docker --version && docker-compose --version`)
- **Git** (check: `git --version`)
- **MongoDB** (local or container)
- **Redis** (local or container)

## Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone <repo-url> hireai-platform
cd hireai-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Back to root
cd ..
```

## Step 2: Environment Variables

### Backend Setup

```bash
# Copy the example env file
cp backend/.env.example backend/.env

# Edit backend/.env with your values:
# - MONGO_URI: defaults to localhost MongoDB (no change needed for local dev)
# - REDIS_HOST/PORT: defaults to localhost Redis
# - JWT secrets: generate random strings for PROD, dev defaults work for local testing
# - GOOGLE_CLIENT_ID/SECRET: leave empty for signup/login without OAuth (optional)
# - SMTP_* (email sending): optional, logs to console in dev if not configured
# - OPENAI_API_KEY: leave empty initially, needed for AI modules (phase 2)
# - CLOUDINARY_*: leave empty initially, needed for resume uploads (phase 2)
```

### Frontend Setup

```bash
# Copy the example env file
cp frontend/.env.example frontend/.env

# Edit frontend/.env:
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=  # optional, empty for now
```

## Step 3: Start Services

### Option A: Using Docker Compose (Recommended for Beginners)

```bash
# Start all services (MongoDB, Redis, backend, frontend)
docker-compose up -d

# Verify services are running
docker ps

# View logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs

# Stop services
docker-compose down
```

Backend API: `http://localhost:5000`
Frontend: `http://localhost:5173`
API Docs: `http://localhost:5000/api-docs`

### Option B: Manual Local Run (Better for Development)

**Terminal 1 — MongoDB**
```bash
# If you have MongoDB installed locally, or use Docker:
docker run -d -p 27017:27017 --name hireai-mongo mongo:7
```

**Terminal 2 — Redis**
```bash
# If you have Redis installed locally, or use Docker:
docker run -d -p 6379:6379 --name hireai-redis redis:7-alpine
```

**Terminal 3 — Backend**
```bash
cd backend
npm run dev
# Output: HireAI API listening on port 5000 [development]
```

**Terminal 4 — Frontend**
```bash
cd frontend
npm run dev
# Output: VITE v4.x.x  ready in 123 ms
```

## Step 4: Test the Application

### Signup Flow

1. Open `http://localhost:5173/signup`
2. Fill in:
   - **Name**: "Jane Candidate"
   - **Email**: "jane@example.com"
   - **Password**: "TestPassword123"
   - **Role**: "Candidate"
3. Click "Create Account"
4. In development, email verification happens automatically or check backend logs for verification link
5. Go to `/login` and sign in

### Check Backend Health

```bash
curl http://localhost:5000/api/v1/health
# Returns: { "success": true, "message": "HireAI API is healthy", ... }
```

### View API Documentation

Navigate to `http://localhost:5000/api-docs` (Swagger UI)

## Step 5: Code Quality

### Linting

```bash
cd backend
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues

cd ../frontend
npm run lint
npm run lint:fix
```

### Type Checking

```bash
cd backend
npx tsc --noEmit    # TypeScript check, no output

cd ../frontend
npx tsc --noEmit
```

### Code Formatting

```bash
cd backend
npm run format

cd ../frontend
npm run format
```

## Step 6: Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (re-runs on file changes)
npm run test:watch
```

**Note**: Tests use an in-memory MongoDB instance (mongodb-memory-server), so they run without a live database. First run may take time downloading the Mongo binary.

### Frontend Tests (Phase 2+)

Frontend testing setup (Vitest + React Testing Library) will be added in the next phase.

## Step 7: Database

### Seed Sample Data (Phase 2+)

When the seed script is ready:

```bash
cd backend
npm run seed
```

This will populate the database with sample users, jobs, problems, etc. for testing.

### View Database

Use MongoDB Compass or CLI:

```bash
# Connect to local MongoDB
mongosh mongodb://localhost:27017/hireai

# Show collections
show collections

# Count users
db.users.countDocuments()
```

## Step 8: Git Workflow

```bash
# Create a feature branch
git checkout -b feature/coding-platform

# Make changes, commit regularly
git add .
git commit -m "feat: add code execution service"

# Push to remote
git push origin feature/coding-platform

# Open a PR on GitHub
```

## Troubleshooting

### "Cannot connect to MongoDB"

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Or start it if missing
docker run -d -p 27017:27017 --name hireai-mongo mongo:7

# Verify connection
mongosh mongodb://localhost:27017
```

### "Cannot connect to Redis"

```bash
# Check if Redis is running
docker ps | grep redis

# Or start it if missing
docker run -d -p 6379:6379 --name hireai-redis redis:7-alpine

# Verify connection
redis-cli ping
# Response: PONG
```

### "Port 5000 already in use"

```bash
# Find process on port 5000
lsof -i :5000

# Kill it (e.g., PID 12345)
kill -9 12345

# Or use a different port
PORT=5001 npm run dev
```

### "Module not found" errors

```bash
# Reinstall dependencies
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

### TypeScript errors in IDE

```bash
# Ensure your IDE's TypeScript version matches the project
# In VS Code, press Ctrl+K Ctrl+V and select "Use Workspace Version"
```

## Environment Variables Reference

### Backend (.env)

```
NODE_ENV=development                          # development | production | test
PORT=5000
API_PREFIX=/api/v1
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://localhost:27017/hireai
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=your_secret_key_here        # Use openssl rand -hex 32 to generate
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Optional: Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=HireAI <no-reply@hireai.dev>

# Optional: Cloudinary (resume uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: OpenAI (AI modules)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX=100                   # Max requests per window

# Code execution sandbox
DOCKER_SOCKET_PATH=/var/run/docker.sock
CODE_EXEC_TIMEOUT_MS=8000
CODE_EXEC_MEMORY_MB=256
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=              # Optional
```

## Deployment Checklist (Phase 3)

- [ ] Buy a domain
- [ ] Set up a production database (MongoDB Atlas)
- [ ] Set up a production cache (Redis Cloud or similar)
- [ ] Generate strong JWT secrets: `openssl rand -hex 32`
- [ ] Configure SMTP email provider (SendGrid, Mailgun, etc.)
- [ ] Set up Google OAuth app and get credentials
- [ ] Set up Cloudinary account for resume storage
- [ ] Set up OpenAI API key
- [ ] Deploy backend to platform (Heroku, Railway, Render, AWS, etc.)
- [ ] Deploy frontend to CDN (Vercel, Netlify, CloudFlare Pages)
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure CORS on backend to match production frontend domain
- [ ] Set up CI/CD pipeline in GitHub Actions
- [ ] Enable monitoring and logging (DataDog, Sentry, etc.)
- [ ] Load test the API
- [ ] Security audit (OWASP)

---

**Next Step**: Read [USER_GUIDE.md](./USER_GUIDE.md) to understand how to use the platform, then [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for architecture and extension guidelines.
