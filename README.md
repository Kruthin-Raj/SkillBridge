# SkillBridge

**A Unified Campus Platform for Student Freelancing and Skill Exchange**


## What it is

A web app open only to verified students of the college. One toggle switches the
marketplace between two modes:

| Mode | How it works | Money |
| --- | --- | --- |
| **Freelance** | A student posts a task with a budget and a deadline. Others bid. The poster accepts a bid, the work is delivered. | Paid |
| **Skill Exchange** | A student states a skill they can teach and one they want to learn. The system finds a matching student and both teach each other. | Free |

Both modes share **one listings table, one profile and one rating**, which is what
keeps the app small.

---

## Current state — base setup

This repository is the scaffold, not the finished project. What is already wired up:

- Express API with all five resources routed, validated and authorised
- Email-OTP login restricted to the college domain, issuing a JWT
- A pluggable mailer: prints the OTP to the terminal today, sends real email once SMTP is filled in
- A data layer that runs on an **in-memory store** until Supabase credentials are added — so the app works end to end right now
- React + Tailwind client with the mode toggle, browse, post, bid, match, profile and OTP screens
- `backend/db/schema.sql`, ready to paste into the Supabase SQL editor

What is deliberately left as follow-up work is listed under [Not built yet](#not-built-yet).

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 (Vite), Tailwind CSS, React Router |
| Backend | Node.js, Express, Zod, JSON Web Tokens |
| Database | Supabase (PostgreSQL) |
| Auth | Email OTP → own JWT (not Supabase Auth) |
| Mail | Nodemailer (console driver in dev, Gmail SMTP in prod) |
| Deployment | Netlify (frontend) + Render (backend) |

---

## Project layout

```
SkillBridge/
├── backend/
│   ├── db/schema.sql               # paste into the Supabase SQL editor
│   ├── .env.example
│   └── src/
│       ├── server.js               # entry point
│       ├── app.js                  # express app, cors, /health, error handling
│       ├── config/env.js           # every env var is read here and nowhere else
│       ├── db/                     # index.js picks supabase.js or memory.js
│       ├── middleware/             # requireAuth, errorHandler
│       ├── services/               # mailer.js, otpService.js
│       ├── modules/                # auth, users, listings, bids, exchanges, reviews
│       └── utils/                  # ApiError, asyncHandler
└── frontend/
    ├── .env.example
    └── src/
        ├── App.jsx                 # routes
        ├── lib/api.js              # every network call goes through here
        ├── context/AuthContext.jsx
        ├── components/             # Navbar, ModeToggle, ListingCard, ProtectedRoute
        └── pages/                  # Login, VerifyOtp, Browse, CreateListing,
                                    # ListingDetail, Exchanges, Profile, NotFound
```

---

## Running it locally

Requires **Node.js 18.17 or newer**.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Generate a value for `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The API starts on <http://localhost:4000>. Check <http://localhost:4000/health>.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

The app opens at <http://localhost:5173>.

### 3. Sign in and read the OTP from the terminal

With `MAIL_DRIVER=console` (the default), no email is sent — the code is printed
in the **backend** terminal:

```
================================================================
  MAIL (console driver - nothing was actually sent)
================================================================
  To      : kruthin@apollouniversity.edu.in
  Subject : Your SkillBridge verification code: 428193
================================================================
  Your verification code is: 428193
================================================================
```

Type that code into the verify screen and you are in. The verify page also shows a
banner reminding you to check the terminal whenever the console driver is active.

> With no Supabase credentials set, data lives in memory and is wiped on every
> restart. That is expected until step 5.

---

## Environment variables

Copy each `.env.example` to `.env` and fill in the blanks. **`.env` files are
gitignored — never commit real values.**

### `backend/.env`

| Variable | Required | Default | What it does |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | `production` makes config problems fatal instead of warnings |
| `PORT` | no | `4000` | Port the API listens on. Render sets this for you |
| `CORS_ORIGIN` | no | `http://localhost:5173` | Comma-separated list of allowed frontend origins. Add the Netlify URL for production |
| `JWT_SECRET` | **yes** | — | Long random string used to sign login tokens. Required in production |
| `JWT_EXPIRES_IN` | no | `7d` | How long a login lasts |
| `ALLOWED_EMAIL_DOMAIN` | no | `apollouniversity.edu.in` | Only this email domain can sign up — our student mail domain |
| `OTP_TTL_MINUTES` | no | `10` | How long a code stays valid |
| `MAIL_DRIVER` | no | `console` | `console` prints the OTP to the terminal, `smtp` actually sends it |
| `MAIL_FROM` | no | `SkillBridge <no-reply@skillbridge.local>` | From header on the OTP email |
| `SMTP_HOST` | if `smtp` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | if `smtp` | `587` | `587` for STARTTLS, `465` for SSL |
| `SMTP_SECURE` | if `smtp` | `false` | `false` for port 587, `true` for port 465 |
| `SMTP_USER` | if `smtp` | — | The full Gmail address sending the mail |
| `SMTP_PASS` | if `smtp` | — | Gmail **App Password**, not the account password |
| `SUPABASE_URL` | for real DB | — | Project URL from Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | for real DB | — | `service_role` key. **Server only** — it bypasses RLS, so it must never reach the browser |

### `frontend/.env`

| Variable | Required | Default | What it does |
| --- | --- | --- | --- |
| `VITE_API_URL` | **yes** | `http://localhost:4000` | Base URL of the Express API. Set to the Render URL in production |
| `VITE_COLLEGE_DOMAIN` | no | `apollouniversity.edu.in` | Shown on the login screen as a hint. Keep it identical to `ALLOWED_EMAIL_DOMAIN` |

Everything prefixed `VITE_` is bundled into the JavaScript the browser downloads,
so **no secret ever belongs in `frontend/.env`**.

---

## Turning on real email

The OTP flow is already complete — switching from terminal output to real Gmail
delivery is an `.env` change only, no code change.

1. Create the Gmail account SkillBridge will send from.
2. Turn on **2-Step Verification** on that account (Google requires it before App
   Passwords appear).
3. Go to <https://myaccount.google.com/apppasswords> and create an App Password.
   You get a 16-character string.
4. In `backend/.env`:

   ```ini
   MAIL_DRIVER=smtp
   MAIL_FROM="SkillBridge <yourskillbridge@gmail.com>"
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=yourskillbridge@gmail.com
   SMTP_PASS=the16charapppassword
   ```

5. Restart the backend. The next code is emailed instead of printed, and the
   "check your terminal" banner disappears from the verify screen automatically.

If SMTP is selected but the credentials are missing, the request fails with a clear
error rather than silently dropping the email.

---

## Connecting Supabase

1. Create a project at <https://supabase.com>.
2. **SQL Editor → New query** → paste all of `backend/db/schema.sql` → **Run**.
3. **Settings → API** → copy the Project URL and the `service_role` key.
4. Put them in `backend/.env` as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
5. Restart the backend. The startup banner should now read `database : supabase`
   instead of `database : memory`.

RLS is enabled on every table with no permissive policies. Only the Express API,
holding the service-role key, can read or write — a leaked anon key gets nothing.

---

## API reference

All routes are under `/api`. Authenticated routes need `Authorization: Bearer <token>`.

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Service status, active DB and mail driver |
| `POST` | `/api/auth/request-otp` | — | Send a code to a college email |
| `POST` | `/api/auth/verify-otp` | — | Exchange a code for a JWT |
| `GET` | `/api/auth/me` | ✓ | The signed-in student |
| `GET` | `/api/users/:id` | — | Public profile and trust score |
| `PATCH` | `/api/users/me` | ✓ | Edit name, bio and skill lists |
| `GET` | `/api/listings?mode=` | — | Browse open listings |
| `GET` | `/api/listings/:id` | — | One listing |
| `POST` | `/api/listings` | ✓ | Post a task or a skill swap |
| `PATCH` | `/api/listings/:id/status` | ✓ | Owner moves the gig along |
| `GET` | `/api/bids?listing_id=` | ✓ | Bids on a listing |
| `POST` | `/api/bids` | ✓ | Place a bid |
| `POST` | `/api/bids/:id/accept` | ✓ | Owner accepts a bid |
| `GET` | `/api/exchanges/matches` | ✓ | Students whose skills line up with yours |
| `GET` | `/api/exchanges` | ✓ | Swaps you are part of |
| `POST` | `/api/exchanges` | ✓ | Propose a swap |
| `POST` | `/api/exchanges/:id/accept` | ✓ | Accept a swap |
| `GET` | `/api/reviews?user_id=` | — | Reviews for a student |
| `POST` | `/api/reviews` | ✓ | Rate the other side after completion |

---

## Not built yet

Deliberate gaps, roughly in the order the timeline expects them:

- Rejecting the losing bids when one is accepted (`bids.routes.js` has the TODO)
- Search and tag filtering on the browse page
- A reviews UI — the API works, the screen does not exist
- A dashboard of your own listings, bids and gigs
- Pagination (every list is capped at 50 rows)
- Rate limiting on `request-otp`
- Automated tests
- Deployment to Netlify and Render

Future scope from the report: Team Finder mode, in-app chat, UPI/Razorpay escrow.

---

## Working on this together

```bash
git checkout -b feature/your-thing
# ...make changes...
git add <specific files>
git commit -m "Add your thing"
git push -u origin feature/your-thing
```

Open a pull request rather than pushing to `main`, so the other person sees the
change before it lands.

**Before your first commit, confirm no `.env` file is staged** — `git status`
should never list one. The root `.gitignore` already covers them.
