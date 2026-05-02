// import the database singleton to run queries
const db = require("../DB/dbSingleton");

// a login function that finds a user by id, used for authentication
function findUserById(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM users
     WHERE user_id = ?`,
    [user_id],
    cb,
  );
}

// a function that gets the email and finds the user from users table by the email
function findUserByEmail(email, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT user_id, email
     FROM users
     WHERE email = ?`,
    [email],
    cb,
  );
}

// a function that gets user_id, email, code expiresAt and inserts them to password_reset_codes table
// if their is no data to same user.
// if their is a data in the table for same user - then it updates it (using upsert)
function upsertResetCode(user_id, email, hashedCode, expiresAt, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO password_reset_codes (user_id, email, code, expires_at)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
     code = VALUES(code),
     expires_at = VALUES(expires_at)`,
    [user_id, email, hashedCode, expiresAt],
    cb,
  );
}

// a function that gets an email of the user and finds the reset code of the
// user only if it didn't expire
function findResetCodeByEmail(email, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM password_reset_codes
     WHERE email = ?
     AND expires_at > NOW()`,
    [email],
    cb,
  );
}

// a function that gets the email of the user and delete the code we've send to him
// to reset the password from table (after using the code)
function deleteResetCodeByEmail(email, cb) {
  const conn = db.getConnection();

  conn.query(
    `DELETE FROM password_reset_codes
     WHERE email = ?`,
    [email],
    cb,
  );
}

// a function that gets a new user and adds it to the data base in users table
function createUser(newUser, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO users
      (user_id, first_name, last_name, email, phone, gender, birth_date, role , password, is_blocked)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newUser.user_id,
      newUser.first_name,
      newUser.last_name,
      newUser.email,
      newUser.phone,
      newUser.gender,
      newUser.birth_date,
      newUser.role,
      newUser.password,
      newUser.is_blocked,
    ],
    cb,
  );
}

module.exports = {
  findUserById,
  findUserByEmail,
  upsertResetCode,
  findResetCodeByEmail,
  deleteResetCodeByEmail,
  createUser,
};
