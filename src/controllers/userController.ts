import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import {
  createUser,
  findUser,
  updateUser,
  fetchUsers,
  fetchUser,
} from "./prismaQueries";
import { UserCredentials, UserProfile } from "../types/types";
import jwt from "jsonwebtoken";
import isUser from "../utils/isUser";

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

export { registerUser, loginUser, putUpdateUser, getUsers, getUser };
