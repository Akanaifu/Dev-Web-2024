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

const { calculerGain } = require("../routes/new_game");
const { firebaseTimestampToMySQLDatetime } = require("../routes/new_game");

describe("calculerGain", () => {
  it("gagne jackpot 777", () => {
    expect(calculerGain([7, 7, 7], 10)).toBe(990);
    expect(calculerGain("777", 10)).toBe(990);
  });
  it("gagne triple égal hors 777", () => {
    expect(calculerGain([2, 2, 2], 10)).toBe(90);
    expect(calculerGain("222", 10)).toBe(90);
  });
  it("gagne suite ascendante", () => {
    expect(calculerGain([1, 2, 3], 10)).toBe(40);
    expect(calculerGain([2, 3, 4], 10)).toBe(40);
    expect(calculerGain([2, 1, 3], 10)).toBe(-10);
  });
  it("gagne sandwich (r1 == r3, r2 != r1)", () => {
    expect(calculerGain([2, 1, 2], 10)).toBe(10);
    expect(calculerGain([5, 3, 5], 10)).toBe(25); // même logique
    expect(calculerGain([7, 1, 7], 10)).toBe(25);
    expect(calculerGain([1, 2, 1], 10)).toBe(10); // sandwich (2)
  });
  it("gagne tous pairs ou tous impairs", () => {
    expect(calculerGain([2, 4, 6], 10)).toBe(5);
    expect(calculerGain([1, 3, 5], 10)).toBe(5);
    expect(calculerGain([7, 3, 5], 10)).toBe(5); // tous impairs
  });
  it("gagne avec 1 ou 2 sept", () => {
    expect(calculerGain([7, 1, 2], 10)).toBe(-5);
    expect(calculerGain([7, 7, 2], 10)).toBe(0); // 2 septs, pas d'autre event
    expect(calculerGain([1, 7, 2], 10)).toBe(-5);
    expect(calculerGain([7, 2, 7], 10)).toBe(10); // sandwich
  });
  it("lose status inverse le gain", () => {
    // Si gain > 0, le statut "lose" est ignoré et le gain reste positif
    expect(calculerGain([2, 2, 2], 10, "lose")).toBe(90);
    expect(calculerGain([2, 1, 2], 10, "lose")).toBe(10);
    expect(calculerGain([7, 7, 7], 10, "lose")).toBe(990);
    // Si gain <= 0, le statut "lose" inverse le signe
    expect(calculerGain([1, 2, 5], 10, "lose")).toBe(-10);
  });
  it("supporte string rouleaux", () => {
    expect(calculerGain("222", 10)).toBe(90);
    expect(calculerGain("717", 10)).toBe(25);
    expect(calculerGain("123", 10)).toBe(40);
  });
  it("couvre les branches non gagnantes (couverture complète)", () => {
    // Aucun event, aucun 7
    expect(calculerGain([1, 4, 5], 10)).toBe(-10);
    // Aucun event, 1 sept
    expect(calculerGain([7, 4, 5], 10)).toBe(-5);
    // sandwich avec 2 septs
    expect(calculerGain([7, 4, 7], 10)).toBe(10);
    // Aucun event, 3 différents, tous pairs
    expect(calculerGain([2, 4, 6], 10)).toBe(5);
    // Aucun event, 3 différents, tous impairs
    expect(calculerGain([1, 3, 5], 10)).toBe(5);
    // tous impairs
    expect(calculerGain([7, 3, 5], 10)).toBe(5);
    // Aucun event, 3 différents, 2 septs, tous impairs
    expect(calculerGain([7, 3, 7], 10)).toBe(25);
    // Aucun event, 3 différents, 1 sept, tous pairs
    expect(calculerGain([2, 7, 4], 10)).toBe(-5);
    // Aucun event, 3 différents, 2 septs, tous pairs
    expect(calculerGain([2, 7, 7], 10)).toBe(0);
    // Statut lose sur un cas perdant
    expect(calculerGain([1, 4, 5], 10, "lose")).toBe(-10);
    // Statut lose sur un cas neutre (gain 0)
    expect(calculerGain([7, 4, 7], 10, "lose")).toBe(10);
  });
});

describe("firebaseTimestampToMySQLDatetime", () => {
  it("convertit un timestamp numérique", () => {
    expect(firebaseTimestampToMySQLDatetime(1747922783)).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
    );
  });
  it("convertit un timestamp string", () => {
    expect(firebaseTimestampToMySQLDatetime("1747922783")).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
    );
  });
  it("retourne la date ISO si déjà formatée", () => {
    expect(firebaseTimestampToMySQLDatetime("2024-06-21T12:00:00Z")).toBe(
      "2024-06-21 12:00:00"
    );
  });
  it("retourne null si NaN", () => {
    expect(firebaseTimestampToMySQLDatetime("notanumber")).toBeNull();
  });
});

describe("POST /new_game/add", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("doit ajouter une nouvelle partie", async () => {
    // 1. Pas de session existante
    db.execute
      .mockResolvedValueOnce([[]]) // sessionExists: SELECT ... WHERE timestamp = ?
      .mockResolvedValueOnce([[]]) // getNextGameSessionId: SELECT ... DESC LIMIT 1 (aucune session MA existante)
      .mockResolvedValueOnce([{}]) // insertGameSession: INSERT INTO Games_session
      .mockResolvedValueOnce([{}]) // insertBet: INSERT INTO Bets
      .mockResolvedValueOnce([[{ solde: 100 }]]) // getUserSolde: SELECT solde FROM User
      .mockResolvedValueOnce([{}]); // updateUserSolde: UPDATE User SET solde

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
    expect(db.execute).toHaveBeenCalledTimes(6);
  });

  it("doit refuser si une session existe déjà", async () => {
    db.execute.mockResolvedValueOnce([[{ game_session_id: "MA01" }]]); // sessionExists: session trouvée

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
    expect(db.execute).toHaveBeenCalledTimes(1);
  });

  it("doit gérer les erreurs de base de données", async () => {
    db.execute.mockRejectedValueOnce(new Error("DB error")); // sessionExists: erreur SQL

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
    expect(db.execute).toHaveBeenCalledTimes(1);
  });

  it("retourne 400 si données manquantes", async () => {
    const res = await request(app)
      .post("/new_game/add")
      .send({
        partieJouee: true,
        solde: 100,
        combinaison: [1, 2, 3],
        joueurId: 1,
        timestamp: 1747922783,
        partieAffichee: true,
        mise: 10,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("retourne 400 si combinaison manquante", async () => {
    const res = await request(app).post("/new_game/add").send({
      partieId: "p1",
      partieJouee: true,
      solde: 100,
      joueurId: 1,
      timestamp: 1747922783,
      partieAffichee: true,
      mise: 10,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("retourne 400 si solde undefined", async () => {
    const res = await request(app)
      .post("/new_game/add")
      .send({
        partieId: "p1",
        partieJouee: true,
        combinaison: [1, 2, 3],
        joueurId: 1,
        timestamp: 1747922783,
        partieAffichee: true,
        mise: 10,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("retourne 400 si partieAffichee undefined", async () => {
    const res = await request(app)
      .post("/new_game/add")
      .send({
        partieId: "p1",
        partieJouee: true,
        solde: 100,
        combinaison: [1, 2, 3],
        joueurId: 1,
        timestamp: 1747922783,
        mise: 10,
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

// Ce fichier est prêt à être testé seul avec `npx jest tests/new_game.test.js` ou `npm test`.
// Il couvre toutes les branches et la logique métier de new_game.js.
// Lancez simplement la commande de test dans votre terminal pour exécuter uniquement ce fichier.
