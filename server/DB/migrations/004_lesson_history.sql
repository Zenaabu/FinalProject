-- ─── Migration 004 ───────────────────────────────────────────────────────────
-- A small audit trail for lesson changes (reschedule / substitute
-- assign-or-clear), so:
--   1. the instructor can see, on their own course/attendance view, that a
--      lesson they teach was changed (and how)
--   2. the admin's Staff Scheduling panel can show what was actually done to
--      resolve an approved instructor constraint, instead of the lesson row
--      just disappearing once it's no longer in the affected date range
--
-- constraints_id is set only when the change was made while resolving that
-- constraint (from the Staff Scheduling panel) — NULL for a plain edit made
-- from the regular course editor. Either way the instructor still sees the
-- change; constraints_id is only used to group history under "this is what
-- we did about that request" on the admin side.
--
-- Run with:  npm run migrate
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_history (
  history_id      INT          NOT NULL AUTO_INCREMENT,
  lesson_id       INT          NOT NULL,
  constraints_id  INT          NULL,
  change_type     ENUM('rescheduled', 'substitute_assigned', 'substitute_cleared')
                               NOT NULL,
  details         VARCHAR(255) NOT NULL,
  changed_by      VARCHAR(9)   NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (history_id),
  KEY idx_lesson_history_lesson (lesson_id),
  KEY idx_lesson_history_constraint (constraints_id),
  CONSTRAINT fk_lesson_history_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons (lesson_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lesson_history_constraint
    FOREIGN KEY (constraints_id) REFERENCES instructor_constraints (constraints_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_lesson_history_changed_by
    FOREIGN KEY (changed_by) REFERENCES users (user_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
