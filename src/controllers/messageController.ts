import { Request, Response } from "express";
import { findUser, createMessage } from "./prismaQueries";

function isUser(req: Request): req is Request & { user: { id: number } } {
  return req.user !== undefined;
}

async function sendMessage(req: Request, res: Response) {
  try {
    const { receiverId, receiverUsername, content } = req.body;

    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }

    const senderId = req.user.id;

    let receiver;
    if (receiverId) {
      receiver = await findUser({ userdata: receiverId });
    } else if (receiverUsername) {
      receiver = await findUser({ userdata: receiverUsername });
    } else {
      return res
        .status(400)
        .json({ message: "Receiver ID or username must be provided" });
    }

    const sender = await findUser({ userdata: senderId });

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await createMessage({
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

export { sendMessage };
