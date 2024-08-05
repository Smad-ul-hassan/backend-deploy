import util from "util";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  JWT_SECERET,
  NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD,
} from "../../config/constants.js";
const signJwt = util.promisify(jwt.sign);

export const JWT_Token = async ({ userData }) => {
  try {
    const token = await signJwt({ user: userData }, JWT_SECERET);
    return token;
  } catch (e) {
    // message = Server Error
    return next({ code: 5004, status: 500 });
  }
};
export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
});
