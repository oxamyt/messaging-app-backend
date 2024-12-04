import { Router } from "express";
import { sendMessage } from "../controllers/messageController";
import passport from "passport";
const messageRouter = Router();

messageRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  sendMessage
);

export default messageRouter;
