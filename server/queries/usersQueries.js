// import the database singleton to run queries
const db = require("../DB/dbSingleton");

// a login function that finds a user by id and password, used for authentication
function findUserByIdAndPassword(user_id, password, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM users
     WHERE user_id = ? AND password = ?`,
    [user_id, password],
    cb,
  );
}
