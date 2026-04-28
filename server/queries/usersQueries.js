// import the database singleton to run queries
const db = require("../DB/dbSingleton");

// a login function that finds a user by id, used for authentication
function findUserById(user_id, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT *
     FROM users
     WHERE user_id = ?`,
    [user_id],
    cb,
  );
}

module.exports = {
  findUserById,
};
