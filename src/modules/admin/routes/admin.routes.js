import express from "express";
import {
  changeUserActiveStatus,
  getAllMedallionCount,
  getAllNewUsers,
  getAllNewUsersCount,
  getAllUsers,
  getAllUsersCount,
  //   getlUsersBySearch,
} from "../controllers/admin.controller.js";

const router = express.Router();

// get all users count
router.get("/users/count", getAllUsersCount);

// get all medallions count
router.get("/medallions/count", getAllMedallionCount);

// get new users count
router.get("/new-users/count", getAllNewUsersCount);

// get users by created at
router.get("/users/get", getAllUsers);

// get users by new users
router.get("/new-users/get", getAllNewUsers);

// get users by search
// router.get('/users/search', getlUsersBySearch)

// chagne user active status
router.put("/user/change-active-status", changeUserActiveStatus);

// create a payment intent

export default router;
