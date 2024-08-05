import prisma from "../../../../config/db.js";
import moment from "moment";
// import moment from "moment";

export const findUser = ({ email }) => {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
  });
};

// find user by id
export const findUserById = ({ id }) => {
  return prisma.user.findUnique({
    where: {
      userId: id,
      role: "user",
      deletedAt: null,
    },
  });
};

export const createUser = ({ email, password, name, role, phone }) => {
  return prisma.user.create({
    data: {
      email: email,
      name: name,
      password: password,
      role: role,
      phone: phone,
    },
  });
};

export const updatePassword = ({ userId, password }) => {
  return prisma.user.update({
    where: {
      userId: userId,
    },

    data: {
      password: password,
    },
  });
};

export const generateOtp = async ({ message, number }) => {
  return client.messages.create({
    body: message,

    from: TWILIO_PHONE_NUMBER,

    to: number,
  });
};

export const saveOtp = async ({ userId, code }) => {
  const currentTimestamp = moment().unix();
  const newTimestamp = moment.unix(currentTimestamp).add(30, "minutes").unix();
  return prisma.otpCode.create({
    data: {
      userId: userId,
      code: code,
      expiry: newTimestamp,
      for: "verification-password",
    },
  });
};

export const findUserOtpVerification = async ({ phoneNumber, code }) => {
  let currentTimestamp = moment();
  return prisma.user.findFirst({
    where: {
      phoneNumber: phoneNumber,
      otpCode: {
        some: {
          code: +code,
          usedAt: null,
          expiry: {
            gt: currentTimestamp,
          },
        },
      },
    },
  });
};

export const updateOtpStatus = async ({ otpId, userId }) => {
  const currentTimestamp = moment().unix();
  return prisma.OtpCode.update({
    where: {
      id: otpId,
      userId: userId,
    },
    data: {
      usedAt: currentTimestamp,
    },
  });
};

// -------------- User Flow  -------------- //

// find un-used medallions count
export const findUnUsedMedallion = async ({ quantity }) => {
  return prisma.medallion.findMany({
    where: {
      usedAt: null,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: +quantity,
    select: {
      medallionId: true,
    },
  });
};

// create bulk medallion links
export const createMedallionLinks = (data) => {
  return prisma.medallion.createMany({
    data: data,
  });
};

// assign medallion to user
export const assignMedallionToUser = async ({ userId, medallionIds }) => {
  let currentDateTime = new Date();
  let deletedAtTime = currentDateTime.toISOString();
  const oneYearFromNow = new Date(currentDateTime);
  oneYearFromNow.setFullYear(currentDateTime.getFullYear() + 1);
  const oneYearFromNowISO = oneYearFromNow.toISOString();
  // console.log(medallionIds, "medallionIds");
  const data = await prisma.medallion.updateMany({
    where: {
      medallionId: {
        in: medallionIds,
      },
      deletedAt: null,
      usedAt: null,
    },
    data: {
      userId: userId,
      type: "1 Year",
      usedAt: deletedAtTime,
      validTill: oneYearFromNowISO,
    },
  });
  if (!data) {
    return;
  }
  const updatedRecords = await prisma?.medallion?.findMany({
    where: {
      medallionId: {
        in: medallionIds,
      },
    },
  });

  console.log(updatedRecords);

  return updatedRecords;
};

// find users medallion data
export const findUserMedallionData = ({ userId, medallionId }) => {
  return prisma.medallion.findFirst({
    where: {
      userId: userId,
      medallionId: medallionId,
      deletedAt: null,
    },
    include: {
      tribute: true,
    },
  });
};

// create medallion data in tribute table
export const createMedallionTribute = (dataSet, userId, medallionId) => {
  return prisma.medallion.update({
    where: {
      medallionId: medallionId,
      userId: userId,
      deletedAt: null,
    },
    data: {
      tribute: {
        create: {
          medallionId: medallionId,
          ...dataSet,
        },
      },
    },
  });
};

// update medallion data in tribute page
export const updateMedallionTribute = (data, userId, medallionId) => {
  return prisma.medallion.update({
    where: {
      userId: userId,
      medallionId: medallionId,
      deletedAt: null,
    },
    data: {
      tribute: {
        update: {
          data,
        },
      },
    },
  });
};

// get medallion tribute data be medallion id
export const findMedallionDataByMedallionId = ({ medallionId }) => {
  return prisma.medallion.findUnique({
    where: {
      medallionId: medallionId,
      deletedAt: null,
      NOT: {
        usedAt: null,
      },
    },
    include: {
      tribute: true,
    },
  });
};

// update user data
export const updateUserData = ({ userFound }) => {
  return prisma.user.update({
    where: {
      userId: userFound.userId,
    },
    data: {
      ...userFound,
    },
  });
};

// get all medallions of a single user
export const findAllUserMedallions = ({ userId }) => {
  return prisma.medallion.findMany({
    where: {
      userId: userId,
      deletedAt: null,
    },
    include: {
      tribute: true,
    },
  });
};

// delete single medallion by id
export const deleteMedallionTribute = async ({ medallionId, userId }) => {
  // const transactionResult = await prisma.$transaction(async (prisma) => {
  const medallion = await prisma.medallion.delete({
    where: {
      userId: userId,
      medallionId: medallionId,
    },
  });
  if (!medallion) {
    return false;
  }

  const tributeFound = await prisma.tribute.findFirst({
    where: {
      medallionId: medallionId,
      deletedAt: null,
    },
  });

  if (tributeFound) {
    const tribute = await prisma.tribute.delete({
      where: {
        tributeId: tributeFound.tributeId,
        medallionId: medallionId,
      },
    });
    if (!tribute) {
      return false;
    }
  }
  return true;

  // return { medallion, tributeFound, tribute },
  // {
  //   maxWait: 10000, // 5 seconds max wait to connect to prisma
  //   timeout: 20000, // 20 seconds
  // }
  // })
  // return transactionResult
};

// create tribute review by user
export const createReviewToTribute = ({ tributeId, images, review, email }) => {
  return prisma.memoryWall.create({
    data: {
      tributeId: tributeId,
      images: images,
      review: review,
      email: email,
    },
  });
};

// get memory wall tribute reviews
export const findMemoryWalls = (tributeId, limit, offset, status) => {
  let data = {};
  if (status === undefined || status === "undefined") {
    data = {
      tributeId: tributeId,
      deletedAt: null,
    };
  } else {
    data = {
      tributeId: tributeId,
      deletedAt: null,
      status: true,
    };
  }
  return prisma.memoryWall.findMany({
    where: data,
    orderBy: {
      createdAt: "desc",
    },
    take: +limit,
    skip: +offset,
  });
};

// update memory wall status
export const updateMemoryWallStatus = ({ memoryWallId, status, images }) => {
  return prisma.memoryWall.update({
    where: {
      memoryWallId: memoryWallId,
      deletedAt: null,
    },
    data: {
      status: status,
    },
  });
};

export const saveUserMetadata = ({ userId, metadata, medallions }) => {
  const metadataJson = JSON.stringify(metadata);
  const medallionsJson = JSON.stringify(medallions);

  return prisma.shippingDetail.create({
    data: {
      userId: userId,
      metadata: metadataJson,
      medallions: medallionsJson,
    },
  });
};
