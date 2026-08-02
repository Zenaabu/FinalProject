-- ─── Migration 002 ───────────────────────────────────────────────────────────
-- Lets the admin decide what to do with a submitted instructor constraint:
--   'pending'   -> not reviewed yet (default). Instructor is still expected
--                  to teach unless/until the admin approves it.
--   'approved'  -> admin confirmed the instructor is out; find cover / notify
--                  the registered students.
--   'rejected'  -> admin looked at it and the instructor still has to teach.
--
-- Run with:  npm run migrate
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE instructor_constraints
  ADD COLUMN status ENUM('pending', 'approved', 'rejected')
    NOT NULL DEFAULT 'pending' AFTER notes;
