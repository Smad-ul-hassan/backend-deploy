import { sendResponse } from "../../../common/response.js";
import {
  findAllMedallionsCount,
  findAllNewUsersCount,
  findAllUsersCount,
  findUserById,
  findUsersByJoiningDate,
  findUsersBySearch,
  findUsersCountBySearch,
  findUsersMedallionCount,
  updateUserActiveStatus,
  findAllNewUsers,
} from "../db/admin.db.js";

// get all users count
export const getAllUsersCount = async (req, res, next) => {
  try {
    const userCountFound = await findAllUsersCount();
    if (!userCountFound) {
      // message = Something went wrong, Please try again later
      return next({ code: 6002, status: 500 });
    }

    // success ----- message = All user's count found successfully
    return sendResponse(req, res, 13001, userCountFound);
  } catch (error) {
    // message = Server error
    return next({ code: 6001, status: 500, message: error.message });
  }
};

// get all medallion count
export const getAllMedallionCount = async (req, res, next) => {
  try {
    const medallionCountFound = await findAllMedallionsCount();
    if (!medallionCountFound) {
      // message = Something went wrong, Please try again later
      return next({ code: 6002, status: 500 });
    }

    // success ----- message = All medallion's count found successfully
    return sendResponse(req, res, 13002, medallionCountFound);
  } catch (error) {
    // message = Server error
    return next({ code: 6001, status: 500, message: error.message });
  }
};

// get all new users count
export const getAllNewUsersCount = async (req, res, next) => {
  try {
    const userCountFound = await findAllNewUsersCount();

    if (typeof userCountFound !== "number" && !userCountFound) {
      // message = Something went wrong, Please try again later
      return next({ code: 6002, status: 500 });
    }

    // success ----- message = All user's count found successfully
    return sendResponse(req, res, 13001, userCountFound);
  } catch (error) {
    // message = Server error
    return next({ code: 6001, status: 500, message: error.message });
  }
};

// get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { limit, offset, sort, search } = req.query;
    const userCount = await findAllUsersCount();
    const usersFound = await findUsersByJoiningDate(
      limit,
      offset,
      sort,
      search
    );

    let ids = usersFound?.map((ele) => {
      return ele?.userId;
    });

    const usersMedallionCountFound = await findUsersMedallionCount(ids);
    const data = usersFound?.map((ele) => {
      let value = usersMedallionCountFound.find((val) => {
        return val.userId === ele.userId;
      });
      ele.medallionCount = value ? value["_count"]?.userId : 0;
      return ele;
    });
    let result = {
      count: userCount,
      data: data,
    };
    // success ----- message = All user's count found successfully
    return sendResponse(req, res, 13001, result);
  } catch (error) {
    // message = Server error
    return next({ code: 6001, status: 500, message: error.message });
  }
};

// get all new users

export const getAllNewUsers = async (req, res, next) => {
  try {
    const { limit, offset, sort, search } = req.query;
    const userCount = await findAllNewUsersCount();
    const usersFound = await findAllNewUsers(limit, offset, sort, search);

    let ids = usersFound?.map((ele) => {
      return ele?.userId;
    });

    const usersMedallionCountFound = await findUsersMedallionCount(ids);
    const data = usersFound?.map((ele) => {
      let value = usersMedallionCountFound.find((val) => {
        return val.userId === ele.userId;
      });
      ele.medallionCount = value ? value["_count"]?.userId : 0;
      return ele;
    });
    let result = {
      count: userCount,
      data: data,
    };
    // success ----- message = All user's count found successfully
    return sendResponse(req, res, 13001, result);
  } catch (error) {
    // message = Server error
    return next({ code: 6001, status: 500, message: error.message });
  }
};

// get users by search
// export const getlUsersBySearch = async (req, res, next) => {
//   try {
//     const { limit, offset, search } = req.query;
//     const usersCountFound = await findUsersCountBySearch(limit, offset, search);
//     const usersFound = await findUsersBySearch(limit, offset, search);

//     if (!usersFound) {
//       // message = Something went wrong, Please try again later
//       return next({ code: 6002, status: 500 });
//     }

//     let data = {
//       count: usersCountFound,
//       data: usersFound,
//     };

//     // success ----- message = Users found successfully
//     return sendResponse(req, res, 13003, data);
//   } catch (error) {
//     // message = Server error
//     return next({ code: 6001, status: 500, message: error.message });
//   }
// };

// change user active status
export const changeUserActiveStatus = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const userFound = await findUserById(userId);

    if (!userFound) {
      // message = Something went wrong, Please try again later
      return next({ code: 6002, status: 500 });
    }

    const statusUpdated = await updateUserActiveStatus(userId, userFound);
    if (!statusUpdated) {
      // message = Something went wrong, Please try again later
      return next({ code: 6002, status: 500 });
    }

    delete statusUpdated.password;

    // success ----- message = Users status updated successfully
    return sendResponse(req, res, 13004, statusUpdated);
  } catch (error) {
    // message = Server error
    return next({ code: 6001, status: 500, message: error.message });
  }
};
