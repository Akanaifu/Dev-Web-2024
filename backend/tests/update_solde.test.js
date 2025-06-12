// Importation des modules nécessaires pour les tests
const request = require("supertest"); // Pour tester les endpoints HTTP
const express = require("express"); // Framework web Express
const updateSoldeRouter = require("../routes/update_solde"); // Le router à tester
const registerRouter = require("../routes/register"); // Le router pour créer des utilisateurs
const bcrypt = require("bcrypt"); // Pour le hashage des mots de passe
const { verifyToken } = require("../middlewares/auth");

// Mock de la base de données pour éviter les vraies connexions DB pendant les tests
// Cela permet d'isoler les tests et de contrôler les réponses de la base de données
jest.mock("../config/dbConfig", () => ({
  query: jest.fn(), // Mock de la fonction query
}));
const db = require("../config/dbConfig");

// Mock du middleware d'authentification pour simuler un utilisateur connecté
// Dans les tests, on simule toujours un utilisateur avec l'ID 1
jest.mock("../middlewares/auth", () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { userId: 1 }; // Simulation d'un utilisateur authentifié
    next(); // Passer au middleware suivant
  }),
}));

// Mock de bcrypt pour éviter les vraies opérations de hashage pendant les tests
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword123"),
}));

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json()); // Middleware pour parser le JSON
app.use("/register", registerRouter); // Montage du router d'inscription
app.use("/", updateSoldeRouter); // Montage du router à tester

describe("Tests de mise à jour du solde utilisateur", () => {
  // Nettoyage des mocks après chaque test pour éviter les interférences
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Tests de succès", () => {
    // Test du cas nominal : mise à jour réussie du solde
    it("doit mettre à jour le solde d'un utilisateur avec succès", async () => {
      // Configuration des mocks pour simuler :
      // 1. La récupération de l'ancien solde (SELECT)
      // 2. La mise à jour du solde (UPDATE)
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) // SELECT ancien solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussi

      // Exécution de la requête de test
      const res = await request(app)
        .post("/update")
        .send({ newSolde: 150 });

      // Vérifications des résultats attendus
      expect(res.statusCode).toBe(200); // Code de statut HTTP OK
      expect(res.body).toEqual({
        success: true,
        message: "Solde mis à jour avec succès"
      });
      expect(db.query).toHaveBeenCalledTimes(2); // Deux appels DB : SELECT + UPDATE
      // Vérification que le SELECT a été appelé avec les bons paramètres
      expect(db.query).toHaveBeenCalledWith(
        "SELECT solde FROM User WHERE user_id = ?",
        [1]
      );
      // Vérification que l'UPDATE a été appelé avec les bons paramètres
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [150, 1]
      );
    });

    // Test de cas limite : mise à jour du solde à zéro
    it("doit mettre à jour le solde à zéro", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) // SELECT ancien solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 0 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Solde mis à jour avec succès"
      });
      // Vérification spécifique que la valeur 0 est bien passée
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [0, 1]
      );
    });

    // Test de cas limite : mise à jour avec un nombre négatif
    it("doit mettre à jour le solde avec un nombre négatif", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) // SELECT ancien solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE

      const res = await request(app)
        .post("/update")
        .send({ newSolde: -50 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Solde mis à jour avec succès"
      });
      // Vérification que les nombres négatifs sont acceptés
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [-50, 1]
      );
    });

    // Test de cas limite : mise à jour avec un nombre décimal
    it("doit mettre à jour le solde avec un nombre décimal", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) // SELECT ancien solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 123.45 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Solde mis à jour avec succès"
      });
      // Vérification que les nombres décimaux sont acceptés
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [123.45, 1]
      );
    });

    // Test du cas où l'utilisateur n'existe pas en base de données
    it("doit gérer le cas où l'utilisateur n'existe pas en base", async () => {
      // Mock de la récupération de l'ancien solde (utilisateur inexistant)
      db.query
        .mockResolvedValueOnce([[]]) // SELECT retourne un tableau vide
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussit quand même

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 150 });

      // La mise à jour devrait quand même réussir
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Solde mis à jour avec succès"
      });
      expect(db.query).toHaveBeenCalledTimes(2);
    });
  });

  describe("Tests de validation des données", () => {
    // Test de validation : utilisateur non trouvé (userId manquant)
    it("doit rejeter si userId n'est pas défini", async () => {
      // Mock temporaire du middleware pour ne pas définir userId
      verifyToken.mockImplementationOnce((req, res, next) => {
        req.user = {}; // Pas de userId défini
        next();
      });

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 150 });

      expect(res.statusCode).toBe(404); // Not Found
      expect(res.body).toEqual({ error: "Utilisateur non trouvé" });
      expect(db.query).not.toHaveBeenCalled(); // Aucune requête DB ne doit être faite
    });

    // Test de validation : rejet d'une chaîne de caractères non numérique
    it("doit rejeter un solde NaN", async () => {
      const res = await request(app)
        .post("/update")
        .send({ newSolde: "not-a-number" });

      // Vérification que la validation échoue avec le bon message d'erreur
      expect(res.statusCode).toBe(400); // Bad Request
      expect(res.body).toEqual({ error: "Valeur de solde invalide" });
      expect(db.query).not.toHaveBeenCalled(); // Aucune requête DB ne doit être faite
    });

    // Test de validation : rejet d'une valeur infinie
    it("doit rejeter un solde infini", async () => {
      const res = await request(app)
        .post("/update")
        .send({ newSolde: Infinity });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Valeur de solde invalide" });
      expect(db.query).not.toHaveBeenCalled();
    });

    // Test de validation : rejet d'une valeur null
    it("doit rejeter un solde null", async () => {
      const res = await request(app)
        .post("/update")
        .send({ newSolde: null });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Valeur de solde invalide" });
      expect(db.query).not.toHaveBeenCalled();
    });

    // Test de validation : rejet d'une valeur undefined (champ manquant)
    it("doit rejeter un solde undefined", async () => {
      const res = await request(app)
        .post("/update")
        .send({}); // Aucun newSolde fourni

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Valeur de solde invalide" });
      expect(db.query).not.toHaveBeenCalled();
    });

    // Test de validation : rejet d'une valeur -Infinity
    it("doit rejeter un solde -Infinity", async () => {
      const res = await request(app)
        .post("/update")
        .send({ newSolde: -Infinity });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Valeur de solde invalide" });
      expect(db.query).not.toHaveBeenCalled();
    });

    // Test de validation : rejet d'un objet
    it("doit rejeter un solde de type objet", async () => {
      const res = await request(app)
        .post("/update")
        .send({ newSolde: { amount: 100 } });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Valeur de solde invalide" });
      expect(db.query).not.toHaveBeenCalled();
    });

    // Test de validation : rejet d'un tableau
    it("doit rejeter un solde de type tableau", async () => {
      const res = await request(app)
        .post("/update")
        .send({ newSolde: [100] });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Valeur de solde invalide" });
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe("Tests de gestion d'erreurs", () => {
    // Test de gestion d'erreur : échec lors de la récupération du solde
    it("doit gérer les erreurs de base de données lors de la récupération du solde", async () => {
      // Simulation d'une erreur de base de données sur le SELECT
      db.query.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 150 });

      // Vérification que l'erreur est correctement gérée
      expect(res.statusCode).toBe(500); // Internal Server Error
      expect(res.body).toEqual({ error: "Erreur serveur" });
    });

    // Test de gestion d'erreur : échec lors de la mise à jour
    it("doit gérer les erreurs de base de données lors de la mise à jour", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) // SELECT réussit
        .mockRejectedValueOnce(new Error("DB update error")); // UPDATE échoue

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 150 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Erreur serveur" });
    });

    // Test de gestion d'erreur : timeout de base de données
    it("doit gérer les timeouts de base de données", async () => {
      // Simulation d'un timeout
      db.query.mockRejectedValueOnce(new Error("Connection timeout"));

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 150 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Erreur serveur" });
    });
  });

  describe("Tests d'intégration avec création d'utilisateur", () => {
    // Test complet : création d'un utilisateur puis modification de son solde
    it("doit créer un utilisateur et modifier son solde avec succès", async () => {
      // Étape 1: Création de l'utilisateur
      // Mock pour vérifier que l'utilisateur n'existe pas déjà
      db.query.mockResolvedValueOnce([[]]); // Aucun utilisateur existant avec cet email/username
      
      // Mock pour l'insertion du nouvel utilisateur
      db.query.mockResolvedValueOnce([{ insertId: 1 }]); // L'utilisateur est créé avec l'ID 1
      
      // Création de l'utilisateur via l'API register
      const createUserRes = await request(app)
        .post("/register")
        .send({
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password123"
        });

      // Vérifications de la création d'utilisateur
      expect(createUserRes.statusCode).toBe(201);
      expect(createUserRes.body).toEqual({
        message: "Utilisateur créé avec succès",
        userId: 1
      });
      
      // Vérification que bcrypt.hash a été appelé pour hasher le mot de passe
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      
      // Vérification de l'insertion en base avec les bonnes données
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO User (username, name, firstname, email, password, solde, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        expect.arrayContaining([
          "testuser",
          "User",
          "Test", 
          "test@example.com",
          "hashedPassword123",
          0, // Solde initial à 0
          expect.any(Date)
        ])
      );

      // Étape 2: Modification du solde de l'utilisateur créé
      // Configuration des mocks pour la mise à jour du solde
      db.query
        .mockResolvedValueOnce([[{ solde: 0 }]]) // SELECT du solde actuel (0 car nouvel utilisateur)
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE du solde réussi

      // Modification du solde via l'API update_solde
      const updateSoldeRes = await request(app)
        .post("/update")
        .send({ newSolde: 500 });

      // Vérifications de la mise à jour du solde
      expect(updateSoldeRes.statusCode).toBe(200);
      expect(updateSoldeRes.body).toEqual({
        success: true,
        message: "Solde mis à jour avec succès"
      });
      
      // Vérification que le SELECT du solde a été appelé
      expect(db.query).toHaveBeenCalledWith(
        "SELECT solde FROM User WHERE user_id = ?",
        [1]
      );
      
      // Vérification que l'UPDATE du solde a été appelé avec le nouveau montant
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [500, 1]
      );
    });

    // Test d'erreur : échec de création d'utilisateur si email/username existe déjà
    it("doit échouer à créer un utilisateur si l'email ou username existe déjà", async () => {
      // Mock pour simuler qu'un utilisateur existe déjà
      db.query.mockResolvedValueOnce([[{ user_id: 2, email: "test@example.com" }]]);

      const res = await request(app)
        .post("/register")
        .send({
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password123"
        });

      // Vérification que la création échoue avec le bon message
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        message: "Un utilisateur avec cet email ou ce nom d'utilisateur existe déjà"
      });
      
      // Vérification qu'aucune insertion n'a été tentée
      expect(db.query).toHaveBeenCalledTimes(1); // Seulement le SELECT de vérification
    });

    // Test d'erreur : gestion des erreurs de base de données lors de la création
    it("doit gérer les erreurs de base de données lors de la création d'utilisateur", async () => {
      // Simulation d'une erreur de base de données
      db.query.mockRejectedValueOnce(new Error("DB connection error"));

      const res = await request(app)
        .post("/register")
        .send({
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password123"
        });

      // Vérification que l'erreur est correctement gérée
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        message: "Erreur serveur"
      });
    });

    // Test de scénario complet : multiples mises à jour de solde
    it("doit permettre plusieurs mises à jour successives du solde", async () => {
      // Première mise à jour : 100 → 200
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) // SELECT solde initial
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussi

      const firstUpdate = await request(app)
        .post("/update")
        .send({ newSolde: 200 });

      expect(firstUpdate.statusCode).toBe(200);
      expect(firstUpdate.body.success).toBe(true);

      // Deuxième mise à jour : 200 → 50
      db.query
        .mockResolvedValueOnce([[{ solde: 200 }]]) // SELECT nouveau solde
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE réussi

      const secondUpdate = await request(app)
        .post("/update")
        .send({ newSolde: 50 });

      expect(secondUpdate.statusCode).toBe(200);
      expect(secondUpdate.body.success).toBe(true);

      // Vérification que les bonnes valeurs ont été utilisées
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [200, 1]
      );
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [50, 1]
      );
    });
  });

  describe("Tests de cas extrêmes", () => {
    // Test avec des très grandes valeurs
    it("doit gérer les très grandes valeurs numériques", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) 
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 999999999.99 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [999999999.99, 1]
      );
    });

    // Test avec des très petites valeurs décimales
    it("doit gérer les très petites valeurs décimales", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) 
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post("/update")
        .send({ newSolde: 0.01 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        [0.01, 1]
      );
    });

    // Test avec une chaîne numérique valide
    it("doit accepter une chaîne représentant un nombre valide", async () => {
      db.query
        .mockResolvedValueOnce([[{ solde: 100 }]]) 
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post("/update")
        .send({ newSolde: "150.75" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE User SET solde = ? WHERE user_id = ?",
        ["150.75", 1]
      );
    });
  });
});
