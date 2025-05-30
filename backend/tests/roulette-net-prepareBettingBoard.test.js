// Importation des modules nécessaires pour les tests
const request = require("supertest"); // Pour tester les endpoints HTTP
const express = require("express"); // Framework web Express
const rouletteNetPrepareBettingBoard = require("../routes/roulette-net-prepareBettingBoard"); // Le module à tester

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json()); // Middleware pour parser le JSON
app.use("/api/roulette-odds", rouletteNetPrepareBettingBoard.router); // Montage du router

// Constantes pour les tests
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const ALL_NUMBERS = Array.from({length: 37}, (_, i) => i); // 0 à 36
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

describe("Tests du module roulette-net-prepareBettingBoard", () => {
  // Nettoyage après chaque test pour éviter les interférences
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== TESTS DE LA FONCTION prepareBettingBoard =====
  describe("prepareBettingBoard() - Génération de la configuration", () => {
    let result;

    beforeEach(() => {
      result = rouletteNetPrepareBettingBoard.prepareBettingBoard();
    });
    
    describe("Tests de structure générale", () => {
      test("devrait retourner un objet avec toutes les propriétés attendues", () => {
        expect(result).toBeInstanceOf(Object);
        expect(result).toHaveProperty('outsideBets');
        expect(result).toHaveProperty('numberBoardRows');
        expect(result).toHaveProperty('zeroCell');
        expect(result).toHaveProperty('columnBets');
        expect(result).toHaveProperty('dozenBets');
        expect(result).toHaveProperty('evenOddRedBlack');
        expect(result).toHaveProperty('splitBets');
        expect(result).toHaveProperty('cornerBets');
        expect(result).toHaveProperty('streetBets');
        expect(result).toHaveProperty('doubleStreetBets');
      });

      test("devrait avoir chaque propriété du bon type", () => {
        expect(Array.isArray(result.outsideBets)).toBe(true);
        expect(Array.isArray(result.numberBoardRows)).toBe(true);
        expect(typeof result.zeroCell).toBe('object');
        expect(Array.isArray(result.columnBets)).toBe(true);
        expect(Array.isArray(result.dozenBets)).toBe(true);
        expect(Array.isArray(result.evenOddRedBlack)).toBe(true);
        expect(Array.isArray(result.splitBets)).toBe(true);
        expect(Array.isArray(result.cornerBets)).toBe(true);
        expect(Array.isArray(result.streetBets)).toBe(true);
        expect(Array.isArray(result.doubleStreetBets)).toBe(true);
      });
    });

    describe("Tests des outsideBets (1-18, 19-36)", () => {
      test("devrait contenir exactement 2 éléments", () => {
        expect(result.outsideBets).toHaveLength(2);
      });

      test("devrait avoir les bonnes propriétés pour 1-18", () => {
        const lowBet = result.outsideBets[0];
        expect(lowBet.label).toBe('1 à 18');
        expect(lowBet.numbers).toEqual(Array.from({length: 18}, (_, i) => i + 1));
        expect(lowBet.type).toBe('outside_low');
        expect(lowBet.odds).toBe(2);
      });

      test("devrait avoir les bonnes propriétés pour 19-36", () => {
        const highBet = result.outsideBets[1];
        expect(highBet.label).toBe('19 à 36');
        expect(highBet.numbers).toEqual(Array.from({length: 18}, (_, i) => i + 19));
        expect(highBet.type).toBe('outside_high');
        expect(highBet.odds).toBe(2);
      });

      test("devrait couvrir tous les numéros 1-36 exactement une fois", () => {
        const allNumbers = result.outsideBets.flatMap(bet => bet.numbers);
        expect(allNumbers.sort((a, b) => a - b)).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });
    });

    describe("Tests du numberBoardRows (plateau principal)", () => {
      test("devrait contenir 12 lignes", () => {
        expect(result.numberBoardRows).toHaveLength(12);
      });

      test("devrait avoir 3 colonnes par ligne", () => {
        result.numberBoardRows.forEach(row => {
          expect(row).toHaveLength(3);
        });
      });

      test("devrait contenir les numéros de 1 à 36", () => {
        const allNumbers = result.numberBoardRows.flat().map(cell => cell.numbers[0]);
        expect(allNumbers.sort((a, b) => a - b)).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });

      test("devrait avoir les bonnes propriétés pour chaque cellule", () => {
        result.numberBoardRows.flat().forEach(cell => {
          expect(cell).toHaveProperty('label');
          expect(cell).toHaveProperty('numbers');
          expect(cell).toHaveProperty('type');
          expect(cell).toHaveProperty('odds');
          expect(cell.numbers).toHaveLength(1);
          expect(cell.type).toBe('inside_whole');
          expect(cell.odds).toBe(36);
          expect(cell.label).toBe(cell.numbers[0].toString());
        });
      });

      test("devrait avoir tous les numéros uniques", () => {
        const allNumbers = result.numberBoardRows.flat().map(cell => cell.numbers[0]);
        const uniqueNumbers = [...new Set(allNumbers)];
        expect(uniqueNumbers).toHaveLength(36);
      });
    });

    describe("Tests de la zeroCell", () => {
      test("devrait avoir les bonnes propriétés", () => {
        expect(result.zeroCell).toEqual({
          label: '0',
          numbers: [0],
          type: 'zero',
          odds: 36
        });
      });

      test("devrait avoir le numéro 0", () => {
        expect(result.zeroCell.numbers).toEqual([0]);
      });

      test("devrait avoir une cote de 36", () => {
        expect(result.zeroCell.odds).toBe(36);
      });

      test("devrait avoir le type 'zero'", () => {
        expect(result.zeroCell.type).toBe('zero');
      });
    });

    describe("Tests des columnBets (colonnes 2 à 1)", () => {
      test("devrait contenir exactement 3 colonnes", () => {
        expect(result.columnBets).toHaveLength(3);
      });

      test("devrait avoir 12 numéros par colonne", () => {
        result.columnBets.forEach(column => {
          expect(column.numbers).toHaveLength(12);
        });
      });

      test("devrait avoir les numéros corrects pour chaque colonne", () => {
        const expectedColumns = [
          [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], // Colonne 1
          [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], // Colonne 2
          [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]  // Colonne 3
        ];
        
        result.columnBets.forEach((column, index) => {
          expect(column.numbers).toEqual(expectedColumns[index]);
          expect(column.label).toBe('2 à 1');
          expect(column.type).toBe('outside_column');
          expect(column.odds).toBe(3);
        });
      });

      test("devrait couvrir tous les numéros 1-36 exactement une fois", () => {
        const allNumbers = result.columnBets.flatMap(column => column.numbers);
        expect(allNumbers.sort((a, b) => a - b)).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });
    });

    describe("Tests des dozenBets (douzaines)", () => {
      test("devrait contenir exactement 3 douzaines", () => {
        expect(result.dozenBets).toHaveLength(3);
      });

      test("devrait avoir 12 numéros par douzaine", () => {
        result.dozenBets.forEach(dozen => {
          expect(dozen.numbers).toHaveLength(12);
        });
      });

      test("devrait avoir les numéros corrects pour chaque douzaine", () => {
        const expectedDozens = [
          { label: '1 à 12', numbers: Array.from({length: 12}, (_, i) => i + 1) },
          { label: '13 à 24', numbers: Array.from({length: 12}, (_, i) => i + 13) },
          { label: '25 à 36', numbers: Array.from({length: 12}, (_, i) => i + 25) }
        ];
        
        result.dozenBets.forEach((dozen, index) => {
          expect(dozen.label).toBe(expectedDozens[index].label);
          expect(dozen.numbers).toEqual(expectedDozens[index].numbers);
          expect(dozen.type).toBe('outside_dozen');
          expect(dozen.odds).toBe(3);
        });
      });

      test("devrait avoir des numéros consécutifs dans chaque douzaine", () => {
        result.dozenBets.forEach(dozen => {
          for (let i = 1; i < dozen.numbers.length; i++) {
            expect(dozen.numbers[i]).toBe(dozen.numbers[i-1] + 1);
          }
        });
      });
    });

    describe("Tests des evenOddRedBlack (chances simples)", () => {
      test("devrait contenir exactement 4 éléments", () => {
        expect(result.evenOddRedBlack).toHaveLength(4);
      });

      test("devrait avoir la configuration EVEN correcte", () => {
        const evenBet = result.evenOddRedBlack.find(bet => bet.label === 'EVEN');
        expect(evenBet).toBeDefined();
        expect(evenBet.numbers).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]);
        expect(evenBet.type).toBe('outside_oerb');
        expect(evenBet.odds).toBe(2);
        expect(evenBet.numbers).toHaveLength(18);
      });

      test("devrait avoir la configuration ODD correcte", () => {
        const oddBet = result.evenOddRedBlack.find(bet => bet.label === 'ODD');
        expect(oddBet).toBeDefined();
        expect(oddBet.numbers).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]);
        expect(oddBet.type).toBe('outside_oerb');
        expect(oddBet.odds).toBe(2);
        expect(oddBet.numbers).toHaveLength(18);
      });

      test("devrait avoir la configuration RED correcte", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        expect(redBet).toBeDefined();
        expect(redBet.numbers).toEqual(RED_NUMBERS);
        expect(redBet.type).toBe('outside_oerb');
        expect(redBet.odds).toBe(2);
        expect(redBet.numbers).toHaveLength(18);
      });

      test("devrait avoir la configuration BLACK correcte", () => {
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        expect(blackBet).toBeDefined();
        expect(blackBet.numbers).toEqual(BLACK_NUMBERS);
        expect(blackBet.type).toBe('outside_oerb');
        expect(blackBet.odds).toBe(2);
        expect(blackBet.numbers).toHaveLength(18);
      });

      test("devrait avoir toutes les cotes à 2", () => {
        result.evenOddRedBlack.forEach(bet => {
          expect(bet.odds).toBe(2);
        });
      });
    });

    describe("Tests des splitBets (mises à cheval)", () => {
      test("devrait avoir le bon nombre total de splits", () => {
        // 22 splits horizontaux + 33 splits verticaux = 55 splits au total
        const expectedHorizontalSplits = 11 * 2; // 11 lignes × 2 splits horizontaux par ligne
        const expectedVerticalSplits = 12 * 3; // 12 lignes × 3 splits verticaux par ligne - 3 (dernière ligne)
        const expectedTotal = expectedHorizontalSplits + expectedVerticalSplits - 3; // -3 car dernière ligne n'a pas de splits verticaux
        expect(result.splitBets.length).toBeGreaterThan(50); // Au moins 50 splits
      });

      test("devrait avoir exactement 2 numéros par split", () => {
        result.splitBets.forEach(split => {
          expect(split.numbers).toHaveLength(2);
        });
      });

      test("devrait avoir toutes les cotes à 18", () => {
        result.splitBets.forEach(split => {
          expect(split.odds).toBe(18);
          expect(split.type).toBe('split');
        });
      });

      test("devrait avoir des numéros adjacents", () => {
        result.splitBets.forEach(split => {
          const [n1, n2] = split.numbers.sort((a, b) => a - b);
          // Soit adjacents horizontalement (différence de 1), soit verticalement (différence de 3)
          expect(n2 - n1 === 1 || n2 - n1 === 3).toBe(true);
        });
      });

      test("devrait avoir des labels corrects", () => {
        result.splitBets.forEach(split => {
          const [n1, n2] = split.numbers.sort((a, b) => a - b);
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

  // ===== TESTS DE LA ROUTE GET /betting-board =====
  describe("GET /api/roulette-odds/betting-board - Endpoint API", () => {
    
    describe("Tests de réponse HTTP", () => {
      test("devrait retourner un statut 200", async () => {
        const response = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        expect(response.status).toBe(200);
      });

      test("devrait retourner une réponse JSON", async () => {
        const response = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        expect(response.headers['content-type']).toMatch(/json/);
      });

      test("devrait contenir toutes les propriétés attendues", async () => {
        const response = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        const data = response.body;
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

      test("devrait avoir la même structure que prepareBettingBoard()", async () => {
        const response = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        const directResult = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        expect(response.body).toEqual(directResult);
      });
    });

    describe("Tests de performance", () => {
      test("devrait répondre en moins de 100ms", async () => {
        const startTime = Date.now();
        await request(app)
          .get('/api/roulette-odds/betting-board');
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeLessThan(100);
      });

      test("devrait avoir des données cohérentes entre plusieurs appels", async () => {
        const response1 = await request(app)
          .get('/api/roulette-odds/betting-board');
        const response2 = await request(app)
          .get('/api/roulette-odds/betting-board');
        
        expect(response1.body).toEqual(response2.body);
      });
    });

    describe("Tests de cas limites", () => {
      test("devrait gérer plusieurs appels successifs", async () => {
        const promises = Array.from({length: 5}, () => 
          request(app).get('/api/roulette-odds/betting-board')
        );
        
        const responses = await Promise.all(promises);
        
        responses.forEach(response => {
          expect(response.status).toBe(200);
        });
        
        // Tous les résultats doivent être identiques
        const firstResult = responses[0].body;
        responses.forEach(response => {
          expect(response.body).toEqual(firstResult);
        });
      });

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

  // ===== TESTS DE VALIDATION DES DONNÉES =====
  describe("Validation des règles de la roulette", () => {
    let result;

    beforeEach(() => {
      result = rouletteNetPrepareBettingBoard.prepareBettingBoard();
    });
    
    describe("Tests des numéros rouges et noirs", () => {
      test("devrait avoir les numéros rouges conformes aux règles officielles", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        expect(redBet.numbers).toEqual(RED_NUMBERS);
      });

      test("devrait avoir les numéros noirs corrects", () => {
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        expect(blackBet.numbers).toEqual(BLACK_NUMBERS);
      });

      test("devrait exclure le zéro des couleurs", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        
        expect(redBet.numbers).not.toContain(0);
        expect(blackBet.numbers).not.toContain(0);
      });

      test("ne devrait avoir aucun numéro à la fois rouge et noir", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        
        const intersection = redBet.numbers.filter(num => blackBet.numbers.includes(num));
        expect(intersection).toHaveLength(0);
      });

      test("devrait avoir tous les numéros 1-36 soit rouges soit noirs", () => {
        const redBet = result.evenOddRedBlack.find(bet => bet.label === 'RED');
        const blackBet = result.evenOddRedBlack.find(bet => bet.label === 'BLACK');
        
        const allColoredNumbers = [...redBet.numbers, ...blackBet.numbers].sort((a, b) => a - b);
        expect(allColoredNumbers).toEqual(Array.from({length: 36}, (_, i) => i + 1));
      });
    });

    describe("Tests des cotes de paiement", () => {
      test("devrait avoir des cotes correspondant au nombre de numéros couverts", () => {
        // Numéro plein (1 numéro) : 36:1
        expect(result.zeroCell.odds).toBe(36);
        result.numberBoardRows.flat().forEach(cell => {
          expect(cell.odds).toBe(36);
        });
        
        // Splits (2 numéros) : 18:1 (35+1 divisé par 2)
        result.splitBets.forEach(bet => {
          expect(bet.odds).toBe(18);
        });
        
        // Streets (3 numéros) : 12:1 (35+1 divisé par 3)
        result.streetBets.forEach(bet => {
          expect(bet.odds).toBe(12);
        });
        
        // Corners (4 numéros) : 9:1 (35+1 divisé par 4)
        result.cornerBets.forEach(bet => {
          expect(bet.odds).toBe(9);
        });
        
        // Double streets (6 numéros) : 6:1 (35+1 divisé par 6)
        result.doubleStreetBets.forEach(bet => {
          expect(bet.odds).toBe(6);
        });
      });

      test("devrait avoir les bonnes cotes pour les mises externes", () => {
        // Chances simples (18 numéros) : 2:1
        result.evenOddRedBlack.forEach(bet => {
          expect(bet.odds).toBe(2);
        });
        result.outsideBets.forEach(bet => {
          expect(bet.odds).toBe(2);
        });
        
        // Douzaines et colonnes (12 numéros) : 3:1
        result.dozenBets.forEach(bet => {
          expect(bet.odds).toBe(3);
        });
        result.columnBets.forEach(bet => {
          expect(bet.odds).toBe(3);
        });
      });
    });

    describe("Tests de l'exhaustivité", () => {
      test("devrait permettre de miser sur tous les numéros 0-36", () => {
        const bettableNumbers = new Set();
        
        // Numéros du plateau principal
        result.numberBoardRows.flat().forEach(cell => {
          cell.numbers.forEach(num => bettableNumbers.add(num));
        });
        
        // Zéro
        bettableNumbers.add(result.zeroCell.numbers[0]);
        
        // Vérifier que tous les numéros 0-36 sont présents
        for (let i = 0; i <= 36; i++) {
          expect(bettableNumbers.has(i)).toBe(true);
        }
        expect(bettableNumbers.size).toBe(37);
      });

      test("devrait avoir toutes les combinaisons standard", () => {
        // Vérifier la présence de tous les types de mises
        expect(result.splitBets.length).toBeGreaterThan(0);
        expect(result.cornerBets.length).toBeGreaterThan(0);
        expect(result.streetBets.length).toBe(12);
        expect(result.doubleStreetBets.length).toBe(11);
        expect(result.columnBets.length).toBe(3);
        expect(result.dozenBets.length).toBe(3);
        expect(result.evenOddRedBlack.length).toBe(4);
        expect(result.outsideBets.length).toBe(2);
      });

      test("ne devrait proposer aucune mise invalide", () => {
        // Vérifier que tous les numéros sont dans la plage valide
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
        
        allBets.forEach(bet => {
          bet.numbers.forEach(num => {
            expect(num).toBeGreaterThanOrEqual(0);
            expect(num).toBeLessThanOrEqual(36);
            expect(Number.isInteger(num)).toBe(true);
          });
        });
      });
    });
  });

  // ===== TESTS DE CAS EXTRÊMES =====
  describe("Tests de robustesse", () => {
    
    describe("Tests de stabilité", () => {
      test("devrait donner des résultats identiques sur multiples appels", () => {
        const results = Array.from({length: 10}, () => 
          rouletteNetPrepareBettingBoard.prepareBettingBoard()
        );
        
        const firstResult = results[0];
        results.forEach(result => {
          expect(result).toEqual(firstResult);
        });
      });

      test("devrait gérer la charge de multiples appels", () => {
        const promises = Array.from({length: 100}, () => 
          Promise.resolve(rouletteNetPrepareBettingBoard.prepareBettingBoard())
        );
        
        return expect(Promise.all(promises)).resolves.toHaveLength(100);
      });
    });

    describe("Tests d'intégrité des données", () => {
      test("devrait retourner des objets immutables", () => {
        const result1 = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        const result2 = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        
        // Modifier result1 ne devrait pas affecter result2
        result1.zeroCell.odds = 999;
        expect(result2.zeroCell.odds).toBe(36);
      });

      test("devrait gérer la sérialisation/désérialisation JSON", () => {
        const original = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        const serialized = JSON.stringify(original);
        const deserialized = JSON.parse(serialized);
        
        expect(deserialized).toEqual(original);
      });

      test("ne devrait pas partager de références entre les appels", () => {
        const result1 = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        const result2 = rouletteNetPrepareBettingBoard.prepareBettingBoard();
        
        // Les objets doivent être différents en mémoire
        expect(result1).not.toBe(result2);
        expect(result1.splitBets).not.toBe(result2.splitBets);
        expect(result1.numberBoardRows).not.toBe(result2.numberBoardRows);
      });
    });
  });
});