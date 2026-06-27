# Clinic Portal Auth MVP

A focused patient authentication MVP built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite, and bcrypt.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma 6
- SQLite
- bcrypt

## Features

- Patient registration with server-side validation.
- Secure password hashing with bcrypt.
- OTP generation, hashing, expiry, verification, and resend.
- Phone verification before login.
- Login with email or phone number.
- Signed HTTP-only session cookie.
- Protected patient dashboard.
- Logout flow.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
copy .env.example .env
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env` from `.env.example`.

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-secret"
```

- `DATABASE_URL`: SQLite database connection used by Prisma.
- `SESSION_SECRET`: Secret key used to sign session cookies.

## Project Structure

```text
app/
  dashboard/      Protected patient dashboard and logout action
  login/          Login page, form, and server action
  register/       Registration page, form, and server action
  verify-otp/     OTP verification page, form, resend, and server actions
components/       Shared form and layout components
lib/              Prisma client, OTP helpers, session helpers, validation
prisma/           Prisma schema and migrations
public/           Static assets
```

## Screenshots

Add screenshots before sharing or deploying:

- Home page: `docs/screenshots/home.png`
- Registration page: `docs/screenshots/register.png`
- OTP verification page: `docs/screenshots/verify-otp.png`
- Login page: `docs/screenshots/login.png`
- Dashboard page: `docs/screenshots/dashboard.png`

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npx prisma studio
```

## Deployment Notes

- Do not commit `.env`, `.next/`, `node_modules/`, or local SQLite database files.
- Set `SESSION_SECRET` to a strong production value.
- SQLite is suitable for local MVP development. For production, migrate to a hosted database such as PostgreSQL.
- OTP is currently development-only and displayed/logged locally. Use an SMS provider before production use.
