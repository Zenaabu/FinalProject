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

// a function that gets all the instructor constraints with the
// instructor full name
function getAllInstructorConstraints(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT 
        ic.constraints_id,
        ic.user_id,
        u.first_name,
        u.last_name,
        ic.start_time,
        ic.end_time,
        ic.notes
     FROM instructor_constraints ic
     JOIN users u ON ic.user_id = u.user_id
     ORDER BY ic.start_time`,
    cb,
  );
}

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserBlockedStatus,
  getAllInstructorConstraints,
};
