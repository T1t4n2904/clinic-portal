<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## General Constraints

- Do not redesign architecture without explicit user approval.
- Never add extra features beyond what was requested.
- Never commit or push to Git unless explicitly told to do so.

## Build & Migration

- Always run `npm run build` before reporting a task as successful.
- If the Prisma schema changes, create a migration (`npx prisma migrate dev`) and run `npx prisma generate`.

## Security

- A patient must never be able to access another patient's data.
- Doctor routes must stay protected (authenticated doctor-only access).
- The doctor login route must stay hidden from the public landing page.

## UX Standards

- All buttons must have loading/disabled feedback during async operations.
- All forms must submit on Enter key press.

## Data Model

- Appointment is the central entity for future clinic workflows. Design data relationships accordingly.

## Task Reporting

After every task, report:
1. Files changed
2. Migrations created/run
3. Build result (`npm run build`)
4. Manual test steps for verification
5. Known limitations or caveats

## Deployment & Git Safety

- Never push directly unless explicitly instructed.
- Before any commit/push, run `git status` and list changed files.
- Never include `.env`, secrets, database passwords, or local DB files.
- If Vercel/env variable changes are needed, report them as manual actions.

## Product Direction

- This is a real clinic workflow project, not a tech demo.
- Prefer practical clinic workflows over flashy features.
- Keep doctor workflow appointment-first.
- Keep public site patient-facing.
