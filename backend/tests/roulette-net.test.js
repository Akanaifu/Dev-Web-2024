// Importation des modules nécessaires pour les tests
const request = require("supertest"); // Pour tester les endpoints HTTP
const express = require("express"); // Framework web Express
const rouletteNetRouter = require("../routes/roulette-net"); // Le router de roulette à tester
const rouletteNetPrepareBettingBoard = require("../routes/roulette-net-prepareBettingBoard"); // Router pour le plateau de mise

// Mock de la base de données pour éviter les vraies connexions DB pendant les tests
// Cela permet d'isoler les tests et de contrôler les réponses de la base de données
jest.mock("../config/dbConfig", () => ({
  query: jest.fn(), // Mock de la fonction query
}));
const db = require("../config/dbConfig");

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json()); // Middleware pour parser le JSON
app.use("/api/roulette", rouletteNetRouter); // Montage du router de roulette
app.use("/api/roulette-odds", rouletteNetPrepareBettingBoard.router); // Montage du router de configuration

describe("Tests des routes Roulette-Net", () => {
  // Variable pour stocker la référence originale de Math.random
  let originalMathRandom;

  // Sauvegarde de la fonction Math.random originale avant tous les tests
  beforeAll(() => {
    originalMathRandom = Math.random;
  });

  // Nettoyage des mocks après chaque test pour éviter les interférences
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Restauration de Math.random après tous les tests
  afterAll(() => {
    Math.random = originalMathRandom;
  });

  // ===== TESTS DE LA ROUTE /spin =====
  describe("POST /api/roulette/spin", () => {
    // Test de la couleur rouge avec le numéro 14
    it("doit retourner la couleur 'red' pour le numéro 14", async () => {
      // Mock pour générer exactement le numéro 14 (rouge)
      Math.random = jest.fn(() => 14 / 37);

      const res = await request(app)
        .post("/api/roulette/spin")
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body.number).toBe(14);
      expect(res.body.color).toBe("red");
    });

    // Test de la couleur noire avec le numéro 8
    it("doit retourner la couleur 'black' pour le numéro 8", async () => {
      // Mock pour générer exactement le numéro 8 (noir)
      Math.random = jest.fn(() => 8 / 37);

      const res = await request(app)
        .post("/api/roulette/spin")
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body.number).toBe(8);
      expect(res.body.color).toBe("black");
    });

    // Test de la couleur verte avec le numéro 0
    it("doit retourner la couleur 'green' pour le numéro 0", async () => {
      // Mock pour générer exactement le numéro 0 (vert)
      Math.random = jest.fn(() => 0);

      const res = await request(app)
        .post("/api/roulette/spin")
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body.number).toBe(0);
      expect(res.body.color).toBe("green");
    });

    // Test avec un autre numéro rouge (numéro 1)
    it("doit retourner la couleur 'red' pour le numéro 1", async () => {
      // Mock pour générer exactement le numéro 1 (rouge)
      Math.random = jest.fn(() => 1 / 37);

      const res = await request(app)
        .post("/api/roulette/spin")
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body.number).toBe(1);
      expect(res.body.color).toBe("red");
    });

    // Test avec un autre numéro noir (numéro 22)
    it("doit retourner la couleur 'black' pour le numéro 22", async () => {
      // Mock pour générer exactement le numéro 22 (noir)
      Math.random = jest.fn(() => 22 / 37);

      const res = await request(app)
        .post("/api/roulette/spin")
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body.number).toBe(22);
      expect(res.body.color).toBe("black");
    });

    // Test du numéro maximum (36) qui est rouge
    it("doit retourner la couleur 'red' pour le numéro 36", async () => {
      // Mock pour générer exactement le numéro 36 (rouge)
      Math.random = jest.fn(() => 36 / 37);

      const res = await request(app)
        .post("/api/roulette/spin")
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body.number).toBe(36);
      expect(res.body.color).toBe("red");
    });

    // Test que la réponse contient les bonnes propriétés
    it("doit retourner un objet avec les propriétés number et color", async () => {
      // Test avec le numéro 25 (rouge)
      Math.random = jest.fn(() => 25 / 37);

      const res = await request(app)
        .post("/api/roulette/spin")
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("number");
      expect(res.body).toHaveProperty("color");
      expect(typeof res.body.number).toBe("number");
      expect(typeof res.body.color).toBe("string");
      expect(res.body.number).toBe(25);
      expect(res.body.color).toBe("red");
    });
  });

  // ===== TESTS DE LA ROUTE /win =====
  describe("POST /api/roulette/win", () => {
    // Test du cas nominal : calcul des gains avec mise gagnante sur le numéro 7
    it("doit calculer les gains correctement pour une mise gagnante sur le numéro 7", async () => {
      // Mock de la vérification du solde en base de données
      db.query
        .mockResolvedValueOnce([[{ solde: 1000 }]]) // SELECT du solde utilisateur
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE du solde

      // Configuration d'une mise sur le numéro 7 qui va gagner
      const bets = [
        {
          label: "7",
          numbers: "7",
          type: "inside_whole",
          odds: 36,
          amt: 10 // Mise de 10
        }
      ];

      // Exécution de la requête avec le numéro gagnant 7
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 7,
          bets: bets,
          solde: 1000,
          userId: 1
        });

      // Vérifications des résultats attendus
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("winValue");
      expect(res.body).toHaveProperty("payout");
      expect(res.body).toHaveProperty("newsolde");
      expect(res.body).toHaveProperty("betTotal");
      
      // Calcul attendu : gain = 36 * 10 = 360, payout = 360 - 0 = 360
      expect(res.body.winValue).toBe(360); // Gain total
      expect(res.body.payout).toBe(360); // Gain net (gain - mise)
      expect(res.body.betTotal).toBe(10); // Total des mises
      expect(res.body.newsolde).toBe(1360); // 1000 + 350
    });

    // Test d'une mise perdante : mise sur 15 mais le 23 sort
    it("doit calculer les pertes correctement pour une mise perdante", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 1000 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const bets = [
        {
          label: "15",
          numbers: "15",
          type: "inside_whole",
          odds: 36,
          amt: 10
        }
      ];

      // Le numéro gagnant est 23, la mise sur 15 perd
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 23,
          bets: bets,
          solde: 1000,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(0); // Aucun gain
      expect(res.body.payout).toBe(-10); // Perte de la mise
      expect(res.body.newsolde).toBe(990); // 1000 - 10
    });

    // Test des paris sur rouge avec le numéro 3 (rouge)
    it("doit calculer correctement les gains sur rouge avec le numéro 3", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 500 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const bets = [
        {
          label: "Rouge",
          numbers: "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36",
          type: "outside_color",
          odds: 2,
          amt: 20
        }
      ];

      // Le numéro 3 (rouge) gagne
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 3,
          bets: bets,
          solde: 500,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(40); // 2 * 20
      expect(res.body.payout).toBe(40); // 40 - 0
      expect(res.body.newsolde).toBe(540); // 500 + 40
    });

    // Test des paris sur noir avec le numéro 6 (noir)
    it("doit calculer correctement les gains sur noir avec le numéro 6", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 800 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const bets = [
        {
          label: "Noir",
          numbers: "2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35",
          type: "outside_color",
          odds: 2,
          amt: 25
        }
      ];

      // Le numéro 6 (noir) gagne
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 6,
          bets: bets,
          solde: 800,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(50); // 2 * 25
      expect(res.body.payout).toBe(50); // 50 - 0
      expect(res.body.newsolde).toBe(850); // 800 + 50
    });

    // Test des paris sur pair avec le numéro 18 (pair)
    it("doit calculer correctement les gains sur pair avec le numéro 18", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 300 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const bets = [
        {
          label: "Pair",
          numbers: "2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36",
          type: "outside_even",
          odds: 2,
          amt: 15
        }
      ];

      // Le numéro 18 (pair) gagne
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 18,
          bets: bets,
          solde: 300,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(30); // 2 * 15
      expect(res.body.payout).toBe(30); // 30 - 0
      expect(res.body.newsolde).toBe(330); // 300 + 30
    });

    // Test des paris sur impair avec le numéro 13 (impair)
    it("doit calculer correctement les gains sur impair avec le numéro 13", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 600 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const bets = [
        {
          label: "Impair",
          numbers: "1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35",
          type: "outside_odd",
          odds: 2,
          amt: 30
        }
      ];

      // Le numéro 13 (impair) gagne
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 13,
          bets: bets,
          solde: 600,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(60); // 2 * 30
      expect(res.body.payout).toBe(60); // 60 - 0
      expect(res.body.newsolde).toBe(660); // 600 + 60
    });

    // Test de mise multiple : numéro 21 gagne à la fois sur 21 et sur rouge
    it("doit calculer correctement avec plusieurs mises : numéro 21 et rouge", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 1000 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const bets = [
        {
          label: "21",
          numbers: "21",
          type: "inside_whole",
          odds: 36,
          amt: 5 // Mise sur 21
        },
        {
          label: "Rouge",
          numbers: "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36",
          type: "outside_color",
          odds: 2,
          amt: 10 // Mise sur rouge
        }
      ];

      // Le numéro 21 (rouge) gagne les deux mises
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 21,
          bets: bets,
          solde: 1000,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
     

     
      expect(res.body.winValue).toBe(200); // Gains attendus : (36 * 5) + (2 * 10) = 180 + 20 = 200
      expect(res.body.betTotal).toBe(15);  // Total des mises : 5 + 10 = 15
      expect(res.body.payout).toBe(200); // Payout net : 200 - 0 = 200
      expect(res.body.newsolde).toBe(1200);
    });

    // Test de validation : données invalides
    it("doit rejeter les données invalides", async () => {
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          // winningSpin manquant
          bets: [],
          solde: 1000
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: "Données invalides. Veuillez fournir un numéro gagnant, des mises et la valeur de la banque."
      });
    });

    // Test de validation : winningSpin undefined
    it("doit rejeter winningSpin undefined", async () => {
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: undefined,
          bets: [],
          solde: 1000
        });

      expect(res.statusCode).toBe(400);
    });

    // Test de validation : bets n'est pas un tableau
    it("doit rejeter si bets n'est pas un tableau", async () => {
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 7,
          bets: "invalid",
          solde: 1000
        });

      expect(res.statusCode).toBe(400);
    });

    // Test de validation : solde undefined
    it("doit rejeter solde undefined", async () => {
      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 7,
          bets: []
          // solde manquant
        });

      expect(res.statusCode).toBe(400);
    });

    // Test de gestion d'erreur : erreur de base de données
    it("doit gérer les erreurs de base de données", async () => {
      // Simulation des appels DB : premier réussit, deuxième échoue
      db.query
        .mockResolvedValueOnce([[{ solde: 1000 }]]) // SELECT du solde réussit
        .mockRejectedValueOnce(new Error("DB connection error")); // UPDATE échoue

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 7,
          bets: [],
          solde: 1000,
          userId: 1
        });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        message: "Erreur lors du calcul des gains"
      });
    });
  });

  // ===== TESTS DE LA ROUTE /betting-board =====
  describe("GET /api/roulette-odds/betting-board", () => {
    // Test de récupération de la configuration du plateau
    it("doit retourner la configuration complète du plateau de mise", async () => {
      const res = await request(app)
        .get("/api/roulette-odds/betting-board");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("outsideBets");
      expect(res.body).toHaveProperty("numberBoardRows");
      expect(res.body).toHaveProperty("zeroCell");
      expect(res.body).toHaveProperty("columnBets");
      expect(res.body).toHaveProperty("dozenBets");
      expect(res.body).toHaveProperty("evenOddRedBlack");

      // Vérification de la structure des paris externes
      expect(Array.isArray(res.body.outsideBets)).toBe(true);
      expect(res.body.outsideBets.length).toBe(2); // 1-18 et 19-36

      // Vérification de la cellule zéro
      expect(res.body.zeroCell).toEqual({
        label: "0",
        numbers: [0],
        type: "zero",
        odds: 36
      });

      // Vérification que les lignes de numéros sont bien structurées
      expect(Array.isArray(res.body.numberBoardRows)).toBe(true);
      expect(res.body.numberBoardRows.length).toBe(12); // 12 lignes
      expect(res.body.numberBoardRows[0].length).toBe(3); // 3 colonnes par ligne
    });

    // Test de la cohérence des données
    it("doit avoir des cotes cohérentes pour les différents types de mises", async () => {
      const res = await request(app)
        .get("/api/roulette-odds/betting-board");

      // Vérification des cotes des paris externes (1-18, 19-36)
      res.body.outsideBets.forEach(bet => {
        expect(bet.odds).toBe(2);
        expect(bet.numbers.length).toBe(18);
      });

      // Vérification des cotes des colonnes
      res.body.columnBets.forEach(bet => {
        expect(bet.odds).toBe(3);
        expect(bet.numbers.length).toBe(12);
      });

      // Vérification des cotes des douzaines
      res.body.dozenBets.forEach(bet => {
        expect(bet.odds).toBe(3);
        expect(bet.numbers.length).toBe(12);
      });
    });
  });
});
