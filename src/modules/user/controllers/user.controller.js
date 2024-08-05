import * as argon2 from "argon2";
import { JWT_Token } from "../../../common/functions.js";
import { sendResponse } from "../../../common/response.js";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import {
  FRONTEND_URL_ADMIN,
  FRONTEND_URL_WEB,
  JWT_SECERET,
} from "../../../../config/constants.js";
import {
  createUser,
  findUser,
  updatePassword,
  updateUserData,
  findUserById,
  assignMedallionToUser,
  createMedallionLinks,
  createMedallionTribute,
  deleteMedallionTribute,
  findAllUserMedallions,
  findMedallionDataByMedallionId,
  findUnUsedMedallion,
  findUserMedallionData,
  updateMedallionTribute,
  createReviewToTribute,
  findMemoryWalls,
  updateMemoryWallStatus,
  saveUserMetadata,
} from "../db/user.db.js";
import {} from "../db/user.db.js";
import { transporter } from "../../../common/functions.js";
import { deleteSingleImage } from "../../../middlewares/uploadFiles.js";

//
// Signup Api

export const signupController = async (req, res, next) => {
  // try {
  let { name, email, password, phone, role } = req.body;

  email = email.toLowerCase();

  let user = await findUser({ email: email });

  if (!user) {
    const hash = await argon2.hash(password);

    const createdUser = await createUser({
      email: email,
      password: hash,
      name: name,
      role: role,
      phone: phone,
    });

    delete createdUser?.password;

    const token = await JWT_Token({
      userData: createdUser,
    });

    let data = {
      user: createdUser,
      token: token,
    };

    // Success --- message = user created sucessfully

    return sendResponse(req, res, 12001, data);
  } else {
    // user Already exists
    return next({ code: 5006, status: 409 });
  }
  // } catch (error) {
  //   return next({ code: 5004, status: 500 });
  // }
};

//
// Login api

export const loginController = async (req, res, next) => {
  try {
    let { email, password, role } = req.body;
    email = email.toLowerCase();

    let user = await findUser({ email: email });
    if (!user) {
      return next({ code: 5002, status: 401 });
    } else {
      if (role !== user?.role) {
        return next({ code: 5002, status: 401 });
      }
      const passwordVerified = await argon2.verify(
        user.password,
        `${password}`
      );
      if (passwordVerified) {
        delete user.password;

        const token = await JWT_Token({
          userData: user,
        });
        let data = {
          user: user,
          token: token,
        };

        // success ----- message = Singin sucessfully
        return sendResponse(req, res, 12000, data);
      } else {
        // message = Invalid Password
        return next({ code: 5011, status: 401 });
      }
    }
  } catch (error) {
    // message = Server Error
    return next({ code: 5004, status: 500 });
  }
};

//
// update password api

export const changePasswordController = async (req, res, next) => {
  try {
    let { password, newPassword } = req.body;
    const { user, dbUser } = req;
    if (user.email === dbUser.email) {
      const passwordVerified = await argon2.verify(
        dbUser.password,
        `${password}`
      );
      if (passwordVerified) {
        const hash = await argon2.hash(newPassword);
        let updatedUser = await updatePassword({
          userId: user.id,
          hash: hash,
        });
        delete updatedUser.password;

        // success ------- message = Password updated successfully
        return sendResponse(req, res, 12002, updatedUser);
      } else {
        // message = Invalid Password
        return next({ code: 5011, status: 401 });
      }
    } else {
      // message = Invalid email
      return next({ code: 5010, status: 401 });
    }
  } catch (error) {
    return next({ code: 5004, status: 500 });
  }
};

//
// get me
export const getMe = async (req, res, next) => {
  try {
    const { email } = req.user;
    const user = await findUser({ email: email });
    if (!user) {
      // message = User does'nt exist
      return next({ code: 5014, status: 401 });
    } else {
      delete user.password;
      // success ----- message = User found
      return sendResponse(req, res, 12003, user);
    }
  } catch {
    // message = Server Error
    return next({ code: 5004, status: 500 });
  }
};

//
// send reset password link

export const sendLink = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = await findUser({ email: email });

    if (!user) {
      // message = User does'nt exist
      return next({ code: 5014, status: 401 });
    } else {
      if (role !== user?.role) {
        // message = User does'nt exist
        return next({ code: 5014, status: 401 });
      }

      const token = jwt.sign({ user: user }, JWT_SECERET, {
        expiresIn: "10m",
      });
      const resetLink =
        role === "admin"
          ? `${FRONTEND_URL_ADMIN}/reset-password?token=${token}`
          : `${FRONTEND_URL_WEB}/reset-password?token=${token}`;
      const mailOptions = {
        from: "smadhssn1@gmail.com",
        to: email,
        subject: "Password Reset Link",
        text: `You requested a password reset. Please click on the button below to reset your password.`,
        html: `<div style="color:black;><p style="color:white;">You requested a password reset. Please click on the button below to reset your password:</p>
        <br/>
        <br/>
        <button style="height:40px;width:140px;background-color:#0070f3;color:white;border-radius:5px;border:none">
        <a style="text-decoration:none;color:white" href="${resetLink}">Reset Password</a>
        </button>
        <p>If you did not request this, please ignore this email.</p>
        </div>`,
      };
      await transporter.sendMail(mailOptions);

      // success ----- message = Reset password link has been sent to your email
      return sendResponse(req, res, 12005, {});
    }
  } catch (error) {
    // message = Error while sending password reset link
    return next({ code: 5027, status: 500 });
  }
};

//
// verify reset password link

export const verifyResetLink = async (req, res, next) => {
  try {
    const { token } = req.body;
    jwt.verify(token, JWT_SECERET, (error, decoded) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          // message = link expired
          return next({ code: 5029, status: 401 });
        } else {
          // message = Invalid link
          return next({ code: 5030, status: 401 });
        }
      } else {
        const { email, role } = decoded.user;
        // success ----- message = link verified
        return sendResponse(req, res, 12006, { email: email, role: role });
      }
    });
  } catch (error) {
    // message = Server token
    return next({ code: 5004, status: 401 });
  }
};

//
// reset password

export const resetPassword = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await findUser({ email: email });
    if (!user) {
      // message = User does'nt exist
      return next({ code: 5014, status: 401 });
    } else {
      if (role !== user.role) {
        // message = User does'nt exist
        return next({ code: 5014, status: 401 });
      }
      const hash = await argon2?.hash(password);
      await updatePassword({ userId: user?.userId, password: hash });
      // success ----- message = Password updated successfully
      return sendResponse(req, res, 12007, {});
    }
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500 });
  }
};

// User Flow
export const getUnUsedMedallionCount = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { quantity } = req.query;
    let medallionCountFound = await findUnUsedMedallion({ quantity: quantity });
    if (medallionCountFound.length === 0) {
      let medallionLinksData = [];

      for (let i = 0; i < 10; i++) {
        const id = uuid();
        medallionLinksData.push({
          medallionId: id,
          value: `localhost:3000/user-tribute/${id}`,
        });
      }

      const medallionLinksCreated = await createMedallionLinks(
        medallionLinksData
      );
      medallionCountFound = await findUnUsedMedallion({ quantity: quantity });

      if (!medallionLinksCreated || !medallionCountFound) {
        // message = Something went wrong, Please try again later
        return next({ code: 5035, status: 500 });
      }
    }

    const medallionIds = medallionCountFound?.map(
      (medallion) => medallion?.medallionId
    );

    const medallionAssigned = await assignMedallionToUser({
      userId: userId,
      medallionIds: medallionIds,
    });

    let data = medallionAssigned;
    if (!medallionAssigned) {
      // message = Something went wrong, Please try again later
      return next({ code: 5035, status: 500 });
    }

    // // success ----- message = Medallion Assigned Successfully
    return sendResponse(req, res, 12008, data);
  } catch (error) {
    // message = Server error
    console.log(error);
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// get users medallion data and tribute data
export const getUserMedallionData = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { medallionId } = req.body;
    const medallionFound = await findUserMedallionData({
      userId: userId,
      medallionId: medallionId,
    });
    if (!medallionFound) {
      // message = Something went wrong, Please try again later
      return next({ code: 5035, status: 500 });
    }
    // success ----- message = Medallion Assigned Successfully
    return sendResponse(req, res, 12008, medallionFound);
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// add / update users medallion tribute data
export const updateMEdallionTributeData = async (req, res, next) => {
  try {
    const { userId } = req.user;
    let { medallionId, ...data } = req.body;
    let dataSet = {};

    const medallionFound = await findMedallionDataByMedallionId({
      medallionId: medallionId,
      userId: userId,
    });
    if (!medallionFound) {
      // message = Invalid medallion id
      return next({ code: 5033, status: 500 });
    }

    Object.entries(data).map((ele) => {
      dataSet[ele[0]] =
        ele[1] === "true" ? true : ele[1] === "false" ? false : ele[1];
    });

    dataSet.timeLine = JSON.parse(dataSet.timeLine);

    if (dataSet.donation && typeof dataSet.donation === "string") {
      dataSet.donation = JSON.parse(dataSet.donation);
    }
    if (dataSet.memoryWall && typeof dataSet.memoryWall === "string") {
      dataSet.memoryWall = JSON.parse(dataSet.donation);
    }

    if (typeof dataSet.timeLine === "string") {
      dataSet.timeLine = JSON.parse(dataSet.timeLine);
    }

    if (Object.values(dataSet).every((ele) => ele === "")) {
      // message = Invalid data set
      return next({ code: 5032, status: 500 });
    }
    //
    if (req.files) {
      console.log("typeof dataSet.oldImages", typeof dataSet.oldImages);
      console.log("dataSet.oldImages", dataSet.oldImages);
      if (req.files.images) {
        if (typeof dataSet.oldImages === "string") {
          dataSet.oldImages = JSON.parse(dataSet.oldImages);
        } else if (Array.isArray(dataSet.oldImages)) {
          dataSet.oldImages = dataSet.oldImages;
          if (dataSet.oldImages.length === 0) {
            dataSet.oldImages = [];
          }
        }

        const data = req.files.images.map((ele) => {
          return ele.location;
        });

        dataSet.images = [...data];
        console.log(
          "dataSet.images uploaded images and before check",
          dataSet.images
        );
        if (dataSet?.oldImages.length > 0) {
          dataSet.images = [...dataSet.images, ...dataSet.oldImages];
        }
        console.log("dataSet.images after old images push", dataSet.images);
      }
      if (req.files.tributeImage) {
        dataSet.tributeImage = req.files.tributeImage[0].location;
      }
      if (req.files.coverImage) {
        dataSet.coverImage = req.files.coverImage[0].location;
      }
    }

    delete dataSet.oldImages;
    delete dataSet.oldTributeImage;
    delete dataSet.oldCoverImage;

    if (!medallionFound.tribute) {
      // create new tribute
      const tributeCreated = await createMedallionTribute(
        dataSet,
        userId,
        medallionId
      );
      if (!tributeCreated) {
        // message = Something went wrong, Please try again later
        return next({ code: 5035, status: 500 });
      }

      // success ----- message = Data added successfully
      return sendResponse(req, res, 12009, medallionFound);
    } else {
      const tributeUpdated = await updateMedallionTribute(
        dataSet,
        userId,
        medallionId
      );
      if (!tributeUpdated) {
        // message = Something went wrong, Please try again later
        return next({ code: 5035, status: 500 });
      }
      // success ----- message = Data updated successfully
      return sendResponse(req, res, 12010, medallionFound);
    }
  } catch (error) {
    console.log("error.message", error.message);
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};
// get medallion tribute by medall`ion id
export const getMedallionTributeById = async (req, res, next) => {
  try {
    const { medallionId } = req.query;

    const medallionFound = await findMedallionDataByMedallionId({
      medallionId: medallionId,
    });
    if (!medallionFound) {
      // message = Invalid medallion id
      return next({ code: 5033, status: 500 });
    }
    medallionFound.tribute.oldImages = medallionFound.tribute.images;
    delete medallionFound.tribute.images;
    // success ----- message = Medallion Found successfully
    return sendResponse(req, res, 12011, medallionFound);
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, password, oldImage } = req.body;

    const user = req.user;

    const userFound = await findUserById({ id: user.userId });
    if (!userFound) {
      // message = user doesnot exist
      return next({ code: 5014, status: 500 });
    }

    userFound.name = name;
    if (password) {
      const hash = await argon2.hash(password);
      userFound.password = hash;
    }

    if (req.file) {
      userFound.image = req.file.location;
      if (oldImage) {
        let key = `user/${oldImage.split("/").pop()}`;
        await deleteSingleImage(key);
      }
    }
    delete userFound.createdAt;
    delete userFound.updatedAt;
    delete userFound.deletedAt;

    // update user
    const updatedUser = await updateUserData({ userFound: userFound });
    if (!updatedUser) {
      // message = Something went wrong, Please try again later
      return next({ code: 5035, status: 500 });
    }
    delete updatedUser.password;
    // success ----- message = User updated successfully
    return sendResponse(req, res, 12012, updatedUser);
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// get all medallions of user
export const getAllUserMedallion = async (req, res, next) => {
  try {
    const user = req.user;
    const medallionsFound = await findAllUserMedallions({
      userId: user.userId,
    });
    if (!medallionsFound) {
      // message = Something went wrong, Please try again later
      return next({ code: 5035, status: 500 });
    }
    // success ----- message = Medallions Found successfully
    return sendResponse(req, res, 12013, medallionsFound);
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// delete medallion tribute by id
export const deleteMedallionTributeById = async (req, res, next) => {
  try {
    const { medallionId } = req.query;
    const user = req.user;
    const deleted = await deleteMedallionTribute({
      medallionId: medallionId,
      userId: user.userId,
    });
    if (!deleted) {
      // message = Something went wrong, Please try again later
      return next({ code: 5035, status: 500 });
    }

    // success ----- message = Medallion deleted successfully
    return sendResponse(req, res, 12014, {});
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// add review to a tribute
export const addReviewToTribute = async (req, res, next) => {
  try {
    let { tributeId, review, oldImages, email } = req.body;
    if (oldImages) {
      oldImages = oldImages;
    } else {
      oldImages = [];
    }
    const user = req.user;
    if (req.file) {
      let images = req.file.location;
      oldImages.push(images);
      const reviewCreated = await createReviewToTribute({
        tributeId: tributeId,
        review: review,
        images: images,
        email: email,
      });
      if (!reviewCreated) {
        // message = Something went wrong, Please try again later
        return next({ code: 5035, status: 500 });
      }
      // success ----- message = Review Added successfully
      return sendResponse(req, res, 12017, reviewCreated);
    } else {
      let images = undefined;
      const reviewCreated = await createReviewToTribute({
        tributeId: tributeId,
        review: review,
        images: images,
        email: email,
      });
      if (!reviewCreated) {
        // message = Something went wrong, Please try again later
        return next({ code: 5035, status: 500 });
      }
      // success ----- message = Review Added successfully
      return sendResponse(req, res, 12017, reviewCreated);
    }
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// get medallion tribute memory wall reviews
export const getMedallionTributeMemoryWalls = async (req, res, next) => {
  try {
    const { tributeId, offset, limit, status } = req.query;
    const memoryWallFound = await findMemoryWalls(
      tributeId,
      limit,
      offset,
      status
    );
    if (!memoryWallFound) {
      // message = Something went wrong, Please try again later
      return next({ code: 5035, status: 500 });
    }
    // success ----- message = Memory Wall Found successfully
    return sendResponse(req, res, 12015, memoryWallFound);
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// change status of medallion tribute memory wall review
export const updateMemoryWallReviewStatus = async (req, res, next) => {
  try {
    const { memoryWallId, status } = req.body;
    const memoryWallFound = await updateMemoryWallStatus({
      memoryWallId,
      status,
    });
    if (!memoryWallFound) {
      // message = Something went wrong, Please try again later
      return next({ code: 5035, status: 500 });
    }
    // success ----- message = Memory Wall Status updated successfully
    return sendResponse(req, res, 12016, memoryWallFound);
  } catch (error) {
    // message = Server error
    return next({ code: 5004, status: 500, message: error.message });
  }
};

// -- create payment intent
const calculateOrderAmount = (item) => {
  return (item + item * 0.1) * 100;
};
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { subTotal } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(subTotal),
      currency: "aud",
      payment_method_types: ["card"],
      capture_method: "manual",
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    // message = Server error
    return res.send({
      error: "An error occurred while processing your payment",
      status: 500,
    });
  }
};

export const capturePaymentIntent = async (req, res) => {
  try {
    const { intentId } = req.body;
    const intent = await stripe.paymentIntents.capture(intentId);

    return res.json({ success: true, intent });
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      data: error.message,
      success: false,
    });
  }
};

export const canacelPayment = async (req, res) => {
  const { payment_intent } = req.body;
  try {
    const cancel = await stripe?.paymentIntents?.cancel(payment_intent);
    return res.json({ success: true, cancel });
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
      data: error.message,
      success: false,
    });
  }
};

export const saveMetadata = async (req, res) => {
  const { medallions, metadata } = req.body;
  const { userId } = req.user;
  console.log(metadata);
  console.log(medallions);
  // try {
  const saved = await saveUserMetadata({ userId, metadata, medallions });
  return res.json({ success: true, saved });
  // } catch (error) {
  //   return res.status(500).send({
  //     message: "Something went wrong",
  //     data: error.message,
  //     success: false,
  //   });
  // }
};
