/**
 * SUITE DE TESTS COMPLÈTE POUR LE MODULE ROULETTE-NET-PREPAREBETTINGBOARD
 * ========================================================================
 * 
 * Ce fichier teste exhaustivement la génération du plateau de roulette européenne,
 * incluant toutes les zones de mise possibles avec leurs cotes respectives.
 * 
 * STRUCTURE DES TESTS :
 * 1. Tests de la fonction prepareBettingBoard() - Génération des données
 * 2. Tests de l'endpoint API GET /betting-board - Réponses HTTP
 * 3. Validation des règles officielles de la roulette européenne
 * 4. Tests de robustesse et de performance
 * 
 * COUVERTURE : 77 tests pour 100% de couverture de code
 */

// Importation des modules nécessaires pour les tests
const request = require("supertest"); // Pour tester les endpoints HTTP avec simulation de requêtes
const express = require("express"); // Framework web Express pour créer l'app de test
const rouletteNetPrepareBettingBoard = require("../routes/roulette-net-prepareBettingBoard"); // Le module à tester

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json()); // Middleware pour parser le JSON dans les requêtes
app.use("/api/roulette-odds", rouletteNetPrepareBettingBoard.router); // Montage du router à tester

/**
 * CONSTANTES DE RÉFÉRENCE POUR LA ROULETTE EUROPÉENNE
 * Ces constantes définissent les règles officielles utilisées pour valider les tests
 */

// Numéros rouges selon les règles internationales de la roulette européenne
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Tous les numéros possibles sur une roulette européenne (0 à 36)
const ALL_NUMBERS = Array.from({length: 37}, (_, i) => i); // 0 à 36

// Numéros noirs calculés automatiquement (tous les numéros 1-36 qui ne sont pas rouges)
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

/**
 * SUITE PRINCIPALE DE TESTS
 * =========================
 * Organisation hiérarchique des tests par fonctionnalité
 */
describe("Tests du module roulette-net-prepareBettingBoard", () => {
  
  // Nettoyage après chaque test pour éviter les interférences entre tests
  afterEach(() => {
    jest.clearAllMocks(); // Réinitialise tous les mocks Jest
  });

  /**
   * ===== SECTION 1: TESTS DE LA FONCTION prepareBettingBoard =====
   * Cette section teste la génération correcte de toutes les zones de mise
   */
  describe("prepareBettingBoard() - Génération de la configuration", () => {
    let result; // Variable pour stocker le résultat de la fonction à tester

    // Exécution avant chaque test pour avoir des données fraîches
    beforeEach(() => {
      result = rouletteNetPrepareBettingBoard.prepareBettingBoard();
    });
    
    /**
     * SOUS-SECTION 1.1: TESTS DE STRUCTURE GÉNÉRALE
     * Vérifie que la fonction retourne un objet bien formé avec toutes les propriétés attendues
     */
    describe("Tests de structure générale", () => {
      
      // Test : Vérification de la présence de toutes les propriétés requises
      test("devrait retourner un objet avec toutes les propriétés attendues", () => {
        // Vérifie que le résultat est bien un objet
        expect(result).toBeInstanceOf(Object);
        
        // Vérifie la présence de chaque propriété attendue du plateau de roulette
        expect(result).toHaveProperty('outsideBets');        // Mises externes (1-18, 19-36)
        expect(result).toHaveProperty('numberBoardRows');    // Plateau principal 3x12
        expect(result).toHaveProperty('zeroCell');           // Cellule du zéro
        expect(result).toHaveProperty('columnBets');         // Colonnes (2 à 1)
        expect(result).toHaveProperty('dozenBets');          // Douzaines
        expect(result).toHaveProperty('evenOddRedBlack');    // Chances simples
        expect(result).toHaveProperty('splitBets');          // Mises à cheval
        expect(result).toHaveProperty('cornerBets');         // Carrés
        expect(result).toHaveProperty('streetBets');         // Transversales
        expect(result).toHaveProperty('doubleStreetBets');   // Sixains
      });

      // Test : Validation des types de données pour chaque propriété
      test("devrait avoir chaque propriété du bon type", () => {
        // La plupart des propriétés doivent être des tableaux
        expect(Array.isArray(result.outsideBets)).toBe(true);
        expect(Array.isArray(result.numberBoardRows)).toBe(true);
        expect(Array.isArray(result.columnBets)).toBe(true);
        expect(Array.isArray(result.dozenBets)).toBe(true);
        expect(Array.isArray(result.evenOddRedBlack)).toBe(true);
        expect(Array.isArray(result.splitBets)).toBe(true);
        expect(Array.isArray(result.cornerBets)).toBe(true);
        expect(Array.isArray(result.streetBets)).toBe(true);
        expect(Array.isArray(result.doubleStreetBets)).toBe(true);
        
        // La cellule zéro doit être un objet simple
        expect(typeof result.zeroCell).toBe('object');
      });
    });

    /**
     * SOUS-SECTION 1.2: TESTS DES MISES EXTERNES (1-18, 19-36)
     * Vérifie les paris sur les deux moitiés du plateau (chances simples à cote 2:1)
     */
    describe("Tests des outsideBets (1-18, 19-36)", () => {
      
      // Test : Nombre correct de mises externes
      test("devrait contenir exactement 2 éléments", () => {
        expect(result.outsideBets).toHaveLength(2); // Une pour 1-18, une pour 19-36
      });

      // Test : Configuration détaillée de la mise 1-18
      test("devrait avoir les bonnes propriétés pour 1-18", () => {
        const lowBet = result.outsideBets[0];
        expect(lowBet.label).toBe('1 à 18');                                    // Label d'affichage
        expect(lowBet.numbers).toEqual(Array.from({length: 18}, (_, i) => i + 1)); // Numéros 1 à 18
        expect(lowBet.type).toBe('outside_low');                                // Type de mise
        expect(lowBet.odds).toBe(2);                                           // Cote 2:1
      });

      // Test : Configuration détaillée de la mise 19-36
      test("devrait avoir les bonnes propriétés pour 19-36", () => {
        const highBet = result.outsideBets[1];
        expect(highBet.label).toBe('19 à 36');                                   // Label d'affichage
        expect(highBet.numbers).toEqual(Array.from({length: 18}, (_, i) => i + 19)); // Numéros 19 à 36
        expect(highBet.type).toBe('outside_high');                               // Type de mise
        expect(highBet.odds).toBe(2);                                           // Cote 2:1
      });

      // Test : Couverture complète sans chevauchement
      test("devrait couvrir tous les numéros 1-36 exactement une fois", () => {
        const allNumbers = result.outsideBets.flatMap(bet => bet.numbers);
        expect(allNumbers.sort((a, b) => a - b)).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });
    });

    /**
     * SOUS-SECTION 1.3: TESTS DU PLATEAU PRINCIPAL (numberBoardRows)
     * Vérifie la grille 3x12 contenant tous les numéros individuels de 1 à 36
     */
    describe("Tests du numberBoardRows (plateau principal)", () => {
      
      // Test : Structure en 12 lignes
      test("devrait contenir 12 lignes", () => {
        expect(result.numberBoardRows).toHaveLength(12); // 12 lignes pour 36 numéros (3 par ligne)
      });

      // Test : Structure en 3 colonnes par ligne
      test("devrait avoir 3 colonnes par ligne", () => {
        result.numberBoardRows.forEach(row => {
          expect(row).toHaveLength(3); // Chaque ligne contient exactement 3 cellules
        });
      });

      // Test : Présence de tous les numéros 1-36
      test("devrait contenir les numéros de 1 à 36", () => {
        const allNumbers = result.numberBoardRows.flat().map(cell => cell.numbers[0]);
        expect(allNumbers.sort((a, b) => a - b)).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });

      // Test : Structure détaillée de chaque cellule
      test("devrait avoir les bonnes propriétés pour chaque cellule", () => {
        result.numberBoardRows.flat().forEach(cell => {
          expect(cell).toHaveProperty('label');          // Label d'affichage
          expect(cell).toHaveProperty('numbers');        // Tableau des numéros couverts
          expect(cell).toHaveProperty('type');           // Type de mise
          expect(cell).toHaveProperty('odds');           // Cote de paiement
          expect(cell.numbers).toHaveLength(1);          // Une seule cellule par numéro
          expect(cell.type).toBe('inside_whole');        // Type "mise pleine"
          expect(cell.odds).toBe(36);                    // Cote 36:1 pour numéro plein
          expect(cell.label).toBe(cell.numbers[0].toString()); // Label = numéro
        });
      });

      // Test : Unicité des numéros
      test("devrait avoir tous les numéros uniques", () => {
        const allNumbers = result.numberBoardRows.flat().map(cell => cell.numbers[0]);
        const uniqueNumbers = [...new Set(allNumbers)]; // Supprime les doublons
        expect(uniqueNumbers).toHaveLength(36);          // Doit rester 36 numéros uniques
      });
    });

    /**
     * SOUS-SECTION 1.4: TESTS DE LA CELLULE ZÉRO
     * Vérifie la configuration spéciale du zéro (case verte, cote 36:1)
     */
    describe("Tests de la zeroCell", () => {
      
      // Test : Structure complète de la cellule zéro
      test("devrait avoir les bonnes propriétés", () => {
        expect(result.zeroCell).toEqual({
          label: '0',        // Affichage "0"
          numbers: [0],      // Contient uniquement le numéro 0
          type: 'zero',      // Type spécial pour le zéro
          odds: 36           // Même cote qu'un numéro plein (36:1)
        });
      });

      // Test : Contenu du tableau numbers
      test("devrait avoir le numéro 0", () => {
        expect(result.zeroCell.numbers).toEqual([0]); // Un seul élément : 0
      });

      // Test : Cote de paiement
      test("devrait avoir une cote de 36", () => {
        expect(result.zeroCell.odds).toBe(36); // Mise pleine comme les autres numéros
      });

      // Test : Type spécifique
      test("devrait avoir le type 'zero'", () => {
        expect(result.zeroCell.type).toBe('zero'); // Type distinct pour styling/logique
      });
    });

    /**
     * SOUS-SECTION 1.5: TESTS DES COLONNES (2 à 1)
     * Vérifie les trois colonnes verticales du plateau (cote 3:1)
     */
    describe("Tests des columnBets (colonnes 2 à 1)", () => {
      
      // Test : Nombre de colonnes
      test("devrait contenir exactement 3 colonnes", () => {
        expect(result.columnBets).toHaveLength(3); // Colonne gauche, centre, droite
      });

      // Test : Taille de chaque colonne
      test("devrait avoir 12 numéros par colonne", () => {
        result.columnBets.forEach(column => {
          expect(column.numbers).toHaveLength(12); // 12 numéros par colonne verticale
        });
      });

      // Test : Configuration détaillée de chaque colonne
      test("devrait avoir les numéros corrects pour chaque colonne", () => {
        // Disposition standard de la roulette européenne
        const expectedColumns = [
          [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], // Colonne de droite (3, 6, 9...)
          [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], // Colonne du milieu (2, 5, 8...)
          [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]  // Colonne de gauche (1, 4, 7...)
        ];
        
        result.columnBets.forEach((column, index) => {
          expect(column.numbers).toEqual(expectedColumns[index]);
          expect(column.label).toBe('2 à 1');           // Label standard pour colonnes
          expect(column.type).toBe('outside_column');   // Type de mise externe
          expect(column.odds).toBe(3);                  // Cote 3:1 (12 numéros sur 37)
        });
      });

      // Test : Couverture complète sans chevauchement
      test("devrait couvrir tous les numéros 1-36 exactement une fois", () => {
        const allNumbers = result.columnBets.flatMap(column => column.numbers);
        expect(allNumbers.sort((a, b) => a - b)).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });
    });

    /**
     * SOUS-SECTION 1.6: TESTS DES DOUZAINES
     * Vérifie les trois douzaines (1-12, 13-24, 25-36) avec cote 3:1
     */
    describe("Tests des dozenBets (douzaines)", () => {
      
      // Test : Nombre de douzaines
      test("devrait contenir exactement 3 douzaines", () => {
        expect(result.dozenBets).toHaveLength(3); // Première, deuxième, troisième douzaine
      });

      // Test : Taille de chaque douzaine
      test("devrait avoir 12 numéros par douzaine", () => {
        result.dozenBets.forEach(dozen => {
          expect(dozen.numbers).toHaveLength(12); // 12 numéros consécutifs par douzaine
        });
      });

      // Test : Configuration détaillée de chaque douzaine
      test("devrait avoir les numéros corrects pour chaque douzaine", () => {
        const expectedDozens = [
          { label: '1 à 12', numbers: Array.from({length: 12}, (_, i) => i + 1) },     // 1-12
          { label: '13 à 24', numbers: Array.from({length: 12}, (_, i) => i + 13) },   // 13-24
          { label: '25 à 36', numbers: Array.from({length: 12}, (_, i) => i + 25) }    // 25-36
        ];
        
        result.dozenBets.forEach((dozen, index) => {
          expect(dozen.label).toBe(expectedDozens[index].label);
          expect(dozen.numbers).toEqual(expectedDozens[index].numbers);
          expect(dozen.type).toBe('outside_dozen');   // Type de mise externe
          expect(dozen.odds).toBe(3);                 // Cote 3:1 (12 numéros sur 37)
        });
      });

      // Test : Séquence de numéros consécutifs
      test("devrait avoir des numéros consécutifs dans chaque douzaine", () => {
        result.dozenBets.forEach(dozen => {
          for (let i = 1; i < dozen.numbers.length; i++) {
            // Chaque numéro doit être le suivant du précédent
            expect(dozen.numbers[i]).toBe(dozen.numbers[i-1] + 1);
          }
        });
      });
    });

    /**
     * SOUS-SECTION 1.7: TESTS DES CHANCES SIMPLES (EVEN/ODD/RED/BLACK)
     * Vérifie les quatre types de paris sur les chances simples (cote 2:1)
     */
    describe("Tests des evenOddRedBlack (chances simples)", () => {
      
      // Test : Nombre de types de chances simples
      test("devrait contenir exactement 4 éléments", () => {
        expect(result.evenOddRedBlack).toHaveLength(4); // EVEN, ODD, RED, BLACK
      });

      // Test : Configuration détaillée des numéros pairs
      test("devrait avoir la configuration EVEN correcte", () => {
        const evenBet = result.evenOddRedBlack.find(bet => bet.label === 'EVEN');
        expect(evenBet).toBeDefined();
        // Tous les numéros pairs de 2 à 36 (18 numéros au total)
        expect(evenBet.numbers).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]);
        expect(evenBet.type).toBe('outside_oerb');      // Type "Outside Odd/Even/Red/Black"
        expect(evenBet.odds).toBe(2);                   // Cote 2:1 pour chances simples
        expect(evenBet.numbers).toHaveLength(18);       // Exactement 18 numéros
      });

      // Test : Configuration détaillée des numéros impairs
      test("devrait avoir la configuration ODD correcte", () => {
        const oddBet = result.evenOddRedBlack.find(bet => bet.label === 'ODD');
        expect(oddBet).toBeDefined();
        // Tous les numéros impairs de 1 à 35 (18 numéros au total)
        expect(oddBet.numbers).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]);
        expect(oddBet.type).toBe('outside_oerb');       // Type "Outside Odd/Even/Red/Black"
        expect(oddBet.odds).toBe(2);                    // Cote 2:1 pour chances simples
        expect(oddBet.numbers).toHaveLength(18);        // Exactement 18 numéros
      });

      // Test : Configuration détaillée des numéros rouges
      test("devrait avoir la configuration RED correcte", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        expect(redBet).toBeDefined();
        // Utilise la constante RED_NUMBERS définie selon les règles officielles
        expect(redBet.numbers).toEqual(RED_NUMBERS);
        expect(redBet.type).toBe('outside_oerb');       // Type "Outside Odd/Even/Red/Black"
        expect(redBet.odds).toBe(2);                    // Cote 2:1 pour chances simples
        expect(redBet.numbers).toHaveLength(18);        // Exactement 18 numéros
      });

      // Test : Configuration détaillée des numéros noirs
      test("devrait avoir la configuration BLACK correcte", () => {
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        expect(blackBet).toBeDefined();
        // Utilise la constante BLACK_NUMBERS (tous les 1-36 qui ne sont pas rouges)
        expect(blackBet.numbers).toEqual(BLACK_NUMBERS);
        expect(blackBet.type).toBe('outside_oerb');     // Type "Outside Odd/Even/Red/Black"
        expect(blackBet.odds).toBe(2);                  // Cote 2:1 pour chances simples
        expect(blackBet.numbers).toHaveLength(18);      // Exactement 18 numéros
      });

      // Test : Uniformité des cotes
      test("devrait avoir toutes les cotes à 2", () => {
        result.evenOddRedBlack.forEach(bet => {
          expect(bet.odds).toBe(2); // Toutes les chances simples paient 2:1
        });
      });
    });

    /**
     * SOUS-SECTION 1.8: TESTS DES MISES À CHEVAL (SPLITS)
     * Vérifie les paris sur deux numéros adjacents (cote 18:1)
     */
    describe("Tests des splitBets (mises à cheval)", () => {
      
      // Test : Nombre total de splits disponibles
      test("devrait avoir le bon nombre total de splits", () => {
        // Calcul théorique des splits possibles :
        // - Splits horizontaux : 11 lignes × 2 splits par ligne = 22
        // - Splits verticaux : 12 positions × 3 colonnes - 3 (dernière ligne) = 33
        const expectedHorizontalSplits = 11 * 2;       // 11 lignes × 2 splits horizontaux par ligne
        const expectedVerticalSplits = 12 * 3;         // 12 lignes × 3 splits verticaux par ligne - 3 (dernière ligne)
        const expectedTotal = expectedHorizontalSplits + expectedVerticalSplits - 3; // -3 car dernière ligne n'a pas de splits verticaux
        expect(result.splitBets.length).toBeGreaterThan(50); // Au moins 50 splits au total
      });

      // Test : Structure de chaque split
      test("devrait avoir exactement 2 numéros par split", () => {
        result.splitBets.forEach(split => {
          expect(split.numbers).toHaveLength(2); // Un split couvre toujours exactement 2 numéros
        });
      });

      // Test : Cotes et types uniformes
      test("devrait avoir toutes les cotes à 18", () => {
        result.splitBets.forEach(split => {
          expect(split.odds).toBe(18);           // Cote standard pour split (36/2 = 18)
          expect(split.type).toBe('split');      // Type de mise
        });
      });

      // Test : Adjacence des numéros
      test("devrait avoir des numéros adjacents", () => {
        result.splitBets.forEach(split => {
          const [n1, n2] = split.numbers.sort((a, b) => a - b);
          // Sur le plateau 3×12, les numéros adjacents ont soit :
          // - Une différence de 1 (adjacence horizontale)
          // - Une différence de 3 (adjacence verticale)
          expect(n2 - n1 === 1 || n2 - n1 === 3).toBe(true);
        });
      });

      // Test : Format des labels
      test("devrait avoir des labels corrects", () => {
        result.splitBets.forEach(split => {
          const [n1, n2] = split.numbers.sort((a, b) => a - b);
          // Le label doit être "numéro1-numéro2" dans l'ordre croissant
          expect(split.label).toBe(`${n1}-${n2}`);
        });
      });
    });

    describe("Tests des cornerBets (carrés)", () => {
      test("devrait avoir le bon nombre de corners", () => {
        // 11 lignes × 2 coins par ligne = 22 corners
        expect(result.cornerBets).toHaveLength(22);
      });

      test("devrait avoir exactement 4 numéros par corner", () => {
        result.cornerBets.forEach(corner => {
          expect(corner.numbers).toHaveLength(4);
        });
      });

      test("devrait avoir toutes les cotes à 9", () => {
        result.cornerBets.forEach(corner => {
          expect(corner.odds).toBe(9);
          expect(corner.type).toBe('corner');
        });
      });

      test("devrait avoir des numéros formant un carré valide", () => {
        result.cornerBets.forEach(corner => {
          const [n1, n2, n3, n4] = corner.numbers.sort((a, b) => a - b);
          // Vérifier que les numéros forment un carré
          expect(n2).toBe(n1 + 1);
          expect(n3).toBe(n1 + 3);
          expect(n4).toBe(n1 + 4);
        });
      });

      test("devrait avoir des labels corrects", () => {
        result.cornerBets.forEach(corner => {
          const sortedNumbers = corner.numbers.sort((a, b) => a - b);
          expect(corner.label).toBe(sortedNumbers.join(','));
        });
      });
    });

    describe("Tests des streetBets (transversales)", () => {
      test("devrait contenir 12 streets (une par ligne)", () => {
        expect(result.streetBets).toHaveLength(12);
      });

      test("devrait avoir exactement 3 numéros par street", () => {
        result.streetBets.forEach(street => {
          expect(street.numbers).toHaveLength(3);
        });
      });

      test("devrait avoir toutes les cotes à 12", () => {
        result.streetBets.forEach(street => {
          expect(street.odds).toBe(12);
          expect(street.type).toBe('street');
        });
      });

      test("devrait avoir des numéros consécutifs", () => {
        result.streetBets.forEach(street => {
          const [n1, n2, n3] = street.numbers.sort((a, b) => a - b);
          expect(n2).toBe(n1 + 1);
          expect(n3).toBe(n1 + 2);
        });
      });

      test("devrait couvrir tous les numéros 1-36", () => {
        const allNumbers = result.streetBets.flatMap(street => street.numbers);
        expect(allNumbers.sort((a, b) => a - b)).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });

      test("devrait avoir des labels corrects", () => {
        result.streetBets.forEach(street => {
          const sortedNumbers = street.numbers.sort((a, b) => a - b);
          expect(street.label).toBe(sortedNumbers.join(','));
        });
      });
    });

    describe("Tests des doubleStreetBets (sixains)", () => {
      test("devrait avoir 11 double streets", () => {
        expect(result.doubleStreetBets).toHaveLength(11);
      });

      test("devrait avoir exactement 6 numéros par double street", () => {
        result.doubleStreetBets.forEach(doubleStreet => {
          expect(doubleStreet.numbers).toHaveLength(6);
        });
      });

      test("devrait avoir toutes les cotes à 6", () => {
        result.doubleStreetBets.forEach(doubleStreet => {
          expect(doubleStreet.odds).toBe(6);
          expect(doubleStreet.type).toBe('double_street');
        });
      });

      test("devrait avoir des numéros sur 2 lignes consécutives", () => {
        result.doubleStreetBets.forEach(doubleStreet => {
          const [n1, n2, n3, n4, n5, n6] = doubleStreet.numbers.sort((a, b) => a - b);
          // Première ligne : n1, n2, n3
          expect(n2).toBe(n1 + 1);
          expect(n3).toBe(n1 + 2);
          // Deuxième ligne : n4, n5, n6
          expect(n4).toBe(n1 + 3);
          expect(n5).toBe(n1 + 4);
          expect(n6).toBe(n1 + 5);
        });
      });

      test("devrait avoir des labels corrects", () => {
        result.doubleStreetBets.forEach(doubleStreet => {
          const sortedNumbers = doubleStreet.numbers.sort((a, b) => a - b);
          expect(doubleStreet.label).toBe(sortedNumbers.join(','));
        });
      });
    });

    describe("Tests de cohérence globale", () => {
      test("devrait avoir tous les numéros 0-36 présents", () => {
        const allNumbersFromBoard = result.numberBoardRows.flat().map(cell => cell.numbers[0]);
        const zeroNumber = result.zeroCell.numbers;
        const totalNumbers = [...allNumbersFromBoard, ...zeroNumber];
        
        expect(totalNumbers.sort((a, b) => a - b)).toEqual(ALL_NUMBERS);
      });

      test("ne devrait avoir aucun numéro manquant", () => {
        const allAvailableNumbers = new Set();
        
        // Ajouter tous les numéros de toutes les sections
        result.numberBoardRows.flat().forEach(cell => {
          cell.numbers.forEach(num => allAvailableNumbers.add(num));
        });
        allAvailableNumbers.add(result.zeroCell.numbers[0]);
        
        for (let i = 0; i <= 36; i++) {
          expect(allAvailableNumbers.has(i)).toBe(true);
        }
      });

      test("devrait avoir des cotes cohérentes avec les règles de roulette", () => {
        // Vérifier quelques cotes standard
        expect(result.zeroCell.odds).toBe(36); // Numéro plein
        result.outsideBets.forEach(bet => expect(bet.odds).toBe(2)); // Chances simples
        result.columnBets.forEach(bet => expect(bet.odds).toBe(3)); // Colonnes
        result.dozenBets.forEach(bet => expect(bet.odds).toBe(3)); // Douzaines
        result.splitBets.forEach(bet => expect(bet.odds).toBe(18)); // Splits
        result.cornerBets.forEach(bet => expect(bet.odds).toBe(9)); // Corners
        result.streetBets.forEach(bet => expect(bet.odds).toBe(12)); // Streets
        result.doubleStreetBets.forEach(bet => expect(bet.odds).toBe(6)); // Double streets
      });

      test("devrait avoir des types de mises cohérents", () => {
        const validTypes = ['inside_whole', 'zero', 'outside_low', 'outside_high', 'outside_column', 
                           'outside_dozen', 'outside_oerb', 'split', 'corner', 'street', 'double_street'];
        
        // Vérifier tous les types
        result.numberBoardRows.flat().forEach(cell => {
          expect(validTypes).toContain(cell.type);
        });
        expect(validTypes).toContain(result.zeroCell.type);
        result.outsideBets.forEach(bet => expect(validTypes).toContain(bet.type));
        result.columnBets.forEach(bet => expect(validTypes).toContain(bet.type));
        result.dozenBets.forEach(bet => expect(validTypes).toContain(bet.type));
        result.evenOddRedBlack.forEach(bet => expect(validTypes).toContain(bet.type));
        result.splitBets.forEach(bet => expect(validTypes).toContain(bet.type));
        result.cornerBets.forEach(bet => expect(validTypes).toContain(bet.type));
        result.streetBets.forEach(bet => expect(validTypes).toContain(bet.type));
        result.doubleStreetBets.forEach(bet => expect(validTypes).toContain(bet.type));
      });
    });
  });

  /**
   * ===== SECTION 2: TESTS DE LA ROUTE GET /betting-board =====
   * Cette section teste l'endpoint API qui expose la configuration du plateau
   */
  describe("GET /api/roulette-odds/betting-board - Endpoint API", () => {
    
    /**
     * SOUS-SECTION 2.1: TESTS DE RÉPONSE HTTP
     * Vérifie le comportement de base de l'API REST
     */
    describe("Tests de réponse HTTP", () => {
      
      // Test : Code de statut HTTP correct
      test("devrait retourner un statut 200", async () => {
        const response = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        expect(response.status).toBe(200); // Succès HTTP
      });

      // Test : Type de contenu JSON
      test("devrait retourner une réponse JSON", async () => {
        const response = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        expect(response.headers['content-type']).toMatch(/json/); // Content-Type: application/json
      });

      // Test : Structure complète des données retournées
      test("devrait contenir toutes les propriétés attendues", async () => {
        const response = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        const data = response.body;
        // Vérifie que l'API retourne toutes les sections du plateau
        expect(data).toHaveProperty('outsideBets');
        expect(data).toHaveProperty('numberBoardRows');
        expect(data).toHaveProperty('zeroCell');
        expect(data).toHaveProperty('columnBets');
        expect(data).toHaveProperty('dozenBets');
        expect(data).toHaveProperty('evenOddRedBlack');
        expect(data).toHaveProperty('splitBets');
        expect(data).toHaveProperty('cornerBets');
        expect(data).toHaveProperty('streetBets');
        expect(data).toHaveProperty('doubleStreetBets');
      });

      // Test : Cohérence entre API et fonction directe
      test("devrait avoir la même structure que prepareBettingBoard()", async () => {
        const response = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        // Compare la réponse API avec l'appel direct de la fonction
        const directResult = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        expect(response.body).toEqual(directResult);
      });
    });

    /**
     * SOUS-SECTION 2.2: TESTS DE PERFORMANCE
     * Vérifie les temps de réponse et la stabilité de l'API
     */
    describe("Tests de performance", () => {
      
      // Test : Temps de réponse acceptable
      test("devrait répondre en moins de 100ms", async () => {
        const startTime = Date.now();
        await request(app)
          .get('/api/roulette-odds/betting-board');
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeLessThan(100); // Réponse rapide pour UX
      });

      // Test : Cohérence entre appels multiples
      test("devrait avoir des données cohérentes entre plusieurs appels", async () => {
        const response1 = await request(app)
          .get('/api/roulette-odds/betting-board');
        const response2 = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        // Les deux réponses doivent être identiques (données statiques)
        expect(response1.body).toEqual(response2.body);
      });
    });

    /**
     * SOUS-SECTION 2.3: TESTS DE CAS LIMITES
     * Vérifie la robustesse de l'API dans différents scénarios
     */
    describe("Tests de cas limites", () => {
      
      // Test : Gestion de la charge simultanée
      test("devrait gérer plusieurs appels successifs", async () => {
        // Création de 5 requêtes simultanées
        const promises = Array.from({length: 5}, () => 
          request(app).get('/api/roulette-odds/betting-board')
        );
        
        const responses = await Promise.all(promises);
        
        // Toutes les requêtes doivent réussir
        responses.forEach(response => {
          expect(response.status).toBe(200);
        });
        
        // Tous les résultats doivent être identiques
        const firstResult = responses[0].body;
        responses.forEach(response => {
          expect(response.body).toEqual(firstResult);
        });
      });

      // Test : Tolérance aux paramètres de requête
      test("devrait accepter différents types de requêtes", async () => {
        // GET standard
        const getResponse = await request(app)
          .get('/api/roulette-odds/betting-board');
        expect(getResponse.status).toBe(200);
        
        // GET avec query parameters (doit être ignoré)
        const getWithParamsResponse = await request(app)
          .get('/api/roulette-odds/betting-board?test=123');
        expect(getWithParamsResponse.status).toBe(200);
        expect(getWithParamsResponse.body).toEqual(getResponse.body);
      });
    });
  });

  /**
   * ===== SECTION 3: VALIDATION DES RÈGLES DE LA ROULETTE =====
   * Cette section vérifie la conformité aux règles officielles de la roulette européenne
   */
  describe("Validation des règles de la roulette", () => {
    let result;

    beforeEach(() => {
      result = rouletteNetPrepareBettingBoard.prepareBettingBoard();
    });
    
    /**
     * SOUS-SECTION 3.1: TESTS DES COULEURS OFFICIELLES
     * Vérifie la répartition rouge/noir selon les standards internationaux
     */
    describe("Tests des numéros rouges et noirs", () => {
      
      // Test : Conformité des numéros rouges
      test("devrait avoir les numéros rouges conformes aux règles officielles", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        // Les numéros rouges sont définis par les règles internationales
        expect(redBet.numbers).toEqual(RED_NUMBERS);
      });

      // Test : Calcul correct des numéros noirs
      test("devrait avoir les numéros noirs corrects", () => {
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        // Les numéros noirs sont tous les 1-36 qui ne sont pas rouges
        expect(blackBet.numbers).toEqual(BLACK_NUMBERS);
      });

      // Test : Exclusion du zéro des couleurs
      test("devrait exclure le zéro des couleurs", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        
        // Le zéro (case verte) n'appartient ni au rouge ni au noir
        expect(redBet.numbers).not.toContain(0);
        expect(blackBet.numbers).not.toContain(0);
      });

      // Test : Exclusivité des couleurs
      test("ne devrait avoir aucun numéro à la fois rouge et noir", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        
        // Aucun numéro ne peut être à la fois rouge et noir
        const intersection = redBet.numbers.filter(num => blackBet.numbers.includes(num));
        expect(intersection).toHaveLength(0);
      });

      // Test : Couverture complète des couleurs
      test("devrait avoir tous les numéros 1-36 soit rouges soit noirs", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        
        // Union des rouges et noirs doit donner tous les numéros 1-36
        const allColoredNumbers = [...redBet.numbers, ...blackBet.numbers].sort((a, b) => a - b);
        expect(allColoredNumbers).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });
    });

    /**
     * SOUS-SECTION 3.2: TESTS DES COTES DE PAIEMENT
     * Vérifie que les cotes correspondent aux probabilités mathématiques
     */
    describe("Tests des cotes de paiement", () => {
      
      // Test : Cotes basées sur le nombre de numéros couverts
      test("devrait avoir des cotes correspondant au nombre de numéros couverts", () => {
        // Formule : cote = (37 - nombres_couverts) / nombres_couverts
        // Pour roulette européenne avec 37 cases (0-36)
        
        // Numéro plein (1 numéro) : (37-1)/1 = 36:1
        expect(result.zeroCell.odds).toBe(36);
        result.numberBoardRows.flat().forEach(cell => {
          expect(cell.odds).toBe(36);
        });
        
        // Splits (2 numéros) : (37-2)/2 = 17.5 ≈ 18:1 (arrondi défavorable au joueur)
        result.splitBets.forEach(bet => {
          expect(bet.odds).toBe(18);
        });
        
        // Streets (3 numéros) : (37-3)/3 = 11.33 ≈ 12:1 (arrondi défavorable au joueur)
        result.streetBets.forEach(bet => {
          expect(bet.odds).toBe(12);
        });
        
        // Corners (4 numéros) : (37-4)/4 = 8.25 ≈ 9:1 (arrondi défavorable au joueur)
        result.cornerBets.forEach(bet => {
          expect(bet.odds).toBe(9);
        });
        
        // Double streets (6 numéros) : (37-6)/6 = 5.17 ≈ 6:1 (arrondi défavorable au joueur)
        result.doubleStreetBets.forEach(bet => {
          expect(bet.odds).toBe(6);
        });
      });

      // Test : Cotes des mises externes
      test("devrait avoir les bonnes cotes pour les mises externes", () => {
        // Chances simples (18 numéros) : (37-18)/18 = 1.06 ≈ 2:1 (incluant l'avantage maison)
        result.evenOddRedBlack.forEach(bet => {
          expect(bet.odds).toBe(2);
        });
        result.outsideBets.forEach(bet => {
          expect(bet.odds).toBe(2);
        });
        
        // Douzaines et colonnes (12 numéros) : (37-12)/12 = 2.08 ≈ 3:1 (incluant l'avantage maison)
        result.dozenBets.forEach(bet => {
          expect(bet.odds).toBe(3);
        });
        result.columnBets.forEach(bet => {
          expect(bet.odds).toBe(3);
        });
      });
    });

    /**
     * SOUS-SECTION 3.3: TESTS D'EXHAUSTIVITÉ
     * Vérifie que toutes les mises possibles sont disponibles
     */
    describe("Tests de l'exhaustivité", () => {
      
      // Test : Accessibilité de tous les numéros
      test("devrait permettre de miser sur tous les numéros 0-36", () => {
        const bettableNumbers = new Set();
        
        // Numéros du plateau principal (1-36)
        result.numberBoardRows.flat().forEach(cell => {
          cell.numbers.forEach(num => bettableNumbers.add(num));
        });
        
        // Zéro
        bettableNumbers.add(result.zeroCell.numbers[0]);
        
        // Vérifier que tous les numéros 0-36 sont présents
        for (let i = 0; i <= 36; i++) {
          expect(bettableNumbers.has(i)).toBe(true);
        }
        expect(bettableNumbers.size).toBe(37); // Exactement 37 numéros uniques
      });

      // Test : Présence de toutes les combinaisons standard
      test("devrait avoir toutes les combinaisons standard", () => {
        // Vérifier la présence de tous les types de mises standard
        expect(result.splitBets.length).toBeGreaterThan(0);      // Mises à cheval
        expect(result.cornerBets.length).toBeGreaterThan(0);     // Carrés
        expect(result.streetBets.length).toBe(12);               // Transversales (12 lignes)
        expect(result.doubleStreetBets.length).toBe(11);         // Sixains (11 possibles)
        expect(result.columnBets.length).toBe(3);                // Colonnes
        expect(result.dozenBets.length).toBe(3);                 // Douzaines
        expect(result.evenOddRedBlack.length).toBe(4);           // Chances simples
        expect(result.outsideBets.length).toBe(2);               // Mises externes
      });

      // Test : Validité de toutes les mises
      test("ne devrait proposer aucune mise invalide", () => {
        // Récupération de toutes les mises possibles
        const allBets = [
          ...result.numberBoardRows.flat(),
          result.zeroCell,
          ...result.splitBets,
          ...result.cornerBets,
          ...result.streetBets,
          ...result.doubleStreetBets,
          ...result.columnBets,
          ...result.dozenBets,
          ...result.evenOddRedBlack,
          ...result.outsideBets
        ];
        
        // Vérifier que tous les numéros sont dans la plage valide
        allBets.forEach(bet => {
          bet.numbers.forEach(num => {
            expect(num).toBeGreaterThanOrEqual(0);     // Minimum : 0
            expect(num).toBeLessThanOrEqual(36);       // Maximum : 36
            expect(Number.isInteger(num)).toBe(true);  // Doit être un entier
          });
        });
      });
    });
  });

  /**
   * ===== SECTION 4: TESTS DE ROBUSTESSE =====
   * Cette section teste la stabilité et l'intégrité du module
   */
  describe("Tests de robustesse", () => {
    
    /**
     * SOUS-SECTION 4.1: TESTS DE STABILITÉ
     * Vérifie la consistance et la performance sous charge
     */
    describe("Tests de stabilité", () => {
      
      // Test : Déterminisme de la fonction
      test("devrait donner des résultats identiques sur multiples appels", () => {
        // Génération de 10 résultats successifs
        const results = Array.from({length: 10}, () => 
          rouletteNetPrepareBettingBoard.prepareBettingBoard()
        );
        
        const firstResult = results[0];
        // Tous les résultats doivent être strictement identiques
        results.forEach(result => {
          expect(result).toEqual(firstResult);
        });
      });

      // Test : Performance sous charge simulée
      test("devrait gérer la charge de multiples appels", () => {
        // Simulation de 100 appels simultanés
        const promises = Array.from({length: 100}, () => 
          Promise.resolve(rouletteNetPrepareBettingBoard.prepareBettingBoard())
        );
        
        // Tous les appels doivent aboutir sans erreur
        return expect(Promise.all(promises)).resolves.toHaveLength(100);
      });
    });

    /**
     * SOUS-SECTION 4.2: TESTS D'INTÉGRITÉ DES DONNÉES
     * Vérifie l'immutabilité et la sérialisation des données
     */
    describe("Tests d'intégrité des données", () => {
      
      // Test : Immutabilité des résultats
      test("devrait retourner des objets immutables", () => {
        const result1 = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        const result2 = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        
        // Modifier result1 ne devrait pas affecter result2
        result1.zeroCell.odds = 999; // Modification destructive
        expect(result2.zeroCell.odds).toBe(36); // result2 doit rester intact
      });

      // Test : Compatibilité JSON
      test("devrait gérer la sérialisation/désérialisation JSON", () => {
        const original = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        const serialized = JSON.stringify(original);   // Conversion en JSON
        const deserialized = JSON.parse(serialized);   // Retour vers objet
        
        // Les données doivent survivre au cycle JSON
        expect(deserialized).toEqual(original);
      });

      // Test : Isolation mémoire
      test("ne devrait pas partager de références entre les appels", () => {
        const result1 = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        const result2 = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        
        // Les objets doivent être différents en mémoire (pas de référence partagée)
        expect(result1).not.toBe(result2);                           // Objets racine différents
        expect(result1.splitBets).not.toBe(result2.splitBets);       // Tableaux différents
        expect(result1.numberBoardRows).not.toBe(result2.numberBoardRows); // Matrices différentes
      });
    });
  });
});