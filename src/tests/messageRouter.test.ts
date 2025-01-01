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

  it("user should be able to create groupChat", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    const groupChatResponse = await request(app)
      .post("/message/group")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cool Chat" })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(groupChatResponse.body.groupChat.name).toBe("Cool Chat");
    expect(groupChatResponse.body.message).toBe(
      "Group Chat created successfully"
    );
  });

  it("user should be able to send message into groupChat", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    const groupChatResponse = await request(app)
      .post("/message/group")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cool Chat" })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(groupChatResponse.body.groupChat.name).toBe("Cool Chat");
    expect(groupChatResponse.body.message).toBe(
      "Group Chat created successfully"
    );

    const groupId = groupChatResponse.body.groupChat.id;

    const messageGroupResponse = await request(app)
      .post(`/message/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Hi everyone!" })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(messageGroupResponse.body.message).toBe("Message sent successfully");
    expect(messageGroupResponse.body.messageContent.content).toBe(
      "Hi everyone!"
    );
  });

  it("user who created should be able to delete groupChat", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    const groupChatResponse = await request(app)
      .post("/message/group")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cool Chat" })
      .expect("Content-Type", /json/)
      .expect(201);

    const groupId = groupChatResponse.body.groupChat.id;

    const deleteGroupChatResponse = await request(app)
      .delete(`/message/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Hi everyone!" })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(deleteGroupChatResponse.body.message).toBe(
      "Group Chat deleted successfully!"
    );

    const messageGroupResponse = await request(app)
      .post(`/message/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Hi everyone!" })
      .expect("Content-Type", /json/)
      .expect(404);

    expect(messageGroupResponse.body.message).toBe("Group chat not found");
  });

  it("user who did not create should not be able to delete groupChat", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    const groupChatResponse = await request(app)
      .post("/message/group")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cool Chat" })
      .expect("Content-Type", /json/)
      .expect(201);

    const groupId = groupChatResponse.body.groupChat.id;

    await request(app)
      .post("/auth/register")
      .send({ username: "joe", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const joeLoginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "joe", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const joeToken = joeLoginResponse.body.token;

    const deleteGroupChatResponse = await request(app)
      .delete(`/message/${groupId}`)
      .set("Authorization", `Bearer ${joeToken}`)
      .send({ content: "Hi everyone!" })
      .expect("Content-Type", /json/)
      .expect(404);

    expect(deleteGroupChatResponse.body.message).toBe(
      "You are not a creator of group chat"
    );
  });

  it("user should retrieve messages from groupChat", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    const groupChatResponse = await request(app)
      .post("/message/group")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cool Chat" })
      .expect("Content-Type", /json/)
      .expect(201);

    const groupId = groupChatResponse.body.groupChat.id;

    await request(app)
      .post(`/message/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Hi everyone!" })
      .expect("Content-Type", /json/)
      .expect(201);

    const getGroupMessagesResponse = await request(app)
      .get(`/message/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const messages = getGroupMessagesResponse.body.messages;
    expect(messages).toBeDefined();
    expect(Array.isArray(messages)).toBe(true);
    expect(messages).toContainEqual(
      expect.objectContaining({ content: "Hi everyone!" })
    );
  });

  it("user should retrieve all groupChats", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ username: "harry", password: "password123" })
      .expect("Content-Type", /json/)
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    const groupChats = [
      { name: "Cool Chat" },
      { name: "Great Chat" },
      { name: "Monkey Chat" },
    ];

    for (const groupChat of groupChats) {
      await request(app)
        .post("/message/group")
        .set("Authorization", `Bearer ${token}`)
        .send(groupChat)
        .expect("Content-Type", /json/)
        .expect(201);
    }

    const getGroupChatsResponse = await request(app)
      .get("/message/group")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);

    const retrievedGroupChats = getGroupChatsResponse.body.groupChats;
    expect(retrievedGroupChats).toBeDefined();
    expect(Array.isArray(retrievedGroupChats)).toBe(true);
    expect(retrievedGroupChats.length).toBe(groupChats.length);

    for (const groupChat of groupChats) {
      expect(retrievedGroupChats).toContainEqual(
        expect.objectContaining({ name: groupChat.name })
      );
    }
  });
});
