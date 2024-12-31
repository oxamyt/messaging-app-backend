import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDatabase() {
  await prisma.message.deleteMany({});
  await prisma.groupChat.deleteMany({});
  await prisma.user.deleteMany({});
}

export { cleanupDatabase };
