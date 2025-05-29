const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");
const editCompteRouter = require("../routes/edit-compte");

// Mock de la base de données
jest.mock("../config/dbConfig", () => ({
  execute: jest.fn(),
}));
const db = require("../config/dbConfig");

const app = express();
app.use(express.json());
app.use("/", editCompteRouter);

describe("PUT /edit-compte", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("doit mettre à jour un utilisateur sans mot de passe", async () => {
    db.execute.mockResolvedValueOnce([{}]);
    const res = await request(app)
      .put("/edit-compte")
      .send({ userId: 1, username: "newuser", email: "new@mail.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(db.execute).toHaveBeenCalled();
  });

  it("doit mettre à jour un utilisateur avec mot de passe", async () => {
    db.execute.mockResolvedValueOnce([{}]);
    const res = await request(app)
      .put("/edit-compte")
      .send({
        userId: 1,
        username: "newuser",
        email: "new@mail.com",
        password: "secret",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(db.execute).toHaveBeenCalled();
  });

  it("doit gérer les erreurs de base de données", async () => {
    db.execute.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app)
      .put("/edit-compte")
      .send({ userId: 1, username: "fail", email: "fail@mail.com" });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});
