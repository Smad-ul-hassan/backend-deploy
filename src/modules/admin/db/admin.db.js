import prisma from "../../../../config/db.js";

// get all users count
export const findAllUsersCount = () => {
  return prisma.user.count({
    where: {
      role: "user",
      deletedAt: null,
    },
  });
};

// get all medallions count
export const findAllMedallionsCount = () => {
  let date = new Date();
  let currentDateTime = date.toISOString();
  return prisma.medallion.count({
    where: {
      NOT: {
        userId: null,
      },
      deletedAt: null,
      validTill: {
        gt: currentDateTime,
      },
    },
  });
};

// get all new users count
export const findAllNewUsersCount = () => {
  const currentDate = new Date();
  let last30Days = new Date();
  last30Days.setDate(currentDate.getDate() - 30);
  return prisma.user.count({
    where: {
      role: "user",
      createdAt: {
        gte: last30Days,
      },
      deletedAt: null,
    },
  });
};

// get users by joining date
export const findUsersByJoiningDate = async (limit, offset, sort, search) => {
  let data = {};
  if (sort === "createdAt") {
    data.createdAt = "desc";
  } else if (sort === "name") {
    data.name = "asc";
  } else {
    data.createdAt = "desc";
  }
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: "user",
    },
    orderBy: data,
    skip: +offset,
    take: +limit,
    select: {
      userId: true,
      image: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      phone: true,
      role: true,
    },
  });
  if (search) {
    return users?.filter((user) =>
      user?.name?.toLowerCase().includes(search?.toLowerCase())
    );
  }
  return users;
};

export const findAllNewUsers = async (limit, offset, sort, search) => {
  let data = {};
  const currentDate = new Date();
  let last30Days = new Date();
  last30Days.setDate(currentDate.getDate() - 30);
  if (sort === "createdAt") {
    data.createdAt = "desc";
  } else if (sort === "name") {
    data.name = "asc";
  } else {
    data.createdAt = "desc";
  }
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: "user",
      createdAt: {
        gte: last30Days,
      },
    },
    orderBy: data,
    skip: +offset,
    take: +limit,
    select: {
      userId: true,
      image: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      phone: true,
      role: true,
    },
  });
  if (search) {
    return users?.filter((user) =>
      user?.name?.toLowerCase().includes(search?.toLowerCase())
    );
  }
  return users;
};

// find users medallions count by ids
export const findUsersMedallionCount = (ids) => {
  return prisma.medallion.groupBy({
    by: ["userId"],
    where: {
      userId: {
        in: ids,
      },
    },
    _count: {
      userId: true,
    },
  });
};

// find user by id
export const findUserById = (id) => {
  return prisma.user.findUnique({
    where: {
      userId: id,
      role: "user",
      deletedAt: null,
    },
  });
};

// find users by search count
export const findUsersCountBySearch = (limit, offset, search) => {
  return prisma.user.count({
    where: {
      deletedAt: null,
      role: "user",
      OR: [
        {
          name: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
      ],
    },
  });
};

//   find users by search
export const findUsersBySearch = (limit, offset, search) => {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      role: "user",
      OR: [
        {
          name: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
      ],
    },
    take: +limit,
    skip: +offset,
  });
};

//   update user status active / inactive
export const updateUserActiveStatus = (userId, userFound) => {
  return prisma.user.update({
    where: {
      userId: userId,
      role: "user",
      deletedAt: null,
    },
    data: {
      isActive: !userFound.isActive ? true : false,
    },
  });
};
