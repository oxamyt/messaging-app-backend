import { Request, Response } from "express";
import {
  findUser,
  createMessage,
  fetchMessages,
  fetchUser,
  createGroupChat,
  createGroupMessage,
  fetchGroupChat,
  removeGroupChat,
  fetchGroupMessages,
  fetchGroupChats,
} from "./prismaQueries";
import isUser from "../utils/isUser";
import cloudinary from "../utils/cloudinary";

async function sendMessage(req: Request, res: Response) {
  try {
    const { receiverId, receiverUsername, content } = req.body;

    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }

    const senderId = req.user.id;

    let receiver;
    if (receiverId) {
      receiver = await findUser({ userdata: parseInt(receiverId) });
    } else if (receiverUsername) {
      receiver = await findUser({ userdata: receiverUsername });
    } else {
      return res
        .status(400)
        .json({ message: "Receiver ID or username must be provided" });
    }

    const sender = await findUser({ userdata: senderId });

    if (!sender) {
      console.log("sender error");
      return res.status(404).json({ message: "Sender not found" });
    }

    if (!receiver) {
      console.log("receiver error");
      return res.status(404).json({ message: "Receiver not found" });
    }

    await createMessage({
      senderId: sender.id,
      receiverId: receiver.id,
      content,
    });

    res.status(201).json({
      message: "Message sent successfully!",
      content,
    });
  } catch (err) {
    console.error("Error during message sending:", err);
    res
      .status(500)
      .json({ message: "Internal server error during message sending" });
  }
}

async function retrieveMessages(req: Request, res: Response) {
  try {
    const { targetId } = req.body;

    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }

    const retrieverId = req.user.id;

    const targetIdNumber = parseInt(targetId);

    const messages = await fetchMessages({ retrieverId, targetIdNumber });
    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving messages" });
  }
}

async function sendImage(req: Request, res: Response) {
  const receiverIdString = req.body.receiverId;

  const receiverId = parseInt(receiverIdString);

  try {
    if (!isUser(req)) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Only images are allowed." });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "images" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });

    if (!result) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const userId = req.user.id;

    const senderUser = await fetchUser({ userId });
    if (!senderUser) {
      return res.status(404).json({ message: "Sender user not found" });
    }

    const receiverUser = await fetchUser({ userId: receiverId });
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    const imageUrl = (result as any).secure_url;

    const senderId = req.user.id;
    await createMessage({
      senderId,
      receiverId,
      content: imageUrl,
    });

    return res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

async function createGroup(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!isUser(req)) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const userId = req.user.id;
    const groupChat = await createGroupChat({ name, userId });
    res
      .status(201)
      .json({ groupChat, message: "Group Chat created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating group chat" });
  }
}

async function sendGroupMessage(req: Request, res: Response) {
  try {
    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }

    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const numberGroupId = parseInt(groupId);
    const groupChat = await fetchGroupChat({ groupId: numberGroupId });
    if (!groupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }
    const messageContent = await createGroupMessage({
      content,
      groupId: numberGroupId,
      userId,
    });

    if (!messageContent) {
      return res
        .status(404)
        .json({ message: "Could not send a message to group chat" });
    }

    res
      .status(201)
      .json({ messageContent, message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message to group chat" });
  }
}

async function deleteGroupChat(req: Request, res: Response) {
  try {
    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }
    const { groupId } = req.params;
    const userId = req.user.id;
    const numberGroupId = parseInt(groupId);
    const groupChat = await fetchGroupChat({ groupId: numberGroupId });

    if (groupChat) {
      if (groupChat.creatorId !== userId) {
        return res
          .status(404)
          .json({ message: "You are not a creator of group chat" });
      }

      await removeGroupChat({ groupId: numberGroupId });

      res.status(201).json({ message: "Group Chat deleted successfully!" });
    } else {
      return res.status(404).json({ message: "Group Chat does not exist" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message to group chat" });
  }
}

async function getGroupMessages(req: Request, res: Response) {
  try {
    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }
    const { groupId } = req.params;
    const numberGroupId = parseInt(groupId);
    const groupChat = await fetchGroupChat({ groupId: numberGroupId });

    if (groupChat) {
      const messages = await fetchGroupMessages({ groupId: numberGroupId });

      res.status(200).json({ messages });
    } else {
      return res.status(404).json({ message: "Group Chat does not exist" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching message to group chat" });
  }
}

async function getGroupChats(req: Request, res: Response) {
  try {
    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }

    const groupChats = await fetchGroupChats();

    res.status(200).json({ groupChats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching message to group chat" });
  }
}

export {
  sendMessage,
  retrieveMessages,
  sendImage,
  createGroup,
  sendGroupMessage,
  deleteGroupChat,
  getGroupMessages,
  getGroupChats,
};
