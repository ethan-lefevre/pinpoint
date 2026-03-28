function verifiedEmailMiddleware(req, res, next) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  if (!user.emailVerified) {
    return res.status(403).json({
      message: "Please verify your email before accessing this content",
    });
  }

  next();
}

module.exports = verifiedEmailMiddleware;