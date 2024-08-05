import express from "express";
import { validate } from "../../../common/utils.js";
import {
  loginSchema,
  signupSchema,
  changePasswordSchema,
  verifyLinkSchema,
  sendLinkSchema,
  resetPasswordSchema,
} from "../schema/user.schema.js";
import {
  loginController,
  signupController,
  changePasswordController,
  getMe,
  sendLink,
  verifyResetLink,
  resetPassword,
  getUnUsedMedallionCount,
  getUserMedallionData,
  updateMEdallionTributeData,
  getMedallionTributeById,
  updateUserProfile,
  getAllUserMedallion,
  deleteMedallionTributeById,
  addReviewToTribute,
  getMedallionTributeMemoryWalls,
  updateMemoryWallReviewStatus,
  createPaymentIntent,
  capturePaymentIntent,
  canacelPayment,
  saveMetadata,
} from "../controllers/user.controller.js";
import {
  uploadMedallionImages,
  uploadMemoryWallImage,
  uploadUserProfileImage,
} from "../../../middlewares/uploadFiles.js";
const router = express.Router();

// -------------------- Auth Routes -----------------///
// auth flow using email address
router.post("/login", validate(loginSchema), loginController);
router.post("/signup", validate(signupSchema), signupController);
// auth flow using google and apple
router.put(
  "/change-password",
  validate(changePasswordSchema),
  changePasswordController
);
router.get("/get-me", getMe);
router.post("/send-link", validate(sendLinkSchema), sendLink);
router.post("/verify-reset-link", validate(verifyLinkSchema), verifyResetLink);
router.put("/reset-password", validate(resetPasswordSchema), resetPassword);
// -------------------- Auth Routes - END -----------------///

// -------------------- User Routes -----------------///
// create medallion / assign medallio to user
router.get("/medallion/assign-user", getUnUsedMedallionCount);

// get user's medalion and tribute data
router.get("/medallion/get-user-medallion-data", getUserMedallionData);

// update medallio - tribute data
router.post(
  "/medallion/tribute/add",
  uploadMedallionImages.fields([
    { name: "images", maxCount: 10 },
    { name: "tributeImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateMEdallionTributeData
);
// router.post('/medallion/tribute/add', uploadMedallionImages.single('tributeImage'), updateMEdallionTributeData)

// get medallion tribute data with medallion id
router.get("/medallion", getMedallionTributeById);

// update user profile
router.put(
  "/profile/update",
  uploadUserProfileImage.single("image"),
  updateUserProfile
);

// update medallion data
// router.put('/medallion/update', uploadMedallionImages.array('images', 10))

// get all medalions by userId
router.get("/medallion/get-all", getAllUserMedallion);

// delete single medallion
router.delete("/medallion/delete", deleteMedallionTributeById);

// add review to a tribute
router.post(
  "/medallion/tribute/add/review",
  uploadMemoryWallImage.single("image"),
  addReviewToTribute
);

// get tribute memory wall reviews
router.get("/medallion/tribute/get-reviews", getMedallionTributeMemoryWalls);

// mark memory wall review as public / private
router.put("/medallion/tribute/status", updateMemoryWallReviewStatus);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/capture-payment", capturePaymentIntent);
router.post("/cancel-payment-intent", canacelPayment);
router.post("/save-metadata", saveMetadata);

export default router;
