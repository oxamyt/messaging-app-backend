import { Router } from "express";
import {
  sendMessage,
  retrieveMessages,
  sendImage,
  createGroup,
  sendGroupMessage,
  deleteGroupChat,
} from "../controllers/messageController";
import passport from "passport";
const messageRouter = Router();
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

messageRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  sendMessage
);
messageRouter.post(
  "/image",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  sendImage
);
messageRouter.post(
  "/retrieve",
  passport.authenticate("jwt", { session: false }),
  retrieveMessages
);
messageRouter.post(
  "/group",
  passport.authenticate("jwt", { session: false }),
  createGroup
);
messageRouter.post(
  "/:groupId",
  passport.authenticate("jwt", { session: false }),
  sendGroupMessage
);
messageRouter.delete(
  "/:groupId",
  passport.authenticate("jwt", { session: false }),
  deleteGroupChat
);

export default messageRouter;
