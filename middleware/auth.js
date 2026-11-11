function requireLogin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/log-in");
  }
  next();
}

function requireMember(req, res, next) {
  if (!req.isAuthenticated() || !req.user.is_member) {
    return res.status(403).render("error", {
      title: "Members only",
      message: "Join the club first to see who wrote each message.",
    });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.isAuthenticated() || !req.user.is_admin) {
    return res.status(403).render("error", {
      title: "Admins only",
      message: "Only admins can do that.",
    });
  }
  next();
}

module.exports = { requireLogin, requireMember, requireAdmin };
