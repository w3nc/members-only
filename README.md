# Members Only

A message board where anyone can read the notes, but only members see who wrote them. Built with Express, EJS, and PostgreSQL.

## Tech

- Express, EJS, PostgreSQL (`pg`)
- Passport local strategy with bcryptjs password hashing
- express-session backed by PostgreSQL (`connect-pg-simple`)
- express-validator for form validation

## Features

- Sign up, log in, log out
- Home page shows all messages; authors are hidden until you join
- Join the club with a secret passcode from `.env` (member or admin)
- Create new messages (logged-in users)
- Delete messages (admin only, CSRF-protected)
- Passcode attempts are rate-limited (5 tries per 15 minutes per user)
- Sessions survive server restarts via PostgreSQL session store

## Setup

Create the database and tables:

```bash
node db/setup.js
```

The script reads `db/schema.sql` and is safe to run more than once.

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session signing secret |
| `MEMBER_PASSCODE` | Passcode that grants member access |
| `ADMIN_PASSCODE` | Passcode that grants admin access |
| `PORT` | Server port (default 3000) |

## Run

```bash
npm start
```

Or with auto-restart:

```bash
npm run dev
```
