# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

BlueMars Surf Club — a course booking / management app for a surf school. Express + MySQL backend, Create React App frontend. Three user roles: `user`, `instructor`, `admin`.

## Commands

Run from the repo root unless noted.

- `npm start` — start the API server (`nodemon server/index.js`), listens on port 3001 (or `PORT` env var).
- `npm run migrate` — apply pending SQL migrations from `server/DB/migrations/` (see Database below).
- `cd client && npm start` — start the CRA dev server (proxies API calls to `http://localhost:3001`, see `client/package.json` `proxy`).
- `cd client && npm run build` — production build of the frontend.
- `cd client && npm test` — run CRA/Jest tests (`react-scripts test`); pass `-- --watchAll=false` for a single non-watch run, or a filename to target one test file.
- There is no backend test suite (root `npm test` is a placeholder) and no lint script configured at the root; the client uses CRA's built-in `eslintConfig` (`react-app`, `react-app/jest`).

### Database

- MySQL, database name `bluemars`. Connection is hardcoded in `server/DB/dbSingleton.js` (`host: localhost`, `user: root`, empty password) — not driven by env vars. Tables: `users`, `courses`, `lessons`, `register`, `attend`, `course_reservations`, `instructor_constraints`, `content_videos`, `images`, `password_reset_codes`.
- **Migrations**: `server/DB/migrations/*.sql` run in filename order via `npm run migrate` (`server/DB/migrate.js`). Applied files are recorded in `schema_migrations`, so re-running is a no-op. There is still no full baseline schema file — migrations only cover changes made from `001` onward, so an initial `bluemars` DB has to exist first.
- `dbSingleton.getConnection()` returns a shared `mysql2` connection pool; every query module calls this rather than creating its own connection. `dateStrings: true` is set, so DATE/DATETIME columns come back as plain strings.
- `attend.attended` is `ENUM('present','absent')`. A student with **no** `attend` row for a lesson is "not marked yet" — the roster queries `LEFT JOIN` onto it, so `attendance_status` is `null` in that case.
- `register.receipt_number` is the auto-increment receipt (the DB generates it); the PayPal capture id is stored separately in `register.paypal_capture_id`.

### Environment variables

`.env` at repo root (not committed as a template — check current values before assuming a var is set):
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_BASE_URL` — used by `server/services/paypalService.js`.
- `CLIENT_URL` — origin the CRA dev server runs on (defaults to `http://localhost:3000` if unset). Used to build the PayPal order's `return_url`/`cancel_url` so the sandbox redirects the browser back into the React app (not this API) after checkout — set it explicitly in any deployed environment where the frontend isn't on `localhost:3000`.
- `SESSION_SECRET` — express-session secret (falls back to a dev default if unset).
- `EMAIL_USER`, `EMAIL_PASS` — Gmail credentials for `nodemailer` in `server/validations/utils.js` (currently the actual `sendMail` call is commented out; reset codes are just logged to the console for dev).
- `PORT`, `NODE_ENV` — standard server config; `NODE_ENV=production` enables secure session cookies.

## Backend architecture (`server/`)

Callback-style (not promise-based) MySQL access throughout, layered as:

```
routes/*.js        → Express routers; wire up middleware chains and call query functions
validations/*.js   → Express middleware: auth guards + per-route request validation
queries/*.js        → Raw SQL via the shared dbSingleton pool, one file per domain
services/*.js       → External API integrations (PayPal, weather)
middlewares/*.js    → Non-validation middleware (multer upload config)
DB/dbSingleton.js   → Shared mysql2 connection pool
```

`server/index.js` mounts routers under `/api/*`: `auth`, `users`, `admin`, `instructor`, `weather`, `courses`. Session state (`req.session.user`) is the source of truth for who's logged in; it's set on login/signup and read by the `requireLogin` / `requireAdmin` / `requireInstructor` / `requireSelf` guards in `authValidation.js`. `GET /api/auth/me` echoes the session user back — the client uses it for role-based routing, since the session cookie is httpOnly and localStorage only ever held `user_id`.

**Sessions are persisted to MySQL**, not the default in-memory store — `express-mysql-session` is wired up in `index.js` against the same `dbSingleton` pool, auto-creating a `sessions` table. This matters because `npm start` runs the server under `nodemon`, which restarts the process on every file save; an in-memory store would silently log every logged-in user out on every restart during active development (this was a real bug — fixed). The cookie also now has an explicit 7-day `maxAge` (there was none before, making it a browser-session-only cookie, out of step with a durable server-side store).

Note that `/:course_id` routes are registered **after** literal paths like `/details` and `/available` in `routes/courses.js`; adding a new literal course route below them would be swallowed by the param route.

Route handlers follow a consistent request-response shape: `{ success: boolean, message?: string, ...data }`, with errors returned as `res.status(xxx).json({ success: false, message })` rather than thrown/handled centrally — every DB callback error path is handled inline in the route.

**Validation-as-middleware convention**: each route composes a chain of small, single-purpose middleware functions (e.g. `courses.js` POST `/` chains `requireLogin, requireAdmin, isInstructor, validateAddCourse, validateLessonsDetails, validateDuplicateCourse, validateInstructorLessonConflict` before the handler). When adding a new route, follow this pattern rather than putting validation logic inline in the handler. Shared low-level validators (regex/date/business-rule checks with no `req`/`res`) live in `server/validations/utils.js` and are imported by the per-domain `*Validation(s).js` files, which wrap them into Express middleware.

**Course purchase flow** (`routes/courses.js` + `services/paypalService.js` + `queries/usersQueries.js`): create-order creates a PayPal order and a `pending` `course_reservations` row; capture-order verifies the PayPal capture status, re-checks the user isn't already registered and the course isn't full (capacity vs. registered+pending count), then completes the registration. Failure at any step calls `userQ.failReservation` to release the pending reservation. `courseQueries.expireOldReservations` / `deactivateExpiredCourses` handle time-based cleanup and are invoked from route handlers, not on a cron.

**Course/lesson editing rules** — a course may be edited *while active*; what's guarded is the data that would break. `PUT /api/courses/:id` chains `validateCourseExists` (attaches `req.course`) → `validateUpdateCourseDetails` (builds `req.updatedCourse`, already keyed by DB column) → capacity-not-below-enrolled → total_lessons-not-below-scheduled → dates-still-contain-lessons → instructor-has-no-clashing-lesson. A lesson that has already taken place cannot be edited at all (`validateLessonNotAlreadyPassed`). Mutating course/lesson endpoints respond with the freshly re-assembled course (`getCourseWithDetails`) so the client never re-maps field names itself.

**`getCoursesWithDetails` / `getCourseWithDetails`** in `courseQueries.js` (both wrap `fetchCoursesWithDetails`) are the representative example of the multi-step-query pattern used for nested data: courses → lessons (batched by `course_id IN (?)`) → per-lesson roster (batched by `lesson_id IN (?)`), manually grouped and assembled in JS rather than via SQL joins/JSON aggregation. The roster half is a `UNION`: registered users `LEFT JOIN`ed onto `attend` (so unmarked students appear with a `null` status), unioned with any `attend` row whose user is no longer registered (so recorded attendance is never hidden).

**Attendance** is written by the course's instructor, one whole lesson per request: `POST /api/instructor/lessons/:lesson_id/attendance` with `{ records: [{ user_id, attended }] }`, upserted via `INSERT … ON DUPLICATE KEY UPDATE`, so re-posting corrects an already-marked lesson. `utils.canTakeAttendance` gates it to the window between the lesson's start time and the course end date; the matching `GET` returns `lesson.can_take_attendance` so the UI can disable saving.

## Frontend architecture (`client/src/`)

CRA (react-scripts 5) + `react-router-dom` v7. No global state library or data-fetching library — components call the API directly (relative paths, proxied by CRA in dev).

**Route-module convention**: each feature area under `components/` owns a `<feature>Routes.jsx` exporting a `Route`/`<>` fragment of `<Route>` elements, imported and spread directly into `<Routes>` in `App.js`. To add a page to a feature area, add it to that area's `xRoutes.jsx` — don't edit `App.js` for anything other than wiring in a new top-level feature area. Example: `components/admin/adminRoutes.jsx` nests all `/admin/*` pages inside `<AdminLayout>` so they share the sidebar; `components/auth/authRoutes.jsx` defines `/login` and `/signup` via one shared `<Auth initialMode=.../>` component.

**Role areas**: `/admin/*`, `/instructor/*`, and `/user/*` are each wrapped in `<RequireRole roles={[...]}>` (`components/auth/RequireRole.jsx`), which reads the session through the `useSession` hook and redirects elsewhere-belonging users to `HOME_BY_ROLE`. That guard is convenience only — the API's `requireAdmin`/`requireInstructor` are the real protection (there's no `requireUser`; any logged-in non-admin/instructor is treated as role `user`). `LoginForm` also routes by `HOME_BY_ROLE` after a successful login. Admin and instructor share one sidebar shell (`admin/sidebar/AdminSidebar` takes `subtitle`/`items`/`rootPath`/`ariaLabel` props); the user portal instead uses a top header (`components/user/Header`), since it reads as a single-page dashboard rather than a multi-section back office. `components/user/userRoutes.jsx` also reuses `admin/profile/UserProfilePage` at `/user/profile` — that page keys off `localStorage.getItem("user_id")`, not the admin session, so it works unmodified for any role.

**Course enrollment (user-facing)**: `GET /api/courses/available` lists active courses that haven't started yet, with `seats_left` (capacity minus registered *and* unexpired-pending) and `is_registered` for the current user. `components/user/courses/CourseCatalog.jsx` lists these and its "Enroll" button starts the real PayPal flow: `POST .../paypal/create-order` → full-page redirect to the returned `approve_link` → PayPal redirects back to `/user/courses/:course_id/paypal/return` (`EnrollReturn.jsx`) with `?token=<order_id>` → that page posts to `.../paypal/capture-order` to complete the registration. `EnrollReturn` guards the capture call with a `useRef` so React StrictMode's double-effect in dev doesn't fire it twice (capture is not idempotent — it registers the user once per call). `CourseCatalog` also accepts `?level=beginner|intermediate|advanced` to pre-filter the list.

**Dashboard "My Courses"** (`GET /api/courses/my-courses`, `components/user/UserHome/MyCourses.jsx`): every course the logged-in user is registered to, each with its `next_lesson` (soonest lesson whose end time hasn't passed, computed in the route handler — `null` once the course has none left). If the user has zero registrations, the dashboard falls back to the same three marketing plan cards as the landing page (`landing/sections/courses/coursesData.js`, shared between `CoursesGrid` and here) — `CourseCard` takes a `linkTo` prop (default `/signup`) so the dashboard's cards can point at `/user/courses?level=...` instead.

**Data ownership**: pages that mutate own their data at the container level rather than per-card — e.g. `CoursesMain` holds the course list *and* the instructor dropdown options and passes them down, so a create/edit refreshes the accordion and the instructor list is fetched once instead of once per course card.

**Component organization**: feature-first under `components/<area>/...`, further split by sub-feature (e.g. `admin/courses/CourseManager/`, `admin/dashboard/stats/`). Every component has a co-located CSS Module (`Name.module.css`) — no global stylesheet conventions or CSS-in-JS beyond `App.css`/`index.css`.

Icons via `lucide-react`. Toasts via `sonner`.
