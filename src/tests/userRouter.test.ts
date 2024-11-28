import request from "supertest";
import express from "express";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/auth", userRouter);

describe("User Router", () => {
  it("should register a user", async () => {
    request(app)
      .post("/auth/register")
      .send({ username: "frodo", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);
  });
});
