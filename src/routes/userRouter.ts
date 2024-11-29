import { Router } from "express";
import userController from "../controllers/useController";

const userRouter = Router();

userRouter.post("/", userController.registerUser);
