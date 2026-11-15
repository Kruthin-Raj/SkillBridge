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

- **Multi-Platform Support & Native Apps**:
  - **Windows Desktop App**: Standalone 1-click portable desktop executable (`SkillBridge.exe`) and `.zip` distribution with embedded brand icon, manifest, and persistent isolated session (`%LOCALAPPDATA%\SkillBridge`).
  - **Native Android APK**: Mobile Android application compiled via Capacitor 8, Android SDK 36, and Java 21, generating `SkillBridge.apk` for direct sideloading and package installer execution.
  - **iOS & Desktop PWA**: Progressive Web App manifest (`manifest.json`) supporting 1-tap browser address bar installation on Chrome/Edge and Safari "Add to Home Screen" on iPhone/iPad with standalone full-screen view.
  - **Dedicated Download Hub (`/download`)**: Central platform page to download Windows `.exe`/`.zip`, Android `.apk`, or view step-by-step setup guides with SmartScreen bypass instructions.
  - **Mobile-Responsive Dock Navigation**: Native bottom navigation bar (`MobileBottomNav`) for seamless phone and tablet browsing.

- **Typo-Tolerant Smart Search**:
  - Global fuzzy search powered by Damerau-Levenshtein distance and sliding-window token scoring.
  - Automatically matches students, skills, and posts even with typos (e.g., `pyhton` ➔ `Python`, `desgn` ➔ `Design`, `pster` ➔ `Poster`).
  - Scoped to campus access permissions (`college_id`).
  - Search results hub (`/search`) with categorized tabs: **All**, **Students**, and **Posts & Tasks**.
  - In-page live fuzzy filtering on the `/browse` page.

- **Campus Authentication & College Onboarding**:
  - Email OTP verification restricted to verified college email domains (e.g., `@apollouniversity.edu.in`).
  - Roll number verification and custom JWTs with college scoping.
  - **College Access Request System**: Students from unlisted campuses can submit a request with their domain and contact email (`/api/colleges/request`); administrators can review, approve, or reject with automated email notifications.
  - Pluggable mail driver (console logger for local dev, SMTP for production).

- **Freelance Bidding & Anonymous Identity Protection**:
  - Students place competitive bids on paid freelance tasks.
  - **Anonymous Bidding**: Option to submit bids anonymously (`is_anonymous`), masking the student's name, avatar, and profile from competitors while remaining visible to the task owner.
  - **Bid Lifecycle Management**: Edit bid amounts/messages, withdraw pending bids, and automatic rejection of all competing pending bids once a winner is accepted.
  - **Direct Campus UPI Settlement**: In-app payment coordination card displaying UPI IDs and QR links for direct peer-to-peer settlement without middleman fees.

- **In-App Messaging & Workspace Collaboration**:
  - Project workspace chat (`/listings/:id`) between listing owners and accepted workers, exchange partners, or team members.
  - Attachment and image proof sharing within workspace chat.
  - **Task Progress Tracker**: Interactive task lifecycle tracker (`todo` ➔ `in_progress` ➔ `review` ➔ `completed`).
  - Team application and member management for hackathons and projects.

- **Support & Ticketing System**:
  - Students can raise support tickets (`/support`) with category tags, priority levels, and image proof attachments.
  - Two-way live chat between students and campus admins on support tickets.

- **Real-Time Notifications**:
  - Server-Sent Events (SSE) stream live unread notification counts, bid alerts, and task updates directly to the navbar.

- **Trust & Reviews**:
  - 5-star ratings, written reviews, and image proof attachments after gig completion.
  - Public trust scores displayed on verified student profiles.
  - Campus reporting system with administrative review, warning, and blocking tools.

- **Admin Management Panel (`/admin-kkr`)**:
  - College domain management, active student directory with real-time online/last-seen status, listing moderation, report handling, college request approvals, and live support chat desk.

- **Automated Dual CI/CD Pipelines**:
  - **Web & Desktop CI**: Automated GitHub Actions workflow compiling frontend assets via `pnpm`, verifying static download binaries, checking backend syntax, compiling Windows `SkillBridge.exe` via .NET `csc.exe`, and publishing desktop artifacts.
  - **Android CI**: Dedicated GitHub Actions pipeline configuring Java 21, Android SDK 36, syncing Capacitor, compiling native debug APKs (`./gradlew assembleDebug`), and publishing downloadable `SkillBridge-Android-APK` artifacts.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18 (Vite), Tailwind CSS, React Router 6, Server-Sent Events, pnpm |
| **Desktop Client** | C# .NET Windows executable launcher + Edge WebView standalone / Electron wrapper |
| **Mobile Client** | Capacitor 8 (Android SDK 36, Java 21) + Progressive Web App (PWA) |
| **Backend** | Node.js (>=18.17 / 22), Express, Zod validation, JSON Web Tokens (JWT) |
| **Database** | Supabase (PostgreSQL with Row Level Security & connection pooling) |
| **Search Engine** | Custom typo-tolerant Damerau-Levenshtein fuzzy matching engine |
| **Mailing** | Nodemailer (Console driver for dev, SMTP for production) |
| **CI / CD Pipelines** | GitHub Actions (Dual pipelines: Web & Desktop CI + Android Gradle CI) |
| **Deployment** | Vercel (Frontend & Static Downloads CDN) + Render / Cloud Run (Backend) |

---

## Project Layout

```
SkillBridge/
├── .github/
│   └── workflows/
│       ├── web-desktop.yml         # Web build, backend check, Windows .exe compilation & packaging
│       └── android.yml             # Android SDK 36, Java 21, Capacitor sync, Gradle APK build
├── desktop/
│   ├── SkillBridge.exe             # Portable Windows desktop launcher
│   ├── icon.ico                    # Embedded application brand icon
│   ├── main.js                     # Electron runtime wrapper
│   ├── package.json                # Desktop packaging configuration
│   └── src/
│       ├── Program.cs              # C# native WebView launcher with session isolation
│       ├── AssemblyInfo.cs         # Application assembly metadata
│       └── app.manifest            # DPI awareness and execution level manifest
├── backend/
│   ├── db/
│   │   ├── schema.sql              # Supabase PostgreSQL schema & tables
│   │   ├── index.js                # Database client router
│   │   └── supabase.js             # Supabase client & connection handler
│   ├── .env.example
│   └── src/
│       ├── server.js               # Server entry point
│       ├── app.js                  # Express setup, middleware, error handler
│       ├── config/env.js           # Centralized environment config
│       ├── middleware/             # requireAuth, errorHandler
│       ├── services/               # mailer.js, otpService.js, collegeRequestsService.js, loginTracker.js
│       ├── utils/                  # ApiError, asyncHandler, fuzzySearch.js
│       ├── routes/index.js         # Top-level API router
│       └── modules/
│           ├── admin/              # User management, reports, colleges, request approvals
│           ├── auth/               # OTP request, verify, login, register, password reset
│           ├── bids/               # Freelance bids, anonymous bidding, acceptance & rejection
│           ├── colleges/           # Public college directory & student domain access requests
│           ├── dashboard/          # User analytics, active gigs, earnings
│           ├── download/           # Multi-platform download metadata and binary streaming
│           ├── exchanges/          # Skill swap proposals and matches
│           ├── listings/           # Freelance, exchange, and team listings with attachments
│           ├── messages/           # In-app listing direct messaging & workspace chat
│           ├── notifications/      # SSE notification streaming and read status
│           ├── reports/            # Community reports and flagging
│           ├── reviews/            # Gig ratings, reviews, and proof images
│           ├── search/             # Typo-tolerant unified search
│           ├── support/            # Support tickets and admin live chat
│           ├── teams/              # Team finder applications and approvals
│           └── users/              # Student profiles, avatars, skill tags, UPI settlement
└── frontend/
    ├── .env.example
    ├── capacitor.config.json       # Capacitor Android configuration
    ├── android/                    # Native Android project (Gradle wrapper, manifest, Java)
    ├── public/
    │   ├── manifest.json           # Web App Manifest for PWA installation
    │   └── downloads/              # Static CDN binary downloads (SkillBridge.exe, .zip, .apk)
    └── src/
        ├── App.jsx                 # Routes and application shell
        ├── lib/api.js              # Centralized API client
        ├── context/AuthContext.jsx # Authentication state provider
        ├── utils/fuzzySearch.js    # Client-side typo-tolerant fuzzy matching
        ├── components/             # Navbar, MobileBottomNav, ModeToggle, ListingCard, WorkspaceChat,
        │                           # TaskProgress, CampusSettlementCard, RequestCollegeModal, ImageModal
        └── pages/                  # Home, Browse, CreateListing, Dashboard, Exchanges, ListingDetail,
                                    # Profile, PublicProfile, SearchUsers, Support, Download, About,
                                    # PrivacyPolicy, AdminPanel, Login, Register, ForgotPassword, NotFound
```

---

## Running Locally

Requires **Node.js 18.17 or newer** (Node 22 LTS recommended for Capacitor 8).

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
pnpm install              # or: npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
pnpm run dev              # or: npm run dev
```

The frontend runs at <http://localhost:5173>.

### 3. Windows Desktop Application Setup

You can launch or build the Windows desktop client:
- **Instant Launch**: Run `desktop/SkillBridge.exe` directly for a standalone distraction-free window.
- **Recompile Executable**:
  ```powershell
  C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /out:desktop\SkillBridge.exe /win32icon:desktop\icon.ico /win32manifest:desktop\src\app.manifest desktop\src\Program.cs desktop\src\AssemblyInfo.cs
  ```

### 4. Android Mobile Application Setup

To build and run the native Android package:

```bash
cd frontend
pnpm run build
pnpm exec cap sync android
cd android
./gradlew assembleDebug   # Windows: .\gradlew.bat assembleDebug
```

The generated APK will be available at `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

### 5. Sign In & Terminal OTP

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
| `POST` | `/api/auth/register` | — | Complete new student registration with roll number |
| `POST` | `/api/auth/reset-password` | — | Verify OTP and set a new password |
| `POST` | `/api/auth/set-password` | ✓ | Change password while authenticated |
| `GET` | `/api/auth/me` | ✓ | Fetch current authenticated student profile |
| `GET` | `/api/users/search?q=` | — | Typo-tolerant user and skill search |
| `GET` | `/api/users/:id` | — | Public student profile, trust score, and reviews |
| `PATCH` | `/api/users/me` | ✓ | Update bio, skills offered, skills wanted, and UPI ID |
| `PATCH` | `/api/users/me/avatar` | ✓ | Upload/update profile avatar |

### Campus Onboarding & Colleges
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/colleges` | — | Public list of approved campus institutions and domains |
| `POST` | `/api/colleges/request` | — | Submit student request for new college domain onboarding |

### Multi-Platform Downloads
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/download/info` | — | Retrieve platform version, availability, and bundle sizes |
| `GET` | `/api/download/windows` | — | Stream standalone Windows `SkillBridge.exe` executable |
| `GET` | `/api/download/android` | — | Stream native Android `SkillBridge.apk` binary package |

### Unified Search
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/search?q=&type=` | — / ✓ | Smart typo-tolerant search across users and listings with campus scoping |

### Listings & Collaboration
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/listings` | — / ✓ | Browse listings filtered by mode (`freelance`, `exchange`, `team`) |
| `GET` | `/api/listings/:id` | — / ✓ | Detailed view of a single listing with attachments |
| `POST` | `/api/listings` | ✓ | Create a freelance task, skill swap, or team posting |
| `PATCH` | `/api/listings/:id` | ✓ | Update listing details and attachments |
| `PATCH` | `/api/listings/:id/status` | ✓ | Update status (`open`, `in_progress`, `completed`, `cancelled`, `closed`) |
| `DELETE` | `/api/listings/:id` | ✓ | Delete a listing (owner only) |

### Bids, Exchanges & Teams
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/bids?listing_id=` | ✓ | Retrieve bids on a freelance task with anonymous identity masking |
| `POST` | `/api/bids` | ✓ | Place a bid on a freelance task (optional `is_anonymous` mode) |
| `PATCH` | `/api/bids/:id` | ✓ | Edit bid amount, message, or anonymous toggle |
| `DELETE` | `/api/bids/:id` | ✓ | Withdraw and delete a pending bid |
| `POST` | `/api/bids/:id/accept` | ✓ | Accept a bid; automatically rejects all other competing pending bids |
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
| `GET` | `/api/messages/:listing_id` | ✓ | Fetch project workspace messages for a listing |
| `POST` | `/api/messages/:listing_id` | ✓ | Send a workspace message with screenshot attachment |
| `POST` | `/api/support/tickets` | ✓ | Submit a support ticket with category, priority, and proof image |
| `GET` | `/api/support/tickets/mine` | ✓ | Retrieve current student's support tickets with unread status |
| `GET` | `/api/support/tickets/:id/messages` | ✓ | Get live conversation for a support ticket |
| `POST` | `/api/support/tickets/:id/messages` | ✓ | Send a message on a support ticket |
| `PATCH` | `/api/support/tickets/:id/status` | ✓ | Update ticket status (`open`, `in_progress`, `resolved`, `closed`) |
| `GET` | `/api/support/admin/tickets` | ✓ (Admin) | Retrieve all platform support tickets across campus |
| `DELETE` | `/api/support/admin/tickets/:id` | ✓ (Admin) | Delete a support ticket |

### Notifications, Reviews & Reports
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | ✓ | Fetch user notifications list |
| `GET` | `/api/notifications/stream` | ✓ | Real-time SSE notification stream |
| `PATCH` | `/api/notifications/read` | ✓ | Mark all notifications as read |
| `GET` | `/api/reviews?user_id=` | — | Get verified reviews for a student |
| `POST` | `/api/reviews` | ✓ | Submit a review and rating after gig completion |
| `POST` | `/api/reports` | ✓ | Report a student profile or listing |

### Admin Operations
| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/admin/users` | ✓ (Admin) | Student directory with real-time online/seen status |
| `POST` | `/api/admin/users/:id/warn` | ✓ (Admin) | Issue warning with audit message |
| `POST` | `/api/admin/users/:id/block` | ✓ (Admin) | Block student account |
| `POST` | `/api/admin/users/:id/unblock` | ✓ (Admin) | Restore blocked student account |
| `GET` | `/api/admin/reports` | ✓ (Admin) | Review campus incident reports |
| `DELETE` | `/api/admin/reports/:id` | ✓ (Admin) | Dismiss/delete an incident report |
| `DELETE` | `/api/admin/listings/:id` | ✓ (Admin) | Moderation removal of a listing |
| `GET` | `/api/admin/colleges` | ✓ (Admin) | Manage active college institutions |
| `POST` | `/api/admin/colleges` | ✓ (Admin) | Add new college domain to whitelist |
| `DELETE` | `/api/admin/colleges/:domain` | ✓ (Admin) | Remove college domain |
| `GET` | `/api/admin/college-requests` | ✓ (Admin) | View pending student college requests |
| `POST` | `/api/admin/college-requests/:id/approve` | ✓ (Admin) | Approve request and send onboarding email |
| `POST` | `/api/admin/college-requests/:id/reject` | ✓ (Admin) | Reject request with explanation email |
| `DELETE` | `/api/admin/college-requests/:id` | ✓ (Admin) | Delete college request |

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
