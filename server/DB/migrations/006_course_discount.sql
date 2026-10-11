-- ─── Migration 006 ───────────────────────────────────────────────────────────
-- Adds a last-minute discount an admin can apply to a single upcoming course
-- (e.g. a course that's under-filled and starting in a day or two). NULL
-- means no discount is active — it is never applied automatically, only when
-- an admin explicitly sets it from the Courses & Lessons dashboard, and the
-- percentage is applied on the fly wherever the price is shown or charged
-- rather than being baked into a separate "sale price" column.
--
-- Run with:  npm run migrate
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE courses
  ADD COLUMN discount_percent TINYINT UNSIGNED NULL DEFAULT NULL AFTER price;
