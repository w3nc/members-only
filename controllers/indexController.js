const { body, validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");

// Home page: everyone sees the messages, but only members see who wrote them
const homeGet = async (req, res, next) => {
  try {
    const messages = await db.getMessages();
    const isMember = Boolean(req.user && req.user.is_member);
    const visible = messages.map((m) => ({
      id: m.id,
      title: m.title,
      text: m.text,
      created_at: m.created_at,
      author: isMember ? `${m.first_name} ${m.last_name}` : null,
    }));
    res.render("index", { title: "Members Only", messages: visible });
  } catch (err) {
    next(err);
  }
};

const joinGet = (req, res) => {
  res.render("join", { title: "Join the club", error: null });
};

// Checks the secret passcode from .env and upgrades the user to member (or admin)
const MAX_PASSCODE_TRIES = 5;
const passcodeTries = new Map(); // userId -> wrong tries in the last 15 minutes

const joinPost = async (req, res, next) => {
  try {
    if (!req.user) return res.redirect("/log-in");
    const now = Date.now();
    const tries = passcodeTries.get(req.user.id) || { count: 0, since: now };
    if (now - tries.since > 15 * 60 * 1000) {
      tries.count = 0;
      tries.since = now;
    }
    if (tries.count >= MAX_PASSCODE_TRIES) {
      return res.status(429).render("join", { title: "Join the club", error: "Too many wrong tries. Please wait 15 minutes and try again." });
    }
    const code = (req.body.passcode || "").trim();
    const isAdminCode = code && code === process.env.ADMIN_PASSCODE;
    const isMemberCode = code && code === process.env.MEMBER_PASSCODE;
    if (!isAdminCode && !isMemberCode) {
      tries.count += 1;
      passcodeTries.set(req.user.id, tries);
      return res.status(400).render("join", { title: "Join the club", error: "Wrong passcode." });
    }
    passcodeTries.delete(req.user.id);
    await db.makeMember(req.user.id, Boolean(isAdminCode));
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

const messageGet = (req, res) => {
  res.render("new-message", { title: "New message", errors: [], old: {} });
};

const validateMessage = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 200 }).withMessage("Title is too long.").escape(),
  body("text").trim().notEmpty().withMessage("Message is required.").isLength({ max: 1000 }).withMessage("Message is too long.").escape(),
];

const messagePost = [
  validateMessage,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("new-message", { title: "New message", errors: errors.array(), old: req.body });
      }
      const { title, text } = matchedData(req);
      await db.createMessage({ userId: req.user.id, title, text });
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];

// Admin only: remove a message (the form must carry the session's secret token)
const messageDelete = async (req, res, next) => {
  try {
    if (!req.body.csrfToken || req.body.csrfToken !== req.session.csrfToken) {
      return res.status(403).render("error", { title: "Not allowed", message: "That form expired. Please go back and try again." });
    }
    await db.deleteMessage(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

module.exports = { homeGet, joinGet, joinPost, messageGet, messagePost, messageDelete };
