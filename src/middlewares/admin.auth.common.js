const admin = (req, res, next) => {
  try {
    const excludePath = ["/api/admin/forgot-password"];

    if (excludePath.includes(req.originalUrl)) {
      return next();
    }
    // Remove this later
    // req.user.role = 'admin'
    if (req.user.role === "admin") {
      next();
    } else {
      return next({ code: 5000, status: 401 });
    }
  } catch (err) {
    return next({ code: 5004, status: 500 });
  }
};

export default admin;
