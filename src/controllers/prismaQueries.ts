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

async function findUser({ username }: { username: string }) {
  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return;
    }
    return user;
  } catch (err) {
    console.error(err);
  }
}

export { createUser, findUser };
