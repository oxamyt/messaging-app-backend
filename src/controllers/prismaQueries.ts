import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { UserCredentials } from "../types/types";

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

export { createUser, findUser, createMessage };
