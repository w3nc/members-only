const passport = require("passport");
const { Strategy } = require("passport-local");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

passport.use(
  new Strategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
    try {
      const user = await db.findUserByEmail(email);
      if (!user) {
        return done(null, false, { message: "Wrong email or password." });
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return done(null, false, { message: "Wrong email or password." });
      }
      return done(null, { id: user.id });
    } catch (err) {
      return done(err);
    }
  })
);

// Only the user id is kept in the session cookie store
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.findUserById(id);
    done(null, user || null);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
