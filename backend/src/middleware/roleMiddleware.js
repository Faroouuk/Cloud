const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const groups = user["cognito:groups"] || [];
    const customRole = user["custom:role"];

    const hasRole = allowedRoles.some((role) => {
      return (
        groups.includes(role) ||
        (typeof customRole === "string" && customRole === role)
      );
    });

    if (!hasRole) {
      return res.status(403).json({
        message: "Forbidden: insufficient role",
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};
