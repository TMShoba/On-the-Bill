# The LineUp — API (SQLite)

Express + SQLite backend. Data persists in `data/onthebill.db`.

## Setup

```bash
cd backend
npm install
npm run dev
```

API: **http://localhost:4000**

On first start, artists are seeded automatically.

## Environment variables (optional)

Create a `.env` file (or set these on your host) to enable real email
delivery. Without them, the notifications route logs what it would have
sent instead of failing — local dev works either way.

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=The LineUp <no-reply@thelineup.co.za>
```

Any SMTP provider works — SendGrid, Postmark, Resend (SMTP mode), or a
Gmail app password for early testing.

## Database

- File: `backend/data/onthebill.db`
- Tables: `artists`, `users`, `bookings`
- Survives server restarts

Manual re-seed:

```bash
npm run seed
```

## Endpoints

- `GET /api/artists` — list, supports `?q=&genre=&location=`
- `GET /api/artists/:id`
- `GET|POST /api/bookings`
- `PATCH /api/bookings/:id` — update status (pending/confirmed/declined)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/notifications/email` — sends the four booking-critical emails
  (new request, accepted, declined, payment received). Called by the
  frontend's `emailService.ts`.

## Security notes

- **Passwords are hashed with bcrypt** as of this version. Existing accounts
  created before this change are upgraded automatically the next time they
  log in successfully — no manual migration needed.
- `demo-token-<userId>` auth tokens are for this demo only — not signed, not
  expiring. Fine for a prototype; swap for real JWTs (or a session store)
  before handling real money or real user data at scale.
- `PATCH /api/bookings/:id` currently has no auth/ownership check — anyone
  who knows a booking ID can change its status. Worth locking down (require
  the logged-in artist to own the booking) before this is the primary
  booking path in production.
