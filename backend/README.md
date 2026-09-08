# On the Bill — API (SQLite)

Express + SQLite backend. Data persists in `data/onthebill.db`.

## Setup

```bash
cd backend
npm install
npm run dev
```

API: **http://localhost:4000**

On first start, artists are seeded automatically.

## Database

- File: `backend/data/onthebill.db`
- Tables: `artists`, `users`, `bookings`
- Survives server restarts

Manual re-seed:

```bash
npm run seed
```

## Endpoints

Same as before — artists, bookings, auth.

**Note:** Passwords are stored in plain text for demo only. Do not use this in production without hashing (e.g. bcrypt).
