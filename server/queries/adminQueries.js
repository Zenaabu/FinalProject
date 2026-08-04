// queries/adminQueries.js
const db = require("../DB/dbSingleton");

// a function that gets a user_id (of the admin)
// it returns all the users from DB without the user with user_id (without admin)
function getAllUsers(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT user_id, first_name, last_name, email, phone, gender,  DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, role, is_blocked
     FROM users
     where user_id != ?
    ORDER BY first_name, last_name`,
    [user_id],
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

// a function that returns every user with role = 'instructor'
// used to populate the instructor dropdown when creating/editing a course
function getInstructors(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT user_id, first_name, last_name
     FROM users
     WHERE role = 'instructor'
     ORDER BY first_name, last_name`,
    cb,
  );
}

// a function that returns the KPI numbers shown on the admin dashboard home
// page: active courses, distinct students who ever registered, instructors
// currently not blocked, this month's profit (course price excl. VAT summed
// over registrations paid this month), and new students in the last 7 days
function getDashboardStats(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        (SELECT COUNT(*) FROM courses WHERE is_active = 1) AS active_courses,
        (SELECT COUNT(DISTINCT user_id) FROM register) AS registered_students,
        (SELECT COUNT(*) FROM users
          WHERE role = 'instructor' AND is_blocked = 0) AS active_instructors,
        (SELECT COALESCE(SUM(c.price / (1 + c.vat_percent / 100)), 0)
           FROM register r
           JOIN courses c ON r.course_id = c.course_id
          WHERE MONTH(r.payment_date) = MONTH(CURDATE())
            AND YEAR(r.payment_date) = YEAR(CURDATE())) AS monthly_profit,
        (SELECT COUNT(DISTINCT user_id) FROM register
          WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS new_students_week`,
    cb,
  );
}

// a function that returns the active/upcoming courses (name, start/end date)
// for the admin dashboard's "Courses" table — inactive courses are excluded
// since they're not useful at-a-glance information; a list of courses stays
// roughly bounded in size, unlike registrations which grow with every
// enrollment, so this scales better as the student base grows
function getRecentCourses(limit, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        c.course_id,
        c.description,
        DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(c.end_date, '%Y-%m-%d') AS end_date
     FROM courses c
     WHERE c.is_active = 1
     ORDER BY c.start_date DESC
     LIMIT ?`,
    [limit],
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
        ic.notes,
        ic.status
     FROM instructor_constraints ic
     JOIN users u ON ic.user_id = u.user_id
     ORDER BY ic.start_time`,
    cb,
  );
}

// a function that gets a constraints_id and returns that constraint
function findConstraintById(constraints_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM instructor_constraints
     WHERE constraints_id = ?`,
    [constraints_id],
    cb,
  );
}

// a function that gets an instructor's user_id and a date ("YYYY-MM-DD")
// it returns any APPROVED constraint of that instructor which covers that
// date — used to stop a lesson from being rescheduled onto a date the
// instructor was confirmed unavailable for
function findApprovedConstraintOnDate(user_id, date, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM instructor_constraints
     WHERE user_id = ?
       AND status = 'approved'
       AND ? BETWEEN DATE(start_time) AND DATE(end_time)`,
    [user_id, date],
    cb,
  );
}

// a function that gets a constraints_id and a status ('approved' | 'rejected')
// it updates the constraint's status
function updateConstraintStatus(constraints_id, status, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE instructor_constraints
     SET status = ?
     WHERE constraints_id = ?`,
    [status, constraints_id],
    cb,
  );
}

// a function that gets an instructor's user_id, a date range and a
// constraints_id. it returns the lessons that instructor teaches inside that
// range, together with the course they belong to and whoever is currently
// covering them (if anyone) — used to show the admin what an approved
// constraint actually affects.
// a lesson that was already rescheduled OUT of the range because of this
// exact constraint is still included (matched through lesson_history), so
// the admin keeps seeing it here instead of it just disappearing once
// resolved
function getAffectedLessonsForConstraint(
  user_id,
  start_date,
  end_date,
  constraints_id,
  cb,
) {
  const conn = db.getConnection();

  conn.query(
    `SELECT DISTINCT
        c.course_id,
        c.description AS course_description,
        l.lesson_id,
        l.lesson_number,
        l.lesson_date,
        l.start_time,
        l.end_time,
        l.substitute_instructor_id,
        su.first_name AS substitute_first_name,
        su.last_name AS substitute_last_name
     FROM lessons l
     JOIN courses c ON c.course_id = l.course_id
     LEFT JOIN users su ON su.user_id = l.substitute_instructor_id
     WHERE
       (c.user_id = ? AND c.is_active = 1 AND l.lesson_date BETWEEN ? AND ?)
       OR l.lesson_id IN (
         SELECT lesson_id FROM lesson_history WHERE constraints_id = ?
       )
     ORDER BY l.lesson_date, l.start_time`,
    [user_id, start_date, end_date, constraints_id],
    cb,
  );
}

// a function that gets a lesson_id, an optional constraints_id, a
// change_type ('rescheduled' | 'substitute_assigned' | 'substitute_cleared'),
// a human-readable details string and the admin who made the change
// it records that change in lesson_history
function addLessonHistory(entry, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO lesson_history
     (lesson_id, constraints_id, change_type, details, changed_by)
     VALUES (?, ?, ?, ?, ?)`,
    [
      entry.lesson_id,
      entry.constraints_id ?? null,
      entry.change_type,
      entry.details,
      entry.changed_by ?? null,
    ],
    cb,
  );
}

// a function that gets a constraints_id and returns every lesson_history row
// tagged with it, oldest first — used to show the admin what was actually
// done to resolve that constraint
function getLessonHistoryForConstraint(constraints_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT lesson_id, change_type, details, created_at
     FROM lesson_history
     WHERE constraints_id = ?
     ORDER BY created_at`,
    [constraints_id],
    cb,
  );
}

// a function that adds a video to the database (url, title, description)
function addVideo(url, title, description, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO content_videos
     (url, title, description, is_active)
     VALUES (?, ?, ?, 1)`,
    [url, title, description],
    cb,
  );
}

// a function that gets a courseId and an array of lessons then adds the lessons
// in db
function addLessonsToCourse(courseId, lessons, cb) {
  const conn = db.getConnection();

  const values = lessons.map((lesson) => [
    courseId,
    lesson.lesson_number,
    lesson.lesson_date,
    lesson.start_time,
    lesson.end_time,
  ]);

  conn.query(
    `INSERT INTO lessons
     (course_id, lesson_number, lesson_date, start_time, end_time)
     VALUES ?`,
    [values],
    cb,
  );
}

//a function that gets a courseId and returns the max lesson number in course
function getMaxLessonNumber(courseId, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT MAX(lesson_number) AS maxLesson
     FROM lessons
     WHERE course_id = ?`,
    [courseId],
    cb,
  );
}

// a function that gets the user_id of the instructor, start_date and end_date of the
// lesson. it returns all the lessons details of the instructor in the range of start time
// and end time
function getInstructorLessonsInRange(user_id, start_date, end_date, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT 
        c.course_id,
        l.lesson_id,
        l.lesson_number,
        l.lesson_date,
        l.start_time,
        l.end_time
     FROM courses c
     JOIN lessons l 
        ON c.course_id = l.course_id
     WHERE c.user_id = ?
     AND c.is_active = 1
     AND l.lesson_date BETWEEN ? AND ?
     ORDER BY l.lesson_date, l.start_time`,
    [user_id, start_date, end_date],
    cb,
  );
}

// a function that gets the user_id of an instructor, a date range and a course_id
// it returns the instructor lessons in that range that belong to any OTHER course.
// used when updating a course, so the course's own lessons are not reported as
// conflicting with themselves
function getInstructorLessonsInRangeExcludingCourse(
  user_id,
  start_date,
  end_date,
  course_id,
  cb,
) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        c.course_id,
        l.lesson_id,
        l.lesson_number,
        l.lesson_date,
        l.start_time,
        l.end_time
     FROM courses c
     JOIN lessons l
        ON c.course_id = l.course_id
     WHERE c.user_id = ?
     AND c.is_active = 1
     AND c.course_id != ?
     AND l.lesson_date BETWEEN ? AND ?
     ORDER BY l.lesson_date, l.start_time`,
    [user_id, course_id, start_date, end_date],
    cb,
  );
}

// a function that gets the course id and returns the lessons in that course
function getLessonsByCourseId(courseId, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
    FROM lessons
    WHERE course_id = ?`,
    [courseId],
    cb,
  );
}

// a function that gets a lesson_id and returns that lesson
function findLessonById(lesson_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM lessons
     WHERE lesson_id = ?`,
    [lesson_id],
    cb,
  );
}

// a function that gets a lesson_id and the fields to change
// it updates that lesson in DB
function updateLesson(lesson_id, fields, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE lessons SET ? WHERE lesson_id = ?`,
    [fields, lesson_id],
    cb,
  );
}

// a function that gets a lesson_id and returns the lesson together with the
// instructor that teaches it and the course date range
function findLessonWithCourse(lesson_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        l.*,
        c.user_id,
        c.start_date,
        c.end_date,
        c.total_lessons
     FROM lessons l
     JOIN courses c ON l.course_id = c.course_id
     WHERE l.lesson_id = ?`,
    [lesson_id],
    cb,
  );
}

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserBlockedStatus,
  getInstructors,
  getDashboardStats,
  getRecentCourses,
  getAllInstructorConstraints,
  findConstraintById,
  findApprovedConstraintOnDate,
  updateConstraintStatus,
  getAffectedLessonsForConstraint,
  addLessonHistory,
  getLessonHistoryForConstraint,
  addVideo,
  addLessonsToCourse,
  getMaxLessonNumber,
  getInstructorLessonsInRange,
  getInstructorLessonsInRangeExcludingCourse,
  getLessonsByCourseId,
  findLessonById,
  updateLesson,
  findLessonWithCourse,
};
