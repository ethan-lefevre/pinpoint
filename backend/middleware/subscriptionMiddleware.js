async function subscriptionMiddleware(req, res, next) {

  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Not authenticated"
    });
  }

  if (!user.subscribed) {
    return res.status(403).json({
      message: "Subscription required"
    });
  }

  next();
}

module.exports = subscriptionMiddleware;