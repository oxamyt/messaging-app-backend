import request from "supertest";
import express from "express";
import userRouter from "../routes/userRouter";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { cleanupDatabase } from "../utils/cleanupDatabase";
import messageRouter from "../routes/messageRouter";
import passport from "passport";
import { initializePassport } from "../utils/passportConfig";

initializePassport(passport);

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(express.json());
app.use("/auth", userRouter);
app.use("/message", messageRouter);

describe("Message Router", async () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  it("should send a message between two users", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    await request(app)
      .post("/auth/register")
      .send({ username: "billy", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();
    console.log("Login Token:", token);

    const messageResponse = await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${token}`)
      .send({ receiverUsername: "billy", content: "Hello Billy!" })
      .expect(201);

    expect(messageResponse.body.message).toBe("Message sent successfully!");
    expect(messageResponse.body.content).toBe("Hello Billy!");
  });

  it("should retrieve messages between two users", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const billyRegisterResponse = await request(app)
      .post("/auth/register")
      .send({ username: "billy", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const billyId = billyRegisterResponse.body.userId;
    expect(billyId).toBeDefined();

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${token}`)
      .send({ receiverId: billyId, content: "Hello Billy!" })
      .expect(201);

    await request(app)
      .post("/message")
      .set("Authorization", `Bearer ${token}`)
      .send({ receiverId: billyId, content: "How are you?" })
      .expect(201);

    const messagesResponse = await request(app)
      .post("/message/retrieve")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: billyId })
      .expect(200);

    expect(messagesResponse.body.messages[0].content).toBe("Hello Billy!");
    expect(messagesResponse.body.messages[1].content).toBe("How are you?");
  });
});
