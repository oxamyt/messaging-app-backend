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

async function updateUser({ bio, avatarUrl, id, username }: UserProfile) {
  try {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(username && { username }),
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
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: retrieverId, receiverId: targetIdNumber },
          { senderId: targetIdNumber, receiverId: retrieverId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
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

async function fetchUser({ userId }: { userId: number }) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}

async function loadAvatar({
  userId,
  avatarUrl,
}: {
  userId: number;
  avatarUrl: string;
}) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    return updatedUser;
  } catch (err) {
    console.error(err);
  }
}

async function createGroupChat({
  name,
  userId,
}: {
  name: string;
  userId: number;
}) {
  try {
    const groupChat = await prisma.groupChat.create({
      data: {
        name,
        creatorId: userId,
      },
    });
    return groupChat;
  } catch (err) {
    console.error(err);
  }
}

async function createGroupMessage({
  content,
  groupId,
  userId,
}: {
  content: string;
  groupId: number;
  userId: number;
}) {
  try {
    const groupMessage = await prisma.message.create({
      data: {
        content,
        groupId,
        senderId: userId,
      },
    });
    return groupMessage;
  } catch (err) {
    console.error(err);
  }
}

async function fetchGroupChat({ groupId }: { groupId: number }) {
  try {
    const groupChat = await prisma.groupChat.findUnique({
      where: {
        id: groupId,
      },
    });
    return groupChat;
  } catch (err) {
    console.error(err);
  }
}

async function removeGroupChat({ groupId }: { groupId: number }) {
  try {
    await prisma.groupChat.delete({
      where: {
        id: groupId,
      },
    });
  } catch (err) {
    console.error(err);
  }
}

export {
  createUser,
  findUser,
  createMessage,
  updateUser,
  fetchMessages,
  fetchUsers,
  fetchUser,
  loadAvatar,
  createGroupChat,
  createGroupMessage,
  fetchGroupChat,
  removeGroupChat,
};
