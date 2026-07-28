-- ─── Migration 001 ───────────────────────────────────────────────────────────
-- Brings the schema in line with the course / lesson / attendance flow:
--   1. attend.attended  tinyint(1)  ->  ENUM('present','absent')
--   2. attend gets foreign keys so attendance rows cannot outlive their
--      lesson or user
--   3. course_reservations table (referenced by the PayPal flow in
--      queries/usersQueries.js but never created)
--   4. register keeps its auto-increment receipt_number as the receipt, and
--      stores the PayPal capture id in its own varchar column
--
-- Run with:  npm run migrate
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. attend.attended -> ENUM ──────────────────────────────────────────────
-- Done in four steps: a direct tinyint -> enum ALTER would map 1 to the first
-- enum member but 0 to the invalid empty-string value.
ALTER TABLE attend
  ADD COLUMN attended_new ENUM('present','absent') NOT NULL DEFAULT 'absent';

UPDATE attend
  SET attended_new = IF(attended = 1, 'present', 'absent');

ALTER TABLE attend
  DROP COLUMN attended;

ALTER TABLE attend
  CHANGE attended_new attended ENUM('present','absent') NOT NULL;

-- ── 2. attend foreign keys ──────────────────────────────────────────────────
ALTER TABLE attend
  ADD CONSTRAINT fk_attend_lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons (lesson_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_attend_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 3. course_reservations ──────────────────────────────────────────────────
-- One row per PayPal checkout attempt. A row holds a seat in the course while
-- status = 'pending' and expires_at is still in the future (see
-- usersQueries.getCourseTakenPlaces).
CREATE TABLE IF NOT EXISTS course_reservations (
  reservation_id   INT          NOT NULL AUTO_INCREMENT,
  user_id          VARCHAR(9)   NOT NULL,
  course_id        INT          NOT NULL,
  paypal_order_id  VARCHAR(64)  NOT NULL,
  status           ENUM('pending','approved','failed','expired')
                                NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at       DATETIME     NOT NULL,
  PRIMARY KEY (reservation_id),
  UNIQUE KEY uq_reservation_order (paypal_order_id),
  KEY idx_reservation_course_status (course_id, status),
  CONSTRAINT fk_reservation_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reservation_course
    FOREIGN KEY (course_id) REFERENCES courses (course_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 4. register: PayPal capture id + foreign keys ───────────────────────────
-- receipt_number stays the auto-increment receipt. The PayPal capture id is a
-- string ("5O190127TN364715T") and needs its own column.
ALTER TABLE register
  ADD COLUMN paypal_capture_id VARCHAR(64) NULL AFTER receipt_number;

ALTER TABLE register
  ADD CONSTRAINT fk_register_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_register_course
    FOREIGN KEY (course_id) REFERENCES courses (course_id)
    ON DELETE CASCADE ON UPDATE CASCADE;
