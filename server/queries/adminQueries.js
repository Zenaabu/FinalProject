// queries/adminQueries.js
const db = require("../db/dbSingleton");

// a function that returns all the users from database
function getAllUsers(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT user_id, first_name, last_name, email, phone, gender,  DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, role, is_blocked
     FROM users
    ORDER BY first_name, last_name`,
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
        ic.notes
     FROM instructor_constraints ic
     JOIN users u ON ic.user_id = u.user_id
     ORDER BY ic.start_time`,
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

//a function that gets a courseId and returns the course details from db
function getCourseById(courseId, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT * 
     FROM courses
     WHERE course_id = ?`,
    [courseId],
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

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserBlockedStatus,
  getAllInstructorConstraints,
  addVideo,
  getAllCourses,
  addCourse,
  addLessonsToCourse,
  getMaxLessonNumber,
  getCourseById,
  checkDuplicateCourse,
  getInstructorLessonsInRange,
};
