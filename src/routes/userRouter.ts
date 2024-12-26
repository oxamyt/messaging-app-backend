import { Router } from "express";
import {
  registerUser,
  loginUser,
  putUpdateUser,
  getUsers,
  getUser,
  uploadAvatar,
} from "../controllers/userController";
import { validateRegistration, validateRequest } from "../utils/validation";
import passport from "passport";
import multer from "multer";

const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

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
userRouter.patch(
  "/update-avatar",
  passport.authenticate("jwt", { session: false }),
  upload.single("avatar"),
  uploadAvatar
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
