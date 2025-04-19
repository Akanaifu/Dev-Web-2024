import { Database, ref, get, child } from '@angular/fire/database';

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
    const ymin = 200; // f(mid) = 200

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
        let playedParts = [];
        for (const key in data) {
          if (data[key].partieJouee) {
            playedParts.push({ key, ...data[key] });
          }
        }

        if (playedParts.length === 0)
          return console.log('No played parts found');

        const lastPlayedPart = playedParts[playedParts.length - 1];
        const allCombinations: string[] = lastPlayedPart.combinaison || [];
        const f = this.computeQuadraticFunction(allCombinations.length);
        if (!allCombinations.length) {
          return console.error(
            'Invalid data structure: Missing combinaison in the last played part'
          );
        }

        let index = 0;

        const iterate = () => {
          if (index < allCombinations.length) {
            const combination = allCombinations[index];
            this.updateAfficheurs(combination);
            this.checkCombination();
            index++;
            setTimeout(iterate, f(index)); // Recalculer f(index) pour chaque itération
            console.log(
              '🚀 ~ MachineASousLogic ~ iterate ~ f(index):',
              f(index)
            );
          } else {
            this.updateGainDisplay(lastPlayedPart.gain);
          }
        };

        iterate();
      })
      .catch((error) => console.error('Error fetching Firebase data:', error));
  }

  private updateAfficheurs(combination: string): void {
    this.afficheurs.forEach((afficheur, i) => {
      afficheur.currentChiffre = +combination[i] || 0;
    });
  }

  private updateGainDisplay(gain: number): void {
    const gainElement = document.getElementById('gain');
    if (gainElement) {
      gainElement.textContent = `Gain: ${gain}`;
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
