// import the database singleton to run queries
const db = require("../DB/dbSingleton");

// a function that gets course_id and returns all the details about
// the course with the same id (finds the course by the id)
function findCourseById(course_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT * FROM courses
     WHERE course_id =?`,
    [course_id],
    cb,
  );
}

// a function that check if instructor already has course in same period
function checkDuplicateCourse(course, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT c.course_id
     FROM courses c
     JOIN lessons l ON c.course_id = l.course_id
     WHERE c.user_id = ?
       AND c.start_date = ?
       AND c.end_date = ?
       AND l.start_time IN (?)
       AND l.end_time IN (?)
       AND c.is_active = 1`,
    [
      course.user_id,
      course.start_date,
      course.end_date,
      course.lessons.map((lesson) => lesson.start_time),
      course.lessons.map((lesson) => lesson.end_time),
    ],
    cb,
  );
}

// a function that adds a new course
function addCourse(course, cb) {
  const conn = db.getConnection();

  conn.query(
    `INSERT INTO courses
     (
      description,
      total_lessons,
      start_date,
      end_date,
      level,
      capacity,
      price,
      vat_percent,
      is_active,
      user_id
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      course.description,
      course.total_lessons,
      course.start_date,
      course.end_date,
      course.level,
      course.capacity,
      course.price,
      course.vat_percent,
      course.user_id,
    ],
    cb,
  );
}

// a function that gets all courses
function getAllCourses(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM courses
     ORDER BY start_date DESC`,
    cb,
  );
}

// a function that get all courses of specific instructor, with the number of
// lessons in each course and how many users are registered to it
function getCoursesByInstructorId(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
       c.course_id,
       c.description,
       c.level,
       DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
       DATE_FORMAT(c.end_date,   '%Y-%m-%d') AS end_date,
       c.capacity,
       c.total_lessons,
       c.is_active,
       (SELECT COUNT(*) FROM lessons l
         WHERE l.course_id = c.course_id)   AS lessons_count,
       (SELECT COUNT(*) FROM register r
         WHERE r.course_id = c.course_id)   AS enrolled
     FROM courses c
     WHERE c.user_id = ?
     ORDER BY c.start_date DESC`,
    [user_id],
    cb,
  );
}

// a function that gets an instructor's user_id and returns only the courses
// they are CURRENTLY teaching — running or upcoming, i.e. not finished yet.
// Used by the admin's Staff Scheduling "View Courses" action, so a course
// drops off the list on its own once it ends, same as getActiveCoursesForUser
// does for a student's enrollments.
function getActiveCoursesByInstructorId(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
       c.course_id,
       c.description,
       c.level,
       DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
       DATE_FORMAT(c.end_date,   '%Y-%m-%d') AS end_date,
       c.capacity,
       c.total_lessons,
       c.is_active,
       (SELECT COUNT(*) FROM lessons l
         WHERE l.course_id = c.course_id)   AS lessons_count,
       (SELECT COUNT(*) FROM register r
         WHERE r.course_id = c.course_id)   AS enrolled
     FROM courses c
     WHERE c.user_id = ?
       AND c.end_date >= CURDATE()
     ORDER BY c.start_date`,
    [user_id],
    cb,
  );
}

// a function that deactivate courses that already ended
function deactivateExpiredCourses(cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE courses
     SET is_active = 0
     WHERE end_date < CURDATE()
       AND is_active = 1`,
    cb,
  );
}

// a function that change the status of old reservations to expired
function expireOldReservations(cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE course_reservations
     SET status = 'expired'
     WHERE status = 'pending'
       AND expires_at <= NOW()`,
    cb,
  );
}

// a function that gets a user_id and returns every course that is open for
// registration, with how many seats are left and whether this user is already
// registered to it. pending reservations that have not expired still hold a
// seat, so they count towards taken_places
function getAvailableCourses(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
       c.course_id,
       c.description,
       c.level,
       DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
       DATE_FORMAT(c.end_date,   '%Y-%m-%d') AS end_date,
       c.capacity,
       c.price,
       c.vat_percent,
       c.total_lessons,
       CONCAT(u.first_name, ' ', u.last_name) AS instructor,
       (SELECT COUNT(*) FROM register r
         WHERE r.course_id = c.course_id)              AS registered_count,
       (SELECT COUNT(*) FROM course_reservations cr
         WHERE cr.course_id = c.course_id
           AND cr.status    = 'pending'
           AND cr.expires_at > NOW())                  AS pending_count,
       (SELECT COUNT(*) FROM register r2
         WHERE r2.course_id = c.course_id
           AND r2.user_id   = ?)                       AS is_registered
     FROM courses c
     LEFT JOIN users u ON c.user_id = u.user_id
     WHERE c.is_active = 1
       AND c.start_date > CURDATE()
     ORDER BY c.start_date`,
    [user_id],
    cb,
  );
}

// a function that gets a user_id and returns every course that user is
// registered to (past, running, or upcoming)
function getMyCourses(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
       c.course_id,
       c.description,
       c.level,
       DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
       DATE_FORMAT(c.end_date,   '%Y-%m-%d') AS end_date,
       c.total_lessons,
       c.is_active,
       CONCAT(u.first_name, ' ', u.last_name) AS instructor
     FROM register r
     JOIN courses c ON r.course_id = c.course_id
     LEFT JOIN users u ON c.user_id = u.user_id
     WHERE r.user_id = ?
     ORDER BY c.start_date DESC`,
    [user_id],
    cb,
  );
}

// a function that gets an array of course ids and returns every lesson that
// belongs to them, ordered so the earliest lesson of each course comes first
function getLessonsForCourses(courseIds, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT lesson_id, course_id, lesson_number,
            DATE_FORMAT(lesson_date, '%Y-%m-%d') AS date,
            TIME_FORMAT(start_time,  '%H:%i')    AS start_time,
            TIME_FORMAT(end_time,    '%H:%i')    AS end_time
     FROM lessons
     WHERE course_id IN (?)
     ORDER BY lesson_date, start_time`,
    [courseIds],
    cb,
  );
}

// a function that gets a course_id and returns every user registered to it
// (any admin can see any course's roster — instructorQueries has the
// instructor-scoped equivalent that also checks course ownership)
function getCourseRegistrations(course_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        DATE_FORMAT(r.payment_date, '%Y-%m-%d') AS payment_date,
        r.receipt_number
     FROM register r
     JOIN users u ON r.user_id = u.user_id
     WHERE r.course_id = ?
     ORDER BY r.payment_date DESC`,
    [course_id],
    cb,
  );
}

// a function that gets a course_id and returns how many users are registered
// to that course
function countCourseRegistrations(course_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT COUNT(*) AS enrolled
     FROM register
     WHERE course_id = ?`,
    [course_id],
    cb,
  );
}

// a function that updates the editable fields of a course by course_id
function updateCourse(course_id, fields, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE courses SET ? WHERE course_id = ?`,
    [fields, course_id],
    cb,
  );
}

// a function that returns all courses with nested lessons and attendance
// used by the admin Courses & Lessons dashboard
function getCoursesWithDetails(cb) {
  fetchCoursesWithDetails(null, cb);
}

// a function that returns a single course with its nested lessons and attendance
// (the same shape as one entry of getCoursesWithDetails)
function getCourseWithDetails(course_id, cb) {
  fetchCoursesWithDetails(course_id, (err, courses) => {
    if (err) return cb(err);

    cb(null, courses[0] ?? null);
  });
}

// not for export
// a function that builds the nested course -> lessons -> students tree.
// when course_id is null it builds it for every course, otherwise only for
// the course with that id
function fetchCoursesWithDetails(course_id, cb) {
  const conn = db.getConnection();

  // ── Step 1: courses + instructor name + enrolled count ──────────────────
  conn.query(
    `SELECT
       c.course_id,
       c.description          AS title,
       c.level,
       DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
       DATE_FORMAT(c.end_date,   '%Y-%m-%d') AS end_date,
       c.capacity,
       c.price,
       c.vat_percent,
       c.total_lessons,
       c.is_active,
       c.user_id,
       CONCAT(u.first_name, ' ', u.last_name) AS instructor,
       COUNT(DISTINCT r.user_id)              AS enrolled
     FROM courses c
     LEFT JOIN users    u ON c.user_id    = u.user_id
     LEFT JOIN register r ON c.course_id  = r.course_id
     WHERE (? IS NULL OR c.course_id = ?)
     GROUP BY c.course_id
     ORDER BY c.start_date DESC`,
    [course_id, course_id],
    (err, courses) => {
      if (err) return cb(err);
      if (courses.length === 0) return cb(null, []);

      const courseIds = courses.map((c) => c.course_id);

      // ── Step 2: all lessons for those courses ──────────────────────────
      conn.query(
        `SELECT l.lesson_id, l.course_id, l.lesson_number,
                DATE_FORMAT(l.lesson_date, '%Y-%m-%d')  AS date,
                TIME_FORMAT(l.start_time,  '%H:%i')     AS start_time,
                TIME_FORMAT(l.end_time,    '%H:%i')     AS end_time,
                l.substitute_instructor_id,
                su.first_name AS substitute_first_name,
                su.last_name  AS substitute_last_name
         FROM lessons l
         LEFT JOIN users su ON su.user_id = l.substitute_instructor_id
         WHERE l.course_id IN (?)
         ORDER BY l.course_id, l.lesson_number`,
        [courseIds],
        (err2, lessons) => {
          if (err2) return cb(err2);

          // No lessons yet — return courses with empty lesson arrays
          if (lessons.length === 0) {
            return cb(
              null,
              courses.map((c) => buildCourse(c, [])),
            );
          }

          const lessonIds = lessons.map((l) => l.lesson_id);

          // ── Step 3: the roster of every lesson ───────────────────────
          // The first half is the roster the instructor marks attendance on:
          // everyone registered to the lesson's course, with their attend row
          // if it exists and NULL when they have not been marked yet.
          // The second half keeps attendance rows whose user is no longer
          // registered to the course, so no marked attendance is ever hidden.
          // UNION removes the rows the two halves have in common.
          conn.query(
            `SELECT l.lesson_id,
                    u.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) AS name,
                    u.email,
                    a.attended AS attendance_status
             FROM lessons l
             JOIN register r ON r.course_id = l.course_id
             JOIN users    u ON u.user_id   = r.user_id
             LEFT JOIN attend a
                    ON a.lesson_id = l.lesson_id
                   AND a.user_id   = u.user_id
             WHERE l.lesson_id IN (?)

             UNION

             SELECT a.lesson_id,
                    u.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) AS name,
                    u.email,
                    a.attended
             FROM attend a
             JOIN users u ON u.user_id = a.user_id
             WHERE a.lesson_id IN (?)

             ORDER BY name`,
            [lessonIds, lessonIds],
            (err3, attendance) => {
              if (err3) return cb(err3);

              // Group roster rows by lesson_id
              const attendByLesson = {};
              for (const row of attendance) {
                if (!attendByLesson[row.lesson_id])
                  attendByLesson[row.lesson_id] = [];
                attendByLesson[row.lesson_id].push({
                  user_id: row.user_id,
                  name: row.name,
                  email: row.email,
                  attendance_status: row.attendance_status,
                });
              }

              // ── Step 4: the most recent change made to each lesson ─────
              // (reschedule / substitute assign-or-clear), so the instructor
              // can see that a lesson they teach was changed
              conn.query(
                `SELECT lesson_id, change_type, details
                 FROM lesson_history
                 WHERE lesson_id IN (?)
                 ORDER BY created_at`,
                [lessonIds],
                (err4, historyRows) => {
                  if (err4) return cb(err4);

                  // rows come oldest-first, so the last write per lesson_id
                  // wins — that is the most recent change
                  const lastChangeByLesson = {};
                  for (const row of historyRows) {
                    lastChangeByLesson[row.lesson_id] = {
                      change_type: row.change_type,
                      details: row.details,
                    };
                  }

                  // Group lessons by course_id
                  const lessonsByCourse = {};
                  for (const lesson of lessons) {
                    if (!lessonsByCourse[lesson.course_id])
                      lessonsByCourse[lesson.course_id] = [];
                    lessonsByCourse[lesson.course_id].push({
                      lesson_id: lesson.lesson_id,
                      lesson_number: lesson.lesson_number,
                      date: lesson.date,
                      start_time: lesson.start_time,
                      end_time: lesson.end_time,
                      substitute_instructor_id: lesson.substitute_instructor_id,
                      substitute_name: lesson.substitute_instructor_id
                        ? `${lesson.substitute_first_name} ${lesson.substitute_last_name}`
                        : null,
                      last_change: lastChangeByLesson[lesson.lesson_id] || null,
                      students: attendByLesson[lesson.lesson_id] || [],
                    });
                  }

                  cb(
                    null,
                    courses.map((c) =>
                      buildCourse(c, lessonsByCourse[c.course_id] || []),
                    ),
                  );
                },
              );
            },
          );
        },
      );
    },
  );
}

function buildCourse(c, lessons) {
  const today = new Date().toISOString().slice(0, 10);
  let status;
  if (c.is_active) {
    status = c.start_date > today ? "Upcoming" : "Active";
  } else {
    status = "Inactive";
  }

  const first = lessons[0];
  const schedule = first ? `${first.start_time}–${first.end_time}` : "—";

  return {
    course_id: c.course_id,
    title: c.title,
    level: c.level,
    status,
    start_date: c.start_date,
    end_date: c.end_date,
    schedule,
    instructor: c.instructor ?? "—",
    enrolled: Number(c.enrolled),
    capacity: c.capacity,
    user_id: c.user_id,
    price: c.price,
    vat_percent: c.vat_percent,
    total_lessons: c.total_lessons,
    lessons,
  };
}

module.exports = {
  findCourseById,
  checkDuplicateCourse,
  addCourse,
  getAllCourses,
  getCoursesByInstructorId,
  getActiveCoursesByInstructorId,
  deactivateExpiredCourses,
  expireOldReservations,
  getCourseRegistrations,
  countCourseRegistrations,
  getAvailableCourses,
  getMyCourses,
  getLessonsForCourses,
  updateCourse,
  getCoursesWithDetails,
  getCourseWithDetails,
};
