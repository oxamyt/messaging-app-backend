import { Request, Response } from "express";
import { findUser, createMessage, fetchMessages } from "./prismaQueries";
import isUser from "../utils/isUser";

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
    const { targetUsername } = req.body;

    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }

    const retrieverId = req.user.id;

    const messages = await fetchMessages({ retrieverId, targetUsername });
    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving messages" });
  }
}

export { sendMessage, retrieveMessages };
