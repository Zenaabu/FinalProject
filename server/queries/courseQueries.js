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

// a function that get all courses of specific instructor
function getCoursesByInstructorId(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM courses
     WHERE user_id = ?
     ORDER BY start_date DESC`,
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
     GROUP BY c.course_id
     ORDER BY c.start_date DESC`,
    (err, courses) => {
      if (err) return cb(err);
      if (courses.length === 0) return cb(null, []);

      const courseIds = courses.map((c) => c.course_id);

      // ── Step 2: all lessons for those courses ──────────────────────────
      conn.query(
        `SELECT lesson_id, course_id, lesson_number,
                DATE_FORMAT(lesson_date, '%Y-%m-%d')  AS date,
                TIME_FORMAT(start_time,  '%H:%i')     AS start_time,
                TIME_FORMAT(end_time,    '%H:%i')     AS end_time
         FROM lessons
         WHERE course_id IN (?)
         ORDER BY course_id, lesson_number`,
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

          // ── Step 3: attendance for all those lessons ─────────────────
          conn.query(
            `SELECT a.lesson_id,
                    a.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) AS name,
                    u.email,
                    a.attended AS attendance_status
             FROM attend a
             JOIN users u ON a.user_id = u.user_id
             WHERE a.lesson_id IN (?)`,
            [lessonIds],
            (err3, attendance) => {
              if (err3) return cb(err3);

              // Group attendance rows by lesson_id
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
  deactivateExpiredCourses,
  expireOldReservations,
  updateCourse,
  getCoursesWithDetails,
};
