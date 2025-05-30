// Importation des modules nécessaires pour les tests
const request = require("supertest"); // Pour tester les endpoints HTTP
const express = require("express"); // Framework web Express
const rouletteNetRouter = require("../routes/roulette-net"); // Le router de roulette à tester
const rouletteNetPrepareBettingBoard = require("../routes/roulette-net-prepareBettingBoard"); // Router pour le plateau de mise


// Mock de la base de données pour éviter les vraies connexions DB pendant les tests
jest.mock("../config/dbConfig", () => {
  const mockConnection = {
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
  };
  
  return {
    query: jest.fn(),
    getConnection: jest.fn(() => Promise.resolve(mockConnection))
  };
});
const db = require("../config/dbConfig");

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json()); // Middleware pour parser le JSON
app.use("/api/roulette", rouletteNetRouter); // Montage du router de roulette
app.use("/api/roulette-odds", rouletteNetPrepareBettingBoard.router); // Montage du router de configuration

describe("Tests des routes Roulette-Net", () => {
  // Nettoyage des mocks après chaque test pour éviter les interférences
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Nettoyage plus robuste avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    // Réinitialiser les mocks de base
    db.query.mockClear();
    db.getConnection.mockClear();
  });

  // ===== TESTS DE LA ROUTE /spin =====
  describe("POST /api/roulette/spin - Génération de numéros", () => {
    describe("Tests des couleurs selon les numéros", () => {
      // Test de la couleur verte avec le numéro 0
      it("doit retourner la couleur 'green' pour le numéro 0", async () => {
        const res = await request(app)
          .post("/api/roulette/spin")
          .send({});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("number");
        expect(res.body).toHaveProperty("color");
        expect(typeof res.body.number).toBe("number");
        expect(typeof res.body.color).toBe("string");
        
        // Vérification de la cohérence couleur/numéro
        if (res.body.number === 0) {
          expect(res.body.color).toBe("green");
        }
      });

      // Test de la structure de la réponse
      it("doit retourner un objet avec les propriétés number et color", async () => {
        const res = await request(app)
          .post("/api/roulette/spin")
          .send({});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("number");
        expect(res.body).toHaveProperty("color");
        expect(typeof res.body.number).toBe("number");
        expect(typeof res.body.color).toBe("string");
        expect(res.body.number).toBeGreaterThanOrEqual(0);
        expect(res.body.number).toBeLessThanOrEqual(36);
        expect(["red", "black", "green"]).toContain(res.body.color);
      });

      // Test de la logique de couleur pour différents numéros
      it("doit assigner les bonnes couleurs selon la logique de la roulette", async () => {
        // Faire plusieurs spins et vérifier la cohérence
        for (let i = 0; i < 10; i++) {
          const res = await request(app)
            .post("/api/roulette/spin")
            .send({});

          expect(res.statusCode).toBe(200);
          
          const { number, color } = res.body;
          
          if (number === 0) {
            expect(color).toBe("green");
          } else {
            // Numéros rouges : 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
            const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
            if (redNumbers.includes(number)) {
              expect(color).toBe("red");
            } else {
              expect(color).toBe("black");
            }
          }
        }
      });
    });

    describe("Tests de la plage de numéros", () => {
      it("doit générer des numéros dans la plage valide (0-36)", async () => {
        // Tester plusieurs fois pour s'assurer de la cohérence
        for (let i = 0; i < 20; i++) {
          const res = await request(app)
            .post("/api/roulette/spin")
            .send({});

          expect(res.statusCode).toBe(200);
          expect(res.body.number).toBeGreaterThanOrEqual(0);
          expect(res.body.number).toBeLessThanOrEqual(36);
          expect(Number.isInteger(res.body.number)).toBe(true);
        }
      });
    });
  });

  // ===== TESTS DE LA ROUTE /win =====
  describe("POST /api/roulette/win - Calcul des gains", () => {
    // Helper function pour setup des mocks de base de données
    const setupDatabaseMocks = (soldeInDB, affectedRows = 1, newSolde = null) => {
      // Nettoyer tous les mocks avant de les reconfigurer
      jest.clearAllMocks();
      
      // Mock pour la requête SELECT du solde
      db.query.mockResolvedValueOnce([[{ solde: soldeInDB }]]);
      
      // Mock pour getConnection et ses méthodes
      const mockConnection = {
        query: jest.fn()
          .mockResolvedValueOnce([{ affectedRows, changedRows: affectedRows }]) // UPDATE
          .mockResolvedValueOnce([[{ solde: newSolde || soldeInDB }]]), // SELECT de vérification avec même connexion
        beginTransaction: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue()
      };
      
      db.getConnection.mockResolvedValue(mockConnection);
      
      // Mock pour la vérification finale avec le pool (nouvelle connexion)
      db.query.mockResolvedValueOnce([[{ solde: newSolde || soldeInDB }]]);
      
      return mockConnection;
    };

    // Helper function pour les cas d'utilisateur inexistant
    const setupUserNotFoundMocks = () => {
      jest.clearAllMocks();
      db.query.mockResolvedValueOnce([[]]);
    };

    // Helper function pour les erreurs de DB
    const setupDatabaseErrorMocks = (errorType = 'connection') => {
      jest.clearAllMocks();
      if (errorType === 'connection') {
        // Mock SELECT réussit
        db.query.mockResolvedValueOnce([[{ solde: 1000 }]]);
        // Mock getConnection lance une erreur
        db.getConnection.mockRejectedValueOnce(new Error("DB connection error"));
      } else if (errorType === 'select') {
        // Mock SELECT échoue
        db.query.mockRejectedValueOnce(new Error("SELECT error"));
      }
    };

    describe("Tests de succès - Mises gagnantes", () => {
      // Test du cas nominal : mise gagnante sur un numéro
      it("doit calculer les gains correctement pour une mise gagnante sur le numéro", async () => {
        setupDatabaseMocks(1000, 1, 1350); // solde initial 1000, nouveau solde 1350

        const bets = [{
          label: "7",
          numbers: "7",
          type: "inside_whole",
          odds: 36,
          amt: 10
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 7,
            bets: bets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("winValue");
        expect(res.body).toHaveProperty("payout");
        expect(res.body).toHaveProperty("newsolde");
        expect(res.body).toHaveProperty("betTotal");
        
        expect(res.body.winValue).toBe(350); // (36-1) * 10 = 350
        expect(res.body.betTotal).toBe(10);
        expect(res.body.newsolde).toBe(1350); // 1000 + 350
      });

      // Test des paris sur rouge
      it("doit calculer correctement les gains sur rouge", async () => {
        setupDatabaseMocks(500, 1, 520); // solde initial 500, nouveau solde 520

        const bets = [{
          label: "Rouge",
          numbers: "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36",
          type: "outside_color",
          odds: 2,
          amt: 20
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 3, // Rouge
            bets: bets,
            solde: 500,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(20); // (2-1) * 20 = 20
        expect(res.body.newsolde).toBe(520); // 500 + 20
      });

      // Test des paris sur noir  
      it("doit calculer correctement les gains sur noir", async () => {
        setupDatabaseMocks(800, 1, 825); // solde initial 800, nouveau solde 825

        const bets = [{
          label: "Noir",
          numbers: "2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35",
          type: "outside_color",
          odds: 2,
          amt: 25
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 6, // Noir
            bets: bets,
            solde: 800,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(25); // (2-1) * 25 = 25
        expect(res.body.newsolde).toBe(825); // 800 + 25
      });

      // Test des paris sur pair
      it("doit calculer correctement les gains sur pair", async () => {
        setupDatabaseMocks(300, 1, 315); // solde initial 300, nouveau solde 315

        const bets = [{
          label: "Pair",
          numbers: "2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36",
          type: "outside_even",
          odds: 2,
          amt: 15
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 18, // Pair
            bets: bets,
            solde: 300,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(15); // (2-1) * 15 = 15
        expect(res.body.newsolde).toBe(315); // 300 + 15
      });

      // Test des paris sur impair
      it("doit calculer correctement les gains sur impair", async () => {
        setupDatabaseMocks(600, 1, 630); // solde initial 600, nouveau solde 630

        const bets = [{
          label: "Impair",
          numbers: "1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35",
          type: "outside_odd",
          odds: 2,
          amt: 30
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 13, // Impair
            bets: bets,
            solde: 600,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(30); // (2-1) * 30 = 30
        expect(res.body.newsolde).toBe(630); // 600 + 30
      });

      // Test de mise multiple gagnante
      it("doit calculer correctement avec plusieurs mises gagnantes", async () => {
        setupDatabaseMocks(1000, 1, 1185); // solde initial 1000, nouveau solde 1185

        const bets = [
          {
            label: "21",
            numbers: "21",
            type: "inside_whole",
            odds: 36,
            amt: 5
          },
          {
            label: "Rouge",
            numbers: "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36",
            type: "outside_color",
            odds: 2,
            amt: 10
          }
        ];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 21, // Rouge, gagne les deux mises
            bets: bets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(185); // (36-1)*5 + (2-1)*10 = 175 + 10 = 185
        expect(res.body.betTotal).toBe(15); // 5 + 10
        expect(res.body.newsolde).toBe(1185); // 1000 + 185
      });
    });

    describe("Tests des mises perdantes", () => {
      // Test d'une mise perdante
      it("doit calculer les pertes correctement pour une mise perdante", async () => {
        setupDatabaseMocks(1000, 1, 990); // solde initial 1000, nouveau solde 990

        const bets = [{
          label: "15",
          numbers: "15",
          type: "inside_whole",
          odds: 36,
          amt: 10
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 23, // Le 15 perd
            bets: bets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(0); // Aucun gain
        expect(res.body.payout).toBe(-10); // Perte de la mise
        expect(res.body.newsolde).toBe(990); // 1000 - 10
      });
    });

    describe("Tests des paris sur colonnes", () => {
      // Test première colonne
      it("doit calculer correctement les gains sur la première colonne", async () => {
        setupDatabaseMocks(1000, 1, 1100); // solde initial 1000, nouveau solde 1100

        const bets = [{
          label: '2 à 1',
          numbers: "1,4,7,10,13,16,19,22,25,28,31,34",
          type: "outside_column",
          odds: 3,
          amt: 50
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 1, // Première colonne
            bets: bets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(100); // (3-1) * 50 = 100
        expect(res.body.newsolde).toBe(1100); // 1000 + 100
      });

      // Test deuxième colonne
      it("doit calculer correctement les gains sur la deuxième colonne", async () => {
        setupDatabaseMocks(800, 1, 860); // solde initial 800, nouveau solde 860

        const bets = [{
          label: '2 à 1',
          numbers: "2,5,8,11,14,17,20,23,26,29,32,35",
          type: "outside_column",
          odds: 3,
          amt: 30
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 5, // Deuxième colonne
            bets: bets,
            solde: 800,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(60); // (3-1) * 30 = 60
        expect(res.body.newsolde).toBe(860); // 800 + 60
      });

      // Test troisième colonne
      it("doit calculer correctement les gains sur la troisième colonne", async () => {
        setupDatabaseMocks(600, 1, 640); // solde initial 600, nouveau solde 640

        const bets = [{
          label: '2 à 1',
          numbers: "3,6,9,12,15,18,21,24,27,30,33,36",
          type: "outside_column",
          odds: 3,
          amt: 20
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 9, // Troisième colonne
            bets: bets,
            solde: 600,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(40); // (3-1) * 20 = 40
        expect(res.body.newsolde).toBe(640); // 600 + 40
      });

      // NOUVEAU TEST pour couvrir la ligne 76 (secondColumn condition)
      it("doit rejeter un pari de deuxième colonne avec des numéros incorrects", async () => {
        setupDatabaseMocks(1000, 1, 990); // solde initial 1000, nouveau solde 990 (perte)

        const bets = [{
          label: '2 à 1',
          numbers: "1,4,7", // Numéros de première colonne mais label de deuxième colonne
          type: "outside_column",
          odds: 3,
          amt: 10
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 5, // Numéro de deuxième colonne
            bets: bets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(0); // Pas de gain car numbers ne correspond pas à la deuxième colonne
        expect(res.body.payout).toBe(-10); // Perte de la mise
        expect(res.body.newsolde).toBe(990); // 1000 - 10
      });

      // NOUVEAU TEST pour couvrir la ligne 79 (thirdColumn condition)
      it("doit rejeter un pari de troisième colonne avec des numéros incorrects", async () => {
        setupDatabaseMocks(1000, 1, 990); // solde initial 1000, nouveau solde 990 (perte)

        const bets = [{
          label: '2 à 1',
          numbers: "1,4,7", // Numéros de première colonne mais sera testé contre troisième colonne
          type: "outside_column",
          odds: 3,
          amt: 10
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 9, // Numéro de troisième colonne
            bets: bets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(0); // Pas de gain car numbers ne correspond pas à la troisième colonne
        expect(res.body.payout).toBe(-10); // Perte de la mise
        expect(res.body.newsolde).toBe(990); // 1000 - 10
      });

      // NOUVEAU TEST pour tester la logique complexe des colonnes avec succès sur deuxième colonne
      it("doit valider correctement une mise sur deuxième colonne avec vérification complète", async () => {
        setupDatabaseMocks(1000, 1, 1100); // solde initial 1000, nouveau solde 1100

        const bets = [{
          label: '2 à 1',
          numbers: "2,5,8,11,14,17,20,23,26,29,32,35", // Tous les numéros de deuxième colonne
          type: "outside_column",
          odds: 3,
          amt: 50
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 17, // Numéro de deuxième colonne
            bets: bets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(100); // (3-1) * 50 = 100
        expect(res.body.newsolde).toBe(1100); // 1000 + 100
      });

      // NOUVEAU TEST pour tester la logique complexe des colonnes avec succès sur troisième colonne
      it("doit valider correctement une mise sur troisième colonne avec vérification complète", async () => {
        setupDatabaseMocks(1000, 1, 1100); // solde initial 1000, nouveau solde 1100

        const bets = [{
          label: '2 à 1',
          numbers: "3,6,9,12,15,18,21,24,27,30,33,36", // Tous les numéros de troisième colonne
          type: "outside_column",
          odds: 3,
          amt: 50
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 24, // Numéro de troisième colonne
            bets: bets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.winValue).toBe(100); // (3-1) * 50 = 100
        expect(res.body.newsolde).toBe(1100); // 1000 + 100
      });
    });

    describe("Tests de validation des données", () => {
      // Test données invalides - userId manquant
      it("doit rejeter les requêtes sans userId", async () => {
        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 7,
            bets: [],
            solde: 1000
            // Pas de userId
          });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          message: "ID utilisateur requis"
        });
      });

      // Test winningSpin undefined
      it("doit rejeter winningSpin undefined", async () => {
        setupDatabaseMocks(1000);

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: undefined,
            bets: [],
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Données invalides");
      });

      // Test bets n'est pas un tableau
      it("doit rejeter si bets n'est pas un tableau", async () => {
        setupDatabaseMocks(1000);

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 7,
            bets: "invalid",
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Données invalides");
      });

      // Test utilisateur inexistant
      it("doit rejeter si l'utilisateur n'existe pas en base", async () => {
        setupUserNotFoundMocks();

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 7,
            bets: [],
            solde: 1000,
            userId: 999
          });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
          message: "Utilisateur non trouvé"
        });
      });
    });

    describe("Tests de gestion d'erreurs", () => {
      // Test erreur de base de données lors de la mise à jour
      it("doit gérer les erreurs de base de données lors de la mise à jour", async () => {
        setupDatabaseErrorMocks();

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
          message: "Erreur lors de la mise à jour du solde"
        });
      });

      // Test erreur lors de la vérification du solde
      it("doit gérer les erreurs lors de la vérification du solde", async () => {
        setupDatabaseErrorMocks('select');

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
          message: "Erreur lors de la récupération du solde"
        });
      });

      // NOUVEAU TEST pour couvrir les lignes 243-245 (rollback lors d'erreur UPDATE)
      it("doit effectuer un rollback en cas d'erreur lors de l'UPDATE en transaction", async () => {
        jest.clearAllMocks();
        
        // Mock SELECT du solde (réussit)
        db.query.mockResolvedValueOnce([[{ solde: 1000 }]]);
        
        // Mock pour forcer une erreur pendant l'UPDATE dans la transaction
        const mockConnection = {
          query: jest.fn().mockRejectedValueOnce(new Error("UPDATE failed")), // Erreur sur UPDATE
          beginTransaction: jest.fn().mockResolvedValue(),
          commit: jest.fn().mockResolvedValue(),
          rollback: jest.fn().mockResolvedValue(), // Le rollback sera appelé
          release: jest.fn().mockResolvedValue()
        };
        
        db.getConnection.mockResolvedValue(mockConnection);

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 7,
            bets: [{
              label: "7",
              numbers: "7",
              type: "inside_whole",
              odds: 36,
              amt: 10
            }],
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          message: "Erreur lors de la mise à jour du solde"
        });
        
        // Vérifier que le rollback a été appelé (ligne 244)
        expect(mockConnection.rollback).toHaveBeenCalledTimes(1);
        
        // Vérifier que la connexion a été libérée même après l'erreur
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
      });

      // NOUVEAU TEST supplémentaire pour couvrir différents types d'erreurs de transaction
      it("doit gérer une erreur de beginTransaction", async () => {
        jest.clearAllMocks();
        
        // Mock SELECT du solde (réussit)
        db.query.mockResolvedValueOnce([[{ solde: 1000 }]]);
        
        // Mock pour forcer une erreur sur beginTransaction
        const mockConnection = {
          query: jest.fn(),
          beginTransaction: jest.fn().mockRejectedValueOnce(new Error("Transaction start failed")),
          commit: jest.fn(),
          rollback: jest.fn(),
          release: jest.fn().mockResolvedValue()
        };
        
        db.getConnection.mockResolvedValue(mockConnection);

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
          message: "Erreur lors de la mise à jour du solde"
        });
        
        // Vérifier que la connexion a été libérée même après l'erreur
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
      });

      // NOUVEAU TEST pour couvrir la ligne 277 (catch principal avec erreur dans win())
      it("doit gérer une erreur dans la fonction win() elle-même", async () => {
        jest.clearAllMocks();
        
        // Mock SELECT du solde (réussit)
        db.query.mockResolvedValueOnce([[{ solde: 1000 }]]);
        
        // Créer des mises invalides qui vont provoquer une erreur dans win()
        const invalidBets = [{
          label: null,
          numbers: null, // Cela va causer une erreur dans .split()
          type: "inside_whole",
          odds: 36,
          amt: 10
        }];

        const res = await request(app)
          .post("/api/roulette/win")
          .send({
            winningSpin: 7,
            bets: invalidBets,
            solde: 1000,
            userId: 1
          });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          message: "Erreur lors du calcul des gains"
        });
      });
    });
  });

  // ===== TESTS DE LA ROUTE /betting-board =====
  describe("GET /api/roulette-odds/betting-board - Configuration du plateau", () => {
    describe("Tests de structure et contenu", () => {
      // Test de récupération de la configuration
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
      });

      // Test de la structure des données
      it("doit avoir une structure de données cohérente", async () => {
        const res = await request(app)
          .get("/api/roulette-odds/betting-board");

        // Vérification des paris externes
        expect(Array.isArray(res.body.outsideBets)).toBe(true);
        expect(res.body.outsideBets.length).toBe(2); // 1-18 et 19-36

        // Vérification de la cellule zéro
        expect(res.body.zeroCell).toEqual({
          label: "0",
          numbers: [0],
          type: "zero",
          odds: 36
        });

        // Vérification des lignes de numéros
        expect(Array.isArray(res.body.numberBoardRows)).toBe(true);
        expect(res.body.numberBoardRows.length).toBe(12); // 12 lignes
        expect(res.body.numberBoardRows[0].length).toBe(3); // 3 colonnes par ligne
      });

      // Test de cohérence des cotes
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

      // Test des numéros complets
      it("doit contenir tous les numéros de 0 à 36", async () => {
        const res = await request(app)
          .get("/api/roulette-odds/betting-board");

        // Collecter tous les numéros du plateau
        const allNumbers = [];
        
        // Ajouter le zéro
        allNumbers.push(...res.body.zeroCell.numbers);
        
        // Ajouter les numéros des lignes - la structure réelle utilise un objet avec label, numbers, type, odds
        res.body.numberBoardRows.forEach(row => {
          row.forEach(cell => {
            if (cell && Array.isArray(cell.numbers)) {
              allNumbers.push(...cell.numbers);
            }
          });
        });

        // Vérifier que tous les numéros de 0 à 36 sont présents
        for (let i = 0; i <= 36; i++) {
          expect(allNumbers).toContain(i);
        }
        
        expect(allNumbers.length).toBe(37); // 0 à 36
      });
    });

    describe("Tests de validation des types de mises", () => {
      // Test des types de mises disponibles
      it("doit avoir tous les types de mises nécessaires", async () => {
        const res = await request(app)
          .get("/api/roulette-odds/betting-board");

        // Vérifier les types de mises - les vrais types du fichier prepareBettingBoard
        const expectedTypes = ["outside_low", "outside_high", "zero", "inside_whole", "outside_column", "outside_dozen", "outside_oerb"];
        const foundTypes = new Set();

        // Collecter tous les types
        res.body.outsideBets.forEach(bet => foundTypes.add(bet.type));
        foundTypes.add(res.body.zeroCell.type);
        res.body.numberBoardRows.forEach(row => {
          row.forEach(cell => {
            if (cell && cell.type) {
              foundTypes.add(cell.type);
            }
          });
        });
        res.body.columnBets.forEach(bet => foundTypes.add(bet.type));
        res.body.dozenBets.forEach(bet => foundTypes.add(bet.type));
        res.body.evenOddRedBlack.forEach(bet => foundTypes.add(bet.type));

        expectedTypes.forEach(type => {
          expect(foundTypes.has(type)).toBe(true);
        });
      });
    });
  });

  // ===== TESTS DE LA ROUTE /test-update =====
  describe("POST /api/roulette/test-update - Tests de diagnostic", () => {
    // Helper function pour configurer les mocks de la route test-update
    const setupTestUpdateMocks = (soldeInitial, affectedRows = 1, soldeFinal = null) => {
      jest.clearAllMocks();
      
      // Mock pour le SELECT initial
      db.query.mockResolvedValueOnce([[{ solde: soldeInitial }]]);
      
      // Mock pour le SELECT final
      db.query.mockResolvedValueOnce([[{ solde: soldeFinal !== null ? soldeFinal : soldeInitial }]]);
      
      // Mock pour getConnection et ses méthodes
      const mockConnection = {
        query: jest.fn()
          .mockResolvedValueOnce([{ affectedRows, changedRows: affectedRows }]) // UPDATE
          .mockResolvedValueOnce([[{ solde: soldeFinal !== null ? soldeFinal : soldeInitial }]]) // SELECT avec même connexion
          .mockResolvedValueOnce([[{ solde: soldeFinal !== null ? soldeFinal : soldeInitial }]]), // SELECT après délai
        beginTransaction: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn().mockResolvedValue()
      };
      
      db.getConnection.mockResolvedValue(mockConnection);
      
      return mockConnection;
    };

    describe("Tests de succès", () => {
      it("doit mettre à jour le solde avec succès via test-update", async () => {
        setupTestUpdateMocks(1000, 1, 1500);

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: 1500
          });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("soldeBefore", 1000);
        expect(res.body).toHaveProperty("soldeExpected", 1500);
        expect(res.body).toHaveProperty("soldeFinal", 1500);
        expect(res.body).toHaveProperty("status", "OK");
      });

      it("doit gérer le cas où l'utilisateur n'existe pas initialement", async () => {
        jest.clearAllMocks();
        
        // Mock pour le SELECT initial (utilisateur inexistant)
        db.query.mockResolvedValueOnce([[]]);
        
        // Mock pour le SELECT final 
        db.query.mockResolvedValueOnce([[{ solde: 500 }]]);
        
        // Mock pour getConnection et ses méthodes
        const mockConnection = {
          query: jest.fn()
            .mockResolvedValueOnce([{ affectedRows: 1, changedRows: 1 }]) // UPDATE
            .mockResolvedValueOnce([[{ solde: 500 }]]) // SELECT avec même connexion
            .mockResolvedValueOnce([[{ solde: 500 }]]), // SELECT après délai
          beginTransaction: jest.fn().mockResolvedValue(),
          commit: jest.fn().mockResolvedValue(),
          rollback: jest.fn().mockResolvedValue(),
          release: jest.fn().mockResolvedValue()
        };
        
        db.getConnection.mockResolvedValue(mockConnection);

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 999,
            newSolde: 500
          });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("soldeBefore", null);
        expect(res.body).toHaveProperty("soldeFinal", 500);
      });

      it("doit détecter une incohérence de solde", async () => {
        setupTestUpdateMocks(1000, 1, 999); // Solde attendu 1500 mais obtenu 999

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: 1500
          });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("status", "ERREUR");
        expect(res.body.soldeFinal).not.toBe(res.body.soldeExpected);
      });
    });

    describe("Tests de validation", () => {
      it("doit rejeter si userId manque", async () => {
        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            newSolde: 1000
            // Pas de userId
          });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          message: "userId et newSolde requis"
        });
      });

      it("doit rejeter si newSolde manque", async () => {
        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1
            // Pas de newSolde
          });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          message: "userId et newSolde requis"
        });
      });

      it("doit rejeter si newSolde est undefined", async () => {
        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: undefined
          });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          message: "userId et newSolde requis"
        });
      });
    });

    describe("Tests de gestion d'erreurs", () => {
      it("doit gérer les erreurs de base de données lors du SELECT initial", async () => {
        jest.clearAllMocks();
        
        // Mock pour forcer une erreur sur le SELECT initial
        db.query.mockRejectedValueOnce(new Error("SELECT error"));

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: 1500
          });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          message: "Erreur lors du test"
        });
      });

      it("doit gérer les erreurs lors de getConnection", async () => {
        jest.clearAllMocks();
        
        // Mock SELECT initial réussit
        db.query.mockResolvedValueOnce([[{ solde: 1000 }]]);
        
        // Mock pour forcer une erreur sur getConnection
        db.getConnection.mockRejectedValueOnce(new Error("Connection failed"));

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: 1500
          });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          message: "Erreur lors du test"
        });
      });

      it("doit gérer les erreurs lors de beginTransaction", async () => {
        jest.clearAllMocks();
        
        // Mock SELECT initial réussit
        db.query.mockResolvedValueOnce([[{ solde: 1000 }]]);
        
        // Mock pour forcer une erreur sur beginTransaction
        const mockConnection = {
          query: jest.fn(),
          beginTransaction: jest.fn().mockRejectedValueOnce(new Error("Transaction failed")),
          commit: jest.fn(),
          rollback: jest.fn(),
          release: jest.fn().mockResolvedValue()
        };
        
        db.getConnection.mockResolvedValue(mockConnection);

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: 1500
          });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          message: "Erreur lors du test"
        });
        
        // Vérifier que la connexion a été libérée
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
      });

      it("doit gérer les erreurs lors de l'UPDATE", async () => {
        jest.clearAllMocks();
        
        // Mock SELECT initial réussit
        db.query.mockResolvedValueOnce([[{ solde: 1000 }]]);
        
        // Mock pour forcer une erreur sur l'UPDATE
        const mockConnection = {
          query: jest.fn().mockRejectedValueOnce(new Error("UPDATE failed")),
          beginTransaction: jest.fn().mockResolvedValue(),
          commit: jest.fn(),
          rollback: jest.fn(),
          release: jest.fn().mockResolvedValue()
        };
        
        db.getConnection.mockResolvedValue(mockConnection);

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: 1500
          });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          message: "Erreur lors du test"
        });
        
        // Vérifier que la connexion a été libérée
        expect(mockConnection.release).toHaveBeenCalledTimes(1);
      });
    });

    describe("Tests de cas extrêmes", () => {
      it("doit gérer les valeurs de solde nulles ou zéro", async () => {
        setupTestUpdateMocks(100, 1, 0);

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: 0
          });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("soldeFinal", 0);
        expect(res.body).toHaveProperty("status", "OK");
      });

      it("doit gérer les valeurs de solde négatives", async () => {
        setupTestUpdateMocks(100, 1, -50);

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: -50
          });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("soldeFinal", -50);
        expect(res.body).toHaveProperty("status", "OK");
      });

      it("doit gérer les très grandes valeurs", async () => {
        const bigValue = 999999999.99;
        setupTestUpdateMocks(1000, 1, bigValue);

        const res = await request(app)
          .post("/api/roulette/test-update")
          .send({
            userId: 1,
            newSolde: bigValue
          });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("soldeFinal", bigValue);
        expect(res.body).toHaveProperty("status", "OK");
      });
    });
  });
});
