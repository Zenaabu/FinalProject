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

// ─── Full course tree: courses → lessons → attendance ──────────────────────
// Returns an array of course objects, each containing a `lessons` array,
// each lesson containing a `students` array with attendance status.

function buildCoursesTree(rows) {
  const courseMap = new Map();

  for (const row of rows) {
    if (!courseMap.has(row.course_id)) {
      courseMap.set(row.course_id, {
        course_id: row.course_id,
        title: row.description,
        level: row.level,
        status: row.is_active ? "Active" : "Inactive",
        user_id: row.user_id, // instructor FK (needed by CourseEditDrawer)
        instructor: row.instructor,
        price: row.price,
        vat_percent: row.vat_percent,
        start_date: row.start_date,
        end_date: row.end_date,
        capacity: row.capacity,
        total_lessons: row.total_lessons,
        schedule: "", // filled from the first lesson below
        lessons: new Map(),
        _studentSet: new Set(),
      });
    }

    const course = courseMap.get(row.course_id);

    if (row.lesson_id != null && !course.lessons.has(row.lesson_id)) {
      course.lessons.set(row.lesson_id, {
        lesson_id: row.lesson_id,
        lesson_number: row.lesson_number,
        date: row.lesson_date,
        start_time: row.start_time,
        end_time: row.end_time,
        time:
          row.start_time && row.end_time
            ? `${row.start_time} – ${row.end_time}`
            : "",
        students: [],
      });
      // Use the first lesson's times as the course-level schedule summary
      if (!course.schedule && row.start_time) {
        course.schedule = `${row.start_time} – ${row.end_time}`;
      }
    }

    if (row.lesson_id != null && row.student_id != null) {
      course.lessons.get(row.lesson_id).students.push({
        user_id: row.student_id,
        name: row.student_name,
        email: row.student_email,
        attendance_status: row.attended === 1 ? "present" : "absent",
      });
      course._studentSet.add(row.student_id);
    }
  }

  return Array.from(courseMap.values()).map(
    ({ _studentSet, lessons, ...rest }) => ({
      ...rest,
      enrolled: _studentSet.size,
      lessons: Array.from(lessons.values()),
    }),
  );
}

function getCoursesWithDetails(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
       c.course_id,
       c.user_id,
       c.description,
       c.level,
       c.is_active,
       c.price,
       c.vat_percent,
       DATE_FORMAT(c.start_date, '%Y-%m-%d') AS start_date,
       DATE_FORMAT(c.end_date,   '%Y-%m-%d') AS end_date,
       c.capacity,
       c.total_lessons,
       CONCAT(u.first_name, ' ', u.last_name) AS instructor,
       l.lesson_id,
       l.lesson_number,
       DATE_FORMAT(l.lesson_date, '%Y-%m-%d')  AS lesson_date,
       TIME_FORMAT(l.start_time,  '%H:%i')     AS start_time,
       TIME_FORMAT(l.end_time,    '%H:%i')     AS end_time,
       a.user_id                               AS student_id,
       CONCAT(su.first_name, ' ', su.last_name) AS student_name,
       su.email                                AS student_email,
       a.attended
     FROM   courses c
     JOIN   users   u  ON c.user_id   = u.user_id
     LEFT JOIN lessons l  ON l.course_id = c.course_id
     LEFT JOIN attend  a  ON a.lesson_id = l.lesson_id
     LEFT JOIN users   su ON su.user_id  = a.user_id
     WHERE  c.is_active IN (0, 1)
     ORDER BY c.course_id, l.lesson_number, su.last_name, su.first_name`,
    (err, rows) => {
      if (err) return cb(err);
      cb(null, buildCoursesTree(rows));
    },
  );
}

// a function that checks if the given instructor already has another active course
// whose date range overlaps with [new_start_date, new_end_date],
// excluding the course currently being edited (course_id_to_exclude).
//
// Overlap condition: existing_start <= new_end  AND  existing_end >= new_start
function checkDateConflictExcludingCourse(
  user_id,
  new_start_date,
  new_end_date,
  course_id_to_exclude,
  cb,
) {
  const conn = db.getConnection();

  conn.query(
    `SELECT course_id
     FROM courses
     WHERE user_id  = ?
       AND course_id != ?
       AND is_active = 1
       AND start_date <= ?
       AND end_date   >= ?`,
    [user_id, course_id_to_exclude, new_end_date, new_start_date],
    cb,
  );
}

// a function that updates an existing course row in the courses table
function updateCourse(course_id, fields, cb) {
  const conn = db.getConnection();

  conn.query(
    `UPDATE courses
     SET
       description = ?,
       level       = ?,
       capacity    = ?,
       price       = ?,
       vat_percent = ?,
       start_date  = ?,
       end_date    = ?,
       user_id     = ?,
       is_active   = ?
     WHERE course_id = ?`,
    [
      fields.description,
      fields.level,
      fields.capacity,
      fields.price,
      fields.vat_percent,
      fields.start_date,
      fields.end_date,
      fields.user_id,
      fields.is_active,
      course_id,
    ],
    cb,
  );
}

module.exports = {
  findCourseById,
  checkDuplicateCourse,
  addCourse,
  getAllCourses,
  getCoursesWithDetails,
  checkDateConflictExcludingCourse,
  updateCourse,
};
