// queries/adminQueries.js
const db = require("../db/dbSingleton");

// a function that returns all the users from database
function getAllUsers(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM users,
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

module.exports = {
  getAllUsers,
  updateUserRole,
};
