require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const db = require("./DB/dbSingleton");
const authRouter = require("./routes/auth");
//const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const instructorRouter = require("./routes/instructor");
const userRouter = require("./routes/users");
const weatherRouter = require("./routes/weather");
const coursesRouter = require("./routes/courses");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// static files (videos)
app.use("/uploads", express.static("server/uploads"));

// sessions are persisted to MySQL (in a `sessions` table it creates itself)
// instead of the default in-memory store, so nodemon restarting the server
// on every file save during development doesn't log everyone out
const sessionStore = new MySQLStore({}, db.getConnection());

// the session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

// all routes
app.use("/api/auth", authRouter); // auth routes
app.use("/api/users", userRouter); // user routes
app.use("/api/admin", adminRouter); // admin routes
app.use("/api/instructor", instructorRouter); // instructor routes
app.use("/api/weather", weatherRouter); // weather routes
app.use("/api/courses", coursesRouter); // courses routes

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
