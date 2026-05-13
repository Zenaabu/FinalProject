const express = require("express");
const session = require("express-session");

const authRouter = require("./routes/auth");
//const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// static files (videos)
app.use("/uploads", express.static("server/uploads"));

// the session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

// all routes
app.use("/api/auth", authRouter); // auth routes
//app.use("/api/users", usersRouter); // user routes
app.use("/api/admin", adminRouter); // admin routes

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
