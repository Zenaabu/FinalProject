// queries/adminQueries.js
const db = require("../db/dbSingleton");

// a function that returns all the users from database
function getAllUsers(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT user_id, first_name, last_name, email, phone, gender,  DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, role, is_blocked
     FROM users
    ORDER BY first_name, last_name`,
    cb,
  );
}

// a function that gets a user_id and a role
// it changes the role of the user with same id in database
function updateUserRole(user_id, role, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE users
      SET role = ?
      WHERE user_id = ?`,
    [role, user_id],
    cb,
  );
}

// a function that gets user_id and is_blocked
// it changes the status "is_blocked" in database
function updateUserBlockedStatus(user_id, is_blocked, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE users
     SET is_blocked = ?
     WHERE user_id = ?`,
    [is_blocked, user_id],
    cb,
  );
}

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserBlockedStatus,
};
