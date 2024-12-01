import request from "supertest";
import express from "express";
import userRouter from "../routes/userRouter";
import { describe, it, expect } from "vitest";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/auth", userRouter);

describe("User Router", () => {
  it("should register a user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ username: "frodo", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body.message).toBe("User registered successfully!");
  });

  it("should login a user and return a JWT token", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "mike", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "mike", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(loginResponse.body.token).toBeDefined();
    expect(typeof loginResponse.body.token).toBe("string");
    expect(loginResponse.body.token.length).toBeGreaterThan(0);
  });
});
