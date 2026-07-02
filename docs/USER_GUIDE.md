# User Guide

## Overview

HireAI is a platform for technical interviews and assessments. Depending on your role, you'll see different features:

- **Candidate**: Apply for jobs, take interviews, view scores
- **Recruiter**: Post jobs, manage candidates, review results, export reports
- **Admin**: System overview, user management, analytics

## Getting Started

### 1. Sign Up

**Navigate to**: `http://localhost:5173/signup`

You'll choose:
- **Name**: Your full name
- **Email**: Your account email
- **Password**: Must be 8+ characters with uppercase letter + number (e.g., `SecurePass123`)
- **Role**: 
  - **Candidate** — if you're applying for jobs/interviews
  - **Recruiter** — if you're hiring engineers

After signup, you'll receive a verification email. Click the link to verify your account.

### 2. Log In

**Navigate to**: `http://localhost:5173/login`

Enter your email and password. You'll be redirected to your dashboard based on your role.

### 3. Forgot Password

**Navigate to**: `http://localhost:5173/forgot-password`

Enter your registered email. You'll receive a reset link (check dev logs if email isn't configured). Click it to set a new password.

---

## Candidate Dashboard

### Overview

When you log in as a candidate, you'll see:

- **Upcoming Interviews** — Your scheduled interviews
- **Recent Results** — Scores from completed interviews
- **Profile Strength** — Completion percentage of your profile

### Features (Phase 2+)

**Resume Management**
- Upload your PDF resume
- Automatic skill extraction (e.g., Python, React, SQL)
- ATS score calculation (0-100) showing hiring system compatibility
- Receive suggestions to improve score

**Job Browsing**
- Search for open positions by company, role, skill
- See required and nice-to-have skills
- View salary range and experience level

**Technical Interviews**
- Take coding assessments (write code in Monaco editor)
- Answer behavioral questions in AI interviews
- Get immediate feedback on coding performance
- Access full interview transcripts with scoring reasoning

**Performance Dashboard**
- Track scores over time (line chart)
- View skill radar chart comparing your skills to job requirements
- Benchmarking against other candidates (anonymized)
- Certificate generation for high-scoring interviews

### Navigation

Use the sidebar to jump between:
- **Dashboard** — Overview and upcoming interviews
- **My Interviews** — Complete history of all interviews taken
- **Resume** — Upload and manage your resume
- **Settings** — Profile information, password, preferences

---

## Recruiter Dashboard

### Overview

When you log in as a recruiter, you'll see:

- **Active Jobs** — Count of open positions
- **Total Applicants** — All candidates across all jobs
- **In Progress** — Interviews currently being taken
- **Hired** — Number of successful hires

### Features (Phase 2+)

**Job Management**
- Create a new job posting with:
  - Title, description, required skills
  - Experience level (e.g., 2-5 years)
  - Salary range (optional)
  - Remote status
  - Type (full-time, contract, internship, part-time)
- Publish jobs to attract candidates
- Archive or close jobs when filled
- Edit job details after posting

**Interview Configuration**
- Choose coding round:
  - Difficulty (easy, medium, hard)
  - Time limit (e.g., 30 minutes)
  - Select 3-5 problems from problem bank
- Configure AI interview:
  - Number of technical questions (e.g., 5)
  - Number of behavioral questions (e.g., 2)
  - Total duration (15-60 minutes)
  - Enable adaptive questioning (next question based on previous answer quality)

**Candidate Management**
- View all applicants for a job
- See resume, ATS score, extracted skills
- Schedule interviews (pick date/time)
- Send interview invitations via email

**Interview Review**
- See all interview results in a list
- Click any interview to view:
  - Full transcript (what was asked, what they answered)
  - Score breakdown (coding score, AI interview score)
  - Reasoning trail (why the candidate was scored that way)
  - Test case results (for coding)
  - Strengths and weaknesses
  - Suggested improvements

**Candidate Comparison**
- Select 2+ candidates from the same job
- Side-by-side view of:
  - Resume highlights
  - ATS scores
  - Interview scores
  - Coding performance
  - Recommendation: "Strong Hire" / "Hire" / "Leaning No" / "No Hire"

**Analytics & Reporting**
- **Hiring Funnel**: Visualize drop-off at each stage
  - Applied → Screened → Interviewed → Offered → Hired
- **Candidate Ranking**: Leaderboard of all candidates by score
- **Interview Statistics**: Average score by difficulty, pass rate by problem
- **Export Reports**: Download as PDF or CSV for stakeholders

### Navigation

Use the sidebar to jump between:
- **Dashboard** — Overview and key metrics
- **Jobs** — Create, manage, and close job postings
- **Candidates** — Browse all applicants, schedule interviews
- **Settings** — Company info, team members, billing

---

## Admin Dashboard

### Overview

When you log in as an admin (created manually by HireAI team), you'll see:

- **Total Users** — All accounts on the platform
- **Candidates** — Number of job-seeking accounts
- **Recruiters** — Number of hiring accounts

### Features (Phase 2+)

**User Management**
- List all users with:
  - Email, name, role
  - Account creation date
  - Last login
  - Account status (active/suspended)
- Suspend accounts that violate terms
- Promote users to admin
- View user activity logs

**System Health**
- Monitor:
  - API uptime and response times
  - Database performance
  - Active sessions
  - Error rates
- View error logs with stack traces
- Database backups and recovery

**Moderation**
- Review flagged interviews or behavior
- Ban users for cheating or harassment
- Clear cached data

### Navigation

Use the sidebar to jump between:
- **Dashboard** — System overview
- **Users** — Manage accounts
- **Settings** — System configuration

---

## Common Workflows

### Candidate: Taking an Interview

1. Check **My Interviews** for a scheduled interview
2. Click "Join Interview"
3. **Coding Round** (if included):
   - Read the problem description
   - Write code in the Monaco editor
   - Click "Run Code" to test against sample test cases
   - Click "Submit" when ready (tests hidden test cases too)
4. **AI Interview** (if included):
   - AI asks a technical question
   - Answer in text or speak (voice coming Phase 2)
   - AI reads your answer and asks a follow-up (adaptive)
   - After ~5-10 questions, AI generates your score
5. **Results**:
   - See your scores immediately
   - Review full transcript with reasoning
   - Understand weak areas
   - Retry or apply to other jobs

### Recruiter: Hiring for a Role

1. **Post a Job**:
   - Go to **Jobs** → "Create Job"
   - Fill in details, publish

2. **Wait for Applicants**:
   - Candidates apply, their resumes are analyzed automatically

3. **Review Candidates**:
   - See ATS score, extracted skills
   - Shortlist interesting candidates

4. **Schedule Interviews**:
   - Click "Schedule Interview"
   - Pick coding problems and AI interview questions
   - Set date/time
   - Send invitation email

5. **Review Results**:
   - Candidate takes interview
   - You see full transcript, scores, reasoning
   - Compare with other candidates
   - Export final report for decision makers

6. **Make Offer**:
   - Top candidates invited to final round (human interview)
   - Extend offer in the system
   - Track through hiring process

---

## Tips & Best Practices

### For Candidates

- **Optimize Your Resume**:
  - Include specific skills (Python, React, SQL, etc.)
  - Add projects with tech stacks
  - Keep to 1 page if possible (ATS friendly)
  - Use keywords from job description

- **Prepare for Interviews**:
  - Review coding fundamentals (arrays, strings, trees, graphs, DP)
  - Practice on LeetCode or HackerRank
  - Read the problem twice before writing code
  - Test with sample cases first

- **Ace the AI Interview**:
  - Answer behavioral questions with STAR method (Situation, Task, Action, Result)
  - Be honest about your experience level
  - Ask clarifying questions when confused
  - Take your time, don't rush

### For Recruiters

- **Write Clear Job Descriptions**:
  - Be specific about tech stack
  - Include nice-to-haves, not just must-haves
  - Set realistic salary ranges
  - Mention team size and growth opportunities

- **Design Good Coding Problems**:
  - Medium difficulty for most roles
  - 30 minutes should be enough time
  - Test both correctness and code quality
  - Provide clear examples

- **Review Transcripts Thoughtfully**:
  - Look at reasoning trail, not just final score
  - Understand what the candidate was thinking
  - Some candidates are nervous in interviews
  - Consider cultural fit and growth potential

---

## Keyboard Shortcuts

**Global**
- `?` — Show help / keyboard shortcuts
- `Cmd/Ctrl + K` — Open search/command palette

**Code Editor**
- `Cmd/Ctrl + /` — Toggle comment
- `Cmd/Ctrl + D` — Multi-cursor select
- `F11` — Fullscreen editor

---

## FAQ

**Q: Can I upload a cover letter?**
A: Not in Phase 1. Phase 2 will add cover letter uploads.

**Q: Can I retake an interview?**
A: Yes! You can take the same interview multiple times. Your best score is highlighted on your profile.

**Q: How is the ATS score calculated?**
A: We extract keywords from your resume and compare to the job description. Higher match = higher ATS score.

**Q: Can recruiters see all candidates across jobs?**
A: Yes, on the **Candidates** page. But hiring pipeline is job-specific.

**Q: How long does the AI take to grade an interview?**
A: Typically 30-60 seconds. Results appear instantly on the dashboard.

**Q: Can I share my interview transcript?**
A: Yes! (Phase 2) — Generate a shareable PDF or link.

**Q: Is my code submission saved if I disconnect?**
A: Yes! Auto-save every 10 seconds.

**Q: Can I change my role (Candidate → Recruiter)?**
A: Contact admin. We need to verify your company email.

---

## Support & Feedback

- **Report a Bug**: Click the "Feedback" button in the app
- **Feature Request**: Same feedback panel
- **Account Issues**: Email support@hireai.dev (will be live Phase 2+)

---

**Next Step**: Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) to understand the system architecture and how to extend it for Phase 2.
