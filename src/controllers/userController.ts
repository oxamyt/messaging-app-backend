import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import prismaQueries from "../../prisma/prismaQueries";
import { UserCredentials } from "../types/types";

async function registerUser(
  req: Request<{}, {}, UserCredentials>,
  res: Response
) {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await prismaQueries.createUser(username, hashedPassword);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  registerUser,
};
