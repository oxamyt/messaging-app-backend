import { Router } from "express";
import {
  registerUser,
  loginUser,
  putUpdateUser,
  getUsers,
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
userRouter.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  getUsers
);

export default userRouter;
