import { Router } from "express";
import {
  registerUser,
  loginUser,
  putUpdateUser,
  getUsers,
  getUser,
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
userRouter.get(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  getUser
);

export default userRouter;
