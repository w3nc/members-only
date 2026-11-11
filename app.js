require("dotenv").config();
const crypto = require("node:crypto");
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const connectPgSimple = require("connect-pg-simple");
const passport = require("passport");
const pool = require("./db/pool");
require("./config/passport");

const indexRouter = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Sessions are stored in PostgreSQL, so a log-in survives a server restart
const PgStore = connectPgSimple(session);
app.use(
  session({
    store: new PgStore({ pool, tableName: "session" }),
    secret: process.env.SESSION_SECRET || "dev-only-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Makes the logged-in user available to every view as currentUser
// and gives each session a secret token that the delete forms must send back
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

app.use("/", indexRouter);
app.use("/", authRouter);

app.use((req, res) => {
  res.status(404).render("error", { title: "Not found", message: "Page not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { title: "Error", message: "Something went wrong. Please try again." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Members Only is running on http://localhost:${PORT}`);
});
