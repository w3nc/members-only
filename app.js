require("dotenv").config();
const crypto = require("node:crypto");
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const connectPgSimple = require("connect-pg-simple");
const passport = require("passport");
const pool = require("./db/pool");
const ensureSchema = require("./db/ensureSchema");
require("./config/passport");

const indexRouter = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");

const app = express();

// Render puts the app behind its own proxy, so trust it for secure cookies
app.set("trust proxy", 1);

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
      // A live site uses https, so only then require a secure cookie
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // one week
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
  res.status(404).render("error", { title: "Not found", message: "Page not found.", currentUser: req.user });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { title: "Error", message: "Something went wrong. Please try again.", currentUser: req.user });
});

const PORT = process.env.PORT || 3000;

// Make sure the tables exist before taking any request.
// This is what lets the app work on a fresh hosted database.
ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Members Only is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Could not prepare the database:", err.message);
    if (err.code === "ECONNREFUSED") {
      console.error("The database address was refused. Check DATABASE_URL points at your Render Postgres.");
    }
    process.exit(1);
  });
