// Importation des modules nécessaires pour les tests
const request = require("supertest"); // Pour tester les endpoints HTTP
const express = require("express"); // Framework web Express
const updateSoldeRouter = require("../routes/update_solde"); // Le router à tester

// Mock de la base de données pour éviter les vraies connexions DB pendant les tests
// Cela permet d'isoler les tests et de contrôler les réponses de la base de données
jest.mock("../config/dbConfig", () => ({
  query: jest.fn(), // Mock de la fonction query
}));
const db = require("../config/dbConfig");
// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json()); // Middleware pour parser le JSON
app.use("/register", registerRouter); // Montage du router d'inscription
app.use("/", updateSoldeRouter); // Montage du router à tester

describe("Création d'utilisateur et modification de solde", () => {
  // Nettoyage des mocks après chaque test pour éviter les interférences
  afterEach(() => {
    jest.clearAllMocks();
  });

});
