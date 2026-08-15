-- ─── Migration 005 ───────────────────────────────────────────────────────────
-- A single-row settings table holding the school's VAT rate. VAT used to be
-- typed in by hand on every course at creation time, which was an easy place
-- to make a mistake — now there's one rate the admin manages from Financials,
-- and course creation always uses it. courses.vat_percent is kept in sync
-- with this row (updated in bulk whenever the rate changes) so the existing
-- per-course financial queries don't need to change.
--
-- Run with:  npm run migrate
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS settings (
  id          TINYINT      NOT NULL DEFAULT 1,
  vat_percent DECIMAL(5,2) NOT NULL DEFAULT 17.00,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO settings (id, vat_percent) VALUES (1, 17.00);
