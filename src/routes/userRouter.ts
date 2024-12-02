import { Router } from "express";
import { registerUser, loginUser } from "../controllers/userController";
import { validateRegistration, validateRequest } from "../utils/validation";
const userRouter = Router();

userRouter.post(
  "/register",
  validateRegistration,
  validateRequest,
  registerUser
);
userRouter.post("/login", loginUser);

export default userRouter;
