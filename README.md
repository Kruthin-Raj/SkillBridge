# SkillBridge

**A Unified Campus Platform for Student Freelancing, Skill Exchange, and Team Building**

---

## What It Is

SkillBridge is a verified campus marketplace designed exclusively for college students. One unified interface connects students across three core collaboration modes:

| Mode | How it Works | Type |
| --- | --- | --- |
| **Freelance** | A student posts a task with a budget and deadline. Other students submit bids. Once accepted, work is delivered and reviewed. | Paid Work |
| **Skill Exchange** | A student lists skills they can teach and skills they want to learn. The system matches compatible students for mutual learning. | Peer-to-Peer Learning |
| **Team Finder** | Students assemble teams for hackathons, capstones, and campus competitions by specifying required skills and team sizes. | Team Collaboration |

All modes share **one listings table, one public student profile, and one unified trust & rating system**, keeping the application lightweight and cohesive.

---

## Key Features

- **Typo-Tolerant Smart Search**:
  - Global fuzzy search powered by Damerau-Levenshtein distance and sliding-window token scoring.
  - Automatically matches students, skills, and posts even with typos (e.g., `pyhton` ➔ `Python`, `desgn` ➔ `Design`, `pster` ➔ `Poster`).
  - Scoped to campus access permissions (`college_id`).
  - Search results hub (`/search`) with categorized tabs: **All**, **Students**, and **Posts & Tasks**.
  - In-page live fuzzy filtering on the `/browse` page.

- **Campus Authentication & Security**:
  - Email OTP verification restricted to verified college email domains (e.g., `@apollouniversity.edu.in`).
  - Custom JWTs with college scoping and roll number verification.
  - Pluggable mail driver (console logger for local dev, SMTP for production).

- **In-App Messaging & Collaboration**:
  - Project/listing chat between posters and accepted workers.
  - Team application and member management for hackathons and projects.

- **Support & Ticketing System**:
  - Students can raise support tickets with proof/screenshot attachments.
  - Two-way live chat between students and campus admins on support tickets.

- **Real-Time Notifications**:
  - Server-Sent Events (SSE) stream live unread notification counts and alerts directly to the navbar.

- **Trust & Reviews**:
  - Star ratings, text reviews, and image proof attachments after gig completion.
  - Campus reporting system with administrative review, warning, and blocking tools.

- **Admin Management Panel**:
  - College domain management, active student directory, listing moderation, report handling, and live support chat desk.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18 (Vite), Tailwind CSS, React Router, Server-Sent Events |
| **Backend** | Node.js, Express, Zod validation, JSON Web Tokens (JWT) |
| **Database** | Supabase (PostgreSQL with Row Level Security & connection pooling) |
| **Search Engine** | Custom typo-tolerant Damerau-Levenshtein fuzzy matching engine |
| **Mailing** | Nodemailer (Console driver for dev, SMTP for production) |
| **Deployment** | Vercel / Netlify (Frontend) + Render / Cloud Run (Backend) |

---

## Project Layout

```
SkillBridge/
├── backend/
│   ├── db/
│   │   ├── schema.sql              # Supabase PostgreSQL schema
│   │   ├── index.js                # Database client router
│   │   └── supabase.js             # Supabase client & connection handler
│   ├── .env.example
│   └── src/
│       ├── server.js               # Server entry point
│       ├── app.js                  # Express setup, middleware, error handler
│       ├── config/env.js           # Centralized environment config
│       ├── middleware/             # requireAuth, errorHandler
│       ├── services/               # mailer.js, otpService.js
│       ├── utils/                  # ApiError, asyncHandler, fuzzySearch.js
│       ├── routes/index.js         # Top-level API router
│       └── modules/
│           ├── admin/              # User management, reports, colleges
│           ├── auth/               # OTP request, verify, login, register, password reset
│           ├── bids/               # Freelance bids and bid acceptance
│           ├── dashboard/          # User analytics, active gigs, earnings
│           ├── exchanges/          # Skill swap proposals and matches
│           ├── listings/           # Freelance, exchange, and team listings
│           ├── messages/           # In-app listing direct messaging
│           ├── notifications/      # SSE notification streaming and read status
│           ├── reports/            # Community reports and flagging
│           ├── reviews/            # Gig ratings, reviews, and proof images
│           ├── search/             # Typo-tolerant unified search
│           ├── support/            # Support tickets and admin live chat
│           ├── teams/              # Team finder applications and approvals
│           └── users/              # Student profiles, avatars, skill tags
└── frontend/
    ├── .env.example
    └── src/
        ├── App.jsx                 # Routes and application shell
        ├── lib/api.js              # Centralized API client
        ├── context/AuthContext.jsx # Authentication state provider
        ├── utils/fuzzySearch.js    # Client-side typo-tolerant fuzzy matching
        ├── components/             # Navbar, ModeToggle, ListingCard, ProtectedRoute, ImageModal
        └── pages/                  # Home, Browse, CreateListing, Dashboard, Exchanges,
                                    # SearchUsers, ListingDetail, Profile, PublicProfile,
                                    # Support, About, AdminPanel, Login, Register, NotFound
```

---

## Running Locally

Requires **Node.js 18.17 or newer**.

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Generate a random string for `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The API runs at <http://localhost:4000>. Health check: <http://localhost:4000/health>.

### 2. Frontend Setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

The frontend runs at <http://localhost:5173>.

### 3. Sign In & Terminal OTP

With `MAIL_DRIVER=console` (the default in development), verification codes are printed directly to the **backend terminal**:

```
================================================================
  MAIL (console driver - nothing was actually sent)
================================================================
  To      : student@apollouniversity.edu.in
  Subject : Your SkillBridge verification code: 428193
================================================================
  Your verification code is: 428193
================================================================
```

Enter the code into the verification screen to complete sign in.

---

## Environment Variables

### `backend/.env`

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `PORT` | No | `4000` | Port Express listens on |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origins (comma-separated) |
| `JWT_SECRET` | **Yes** | — | Secret key used to sign JWT authentication tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration duration |
| `ALLOWED_EMAIL_DOMAIN` | No | `apollouniversity.edu.in` | Default allowed student email domain |
| `OTP_TTL_MINUTES` | No | `10` | Lifetime of one-time login passwords |
| `MAIL_DRIVER` | No | `console` | `console` (terminal output) or `smtp` (real email delivery) |
| `MAIL_FROM` | No | `SkillBridge <no-reply@skillbridge.local>` | Outgoing email sender header |
| `SMTP_HOST` | If `smtp` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | If `smtp` | `587` | `587` (STARTTLS) or `465` (SSL) |
| `SMTP_SECURE` | If `smtp` | `false` | `false` for port 587, `true` for port 465 |
| `SMTP_USER` | If `smtp` | — | Gmail or SMTP account username |
| `SMTP_PASS` | If `smtp` | — | Gmail App Password (16 characters) |
| `SUPABASE_URL` | For DB | — | Supabase Project URL (`https://xyz.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | For DB | — | Supabase `service_role` key (Server-only, bypasses RLS) |

### `frontend/.env`

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | **Yes** | `http://localhost:4000` | Base URL of the SkillBridge Express API |
| `VITE_COLLEGE_DOMAIN` | No | `apollouniversity.edu.in` | Display hint for the college login screen |

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication & Users
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/request-otp` | — | Request a one-time verification code |
| `POST` | `/api/auth/login` | — | Sign in with email and password |
| `POST` | `/api/auth/register` | — | Complete new student registration |
| `GET` | `/api/auth/me` | ✓ | Fetch current authenticated student profile |
| `GET` | `/api/users/search?q=` | — | Typo-tolerant user and skill search |
| `GET` | `/api/users/:id` | — | Public student profile, trust score, and reviews |
| `PATCH` | `/api/users/me` | ✓ | Update bio, skills offered, and skills wanted |
| `PATCH` | `/api/users/me/avatar` | ✓ | Upload/update profile avatar |

### Unified Search
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/search?q=&type=` | — / ✓ | Smart typo-tolerant search across users and listings with campus scoping |

### Listings & Collaboration
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/listings` | — / ✓ | Browse listings filtered by mode (`freelance`, `exchange`, `team`) |
| `GET` | `/api/listings/:id` | — / ✓ | Detailed view of a single listing |
| `POST` | `/api/listings` | ✓ | Create a freelance task, skill swap, or team posting |
| `PATCH` | `/api/listings/:id` | ✓ | Update listing details |
| `PATCH` | `/api/listings/:id/status` | ✓ | Update status (`open`, `in_progress`, `completed`, `cancelled`) |
| `DELETE` | `/api/listings/:id` | ✓ | Delete a listing (owner only) |

### Bids, Exchanges & Teams
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/bids?listing_id=` | ✓ | Retrieve bids on a freelance task |
| `POST` | `/api/bids` | ✓ | Place a bid on a freelance task |
| `POST` | `/api/bids/:id/accept` | ✓ | Accept a bid (listing owner) |
| `GET` | `/api/exchanges/matches` | ✓ | Get matching students for skill swaps |
| `GET` | `/api/exchanges` | ✓ | Get user's skill swap proposals |
| `POST` | `/api/exchanges` | ✓ | Propose a skill exchange |
| `POST` | `/api/exchanges/:id/accept` | ✓ | Accept a proposed skill swap |
| `GET` | `/api/teams?listing_id=` | ✓ | View team applications for a team post |
| `POST` | `/api/teams` | ✓ | Apply to join a team |
| `POST` | `/api/teams/:id/accept` | ✓ | Accept a team member application |
| `POST` | `/api/teams/:id/remove` | ✓ | Remove a member from a team |

### Messages & Support
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/messages/:listing_id` | ✓ | Fetch project messages for a listing |
| `POST` | `/api/messages/:listing_id` | ✓ | Send a message within a listing |
| `POST` | `/api/support/tickets` | ✓ | Submit a new support ticket with optional attachment |
| `GET` | `/api/support/tickets/mine` | ✓ | Retrieve current student's support tickets |
| `GET` | `/api/support/tickets/:id/messages` | ✓ | Get live conversation for a support ticket |
| `POST` | `/api/support/tickets/:id/messages` | ✓ | Send a message on a support ticket |
| `PATCH` | `/api/support/tickets/:id/status` | ✓ | Update ticket status (Admin or owner) |

### Notifications, Reviews & Reports
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | ✓ | Fetch user notifications list |
| `GET` | `/api/notifications/stream` | ✓ | Real-time SSE notification stream |
| `PATCH` | `/api/notifications/read` | ✓ | Mark all notifications as read |
| `GET` | `/api/reviews?user_id=` | — | Get verified reviews for a student |
| `POST` | `/api/reviews` | ✓ | Submit a review and rating after gig completion |
| `POST` | `/api/reports` | ✓ | Report a student profile or listing |

---

## Contributing & Git Workflow

```bash
git checkout -b feature/your-feature
# ... make changes ...
git add <specific-files>
git commit -m "Implement feature: description"
git push -u origin feature/your-feature
```

> **Security Note**: Never commit `.env` files or credentials. The root `.gitignore` protects environment files by default.
