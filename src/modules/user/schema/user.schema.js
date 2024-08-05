import { body } from "express-validator";

export const signupSchema = [
  body("email")
    .isLength({ min: 1 })
    .withMessage(5009)
    .isEmail()
    .withMessage(5010),
  body("password")
    .isString()
    .withMessage(5003)
    .isLength({ min: 4 })
    .withMessage(5008),
  body("name")
    .isString()
    .withMessage(5026)
    .isLength({ min: 2 })
    .withMessage(5020),
  body("phone")
    .isString()
    .withMessage(5031)
    .isLength({ min: 10 })
    .withMessage(5032),
  body("role")
    .isString()
    .withMessage(5033)
    .custom((value) => {
      if (value !== "admin" && value !== "user") {
        return false;
      } else {
        return true;
      }
    })
    .withMessage(5034),
];

export const loginSchema = [
  body("email")
    .isLength({ min: 1 })
    .withMessage(5009)
    .isEmail()
    .withMessage(5010),
  body("password")
    .isString()
    .withMessage(5003)
    .isLength({ min: 4 })
    .withMessage(5008),
  body("role")
    .isString()
    .withMessage(5033)
    .custom((value) => {
      if (value !== "admin" && value !== "user") {
        return false;
      } else {
        return true;
      }
    })
    .withMessage(5034),
];

export const gmailAuthSchema = [
  body("token")
    .isString()
    .withMessage(5001)
    .isLength({ min: 1 })
    .withMessage(5001),
];

export const appleAuthSchema = [
  body("appleId")
    .isString()
    .withMessage(5005)
    .isLength({ min: 1 })
    .withMessage(5005),
];

export const changePasswordSchema = [
  body("password")
    .isString()
    .withMessage(5003)
    .isLength({ min: 4 })
    .withMessage(5008),
  body("newPassword")
    .isString()
    .withMessage(5003)
    .isLength({ min: 4 })
    .withMessage(5008),
];
export const resetPasswordSchema = [
  body("email")
    .isLength({ min: 1 })
    .withMessage(5009)
    .isString()
    .withMessage(5010),
  body("password")
    .isString()
    .withMessage(5003)
    .isLength({ min: 4 })
    .withMessage(5008),
  body("role")
    .isString()
    .withMessage(5033)
    .custom((value) => {
      if (value !== "admin" && value !== "user") {
        return false;
      } else {
        return true;
      }
    })
    .withMessage(5034),
];

export const forgotPasswordSchema = [
  body("email")
    .isLength({ min: 1 })
    .withMessage(5009)
    .isString()
    .withMessage(5010),
];

export const verifyOtpSchema = [
  body("phoneNumber")
    .isLength({ min: 1 })
    .withMessage(5022)
    .isString()
    .withMessage(5023),
  body("code")
    .isLength({ min: 1 })
    .withMessage(5024)
    .isNumeric()
    .withMessage(5010),
];

export const sendLinkSchema = [
  body("email")
    .isLength({ min: 1 })
    .withMessage(5009)
    .isString()
    .withMessage(5010),
  body("role")
    .isString()
    .withMessage(5033)
    .custom((value) => {
      if (value !== "admin" && value !== "user") {
        return false;
      } else {
        return true;
      }
    })
    .withMessage(5034),
];
export const verifyLinkSchema = [
  body("token").isLength({ min: 1 }).withMessage(5009),
];
