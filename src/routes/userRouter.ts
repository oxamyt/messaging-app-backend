import { Router } from "express";
import {
  registerUser,
  loginUser,
  putUpdateUser,
} from "../controllers/userController";
import { validateRegistration, validateRequest } from "../utils/validation";
import passport from "passport";

const userRouter = Router();

userRouter.post(
  "/register",
  validateRegistration,
  validateRequest,
  registerUser
);
userRouter.post("/login", loginUser);
userRouter.put(
  "/update",
  passport.authenticate("jwt", { session: false }),
  putUpdateUser
);

export default userRouter;
