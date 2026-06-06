//dbSingleton.js
const mysql = require("mysql2");

let pool; // Connection pool (created once)

const dbSingleton = {
  getConnection: () => {
    if (!pool) {
      pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "bluemars",
        dateStrings: true, // return DATE/DATETIME columns as plain strings (avoids timezone shift)
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("MySQL connection pool created.");
    }

    return pool; // Return the shared pool
  },
};

module.exports = dbSingleton;
