// import the database singleton to run queries
const db = require("../DB/dbSingleton");

// a function that gets a course_id and instructor_id
// it returns the registered users for instructor course
function getCourseRegistrationsForInstructor(course_id, instructor_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        r.payment_date
     FROM register r
     JOIN users u ON r.user_id = u.user_id
     JOIN courses c ON r.course_id = c.course_id
     WHERE r.course_id = ?
       AND c.user_id = ?
     ORDER BY r.payment_date DESC`,
    [course_id, instructor_id],
    cb,
  );
}

// a function that gets a course_id and instructor_id
// it returns the course from DB that has same course_id and same instructor_id
function findInstructorCourse(course_id, instructor_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM courses
     WHERE course_id = ?
     AND user_id = ?`,
    [course_id, instructor_id],
    cb,
  );
}

// a function that gets lesson_id, user_id and attended
// it saves the attendance in the DB
// if the user already in the attended table then just update the attendance
function saveAttendance(lesson_id, user_id, attended, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO attend (lesson_id, user_id, attended)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE attended = VALUES(attended)`,
    [lesson_id, user_id, attended],
    cb,
  );
}

// a function that gets a lesson_id, instructor_id
// it checks if a lesson belongs to a course of the logged-in instructor
function findInstructorLesson(lesson_id, instructor_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        l.*,
        c.course_id,
        c.end_date
     FROM lessons l
     JOIN courses c
       ON l.course_id = c.course_id
     WHERE l.lesson_id = ?
       AND c.user_id = ?`,
    [lesson_id, instructor_id],
    cb,
  );
}

// a function that gets a user_id and course_id
// it checks if user is registered to course
function isUserRegisteredToCourse(user_id, course_id, cb) {
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

// a function that gets a course_is
// it returns the list of lessons in this course from DB
function getCourseLessons(course_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM lessons
     WHERE course_id = ?
     ORDER BY lesson_number`,
    [course_id],
    cb,
  );
}

// a function that gets a constraint and save it at DB
function addConstraint(constraint, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO instructor_constraints
     (
       user_id,
       start_time,
       end_time,
       notes
     )
     VALUES (?, ?, ?, ?)`,
    [
      constraint.user_id,
      constraint.start_time,
      constraint.end_time,
      constraint.notes,
    ],
    cb,
  );
}

// a function that gets user_id, start_time, end_time
// it checks if there is a duplicate constraints that already have the same data
// in DB
function findDuplicateConstraint(user_id, start_time, end_time, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM instructor_constraints
     WHERE user_id = ?
       AND start_time = ?
       AND end_time = ?`,
    [user_id, start_time, end_time],
    cb,
  );
}

// a function that gets user_id, start_time, end_time
// it checks if instructor already has an overlapping constraint
function findOverlappingConstraint(user_id, start_time, end_time, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM instructor_constraints
     WHERE user_id = ?
       AND start_time < ?
       AND end_time > ?`,
    [user_id, end_time, start_time],
    cb,
  );
}

module.exports = {
  getCourseRegistrationsForInstructor,
  findInstructorCourse,
  saveAttendance,
  findInstructorLesson,
  isUserRegisteredToCourse,
  getCourseLessons,
  addConstraint,
  findDuplicateConstraint,
  findOverlappingConstraint,
};
