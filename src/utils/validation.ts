import { body, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

const validateRegistration = [
  body("username").notEmpty().withMessage("Username is required."),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long."),
];

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

export { validateRegistration, validateRequest };
