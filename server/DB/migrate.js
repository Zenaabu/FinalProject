// ─── migrate.js ──────────────────────────────────────────────────────────────
// Runs every .sql file in DB/migrations in filename order and records which
// ones already ran in a `schema_migrations` table, so re-running is a no-op.
//
// Usage:  npm run migrate
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");
const db = require("./dbSingleton");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

const conn = db.getConnection();

// promise wrapper so the migration steps can run sequentially with await
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// a function that splits a .sql file into individual statements
// (mysql2 runs one statement per query call unless multipleStatements is on)
function splitStatements(sql) {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function migrate() {
  await query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name    VARCHAR(255) NOT NULL,
       ran_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (name)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  );

  const applied = await query(`SELECT name FROM schema_migrations`);
  const appliedNames = applied.map((row) => row.name);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (appliedNames.includes(file)) {
      console.log(`- skipping ${file} (already applied)`);
      continue;
    }

    console.log(`> applying ${file}`);

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

    for (const statement of splitStatements(sql)) {
      await query(statement);
    }

    await query(`INSERT INTO schema_migrations (name) VALUES (?)`, [file]);

    console.log(`  done`);
  }

  console.log("All migrations applied.");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
