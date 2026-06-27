# Clinic Portal Auth MVP

A focused patient authentication MVP built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, Supabase PostgreSQL, and bcrypt.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma 6
- Supabase PostgreSQL
- bcrypt

## Features

- Patient registration with server-side validation.
- Secure password hashing with bcrypt.
- OTP generation, hashing, expiry, verification, and resend.
- Phone verification before login.
- Login with email or phone number.
- Signed HTTP-only session cookie.
- Protected patient dashboard.
- Hidden doctor login route with doctor-only access.
- Basic doctor patient directory.
- Demo appointment booking and payment confirmation.
- Demo password reset with hashed OTP.
- Session invalidation through `APP_VERSION`.
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

Create or update the demo doctor account:

```bash
npm run seed:doctor
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

- `DATABASE_URL`: PostgreSQL database connection used by Prisma.
- `SESSION_SECRET`: Secret key used to sign session cookies.
- `APP_VERSION`: deployment/version value stored in session cookies to invalidate old sessions.
- `DOCTOR_EMAIL`, `DOCTOR_PHONE`, `DOCTOR_PASSWORD`, `DOCTOR_NAME`: optional values used by `npm run seed:doctor`.

## Project Structure

```text
app/
  dashboard/      Protected patient dashboard and logout action
  doctor/         Hidden doctor login, dashboard, and patient directory
  forgot-password/ Demo reset OTP request
  reset-password/  Demo password reset completion
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
- Supabase PostgreSQL is used for shared development and deployment.
- OTP is currently development-only and displayed/logged locally. Use an SMS provider before production use.
