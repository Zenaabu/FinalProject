-- ─── Migration 003 ───────────────────────────────────────────────────────────
-- Lets a single lesson be covered by a different instructor than the one who
-- owns the course, without reassigning the whole course. Used when an admin
-- approves an instructor_constraints request and needs to cover just the
-- lessons that fall inside that date range.
-- NULL (the default) means the course's own instructor (courses.user_id)
-- still teaches it — nothing changes for the vast majority of lessons.
--
-- Run with:  npm run migrate
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE lessons
  ADD COLUMN substitute_instructor_id VARCHAR(9) NULL AFTER course_id;

ALTER TABLE lessons
  ADD CONSTRAINT fk_lesson_substitute_instructor
    FOREIGN KEY (substitute_instructor_id) REFERENCES users (user_id)
    ON DELETE SET NULL ON UPDATE CASCADE;
