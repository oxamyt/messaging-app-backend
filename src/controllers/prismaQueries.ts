import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { UserCredentials, UserProfile } from "../types/types";

async function createUser({ username, password }: UserCredentials) {
  try {
    return await prisma.user.create({
      data: {
        username,
        password,
      },
    });
  } catch (err) {
    console.error(err);
  }
}

async function findUser({ userdata }: { userdata: string | number }) {
  try {
    const findCondition =
      typeof userdata === "number" ? { id: userdata } : { username: userdata };

    const user = await prisma.user.findUnique({ where: findCondition });

    if (!user) {
      return;
    }
    return user;
  } catch (err) {
    console.error(err);
  }
}

async function createMessage({
  senderId,
  receiverId,
  content,
}: {
  senderId: number;
  receiverId: number;
  content: string;
}) {
  return prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
    },
  });
}

async function updateUser({ bio, avatarUrl, id }: UserProfile) {
  try {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
      },
    });
  } catch (err) {
    console.error(err);
  }
}

async function fetchMessages({
  retrieverId,
  targetIdNumber,
}: {
  retrieverId: number;
  targetIdNumber: number;
}) {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetIdNumber },
    });

    if (!targetUser) {
      return { message: "Target user not found" };
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: retrieverId, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: retrieverId },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return messages;
  } catch (err) {
    console.error(err);
    return { message: "Error retrieving messages" };
  }
}

async function fetchUsers({ userId }: { userId: number }) {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export {
  createUser,
  findUser,
  createMessage,
  updateUser,
  fetchMessages,
  fetchUsers,
};
