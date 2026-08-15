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
// page: active courses, distinct students who ever registered, instructor
// constraints still awaiting an approve/reject decision, courses starting
// within the next 7 days that are still under 50% enrolled (capacity minus
// registered + unexpired-pending, same "taken seats" formula used by
// getAvailableCourses' seats_left — the low-enrollment-before-start problem,
// surfaced instead of left for an admin to notice on their own), and new
// students in the last 7 days
function getDashboardStats(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        (SELECT COUNT(*) FROM courses WHERE is_active = 1) AS active_courses,
        (SELECT COUNT(DISTINCT user_id) FROM register) AS registered_students,
        (SELECT COUNT(*) FROM instructor_constraints
          WHERE status = 'pending') AS pending_constraints,
        (SELECT COUNT(*)
           FROM courses c
          WHERE c.is_active = 1
            AND c.start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            AND (
              (SELECT COUNT(*) FROM register r WHERE r.course_id = c.course_id)
              +
              (SELECT COUNT(*) FROM course_reservations cr
                WHERE cr.course_id = c.course_id
                  AND cr.status = 'pending'
                  AND cr.expires_at > NOW())
            ) < c.capacity * 0.5) AS at_risk_courses,
        (SELECT COUNT(DISTINCT user_id) FROM register
          WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS new_students_week`,
    cb,
  );
}

// a function that returns the active/upcoming courses (name, start/end date,
// capacity, and seats taken) for the admin dashboard's "Courses" table —
// inactive courses are excluded since they're not useful at-a-glance
// information; a list of courses stays roughly bounded in size, unlike
// registrations which grow with every enrollment, so this scales better as
// the student base grows. capacity/taken are included so the route can flag
// the same under-50%-capacity courses the "Courses Starting Soon" KPI
// counts, without the admin having to guess which ones they are.
function getRecentCourses(limit, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        c.course_id,
        c.description,
        DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(c.end_date, '%Y-%m-%d') AS end_date,
        c.capacity,
        (
          (SELECT COUNT(*) FROM register r WHERE r.course_id = c.course_id)
          +
          (SELECT COUNT(*) FROM course_reservations cr
            WHERE cr.course_id = c.course_id
              AND cr.status = 'pending'
              AND cr.expires_at > NOW())
        ) AS taken
     FROM courses c
     WHERE c.is_active = 1
     ORDER BY c.start_date DESC
     LIMIT ?`,
    [limit],
    cb,
  );
}

// a function that gets all the instructor constraints with the instructor
// full name, newest submitted first (constraints_id is an auto-increment PK
// with no rows ever renumbered, so it doubles as a creation-order column —
// there's no created_at on this table).
// unresolved_lesson_count mirrors getAffectedLessonsForConstraint's own
// "which lessons does this constraint touch" logic (course taught by this
// instructor with a lesson_date inside the constraint's range, OR any lesson
// already tagged to this constraint via lesson_history) minus whichever of
// those already have a lesson_history row for this constraint — i.e. lessons
// still needing a substitute assigned or a reschedule. Lets the Staff page
// show "still needs attention" on an approved constraint's row without the
// admin having to expand it to find out.
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
        ic.status,
        (
          SELECT COUNT(*)
          FROM lessons l
          JOIN courses c ON c.course_id = l.course_id
          WHERE (
              (c.user_id = ic.user_id AND c.is_active = 1
               AND l.lesson_date BETWEEN DATE(ic.start_time) AND DATE(ic.end_time))
              OR l.lesson_id IN (
                SELECT lesson_id FROM lesson_history
                 WHERE constraints_id = ic.constraints_id
              )
            )
            AND l.lesson_id NOT IN (
              SELECT lesson_id FROM lesson_history
               WHERE constraints_id = ic.constraints_id
            )
        ) AS unresolved_lesson_count
     FROM instructor_constraints ic
     JOIN users u ON ic.user_id = u.user_id
     ORDER BY ic.constraints_id DESC`,
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
// lesson. it returns every lesson that instructor is on the hook to teach in that
// range — either because they own the course, or because they were assigned as the
// substitute covering someone else's lesson. Both count as "busy" for conflict checks
// (e.g. before assigning them as a substitute somewhere else, or giving them a new
// lesson of their own).
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
     WHERE c.is_active = 1
     AND l.lesson_date BETWEEN ? AND ?
     AND (c.user_id = ? OR l.substitute_instructor_id = ?)
     ORDER BY l.lesson_date, l.start_time`,
    [start_date, end_date, user_id, user_id],
    cb,
  );
}

// a function that gets the user_id of an instructor, a date range and a course_id
// it returns the lessons in that range, belonging to any OTHER course, that this
// instructor is on the hook to teach — either as the owner or as the substitute
// covering someone else's lesson. used when updating a course, so the course's own
// lessons are not reported as conflicting with themselves
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
     WHERE c.is_active = 1
     AND c.course_id != ?
     AND l.lesson_date BETWEEN ? AND ?
     AND (c.user_id = ? OR l.substitute_instructor_id = ?)
     ORDER BY l.lesson_date, l.start_time`,
    [course_id, start_date, end_date, user_id, user_id],
    cb,
  );
}

// a function that gets a lesson's date/time window and the instructor to
// exclude (the course's own instructor, who can't substitute for themself)
// it returns every non-blocked instructor who does NOT already teach or
// substitute-teach a lesson (in an active course) overlapping that exact
// date/time — same overlap rule as validateSubstituteInstructor's own
// hasLessonConflict check, done in SQL so the admin only ever sees
// instructors who can actually take the lesson instead of picking one and
// then hitting the "already teaches another lesson" conflict error
function getAvailableInstructorsForSlot(
  excludeUserId,
  lessonDate,
  startTime,
  endTime,
  cb,
) {
  const conn = db.getConnection();

  conn.query(
    `SELECT u.user_id, u.first_name, u.last_name
     FROM users u
     WHERE u.role = 'instructor'
       AND u.is_blocked = 0
       AND u.user_id != ?
       AND NOT EXISTS (
         SELECT 1
         FROM lessons l
         JOIN courses c ON c.course_id = l.course_id
         WHERE c.is_active = 1
           AND (c.user_id = u.user_id OR l.substitute_instructor_id = u.user_id)
           AND l.lesson_date = ?
           AND l.start_time < ?
           AND l.end_time > ?
       )
     ORDER BY u.first_name, u.last_name`,
    [excludeUserId, lessonDate, endTime, startTime],
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

// a function that gets a user_id and returns the courses that user is
// currently registered to and that haven't finished yet (end_date today or
// later) — a course drops out of this list on its own once it ends, without
// needing any extra cleanup
function getActiveCoursesForUser(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        c.course_id,
        c.description,
        c.level,
        DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(c.end_date,   '%Y-%m-%d') AS end_date,
        CONCAT(u.first_name, ' ', u.last_name) AS instructor
     FROM register r
     JOIN courses c ON r.course_id = c.course_id
     LEFT JOIN users u ON c.user_id = u.user_id
     WHERE r.user_id = ?
       AND c.end_date >= CURDATE()
     ORDER BY c.start_date`,
    [user_id],
    cb,
  );
}

module.exports = {
  getAllUsers,
  getActiveCoursesForUser,
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
  getAvailableInstructorsForSlot,
  getLessonsByCourseId,
  findLessonById,
  updateLesson,
  findLessonWithCourse,
};
