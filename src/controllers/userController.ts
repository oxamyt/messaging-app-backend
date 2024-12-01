import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { createUser, findUser } from "./prismaQueries";
import { UserCredentials } from "../types/types";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.PASSPORT_SECRET!;

function signToken(user: { id: number }) {
  return jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "3h" });
}

async function registerUser(req: Request, res: Response) {
  try {
    const { username, password }: UserCredentials = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({ username, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
  }
}

async function loginUser(req: Request, res: Response) {
  try {
    const { username, password }: UserCredentials = req.body;

    const user = await findUser({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = signToken({ id: user.id });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error during login" });
  }
}

export { registerUser, loginUser };
