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

module.exports = {
  getCourseRegistrationsForInstructor,
  findInstructorCourse,
};
