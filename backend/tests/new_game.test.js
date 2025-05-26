const request = require("supertest");
const express = require("express");
const newGameRouter = require("../routes/new_game");

// Mock de la base de données
jest.mock("../config/dbConfig", () => ({
  execute: jest.fn(),
}));
const db = require("../config/dbConfig");

const app = express();
app.use(express.json());
app.use("/new_game", newGameRouter);

describe("POST /new_game/add", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("doit ajouter une nouvelle partie", async () => {
    // Pas de session existante
    db.execute
      .mockResolvedValueOnce([[]]) // SELECT game_session_id FROM Games_session WHERE timestamp = ?
      .mockResolvedValueOnce([[{ game_session_id: "MA01" }]]) // SELECT game_session_id ... DESC LIMIT 1
      .mockResolvedValueOnce([{}]) // INSERT INTO Games_session
      .mockResolvedValueOnce([{}]) // INSERT INTO Bets
      .mockResolvedValueOnce([[{ solde: 100 }]]) // SELECT solde FROM User
      .mockResolvedValueOnce([{}]); // UPDATE User SET solde

    const res = await request(app)
      .post("/new_game/add")
      .send({
        partieId: "p1",
        partieJouee: true,
        solde: 100,
        combinaison: [1, 2, 3],
        joueurId: 1,
        timestamp: 1747922783,
        partieAffichee: true,
        mise: 10,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(db.execute).toHaveBeenCalled();
  });

  it("doit refuser si une session existe déjà", async () => {
    db.execute.mockResolvedValueOnce([[{ game_session_id: "MA01" }]]);
    const res = await request(app)
      .post("/new_game/add")
      .send({
        partieId: "p1",
        partieJouee: true,
        solde: 100,
        combinaison: [1, 2, 3],
        joueurId: 1,
        timestamp: 1747922783,
        partieAffichee: true,
        mise: 10,
      });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("error");
  });

  it("doit gérer les erreurs de base de données", async () => {
    db.execute.mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app)
      .post("/new_game/add")
      .send({
        partieId: "p1",
        partieJouee: true,
        solde: 100,
        combinaison: [1, 2, 3],
        joueurId: 1,
        timestamp: 1747922783,
        partieAffichee: true,
        mise: 10,
      });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});
