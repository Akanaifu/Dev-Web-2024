import { Database, ref, get, child, set } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { NewGameService } from '../../services/new-game.service';

interface Combination {
  id: string;
  title: string;
  combination: string;
  multiplier: number;
  example: string;
  class: string;
}

interface Afficheur {
  id: string;
  currentChiffre: number;
}

export class MachineASousLogic {
  // Properties
  private db: Database;
  private newGameService: NewGameService;

  public highlightCombination: any = null;
  public showTable: boolean = false;
  public intervalId: any;

  title = 'Machine à sous';
  combinations: Combination[] = [
    {
      id: 'combo-1',
      title: 'Méga-jackpot',
      combination: '777',
      multiplier: 100,
      example: '777',
      class: 'mega-jackpot',
    },
    {
      id: 'combo-2',
      title: 'Jackpot',
      combination: 'xxx',
      multiplier: 10,
      example: '222',
      class: 'jackpot',
    },
    {
      id: 'combo-3',
      title: 'Suite',
      combination: 'xyz/zyx',
      multiplier: 5,
      example: '123 / 321',
      class: 'suite',
    },
    {
      id: 'combo-4',
      title: 'Sandwich',
      combination: 'xyx',
      multiplier: 2,
      example: '121',
      class: 'sandwich',
    },
    {
      id: 'combo-5',
      title: '(Im)pair',
      combination: 'ace/bdf',
      multiplier: 1.5,
      example: '111 / 222',
      class: 'im-pair',
    },
    {
      id: 'combo-4.5',
      title: 'Perte de gain',
      combination: '',
      multiplier: 0,
      class: 'loss-row',
      example: 'Perte de gain',
    },
    {
      id: 'combo-6',
      title: 'Un seul 7',
      combination: 'x7x',
      multiplier: 0.5,
      example: '172',
      class: 'un-seul-7',
    },
    {
      id: 'combo-7',
      title: 'Double 7',
      combination: 'x77',
      multiplier: 1,
      example: '177 / 771',
      class: 'double-7',
    },
  ];

  afficheurs: Afficheur[] = [
    { id: 'afficheur1', currentChiffre: 0 },
    { id: 'afficheur2', currentChiffre: 0 },
    { id: 'afficheur3', currentChiffre: 0 },
  ];
  playerInfo: {
    user_id: number;
    username: string;
    email: string;
    solde: number;
  } = {
    user_id: 0,
    username: '',
    email: '',
    solde: 0,
  };
  private http: HttpClient;

  constructor(db: Database, newGameService: NewGameService, http: HttpClient) {
    this.http = http;
    this.db = db;
    this.newGameService = newGameService;
  }

  // Utility Methods
  private updateAfficheurs(combination: string): void {
    this.afficheurs.forEach((afficheur, i) => {
      afficheur.currentChiffre = +combination[i] || 0;
    });
  }

  private updateGainDisplay(gain: number): void {
    if (typeof document !== 'undefined') {
      const gainElement = document.getElementById('gain');
      if (gainElement) {
        gainElement.textContent = `Gain: ${gain}`;
      }
    } else {
      console.warn('updateGainDisplay called in a non-browser environment');
    }
  }

  // Core Logic
  computeQuadraticFunction(long_arr: number): (x: number) => number {
    const mid = long_arr / 2;
    const origine = 1000; // f(0) = 1000
    const ymin = 50; // f(mid) = 50

    const a = (origine - ymin) / (mid * mid); // a = (1000 - 200) / mid²
    const b = -2 * a * mid;

    return (x: number) => a * x * x + b * x + origine;
  }

  checkCombination(): void {
    const digits = this.afficheurs.map((a) => a.currentChiffre);
    const [a, b, c] = digits;
    const combination = digits.join('');
    let presence_event = true;
    const matched: string[] = [];

    if (combination === '777') {
      matched.push('combo-1');
    } else if (a === b && b === c) {
      matched.push('combo-2');
    } else if ((a === b + 1 && b === c + 1) || (a === b - 1 && b === c - 1)) {
      matched.push('combo-3');
    } else if (a === c) {
      matched.push('combo-4');
    } else {
      presence_event = false;
    }

    const isAllEven = digits.every((d) => d % 2 === 0);
    const isAllOdd = digits.every((d) => d % 2 !== 0);
    const isNotTriple = !(a === b && b === c);

    if ((isAllEven || isAllOdd) && isNotTriple) {
      matched.push('combo-5');
    } else {
      presence_event = false;
    }

    let count_sept = digits.filter((digit) => digit === 7).length;
    if (!presence_event) {
      if (count_sept === 1) {
        matched.push('combo-6');
      } else if (count_sept === 2) {
        matched.push('combo-7');
      }
    }

    this.highlightCombination = matched.length ? matched.join(', ') : null;
  }

  // Firebase Data Handling
  fetchFirebaseData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getCurrentUserId();

      get(child(ref(this.db), '/'))
        .then((snapshot) => {
          if (!snapshot.exists()) {
            console.log('No data available');
            resolve();
            return;
          }

          const data = snapshot.val();
          const sortedParts = this.sortAndFilterParts(
            data,
            this.playerInfo.user_id.toString()
          );
          this.showTable = sortedParts.notPlayedParts.length > 0 ? true : false; // Example: Use this property to control the button state

          let index = 0;

          const iterate = () => {
            if (index < sortedParts.unshownParts.length) {
              const part = sortedParts.unshownParts[index];
              this.processPart(part, () => {
                index++;
                setTimeout(iterate, 5000);
              });
            } else {
              console.log('All unshown parts have been displayed');
              resolve();
            }
          };

          iterate();
        })
        .catch((error: any) => {
          console.error('Error fetching Firebase data:', error);
          reject(error);
        });
    });
  }

  private sortAndFilterParts(data: any, userId: string) {
    const sortedParts = Object.keys(data)
      .filter((key) => key.startsWith('MA'))
      .sort(
        (a, b) =>
          parseInt(a.replace('MA', ''), 10) - parseInt(b.replace('MA', ''), 10)
      )
      .map((key) => ({ key, ...data[key] }));

    const unshownParts = sortedParts.filter(
      (part) =>
        !part.partieAffichee &&
        part.partieJouee &&
        part.joueurId.includes(userId) // Filtrer par l'utilisateur connecté
    );
    const shownParts = sortedParts.filter(
      (part) =>
        part.partieAffichee &&
        part.partieJouee &&
        part.joueurId.includes(userId) // Filtrer par l'utilisateur connecté
    );
    const notPlayedParts = sortedParts.filter(
      (part) => !part.partieJouee && part.joueurId.includes(userId) // Filtrer par l'utilisateur connecté
    );

    if (unshownParts.length === 0 && shownParts.length > 0) {
      unshownParts.push(shownParts[shownParts.length - 1]);
    }

    return { unshownParts, shownParts, notPlayedParts };
  }

  getCurrentUserId(): void {
    this.http
      .get<{ user_id: number; username: string; email: string; solde: number }>(
        'http://localhost:3000/get_id/info'
      )
      .subscribe({
        next: (data) => {
          this.playerInfo = data;
          console.log('Informations du joueur :', this.playerInfo);
        },
        error: (err) => {
          console.error(
            'Erreur lors de la récupération des informations :',
            err
          );
        },
      });
  }

  private processPart(part: any, callback: () => void): void {
    const allCombinations: string[] = part.combinaison || [];
    const f = this.computeQuadraticFunction(allCombinations.length);

    if (!allCombinations.length) {
      console.error('Invalid data structure: Missing combinaison in the part');
      callback();
      return;
    }

    let combinationIndex = 0;

    const displayCombinations = () => {
      if (combinationIndex < allCombinations.length) {
        const combination = allCombinations[combinationIndex];
        this.updateAfficheurs(combination);
        combinationIndex++;
        setTimeout(displayCombinations, f(combinationIndex));
      } else {
        this.checkCombination();
        this.updateGainDisplay(part.gain - part.mise);

        part.partieAffichee = true;
        // Mettre à jour le flag dans Firebase
        set(ref(this.db, part.key ? `/${part.key}/partieAffichee` : '/'), true)
          .then(() => {
            console.log(`partieAffichee mis à jour pour ${part.key}`);
          })
          .catch((err) => {
            console.error(
              `Erreur lors de la mise à jour de partieAffichee pour ${part.key}:`,
              err
            );
          });
        this.addNewGameToBackend(
          part.joueurId[part.joueurId.length - 1] || 0,
          part.mise || 0,
          part.combinaison[part.combinaison.length - 1] || [],
          part.timestamp || new Date().toISOString()
        );
        callback();
      }
    };

    displayCombinations();
  }

  // Backend Communication
  addNewGameToBackend(
    playerId: string,
    solde: number,
    combinaison: number[],
    timestamp: string
  ): void {
    const gameData = {
      partieId: 1,
      partieJouee: true,
      solde: solde,
      combinaison: combinaison,
      joueurId: playerId,
      timestamp: timestamp,
      partieAffichee: true,
      mise: solde, // ou la variable qui correspond à la mise jouée
    };

    console.log('Données envoyées au backend :', gameData);

    this.newGameService.addNewGame(gameData).subscribe({
      next: (response) => {
        console.log('Partie ajoutée avec succès :', response);
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout de la partie :", error);
      },
    });
  }
}
