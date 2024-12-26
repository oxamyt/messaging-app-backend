import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import {
  createUser,
  findUser,
  updateUser,
  fetchUsers,
  fetchUser,
  loadAvatar,
} from "./prismaQueries";
import { UserCredentials, UserProfile } from "../types/types";
import jwt from "jsonwebtoken";
import isUser from "../utils/isUser";
import cloudinary from "../utils/cloudinary";

const jwtSecret = process.env.PASSPORT_SECRET!;

function signToken(user: { id: number }) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "3h" });
}

async function registerUser(req: Request, res: Response) {
  try {
    const { username, password }: UserCredentials = req.body;

    const user = await findUser({ userdata: username });

    if (user) {
      res.status(400).json({ message: "Username already exists." });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser({ username, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ message: "Error creating a user" });
      }
      res
        .status(201)
        .json({ message: "User registered successfully!", userId: user.id });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
}

async function loginUser(req: Request, res: Response) {
  try {
    const { username, password }: UserCredentials = req.body;

    const user = await findUser({ userdata: username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = signToken({ id: user.id });

    res.status(200).json({ token, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error during login" });
  }
}

async function putUpdateUser(req: Request, res: Response) {
  try {
    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }
    const { bio, avatarUrl, username }: UserProfile = req.body;

    const userId = req.user.id;

    const updatedUser = await updateUser({
      bio,
      avatarUrl,
      id: userId,
      username,
    });

    if (!updatedUser) {
      return res.status(401).json({ message: "Invalid user" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully!", bio: updatedUser.bio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error during updating" });
  }
}

async function getUsers(req: Request, res: Response) {
  try {
    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }

    const userId = req.user.id;

    const users = await fetchUsers({ userId });

    if (!users) {
      return res.status(401).json({ message: "Error fetching users" });
    }

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error during updating" });
  }
}

async function getUser(req: Request, res: Response) {
  try {
    if (!isUser(req)) {
      return res.status(400).json({ message: "Sender not authenticated" });
    }

    const userStringId = req.params.id;

    const userId = parseInt(userStringId);

    const user = await fetchUser({ userId });

    if (!user) {
      return res.status(401).json({ message: "Error fetching user" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error during updating" });
  }
}

async function uploadAvatar(req: Request, res: Response) {
  console.log("sss");
  try {
    if (!isUser(req)) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Only images are allowed." });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "avatars" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });

    if (!result) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const userId = req.user.id;
    const user = await fetchUser({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const avatarUrl = (result as any).secure_url;
    await loadAvatar({ userId, avatarUrl });

    return res.status(200).json({
      message: "Avatar updated successfully",
      avatarUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

export {
  registerUser,
  loginUser,
  putUpdateUser,
  getUsers,
  getUser,
  uploadAvatar,
};
