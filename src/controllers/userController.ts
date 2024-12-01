import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { createUser } from "./prismaQueries";
import { UserCredentials } from "../types/types";

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

export { registerUser };
