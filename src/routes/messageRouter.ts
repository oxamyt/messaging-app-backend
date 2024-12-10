import { Router } from "express";
import {
  sendMessage,
  retrieveMessages,
} from "../controllers/messageController";
import passport from "passport";
const messageRouter = Router();

messageRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  sendMessage
);
messageRouter.post(
  "/retrieve",
  passport.authenticate("jwt", { session: false }),
  retrieveMessages
);

export default messageRouter;
