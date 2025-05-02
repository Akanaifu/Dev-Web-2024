import { Database, ref, get, child, set } from '@angular/fire/database';

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
  title = 'Machine à sous';
  showTable = false;
  highlightCombination: string | null = null;
  intervalId: any;
  generationCount = 0;

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
  ];

  afficheurs: Afficheur[] = [
    { id: 'afficheur1', currentChiffre: 0 },
    { id: 'afficheur2', currentChiffre: 0 },
    { id: 'afficheur3', currentChiffre: 0 },
  ];

  constructor(private db: Database) {}

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
        const unshownParts = sortedParts.filter((part) => !part.partieAffichee);

        if (unshownParts.length === 0) {
          // Si aucune partie n'est trouvée, afficher dernière partie
          const lastPart = sortedParts[sortedParts.length - 1];
          unshownParts.push(lastPart);
          console.log(
            'No unshown parts found, displaying last part:',
            lastPart
          );
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

    const matched: string[] = [];

    if (combination === '777') {
      matched.push('combo-1');
    } else if (a === b && b === c) {
      matched.push('combo-2');
    } else if ((a === b + 1 && b === c + 1) || (a === b - 1 && b === c - 1)) {
      matched.push('combo-3');
    } else if (a === c) {
      matched.push('combo-4');
    }

    const isAllEven = digits.every((d) => d % 2 === 0);
    const isAllOdd = digits.every((d) => d % 2 !== 0);
    const isNotTriple = !(a === b && b === c);

    if ((isAllEven || isAllOdd) && isNotTriple) {
      matched.push('combo-5');
    }

    this.highlightCombination = matched.length ? matched.join(', ') : null;
  }
}
