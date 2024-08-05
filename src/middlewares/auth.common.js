import jwt from "jsonwebtoken";
import { JWT_SECERET } from "../../config/constants.js";

const auth = (req, res, next) => {
  // routes which donot require token

  const excludePath = [
    "/check",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/verify-otp",
    "/api/auth/send-link",
    "/api/auth/verify-reset-link",
    "/api/auth/reset-password",
    "/api/admin/send-link",
  ];
  if (excludePath.includes(req.params["0"])) return next();

  // Get token from header
  const token = req.header("Authorization") || req.header("authorization");

  try {
    jwt.verify(token, JWT_SECERET, (error, decoded) => {
      if (error) {
        return next({ code: 5000, status: 401 });
      } else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    return next({ code: 5004, status: 500 });
  }
};

export default auth;
