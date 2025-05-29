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

    // Test sans userId : vérification que le calcul fonctionne sans mise à jour de base
    it("doit calculer les gains sans userId (pas de mise à jour en base)", async () => {
      const bets = [
        {
          label: "Rouge",
          numbers: "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36",
          type: "outside_color",
          odds: 2,
          amt: 50
        }
      ];

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 1, // Rouge
          bets: bets,
          solde: 500
          // Pas de userId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(100); // 2 * 50
      expect(res.body.payout).toBe(100); // 100 - 0
      expect(res.body.newsolde).toBe(600); // 500 + 100
      expect(res.body.betTotal).toBe(50);
      
      // Vérifier qu'aucune requête DB n'a été faite
      expect(db.query).not.toHaveBeenCalled();
    });

    // Test avec userId : vérification du solde en base retourne des données
    it("doit vérifier le solde en base quand userId est fourni", async () => {
      // Mock des appels DB : vérification du solde puis mise à jour
      db.query
        .mockResolvedValueOnce([[{ solde: 750 }]]) // SELECT du solde réussit avec des données
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussit

      const bets = [
        {
          label: "Noir",
          numbers: "2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35",
          type: "outside_color",
          odds: 2,
          amt: 25
        }
      ];

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 2, // Noir
          bets: bets,
          solde: 700,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(50); // 2 * 25
      expect(res.body.payout).toBe(50); // 50 - 0
      expect(res.body.newsolde).toBe(750); // 700 + 50

      // Vérifier que les requêtes DB ont été appelées
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenNthCalledWith(1, "SELECT solde FROM user WHERE user_id = ?", [1]);
      expect(db.query).toHaveBeenNthCalledWith(2, "UPDATE user SET solde = ? WHERE user_id = ?", [750, 1]);
    });

    // Test avec userId : vérification du solde en base retourne un tableau vide
    it("doit gérer le cas où l'utilisateur n'existe pas en base", async () => {
      // Mock des appels DB : vérification du solde ne trouve rien, mais mise à jour continue
      db.query
        .mockResolvedValueOnce([[]]) // SELECT du solde ne trouve aucun utilisateur
        .mockResolvedValueOnce([{ affectedRows: 0 }]); // UPDATE n'affecte aucune ligne

      const bets = [
        {
          label: "0",
          numbers: "0",
          type: "inside_whole",
          odds: 36,
          amt: 10
        }
      ];

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 0, // Le zéro gagne
          bets: bets,
          solde: 300,
          userId: 999 // Utilisateur qui n'existe pas
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(360); // 36 * 10
      expect(res.body.payout).toBe(360); // 360 - 0
      expect(res.body.newsolde).toBe(660); // 300 + 360

      // Vérifier que les requêtes DB ont été appelées malgré l'utilisateur inexistant
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenNthCalledWith(1, "SELECT solde FROM user WHERE user_id = ?", [999]);
      expect(db.query).toHaveBeenNthCalledWith(2, "UPDATE user SET solde = ? WHERE user_id = ?", [660, 999]);
    });

    // Test avec erreur lors de la vérification du solde (première requête DB échoue)
    it("doit continuer le calcul même si la vérification du solde échoue", async () => {
      // Mock des appels DB : première requête échoue, mais on continue quand même
      db.query
        .mockRejectedValueOnce(new Error("SELECT error")) // SELECT du solde échoue
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussit quand même

      const bets = [
        {
          label: "Rouge",
          numbers: "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36",
          type: "outside_color",
          odds: 2,
          amt: 100
        }
      ];

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 5, // Rouge
          bets: bets,
          solde: 1000,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(200); // 2 * 100
      expect(res.body.payout).toBe(200); // 200 - 0
      expect(res.body.newsolde).toBe(1200); // 1000 + 200

      // Vérifier que les deux requêtes ont été tentées
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenNthCalledWith(1, "SELECT solde FROM user WHERE user_id = ?", [1]);
      expect(db.query).toHaveBeenNthCalledWith(2, "UPDATE user SET solde = ? WHERE user_id = ?", [1200, 1]);
    });

    // Test explicite pour forcer la couverture des lignes 71-73 (vérification du solde)
    it("doit afficher les informations de solde lors de la vérification en base", async () => {
      // Mock spécifique pour s'assurer que la vérification du solde passe par le chemin complet
      db.query
        .mockResolvedValueOnce([[{ solde: 500 }]]) // SELECT retourne exactement un utilisateur avec solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussit

      const bets = [
        {
          label: "12",
          numbers: "12",
          type: "inside_whole",
          odds: 36,
          amt: 5
        }
      ];

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 12, // Le numéro 12 gagne
          bets: bets,
          solde: 600, // Solde frontend différent du solde base pour tester la différence
          userId: 123
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(180); // 36 * 5
      expect(res.body.payout).toBe(180); // 180 - 0  
      expect(res.body.newsolde).toBe(780); // 600 + 180

      // Vérifier les appels DB avec les bons paramètres
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(db.query).toHaveBeenNthCalledWith(1, "SELECT solde FROM user WHERE user_id = ?", [123]);
      expect(db.query).toHaveBeenNthCalledWith(2, "UPDATE user SET solde = ? WHERE user_id = ?", [780, 123]);
    });

    // Test des paris sur colonne - première colonne (lignes 71-73)
    it("doit calculer correctement les gains sur la première colonne", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 1000 }]]) // SELECT du solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussit

      const bets = [
        {
          label: '2 à 1',
          numbers: "1,4,7,10,13,16,19,22,25,28,31,34", // Première colonne
          type: "outside_column",
          odds: 3,
          amt: 50
        }
      ];

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 1, // Le numéro 1 est dans la première colonne
          bets: bets,
          solde: 1000,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(150); // 3 * 50
      expect(res.body.payout).toBe(150); // 150 - 0
      expect(res.body.newsolde).toBe(1150); // 1000 + 150
    });

    // Test des paris sur colonne - deuxième colonne (ligne 72)
    it("doit calculer correctement les gains sur la deuxième colonne", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 800 }]]) // SELECT du solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussit

      const bets = [
        {
          label: '2 à 1',
          numbers: "2,5,8,11,14,17,20,23,26,29,32,35", // Deuxième colonne
          type: "outside_column",
          odds: 3,
          amt: 30
        }
      ];

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 5, // Le numéro 5 est dans la deuxième colonne
          bets: bets,
          solde: 800,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(90); // 3 * 30
      expect(res.body.payout).toBe(90); // 90 - 0
      expect(res.body.newsolde).toBe(890); // 800 + 90
    });

    // Test des paris sur colonne - troisième colonne (ligne 73)
    it("doit calculer correctement les gains sur la troisième colonne", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 600 }]]) // SELECT du solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussit

      const bets = [
        {
          label: '2 à 1',
          numbers: "3,6,9,12,15,18,21,24,27,30,33,36", // Troisième colonne
          type: "outside_column",
          odds: 3,
          amt: 20
        }
      ];

      const res = await request(app)
        .post("/api/roulette/win")
        .send({
          winningSpin: 9, // Le numéro 9 est dans la troisième colonne
          bets: bets,
          solde: 600,
          userId: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.winValue).toBe(60); // 3 * 20
      expect(res.body.payout).toBe(60); // 60 - 0
      expect(res.body.newsolde).toBe(660); // 600 + 60
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
