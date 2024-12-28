import { Request, Response } from "express";
import {
  findUser,
  createMessage,
  fetchMessages,
  fetchUser,
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

export { sendMessage, retrieveMessages, sendImage };
