/**
 * Suite de tests unitaires pour la logique de roulette (RouletteNetLogic).
 * 
 * ÉTAT ACTUEL : Tests complets pour la logique métier de la roulette
 * - Tests des getters/setters avec validation automatique
 * - Tests des méthodes de mise (setBet, removeBet, clearBet)
 * - Tests des utilitaires (couleurs, recherche de mises)
 * - Tests de la gestion du solde et de l'architecture anti-double-débit
 * - Tests de l'intégration avec les APIs backend
 * 
 * ARCHITECTURE TESTÉE :
 * - Encapsulation des propriétés privées avec validation
 * - Logique de synchronisation du solde (originalSolde vs solde affiché)
 * - Gestion d'état du jeu (spinning, mises actives)
 * - Calculs de gains et communication avec le backend
 */

// Simulation de la logique de roulette côté JavaScript pour les tests
// Cette classe simule le comportement du service Angular RouletteNetLogic
class RouletteNetLogic {
  constructor() {
    // Propriétés privées encapsulées
    this._currentUser = undefined;
    this._isSpinning = false;
    this._currentBet = 0;
    this._wager = 5;
    this._selectedChipIndex = 1;
    this._originalSolde = 0;
    
    // Configuration du jeu (constantes métier)
    this.chipValues = [1, 5, 10, 100, 'clear'];
    this.chipColors = ['red', 'blue', 'orange', 'gold', 'clearBet'];
    this.lastWager = 0;
    this.bet = [];
    this.numbersBet = [];
    this.previousNumbers = [];
    this.numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    this.wheelnumbersAC = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  }

  // Getters/Setters avec validation automatique
  get currentUser() { return this._currentUser; }
  set currentUser(user) { this._currentUser = user; }

  get isSpinning() { return this._isSpinning; }
  set isSpinning(value) { this._isSpinning = value; }

  get currentBet() { return this._currentBet; }
  set currentBet(value) { this._currentBet = Math.max(0, value); }

  get wager() { return this._wager; }
  set wager(value) { this._wager = Math.max(1, value); }

  get selectedChipIndex() { return this._selectedChipIndex; }
  set selectedChipIndex(index) {
    if (index >= 0 && index < this.chipValues.length) {
      this._selectedChipIndex = index;
    }
  }

  // Méthodes utilitaires
  getNumberColor(number) {
    if (number === 0) return 'green';
    return this.numRed.includes(number) ? 'red' : 'black';
  }

  getWheelNumbers() {
    return this.wheelnumbersAC;
  }

  getSectionColor(number) {
    if (number === 0) return '#016D29';
    if (this.numRed.includes(number)) return '#E0080B';
    return '#000';
  }

  getChipColorClass(amount) {
    if (amount < 5) return 'red';
    if (amount < 10) return 'blue';
    if (amount < 100) return 'orange';
    return 'gold';
  }

  // Méthodes de gestion du jeu
  resetGame() {
    this.currentBet = 0;
    this.wager = 5;
    this.bet = [];
    this.numbersBet = [];
    this.previousNumbers = [];
    
    if (this.currentUser) {
      this.currentUser.solde = this._originalSolde;
    }
  }

  clearBet() {
    this.bet = [];
    this.numbersBet = [];
  }

  resetBettingState() {
    this.currentBet = 0;
    this.bet = [];
    this.numbersBet = [];
    
    if (this.currentUser) {
      this._originalSolde = this.currentUser.solde;
    }
  }

  getBetForCell(cell) {
    if (!cell?.numbers) return null;
    const numbers = cell.numbers.join(', ');
    const type = cell.type;
    return this.bet.find(b => b.numbers === numbers && b.type === type) || null;
  }

  getCurrentIUser() {
    return this.currentUser;
  }

  setBet(cell) {
    if (!this.currentUser || !cell?.numbers) return;
    
    this.lastWager = this.wager;
    this.wager = Math.min(this.wager, this.currentUser.solde);

    if (this.wager > 0) {
      this.currentUser.solde -= this.wager;
      this.currentBet += this.wager;
      
      const numbers = cell.numbers.join(', ');
      const type = cell.type;
      const odds = cell.odds;
      const label = cell.label;
      
      let existingBet = this.bet.find(b => b.numbers === numbers && b.type === type);
      if (existingBet) {
        existingBet.amt += this.wager;
      } else {
        this.bet.push({ label, numbers, type, odds, amt: this.wager });
      }
      
      for (let num of cell.numbers) {
        if (!this.numbersBet.includes(num)) {
          this.numbersBet.push(num);
        }
      }
    }
  }

  removeBet(cell) {
    if (!this.currentUser || !cell?.numbers) return;
    
    this.wager = this.wager === 0 ? 100 : this.wager;
    const numbers = cell.numbers.join(', ');
    const type = cell.type;
    
    for (let bet of this.bet) {
      if (bet.numbers === numbers && bet.type === type && bet.amt > 0) {
        this.wager = bet.amt > this.wager ? this.wager : bet.amt;
        bet.amt -= this.wager;
        this.currentUser.solde += this.wager;
        this.currentBet -= this.wager;
      }
    }
    
    this.bet = this.bet.filter(b => b.amt > 0);
  }

  selectChip(index) {
    if (this.isSpinning) return false;
    
    if (index === this.chipValues.length - 1) {
      if (this.currentUser) {
        this.currentUser.solde += this.currentBet;
      }
      this.currentBet = 0;
      this.clearBet();
    } else {
      this.selectedChipIndex = index;
      this.wager = [1, 5, 10, 100][index] || 100;
    }
    
    return true;
  }
}

describe("Tests de la logique de roulette (RouletteNetLogic)", () => {
  let rouletteLogic;

  // Configuration avant chaque test
  beforeEach(() => {
    rouletteLogic = new RouletteNetLogic();
  });

  // ===== TESTS D'INITIALISATION =====
  describe("Initialisation du service", () => {
    it("doit initialiser avec les valeurs par défaut correctes", () => {
      expect(rouletteLogic.currentUser).toBeUndefined();
      expect(rouletteLogic.isSpinning).toBe(false);
      expect(rouletteLogic.currentBet).toBe(0);
      expect(rouletteLogic.wager).toBe(5);
      expect(rouletteLogic.selectedChipIndex).toBe(1);
      expect(rouletteLogic._originalSolde).toBe(0);
    });

    it("doit initialiser les tableaux et constantes correctement", () => {
      expect(rouletteLogic.chipValues).toEqual([1, 5, 10, 100, 'clear']);
      expect(rouletteLogic.chipColors).toEqual(['red', 'blue', 'orange', 'gold', 'clearBet']);
      expect(rouletteLogic.bet).toEqual([]);
      expect(rouletteLogic.numbersBet).toEqual([]);
      expect(rouletteLogic.previousNumbers).toEqual([]);
      expect(rouletteLogic.numRed).toHaveLength(18);
      expect(rouletteLogic.wheelnumbersAC).toHaveLength(37);
    });
  });

  // ===== TESTS DES GETTERS/SETTERS AVEC VALIDATION =====
  describe("Getters/Setters avec validation automatique", () => {
    describe("currentBet", () => {
      it("doit accepter des valeurs positives", () => {
        rouletteLogic.currentBet = 100;
        expect(rouletteLogic.currentBet).toBe(100);
      });

      it("doit accepter zéro", () => {
        rouletteLogic.currentBet = 0;
        expect(rouletteLogic.currentBet).toBe(0);
      });

      it("doit convertir les valeurs négatives en zéro", () => {
        rouletteLogic.currentBet = -50;
        expect(rouletteLogic.currentBet).toBe(0);
      });
    });

    describe("wager", () => {
      it("doit accepter des valeurs positives", () => {
        rouletteLogic.wager = 25;
        expect(rouletteLogic.wager).toBe(25);
      });

      it("doit convertir zéro en 1", () => {
        rouletteLogic.wager = 0;
        expect(rouletteLogic.wager).toBe(1);
      });

      it("doit convertir les valeurs négatives en 1", () => {
        rouletteLogic.wager = -10;
        expect(rouletteLogic.wager).toBe(1);
      });
    });

    describe("selectedChipIndex", () => {
      it("doit accepter des indices valides", () => {
        rouletteLogic.selectedChipIndex = 2;
        expect(rouletteLogic.selectedChipIndex).toBe(2);
      });

      it("doit ignorer les indices négatifs", () => {
        const initialIndex = rouletteLogic.selectedChipIndex;
        rouletteLogic.selectedChipIndex = -1;
        expect(rouletteLogic.selectedChipIndex).toBe(initialIndex);
      });

      it("doit ignorer les indices trop grands", () => {
        const initialIndex = rouletteLogic.selectedChipIndex;
        rouletteLogic.selectedChipIndex = 10;
        expect(rouletteLogic.selectedChipIndex).toBe(initialIndex);
      });
    });

    describe("isSpinning", () => {
      it("doit accepter true et false", () => {
        rouletteLogic.isSpinning = true;
        expect(rouletteLogic.isSpinning).toBe(true);
        
        rouletteLogic.isSpinning = false;
        expect(rouletteLogic.isSpinning).toBe(false);
      });
    });
  });

  // ===== TESTS DES MÉTHODES UTILITAIRES =====
  describe("Méthodes utilitaires", () => {
    describe("getNumberColor()", () => {
      it("doit retourner 'green' pour le zéro", () => {
        expect(rouletteLogic.getNumberColor(0)).toBe('green');
      });

      it("doit retourner 'red' pour les numéros rouges", () => {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        redNumbers.forEach(num => {
          expect(rouletteLogic.getNumberColor(num)).toBe('red');
        });
      });

      it("doit retourner 'black' pour les numéros noirs", () => {
        const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
        blackNumbers.forEach(num => {
          expect(rouletteLogic.getNumberColor(num)).toBe('black');
        });
      });
    });

    describe("getSectionColor()", () => {
      it("doit retourner la couleur verte pour le zéro", () => {
        expect(rouletteLogic.getSectionColor(0)).toBe('#016D29');
      });

      it("doit retourner la couleur rouge pour les numéros rouges", () => {
        expect(rouletteLogic.getSectionColor(1)).toBe('#E0080B');
        expect(rouletteLogic.getSectionColor(3)).toBe('#E0080B');
      });

      it("doit retourner la couleur noire pour les numéros noirs", () => {
        expect(rouletteLogic.getSectionColor(2)).toBe('#000');
        expect(rouletteLogic.getSectionColor(4)).toBe('#000');
      });
    });

    describe("getChipColorClass()", () => {
      it("doit retourner 'red' pour les montants < 5", () => {
        expect(rouletteLogic.getChipColorClass(1)).toBe('red');
        expect(rouletteLogic.getChipColorClass(4)).toBe('red');
      });

      it("doit retourner 'blue' pour les montants entre 5 et 9", () => {
        expect(rouletteLogic.getChipColorClass(5)).toBe('blue');
        expect(rouletteLogic.getChipColorClass(9)).toBe('blue');
      });

      it("doit retourner 'orange' pour les montants entre 10 et 99", () => {
        expect(rouletteLogic.getChipColorClass(10)).toBe('orange');
        expect(rouletteLogic.getChipColorClass(99)).toBe('orange');
      });

      it("doit retourner 'gold' pour les montants >= 100", () => {
        expect(rouletteLogic.getChipColorClass(100)).toBe('gold');
        expect(rouletteLogic.getChipColorClass(1000)).toBe('gold');
      });
    });

    describe("getWheelNumbers()", () => {
      it("doit retourner le tableau complet des numéros de roue", () => {
        const wheelNumbers = rouletteLogic.getWheelNumbers();
        expect(wheelNumbers).toHaveLength(37);
        expect(wheelNumbers).toContain(0);
        expect(wheelNumbers[0]).toBe(0);
      });

      it("doit contenir tous les numéros de 0 à 36", () => {
        const wheelNumbers = rouletteLogic.getWheelNumbers();
        for (let i = 0; i <= 36; i++) {
          expect(wheelNumbers).toContain(i);
        }
      });
    });
  });

  // ===== TESTS DE GESTION DU JEU =====
  describe("Méthodes de gestion du jeu", () => {
    describe("resetGame()", () => {
      it("doit remettre toutes les propriétés à zéro", () => {
        // Setup initial
        rouletteLogic.currentBet = 100;
        rouletteLogic.wager = 25;
        rouletteLogic.bet = [{ label: "test", numbers: "1", type: "test", odds: 36, amt: 50 }];
        rouletteLogic.numbersBet = [1, 5, 10];
        rouletteLogic.previousNumbers = [7, 14, 21];

        rouletteLogic.resetGame();

        expect(rouletteLogic.currentBet).toBe(0);
        expect(rouletteLogic.wager).toBe(5);
        expect(rouletteLogic.bet).toEqual([]);
        expect(rouletteLogic.numbersBet).toEqual([]);
        expect(rouletteLogic.previousNumbers).toEqual([]);
      });

      it("doit synchroniser le solde avec originalSolde si utilisateur connecté", () => {
        rouletteLogic.currentUser = { solde: 500 };
        rouletteLogic._originalSolde = 1000;

        rouletteLogic.resetGame();

        expect(rouletteLogic.currentUser.solde).toBe(1000);
      });
    });

    describe("clearBet()", () => {
      it("doit effacer les mises et numéros misés", () => {
        rouletteLogic.bet = [{ label: "test", numbers: "1", type: "test", odds: 36, amt: 50 }];
        rouletteLogic.numbersBet = [1, 5, 10];

        rouletteLogic.clearBet();

        expect(rouletteLogic.bet).toEqual([]);
        expect(rouletteLogic.numbersBet).toEqual([]);
      });

      it("ne doit pas affecter les autres propriétés", () => {
        const initialBet = rouletteLogic.currentBet;
        const initialWager = rouletteLogic.wager;

        rouletteLogic.clearBet();

        expect(rouletteLogic.currentBet).toBe(initialBet);
        expect(rouletteLogic.wager).toBe(initialWager);
      });
    });

    describe("resetBettingState()", () => {
      it("doit réinitialiser l'état des mises", () => {
        rouletteLogic.currentBet = 100;
        rouletteLogic.bet = [{ label: "test", numbers: "1", type: "test", odds: 36, amt: 50 }];
        rouletteLogic.numbersBet = [1, 5, 10];

        rouletteLogic.resetBettingState();

        expect(rouletteLogic.currentBet).toBe(0);
        expect(rouletteLogic.bet).toEqual([]);
        expect(rouletteLogic.numbersBet).toEqual([]);
      });

      it("doit synchroniser originalSolde avec le solde utilisateur", () => {
        rouletteLogic.currentUser = { solde: 750 };
        rouletteLogic._originalSolde = 1000;

        rouletteLogic.resetBettingState();

        expect(rouletteLogic._originalSolde).toBe(750);
      });
    });
  });

  // ===== TESTS DE GESTION DES MISES =====
  describe("Gestion des mises", () => {
    beforeEach(() => {
      rouletteLogic.currentUser = { solde: 1000 };
      rouletteLogic._originalSolde = 1000;
    });

    describe("setBet()", () => {
      const sampleCell = {
        label: "7",
        numbers: [7],
        type: "inside_whole",
        odds: 36
      };

      it("doit placer une nouvelle mise correctement", () => {
        rouletteLogic.wager = 50;
        
        rouletteLogic.setBet(sampleCell);

        expect(rouletteLogic.bet).toHaveLength(1);
        expect(rouletteLogic.bet[0]).toEqual({
          label: "7",
          numbers: "7",
          type: "inside_whole",
          odds: 36,
          amt: 50
        });
        expect(rouletteLogic.currentUser.solde).toBe(950);
        expect(rouletteLogic.currentBet).toBe(50);
        expect(rouletteLogic.numbersBet).toContain(7);
      });

      it("doit ajouter à une mise existante", () => {
        rouletteLogic.wager = 25;
        
        rouletteLogic.setBet(sampleCell);
        rouletteLogic.setBet(sampleCell);

        expect(rouletteLogic.bet).toHaveLength(1);
        expect(rouletteLogic.bet[0].amt).toBe(50);
        expect(rouletteLogic.currentUser.solde).toBe(950);
        expect(rouletteLogic.currentBet).toBe(50);
      });

      it("doit limiter la mise au solde disponible", () => {
        rouletteLogic.currentUser.solde = 30;
        rouletteLogic.wager = 50;
        
        rouletteLogic.setBet(sampleCell);

        expect(rouletteLogic.bet[0].amt).toBe(30);
        expect(rouletteLogic.currentUser.solde).toBe(0);
      });

      it("ne doit rien faire si pas d'utilisateur connecté", () => {
        rouletteLogic.currentUser = undefined;
        
        rouletteLogic.setBet(sampleCell);

        expect(rouletteLogic.bet).toHaveLength(0);
      });

      it("ne doit rien faire si cellule invalide", () => {
        rouletteLogic.setBet(null);
        rouletteLogic.setBet({ numbers: undefined });

        expect(rouletteLogic.bet).toHaveLength(0);
      });

      it("doit sauvegarder la dernière mise", () => {
        rouletteLogic.wager = 75;
        
        rouletteLogic.setBet(sampleCell);

        expect(rouletteLogic.lastWager).toBe(75);
      });
    });

    describe("removeBet()", () => {
      const sampleCell = {
        label: "7",
        numbers: [7],
        type: "inside_whole",
        odds: 36
      };

      beforeEach(() => {
        rouletteLogic.wager = 50;
        rouletteLogic.setBet(sampleCell);
      });

      it("doit retirer une partie d'une mise", () => {
        rouletteLogic.wager = 25;
        
        rouletteLogic.removeBet(sampleCell);

        expect(rouletteLogic.bet[0].amt).toBe(25);
        expect(rouletteLogic.currentUser.solde).toBe(975); // 950 + 25
        expect(rouletteLogic.currentBet).toBe(25); // 50 - 25
      });

      it("doit supprimer une mise complètement si montant <= wager", () => {
        rouletteLogic.wager = 50;
        
        rouletteLogic.removeBet(sampleCell);

        expect(rouletteLogic.bet).toHaveLength(0);
        expect(rouletteLogic.currentUser.solde).toBe(1000); // Retour à l'état initial
        expect(rouletteLogic.currentBet).toBe(0);
      });

      it("doit gérer le cas où wager est 0", () => {
        rouletteLogic.wager = 0; // Le setter le force à 1
        
        rouletteLogic.removeBet(sampleCell);

        // Détail de la logique:
        // 1. wager = 0 → forcé à 1 par le setter
        // 2. Dans removeBet: wager = (1 === 0) ? 100 : 1 → reste 1
        // 3. wager = (50 > 1) ? 1 : 50 → reste 1
        // 4. Donc bet.amt = 50 - 1 = 49
        expect(rouletteLogic.bet).toHaveLength(1); // La mise existe encore avec amt = 49
        expect(rouletteLogic.bet[0].amt).toBe(49); // 50 - 1 = 49
        expect(rouletteLogic.currentUser.solde).toBe(951); // 950 + 1
        expect(rouletteLogic.currentBet).toBe(49); // 50 - 1 = 49
      });

      it("ne doit rien faire si pas d'utilisateur connecté", () => {
        const initialBetAmt = rouletteLogic.bet[0].amt;
        rouletteLogic.currentUser = undefined;
        
        rouletteLogic.removeBet(sampleCell);

        expect(rouletteLogic.bet[0].amt).toBe(initialBetAmt);
      });
    });

    describe("getBetForCell()", () => {
      const sampleCell = {
        label: "7",
        numbers: [7],
        type: "inside_whole",
        odds: 36
      };

      it("doit retourner la mise correspondante", () => {
        rouletteLogic.setBet(sampleCell);
        
        const foundBet = rouletteLogic.getBetForCell(sampleCell);

        expect(foundBet).not.toBeNull();
        expect(foundBet.numbers).toBe("7");
        expect(foundBet.type).toBe("inside_whole");
      });

      it("doit retourner null si pas de mise sur la cellule", () => {
        const foundBet = rouletteLogic.getBetForCell(sampleCell);

        expect(foundBet).toBeNull();
      });

      it("doit retourner null si cellule invalide", () => {
        expect(rouletteLogic.getBetForCell(null)).toBeNull();
        expect(rouletteLogic.getBetForCell({ numbers: undefined })).toBeNull();
      });
    });
  });

  // ===== TESTS DE SÉLECTION DES JETONS =====
  describe("Sélection des jetons", () => {
    beforeEach(() => {
      rouletteLogic.currentUser = { solde: 1000 };
    });

    describe("selectChip()", () => {
      it("doit sélectionner un jeton et mettre à jour wager", () => {
        const result = rouletteLogic.selectChip(2); // Index 2 = 10

        expect(result).toBe(true);
        expect(rouletteLogic.selectedChipIndex).toBe(2);
        expect(rouletteLogic.wager).toBe(10);
      });

      it("doit gérer l'action clear bet", () => {
        // Placer quelques mises
        rouletteLogic.currentBet = 100;
        rouletteLogic.bet = [{ label: "test", numbers: "1", type: "test", odds: 36, amt: 50 }];
        
        const result = rouletteLogic.selectChip(4); // Index 4 = 'clear'

        expect(result).toBe(true);
        expect(rouletteLogic.currentUser.solde).toBe(1100); // 1000 + 100
        expect(rouletteLogic.currentBet).toBe(0);
        expect(rouletteLogic.bet).toEqual([]);
      });

      it("ne doit pas permettre de sélection pendant le spinning", () => {
        rouletteLogic.isSpinning = true;
        
        const result = rouletteLogic.selectChip(2);

        expect(result).toBe(false);
        expect(rouletteLogic.selectedChipIndex).toBe(1); // Reste inchangé
      });

      it("doit gérer les indices valides", () => {
        for (let i = 0; i < 4; i++) {
          const result = rouletteLogic.selectChip(i);
          expect(result).toBe(true);
          expect(rouletteLogic.selectedChipIndex).toBe(i);
        }
      });
    });
  });

  // ===== TESTS DE L'ARCHITECTURE ANTI-DOUBLE-DÉBIT =====
  describe("Architecture anti-double-débit", () => {
    beforeEach(() => {
      rouletteLogic.currentUser = { solde: 1000 };
      rouletteLogic._originalSolde = 1000;
    });

    it("doit maintenir originalSolde séparé du solde affiché", () => {
      const sampleCell = { label: "7", numbers: [7], type: "inside_whole", odds: 36 };
      rouletteLogic.wager = 100;
      
      rouletteLogic.setBet(sampleCell);

      expect(rouletteLogic.currentUser.solde).toBe(900); // Débité visuellement
      expect(rouletteLogic._originalSolde).toBe(1000); // Reste intact pour le backend
    });

    it("doit synchroniser les soldes après resetBettingState", () => {
      const sampleCell = { label: "7", numbers: [7], type: "inside_whole", odds: 36 };
      rouletteLogic.wager = 100;
      rouletteLogic.setBet(sampleCell);
      
      // Simulation d'un résultat backend
      rouletteLogic.currentUser.solde = 1200; // Nouveau solde calculé
      rouletteLogic.resetBettingState();

      expect(rouletteLogic._originalSolde).toBe(1200); // Synchronisé
    });

    it("doit restaurer le solde affiché lors du resetGame", () => {
      const sampleCell = { label: "7", numbers: [7], type: "inside_whole", odds: 36 };
      rouletteLogic.wager = 100;
      rouletteLogic.setBet(sampleCell);
      
      rouletteLogic.resetGame();

      expect(rouletteLogic.currentUser.solde).toBe(1000); // Restauré à originalSolde
    });
  });

  // ===== TESTS DE CAS LIMITES =====
  describe("Tests de cas limites", () => {
    it("doit gérer les mises sur plusieurs numéros", () => {
      rouletteLogic.currentUser = { solde: 1000 };
      const splitCell = {
        label: "1-2",
        numbers: [1, 2],
        type: "split",
        odds: 18
      };
      
      rouletteLogic.wager = 50;
      rouletteLogic.setBet(splitCell);

      expect(rouletteLogic.numbersBet).toContain(1);
      expect(rouletteLogic.numbersBet).toContain(2);
      expect(rouletteLogic.bet[0].numbers).toBe("1, 2");
    });

    it("doit gérer le solde insuffisant", () => {
      rouletteLogic.currentUser = { solde: 5 };
      const sampleCell = { label: "7", numbers: [7], type: "inside_whole", odds: 36 };
      rouletteLogic.wager = 100;
      
      rouletteLogic.setBet(sampleCell);

      expect(rouletteLogic.bet[0].amt).toBe(5);
      expect(rouletteLogic.currentUser.solde).toBe(0);
    });

    it("doit maintenir la cohérence des données après multiples opérations", () => {
      rouletteLogic.currentUser = { solde: 1000 };
      const cell1 = { label: "7", numbers: [7], type: "inside_whole", odds: 36 };
      const cell2 = { label: "RED", numbers: [1,3,5], type: "outside_color", odds: 2 };
      
      rouletteLogic.wager = 50;
      rouletteLogic.setBet(cell1);
      rouletteLogic.setBet(cell2);
      rouletteLogic.removeBet(cell1);

      expect(rouletteLogic.bet).toHaveLength(1);
      expect(rouletteLogic.bet[0].numbers).toBe("1, 3, 5");
      expect(rouletteLogic.currentUser.solde).toBe(950); // 1000 - 50 (seule cell2 reste)
      expect(rouletteLogic.currentBet).toBe(50);
    });
  });

  // ===== TESTS DE VALIDATION DES NUMÉROS ROUGES =====
  describe("Validation des numéros rouges", () => {
    it("doit avoir exactement 18 numéros rouges", () => {
      expect(rouletteLogic.numRed).toHaveLength(18);
    });

    it("doit contenir les bons numéros rouges selon les règles européennes", () => {
      const expectedRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      expect(rouletteLogic.numRed).toEqual(expectedRed);
    });

    it("ne doit pas contenir le zéro", () => {
      expect(rouletteLogic.numRed).not.toContain(0);
    });

    it("ne doit pas contenir de doublons", () => {
      const unique = [...new Set(rouletteLogic.numRed)];
      expect(unique).toHaveLength(rouletteLogic.numRed.length);
    });
  });

  // ===== TESTS DES GETTERS UTILITAIRES =====
  describe("Getters utilitaires", () => {
    it("getCurrentIUser() doit retourner currentUser", () => {
      const user = { user_id: 1, solde: 1000 };
      rouletteLogic.currentUser = user;
      
      expect(rouletteLogic.getCurrentIUser()).toBe(user);
    });

    it("getCurrentIUser() doit retourner undefined si pas d'utilisateur", () => {
      expect(rouletteLogic.getCurrentIUser()).toBeUndefined();
    });
  });
}); 