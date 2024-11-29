import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { UserCredentials } from "../src/types/types";

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
