/**
 * Suite de tests unitaires pour le composant RouletteNetComponent.
 * 
 * ÉTAT ACTUEL : Tests de base en cours de développement
 * - Test de création du composant opérationnel
 * - Migration vers Jest prévue pour des tests plus avancés
 * 
 * TESTS À DÉVELOPPER :
 * - Vérification des getters qui délèguent au service
 * - Test des méthodes de mise et de spin
 * - Validation de l'état isSpinning
 * - Tests d'intégration avec le service RouletteNetLogic
 */

  // TODO: Ajouter des tests pour :
  // - Les getters qui délèguent au service (currentBet, chipValues, etc.)
  // - Les méthodes setBet(), removeBet(), spin()
  // - L'état isSpinning et son impact sur l'interface
  // - L'interaction avec RouletteNetLogic


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
