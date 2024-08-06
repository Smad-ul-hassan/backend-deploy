import dotenv from "dotenv";
dotenv.config();
import express from "express";
import errors from "../config/errors.js";
import { PORT } from "../config/constants.js";
import paggination from "../src/middlewares/pagination.common.js";
import userRouter from "../src/modules/user/routes/user.routes.js";
import adminRouter from "../src/modules/admin/routes/admin.routes.js";
import auth from "../src/middlewares/auth.common.js";
import adminAuth from "../src/middlewares/admin.auth.common.js";
import cors from "cors";

const app = express();

export var corsOptions = {
  origin: function (origin, callback) {
    return callback(null, true);
  },
  credentials: true,
};
app.use(cors());
// Sample route
app.get("/check", (req, res) => {
  return res.json({ message: "**Wellcome to epitap**" });
});

// app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("*", paggination);
app.get("/api", (req, res) => {
  res.send({ status: "Server is running 🚀🚀" });
});
app.use("*", auth);

app.use("/api/auth", userRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminAuth, adminRouter);
// app.use('/api/admin', adminRouter)

app.use((err, req, res, next) => {
  if (err.code && typeof err.code === "number") {
    res.status(err.status || 403);
    return res.json({
      success: 0,
      message: errors[err?.code]["msg"]["en"],
      response: err?.message,
      data: {},
    });
  }

  res.status(err.status || 500).json({
    success: 0,
    message: err?.message,
    data: {},
  });
});

const port = PORT;
app.listen(port, () => {
  console.log(`server is listening on port ${port} 🚀🚀🚀🚀`);
});
