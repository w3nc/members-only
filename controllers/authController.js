const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../db/queries");

const nameRule = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`Please tell us your ${label.toLowerCase()}.`)
    .bail()
    .isLength({ max: 50 })
    .withMessage(`${label} is a bit long. Keep it under 50 characters.`)
    .matches(/^\p{L}[\p{L} .'-]*$/u)
    .withMessage(`${label} can only have letters, spaces, dots, hyphens and apostrophes.`);

const validateSignUp = [
  nameRule("firstName", "First name"),
  nameRule("lastName", "Last name"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Please enter your email so we can reach you.")
    .bail()
    .isLength({ max: 254 })
    .withMessage("That email is too long. Please check it.")
    .bail()
    .isEmail()
    .withMessage("That email does not look right. Check for a typo, like name@example.com.")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Please choose a password.")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Make your password at least 8 characters long.")
    .bail()
    .isLength({ max: 72 })
    .withMessage("Keep your password under 72 characters.")
    .matches(/[A-Za-z]/)
    .withMessage("Add at least one letter to your password.")
    .matches(/[0-9]/)
    .withMessage("Add at least one number to your password."),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please type your password again.")
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match. Type the same password in both boxes."),
];

// Keep only the text the form can show again (never the passwords)
const keepOld = (body = {}) => ({
  firstName: body.firstName,
  lastName: body.lastName,
  email: body.email,
});

const signUpGet = (req, res) => {
  res.render("sign-up", { title: "Sign up", fieldErrors: {}, formError: null, old: {} });
};

const signUpPost = [
  validateSignUp,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("sign-up", {
          title: "Sign up",
          fieldErrors: errors.mapped(),
          formError: "Almost there! Please fix the boxes marked in pink.",
          old: keepOld(req.body),
        });
      }
      const { firstName, lastName, email, password } = matchedData(req);
      const existing = await db.findUserByEmail(email);
      if (existing) {
        return res.status(400).render("sign-up", {
          title: "Sign up",
          fieldErrors: { email: { msg: "That email is already on the list. Try logging in instead." } },
          formError: null,
          old: keepOld(req.body),
        });
      }
      // Scramble the password before it is saved - the real password is never stored
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await db.createUser({ firstName, lastName, email, passwordHash });
      req.login({ id: user.id }, (err) => {
        if (err) return next(err);
        res.redirect("/");
      });
    } catch (err) {
      next(err);
    }
  },
];

const logInGet = (req, res) => {
  res.render("log-in", { title: "Log in", error: null });
};

const logInPost = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).render("log-in", {
        title: "Log in",
        error: info ? info.message : "Log in failed.",
      });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.redirect("/");
    });
  })(req, res, next);
};

const logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

module.exports = { signUpGet, signUpPost, logInGet, logInPost, logOut };
