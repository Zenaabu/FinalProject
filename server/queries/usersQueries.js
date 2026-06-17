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

// a function that updates the password of a user by email
function updateUserPassword(email, hashedPassword, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE users
     SET password = ?
     WHERE email = ?`,
    [hashedPassword, email],
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

// a function that gets a user_id and returns it's role
function findRole(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT role FROM users
     WHERE user_id =?`,
    [user_id],
    cb,
  );
}

// a function that gets user_id, updatedUser
// it updates the user details according to what it got
function updateMyDetails(user_id, updatedUser, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE users
     SET ?
     WHERE user_id = ?`,
    [updatedUser, user_id],
    cb,
  );
}

// a function that gets the user_id, course_id, receipt_number
// and register the user to course in DB
function registerUserToCourse(user_id, course_id, receipt_number, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO register
     (user_id, course_id, payment_date, receipt_number)
     VALUES (?, ?, NOW(), ?)`,
    [user_id, course_id, receipt_number],
    cb,
  );
}

// a function that gets a course_id
// it gets the taken places in course
function getCourseTakenPlaces(course_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        c.capacity,
        COUNT(DISTINCT r.user_id) AS registered_count,
        COUNT(DISTINCT cr.reservation_id) AS pending_count
     FROM courses c
     LEFT JOIN register r
       ON c.course_id = r.course_id
     LEFT JOIN course_reservations cr
       ON c.course_id = cr.course_id
      AND cr.status = 'pending'
      AND cr.expires_at > NOW()
     WHERE c.course_id = ?
     GROUP BY c.course_id, c.capacity`,
    [course_id],
    cb,
  );
}

// a function that gets the user_id and course_id
// it check if user already registered to course
function isUserRegistered(user_id, course_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM register
     WHERE user_id = ?
       AND course_id = ?`,
    [user_id, course_id],
    cb,
  );
}

// a function that gets user_id, course_id, paypal_order_id
// it creates a new course reservation in DB
function createCourseReservation(user_id, course_id, paypal_order_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO course_reservations
     (user_id, course_id, paypal_order_id, status, expires_at)
     VALUES (?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
    [user_id, course_id, paypal_order_id],
    cb,
  );
}

// a function that gets paypal_order_id, user_id, course_id
// and finds the pending reservation
function findPendingReservation(paypal_order_id, user_id, course_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM course_reservations
     WHERE paypal_order_id = ?
       AND user_id = ?
       AND course_id = ?
       AND status = 'pending'
       AND expires_at > NOW()`,
    [paypal_order_id, user_id, course_id],
    cb,
  );
}

// a function that gets reservation_id
// it changes the status of the reservation to approved
function approveReservation(reservation_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE course_reservations
     SET status = 'approved'
     WHERE reservation_id = ?`,
    [reservation_id],
    cb,
  );
}

// a function that gets reservation_id
// it changes the status of the reservation to failed
function failReservation(reservation_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE course_reservations
     SET status = 'failed'
     WHERE reservation_id = ?`,
    [reservation_id],
    cb,
  );
}

// a function that gets user_id, course_id, receipt_number
// it registers a user to a course
function registerUserToCourse(user_id, course_id, receipt_number, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO register
     (user_id, course_id, payment_date, receipt_number)
     VALUES (?, ?, NOW(), ?)`,
    [user_id, course_id, receipt_number],
    cb,
  );
}
module.exports = {
  findUserById,
  findUserByEmail,
  upsertResetCode,
  findResetCodeByEmail,
  deleteResetCodeByEmail,
  updateUserPassword,
  createUser,
  findRole,
  updateMyDetails,
  registerUserToCourse,
  getCourseTakenPlaces,
  isUserRegistered,
  createCourseReservation,
  findPendingReservation,
  approveReservation,
  failReservation,
  registerUserToCourse,
};
