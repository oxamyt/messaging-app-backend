import request from "supertest";
import express from "express";
import userRouter from "../routes/userRouter";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { cleanupDatabase } from "../utils/cleanupDatabase";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/auth", userRouter);

describe("User Router", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  it("should register a user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ username: "frodo", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body.message).toBe("User registered successfully!");
  });

  it("should not register a user with an existing username", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "frodo", password: "password123" })
      .expect(201);

    const response = await request(app)
      .post("/auth/register")
      .send({ username: "frodo", password: "password123" })
      .expect(400);

    expect(response.body.message).toBe("Username already exists.");
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

  it("should not register a user with an invalid password", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ username: "sam", password: "" })
      .expect(400);

    expect(response.body.message).toBe(
      "Password must be at least 4 characters long."
    );
  });

  it("should not login a user with wrong password", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "sam", password: "password123" })
      .expect(201);

    const response = await request(app)
      .post("/auth/login")
      .send({ username: "sam", password: "wrongpassword" })
      .expect(401);

    expect(response.body.message).toBe("Invalid username or password");
  });
});
