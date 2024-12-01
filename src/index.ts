import express, { Request, Response } from "express";
import userRouter from "./routes/userRouter";
import { initializePassport } from "./utils/passportConfig";
import passport from "passport";

initializePassport(passport);

const app = express();
const port = 3000;

app.use(passport.initialize());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/auth", userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
