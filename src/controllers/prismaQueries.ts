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

export { createUser, findUser, createMessage, updateUser };
