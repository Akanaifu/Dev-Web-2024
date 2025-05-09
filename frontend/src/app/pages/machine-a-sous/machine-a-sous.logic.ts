import { Database, ref, get, child, set } from '@angular/fire/database';
import { NewGameService } from './new-game.service';

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
  private db: Database;
  private newGameService: NewGameService;

  public highlightCombination: any = null;
  public showTable: boolean = false;
  public intervalId: any;

  constructor(db: Database, newGameService: NewGameService) {
    this.db = db;
    this.newGameService = newGameService;
  }
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
      multiplier: 2,
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

  computeQuadraticFunction(long_arr: number): (x: number) => number {
    const mid = long_arr / 2;

    const origine = 1000; // f(0) = 1000
    const ymin = 50; // f(mid) = 50

    // Résolution du système avec f(x) = ax^2 + bx + c
    // Conditions : f(0) = c = 1000, f(mid) = a*mid^2 + b*mid + c = 200
    // b = -2a*mid (pour que le min soit en x = mid)

    const a = (origine - ymin) / (mid * mid); // a = (1000 - 200) / mid²
    const b = -2 * a * mid;

    // Retourne la fonction f(x)
    return (x: number) => a * x * x + b * x + origine;
  }

  fetchFirebaseData(): void {
    get(child(ref(this.db), '/'))
      .then((snapshot) => {
        if (!snapshot.exists()) return console.log('No data available');

        const data = snapshot.val();

        // Trier les parties par ordre croissant des clés "partieX"
        const sortedParts = Object.keys(data)
          .filter((key) => key.startsWith('partie'))
          .sort(
            (a, b) =>
              parseInt(a.replace('partie', ''), 10) -
              parseInt(b.replace('partie', ''), 10)
          )
          .map((key) => ({ key, ...data[key] }));
        console.log('Sorted parts:', sortedParts);
        // Filtrer les parties où partieAffichee est à False
        const unshownParts = sortedParts.filter(
          (part) => !part.partieAffichee && part.partieJouee
        );
        const shownParts = sortedParts.filter(
          (part) => part.partieAffichee && part.partieJouee
        );
        if (unshownParts.length === 0) {
          // Si aucune partie non affichée n'est trouvée, ajouter la dernière partie jouée
          const lastPart = shownParts[shownParts.length - 1];
          if (lastPart) {
            unshownParts.push(lastPart);
            console.log(
              'Aucune partie non affichée trouvée. Dernière partie ajoutée à unshownParts :',
              lastPart
            );
          } else {
            console.warn('Aucune partie disponible dans les données Firebase.');
          }
        }

        let index = 0;

        const iterate = () => {
          if (index < unshownParts.length) {
            const part = unshownParts[index];
            // Afficher les combinaisons et gérer l'affichage
            const allCombinations: string[] = part.combinaison || [];
            const f = this.computeQuadraticFunction(allCombinations.length);

            if (!allCombinations.length) {
              console.error(
                'Invalid data structure: Missing combinaison in the part'
              );
              index++;
              setTimeout(iterate, 5000); // Passer à la partie suivante après 5 secondes
              return;
            }

            let combinationIndex = 0;

            const displayCombinations = () => {
              if (combinationIndex < allCombinations.length) {
                const combination = allCombinations[combinationIndex];
                this.updateAfficheurs(combination);
                combinationIndex++;
                setTimeout(displayCombinations, f(combinationIndex)); // Recalculer f(index) pour chaque itération
              } else {
                this.checkCombination();
                this.updateGainDisplay(part.gain);

                // Mettre à jour partieAffichee à True dans la base de données
                part.partieAffichee = true;
                this.addNewGameToBackend(
                  part.joueurId[part.joueurId.length - 1] || 0, // Vérifiez que playerId est défini
                  part.mise || 0, // Vérifiez que solde est un nombre
                  part.combinaison[part.combinaison.length - 1] || [], // Vérifiez que combinaison est un tableau
                  part.gain || 0, // Vérifiez que gain est un nombre
                  part.timestamp || new Date().toISOString() // Fournissez un timestamp par défaut
                );
                index++;
                setTimeout(iterate, 5000); // Passer à la partie suivante après 5 secondes
              }
            };

            displayCombinations();
          } else {
            console.log('All unshown parts have been displayed');
          }
        };

        iterate();
      })
      .catch((error: any) =>
        console.error('Error fetching Firebase data:', error)
      ); // Ajout du type explicite pour 'error'
  }

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
  addNewGameToBackend(
    playerId: string,
    solde: number,
    combinaison: number[],
    gain: number,
    timestamp: string
  ): void {
    const gameData = {
      partieId: 1,
      partieJouee: gain > 0,
      solde: solde,
      combinaison: combinaison,
      gain: gain,
      joueurId: playerId,
      timestamp: timestamp,
      partieAffichee: true,
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
