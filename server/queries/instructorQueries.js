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

// a function that gets lesson_id and an array of { user_id, attended }
// it saves the whole lesson attendance in one statement.
// rows that already exist for this lesson are updated instead of inserted, so
// an instructor can correct the attendance of a lesson they already marked
function saveAttendance(lesson_id, records, cb) {
  const conn = db.getConnection();

  const values = records.map((record) => [
    lesson_id,
    record.user_id,
    record.attended,
  ]);

  conn.query(
    `INSERT INTO attend (lesson_id, user_id, attended)
     VALUES ?
     ON DUPLICATE KEY UPDATE attended = VALUES(attended)`,
    [values],
    cb,
  );
}

// a function that gets a lesson_id and returns the roster of that lesson:
// every user registered to the lesson's course, together with the attendance
// the instructor recorded for them (NULL when not marked yet)
function getLessonAttendance(lesson_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        a.attended AS attendance_status
     FROM lessons l
     JOIN register r ON r.course_id = l.course_id
     JOIN users    u ON u.user_id   = r.user_id
     LEFT JOIN attend a
            ON a.lesson_id = l.lesson_id
           AND a.user_id   = u.user_id
     WHERE l.lesson_id = ?
     ORDER BY u.first_name, u.last_name`,
    [lesson_id],
    cb,
  );
}

// a function that gets a course_id and a list of user_ids
// it returns the ids among them that are NOT registered to the course
function findUnregisteredUsers(course_id, user_ids, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT user_id
     FROM register
     WHERE course_id = ?
       AND user_id IN (?)`,
    [course_id, user_ids],
    (err, rows) => {
      if (err) return cb(err);

      const registered = rows.map((row) => row.user_id);

      cb(
        null,
        user_ids.filter((id) => !registered.includes(id)),
      );
    },
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
        c.end_date,
        su.first_name AS substitute_first_name,
        su.last_name  AS substitute_last_name
     FROM lessons l
     JOIN courses c
       ON l.course_id = c.course_id
     LEFT JOIN users su ON su.user_id = l.substitute_instructor_id
     WHERE l.lesson_id = ?
       AND c.user_id = ?`,
    [lesson_id, instructor_id],
    cb,
  );
}

// a function that gets a lesson_id
// it returns the most recent change made to that lesson (reschedule or
// substitute assign/clear), or no rows if it was never changed
function getLatestLessonChange(lesson_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT change_type, details
     FROM lesson_history
     WHERE lesson_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [lesson_id],
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

// a function that gets a user_id and a date range
// it returns this instructor's own lessons that fall inside that range, so
// the frontend can warn them before they submit a time-off request that
// overlaps lessons they're scheduled to teach
function getLessonsInRangeForInstructor(user_id, start_date, end_date, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        c.course_id,
        c.description AS course_description,
        l.lesson_id,
        l.lesson_number,
        l.lesson_date,
        l.start_time,
        l.end_time
     FROM courses c
     JOIN lessons l ON l.course_id = c.course_id
     WHERE c.user_id = ?
       AND c.is_active = 1
       AND l.lesson_date BETWEEN ? AND ?
     ORDER BY l.lesson_date, l.start_time`,
    [user_id, start_date, end_date],
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

// a function that gets a user_id
// it returns all constraints that instructor has submitted, most recent first
function getConstraintsByInstructor(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        constraints_id,
        start_time,
        end_time,
        notes,
        status
     FROM instructor_constraints
     WHERE user_id = ?
     ORDER BY start_time DESC`,
    [user_id],
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
  getLessonAttendance,
  findUnregisteredUsers,
  findInstructorLesson,
  isUserRegisteredToCourse,
  getCourseLessons,
  getLessonsInRangeForInstructor,
  addConstraint,
  findDuplicateConstraint,
  findOverlappingConstraint,
  getConstraintsByInstructor,
  getLatestLessonChange,
};
