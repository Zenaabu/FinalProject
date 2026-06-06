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

// get all courses of specific instructor
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

// get all courses with nested lessons and per-lesson attendance roster
function getCoursesWithDetails(cb) {
  const conn = db.getConnection();

  // Step 1: all active courses with instructor name + enrollment count
  conn.query(
    `SELECT
       c.course_id,
       c.description                          AS title,
       c.level,
       c.capacity,
       c.total_lessons,
       c.price,
       c.vat_percent,
       c.is_active,
       DATE_FORMAT(c.start_date, '%Y-%m-%d')  AS start_date,
       DATE_FORMAT(c.end_date,   '%Y-%m-%d')  AS end_date,
       CONCAT(u.first_name, ' ', u.last_name) AS instructor,
       COUNT(r.user_id)                       AS enrolled
     FROM courses c
     JOIN  users    u ON c.user_id    = u.user_id
     LEFT JOIN register r ON c.course_id = r.course_id
     WHERE c.is_active = 1
     GROUP BY c.course_id
     ORDER BY c.start_date DESC`,
    (err, courses) => {
      if (err) return cb(err);
      if (courses.length === 0) return cb(null, []);

      const courseIds = courses.map((c) => c.course_id);

      // Step 2: lessons + student attendance for all those courses
      conn.query(
        `SELECT
           l.lesson_id,
           l.course_id,
           l.lesson_number,
           DATE_FORMAT(l.lesson_date, '%Y-%m-%d') AS date,
           l.start_time,
           l.end_time,
           u.user_id,
           CONCAT(u.first_name, ' ', u.last_name) AS name,
           u.email,
           CASE WHEN a.attended = 1 THEN 'present' ELSE 'absent' END AS attendance_status
         FROM lessons l
         LEFT JOIN register reg ON l.course_id  = reg.course_id
         LEFT JOIN users    u   ON reg.user_id   = u.user_id
         LEFT JOIN attend   a   ON a.lesson_id   = l.lesson_id
                                AND a.user_id    = u.user_id
         WHERE l.course_id IN (?)
         ORDER BY l.course_id, l.lesson_number`,
        [courseIds],
        (err2, rows) => {
          if (err2) return cb(err2);

          // Build nested structure: course_id → lesson_id → lesson+students
          const lessonMap = {};
          for (const row of rows) {
            if (!lessonMap[row.course_id]) lessonMap[row.course_id] = {};

            if (!lessonMap[row.course_id][row.lesson_id]) {
              lessonMap[row.course_id][row.lesson_id] = {
                lesson_id: row.lesson_id,
                lesson_number: row.lesson_number,
                date: row.date,
                start_time: row.start_time,
                end_time: row.end_time,
                time: `${row.start_time}–${row.end_time}`,
                students: [],
              };
            }

            // only push if the student row is real (LEFT JOIN can produce nulls)
            if (row.user_id) {
              lessonMap[row.course_id][row.lesson_id].students.push({
                user_id: row.user_id,
                name: row.name,
                email: row.email,
                attendance_status: row.attendance_status,
              });
            }
          }

          const today = new Date().toISOString().split("T")[0];

          const result = courses.map((course) => {
            const lessons = Object.values(
              lessonMap[course.course_id] || {},
            ).sort((a, b) => a.lesson_number - b.lesson_number);

            const schedule =
              lessons.length > 0
                ? `${lessons[0].start_time}–${lessons[0].end_time}`
                : "—";

            const status = !course.is_active
              ? "inactive"
              : course.start_date > today
                ? "upcoming"
                : "active";

            return { ...course, status, schedule, lessons };
          });

          cb(null, result);
        },
      );
    },
  );
}

module.exports = {
  findCourseById,
  checkDuplicateCourse,
  addCourse,
  getAllCourses,
  getCoursesByInstructorId,
  getCoursesWithDetails,
};
